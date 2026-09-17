import express from 'express';
import { getDashboard, getReports } from '../controllers/dashboardController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, adminOnly);

router.get('/', getDashboard);
router.get('/reports', getReports);

export default router;
