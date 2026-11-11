import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export type DeviceCondition =
  | 'Like new'
  | 'Good'
  | 'Fair'
  | 'Damaged'
  | 'Not working'
  | 'Unknown';

export type DeviceClassification = 'A' | 'B' | 'C' | 'D' | 'PENDING';

export type DeviceStatus =
  | 'SUBMITTED'
  | 'PICKUP_SCHEDULED'
  | 'COLLECTION_CONFIRMED'
  | 'RECEIVED'
  | 'INSPECTION_PENDING'
  | 'INSPECTED'
  | 'SANITIZATION_PENDING'
  | 'SANITIZED'
  | 'REFURBISHMENT_PENDING'
  | 'IN_REFURBISHMENT'
  | 'REFURBISHED'
  | 'READY_FOR_RESALE'
  | 'LISTED_FOR_RESALE'
  | 'SOLD'
  | 'RECYCLING_PENDING'
  | 'TRANSFERRED_TO_RECYCLER'
  | 'RECYCLED';

export interface IDeviceInspection {
  physicalCondition?: string;
  powersOn?: boolean;
  storageType?: string;
  storageCapacity?: string;
  inspectionNotes?: string;
  reusePotential?: string;
  inspectedAt?: Date;
  inspectedBy?: Types.ObjectId;
}

export interface IDevice {
  _id: Types.ObjectId;
  deviceId: string;
  customerId: Types.ObjectId;
  category: string;
  brand: string;
  model: string;
  purchaseYear?: number | string;
  condition: DeviceCondition;
  powersOn: boolean;
  storageType?: string;
  storageCapacity?: string;
  description?: string;
  images: string[];
  inspection?: IDeviceInspection;
  classification: DeviceClassification;
  status: DeviceStatus;
  pickupRequestId?: Types.ObjectId;
  certificateId?: string;
  marketplaceListingId?: Types.ObjectId;
  refurbishmentJobId?: Types.ObjectId;
  recyclingRecordId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const DeviceSchema = new Schema<IDevice>(
  {
    deviceId: {
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
    category: {
      type: String,
      required: [true, 'Device category is required'],
      trim: true,
    },
    brand: {
      type: String,
      required: [true, 'Device brand is required'],
      trim: true,
    },
    model: {
      type: String,
      required: [true, 'Device model is required'],
      trim: true,
    },
    purchaseYear: {
      type: Schema.Types.Mixed,
      default: '',
    },
    condition: {
      type: String,
      enum: ['Like new', 'Good', 'Fair', 'Damaged', 'Not working', 'Unknown'],
      default: 'Good',
    },
    powersOn: {
      type: Boolean,
      default: true,
    },
    storageType: {
      type: String,
      trim: true,
      default: 'Unknown',
    },
    storageCapacity: {
      type: String,
      trim: true,
      default: 'Unknown',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    images: {
      type: [String],
      default: [],
    },
    inspection: {
      physicalCondition: { type: String, default: '' },
      powersOn: { type: Boolean, default: true },
      storageType: { type: String, default: '' },
      storageCapacity: { type: String, default: '' },
      inspectionNotes: { type: String, default: '' },
      reusePotential: { type: String, default: '' },
      inspectedAt: { type: Date },
      inspectedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    },
    classification: {
      type: String,
      enum: ['A', 'B', 'C', 'D', 'PENDING'],
      default: 'PENDING',
    },
    status: {
      type: String,
      enum: [
        'SUBMITTED',
        'PICKUP_SCHEDULED',
        'COLLECTION_CONFIRMED',
        'RECEIVED',
        'INSPECTION_PENDING',
        'INSPECTED',
        'SANITIZATION_PENDING',
        'SANITIZED',
        'REFURBISHMENT_PENDING',
        'IN_REFURBISHMENT',
        'REFURBISHED',
        'READY_FOR_RESALE',
        'LISTED_FOR_RESALE',
        'SOLD',
        'RECYCLING_PENDING',
        'TRANSFERRED_TO_RECYCLER',
        'RECYCLED',
      ],
      default: 'SUBMITTED',
      index: true,
    },
    pickupRequestId: {
      type: Schema.Types.ObjectId,
      ref: 'PickupRequest',
    },
    certificateId: {
      type: String,
    },
    marketplaceListingId: {
      type: Schema.Types.ObjectId,
      ref: 'MarketplaceListing',
    },
    refurbishmentJobId: {
      type: Schema.Types.ObjectId,
      ref: 'RefurbishmentJob',
    },
    recyclingRecordId: {
      type: Schema.Types.ObjectId,
      ref: 'RecyclingRecord',
    },
  },
  {
    timestamps: true,
  },
);

// Performance indexes for high-frequency queries
DeviceSchema.index({ customerId: 1, createdAt: -1 });
DeviceSchema.index({ classification: 1 });
DeviceSchema.index({ customerId: 1, status: 1 });

const Device: Model<IDevice> = mongoose.model<IDevice>('Device', DeviceSchema);

export default Device;
