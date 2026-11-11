import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export type SanitizationJobStatus =
  | 'PENDING'
  | 'AGENT_OFFLINE'
  | 'AGENT_CONNECTED'
  | 'AWAITING_DEVICE_CONFIRMATION'
  | 'READY_TO_START'
  | 'RUNNING'
  | 'OPERATION_COMPLETED'
  | 'VERIFICATION_PENDING'
  | 'VERIFIED_SUCCESSFUL'
  | 'VERIFICATION_FAILED'
  | 'OPERATION_FAILED'
  | 'NOT_SUPPORTED'
  | 'CANCELLED';

export interface IExecutionLog {
  timestamp: Date;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG' | 'SUCCESS';
  message: string;
}

export interface IVerificationResult {
  verified: boolean;
  methodUsed: string;
  entropyScore?: number;
  sectorsSampled?: number;
  sectorsVerifiedClean?: number;
  sha256VerificationHash: string;
  verificationTimestamp: Date;
  certificateId?: string;
  notes?: string;
}

export interface IStatusHistoryItem {
  status: SanitizationJobStatus;
  timestamp: Date;
  note?: string;
}

export interface ISanitizationJob {
  _id: Types.ObjectId;
  jobId: string;
  deviceId: Types.ObjectId;
  retechDeviceId: string;
  agentId?: Types.ObjectId;
  agentCode?: string;
  targetDriveId: string;
  targetDriveModel?: string;
  targetStorageType?: string;
  targetCapacity?: string;
  selectedMethod: string;
  sanitizationStandard: string;
  reason?: string;
  authorizedBy: Types.ObjectId;
  authorizedByName?: string;
  authorizationConfirmedAt: Date;
  status: SanitizationJobStatus;
  isSimulation: boolean;
  progressPercent: number;
  startedAt?: Date;
  completedAt?: Date;
  executionLogs: IExecutionLog[];
  verificationResult?: IVerificationResult;
  failureReason?: string;
  statusHistory: IStatusHistoryItem[];
  createdAt: Date;
  updatedAt: Date;
}

const ExecutionLogSchema = new Schema<IExecutionLog>(
  {
    timestamp: { type: Date, default: Date.now },
    level: {
      type: String,
      enum: ['INFO', 'WARN', 'ERROR', 'DEBUG', 'SUCCESS'],
      default: 'INFO',
    },
    message: { type: String, required: true },
  },
  { _id: false },
);

const StatusHistorySchema = new Schema<IStatusHistoryItem>(
  {
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    note: { type: String, default: '' },
  },
  { _id: false },
);

const VerificationResultSchema = new Schema<IVerificationResult>(
  {
    verified: { type: Boolean, required: true },
    methodUsed: { type: String, required: true },
    entropyScore: { type: Number },
    sectorsSampled: { type: Number },
    sectorsVerifiedClean: { type: Number },
    sha256VerificationHash: { type: String, required: true },
    verificationTimestamp: { type: Date, default: Date.now },
    certificateId: { type: String },
    notes: { type: String, default: '' },
  },
  { _id: false },
);

const SanitizationJobSchema = new Schema<ISanitizationJob>(
  {
    jobId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    deviceId: {
      type: Schema.Types.ObjectId,
      ref: 'Device',
      required: true,
      index: true,
    },
    retechDeviceId: {
      type: String,
      required: true,
      index: true,
    },
    agentId: {
      type: Schema.Types.ObjectId,
      ref: 'Agent',
      index: true,
    },
    agentCode: {
      type: String,
      index: true,
    },
    targetDriveId: {
      type: String,
      required: true,
    },
    targetDriveModel: {
      type: String,
      default: 'Unknown Drive',
    },
    targetStorageType: {
      type: String,
      default: 'Unknown',
    },
    targetCapacity: {
      type: String,
      default: 'Unknown',
    },
    selectedMethod: {
      type: String,
      required: true,
    },
    sanitizationStandard: {
      type: String,
      default: 'NIST SP 800-88 Rev. 1',
    },
    reason: {
      type: String,
      default: 'Authorized hardware sanitization before reuse/refurbishing',
    },
    authorizedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    authorizedByName: {
      type: String,
      default: 'Authorized Admin',
    },
    authorizationConfirmedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: [
        'PENDING',
        'AGENT_OFFLINE',
        'AGENT_CONNECTED',
        'AWAITING_DEVICE_CONFIRMATION',
        'READY_TO_START',
        'RUNNING',
        'OPERATION_COMPLETED',
        'VERIFICATION_PENDING',
        'VERIFIED_SUCCESSFUL',
        'VERIFICATION_FAILED',
        'OPERATION_FAILED',
        'NOT_SUPPORTED',
        'CANCELLED',
      ],
      default: 'PENDING',
      index: true,
    },
    isSimulation: {
      type: Boolean,
      default: false,
    },
    progressPercent: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    startedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    executionLogs: {
      type: [ExecutionLogSchema],
      default: [],
    },
    verificationResult: {
      type: VerificationResultSchema,
    },
    failureReason: {
      type: String,
      default: '',
    },
    statusHistory: {
      type: [StatusHistorySchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

// Performance compound indexes for sanitization lookups
SanitizationJobSchema.index({ deviceId: 1, status: 1 });
SanitizationJobSchema.index({ agentId: 1, status: 1 });

const SanitizationJob: Model<ISanitizationJob> = mongoose.model<ISanitizationJob>(
  'SanitizationJob',
  SanitizationJobSchema,
);

export default SanitizationJob;

