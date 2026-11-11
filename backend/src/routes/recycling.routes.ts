import { Router } from 'express';
import {
  getRecyclingRecords,
  getRecyclingRecordById,
  createRecyclingRecord,
  updateRecyclingRecord,
} from '../controllers/recycling.controller.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = Router();

// All recycling management routes are strictly restricted to ADMIN
router.use(protect);
router.use(restrictTo('ADMIN'));

router.get('/records', getRecyclingRecords);
router.post('/records', createRecyclingRecord);
router.get('/records/:id', getRecyclingRecordById);
router.patch('/records/:id', updateRecyclingRecord);

export default router;

