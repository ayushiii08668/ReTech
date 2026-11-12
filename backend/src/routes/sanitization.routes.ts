import { Router } from 'express';
import {
  getSanitizationDashboardStats,
  getSanitizationJobs,
  getSanitizationJobById,
  createSanitizationJob,
  cancelSanitizationJob,
  deleteSanitizationJob,
  getAgents,
  generatePairingCode,
  revokeAgent,
  deleteAgent,
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
router.delete('/jobs/:id', deleteSanitizationJob);
router.post('/jobs/:id/delete', deleteSanitizationJob);

router.get('/agents', getAgents);
router.post('/agents/pairing-code', generatePairingCode);
router.post('/agents/:id/revoke', revokeAgent);
router.delete('/agents/:id', deleteAgent);
router.post('/agents/:id/delete', deleteAgent);

export default router;

