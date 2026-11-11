import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export type NotificationType = 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT';

export interface INotification extends Document {
  userId: Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  relatedDeviceId?: string;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['INFO', 'SUCCESS', 'WARNING', 'ALERT'],
      default: 'INFO',
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    relatedDeviceId: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

const Notification: Model<INotification> = mongoose.model<INotification>(
  'Notification',
  NotificationSchema,
);

export default Notification;

