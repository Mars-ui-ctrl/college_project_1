const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const logger = require('../config/logger');

/**
 * Sign JWT Token helper
 * @param {string} id - User Document ID
 * @returns {string} Signed JWT Token
 */
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * Register a new user account
 * @param {Object} userData - { username, email, password }
 * @returns {Promise<Object>} Object containing user instance and token
 */
const registerUser = async ({ username, email, password }) => {
  // Check if email already exists
  const existingEmail = await User.findOne({ email });
  if (existingEmail) {
    throw new AppError('Email address is already in use.', 400);
  }

  // Check if username already exists
  const existingUsername = await User.findOne({ username });
  if (existingUsername) {
    throw new AppError('Username is already in use.', 400);
  }

  // Create user
  logger.info(`Creating new user account for: ${email}`);
  const user = await User.create({ username, email, password });

  const token = signToken(user._id);

  // Exclude password from output
  const userObj = user.toObject();
  delete userObj.password;

  return { user: userObj, token };
};

/**
 * Login an existing user
 * @param {Object} loginData - { email, password }
 * @returns {Promise<Object>} Object containing user instance and token
 */
const loginUser = async ({ email, password }) => {
  if (!email || !password) {
    throw new AppError('Please provide an email and password.', 400);
  }

  // Find user and explicitly select password
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new AppError('Invalid credentials.', 401);
  }

  // Verify password
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    throw new AppError('Invalid credentials.', 401);
  }

  const token = signToken(user._id);

  const userObj = user.toObject();
  delete userObj.password;

  logger.info(`User logged in successfully: ${email}`);
  return { user: userObj, token };
};

/**
 * Get user profile details
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User document
 */
const getUserProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User profile not found.', 404);
  }
  return user;
};

/**
 * Update user avatar or username details
 * @param {string} userId - User ID
 * @param {Object} updateData - { username, avatar }
 * @returns {Promise<Object>} Updated user profile
 */
const updateProfile = async (userId, { username, avatar }) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found.', 404);
  }

  if (username) {
    // If username is changing, verify it is unique
    if (username !== user.username) {
      const isTaken = await User.findOne({ username });
      if (isTaken) {
        throw new AppError('Username is already taken.', 400);
      }
      user.username = username;
    }
  }

  if (avatar !== undefined) {
    user.avatar = avatar;
  }

  await user.save();

  // Exclude password
  const updatedUser = user.toObject();
  delete updatedUser.password;

  logger.info(`Updated user profile: ${userId}`);
  return updatedUser;
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateProfile,
};
