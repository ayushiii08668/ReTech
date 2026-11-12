import { Router } from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';
import customerRoutes from './customer.routes.js';
import adminRoutes from './admin.routes.js';
import sanitizationRoutes from './sanitization.routes.js';
import agentRoutes from './agent.routes.js';
import certificateRoutes from './certificate.routes.js';
import marketplaceRoutes from './marketplace.routes.js';
import partnerRoutes from './partner.routes.js';
import refurbishmentRoutes from './refurbishment.routes.js';
import recyclingRoutes from './recycling.routes.js';
import lifecycleRoutes from './lifecycle.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/customer', customerRoutes);

// Specific admin sub-routes MUST precede generic /admin
router.use('/admin/sanitization', sanitizationRoutes);
router.use('/admin/partners', partnerRoutes);
router.use('/admin/refurbishment', refurbishmentRoutes);
router.use('/admin/recycling', recyclingRoutes);
router.use('/admin', adminRoutes);

router.use('/agent', agentRoutes);

// Phase 4 Routes
router.use('/certificates', certificateRoutes);
router.use('/marketplace', marketplaceRoutes);
router.use('/lifecycle', lifecycleRoutes);

export default router;
