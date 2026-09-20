import express from 'express';
import { getOverview, listUsers, updateUserAccess, removeUser } from '../controllers/superController.js';
import { protect, superOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, superOnly);

router.get('/overview', getOverview);
router.get('/users', listUsers);
router.patch('/users/:id', updateUserAccess);
router.delete('/users/:id', removeUser);

export default router;
