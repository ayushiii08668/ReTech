import mongoose, { Model, Schema, Types } from 'mongoose';

export type RefurbishmentStatus =
  | 'NOT_REQUIRED'
  | 'PENDING_ASSIGNMENT'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'QUALITY_CHECK'
  | 'COMPLETED'
  | 'FAILED'
  | 'RETURNED';

export interface IRefurbishmentJob {
  _id: Types.ObjectId;
  jobId: string;
  deviceId: Types.ObjectId;
  retechDeviceId: string;
  partnerId: Types.ObjectId;
  partnerName?: string;
  assignedBy: Types.ObjectId;
  assignedByName?: string;
  assignmentDate: Date;
  expectedCompletionDate?: Date;
  instructions: string;
  status: RefurbishmentStatus;
  inspectionFindings: string;
  replacedComponents: string[];
  refurbishmentCost: number;
  supportingDocuments: string[];
  finalOutcome?: string;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const RefurbishmentJobSchema = new Schema<IRefurbishmentJob>(
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
    partnerId: {
      type: Schema.Types.ObjectId,
      ref: 'Partner',
      required: true,
      index: true,
    },
    partnerName: {
      type: String,
      default: '',
    },
    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedByName: {
      type: String,
      default: '',
    },
    assignmentDate: {
      type: Date,
      default: Date.now,
    },
    expectedCompletionDate: {
      type: Date,
    },
    instructions: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: [
        'NOT_REQUIRED',
        'PENDING_ASSIGNMENT',
        'ASSIGNED',
        'IN_PROGRESS',
        'QUALITY_CHECK',
        'COMPLETED',
        'FAILED',
        'RETURNED',
      ],
      default: 'ASSIGNED',
      index: true,
    },
    inspectionFindings: {
      type: String,
      default: '',
    },
    replacedComponents: {
      type: [String],
      default: [],
    },
    refurbishmentCost: {
      type: Number,
      default: 0,
      min: 0,
    },
    supportingDocuments: {
      type: [String],
      default: [],
    },
    finalOutcome: {
      type: String,
      default: '',
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

// Performance compound index for workshop job management
RefurbishmentJobSchema.index({ partnerId: 1, status: 1 });
RefurbishmentJobSchema.index({ deviceId: 1, status: 1 });

const RefurbishmentJob: Model<IRefurbishmentJob> =
  mongoose.model<IRefurbishmentJob>('RefurbishmentJob', RefurbishmentJobSchema);

export default RefurbishmentJob;

