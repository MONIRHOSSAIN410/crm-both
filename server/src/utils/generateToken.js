import jwt from 'jsonwebtoken';

export const generateToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET || 'muldhon_super_secret_change_me', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

export const sanitizeUser = (user) => {
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.password;
  return obj;
};

export default generateToken;
