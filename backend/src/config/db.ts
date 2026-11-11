import mongoose from 'mongoose';
import env from './env.js';
import logger from '../utils/logger.js';

/**
 * Connect to MongoDB using the URI from environment configuration.
 * Handles connection errors gracefully and logs status.
 */
const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 3000,
    });
    logger.info(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`MongoDB connection error: ${error.message}`);
    } else {
      logger.error('MongoDB connection error: Unknown error');
    }
    logger.warn('Server running without active MongoDB connection. Start MongoDB or verify MONGODB_URI.');
  }

  // Handle connection events after initial connection
  mongoose.connection.on('error', (err) => {
    logger.error(`MongoDB runtime error: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
  });
};

export default connectDB;
