import express from 'express';
import {
  createBlog,
  getAllBlogs,
  getAdminBlogs,
  getBlogBySlug,
  likeBlog,
  getBlogById,
  updateBlog,
  updateBlogStatus,
  deleteBlog,
} from '../controllers/blog.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { isAdmin } from '../middleware/admin.middleware.js';

const router = express.Router();

// Public routes
router.get('/id/:id', getBlogById);
router.get('/', getAllBlogs);
router.get('/:slug', getBlogBySlug);
router.post('/:id/like', likeBlog); // Allow anonymous likes (no protect middleware)

// Admin routes
router.get('/admin/my-blogs', protect, isAdmin, getAdminBlogs);
router.post('/', protect, isAdmin, createBlog);
router.put('/:id', protect, isAdmin, updateBlog);
router.patch('/:id/status', protect, isAdmin, updateBlogStatus);
router.delete('/:id', protect, isAdmin, deleteBlog);

export default router;
