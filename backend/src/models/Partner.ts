import mongoose, { Model, Schema, Types } from 'mongoose';

export type PartnerType = 'REFURBISHMENT' | 'RECYCLING';
export type PartnerStatus = 'PENDING_VERIFICATION' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface IPartnerAddress {
  street?: string;
  city?: string;
  state?: string;
  pinCode?: string;
}

export interface IPartner {
  _id: Types.ObjectId;
  partnerId: string;
  partnerType: PartnerType;
  partnerName: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: IPartnerAddress;
  services: string[];
  supportedCategories: string[];
  authorisationReference: string;
  verificationDocuments: string[];
  validityDates?: {
    validFrom?: Date;
    validTo?: Date;
  };
  status: PartnerStatus;
  internalNotes: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PartnerSchema = new Schema<IPartner>(
  {
    partnerId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    partnerType: {
      type: String,
      enum: ['REFURBISHMENT', 'RECYCLING'],
      required: true,
      index: true,
    },
    partnerName: {
      type: String,
      required: true,
      trim: true,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    contactPerson: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      pinCode: { type: String, default: '' },
    },
    services: {
      type: [String],
      default: [],
    },
    supportedCategories: {
      type: [String],
      default: ['Laptops', 'Desktops', 'Smartphones', 'Tablets'],
    },
    authorisationReference: {
      type: String,
      required: true,
      trim: true,
    },
    verificationDocuments: {
      type: [String],
      default: [],
    },
    validityDates: {
      validFrom: { type: Date },
      validTo: { type: Date },
    },
    status: {
      type: String,
      enum: ['PENDING_VERIFICATION', 'ACTIVE', 'INACTIVE', 'SUSPENDED'],
      default: 'ACTIVE',
      index: true,
    },
    internalNotes: {
      type: String,
      default: '',
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

// Performance compound index for partner registry lookups
PartnerSchema.index({ partnerType: 1, status: 1 });

const Partner: Model<IPartner> = mongoose.model<IPartner>('Partner', PartnerSchema);

export default Partner;

