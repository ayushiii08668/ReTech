import { Router } from 'express';
import { getHealth } from '../controllers/health.controller.js';

const router = Router();

/**
 * GET /api/v1/health
 * @desc   Health check endpoint
 * @access Public
 */
router.get('/', getHealth);

export default router;
