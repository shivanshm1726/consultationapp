import express from 'express';
import { getTodayQueue, issueToken, callNextPatient } from '../controllers/queueController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/:doctorId')
  .get(protect, getTodayQueue);

router.post('/:doctorId/token', protect, issueToken);
router.put('/:doctorId/next', protect, callNextPatient);

export default router;
