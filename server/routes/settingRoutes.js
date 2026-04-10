import express from 'express';
import { getSetting, updateSetting } from '../controllers/settingController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/:key', getSetting);
router.put('/:key', protect, updateSetting);

export default router;
