import express from 'express';
import {
  getActivities,
  getActivityStats,
  getActivityById,
  addActivityComment,
  exportActivities,
} from '../controllers/activityController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, adminOnly);

router.get('/', getActivities);
router.get('/stats', getActivityStats);
router.get('/export', exportActivities);
router.get('/:id', getActivityById);
router.post('/:id/comments', addActivityComment);

export default router;
