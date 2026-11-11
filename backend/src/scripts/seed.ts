import mongoose from 'mongoose';
import env from '../config/env.js';
import connectDB from '../config/db.js';
import { seedAdminUser } from '../config/seedAdmin.js';
import logger from '../utils/logger.js';

async function runSeed() {
  try {
    logger.info('Connecting to MongoDB for seeding...');
    await connectDB();
    await seedAdminUser();
    logger.info('✅ Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    logger.error(`❌ Seeding failed: ${error instanceof Error ? error.message : error}`);
    process.exit(1);
  }
}

runSeed();
