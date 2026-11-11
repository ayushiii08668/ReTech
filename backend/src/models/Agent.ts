import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export type AgentStatus = 'ONLINE' | 'OFFLINE' | 'REVOKED' | 'PAIRING_PENDING';

export interface IDiscoveredDrive {
  driveId: string;
  model: string;
  serialNumber?: string;
  capacityBytes?: number;
  capacityFormatted?: string;
  storageType?: string;
  interfaceType?: string;
  isSystemDrive: boolean;
  isRemovable: boolean;
  supportedMethods: string[];
}

export interface IAgent {
  _id: Types.ObjectId;
  agentId: string;
  name: string;
  hostname: string;
  platform: string;
  agentVersion: string;
  status: AgentStatus;
  pairingCode?: string;
  pairingCodeExpires?: Date;
  apiKeyHash?: string;
  supportedCapabilities: string[];
  discoveredDrives: IDiscoveredDrive[];
  lastSeenAt: Date;
  pairedBy?: Types.ObjectId;
  pairedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AgentSchema = new Schema<IAgent>(
  {
    agentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    hostname: {
      type: String,
      default: 'Unknown-Host',
    },
    platform: {
      type: String,
      default: 'Unknown-OS',
    },
    agentVersion: {
      type: String,
      default: '1.0.0',
    },
    status: {
      type: String,
      enum: ['ONLINE', 'OFFLINE', 'REVOKED', 'PAIRING_PENDING'],
      default: 'PAIRING_PENDING',
      index: true,
    },
    pairingCode: {
      type: String,
      select: false,
    },
    pairingCodeExpires: {
      type: Date,
      select: false,
    },
    apiKeyHash: {
      type: String,
      select: false,
    },
    supportedCapabilities: {
      type: [String],
      default: [
        'NIST_SP_800_88_CLEAR',
        'NIST_SP_800_88_PURGE',
        'ZERO_OVERWRITE',
        'RANDOM_OVERWRITE',
        'NVME_CRYPTO_ERASE',
        'DRY_RUN_SIMULATION',
      ],
    },
    discoveredDrives: [
      {
        driveId: { type: String, required: true },
        model: { type: String, default: 'Generic Drive' },
        serialNumber: { type: String, default: '' },
        capacityBytes: { type: Number, default: 0 },
        capacityFormatted: { type: String, default: 'Unknown' },
        storageType: { type: String, default: 'Unknown' },
        interfaceType: { type: String, default: 'Unknown' },
        isSystemDrive: { type: Boolean, default: false },
        isRemovable: { type: Boolean, default: false },
        supportedMethods: { type: [String], default: [] },
      },
    ],
    lastSeenAt: {
      type: Date,
      default: Date.now,
    },
    pairedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    pairedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

const Agent: Model<IAgent> = mongoose.model<IAgent>('Agent', AgentSchema);

export default Agent;
