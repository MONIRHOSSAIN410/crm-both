import express from 'express';
import {
  getContacts,
  getThread,
  sendMessage,
  deleteMessage,
} from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/contacts', getContacts);
router.route('/:userId').get(getThread).post(sendMessage);
router.delete('/item/:id', deleteMessage);

export default router;
