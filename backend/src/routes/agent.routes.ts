import { Router } from 'express';
import {
  pairAgent,
  agentHeartbeat,
  getAgentJobs,
  claimJob,
  reportJobEvents,
  reportJobResults,
} from '../controllers/agent.controller.js';
import { authenticateAgent } from '../middleware/agentAuth.js';

const router = Router();

// Agent self-registration / pairing
router.post('/pair', pairAgent);

// Protected agent routes
router.use(authenticateAgent);

router.post('/heartbeat', agentHeartbeat);
router.get('/jobs', getAgentJobs);
router.post('/jobs/:jobId/claim', claimJob);
router.post('/jobs/:jobId/events', reportJobEvents);
router.post('/jobs/:jobId/results', reportJobResults);

export default router;

