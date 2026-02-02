import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Blog from './models/Blog.js';
import connectDB from './config/db.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('🌱 Seeding database...\n');

    // Create admin if doesn't exist
    let admin = await User.findOne({ email: 'admin@jagoindia.com' });
    
    if (!admin) {
      admin = await User.create({
        name: 'JagoIndia Admin',
        email: 'admin@jagoindia.com',
        password: 'admin123456',
        role: 'admin',
        isActive: true,
      });
      console.log('✅ Admin user created');
    } else {
      console.log('✅ Admin user already exists');
    }

    // Check if blogs exist
    const blogCount = await Blog.countDocuments();
    
    if (blogCount === 0) {
      const blogs = [
        {
          title: 'Welcome to JagoIndia',
          content: 'This is the first blog post on JagoIndia. Learn about our mission to provide quality content for Indian readers.',
          thumbnail: 'https://via.placeholder.com/800x400?text=Welcome+to+JagoIndia',
          status: 'published',
          author: admin._id,
        },
        {
          title: 'Node.js Best Practices',
          content: 'Learn the best practices for building scalable Node.js applications. From error handling to security, we cover it all.',
          thumbnail: 'https://via.placeholder.com/800x400?text=NodeJS+Best+Practices',
          status: 'published',
          author: admin._id,
        },
        {
          title: 'MongoDB for Beginners',
          content: 'A comprehensive guide to getting started with MongoDB. Learn about collections, documents, and queries.',
          thumbnail: 'https://via.placeholder.com/800x400?text=MongoDB+Beginners',
          status: 'published',
          author: admin._id,
        },
        {
          title: 'Building RESTful APIs',
          content: 'Master the art of building clean, secure, and scalable RESTful APIs with Express.js.',
          thumbnail: 'https://via.placeholder.com/800x400?text=RESTful+APIs',
          status: 'published',
          author: admin._id,
        },
        {
          title: 'React Hooks Guide',
          content: 'Understanding React Hooks: useState, useEffect, useContext, and custom hooks for modern React development.',
          thumbnail: 'https://via.placeholder.com/800x400?text=React+Hooks',
          status: 'published',
          author: admin._id,
        },
      ];

      await Blog.insertMany(blogs);
      console.log('✅ 5 sample blogs created');
    } else {
      console.log(`✅ ${blogCount} blogs already exist`);
    }

    console.log('\n✨ Database seeded successfully!');
    console.log(`
    Admin Login:
    Email: admin@jagoindia.com
    Password: admin123456
    
    API Base URL: http://localhost:5000/api
    `);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    process.exit(1);
  }
};

seedDatabase();
