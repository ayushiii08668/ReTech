import { Router } from 'express';
import {
  getDashboardSummary,
  getCustomerDevices,
  submitDevice,
  getDeviceDetails,
  getCustomerPickups,
  cancelPickupRequest,
  getCustomerNotifications,
  markNotificationsAsRead,
  getCustomerDeviceSanitization,
  getCustomerReports,
  getCustomerCertificates,
} from '../controllers/customer.controller.js';
import { getMe, updateProfile } from '../controllers/auth.controller.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = Router();

// Protect all customer routes and restrict to CUSTOMER
router.use(protect);
router.use(restrictTo('CUSTOMER'));

// Dashboard
router.get('/dashboard', getDashboardSummary);

// Profile
router.get('/profile', getMe);
router.put('/profile', updateProfile);

// Devices
router.get('/devices', getCustomerDevices);
router.post('/devices', submitDevice);
router.get('/devices/:id', getDeviceDetails);
router.get('/devices/:id/sanitization', getCustomerDeviceSanitization);

// Pickups
router.get('/pickups', getCustomerPickups);
router.post('/pickups', submitDevice); // Can also create directly with device
router.patch('/pickups/:id/cancel', cancelPickupRequest);

// Notifications
router.get('/notifications', getCustomerNotifications);
router.patch('/notifications/read', markNotificationsAsRead);

// Reports & Certificates
router.get('/reports', getCustomerReports);
router.get('/certificates', getCustomerCertificates);

export default router;

