import express from 'express';
import {
  createAppointment,
  getMyAppointments,
  getAllAppointments,
  updateAppointmentStatus,
  deleteLastMonthAppointments,
} from '../controllers/appointmentController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/bulk/last-month')
  .delete(protect, deleteLastMonthAppointments);


router.route('/')
  .post(protect, createAppointment)
  .get(protect, getMyAppointments);

router.route('/all')
  .get(protect, getAllAppointments);

router.route('/:id')
  .put(protect, updateAppointmentStatus);

export default router;
