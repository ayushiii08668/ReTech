import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import Agent from '../models/Agent.js';
import SanitizationJob, { SanitizationJobStatus } from '../models/SanitizationJob.js';
import Device from '../models/Device.js';
import AppError from '../utils/AppError.js';
import { AgentRequest } from '../middleware/agentAuth.js';

/**
 * Agent pairing endpoint - exchanges single-use pairing code for scoped agent API key
 */
export const pairAgent = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const {
      pairingCode,
      name,
      hostname,
      platform,
      agentVersion,
      supportedCapabilities,
      discoveredDrives,
    } = req.body;

    if (!pairingCode) {
      return next(new AppError('Pairing code is required.', 400));
    }

    const normalizedCode = pairingCode.trim().toUpperCase();

    // Look for agent with matching pairing code that hasn't expired
    const agent = await Agent.findOne({
      pairingCode: normalizedCode,
      pairingCodeExpires: { $gt: new Date() },
      status: 'PAIRING_PENDING',
    }).select('+pairingCode +pairingCodeExpires +apiKeyHash');

    if (!agent) {
      return next(
        new AppError('Invalid or expired pairing code. Please generate a new code in the admin dashboard.', 400),
      );
    }

    // Generate secure API key
    const rawApiKey = `ret_agt_${crypto.randomBytes(24).toString('hex')}`;
    const apiKeyHash = crypto.createHash('sha256').update(rawApiKey).digest('hex');

    // Update agent record
    if (name) agent.name = name;
    if (hostname) agent.hostname = hostname;
    if (platform) agent.platform = platform;
    if (agentVersion) agent.agentVersion = agentVersion;
    if (supportedCapabilities && Array.isArray(supportedCapabilities)) {
      agent.supportedCapabilities = supportedCapabilities;
    }
    if (discoveredDrives && Array.isArray(discoveredDrives)) {
      agent.discoveredDrives = discoveredDrives;
    }

    agent.apiKeyHash = apiKeyHash;
    agent.status = 'ONLINE';
    agent.lastSeenAt = new Date();
    agent.pairedAt = new Date();
    agent.pairingCode = undefined;
    agent.pairingCodeExpires = undefined;

    await agent.save();

    res.status(200).json({
      success: true,
      message: 'Agent paired successfully. Store the API key securely.',
      data: {
        agentId: agent.agentId,
        name: agent.name,
        apiKey: rawApiKey,
        status: agent.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Agent heartbeat endpoint - periodic health ping & live drive discovery report
 */
export const agentHeartbeat = async (
  req: AgentRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const agent = req.agent;
    if (!agent) {
      return next(new AppError('Agent not authenticated', 401));
    }

    const { hostname, platform, agentVersion, supportedCapabilities, discoveredDrives } = req.body;

    // Refresh agent document from DB to persist changes
    const dbAgent = await Agent.findById(agent._id);
    if (!dbAgent) {
      return next(new AppError('Agent not found', 404));
    }

    if (hostname) dbAgent.hostname = hostname;
    if (platform) dbAgent.platform = platform;
    if (agentVersion) dbAgent.agentVersion = agentVersion;
    if (supportedCapabilities && Array.isArray(supportedCapabilities)) {
      dbAgent.supportedCapabilities = supportedCapabilities;
    }
    if (discoveredDrives && Array.isArray(discoveredDrives)) {
      dbAgent.discoveredDrives = discoveredDrives;
    }

    dbAgent.status = 'ONLINE';
    dbAgent.lastSeenAt = new Date();
    await dbAgent.save();

    res.status(200).json({
      success: true,
      message: 'Heartbeat acknowledged',
      data: {
        agentId: dbAgent.agentId,
        status: dbAgent.status,
        timestamp: dbAgent.lastSeenAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get active sanitization jobs available for this agent
 */
export const getAgentJobs = async (
  req: AgentRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const agent = req.agent!;

    // Find jobs either assigned to this agent or pending assignment
    const jobs = await SanitizationJob.find({
      $or: [
        { agentId: agent._id },
        { agentCode: agent.agentId },
        {
          status: { $in: ['PENDING', 'AGENT_CONNECTED'] },
          agentId: { $exists: false },
        },
      ],
      status: {
        $in: [
          'PENDING',
          'AGENT_OFFLINE',
          'AGENT_CONNECTED',
          'AWAITING_DEVICE_CONFIRMATION',
          'READY_TO_START',
          'RUNNING',
        ],
      },
    })
      .sort({ createdAt: -1 })
      .populate('deviceId', 'deviceId category brand model storageType storageCapacity condition');

    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Claim a sanitization job
 */
export const claimJob = async (
  req: AgentRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const agent = req.agent!;
    const { jobId } = req.params;

    const job = await SanitizationJob.findOne({ jobId });
    if (!job) {
      return next(new AppError(`Sanitization job ${jobId} not found.`, 404));
    }

    if (
      job.status !== 'PENDING' &&
      job.status !== 'AGENT_OFFLINE' &&
      job.status !== 'AGENT_CONNECTED'
    ) {
      return next(
        new AppError(`Job ${jobId} cannot be claimed in its current status (${job.status}).`, 400),
      );
    }

    // Assign agent
    job.agentId = agent._id;
    job.agentCode = agent.agentId;
    job.status = 'READY_TO_START';

    const claimLog = {
      timestamp: new Date(),
      level: 'INFO' as const,
      message: `Job claimed by agent ${agent.name} (${agent.agentId}) on host ${agent.hostname}. Prepared for sanitization execution.`,
    };
    job.executionLogs.push(claimLog);

    job.statusHistory.push({
      status: 'READY_TO_START',
      timestamp: new Date(),
      note: `Claimed by agent ${agent.agentId}`,
    });

    await job.save();

    res.status(200).json({
      success: true,
      message: `Job ${jobId} claimed successfully by ${agent.name}`,
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Report execution progress and streaming log events
 */
export const reportJobEvents = async (
  req: AgentRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { jobId } = req.params;
    const { status, progressPercent, logs } = req.body;

    const job = await SanitizationJob.findOne({ jobId });
    if (!job) {
      return next(new AppError(`Sanitization job ${jobId} not found.`, 404));
    }

    if (status) {
      job.status = status as SanitizationJobStatus;
      if (status === 'RUNNING' && !job.startedAt) {
        job.startedAt = new Date();
      }
      job.statusHistory.push({
        status: status as SanitizationJobStatus,
        timestamp: new Date(),
        note: `Status updated by agent during execution`,
      });
    }

    if (typeof progressPercent === 'number') {
      job.progressPercent = Math.min(100, Math.max(0, Math.round(progressPercent)));
    }

    if (Array.isArray(logs) && logs.length > 0) {
      for (const logItem of logs) {
        job.executionLogs.push({
          timestamp: logItem.timestamp ? new Date(logItem.timestamp) : new Date(),
          level: logItem.level || 'INFO',
          message: logItem.message || '',
        });
      }
    }

    await job.save();

    res.status(200).json({
      success: true,
      message: 'Job events recorded',
      data: {
        jobId: job.jobId,
        status: job.status,
        progressPercent: job.progressPercent,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Report final sanitization results & cryptographic verification evidence
 */
export const reportJobResults = async (
  req: AgentRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { jobId } = req.params;
    const { status, verificationResult, logs, failureReason } = req.body;

    const job = await SanitizationJob.findOne({ jobId });
    if (!job) {
      return next(new AppError(`Sanitization job ${jobId} not found.`, 404));
    }

    job.status = status as SanitizationJobStatus;
    job.completedAt = new Date();

    if (typeof job.progressPercent === 'number' && status === 'VERIFIED_SUCCESSFUL') {
      job.progressPercent = 100;
    }

    if (Array.isArray(logs) && logs.length > 0) {
      for (const logItem of logs) {
        job.executionLogs.push({
          timestamp: logItem.timestamp ? new Date(logItem.timestamp) : new Date(),
          level: logItem.level || 'INFO',
          message: logItem.message || '',
        });
      }
    }

    if (failureReason) {
      job.failureReason = failureReason;
    }

    if (verificationResult) {
      const year = new Date().getFullYear();
      const certificateId = `CERT-${year}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

      job.verificationResult = {
        verified: Boolean(verificationResult.verified),
        methodUsed: verificationResult.methodUsed || job.selectedMethod,
        entropyScore: verificationResult.entropyScore,
        sectorsSampled: verificationResult.sectorsSampled,
        sectorsVerifiedClean: verificationResult.sectorsVerifiedClean,
        sha256VerificationHash: verificationResult.sha256VerificationHash,
        verificationTimestamp: new Date(),
        certificateId,
        notes: verificationResult.notes || 'Automated hardware sector verification completed.',
      };

      job.executionLogs.push({
        timestamp: new Date(),
        level: verificationResult.verified ? 'SUCCESS' : 'ERROR',
        message: verificationResult.verified
          ? `Cryptographic verification PASSED. SHA-256 hash: ${verificationResult.sha256VerificationHash}. Certificate issued: ${certificateId}`
          : `Cryptographic verification FAILED. Residual data detected during sampling.`,
      });
    }

    job.statusHistory.push({
      status: job.status,
      timestamp: new Date(),
      note: `Execution finalized with status: ${job.status}`,
    });

    await job.save();

    // Cross-update associated device status in ReTech inventory
    if (status === 'VERIFIED_SUCCESSFUL') {
      await Device.findByIdAndUpdate(job.deviceId, {
        status: 'SANITIZED',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Sanitization results and verification recorded successfully',
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

