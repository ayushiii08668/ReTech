import mongoose, { Model, Schema, Types } from 'mongoose';

export type RecyclingStatus =
  | 'PENDING_APPROVAL'
  | 'APPROVED_FOR_RECYCLING'
  | 'READY_FOR_TRANSFER'
  | 'TRANSFERRED'
  | 'RECEIVED_BY_RECYCLER'
  | 'PROCESSING'
  | 'RECYCLED'
  | 'REJECTED';

export interface IRecyclingRecord {
  _id: Types.ObjectId;
  recordId: string;
  deviceId: Types.ObjectId;
  retechDeviceId: string;
  recyclerId: Types.ObjectId;
  recyclerName?: string;
  createdBy: Types.ObjectId;
  createdByName?: string;
  transferDate: Date;
  deviceCategory: string;
  approximateWeightKg?: number;
  handoverReference: string;
  handoverReceipt?: string;
  recyclerAcknowledgement?: string;
  processingStatus: RecyclingStatus;
  finalOutcome?: string;
  processingEvidence?: string;
  internalNotes?: string;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const RecyclingRecordSchema = new Schema<IRecyclingRecord>(
  {
    recordId: {
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
    recyclerId: {
      type: Schema.Types.ObjectId,
      ref: 'Partner',
      required: true,
      index: true,
    },
    recyclerName: {
      type: String,
      default: '',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    createdByName: {
      type: String,
      default: '',
    },
    transferDate: {
      type: Date,
      default: Date.now,
    },
    deviceCategory: {
      type: String,
      required: true,
    },
    approximateWeightKg: {
      type: Number,
      min: 0,
    },
    handoverReference: {
      type: String,
      required: true,
      trim: true,
    },
    handoverReceipt: {
      type: String,
      default: '',
    },
    recyclerAcknowledgement: {
      type: String,
      default: '',
    },
    processingStatus: {
      type: String,
      enum: [
        'PENDING_APPROVAL',
        'APPROVED_FOR_RECYCLING',
        'READY_FOR_TRANSFER',
        'TRANSFERRED',
        'RECEIVED_BY_RECYCLER',
        'PROCESSING',
        'RECYCLED',
        'REJECTED',
      ],
      default: 'APPROVED_FOR_RECYCLING',
      index: true,
    },
    finalOutcome: {
      type: String,
      default: '',
    },
    processingEvidence: {
      type: String,
      default: '',
    },
    internalNotes: {
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

// Performance compound index for recycler transfer manifests
RecyclingRecordSchema.index({ recyclerId: 1, processingStatus: 1 });
RecyclingRecordSchema.index({ deviceId: 1, processingStatus: 1 });

const RecyclingRecord: Model<IRecyclingRecord> =
  mongoose.model<IRecyclingRecord>('RecyclingRecord', RecyclingRecordSchema);

export default RecyclingRecord;

