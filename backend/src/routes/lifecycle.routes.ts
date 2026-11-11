import { Router } from 'express';
import {
  getDeviceLifecycle,
  addCustomLifecycleEvent,
} from '../controllers/lifecycle.controller.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = Router();

// Protected: Customer can view their own device lifecycle; Admin can view all
router.get('/devices/:deviceId', protect, getDeviceLifecycle);

// Admin-only: Log custom lifecycle audit event
router.post('/devices/:deviceId/events', protect, restrictTo('ADMIN'), addCustomLifecycleEvent);

export default router;

