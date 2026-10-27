const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper to generate signed JWT Token
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'sc7a770a8465d832689f47b5dcf2b425af69ad0d9391eb90e34b9ee0c0b9539ec',
    {
      expiresIn: process.env.JWT_EXPIRE || '30d'
    }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const rawName = req.body.name || req.body.fullName || '';
    const name = rawName.trim();
    const email = (req.body.email || '').trim().toLowerCase();
    const { password, confirmPassword, phone, department, role } = req.body;

    // 1. Check required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Full name is required'
      });
    }

    if (name.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Full name must be at least 2 characters long'
      });
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required'
      });
    }

    // 2. Validate email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // 3. Validate password presence & length
    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long'
      });
    }

    // 4. Validate password confirmation if provided
    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    // 5. Check if user email already exists in MongoDB
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists'
      });
    }

    // 6. Create user in MongoDB (bcrypt hashing handled via pre-save hook)
    const user = await User.create({
      name,
      email,
      password,
      role: role && ['user', 'admin'].includes(role) ? role : 'user',
      phone: (phone || '').trim(),
      department: (department || '').trim()
    });

    console.log(`✅ [MongoDB] New user registered successfully: "${user.name}" <${user.email}> (ID: ${user._id})`);

    // 7. Generate JWT token
    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      token,
      data: {
        id: user._id,
        name: user.name,
        fullName: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        createdAt: user.createdAt
      },
      message: 'Account registered successfully and stored in MongoDB'
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    next(error);
  }
};

// @desc    Log in user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase();
    const { password } = req.body;

    // 1. Check fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password'
      });
    }

    // 2. Query user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // 3. Verify password hash matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Update lastLogin timestamp
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // 4. Sign JWT
    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      token,
      data: {
        id: user._id,
        name: user.name,
        fullName: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        createdAt: user.createdAt
      },
      message: 'Logged in successfully'
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    next(error);
  }
};

// @desc    Get current logged in user details
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    // req.user is populated by authenticate middleware
    return res.status(200).json({
      success: true,
      data: {
        id: req.user._id,
        name: req.user.name,
        fullName: req.user.name,
        email: req.user.email,
        role: req.user.role,
        department: req.user.department,
        createdAt: req.user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe
};
