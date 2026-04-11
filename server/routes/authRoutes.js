import express from 'express';
import { registerUser, loginUser, getUserProfile, updateRoleByEmail, updateUserProfile, toggleAvailability, getDoctors } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.put('/role', protect, updateRoleByEmail);
router.put('/availability', protect, toggleAvailability);

router.get('/doctors', getDoctors);

export default router;
