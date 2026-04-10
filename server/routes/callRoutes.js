import express from 'express';
import { createCall, getCallStatus, updateCallStatus, endCall, generateToken } from '../controllers/callController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/get-token', generateToken);
router.post('/', protect, createCall);
router.get('/:id', protect, getCallStatus);
router.put('/:id', protect, updateCallStatus);
router.delete('/:id', protect, endCall);

export default router;
