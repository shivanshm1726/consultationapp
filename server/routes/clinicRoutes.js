import express from 'express';
import { getClinics, createClinic, assignUserToClinic } from '../controllers/clinicController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getClinics)
  .post(protect, createClinic);

router.route('/:id/assign')
  .put(protect, assignUserToClinic);

export default router;
