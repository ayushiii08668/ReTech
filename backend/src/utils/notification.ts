import { Types } from 'mongoose';
import Notification, { NotificationType } from '../models/Notification.js';
import logger from './logger.js';

export async function createNotification(
  userId: Types.ObjectId | string,
  title: string,
  message: string,
  type: NotificationType = 'INFO',
  relatedDeviceId?: string,
): Promise<void> {
  try {
    await Notification.create({
      userId,
      title,
      message,
      type,
      relatedDeviceId: relatedDeviceId || '',
    });
  } catch (error) {
    logger.error(`Failed to create notification: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

