import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import blogRoutes from './routes/blog.routes.js';
import errorHandler from './utils/errorHandler.js';
import { seedAdmin } from './utils/seedAdmin.js';

dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars.join(', '));
  process.exit(1);
}

const app = express();

// CORS Configuration - Use FRONTEND_URL from environment
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://localhost:3000',
];

// Remove duplicates
const uniqueOrigins = [...new Set(allowedOrigins)];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || uniqueOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log configuration in development
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 Backend Configuration:', {
    PORT: process.env.PORT || 5000,
    NODE_ENV: process.env.NODE_ENV,
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
    CORS_ORIGINS: uniqueOrigins,
  });
}

// Connect to MongoDB
const startTime = Date.now();
await connectDB();

// Seed admin user (dev only, runs once)
await seedAdmin();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  const uptime = Math.floor((Date.now() - startTime) / 1000);
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  res.json({
    status: 'running',
    uptime: `${uptime}s`,
    db: dbStatus
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handling middleware (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 JagoIndia Backend running on port ${PORT}`);
  console.log(`📡 Accept requests from: ${uniqueOrigins.join(', ')}`);
});
