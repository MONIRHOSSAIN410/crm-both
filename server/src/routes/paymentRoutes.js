import express from 'express';
import {
  getPayments,
  getPaymentSummary,
  getPaymentTrend,
  createPayment,
  setPaymentStatus,
  deletePayment,
} from '../controllers/paymentController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/').get(getPayments).post(adminOnly, createPayment);
router.get('/summary', getPaymentSummary);
router.get('/trend', getPaymentTrend);
router.patch('/:id/status', adminOnly, setPaymentStatus);
router.delete('/:id', adminOnly, deletePayment);

export default router;
