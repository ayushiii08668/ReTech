import { Response, NextFunction } from 'express';
import crypto from 'crypto';
import SanitizationJob, { SanitizationJobStatus } from '../models/SanitizationJob.js';
import Agent, { AgentStatus } from '../models/Agent.js';
import Device from '../models/Device.js';
import { getNextId } from '../models/Counter.js';
import AppError from '../utils/AppError.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

/**
 * Get aggregated sanitization dashboard analytics
 */
export const getSanitizationDashboardStats = async (
  _req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // 60-second heartbeat threshold for agent online status
    const onlineThreshold = new Date(Date.now() - 60 * 1000);

    const [
      totalJobs,
      runningJobs,
      verifiedSuccessfulJobs,
      pendingVerificationJobs,
      failedJobs,
      activeAgentsCount,
      recentJobs,
      methodBreakdown,
    ] = await Promise.all([
      SanitizationJob.countDocuments(),
      SanitizationJob.countDocuments({ status: 'RUNNING' }),
      SanitizationJob.countDocuments({ status: 'VERIFIED_SUCCESSFUL' }),
      SanitizationJob.countDocuments({
        status: { $in: ['PENDING', 'AGENT_CONNECTED', 'AWAITING_DEVICE_CONFIRMATION', 'READY_TO_START', 'VERIFICATION_PENDING'] },
      }),
      SanitizationJob.countDocuments({
        status: { $in: ['OPERATION_FAILED', 'VERIFICATION_FAILED', 'NOT_SUPPORTED'] },
      }),
      Agent.countDocuments({
        status: 'ONLINE',
        lastSeenAt: { $gte: onlineThreshold },
      }),
      SanitizationJob.find()
        .sort({ createdAt: -1 })
        .limit(6)
        .populate('deviceId', 'deviceId category brand model'),
      SanitizationJob.aggregate([
        { $group: { _id: '$selectedMethod', count: { $sum: 1 } } },
      ]),
    ]);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalJobs,
          runningJobs,
          verifiedSuccessfulJobs,
          pendingVerificationJobs,
          failedJobs,
          activeAgentsCount,
        },
        recentJobs,
        methodBreakdown,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get paginated list of sanitization jobs with search & filter
 */
export const getSanitizationJobs = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const search = (req.query.search as string)?.trim();
    const status = (req.query.status as string)?.trim();
    const method = (req.query.method as string)?.trim();
    const isSimulation = req.query.isSimulation;

    const query: Record<string, any> = {};

    if (search) {
      query.$or = [
        { jobId: { $regex: search, $options: 'i' } },
        { retechDeviceId: { $regex: search, $options: 'i' } },
        { targetDriveModel: { $regex: search, $options: 'i' } },
        { targetDriveId: { $regex: search, $options: 'i' } },
      ];
    }

    if (status && status !== 'ALL') {
      query.status = status;
    }

    if (method && method !== 'ALL') {
      query.selectedMethod = method;
    }

    if (isSimulation !== undefined && isSimulation !== 'ALL') {
      query.isSimulation = isSimulation === 'true';
    }

    const skip = (page - 1) * limit;

    const [jobs, total] = await Promise.all([
      SanitizationJob.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('deviceId', 'deviceId category brand model condition storageType storageCapacity')
        .populate('agentId', 'agentId name hostname platform status'),
      SanitizationJob.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: {
        jobs,
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
 * Get single sanitization job by ID with full logs and details
 */
export const getSanitizationJobById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;

    let query: any = { jobId: id };
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      query = { $or: [{ _id: id }, { jobId: id }] };
    }

    const job = await SanitizationJob.findOne(query)
      .populate('deviceId')
      .populate('agentId', 'agentId name hostname platform status lastSeenAt')
      .populate('authorizedBy', 'name email role');

    if (!job) {
      return next(new AppError(`Sanitization job ${id} not found`, 404));
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
 * Create a new sanitization job for an inspected device
 */
export const createSanitizationJob = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = req.user!;
    const {
      deviceId,
      targetDriveId,
      targetDriveModel,
      targetStorageType,
      targetCapacity,
      selectedMethod,
      sanitizationStandard,
      reason,
      isSimulation,
      agentId,
      confirmAuthorization,
    } = req.body;

    if (!deviceId) {
      return next(new AppError('Device selection is required to initiate sanitization.', 400));
    }

    if (!confirmAuthorization) {
      return next(
        new AppError('Explicit administrator authorization confirmation is required for sanitization.', 400),
      );
    }

    const device = await Device.findById(deviceId);
    if (!device) {
      return next(new AppError('Device not found in inventory.', 404));
    }

    // Determine initial status based on agent assignment
    let initialStatus: SanitizationJobStatus = 'PENDING';
    let assignedAgentDoc = null;

    if (agentId) {
      assignedAgentDoc = await Agent.findOne({
        $or: [{ _id: agentId }, { agentId }],
      });
      if (assignedAgentDoc && assignedAgentDoc.status === 'ONLINE') {
        initialStatus = 'AGENT_CONNECTED';
      }
    }

    const jobId = await getNextId('SAN');

    const newJob = await SanitizationJob.create({
      jobId,
      deviceId: device._id,
      retechDeviceId: device.deviceId,
      agentId: assignedAgentDoc?._id,
      agentCode: assignedAgentDoc?.agentId,
      targetDriveId: targetDriveId || 'PhysicalDrive1',
      targetDriveModel: targetDriveModel || `${device.brand} ${device.model} Internal Drive`,
      targetStorageType: targetStorageType || device.storageType || 'SSD',
      targetCapacity: targetCapacity || device.storageCapacity || 'Unknown',
      selectedMethod: selectedMethod || 'NIST_SP_800_88_CLEAR',
      sanitizationStandard: sanitizationStandard || 'NIST SP 800-88 Rev. 1 Clear',
      reason: reason || 'Hardware sanitized prior to resale or certified recycling.',
      authorizedBy: user._id,
      authorizedByName: user.fullName,
      authorizationConfirmedAt: new Date(),
      status: initialStatus,
      isSimulation: Boolean(isSimulation),
      progressPercent: 0,
      executionLogs: [
        {
          timestamp: new Date(),
          level: 'INFO',
          message: `Sanitization task authorized by Admin ${user.fullName} (${user.email}). Method: ${selectedMethod}. Standard: ${sanitizationStandard || 'NIST SP 800-88'}.${isSimulation ? ' [DRY RUN / SIMULATION MODE]' : ''}`,
        },
      ],
      statusHistory: [
        {
          status: initialStatus,
          timestamp: new Date(),
          note: `Sanitization job initialized by ${user.fullName}`,
        },
      ],
    });

    // Update device status to reflect active sanitization workflow
    await Device.findByIdAndUpdate(device._id, {
      status: 'SANITIZATION_PENDING',
    });

    res.status(201).json({
      success: true,
      message: `Sanitization job ${jobId} created successfully.`,
      data: newJob,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel a pending or queued sanitization job
 */
export const cancelSanitizationJob = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    let query: any = { jobId: id };
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      query = { $or: [{ _id: id }, { jobId: id }] };
    }

    const job = await SanitizationJob.findOne(query);

    if (!job) {
      return next(new AppError(`Job ${id} not found`, 404));
    }

    if (['RUNNING', 'VERIFIED_SUCCESSFUL'].includes(job.status)) {
      return next(
        new AppError(`Cannot cancel job in ${job.status} status.`, 400),
      );
    }

    job.status = 'CANCELLED';
    job.executionLogs.push({
      timestamp: new Date(),
      level: 'WARN',
      message: `Job cancelled by admin: ${reason || 'Administrator cancelled the sanitization task.'}`,
    });
    job.statusHistory.push({
      status: 'CANCELLED',
      timestamp: new Date(),
      note: reason || 'Cancelled by admin',
    });

    await job.save();

    res.status(200).json({
      success: true,
      message: `Job ${job.jobId} cancelled.`,
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all registered agents
 */
export const getAgents = async (
  _req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const onlineThreshold = new Date(Date.now() - 60 * 1000);

    // Refresh status for agents not seen within heartbeat window
    await Agent.updateMany(
      {
        status: 'ONLINE',
        lastSeenAt: { $lt: onlineThreshold },
      },
      {
        status: 'OFFLINE',
      },
    );

    const agents = await Agent.find().sort({ lastSeenAt: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: agents.length,
      data: agents,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate a single-use 15-minute pairing code for local sanitization agent setup
 */
export const generatePairingCode = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = req.user!;
    const agentCode = await getNextId('AGT');

    // Generate readable code, e.g. PAIR-9X2K-4M7L
    const randomHex = crypto.randomBytes(4).toString('hex').toUpperCase();
    const pairingCode = `PAIR-${randomHex.slice(0, 4)}-${randomHex.slice(4, 8)}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    const newAgent = await Agent.create({
      agentId: agentCode,
      name: `Agent Node ${agentCode.split('-').pop()}`,
      status: 'PAIRING_PENDING',
      pairingCode,
      pairingCodeExpires: expiresAt,
      pairedBy: user._id,
      lastSeenAt: new Date(),
    });

    res.status(201).json({
      success: true,
      message: 'Single-use pairing code generated. Use within 15 minutes.',
      data: {
        agentId: newAgent.agentId,
        pairingCode,
        expiresAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Revoke agent authorization
 */
export const revokeAgent = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;

    let query: any = { agentId: id };
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      query = { $or: [{ _id: id }, { agentId: id }] };
    }

    const agent = await Agent.findOne(query);

    if (!agent) {
      return next(new AppError(`Agent ${id} not found`, 404));
    }

    agent.status = 'REVOKED';
    agent.apiKeyHash = undefined;
    await agent.save();

    res.status(200).json({
      success: true,
      message: `Agent ${agent.agentId} access has been revoked.`,
      data: agent,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Permanently delete / remove an agent node from the system
 */
export const deleteAgent = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;

    let query: any = { agentId: id };
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      query = { $or: [{ _id: id }, { agentId: id }] };
    }

    const agent = await Agent.findOneAndDelete(query);

    if (!agent) {
      return next(new AppError(`Agent ${id} not found`, 404));
    }

    res.status(200).json({
      success: true,
      message: `Agent ${agent.agentId} (${agent.name}) was permanently deleted.`,
      data: { agentId: agent.agentId },
    });
  } catch (error) {
    next(error);
  }
};
