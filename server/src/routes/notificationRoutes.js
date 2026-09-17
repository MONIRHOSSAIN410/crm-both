import express from 'express';
import {
  getNotifications,
  createNotification,
  toggleRead,
  markAllRead,
  deleteNotification,
} from '../controllers/notificationController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/').get(getNotifications).post(adminOnly, createNotification);
router.patch('/read-all', markAllRead);
router.patch('/:id/read', toggleRead);
router.delete('/:id', deleteNotification);

export default router;
