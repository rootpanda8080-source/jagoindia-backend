import User from '../models/User.js';
import { generateToken } from '../middleware/auth.middleware.js';

/**
 * POST /api/auth/login
 * Admin login with email and password
 * Only ADMIN users can login
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Normalize email for lookup (emails stored lowercase in DB)
    const lookupEmail = (email || '').toString().trim().toLowerCase();
    console.log(`[AUTH DEBUG] login attempt - raw: "${email}", normalized: "${lookupEmail}"`);

    // Find user and include password field
    const user = await User.findOne({ email: lookupEmail }).select('+password');
    console.log(`[AUTH DEBUG] user lookup result: ${user ? 'FOUND' : 'NOT_FOUND'}`);
    if (user) {
      console.log(`[AUTH DEBUG] user: email=${user.email}, isActive=${user.isActive}, passwordPresent=${user.password ? 'YES' : 'NO'}`);
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User account is inactive',
      });
    }

    // Check if password matches
    const isPasswordMatch = await user.comparePassword(password);

    console.log(`[AUTH DEBUG] password match: ${isPasswordMatch}`);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/me
 * Get current logged-in user (requires token)
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};
