import User from '../models/User.js';

// Verify user is admin
export const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user || user.role !== 'admin' || !user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized as admin',
      });
    }

    req.admin = user;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized as admin',
    });
  }
};
