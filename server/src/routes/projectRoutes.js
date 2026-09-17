import express from 'express';
import {
  getProjects,
  getProjectStats,
  getProjectById,
  createProject,
  updateProject,
  setProjectStatus,
  deleteProject,
} from '../controllers/projectController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/').get(getProjects).post(createProject);
router.get('/stats', getProjectStats);
router.route('/:id').get(getProjectById).put(updateProject).delete(adminOnly, deleteProject);
router.patch('/:id/status', adminOnly, setProjectStatus);

export default router;
