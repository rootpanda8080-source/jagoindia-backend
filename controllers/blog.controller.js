import Blog from '../models/Blog.js';

/**
 * POST /api/blogs
 * Create a new blog (ADMIN only)
 */
export const createBlog = async (req, res, next) => {
  try {
    const { title, content, thumbnail, status, category } = req.body;

    // Validation - category is required
    if (!title || !content || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, content and category',
      });
    }

    // Create blog
    const blog = await Blog.create({
      title,
      content,
      thumbnail: thumbnail || null,
      status: status || 'published',
      category: category || 'More',
      author: req.admin._id,
    });

    res.status(201).json({
      success: true,
      message: 'Blog created successfully',
      blog,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/blogs
 * Get all published blogs (PUBLIC)
 * Supports pagination and sorting
 */
export const getAllBlogs = async (req, res, next) => {
  try {

    const { page = 1, limit = 12, sort = '-createdAt', q, category } = req.query;

    const parsedLimit = parseInt(limit) || 12;
    const parsedPage = parseInt(page) || 1;
    const skip = (parsedPage - 1) * parsedLimit;

    // Build filter
    const filter = { status: 'published' };
    if (category) {
      filter.category = category;
    }
    if (q) {
      const regex = new RegExp(q, 'i');
      filter.$or = [
        { title: regex },
        { content: regex },
        { category: regex },
      ];
    }

    // Fetch published blogs with optional search/category
    const blogs = await Blog.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parsedLimit)
      .populate('author', 'name email')
      .select('-content'); // Don't return full content in list

    // Get total count
    const total = await Blog.countDocuments(filter);

    res.status(200).json({
      success: true,
      blogs,
      pagination: {
        total,
        page: parsedPage,
        limit: parsedLimit,
        pages: Math.ceil(total / parsedLimit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/blogs/admin/my-blogs
 * Get all blogs for admin (published + disabled) (ADMIN ONLY)
 * Supports pagination
 */
export const getAdminBlogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 999, sort = '-createdAt' } = req.query;

    const parsedLimit = parseInt(limit) || 999;
    const parsedPage = parseInt(page) || 1;
    const skip = (parsedPage - 1) * parsedLimit;

    // Filter by current admin user - gets both published and disabled
    const filter = { author: req.admin._id };

    // Fetch all blogs for this admin (published and disabled)
    const blogs = await Blog.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parsedLimit)
      .populate('author', 'name email')
      .select('-content'); // Don't return full content in list

    // Get total count
    const total = await Blog.countDocuments(filter);

    res.status(200).json({
      success: true,
      blogs,
      pagination: {
        total,
        page: parsedPage,
        limit: parsedLimit,
        pages: Math.ceil(total / parsedLimit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/blogs/:slug
 * Get single blog by slug (PUBLIC)
 * Increments view count
 */
export const getBlogBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    // Find blog and increment views
    const blog = await Blog.findOneAndUpdate(
      { slug, status: 'published' },
      { $inc: { views: 1 } },
      { new: true }
    ).populate('author', 'name email');

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found',
      });
    }

    res.status(200).json({
      success: true,
      blog,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/blogs/id/:id
 * Get single blog by ID (no view increment) - used by admin/edit pages
 */
export const getBlogById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findById(id).populate('author', 'name email');

    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    res.status(200).json({ success: true, blog });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/blogs/:id/like
 * Increment like count for a blog (PUBLIC)
 */
export const likeBlog = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Require authenticated user for like toggling
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    // Toggle like: if user already liked, remove; otherwise add
    const alreadyLiked = (blog.likedBy || []).some((u) => u.toString() === userId);
    if (alreadyLiked) {
      blog.likedBy = (blog.likedBy || []).filter((u) => u.toString() !== userId);
      blog.likes = Math.max(0, (blog.likes || 0) - 1);
    } else {
      blog.likedBy = blog.likedBy || [];
      blog.likedBy.push(userId);
      blog.likes = (blog.likes || 0) + 1;
    }

    await blog.save();
    await blog.populate('author', 'name email');

    res.status(200).json({ success: true, blog, liked: !alreadyLiked });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/blogs/:id
 * Update blog (ADMIN only)
 */
export const updateBlog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content, thumbnail, status, category } = req.body;

    // Find blog
    let blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found',
      });
    }

    // Check if admin owns the blog or is super admin
    if (blog.author.toString() !== req.admin._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this blog',
      });
    }

    // Update fields
    blog.title = title || blog.title;
    blog.content = content || blog.content;
    blog.thumbnail = thumbnail !== undefined ? thumbnail : blog.thumbnail;
    blog.status = status || blog.status;
    blog.category = category || blog.category;

    // Save blog
    blog = await blog.save();

    res.status(200).json({
      success: true,
      message: 'Blog updated successfully',
      blog,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/blogs/:id/status
 * Toggle blog status (published/disabled) (ADMIN only)
 */
export const updateBlogStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validation
    if (!status || !['published', 'disabled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either "published" or "disabled"',
      });
    }

    // Find blog
    let blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found',
      });
    }

    // Check if admin owns the blog
    if (blog.author.toString() !== req.admin._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this blog',
      });
    }

    // Update status
    blog.status = status;
    blog = await blog.save();

    res.status(200).json({
      success: true,
      message: `Blog ${status === 'published' ? 'published' : 'disabled'} successfully`,
      blog,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/blogs/:id
 * Delete blog (ADMIN only)
 */
export const deleteBlog = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find blog
    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found',
      });
    }

    // Check if admin owns the blog
    if (blog.author.toString() !== req.admin._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this blog',
      });
    }

    // Delete blog
    await Blog.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Blog deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
