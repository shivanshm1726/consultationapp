import express from 'express';
import {
  createAppointment,
  getMyAppointments,
  getAllAppointments,
  updateAppointmentStatus,
  deleteLastMonthAppointments,
  getAvailableSlots,
} from '../controllers/appointmentController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/bulk/last-month')
  .delete(protect, deleteLastMonthAppointments);

router.route('/slots/:doctorId')
  .get(getAvailableSlots); // Publicly accessible to book, or can be protected if desired. Keeping public to allow patients without accounts to see slots maybe? Actually, protect it later if needed.


router.route('/')
  .post(protect, createAppointment)
  .get(protect, getMyAppointments);

router.route('/all')
  .get(protect, getAllAppointments);

router.route('/:id')
  .put(protect, updateAppointmentStatus);

export default router;
