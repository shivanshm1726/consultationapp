import express from 'express';
import { getClinicSchedules, getDoctorSchedule, upsertDoctorSchedule } from '../controllers/scheduleController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getClinicSchedules)
  .put(protect, upsertDoctorSchedule); // Receptionist creates/updates a schedule

router.route('/:doctorId')
  .get(protect, getDoctorSchedule);

export default router;
