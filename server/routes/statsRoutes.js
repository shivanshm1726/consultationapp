import express from 'express';
import { getDashboardStats, getRecentActivity, getRevenueDetails } from '../controllers/statsController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/dashboard', protect, getDashboardStats);
router.get('/activity', protect, getRecentActivity);
router.get('/revenue', protect, getRevenueDetails);

export default router;
