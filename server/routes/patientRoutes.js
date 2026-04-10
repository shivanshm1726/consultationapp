import express from 'express';
import { getPatients, createPatient } from '../controllers/patientController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getPatients)
  .post(protect, createPatient);

export default router;
