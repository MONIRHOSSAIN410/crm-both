/**
 * Profile photo handling.
 *
 * The photo is resized in the browser and stored as a data URL on the user
 * document in MongoDB (User.avatar is a String). This keeps uploads working on
 * Vercel, where the filesystem is read-only and wiped between invocations, so
 * writing files to an /uploads folder would silently lose every image.
 *
 * A 256px JPEG at 0.85 quality is roughly 15-30 KB of base64 — small enough to
 * sit inside the document and well under the API's 5 MB body limit.
 */

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB before resizing
export const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

/** Validate a File chosen from the file picker. Returns an error string, or null. */
export const validateImage = (file) => {
  if (!file) return 'No file selected.';
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return 'Please choose a JPG, PNG, WEBP or GIF image.';
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return `Image is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum is 5 MB.`;
  }
  return null;
};

/**
 * Read a File, scale it to fit `size` x `size` (centre-cropped to a square),
 * and return a JPEG data URL.
 */
export const fileToAvatarDataUrl = (file, size = 256, quality = 0.85) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Could not read that file.'));
    reader.onload = () => {
      const img = new Image();

      img.onerror = () => reject(new Error('That file is not a readable image.'));
      img.onload = () => {
        try {
          // Centre-crop to a square so the circular avatar never distorts.
          const side = Math.min(img.width, img.height);
          const sx = (img.width - side) / 2;
          const sy = (img.height - side) / 2;

          const canvas = document.createElement('canvas');
          canvas.width = size;
          canvas.height = size;

          const ctx = canvas.getContext('2d');
          ctx.imageSmoothingQuality = 'high';
          // White base: JPEG has no alpha, so transparent PNGs would go black.
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, size, size);
          ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);

          resolve(canvas.toDataURL('image/jpeg', quality));
        } catch (error) {
          reject(new Error('Could not process that image.'));
        }
      };

      img.src = reader.result;
    };

    reader.readAsDataURL(file);
  });
