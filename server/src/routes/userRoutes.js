import express from 'express';
import {
  getUsers,
  getUserStats,
  getUserById,
  updateUser,
  reviewUser,
  deleteUser,
} from '../controllers/userController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getUsers);
router.get('/stats', getUserStats);
router.get('/:id', getUserById);
router.put('/:id', adminOnly, updateUser);
router.patch('/:id/status', adminOnly, reviewUser);
router.delete('/:id', adminOnly, deleteUser);

export default router;
