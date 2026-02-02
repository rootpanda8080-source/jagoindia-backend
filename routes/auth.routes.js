import express from 'express';
import { login, getMe } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);

export default router;
