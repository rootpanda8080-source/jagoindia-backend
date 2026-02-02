import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcryptjs from 'bcryptjs';
import User from '../models/User.js';
import connectDB from '../config/db.js';

dotenv.config();

const createAdmin = async () => {
  try {
    await connectDB();

    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@jagoindia.com').toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || 'amitxanjali@2025';
    const adminName = process.env.ADMIN_NAME || 'JagoIndia Admin';

    // Check if admin exists (by email)
    const adminExists = await User.findOne({ email: adminEmail });
    if (adminExists) {
      console.log('✅ Admin user already exists');
      process.exit(0);
    }

    // Create new admin (leave password plaintext so model pre-save will hash it)
    const admin = await User.create({
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
      isActive: true,
    });

    console.log('✅ Admin user created successfully!');
    console.log(`\nEmail: ${admin.email}\nPassword: ${adminPassword}\n\n⚠️  IMPORTANT: Change this password immediately!\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    process.exit(1);
  }
};

createAdmin();
