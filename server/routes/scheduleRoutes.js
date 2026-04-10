import express from 'express';
import { getSchedule, updateSchedule, getAvailableSlots } from '../controllers/scheduleController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/:doctorId')
  .get(protect, getSchedule)
  .put(protect, updateSchedule);

router.get('/slots/:doctorId', getAvailableSlots);

export default router;
