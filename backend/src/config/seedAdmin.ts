import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import logger from '../utils/logger.js';

export async function seedAdminUser(): Promise<void> {
  try {
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@retech.in').toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@ReTech2026!';

    // 1. Seed or Update Administrator
    const adminSalt = await bcrypt.genSalt(12);
    const adminPasswordHash = await bcrypt.hash(adminPassword, adminSalt);

    const adminUser = await User.findOneAndUpdate(
      { email: adminEmail },
      {
        $set: {
          fullName: 'ReTech Platform Administrator',
          email: adminEmail,
          phone: '+91 98765 43210',
          passwordHash: adminPasswordHash,
          role: 'ADMIN',
          accountStatus: 'ACTIVE',
          address: {
            street: '100 Sustainability Boulevard',
            city: 'Bengaluru',
            state: 'Karnataka',
            pinCode: '560001',
          },
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    logger.info(`✨ Admin user verified & provisioned: ${adminUser.email} (role: ${adminUser.role})`);

    // 2. Seed or Update Default Demo Customer
    const demoCustomerEmail = 'customer@retech.in';
    const demoCustomerPassword = 'Customer@2026!';
    const customerSalt = await bcrypt.genSalt(12);
    const customerPasswordHash = await bcrypt.hash(demoCustomerPassword, customerSalt);

    const customerUser = await User.findOneAndUpdate(
      { email: demoCustomerEmail },
      {
        $set: {
          fullName: 'Ayush Sharma (Demo Customer)',
          email: demoCustomerEmail,
          phone: '+91 98123 45678',
          passwordHash: customerPasswordHash,
          role: 'CUSTOMER',
          accountStatus: 'ACTIVE',
          address: {
            street: 'Flat 402, Green Glen Layout, Bellandur',
            city: 'Bengaluru',
            state: 'Karnataka',
            pinCode: '560103',
          },
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    logger.info(`✨ Demo Customer verified & provisioned: ${customerUser.email} (role: ${customerUser.role})`);
  } catch (error) {
    logger.error(`Failed to auto-seed initial users: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}


