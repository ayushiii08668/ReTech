import { Router } from 'express';
import {
  getSanitizationDashboardStats,
  getSanitizationJobs,
  getSanitizationJobById,
  createSanitizationJob,
  cancelSanitizationJob,
  getAgents,
  generatePairingCode,
  revokeAgent,
} from '../controllers/sanitization.controller.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = Router();

// All sanitization management routes are strictly restricted to ADMIN role
router.use(protect);
router.use(restrictTo('ADMIN'));

router.get('/dashboard', getSanitizationDashboardStats);
router.get('/jobs', getSanitizationJobs);
router.get('/jobs/:id', getSanitizationJobById);
router.post('/jobs', createSanitizationJob);
router.patch('/jobs/:id/cancel', cancelSanitizationJob);

router.get('/agents', getAgents);
router.post('/agents/pairing-code', generatePairingCode);
router.post('/agents/:id/revoke', revokeAgent);

export default router;

