/**
 * Gender-aware default avatar.
 *
 * When a user has not uploaded a photo, the placeholder should still match the
 * account: a male account gets the male silhouette, a female account the
 * female one. The image is a tiny inline SVG data URL, so it renders instantly
 * and works offline — no external avatar service to go down or get blocked.
 */

const PALETTE = {
  male: { bg: '#dbeafe', fg: '#3b82f6', hair: '#1d4ed8' },
  female: { bg: '#fce7f3', fg: '#ec4899', hair: '#9d174d' },
  neutral: { bg: '#e5e7eb', fg: '#9ca3af', hair: '#6b7280' },
};

// Head + shoulders, shared by both figures.
const HEAD_AND_BODY = (fill) =>
  `<path fill="${fill}" d="M32 34c7.2 0 13-5.8 13-13S39.2 8 32 8s-13 5.8-13 13 5.8 13 13 13Zm0 5c-10.5 0-19 6.3-19 14v5h38v-5c0-7.7-8.5-14-19-14Z"/>`;

// Hair in a darker tone tells the two apart at a glance: a short cap drawn
// over the head for male, long hair behind the head for female.
const figure = ({ fg, hair }, key) => {
  if (key === 'female') {
    return (
      `<path fill="${hair}" d="M16 22c0-9 7.2-16 16-16s16 7 16 16v20h-7V23a9 9 0 0 0-18 0v19h-7V22Z"/>` +
      HEAD_AND_BODY(fg)
    );
  }
  if (key === 'male') {
    return (
      HEAD_AND_BODY(fg) +
      `<path fill="${hair}" d="M20 22a12 12 0 0 1 24 0c-1.4-4.6-6-7-12-7s-10.6 2.4-12 7Z"/>`
    );
  }
  return HEAD_AND_BODY(fg);
};

/** Normalise whatever is stored on the user document to a known key. */
export const genderKey = (gender) => {
  const g = String(gender || '').trim().toLowerCase();
  if (g === 'male' || g === 'm') return 'male';
  if (g === 'female' || g === 'f') return 'female';
  return 'neutral';
};

/** Returns an SVG data URL for the given gender. */
export const defaultAvatar = (gender) => {
  const key = genderKey(gender);
  const palette = PALETTE[key];
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">' +
    `<rect width="64" height="64" fill="${palette.bg}"/>` +
    figure(palette, key) +
    '</svg>';
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

/** The photo to show for a user: their upload, else the gender placeholder. */
export const avatarFor = (user) => user?.avatar || defaultAvatar(user?.gender);

export default avatarFor;
