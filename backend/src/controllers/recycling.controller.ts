import { Response, NextFunction } from 'express';
import RecyclingRecord, { RecyclingStatus } from '../models/RecyclingRecord.js';
import Partner from '../models/Partner.js';
import Device from '../models/Device.js';
import { getNextId } from '../models/Counter.js';
import { recordLifecycleEvent } from '../models/DeviceLifecycleEvent.js';
import AppError from '../utils/AppError.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

/**
 * Admin: Get all recycling transfer records
 */
export const getRecyclingRecords = async (
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
      query.processingStatus = status;
    }

    if (search) {
      query.$or = [
        { recordId: { $regex: search, $options: 'i' } },
        { retechDeviceId: { $regex: search, $options: 'i' } },
        { recyclerName: { $regex: search, $options: 'i' } },
        { handoverReference: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [records, total, inProcessingCount, recycledCount] = await Promise.all([
      RecyclingRecord.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('deviceId', 'deviceId category brand model condition status storageType storageCapacity')
        .populate('recyclerId', 'partnerId partnerName companyName email phone authorisationReference')
        .populate('createdBy', 'fullName email'),
      RecyclingRecord.countDocuments(query),
      RecyclingRecord.countDocuments({ processingStatus: { $in: ['TRANSFERRED', 'RECEIVED_BY_RECYCLER', 'PROCESSING'] } }),
      RecyclingRecord.countDocuments({ processingStatus: 'RECYCLED' }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        records,
        stats: {
          total,
          inProcessingCount,
          recycledCount,
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
 * Admin: Get single recycling transfer record
 */
export const getRecyclingRecordById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;

    let record = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      record = await RecyclingRecord.findById(id)
        .populate('deviceId')
        .populate('recyclerId')
        .populate('createdBy', 'fullName email');
    }
    if (!record) {
      record = await RecyclingRecord.findOne({ recordId: id })
        .populate('deviceId')
        .populate('recyclerId')
        .populate('createdBy', 'fullName email');
    }

    if (!record) {
      return next(new AppError('Recycling transfer record not found.', 404));
    }

    res.status(200).json({
      success: true,
      data: record,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Transfer device to an authorised recycling partner
 */
export const createRecyclingRecord = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const adminUser = req.user!;
    const {
      deviceId,
      recyclerId,
      transferDate,
      approximateWeightKg,
      handoverReference,
      handoverReceipt,
      internalNotes,
    } = req.body;

    if (!deviceId || !recyclerId || !handoverReference) {
      return next(
        new AppError('Device selection, recycler partner, and handover reference are required.', 400),
      );
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

    if (device.status === 'SOLD') {
      return next(new AppError('Device has already been sold and cannot be recycled.', 400));
    }

    let recycler = null;
    if (recyclerId.match(/^[0-9a-fA-F]{24}$/)) {
      recycler = await Partner.findById(recyclerId);
    }
    if (!recycler) {
      recycler = await Partner.findOne({ partnerId: recyclerId });
    }

    if (!recycler) {
      return next(new AppError('Authorised recycler record not found.', 404));
    }

    if (recycler.partnerType !== 'RECYCLING') {
      return next(new AppError('Selected partner is not registered as an Authorised Recycler.', 400));
    }

    if (recycler.status !== 'ACTIVE') {
      return next(new AppError('Recycler organization account is not active.', 400));
    }

    const recordId = await getNextId('RCY');

    const newRecord = await RecyclingRecord.create({
      recordId,
      deviceId: device._id,
      retechDeviceId: device.deviceId,
      recyclerId: recycler._id,
      recyclerName: recycler.partnerName,
      createdBy: adminUser._id,
      createdByName: adminUser.fullName,
      transferDate: transferDate ? new Date(transferDate) : new Date(),
      deviceCategory: device.category,
      approximateWeightKg: approximateWeightKg ? parseFloat(approximateWeightKg) : undefined,
      handoverReference: handoverReference.trim(),
      handoverReceipt: handoverReceipt || '',
      processingStatus: 'TRANSFERRED',
      internalNotes: internalNotes || '',
    });

    // Update device status and reference
    await Device.findByIdAndUpdate(device._id, {
      status: 'TRANSFERRED_TO_RECYCLER',
      recyclingRecordId: newRecord._id,
    });

    // Record lifecycle event
    await recordLifecycleEvent({
      deviceId: device._id,
      retechDeviceId: device.deviceId,
      eventType: 'TRANSFERRED_FOR_RECYCLING',
      title: `Transferred to Authorised Recycler: ${recycler.partnerName}`,
      description: `Device transferred for certified material recovery and safe destruction. Handover Manifest Ref: ${handoverReference}. Govt Auth: ${recycler.authorisationReference}`,
      previousStatus: device.status,
      newStatus: 'TRANSFERRED_TO_RECYCLER',
      performedBy: adminUser._id,
      performedByName: adminUser.fullName,
      sourceReference: newRecord.recordId,
    });

    res.status(201).json({
      success: true,
      message: `Recycling transfer record ${recordId} created successfully.`,
      data: newRecord,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Update recycling processing status and record final certified outcome
 */
export const updateRecyclingRecord = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const adminUser = req.user!;
    const { id } = req.params;
    const {
      processingStatus,
      recyclerAcknowledgement,
      finalOutcome,
      processingEvidence,
      internalNotes,
    } = req.body;

    let record = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      record = await RecyclingRecord.findById(id);
    }
    if (!record) {
      record = await RecyclingRecord.findOne({ recordId: id });
    }

    if (!record) {
      return next(new AppError('Recycling record not found.', 404));
    }

    const previousStatus = record.processingStatus;

    // MANDATORY BUSINESS RULE: Do not mark as RECYCLED without processing evidence
    if (processingStatus === 'RECYCLED') {
      const hasEvidence =
        (processingEvidence && processingEvidence.trim().length > 0) ||
        (finalOutcome && finalOutcome.trim().length > 0) ||
        (recyclerAcknowledgement && recyclerAcknowledgement.trim().length > 0);

      if (!hasEvidence) {
        return next(
          new AppError(
            'Cannot mark as RECYCLED without recorded confirmation or processing evidence reference from the authorised recycler.',
            400,
          ),
        );
      }
    }

    if (processingStatus) record.processingStatus = processingStatus as RecyclingStatus;
    if (recyclerAcknowledgement !== undefined) record.recyclerAcknowledgement = recyclerAcknowledgement;
    if (finalOutcome !== undefined) record.finalOutcome = finalOutcome;
    if (processingEvidence !== undefined) record.processingEvidence = processingEvidence;
    if (internalNotes !== undefined) record.internalNotes = internalNotes;

    if (processingStatus === 'RECYCLED' && !record.completedAt) {
      record.completedAt = new Date();
    }

    await record.save();

    // If reached RECYCLED: update Device status to RECYCLED and record lifecycle
    if (processingStatus === 'RECYCLED' && previousStatus !== 'RECYCLED') {
      await Device.findByIdAndUpdate(record.deviceId, {
        status: 'RECYCLED',
      });

      await recordLifecycleEvent({
        deviceId: record.deviceId,
        retechDeviceId: record.retechDeviceId,
        eventType: 'DEVICE_RECYCLED',
        title: 'Certified Recycling & Material Recovery Completed',
        description: `Material recovery verified by ${record.recyclerName}. Final Outcome: ${record.finalOutcome || 'Disassembled into raw metal, glass, and plastic streams.'}. Handover Ref: ${record.handoverReference}`,
        previousStatus: 'TRANSFERRED_TO_RECYCLER',
        newStatus: 'RECYCLED',
        performedBy: adminUser._id,
        performedByName: adminUser.fullName,
        sourceReference: record.recordId,
      });
    }

    res.status(200).json({
      success: true,
      message: `Recycling record ${record.recordId} updated [Status: ${record.processingStatus}].`,
      data: record,
    });
  } catch (error) {
    next(error);
  }
};

