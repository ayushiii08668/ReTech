import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export type PickupStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'SCHEDULED'
  | 'COLLECTION_CONFIRMED'
  | 'RECEIVED'
  | 'CANCELLED';

export interface IStatusHistoryItem {
  status: PickupStatus;
  timestamp: Date;
  remarks?: string;
  updatedBy?: Types.ObjectId;
}

export interface IPickupRequest extends Document {
  requestId: string;
  customerId: Types.ObjectId;
  deviceId: Types.ObjectId;
  pickupAddress: string;
  city: string;
  state: string;
  pinCode: string;
  contactNumber: string;
  preferredDate: string;
  preferredTimeSlot: string;
  instructions?: string;
  status: PickupStatus;
  adminRemarks?: string;
  statusHistory: IStatusHistoryItem[];
  createdAt: Date;
  updatedAt: Date;
}

const PickupRequestSchema = new Schema<IPickupRequest>(
  {
    requestId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    deviceId: {
      type: Schema.Types.ObjectId,
      ref: 'Device',
      required: true,
      index: true,
    },
    pickupAddress: {
      type: String,
      required: [true, 'Pickup address is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
    },
    pinCode: {
      type: String,
      required: [true, 'PIN code is required'],
      trim: true,
    },
    contactNumber: {
      type: String,
      required: [true, 'Contact number is required'],
      trim: true,
    },
    preferredDate: {
      type: String,
      required: [true, 'Preferred pickup date is required'],
    },
    preferredTimeSlot: {
      type: String,
      required: [true, 'Preferred time slot is required'],
    },
    instructions: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: [
        'PENDING',
        'APPROVED',
        'REJECTED',
        'SCHEDULED',
        'COLLECTION_CONFIRMED',
        'RECEIVED',
        'CANCELLED',
      ],
      default: 'PENDING',
      index: true,
    },
    adminRemarks: {
      type: String,
      trim: true,
      default: '',
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        remarks: { type: String, default: '' },
        updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Performance indexes for logistics lookups
PickupRequestSchema.index({ customerId: 1, createdAt: -1 });
PickupRequestSchema.index({ status: 1, createdAt: -1 });

const PickupRequest: Model<IPickupRequest> = mongoose.model<IPickupRequest>(
  'PickupRequest',
  PickupRequestSchema,
);

export default PickupRequest;

