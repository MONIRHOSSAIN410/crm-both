import jwt from 'jsonwebtoken';

export const generateToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET || 'muldhon_super_secret_change_me', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

/**
 * The shape of a user safe to send to the browser.
 *
 * Besides dropping the password hash, this strips the base64 payload of every
 * verification document. Three ID scans are around a megabyte of base64, and
 * the account travels with the login response and every /auth/me call — which
 * would make signing in feel slow for a payload nothing on screen needs. The
 * metadata stays, so the UI can show what has been uploaded; the file itself
 * is fetched by the Verification screen from GET /api/auth/verification.
 */
export const sanitizeUser = (user) => {
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.password;

  if (Array.isArray(obj.verificationDocs)) {
    obj.verificationDocs = obj.verificationDocs.map(({ dataUrl, ...rest }) => ({
      ...rest,
      hasFile: Boolean(dataUrl),
    }));
  }

  return obj;
};

export default generateToken;
