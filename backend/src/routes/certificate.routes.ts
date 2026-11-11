import { Router } from 'express';
import {
  getAdminCertificates,
  getEligibleSanitizedDevices,
  generateCertificate,
  downloadCertificatePDF,
  revokeCertificate,
  publicVerifyCertificate,
} from '../controllers/certificate.controller.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = Router();

// Public audit endpoint (no auth required)
router.get('/verify/:verificationId', publicVerifyCertificate);

// Protected PDF download (accessible by Customer for own cert, or Admin)
router.get('/:certificateId/download', protect, downloadCertificatePDF);
router.get('/:certificateId/pdf', protect, downloadCertificatePDF);

// Admin-only certificate management
router.get('/', protect, restrictTo('ADMIN'), getAdminCertificates);
router.get('/eligible-devices', protect, restrictTo('ADMIN'), getEligibleSanitizedDevices);
router.post('/:deviceId/generate', protect, restrictTo('ADMIN'), generateCertificate);
router.patch('/:certificateId/revoke', protect, restrictTo('ADMIN'), revokeCertificate);

export default router;
