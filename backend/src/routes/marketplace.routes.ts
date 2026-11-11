import { Router } from 'express';
import {
  getPublicListings,
  getPublicListingById,
  submitMarketplaceEnquiry,
  getAdminListings,
  createMarketplaceListing,
  updateMarketplaceListing,
  markListingSold,
  getAdminEnquiries,
} from '../controllers/marketplace.controller.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = Router();

// Public & Customer Marketplace browsing
router.get('/listings', getPublicListings);
router.get('/listings/:id', getPublicListingById);

// Authenticated Customer: Submit enquiry
router.post('/enquiries', protect, submitMarketplaceEnquiry);

// Admin-only Marketplace Management
router.get('/admin/listings', protect, restrictTo('ADMIN'), getAdminListings);
router.post('/admin/listings', protect, restrictTo('ADMIN'), createMarketplaceListing);
router.patch('/admin/listings/:listingId', protect, restrictTo('ADMIN'), updateMarketplaceListing);
router.patch('/admin/listings/:listingId/sold', protect, restrictTo('ADMIN'), markListingSold);
router.get('/admin/enquiries', protect, restrictTo('ADMIN'), getAdminEnquiries);

export default router;

