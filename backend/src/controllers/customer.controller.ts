import { Response, NextFunction } from 'express';
import crypto from 'crypto';
import { AuthenticatedRequest } from '../middleware/auth.js';
import Device from '../models/Device.js';
import PickupRequest from '../models/PickupRequest.js';
import Notification from '../models/Notification.js';
import SanitizationJob from '../models/SanitizationJob.js';
import SanitizationCertificate from '../models/SanitizationCertificate.js';
import MarketplaceListing from '../models/MarketplaceListing.js';
import RefurbishmentJob from '../models/RefurbishmentJob.js';
import RecyclingRecord from '../models/RecyclingRecord.js';
import { getNextId } from '../models/Counter.js';
import AppError from '../utils/AppError.js';
import { deviceSubmissionSchema, formatZodError } from '../utils/validators.js';
import { createNotification } from '../utils/notification.js';

/**
 * Customer Dashboard summary metrics & recent activity
 */
export const getDashboardSummary = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const customerId = req.user!._id;

    const [
      totalDevices,
      pendingPickups,
      devicesUnderProcessing,
      sanitizationCompleted,
      recentDevices,
      recentPickups,
      unreadNotifications,
    ] = await Promise.all([
      Device.countDocuments({ customerId }),
      PickupRequest.countDocuments({
        customerId,
        status: { $in: ['PENDING', 'APPROVED', 'SCHEDULED'] },
      }),
      Device.countDocuments({
        customerId,
        status: {
          $in: [
            'COLLECTION_CONFIRMED',
            'RECEIVED',
            'INSPECTION_PENDING',
            'INSPECTED',
            'SANITIZATION_PENDING',
          ],
        },
      }),
      Device.countDocuments({
        customerId,
        status: { $in: ['SANITIZED', 'READY_FOR_RESALE', 'RECYCLED'] },
      }),
      Device.find({ customerId })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('pickupRequestId', 'requestId status preferredDate'),
      PickupRequest.find({ customerId })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('deviceId', 'deviceId category brand model'),
      Notification.countDocuments({ userId: customerId, isRead: false }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        metrics: {
          totalDevices,
          pendingPickups,
          devicesUnderProcessing,
          sanitizationCompleted,
        },
        recentDevices,
        recentPickups,
        unreadNotifications,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List customer devices with filtering, search, and pagination
 */
export const getCustomerDevices = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const customerId = req.user!._id;
    const { category, status, search, page = '1', limit = '10', sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const filter: any = { customerId };

    if (category && category !== 'ALL') {
      filter.category = category;
    }

    if (status && status !== 'ALL') {
      filter.status = status;
    }

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
        .populate('pickupRequestId', 'requestId status preferredDate preferredTimeSlot'),
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
 * Submit new device and create collection pickup request in one flow
 */
export const submitDevice = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const customerId = req.user!._id;
    const parseResult = deviceSubmissionSchema.safeParse(req.body);

    if (!parseResult.success) {
      return next(new AppError(formatZodError(parseResult.error), 400));
    }

    const data = parseResult.data;

    // Generate unique sequential IDs
    const deviceId = await getNextId('RET');
    const requestId = await getNextId('REQ');

    // Create device record
    const device = new Device({
      deviceId,
      customerId,
      category: data.category,
      brand: data.brand,
      model: data.model,
      purchaseYear: data.purchaseYear || '',
      condition: data.condition,
      powersOn: data.powersOn,
      storageType: data.storageType,
      storageCapacity: data.storageCapacity,
      description: data.description,
      images: data.images,
      status: 'SUBMITTED',
      classification: 'PENDING',
    });

    await device.save();

    // Create associated pickup request
    const pickupRequest = new PickupRequest({
      requestId,
      customerId,
      deviceId: device._id,
      pickupAddress: data.pickup.pickupAddress,
      city: data.pickup.city,
      state: data.pickup.state,
      pinCode: data.pickup.pinCode,
      contactNumber: data.pickup.contactNumber,
      preferredDate: data.pickup.preferredDate,
      preferredTimeSlot: data.pickup.preferredTimeSlot,
      instructions: data.pickup.instructions || '',
      status: 'PENDING',
      statusHistory: [
        {
          status: 'PENDING',
          timestamp: new Date(),
          remarks: 'Collection pickup request submitted by customer.',
          updatedBy: customerId,
        },
      ],
    });

    await pickupRequest.save();

    // Link pickup request back to device
    device.pickupRequestId = pickupRequest._id;
    await device.save();

    // Create in-app notification
    await createNotification(
      customerId,
      'Device Submitted for Pickup',
      `Your ${data.brand} ${data.model} (${deviceId}) was registered. Pickup Request: ${requestId}.`,
      'SUCCESS',
      deviceId,
    );

    res.status(201).json({
      success: true,
      message: 'Device submitted and pickup request created successfully.',
      data: {
        device,
        pickupRequest,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get device details by deviceId or Mongo _id
 */
export const getDeviceDetails = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const customerId = req.user!._id;
    const { id } = req.params;

    const device = await Device.findOne({
      customerId,
      $or: [{ deviceId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    }).populate('pickupRequestId');

    if (!device) {
      return next(new AppError('Device not found or unauthorized', 404));
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
 * List customer pickup requests
 */
export const getCustomerPickups = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const customerId = req.user!._id;
    const { status, page = '1', limit = '10' } = req.query;

    const filter: any = { customerId };
    if (status && status !== 'ALL') {
      filter.status = status;
    }

    const pageNum = Math.max(1, parseInt(String(page), 10));
    const limitNum = Math.max(1, Math.min(50, parseInt(String(limit), 10)));
    const skip = (pageNum - 1) * limitNum;

    const [pickups, total] = await Promise.all([
      PickupRequest.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('deviceId', 'deviceId category brand model condition status classification inspection certificateId marketplaceListingId'),
      PickupRequest.countDocuments(filter),
    ]);

    // Cross-check real operational lifecycle records in DB
    const deviceIds = pickups.map((p) => (p.deviceId as any)?._id || p.deviceId).filter(Boolean);

    const [sanitizationJobs, certificates, listings] = await Promise.all([
      SanitizationJob.find({
        deviceId: { $in: deviceIds },
      }).sort({ createdAt: -1 }),
      SanitizationCertificate.find({
        deviceId: { $in: deviceIds },
      }),
      MarketplaceListing.find({
        deviceId: { $in: deviceIds },
        listingStatus: { $ne: 'CANCELLED' },
      }),
    ]);

    const jobMap = new Map();
    sanitizationJobs.forEach((j) => {
      if (!jobMap.has(j.deviceId.toString())) {
        jobMap.set(j.deviceId.toString(), j);
      }
    });

    const certMap = new Map();
    certificates.forEach((c) => {
      certMap.set(c.deviceId.toString(), c);
    });

    const listingMap = new Map();
    listings.forEach((l) => {
      listingMap.set(l.deviceId.toString(), l);
    });

    const enrichedPickups = pickups.map((p) => {
      const pObj = p.toObject();
      const dev = pObj.deviceId;
      const devIdStr = dev && typeof dev === 'object' ? dev._id.toString() : dev?.toString();

      const sJob = devIdStr ? jobMap.get(devIdStr) : null;
      const cert = devIdStr ? certMap.get(devIdStr) : null;
      const listing = devIdStr ? listingMap.get(devIdStr) : null;

      // Real process-driven stage verifications:
      // Stage 7: Sanitization Verified (requires actual verified NIST wipe or certificate)
      const isSanitizationVerified = Boolean(
        (sJob && sJob.status === 'VERIFIED_SUCCESSFUL') ||
        cert ||
        (dev && ['SANITIZED', 'READY_FOR_RESALE', 'LISTED_FOR_RESALE', 'SOLD', 'RECYCLED'].includes(dev.status))
      );

      // Stage 8: Final Destination (marketplace listing, resale readiness, or recycling)
      const isFinalDestinationReached = Boolean(
        listing ||
        (dev && ['READY_FOR_RESALE', 'LISTED_FOR_RESALE', 'SOLD', 'RECYCLED'].includes(dev.status))
      );

      // Stage 6: Queued or active in sanitization
      const isSanitizationQueued = Boolean(
        sJob ||
        isSanitizationVerified ||
        (dev && dev.status === 'SANITIZATION_PENDING')
      );

      // Stage 5: Hardware diagnostics / classification completed
      const isInspected = Boolean(
        isSanitizationQueued ||
        (dev && dev.classification && dev.classification !== 'PENDING') ||
        (dev && dev.inspection?.inspectedAt) ||
        (dev && dev.status === 'INSPECTED')
      );

      // Determine real dynamic stage index (1 to 8)
      let completedStage = 1;
      if (['CANCELLED', 'REJECTED'].includes(pObj.status)) {
        completedStage = 0;
      } else if (isFinalDestinationReached) {
        completedStage = 8;
      } else if (isSanitizationVerified) {
        completedStage = 7;
      } else if (isSanitizationQueued) {
        completedStage = 6;
      } else if (isInspected) {
        completedStage = 5;
      } else if (pObj.status === 'RECEIVED' || dev?.status === 'RECEIVED') {
        completedStage = 4;
      } else if (pObj.status === 'COLLECTION_CONFIRMED') {
        completedStage = 3;
      } else if (['APPROVED', 'SCHEDULED'].includes(pObj.status)) {
        completedStage = 2;
      }

      if (dev && typeof dev === 'object') {
        dev.hasVerifiedSanitization = isSanitizationVerified;
        dev.certificateId = dev.certificateId || cert?.certificateNumber || sJob?.verificationResult?.certificateId;
        dev.marketplaceListingId = dev.marketplaceListingId || listing?._id;
        dev.sanitizationJobId = sJob?.jobId;
        dev.sanitizationJobStatus = sJob?.status;
      }

      pObj.currentStageIndex = completedStage;
      pObj.hasVerifiedSanitization = isSanitizationVerified;
      pObj.sanitizationCertificateId = dev?.certificateId;

      return pObj;
    });

    res.status(200).json({
      success: true,
      data: {
        pickups: enrichedPickups,
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
 * Cancel an eligible pending pickup request
 */
export const cancelPickupRequest = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const customerId = req.user!._id;
    const { id } = req.params;

    const pickup = await PickupRequest.findOne({
      customerId,
      $or: [{ requestId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    });

    if (!pickup) {
      return next(new AppError('Pickup request not found', 404));
    }

    if (!['PENDING', 'APPROVED', 'SCHEDULED'].includes(pickup.status)) {
      return next(
        new AppError(
          `Cannot cancel pickup request in '${pickup.status}' status. Only pending or scheduled requests can be cancelled.`,
          400,
        ),
      );
    }

    pickup.status = 'CANCELLED';
    pickup.statusHistory.push({
      status: 'CANCELLED',
      timestamp: new Date(),
      remarks: 'Cancelled by customer.',
      updatedBy: customerId,
    });
    await pickup.save();

    await createNotification(
      customerId,
      'Pickup Cancelled',
      `Your pickup request ${pickup.requestId} has been cancelled.`,
      'INFO',
    );

    res.status(200).json({
      success: true,
      message: 'Pickup request cancelled successfully',
      data: pickup,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get customer notifications
 */
export const getCustomerNotifications = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const customerId = req.user!._id;
    const notifications = await Notification.find({ userId: customerId })
      .sort({ createdAt: -1 })
      .limit(30);

    res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark notifications as read
 */
export const markNotificationsAsRead = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const customerId = req.user!._id;
    await Notification.updateMany({ userId: customerId, isRead: false }, { isRead: true });

    res.status(200).json({
      success: true,
      message: 'Notifications marked as read',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get device sanitization status & verification certificate for customer view
 */
export const getCustomerDeviceSanitization = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const customerId = req.user!._id;
    const { id } = req.params;

    let device = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      device = await Device.findOne({ _id: id, customerId });
    }
    if (!device) {
      device = await Device.findOne({ deviceId: id, customerId });
    }

    if (!device) {
      return next(new AppError('Device not found or does not belong to your account.', 404));
    }

    const job = await SanitizationJob.findOne({ deviceId: device._id }).sort({ createdAt: -1 });

    if (!job) {
      res.status(200).json({
        success: true,
        data: {
          hasSanitizationRecord: false,
          deviceStatus: device.status,
          message: 'No sanitization process has been initiated for this device yet.',
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        hasSanitizationRecord: true,
        jobId: job.jobId,
        deviceStatus: device.status,
        status: job.status,
        selectedMethod: job.selectedMethod,
        sanitizationStandard: job.sanitizationStandard,
        isSimulation: job.isSimulation,
        progressPercent: job.progressPercent,
        completedAt: job.completedAt,
        verification: job.verificationResult
          ? {
              verified: job.verificationResult.verified,
              certificateId: job.verificationResult.certificateId,
              sha256VerificationHash: job.verificationResult.sha256VerificationHash,
              verificationTimestamp: job.verificationResult.verificationTimestamp,
            }
          : null,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Customer: Get comprehensive reports for all submitted devices
 */
export const getCustomerReports = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const customerId = req.user!._id;

    const devices = await Device.find({ customerId })
      .sort({ createdAt: -1 })
      .populate('pickupRequestId');

    const deviceIds = devices.map((d) => d._id);

    // Fetch related records in parallel
    const [sanitizationJobs, certificates, listings, recyclingRecords] = await Promise.all([
      SanitizationJob.find({ deviceId: { $in: deviceIds } }),
      SanitizationCertificate.find({ deviceId: { $in: deviceIds }, status: 'ACTIVE' }),
      MarketplaceListing.find({ deviceId: { $in: deviceIds } }),
      RecyclingRecord.find({ deviceId: { $in: deviceIds } }),
    ]);

    const reports = await Promise.all(
      devices.map(async (device) => {
        const job = sanitizationJobs.find((j) => j.deviceId.toString() === device._id.toString());
        let cert = certificates.find((c) => c.deviceId.toString() === device._id.toString());
        const listing = listings.find((l) => l.deviceId.toString() === device._id.toString());
        const recycling = recyclingRecords.find((r) => r.deviceId.toString() === device._id.toString());

        // Auto-heal / fallback: If sanitization job was VERIFIED_SUCCESSFUL but certificate record wasn't retrieved
        if (!cert && job && job.status === 'VERIFIED_SUCCESSFUL') {
          const certNumber =
            job.verificationResult?.certificateId ||
            device.certificateId ||
            `CERT-${new Date().getFullYear()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

          cert = await SanitizationCertificate.findOne({
            $or: [
              { sanitizationJobId: job._id },
              { certificateNumber: certNumber },
              { deviceId: device._id, status: 'ACTIVE' },
            ],
          });

          if (!cert) {
            const verificationId = crypto.randomBytes(16).toString('hex');
            const evidenceRef =
              job.verificationResult?.sha256VerificationHash ||
              crypto.createHash('sha256').update(job.jobId).digest('hex');

            cert = await SanitizationCertificate.create({
              certificateNumber: certNumber,
              verificationId,
              deviceId: device._id,
              retechDeviceId: device.deviceId,
              customerId: device.customerId,
              sanitizationJobId: job._id,
              sanitizationJobCode: job.jobId,
              sanitizationMethod: job.selectedMethod || 'NIST_SP_800_88_CLEAR',
              standardReference:
                job.sanitizationStandard || 'NIST SP 800-88 Rev. 1 Guidelines for Media Sanitization',
              operationCompletedAt: job.completedAt || new Date(),
              verifiedAt: job.verificationResult?.verificationTimestamp || new Date(),
              issuedAt: new Date(),
              issuedBy: job.assignedAgentId || device.customerId,
              issuedByName: 'ReTech Automated Sanitization Agent',
              verificationOutcome: 'VERIFIED_SUCCESSFUL',
              evidenceReference: evidenceRef,
              entropyScore: job.verificationResult?.entropyScore ?? 0.0,
              sectorsSampled: job.verificationResult?.sectorsSampled ?? 1024,
              status: 'ACTIVE',
            });
          }

          if (!device.certificateId) {
            device.certificateId = cert.certificateNumber;
            await device.save();
          }
        }

        let finalDestination = 'In Processing';
        if (device.status === 'SOLD') finalDestination = 'Resold to Second-Life Customer';
        else if (device.status === 'LISTED_FOR_RESALE' || device.status === 'READY_FOR_RESALE')
          finalDestination = 'Approved for Refurbished Resale';
        else if (device.status === 'RECYCLED') finalDestination = 'Certified Material Recovery & Recycling';
        else if (device.status === 'TRANSFERRED_TO_RECYCLER') finalDestination = 'Transferred to Authorised Recycler';
        else if (device.status === 'IN_REFURBISHMENT' || device.status === 'REFURBISHED')
          finalDestination = 'Refurbishment Quality Enhancement';
        else if (device.status === 'SANITIZED') finalDestination = 'Sanitized - Ready for Lifecycle Classification';

        return {
          device: {
            _id: device._id,
            deviceId: device.deviceId,
            category: device.category,
            brand: device.brand,
            model: device.model,
            condition: device.condition,
            status: device.status,
            classification: device.classification,
            submittedAt: device.createdAt,
          },
          pickup: device.pickupRequestId || null,
          inspection: device.inspection || null,
          sanitization: job
            ? {
                jobId: job.jobId,
                status: job.status,
                selectedMethod: job.selectedMethod,
                completedAt: job.completedAt,
                isVerified: job.status === 'VERIFIED_SUCCESSFUL',
              }
            : null,
          certificate: cert
            ? {
                _id: cert._id,
                certificateNumber: cert.certificateNumber,
                verificationId: cert.verificationId,
                issuedAt: cert.issuedAt,
                standardReference: cert.standardReference,
                evidenceReference: cert.evidenceReference,
                downloadUrl: `/api/v1/certificates/${cert._id}/download`,
              }
            : null,
          marketplace: listing
            ? {
                listingId: listing.listingId,
                listingStatus: listing.listingStatus,
                price: listing.price,
                soldAt: listing.soldAt,
              }
            : null,
          recycling: recycling
            ? {
                recordId: recycling.recordId,
                recyclerName: recycling.recyclerName,
                transferDate: recycling.transferDate,
                processingStatus: recycling.processingStatus,
                finalOutcome: recycling.finalOutcome,
              }
            : null,
          finalDestination,
        };
      }),
    );

    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Customer: Get list of active certificates issued for their devices
 */
export const getCustomerCertificates = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const customerId = req.user!._id;

    const certificates = await SanitizationCertificate.find({
      customerId,
      status: 'ACTIVE',
    })
      .sort({ issuedAt: -1 })
      .populate('deviceId', 'deviceId category brand model storageType storageCapacity');

    res.status(200).json({
      success: true,
      count: certificates.length,
      data: certificates,
    });
  } catch (error) {
    next(error);
  }
};


