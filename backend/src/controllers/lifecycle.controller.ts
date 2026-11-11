import { Response, NextFunction } from 'express';
import DeviceLifecycleEvent, { recordLifecycleEvent } from '../models/DeviceLifecycleEvent.js';
import Device from '../models/Device.js';
import AppError from '../utils/AppError.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

/**
 * Get full chronological lifecycle timeline for a device
 * Accessible by: Customer (own device only) or Admin (any device)
 */
export const getDeviceLifecycle = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = req.user!;
    const { deviceId } = req.params;

    let device = null;
    if (deviceId.match(/^[0-9a-fA-F]{24}$/)) {
      device = await Device.findById(deviceId);
    }
    if (!device) {
      device = await Device.findOne({ deviceId });
    }

    if (!device) {
      return next(new AppError('Device not found.', 404));
    }

    // Customer Ownership Check
    if (user.role === 'CUSTOMER' && device.customerId.toString() !== user._id.toString()) {
      return next(new AppError('You do not have permission to view this device lifecycle.', 403));
    }

    // Retrieve all lifecycle events in chronological order
    const events = await DeviceLifecycleEvent.find({ deviceId: device._id })
      .sort({ eventTimestamp: 1, createdAt: 1 })
      .populate('performedBy', 'fullName role email');

    res.status(200).json({
      success: true,
      data: {
        device: {
          _id: device._id,
          deviceId: device.deviceId,
          category: device.category,
          brand: device.brand,
          model: device.model,
          condition: device.condition,
          status: device.status,
          classification: device.classification,
          storageType: device.storageType,
          storageCapacity: device.storageCapacity,
          createdAt: device.createdAt,
        },
        eventsCount: events.length,
        events,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Add a manual audit/lifecycle event to a device
 */
export const addCustomLifecycleEvent = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const adminUser = req.user!;
    const { deviceId } = req.params;
    const { title, description, eventType, sourceReference, newStatus } = req.body;

    if (!title || !description) {
      return next(new AppError('Event title and description are required.', 400));
    }

    let device = null;
    if (deviceId.match(/^[0-9a-fA-F]{24}$/)) {
      device = await Device.findById(deviceId);
    }
    if (!device) {
      device = await Device.findOne({ deviceId });
    }

    if (!device) {
      return next(new AppError('Device not found.', 404));
    }

    const previousStatus = device.status;

    if (newStatus && newStatus !== device.status) {
      device.status = newStatus;
      await device.save();
    }

    const event = await recordLifecycleEvent({
      deviceId: device._id,
      retechDeviceId: device.deviceId,
      eventType: eventType || 'ADMIN_AUDIT_LOG',
      title: title.trim(),
      description: description.trim(),
      previousStatus,
      newStatus: device.status,
      performedBy: adminUser._id,
      performedByName: adminUser.fullName,
      sourceReference: sourceReference || '',
    });

    res.status(201).json({
      success: true,
      message: 'Lifecycle event logged successfully.',
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

