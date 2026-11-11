import { Router } from 'express';
import {
  getPartners,
  getPartnerById,
  createPartner,
  updatePartner,
  deletePartner,
} from '../controllers/partner.controller.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = Router();

// All partner routes are strictly restricted to ADMIN
router.use(protect);
router.use(restrictTo('ADMIN'));

router.get('/', getPartners);
router.post('/', createPartner);
router.get('/:id', getPartnerById);
router.patch('/:id', updatePartner);
router.delete('/:id', deletePartner);

export default router;

