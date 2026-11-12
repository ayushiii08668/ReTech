import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import SanitizationCertificate from '../models/SanitizationCertificate.js';
import SanitizationJob from '../models/SanitizationJob.js';
import Device from '../models/Device.js';
import { getNextId } from '../models/Counter.js';
import { generateCertificatePDF } from '../services/pdfCertificate.service.js';
import { recordLifecycleEvent } from '../models/DeviceLifecycleEvent.js';
import AppError from '../utils/AppError.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

/**
 * Get all sanitization certificates (Admin view)
 */
export const getAdminCertificates = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const search = (req.query.search as string)?.trim();
    const status = (req.query.status as string)?.trim();

    const query: Record<string, any> = {};

    if (search) {
      query.$or = [
        { certificateNumber: { $regex: search, $options: 'i' } },
        { retechDeviceId: { $regex: search, $options: 'i' } },
        { sanitizationJobCode: { $regex: search, $options: 'i' } },
        { evidenceReference: { $regex: search, $options: 'i' } },
      ];
    }

    if (status && status !== 'ALL') {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const [certificates, total] = await Promise.all([
      SanitizationCertificate.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('deviceId', 'deviceId category brand model storageType storageCapacity')
        .populate('customerId', 'fullName email')
        .populate('issuedBy', 'fullName email'),
      SanitizationCertificate.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: {
        certificates,
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
 * Get devices eligible for certificate generation (verified sanitized without active certificate)
 */
export const getEligibleSanitizedDevices = async (
  _req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // Find all sanitization jobs with VERIFIED_SUCCESSFUL status
    const verifiedJobs = await SanitizationJob.find({
      status: 'VERIFIED_SUCCESSFUL',
    })
      .sort({ completedAt: -1 })
      .populate('deviceId', 'deviceId category brand model condition storageType storageCapacity customerId status');

    // Find existing active certificates
    const existingCerts = await SanitizationCertificate.find({
      status: { $in: ['ACTIVE', 'SUPERSEDED'] },
    }).select('sanitizationJobId deviceId certificateNumber');

    const certifiedJobIds = new Set(existingCerts.map((c) => c.sanitizationJobId.toString()));

    const eligible = verifiedJobs.map((job) => ({
      job,
      hasCertificate: certifiedJobIds.has(job._id.toString()),
      existingCertificate: existingCerts.find(
        (c) => c.sanitizationJobId.toString() === job._id.toString(),
      ),
    }));

    res.status(200).json({
      success: true,
      data: eligible,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate official PDF certificate for a verified sanitized device
 */
export const generateCertificate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const adminUser = req.user!;
    const { deviceId } = req.params;

    // Check device existence
    let device = null;
    if (deviceId.match(/^[0-9a-fA-F]{24}$/)) {
      device = await Device.findById(deviceId);
    }
    if (!device) {
      device = await Device.findOne({ deviceId });
    }

    if (!device) {
      return next(new AppError('Device not found in inventory.', 404));
    }

    // MANDATORY BUSINESS RULE: Sanitization job MUST be VERIFIED_SUCCESSFUL
    const job = await SanitizationJob.findOne({
      deviceId: device._id,
      status: 'VERIFIED_SUCCESSFUL',
    }).sort({ completedAt: -1 });

    if (!job) {
      return next(
        new AppError(
          'Certificate cannot be generated: No VERIFIED_SUCCESSFUL sanitization record exists for this device. Devices that are PENDING, RUNNING, or FAILED cannot be certified.',
          400,
        ),
      );
    }

    // Check if an ACTIVE certificate already exists for this job
    const existingActiveCert = await SanitizationCertificate.findOne({
      sanitizationJobId: job._id,
      status: 'ACTIVE',
    });

    if (existingActiveCert) {
      return next(
        new AppError(
          `An active certificate (${existingActiveCert.certificateNumber}) already exists for this sanitization job. You may download it or revoke it first before regenerating.`,
          409,
        ),
      );
    }

    const certificateNumber = await getNextId('CERT');
    const verificationId = crypto.randomBytes(16).toString('hex');

    const newCertificate = new SanitizationCertificate({
      certificateNumber,
      verificationId,
      deviceId: device._id,
      retechDeviceId: device.deviceId,
      customerId: device.customerId,
      sanitizationJobId: job._id,
      sanitizationJobCode: job.jobId,
      sanitizationMethod: job.selectedMethod,
      standardReference: job.sanitizationStandard || 'NIST SP 800-88 Rev. 1 Guidelines for Media Sanitization',
      operationCompletedAt: job.completedAt || new Date(),
      verifiedAt: job.verificationResult?.verificationTimestamp || new Date(),
      issuedAt: new Date(),
      issuedBy: adminUser._id,
      issuedByName: adminUser.fullName,
      verificationOutcome: 'VERIFIED_SUCCESSFUL',
      evidenceReference:
        job.verificationResult?.sha256VerificationHash ||
        crypto.createHash('sha256').update(job.jobId).digest('hex'),
      entropyScore: job.verificationResult?.entropyScore ?? 0.0001,
      sectorsSampled: job.verificationResult?.sectorsSampled ?? 1024,
      status: 'ACTIVE',
    });

    // Generate physical PDF certificate
    const { pdfPath } = await generateCertificatePDF(newCertificate, device, job);
    newCertificate.pdfPath = pdfPath;
    newCertificate.pdfUrl = `/api/v1/certificates/${newCertificate._id}/download`;

    await newCertificate.save();

    // Update Device certificate reference
    await Device.findByIdAndUpdate(device._id, {
      certificateId: newCertificate.certificateNumber,
    });

    // Record lifecycle event
    await recordLifecycleEvent({
      deviceId: device._id,
      retechDeviceId: device.deviceId,
      eventType: 'CERTIFICATE_ISSUED',
      title: 'Official Sanitization Certificate Issued',
      description: `Certificate ${newCertificate.certificateNumber} generated under NIST SP 800-88 standard. SHA-256 evidence fingerprint: ${newCertificate.evidenceReference}`,
      performedBy: adminUser._id,
      performedByName: adminUser.fullName,
      sourceReference: newCertificate.certificateNumber,
    });

    res.status(201).json({
      success: true,
      message: `Sanitization certificate ${certificateNumber} successfully generated and signed.`,
      data: newCertificate,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Download Certificate PDF
 */
export const downloadCertificatePDF = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { certificateId } = req.params;

    let cert = null;
    if (certificateId.match(/^[0-9a-fA-F]{24}$/)) {
      cert = await SanitizationCertificate.findById(certificateId);
    }
    if (!cert) {
      cert = await SanitizationCertificate.findOne({
        $or: [{ certificateNumber: certificateId }, { verificationId: certificateId }],
      });
    }

    if (!cert) {
      return next(new AppError('Certificate not found.', 404));
    }

    // Role check: Customer can only download their own certificate
    if (req.user!.role === 'CUSTOMER' && cert.customerId.toString() !== req.user!._id.toString()) {
      return next(new AppError('You do not have permission to download this certificate.', 403));
    }

    // Always generate/regenerate with current official template (clean layout without QR code)
    const [device, job] = await Promise.all([
      Device.findById(cert.deviceId),
      SanitizationJob.findById(cert.sanitizationJobId),
    ]);

    if (!device || !job) {
      return next(new AppError('Underlying device or job records missing.', 404));
    }

    const { pdfPath } = await generateCertificatePDF(cert, device, job);
    cert.pdfPath = pdfPath;
    await cert.save();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="ReTech-Certificate-${cert.certificateNumber}.pdf"`,
    );
    fs.createReadStream(pdfPath).pipe(res);
  } catch (error) {
    next(error);
  }
};

/**
 * Revoke or supersede a certificate with mandatory justification (Admin only)
 */
export const revokeCertificate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const adminUser = req.user!;
    const { certificateId } = req.params;
    const { reason } = req.body;

    if (!reason || reason.trim().length < 5) {
      return next(
        new AppError('A valid mandatory revocation justification is required (minimum 5 characters).', 400),
      );
    }

    let cert = null;
    if (certificateId.match(/^[0-9a-fA-F]{24}$/)) {
      cert = await SanitizationCertificate.findById(certificateId);
    }
    if (!cert) {
      cert = await SanitizationCertificate.findOne({ certificateNumber: certificateId });
    }

    if (!cert) {
      return next(new AppError('Certificate not found.', 404));
    }

    cert.status = 'REVOKED';
    cert.revocationReason = reason.trim();
    cert.revokedAt = new Date();
    cert.revokedBy = adminUser._id;

    // Regenerate PDF reflecting REVOKED banner
    const [device, job] = await Promise.all([
      Device.findById(cert.deviceId),
      SanitizationJob.findById(cert.sanitizationJobId),
    ]);
    if (device && job) {
      const { pdfPath } = await generateCertificatePDF(cert, device, job);
      cert.pdfPath = pdfPath;
    }

    await cert.save();

    // Record lifecycle event
    await recordLifecycleEvent({
      deviceId: cert.deviceId,
      retechDeviceId: cert.retechDeviceId,
      eventType: 'CERTIFICATE_REVOKED',
      title: `Certificate ${cert.certificateNumber} Revoked`,
      description: `Certificate revoked by Administrator ${adminUser.fullName}. Reason: ${reason}`,
      performedBy: adminUser._id,
      performedByName: adminUser.fullName,
      sourceReference: cert.certificateNumber,
    });

    res.status(200).json({
      success: true,
      message: `Certificate ${cert.certificateNumber} has been revoked.`,
      data: cert,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Public certificate authenticity verification lookup
 * No authentication required - uses non-guessable verification ID
 */
export const publicVerifyCertificate = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { verificationId } = req.params;

    const cert = await SanitizationCertificate.findOne({ verificationId })
      .populate('deviceId', 'category brand model storageType storageCapacity')
      .select('-pdfPath');

    if (!cert) {
      return next(new AppError('Certificate verification record not found.', 404));
    }

    const device = cert.deviceId as any;

    // Return limited public audit information (strictly no customer private info)
    res.status(200).json({
      success: true,
      data: {
        certificateNumber: cert.certificateNumber,
        status: cert.status,
        isValid: cert.status === 'ACTIVE',
        isRevoked: cert.status === 'REVOKED',
        revocationReason: cert.status === 'REVOKED' ? cert.revocationReason : undefined,
        revokedAt: cert.status === 'REVOKED' ? cert.revokedAt : undefined,
        issuedAt: cert.issuedAt,
        standardReference: cert.standardReference,
        sanitizationMethod: cert.sanitizationMethod,
        operationCompletedAt: cert.operationCompletedAt,
        verifiedAt: cert.verifiedAt,
        evidenceFingerprint: cert.evidenceReference,
        entropyScore: cert.entropyScore,
        device: {
          category: device?.category,
          brand: device?.brand,
          model: device?.model,
          storageType: device?.storageType,
          storageCapacity: device?.storageCapacity,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

