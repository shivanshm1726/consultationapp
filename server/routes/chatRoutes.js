import express from 'express';
import { getMessages, sendMessage, getAllSessions } from '../controllers/chatController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// GET all chat sessions (inbox) for the logged-in user
router.get('/sessions', protect, getAllSessions);

// GET messages for a specific room
router.get('/:roomId', protect, getMessages);

// POST a new message (roomId in body)
router.post('/', protect, sendMessage);

export default router;
