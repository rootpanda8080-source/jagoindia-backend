import Blog from '../models/Blog.js';

/**
 * POST /api/blogs
 * Create a new blog (ADMIN only)
 */
export const createBlog = async (req, res, next) => {
  try {
    const { title, content, thumbnail, status } = req.body;

    // Validation
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title and content',
      });
    }

    // Create blog
    const blog = await Blog.create({
      title,
      content,
      thumbnail: thumbnail || null,
      status: status || 'published',
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
    const { page = 1, limit = 10, sort = '-createdAt' } = req.query;

    const skip = (page - 1) * limit;

    // Fetch published blogs
    const blogs = await Blog.find({ status: 'published' })
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('author', 'name email')
      .select('-content'); // Don't return full content in list

    // Get total count
    const total = await Blog.countDocuments({ status: 'published' });

    res.status(200).json({
      success: true,
      blogs,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
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
 * PUT /api/blogs/:id
 * Update blog (ADMIN only)
 */
export const updateBlog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content, thumbnail, status } = req.body;

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

    // Update fields
    blog.title = title || blog.title;
    blog.content = content || blog.content;
    blog.thumbnail = thumbnail !== undefined ? thumbnail : blog.thumbnail;
    blog.status = status || blog.status;

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
