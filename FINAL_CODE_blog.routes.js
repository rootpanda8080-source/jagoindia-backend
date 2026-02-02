import express from 'express';
import {
  createBlog,
  getAllBlogs,
  getBlogBySlug,
  updateBlog,
  updateBlogStatus,
  deleteBlog,
} from '../controllers/blog.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { isAdmin } from '../middleware/admin.middleware.js';

const router = express.Router();

// Public routes
router.get('/', getAllBlogs);
router.get('/:slug', getBlogBySlug);

// Admin routes
router.post('/', protect, isAdmin, createBlog);
router.put('/:id', protect, isAdmin, updateBlog);
router.patch('/:id/status', protect, isAdmin, updateBlogStatus);
router.delete('/:id', protect, isAdmin, deleteBlog);

export default router;
