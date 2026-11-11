import mongoose, { Model, Schema, Types } from 'mongoose';

export type EnquiryStatus = 'PENDING' | 'CONTACTED' | 'RESERVED' | 'COMPLETED' | 'CANCELLED';

export interface IMarketplaceEnquiry {
  _id: Types.ObjectId;
  enquiryId: string;
  listingId: Types.ObjectId;
  deviceId: Types.ObjectId;
  customerId: Types.ObjectId;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerMessage: string;
  offeredPrice?: number;
  enquiryStatus: EnquiryStatus;
  adminNotes?: string;
  respondedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MarketplaceEnquirySchema = new Schema<IMarketplaceEnquiry>(
  {
    enquiryId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    listingId: {
      type: Schema.Types.ObjectId,
      ref: 'MarketplaceListing',
      required: true,
      index: true,
    },
    deviceId: {
      type: Schema.Types.ObjectId,
      ref: 'Device',
      required: true,
      index: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    customerEmail: {
      type: String,
      required: true,
      trim: true,
    },
    customerPhone: {
      type: String,
      required: true,
      trim: true,
    },
    customerMessage: {
      type: String,
      required: true,
      trim: true,
    },
    offeredPrice: {
      type: Number,
      min: 0,
    },
    enquiryStatus: {
      type: String,
      enum: ['PENDING', 'CONTACTED', 'RESERVED', 'COMPLETED', 'CANCELLED'],
      default: 'PENDING',
      index: true,
    },
    adminNotes: {
      type: String,
      default: '',
    },
    respondedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

const MarketplaceEnquiry: Model<IMarketplaceEnquiry> =
  mongoose.model<IMarketplaceEnquiry>('MarketplaceEnquiry', MarketplaceEnquirySchema);

export default MarketplaceEnquiry;

