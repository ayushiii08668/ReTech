import { Router } from 'express';
import {
  getRefurbishmentJobs,
  getRefurbishmentJobById,
  createRefurbishmentJob,
  updateRefurbishmentJob,
} from '../controllers/refurbishment.controller.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = Router();

// All refurbishment management routes are strictly restricted to ADMIN
router.use(protect);
router.use(restrictTo('ADMIN'));

router.get('/jobs', getRefurbishmentJobs);
router.post('/jobs', createRefurbishmentJob);
router.get('/jobs/:id', getRefurbishmentJobById);
router.patch('/jobs/:id', updateRefurbishmentJob);

export default router;

