import mongoose, { Model, Schema, Types } from 'mongoose';

export type ListingStatus = 'DRAFT' | 'PUBLISHED' | 'UNPUBLISHED' | 'SOLD' | 'RESERVED';
export type ListingAvailability = 'AVAILABLE' | 'RESERVED' | 'SOLD';

export interface IListingSpecifications {
  processor?: string;
  ram?: string;
  storage?: string;
  screenSize?: string;
  operatingSystem?: string;
  graphics?: string;
  batteryHealth?: string;
  color?: string;
  [key: string]: any;
}

export interface IMarketplaceListing {
  _id: Types.ObjectId;
  listingId: string;
  deviceId: Types.ObjectId;
  retechDeviceId: string;
  title: string;
  description: string;
  category: string;
  brand: string;
  model: string;
  specifications: IListingSpecifications;
  images: string[];
  condition: 'Like new' | 'Good' | 'Fair';
  refurbishmentStatus: string;
  price: number;
  originalEstimatedValue?: number;
  warrantyInformation: string;
  listingStatus: ListingStatus;
  availability: ListingAvailability;
  publishedAt?: Date;
  soldAt?: Date;
  soldPrice?: number;
  buyerName?: string;
  buyerContact?: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const MarketplaceListingSchema = new Schema<IMarketplaceListing>(
  {
    listingId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    deviceId: {
      type: Schema.Types.ObjectId,
      ref: 'Device',
      required: true,
      unique: true, // Prevents duplicate active listings for the same device
      index: true,
    },
    retechDeviceId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    brand: {
      type: String,
      required: true,
      trim: true,
    },
    model: {
      type: String,
      required: true,
      trim: true,
    },
    specifications: {
      processor: { type: String, default: '' },
      ram: { type: String, default: '' },
      storage: { type: String, default: '' },
      screenSize: { type: String, default: '' },
      operatingSystem: { type: String, default: '' },
      graphics: { type: String, default: '' },
      batteryHealth: { type: String, default: '' },
      color: { type: String, default: '' },
    },
    images: {
      type: [String],
      default: [],
    },
    condition: {
      type: String,
      enum: ['Like new', 'Good', 'Fair'],
      default: 'Good',
    },
    refurbishmentStatus: {
      type: String,
      default: 'Certified Inspected & Data Sanitized',
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    originalEstimatedValue: {
      type: Number,
      min: 0,
    },
    warrantyInformation: {
      type: String,
      default: '90-Day ReTech Certified Functional Warranty',
    },
    listingStatus: {
      type: String,
      enum: ['DRAFT', 'PUBLISHED', 'UNPUBLISHED', 'SOLD', 'RESERVED'],
      default: 'PUBLISHED',
      index: true,
    },
    availability: {
      type: String,
      enum: ['AVAILABLE', 'RESERVED', 'SOLD'],
      default: 'AVAILABLE',
      index: true,
    },
    publishedAt: {
      type: Date,
      default: Date.now,
    },
    soldAt: {
      type: Date,
    },
    soldPrice: {
      type: Number,
    },
    buyerName: {
      type: String,
    },
    buyerContact: {
      type: String,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Performance compound indexes for resale marketplace discovery & administration
MarketplaceListingSchema.index({ listingStatus: 1, availability: 1, publishedAt: -1 });
MarketplaceListingSchema.index({ deviceId: 1, listingStatus: 1 });

const MarketplaceListing: Model<IMarketplaceListing> =
  mongoose.model<IMarketplaceListing>('MarketplaceListing', MarketplaceListingSchema);

export default MarketplaceListing;

