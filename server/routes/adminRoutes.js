import express from 'express';
import { getPendingDoctors, approveDoctor, rejectDoctor } from '../controllers/adminController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Additional middleware can trace admin role access if required. For now, rely on frontend UI routing blocking non-admins or add middleware check.
const adminProtect = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

router.route('/pending-doctors')
  .get(protect, adminProtect, getPendingDoctors);

router.route('/approve-doctor/:id')
  .put(protect, adminProtect, approveDoctor);

router.route('/reject-doctor/:id')
  .put(protect, adminProtect, rejectDoctor);

export default router;
