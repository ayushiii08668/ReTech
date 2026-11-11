import mongoose, { Model, Schema, Types } from 'mongoose';

export type CertificateStatus = 'ACTIVE' | 'REVOKED' | 'SUPERSEDED';

export interface ISanitizationCertificate {
  _id: Types.ObjectId;
  certificateNumber: string;
  verificationId: string;
  deviceId: Types.ObjectId;
  retechDeviceId: string;
  customerId: Types.ObjectId;
  sanitizationJobId: Types.ObjectId;
  sanitizationJobCode: string;
  sanitizationMethod: string;
  standardReference: string;
  operationCompletedAt: Date;
  verifiedAt: Date;
  issuedAt: Date;
  issuedBy: Types.ObjectId;
  issuedByName: string;
  verificationOutcome: string;
  evidenceReference: string;
  entropyScore?: number;
  sectorsSampled?: number;
  pdfPath?: string;
  pdfUrl?: string;
  status: CertificateStatus;
  revocationReason?: string;
  revokedAt?: Date;
  revokedBy?: Types.ObjectId;
  supersededBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SanitizationCertificateSchema = new Schema<ISanitizationCertificate>(
  {
    certificateNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    verificationId: {
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
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    sanitizationJobId: {
      type: Schema.Types.ObjectId,
      ref: 'SanitizationJob',
      required: true,
      index: true,
    },
    sanitizationJobCode: {
      type: String,
      required: true,
    },
    sanitizationMethod: {
      type: String,
      required: true,
    },
    standardReference: {
      type: String,
      default: 'NIST SP 800-88 Rev. 1 Guidelines for Media Sanitization',
    },
    operationCompletedAt: {
      type: Date,
      required: true,
    },
    verifiedAt: {
      type: Date,
      required: true,
    },
    issuedAt: {
      type: Date,
      default: Date.now,
    },
    issuedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    issuedByName: {
      type: String,
      default: 'Authorized ReTech Administrator',
    },
    verificationOutcome: {
      type: String,
      default: 'VERIFIED_SUCCESSFUL',
    },
    evidenceReference: {
      type: String,
      required: true,
    },
    entropyScore: {
      type: Number,
    },
    sectorsSampled: {
      type: Number,
      default: 1024,
    },
    pdfPath: {
      type: String,
    },
    pdfUrl: {
      type: String,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'REVOKED', 'SUPERSEDED'],
      default: 'ACTIVE',
      index: true,
    },
    revocationReason: {
      type: String,
      default: '',
    },
    revokedAt: {
      type: Date,
    },
    revokedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    supersededBy: {
      type: Schema.Types.ObjectId,
      ref: 'SanitizationCertificate',
    },
  },
  {
    timestamps: true,
  },
);

// Performance compound indexes for certificates ledger & customer verification
SanitizationCertificateSchema.index({ customerId: 1, status: 1 });
SanitizationCertificateSchema.index({ deviceId: 1, status: 1 });

const SanitizationCertificate: Model<ISanitizationCertificate> =
  mongoose.model<ISanitizationCertificate>(
    'SanitizationCertificate',
    SanitizationCertificateSchema,
  );

export default SanitizationCertificate;

