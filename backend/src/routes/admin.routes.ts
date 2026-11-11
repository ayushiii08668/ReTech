import { Router } from 'express';
import {
  getAdminDashboard,
  getAdminCustomers,
  getAdminCustomerDetails,
  updateCustomerStatus,
  getAdminDevices,
  getAdminDeviceDetails,
  updateDeviceInspection,
  getAdminPickups,
  getAdminPickupDetails,
  updatePickupStatus,
} from '../controllers/admin.controller.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = Router();

// Protect all admin routes and restrict to ADMIN
router.use(protect);
router.use(restrictTo('ADMIN'));

// Dashboard
router.get('/dashboard', getAdminDashboard);

// Customers
router.get('/customers', getAdminCustomers);
router.get('/customers/:id', getAdminCustomerDetails);
router.patch('/customers/:id/status', updateCustomerStatus);

// Devices & Inventory
router.get('/devices', getAdminDevices);
router.get('/devices/:id', getAdminDeviceDetails);
router.patch('/devices/:id/inspection', updateDeviceInspection);

// Pickup Requests
router.get('/pickups', getAdminPickups);
router.get('/pickups/:id', getAdminPickupDetails);
router.patch('/pickups/:id/status', updatePickupStatus);

export default router;

