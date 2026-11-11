import { Response, NextFunction } from 'express';
import RefurbishmentJob, { RefurbishmentStatus } from '../models/RefurbishmentJob.js';
import Partner from '../models/Partner.js';
import Device from '../models/Device.js';
import { getNextId } from '../models/Counter.js';
import { recordLifecycleEvent } from '../models/DeviceLifecycleEvent.js';
import AppError from '../utils/AppError.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

/**
 * Admin: Get all refurbishment jobs with filtering and stats
 */
export const getRefurbishmentJobs = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const status = req.query.status as string;
    const search = (req.query.search as string)?.trim();

    const query: Record<string, any> = {};

    if (status && status !== 'ALL') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { jobId: { $regex: search, $options: 'i' } },
        { retechDeviceId: { $regex: search, $options: 'i' } },
        { partnerName: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [jobs, total, inProgressCount, completedCount] = await Promise.all([
      RefurbishmentJob.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('deviceId', 'deviceId category brand model condition status storageType storageCapacity')
        .populate('partnerId', 'partnerId partnerName companyName email phone')
        .populate('assignedBy', 'fullName email'),
      RefurbishmentJob.countDocuments(query),
      RefurbishmentJob.countDocuments({ status: { $in: ['ASSIGNED', 'IN_PROGRESS', 'QUALITY_CHECK'] } }),
      RefurbishmentJob.countDocuments({ status: 'COMPLETED' }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        jobs,
        stats: {
          total,
          inProgressCount,
          completedCount,
        },
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit) || 1,
          limit,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Get single refurbishment job details
 */
export const getRefurbishmentJobById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;

    let job = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      job = await RefurbishmentJob.findById(id)
        .populate('deviceId')
        .populate('partnerId')
        .populate('assignedBy', 'fullName email');
    }
    if (!job) {
      job = await RefurbishmentJob.findOne({ jobId: id })
        .populate('deviceId')
        .populate('partnerId')
        .populate('assignedBy', 'fullName email');
    }

    if (!job) {
      return next(new AppError('Refurbishment job not found.', 404));
    }

    res.status(200).json({
      success: true,
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Create and assign a device to a refurbishment partner
 */
export const createRefurbishmentJob = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const adminUser = req.user!;
    const { deviceId, partnerId, expectedCompletionDate, instructions } = req.body;

    if (!deviceId || !partnerId) {
      return next(new AppError('Device selection and refurbishment partner are required.', 400));
    }

    let device = null;
    if (deviceId.match(/^[0-9a-fA-F]{24}$/)) {
      device = await Device.findById(deviceId);
    }
    if (!device) {
      device = await Device.findOne({ deviceId });
    }

    if (!device) {
      return next(new AppError('Target device not found in inventory.', 404));
    }

    // ELIGIBILITY CHECK: Device must not be currently in recycling
    if (device.status === 'RECYCLING_PENDING' || device.status === 'TRANSFERRED_TO_RECYCLER' || device.status === 'RECYCLED') {
      return next(new AppError('Device has already been assigned to recycling and cannot be sent for refurbishment.', 400));
    }

    let partner = null;
    if (partnerId.match(/^[0-9a-fA-F]{24}$/)) {
      partner = await Partner.findById(partnerId);
    }
    if (!partner) {
      partner = await Partner.findOne({ partnerId });
    }

    if (!partner) {
      return next(new AppError('Refurbishment partner not found.', 404));
    }

    if (partner.partnerType !== 'REFURBISHMENT') {
      return next(new AppError('Selected partner is not registered as a Refurbishment partner.', 400));
    }

    if (partner.status !== 'ACTIVE') {
      return next(new AppError('Partner account is currently inactive or suspended.', 400));
    }

    const jobId = await getNextId('RFB');

    const newJob = await RefurbishmentJob.create({
      jobId,
      deviceId: device._id,
      retechDeviceId: device.deviceId,
      partnerId: partner._id,
      partnerName: partner.partnerName,
      assignedBy: adminUser._id,
      assignedByName: adminUser.fullName,
      assignmentDate: new Date(),
      expectedCompletionDate: expectedCompletionDate ? new Date(expectedCompletionDate) : undefined,
      instructions: instructions || 'Perform diagnostic inspection and hardware component renewal.',
      status: 'ASSIGNED',
    });

    // Update device status and reference
    await Device.findByIdAndUpdate(device._id, {
      status: 'IN_REFURBISHMENT',
      refurbishmentJobId: newJob._id,
    });

    // Record lifecycle event
    await recordLifecycleEvent({
      deviceId: device._id,
      retechDeviceId: device.deviceId,
      eventType: 'ASSIGNED_TO_REFURBISHMENT',
      title: `Assigned to Refurbishment Partner: ${partner.partnerName}`,
      description: `Device transferred for certified hardware repair and cosmetic reconditioning. Partner Ref: ${partner.partnerId}`,
      previousStatus: device.status,
      newStatus: 'IN_REFURBISHMENT',
      performedBy: adminUser._id,
      performedByName: adminUser.fullName,
      sourceReference: newJob.jobId,
    });

    res.status(201).json({
      success: true,
      message: `Refurbishment job ${jobId} created and assigned to ${partner.partnerName}.`,
      data: newJob,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Update refurbishment job progress, findings, cost, or complete
 */
export const updateRefurbishmentJob = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const adminUser = req.user!;
    const { id } = req.params;
    const {
      status,
      inspectionFindings,
      replacedComponents,
      refurbishmentCost,
      finalOutcome,
      supportingDocuments,
    } = req.body;

    let job = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      job = await RefurbishmentJob.findById(id);
    }
    if (!job) {
      job = await RefurbishmentJob.findOne({ jobId: id });
    }

    if (!job) {
      return next(new AppError('Refurbishment job not found.', 404));
    }

    const previousStatus = job.status;

    if (status) job.status = status as RefurbishmentStatus;
    if (inspectionFindings !== undefined) job.inspectionFindings = inspectionFindings;
    if (Array.isArray(replacedComponents)) job.replacedComponents = replacedComponents;
    if (refurbishmentCost !== undefined) job.refurbishmentCost = parseFloat(refurbishmentCost);
    if (finalOutcome !== undefined) job.finalOutcome = finalOutcome;
    if (Array.isArray(supportingDocuments)) job.supportingDocuments = supportingDocuments;

    if (status === 'COMPLETED' && !job.completedAt) {
      job.completedAt = new Date();
    }

    await job.save();

    // If job reached COMPLETED: transition device to READY_FOR_RESALE
    if (status === 'COMPLETED' && previousStatus !== 'COMPLETED') {
      await Device.findByIdAndUpdate(job.deviceId, {
        status: 'READY_FOR_RESALE',
      });

      await recordLifecycleEvent({
        deviceId: job.deviceId,
        retechDeviceId: job.retechDeviceId,
        eventType: 'REFURBISHMENT_COMPLETED',
        title: 'Hardware Refurbishment Completed & QA Passed',
        description: `Refurbishment completed by ${job.partnerName}. Replaced parts: ${job.replacedComponents.join(', ') || 'None'}. Device certified ready for resale.`,
        previousStatus: 'IN_REFURBISHMENT',
        newStatus: 'READY_FOR_RESALE',
        performedBy: adminUser._id,
        performedByName: adminUser.fullName,
        sourceReference: job.jobId,
      });
    }

    res.status(200).json({
      success: true,
      message: `Refurbishment job ${job.jobId} updated [Status: ${job.status}].`,
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

