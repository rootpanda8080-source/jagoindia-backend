import bcryptjs from 'bcryptjs';
import User from '../models/User.js';

/**
 * Seed default admin user if no admin exists
 * Runs only on server start and only if no admin is found
 * Development only - uses environment variables for credentials
 */
export const seedAdmin = async () => {
  try {
    // Check if an admin already exists
    const adminExists = await User.findOne({ role: 'admin' });

    if (adminExists) {
      console.log('✅ Admin user already exists. Skipping seed.');
      return;
    }

    // Get credentials from environment variables or use defaults for dev
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@jagoindia.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@12345';
    const adminName = process.env.ADMIN_NAME || 'Admin';

    // Hash password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(adminPassword, salt);

    // Create admin user
    const adminUser = await User.create({
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
      isActive: true,
    });

    console.log(`
╔════════════════════════════════════════════════════╗
║         🎉 ADMIN USER CREATED SUCCESSFULLY        ║
╠════════════════════════════════════════════════════╣
║ Email:    ${adminEmail.padEnd(41)} ║
║ Password: ${adminPassword.padEnd(41)} ║
║ Role:     ${adminUser.role.padEnd(41)} ║
║ ID:       ${adminUser._id.toString().substring(0, 43)} ║
╚════════════════════════════════════════════════════╝
    `);

    return adminUser;
  } catch (error) {
    // If unique constraint error on email, admin might exist but wasn't found
    if (error.code === 11000 && error.keyPattern.email) {
      console.log('✅ Admin user already exists. Skipping seed.');
      return;
    }

    console.error('❌ Error seeding admin user:', error.message);
    throw error;
  }
};
