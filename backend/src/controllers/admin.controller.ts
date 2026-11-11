import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import User from '../models/User.js';
import Device, { DeviceStatus } from '../models/Device.js';
import PickupRequest, { PickupStatus } from '../models/PickupRequest.js';
import AppError from '../utils/AppError.js';
import { inspectionSchema, pickupStatusSchema, formatZodError } from '../utils/validators.js';
import { createNotification } from '../utils/notification.js';

/**
 * Admin Dashboard - Aggregated platform analytics
 */
export const getAdminDashboard = async (
  _req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const [
      totalCustomers,
      totalDevices,
      pendingPickups,
      approvedPickups,
      devicesReceived,
      devicesAwaitingInspection,
      devicesUnderProcessing,
      categoryDistribution,
      pickupStatusDistribution,
      recentPickups,
      recentDevices,
    ] = await Promise.all([
      User.countDocuments({ role: 'CUSTOMER' }),
      Device.countDocuments(),
      PickupRequest.countDocuments({ status: 'PENDING' }),
      PickupRequest.countDocuments({ status: 'APPROVED' }),
      Device.countDocuments({
        status: {
          $in: [
            'RECEIVED',
            'INSPECTION_PENDING',
            'INSPECTED',
            'SANITIZATION_PENDING',
            'SANITIZED',
            'READY_FOR_RESALE',
            'RECYCLED',
          ],
        },
      }),
      Device.countDocuments({ status: { $in: ['RECEIVED', 'INSPECTION_PENDING'] } }),
      Device.countDocuments({
        status: { $in: ['INSPECTED', 'SANITIZATION_PENDING'] },
      }),
      Device.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      PickupRequest.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      PickupRequest.find()
        .sort({ createdAt: -1 })
        .limit(6)
        .populate('customerId', 'fullName email phone')
        .populate('deviceId', 'deviceId category brand model'),
      Device.find()
        .sort({ createdAt: -1 })
        .limit(6)
        .populate('customerId', 'fullName email phone'),
    ]);

    res.status(200).json({
      success: true,
      data: {
        metrics: {
          totalCustomers,
          totalDevices,
          pendingPickups,
          approvedPickups,
          devicesReceived,
          devicesAwaitingInspection,
          devicesUnderProcessing,
        },
        charts: {
          categoryDistribution: categoryDistribution.map((c) => ({
            name: c._id || 'Other',
            value: c.count,
          })),
          pickupStatusDistribution: pickupStatusDistribution.map((p) => ({
            name: p._id || 'Unknown',
            value: p.count,
          })),
        },
        recentPickups,
        recentDevices,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List all customers (never leaks passwordHash)
 */
export const getAdminCustomers = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { search, status, page = '1', limit = '10' } = req.query;

    const filter: any = { role: 'CUSTOMER' };
    if (status && status !== 'ALL') {
      filter.accountStatus = status;
    }

    if (search) {
      filter.$or = [
        { fullName: { $regex: String(search), $options: 'i' } },
        { email: { $regex: String(search), $options: 'i' } },
        { phone: { $regex: String(search), $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, parseInt(String(page), 10));
    const limitNum = Math.max(1, Math.min(50, parseInt(String(limit), 10)));
    const skip = (pageNum - 1) * limitNum;

    const [customers, total] = await Promise.all([
      User.find(filter)
        .select('-passwordHash -passwordResetToken -passwordResetExpires')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      User.countDocuments(filter),
    ]);

    // Attach device count for each customer
    const customerIds = customers.map((c) => c._id);
    const deviceCounts = await Device.aggregate([
      { $match: { customerId: { $in: customerIds } } },
      { $group: { _id: '$customerId', count: { $sum: 1 } } },
    ]);

    const countMap = new Map(
      deviceCounts.map((dc) => [dc._id.toString(), dc.count]),
    );

    const customersWithCount = customers.map((c) => ({
      ...c.toObject(),
      deviceCount: countMap.get(c._id.toString()) || 0,
    }));

    res.status(200).json({
      success: true,
      data: {
        customers: customersWithCount,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single customer details with their devices and pickups
 */
export const getAdminCustomerDetails = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;

    const customer = await User.findById(id).select(
      '-passwordHash -passwordResetToken -passwordResetExpires',
    );

    if (!customer) {
      return next(new AppError('Customer not found', 404));
    }

    const [devices, pickups] = await Promise.all([
      Device.find({ customerId: customer._id }).sort({ createdAt: -1 }),
      PickupRequest.find({ customerId: customer._id })
        .sort({ createdAt: -1 })
        .populate('deviceId', 'deviceId brand model category'),
    ]);

    res.status(200).json({
      success: true,
      data: {
        customer,
        devices,
        pickups,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle customer account status (ACTIVE / DEACTIVATED)
 */
export const updateCustomerStatus = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { accountStatus } = req.body;

    if (!['ACTIVE', 'DEACTIVATED'].includes(accountStatus)) {
      return next(new AppError('Invalid account status', 400));
    }

    const customer = await User.findByIdAndUpdate(
      id,
      { accountStatus },
      { new: true },
    ).select('-passwordHash');

    if (!customer) {
      return next(new AppError('Customer not found', 404));
    }

    res.status(200).json({
      success: true,
      message: `Customer account ${accountStatus === 'ACTIVE' ? 'activated' : 'deactivated'} successfully.`,
      data: customer,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List all devices across the platform
 */
export const getAdminDevices = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const {
      search,
      category,
      status,
      classification,
      page = '1',
      limit = '10',
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const filter: any = {};
    if (category && category !== 'ALL') filter.category = category;
    if (status && status !== 'ALL') filter.status = status;
    if (classification && classification !== 'ALL') filter.classification = classification;

    if (search) {
      filter.$or = [
        { deviceId: { $regex: String(search), $options: 'i' } },
        { brand: { $regex: String(search), $options: 'i' } },
        { model: { $regex: String(search), $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, parseInt(String(page), 10));
    const limitNum = Math.max(1, Math.min(50, parseInt(String(limit), 10)));
    const skip = (pageNum - 1) * limitNum;

    const sortOption: any = {};
    sortOption[String(sortBy)] = sortOrder === 'asc' ? 1 : -1;

    const [devices, total] = await Promise.all([
      Device.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .populate('customerId', 'fullName email phone')
        .populate('pickupRequestId', 'requestId status preferredDate'),
      Device.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        devices,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get device details by ID
 */
export const getAdminDeviceDetails = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;

    const device = await Device.findOne({
      $or: [{ deviceId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    })
      .populate('customerId', 'fullName email phone address')
      .populate('pickupRequestId')
      .populate('inspection.inspectedBy', 'fullName email');

    if (!device) {
      return next(new AppError('Device not found', 404));
    }

    res.status(200).json({
      success: true,
      data: device,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Record Inspection and Classification for a device
 */
export const updateDeviceInspection = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const adminId = req.user!._id;

    const parseResult = inspectionSchema.safeParse(req.body);
    if (!parseResult.success) {
      return next(new AppError(formatZodError(parseResult.error), 400));
    }

    const data = parseResult.data;

    const device = await Device.findOne({
      $or: [{ deviceId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    });

    if (!device) {
      return next(new AppError('Device not found', 404));
    }

    // Update inspection record
    device.inspection = {
      physicalCondition: data.physicalCondition || device.condition,
      powersOn: data.powersOn !== undefined ? data.powersOn : device.powersOn,
      storageType: data.storageType || device.storageType,
      storageCapacity: data.storageCapacity || device.storageCapacity,
      inspectionNotes: data.inspectionNotes || '',
      reusePotential: data.reusePotential || '',
      inspectedAt: new Date(),
      inspectedBy: adminId,
    };

    device.classification = data.classification;
    device.status = (data.status as DeviceStatus) || 'INSPECTED';

    await device.save();

    // Notify customer
    await createNotification(
      device.customerId,
      'Device Inspection Completed',
      `Your device ${device.brand} ${device.model} (${device.deviceId}) was inspected and classified as Grade ${device.classification}.`,
      'INFO',
      device.deviceId,
    );

    res.status(200).json({
      success: true,
      message: 'Inspection and classification recorded successfully.',
      data: device,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List all pickup requests
 */
export const getAdminPickups = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { search, status, page = '1', limit = '10' } = req.query;

    const filter: any = {};
    if (status && status !== 'ALL') {
      filter.status = status;
    }

    const pageNum = Math.max(1, parseInt(String(page), 10));
    const limitNum = Math.max(1, Math.min(50, parseInt(String(limit), 10)));
    const skip = (pageNum - 1) * limitNum;

    if (search) {
      filter.$or = [
        { requestId: { $regex: String(search), $options: 'i' } },
        { contactNumber: { $regex: String(search), $options: 'i' } },
        { city: { $regex: String(search), $options: 'i' } },
      ];
    }

    const [pickups, total] = await Promise.all([
      PickupRequest.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('customerId', 'fullName email phone')
        .populate('deviceId', 'deviceId category brand model condition status'),
      PickupRequest.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        pickups,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get pickup details by ID
 */
export const getAdminPickupDetails = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;

    const pickup = await PickupRequest.findOne({
      $or: [{ requestId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    })
      .populate('customerId', 'fullName email phone address')
      .populate('deviceId')
      .populate('statusHistory.updatedBy', 'fullName role');

    if (!pickup) {
      return next(new AppError('Pickup request not found', 404));
    }

    res.status(200).json({
      success: true,
      data: pickup,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update pickup status (Approve, Reject, Scheduled, Collection Confirmed, Received)
 */
export const updatePickupStatus = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const adminId = req.user!._id;

    const parseResult = pickupStatusSchema.safeParse(req.body);
    if (!parseResult.success) {
      return next(new AppError(formatZodError(parseResult.error), 400));
    }

    const { status, adminRemarks, scheduledDate } = parseResult.data;

    const pickup = await PickupRequest.findOne({
      $or: [{ requestId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    });

    if (!pickup) {
      return next(new AppError('Pickup request not found', 404));
    }

    pickup.status = status as PickupStatus;
    if (adminRemarks) {
      pickup.adminRemarks = adminRemarks;
    }
    if (scheduledDate) {
      pickup.preferredDate = scheduledDate;
    }

    pickup.statusHistory.push({
      status: status as PickupStatus,
      timestamp: new Date(),
      remarks: adminRemarks || `Status changed to ${status}`,
      updatedBy: adminId,
    });

    await pickup.save();

    // Also update associated device status if applicable
    const device = await Device.findById(pickup.deviceId);
    if (device) {
      if (status === 'SCHEDULED') {
        device.status = 'PICKUP_SCHEDULED';
      } else if (status === 'COLLECTION_CONFIRMED') {
        device.status = 'COLLECTION_CONFIRMED';
      } else if (status === 'RECEIVED') {
        device.status = 'RECEIVED';
      }
      await device.save();
    }

    // Trigger notification to customer
    const statusMessages: Record<string, string> = {
      APPROVED: `Your pickup request (${pickup.requestId}) has been approved!`,
      REJECTED: `Your pickup request (${pickup.requestId}) was not approved. Remarks: ${adminRemarks || 'Contact support.'}`,
      SCHEDULED: `Your pickup (${pickup.requestId}) has been scheduled for ${pickup.preferredDate} (${pickup.preferredTimeSlot}).`,
      COLLECTION_CONFIRMED: `Pickup collection confirmed for request ${pickup.requestId}. Device is now in transit.`,
      RECEIVED: `Your device for pickup ${pickup.requestId} has arrived at our facility and is queued for inspection.`,
      CANCELLED: `Pickup request ${pickup.requestId} has been marked as cancelled.`,
    };

    const notifMsg = statusMessages[status] || `Pickup request ${pickup.requestId} status updated to ${status}.`;
    await createNotification(
      pickup.customerId,
      `Pickup Status: ${status}`,
      notifMsg,
      status === 'REJECTED' ? 'ALERT' : 'SUCCESS',
      device?.deviceId,
    );

    res.status(200).json({
      success: true,
      message: `Pickup status updated to ${status}`,
      data: pickup,
    });
  } catch (error) {
    next(error);
  }
};
