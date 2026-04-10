import express from 'express';
import { getMessages, sendMessage, getAllSessions } from '../controllers/chatController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/sessions', protect, getAllSessions);

router.route('/:roomId')
  .get(protect, getMessages)
  .post(protect, sendMessage);

export default router;
