import mongoose from 'mongoose';
import dns from 'node:dns';
import env from './env.js';
import logger from '../utils/logger.js';

// Ensure reliable DNS resolution for MongoDB Atlas SRV connection strings on Windows
if (env.MONGODB_URI.startsWith('mongodb+srv://')) {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch (err) {
    // Non-fatal if custom DNS cannot be set
  }
}

/**
 * Connect to MongoDB using the URI from environment configuration.
 * Handles connection errors gracefully and logs status.
 */
const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    logger.info(`MongoDB connected: ${conn.connection.host} (DB: ${conn.connection.name})`);
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
