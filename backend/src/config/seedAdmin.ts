import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import logger from '../utils/logger.js';

export async function seedAdminUser(): Promise<void> {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@retech.in';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@ReTech2026!';

    // 1. Seed Administrator
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

    // 2. Seed Default Demo Customer for 1-click evaluation
    const demoCustomerEmail = 'customer@retech.in';
    const demoCustomerPassword = 'Customer@2026!';
    const existingCustomer = await User.findOne({ email: demoCustomerEmail });
    if (!existingCustomer) {
      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(demoCustomerPassword, salt);

      await User.create({
        fullName: 'Ayush Sharma (Demo Customer)',
        email: demoCustomerEmail,
        phone: '+91 98123 45678',
        passwordHash,
        role: 'CUSTOMER',
        accountStatus: 'ACTIVE',
        address: {
          street: 'Flat 402, Green Glen Layout, Bellandur',
          city: 'Bengaluru',
          state: 'Karnataka',
          pinCode: '560103',
        },
      });

      logger.info(`✨ Demo Customer successfully provisioned: ${demoCustomerEmail}`);
    }
  } catch (error) {
    logger.error(`Failed to auto-seed initial users: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

