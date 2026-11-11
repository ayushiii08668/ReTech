import app from './app.js';
import env from './config/env.js';
import connectDB from './config/db.js';
import logger from './utils/logger.js';
import { seedAdminUser } from './config/seedAdmin.js';

/**
 * Start the ReTech API server.
 */
const startServer = async (): Promise<void> => {
  const host = '0.0.0.0';
  const server = app.listen(env.PORT, host, () => {
    logger.info(
      `🚀 Server running in ${env.NODE_ENV} mode on ${host}:${env.PORT}`,
    );
  });

  // Connect to MongoDB asynchronously & seed admin
  connectDB()
    .then(async () => {
      await seedAdminUser();
    })
    .catch((err) => {
      logger.error(`Initial MongoDB connection failed: ${err.message}`);
    });

  // --------------- Graceful Shutdown Handlers ---------------

  /**
   * Handle unhandled promise rejections.
   */
  process.on('unhandledRejection', (reason: unknown) => {
    logger.error(`Unhandled Rejection: ${reason}`);
    // Close server gracefully, then exit
    server.close(() => {
      process.exit(1);
    });
  });

  /**
   * Handle uncaught exceptions.
   */
  process.on('uncaughtException', (error: Error) => {
    logger.error(`Uncaught Exception: ${error.message}`);
    // Close server gracefully, then exit
    server.close(() => {
      process.exit(1);
    });
  });

  /**
   * Handle SIGTERM for container / PM2 shutdown.
   */
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received. Shutting down gracefully…');
    server.close(() => {
      logger.info('Process terminated.');
    });
  });
};

startServer();
