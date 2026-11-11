import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import logger from '../utils/logger.js';

export async function seedAdminUser(): Promise<void> {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@retech.in';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@ReTech2026!';

    const existingAdmin = await User.findOne({ role: 'ADMIN' });
    if (!existingAdmin) {
      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(adminPassword, salt);

      await User.create({
        fullName: 'ReTech Platform Administrator',
        email: adminEmail.toLowerCase(),
        phone: '+91 98765 43210',
        passwordHash,
        role: 'ADMIN',
        accountStatus: 'ACTIVE',
        address: {
          street: '100 Sustainability Boulevard',
          city: 'Bengaluru',
          state: 'Karnataka',
          pinCode: '560001',
        },
      });

      logger.info(`✨ Admin user successfully provisioned: ${adminEmail}`);
    }
  } catch (error) {
    logger.error(`Failed to auto-seed admin user: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

