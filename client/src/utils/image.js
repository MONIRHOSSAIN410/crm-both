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

/* ------------------------------------------------------------------ *
 * Verification documents (NID, trade licence)
 * ------------------------------------------------------------------ */

/** A scan of an ID has to stay readable, so these are kept larger than avatars. */
export const MAX_DOC_BYTES = 8 * 1024 * 1024; // before shrinking
export const DOC_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

export const validateDocument = (file) => {
  if (!file) return 'No file selected.';
  if (!DOC_TYPES.includes(file.type)) {
    return 'Please upload a JPG, PNG, WEBP or PDF file.';
  }
  if (file.size > MAX_DOC_BYTES) {
    return `File is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum is 8 MB.`;
  }
  // A PDF cannot be shrunk in the browser, so it has to already be small
  // enough to sit inside the request body.
  if (file.type === 'application/pdf' && file.size > 2 * 1024 * 1024) {
    return 'PDFs must be under 2 MB. Please compress it, or upload a photo of the document instead.';
  }
  return null;
};

const readAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read that file.'));
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });

/**
 * Turn a chosen document into a data URL small enough to store on the user
 * record. Images keep their aspect ratio and are scaled so the long edge is at
 * most `maxEdge` — big enough that the numbers on an ID card stay legible,
 * small enough that three documents fit in one request. PDFs pass through
 * untouched, since the browser cannot re-compress them.
 */
export const fileToDocumentDataUrl = (file, maxEdge = 1400, quality = 0.82) => {
  if (file.type === 'application/pdf') return readAsDataUrl(file);

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read that file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('That file is not a readable image.'));
      img.onload = () => {
        try {
          const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
          const w = Math.max(1, Math.round(img.width * scale));
          const h = Math.max(1, Math.round(img.height * scale));

          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;

          const ctx = canvas.getContext('2d');
          ctx.imageSmoothingQuality = 'high';
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, w, h);
          ctx.drawImage(img, 0, 0, w, h);

          resolve(canvas.toDataURL('image/jpeg', quality));
        } catch {
          reject(new Error('Could not process that image.'));
        }
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
};

/** "1.4 MB" / "820 KB" — for showing an uploaded file back to the user. */
export const formatBytes = (bytes = 0) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};
