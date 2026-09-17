import express from 'express';
import {
  register,
  login,
  getMe,
  updateMe,
  changePassword,
  logout,
  getVerification,
  uploadVerificationDoc,
  deleteVerificationDoc,
  submitVerification,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);
router.put('/password', protect, changePassword);

// Verification (KYC) documents.
// GET /verification/required is answered in app.js, ahead of the database
// gate, because it is a constant and should work even when Mongo is down.
router.get('/verification', protect, getVerification);
router.put('/verification', protect, uploadVerificationDoc);
router.post('/verification/submit', protect, submitVerification);
router.delete('/verification/:key', protect, deleteVerificationDoc);

export default router;
