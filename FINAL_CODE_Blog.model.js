import mongoose from 'mongoose';
import slug from 'slug';

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a blog title'],
      trim: true,
      maxlength: [200, 'Title cannot be more than 200 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      sparse: true,
    },
    content: {
      type: String,
      required: [true, 'Please provide blog content'],
    },
    thumbnail: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['published', 'disabled'],
      default: 'published',
    },
    views: {
      type: Number,
      default: 0,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Auto-generate slug from title before saving
blogSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = slug(this.title).toLowerCase();
  }
  next();
});

// Index for faster queries
blogSchema.index({ slug: 1 });
blogSchema.index({ status: 1 });
blogSchema.index({ createdAt: -1 });

const Blog = mongoose.model('Blog', blogSchema);

export default Blog;
