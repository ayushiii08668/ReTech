import mongoose, { Model, Schema, Types } from 'mongoose';

export interface IDeviceLifecycleEvent {
  _id: Types.ObjectId;
  deviceId: Types.ObjectId;
  retechDeviceId: string;
  eventType: string;
  title: string;
  description: string;
  previousStatus?: string;
  newStatus?: string;
  performedBy?: Types.ObjectId;
  performedByName?: string;
  sourceReference?: string;
  supportingDocuments: string[];
  eventTimestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

const DeviceLifecycleEventSchema = new Schema<IDeviceLifecycleEvent>(
  {
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
    eventType: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    previousStatus: {
      type: String,
    },
    newStatus: {
      type: String,
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    performedByName: {
      type: String,
      default: 'ReTech System Automation',
    },
    sourceReference: {
      type: String,
      default: '',
    },
    supportingDocuments: {
      type: [String],
      default: [],
    },
    eventTimestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

const DeviceLifecycleEvent: Model<IDeviceLifecycleEvent> =
  mongoose.model<IDeviceLifecycleEvent>('DeviceLifecycleEvent', DeviceLifecycleEventSchema);

export default DeviceLifecycleEvent;

/**
 * Helper utility to record a lifecycle event for a device
 */
export async function recordLifecycleEvent(data: {
  deviceId: Types.ObjectId | string;
  retechDeviceId: string;
  eventType: string;
  title: string;
  description: string;
  previousStatus?: string;
  newStatus?: string;
  performedBy?: Types.ObjectId | string;
  performedByName?: string;
  sourceReference?: string;
  supportingDocuments?: string[];
  eventTimestamp?: Date;
}): Promise<IDeviceLifecycleEvent> {
  return await DeviceLifecycleEvent.create({
    deviceId: data.deviceId,
    retechDeviceId: data.retechDeviceId,
    eventType: data.eventType,
    title: data.title,
    description: data.description,
    previousStatus: data.previousStatus,
    newStatus: data.newStatus,
    performedBy: data.performedBy,
    performedByName: data.performedByName || 'ReTech System Process',
    sourceReference: data.sourceReference || '',
    supportingDocuments: data.supportingDocuments || [],
    eventTimestamp: data.eventTimestamp || new Date(),
  });
}

