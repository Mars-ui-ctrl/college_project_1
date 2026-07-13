const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const logger = require('../config/logger');

/**
 * Protect routes - Verification middleware
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // 1. Read token from cookie first (recommended for web clients)
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    // 2. Fallback to Authorization Header Bearer token
    else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Not authorized to access this resource. Please log in.', 401));
    }

    // Decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from DB
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    // Grant access and store user details in request
    req.user = currentUser;
    next();
  } catch (error) {
    logger.error(`Authentication Middleware Error: ${error.message}`);
    return next(new AppError('Session expired or invalid. Please log in again.', 401));
  }
};

module.exports = {
  protect,
};
