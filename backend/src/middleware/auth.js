const jwt = require('jsonwebtoken');

/**
 * Middleware to verify JWT token
 * Adds user info to req.user
 */
const verifyToken = (req, res, next) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        status: 'ERROR',
        message: 'No token provided',
        code: 'AUTH_MISSING_TOKEN',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'ERROR',
        message: 'Token has expired',
        code: 'AUTH_TOKEN_EXPIRED',
      });
    }

    return res.status(401).json({
      status: 'ERROR',
      message: 'Invalid token',
      code: 'AUTH_INVALID_TOKEN',
    });
  }
};

/**
 * Middleware to check if user has required role
 * @param {...string} allowedRoles - Roles that are allowed
 * @returns {Function} Express middleware
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'ERROR',
        message: 'User not authenticated',
        code: 'AUTH_NOT_AUTHENTICATED',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'ERROR',
        message: `Forbidden. Required roles: ${allowedRoles.join(', ')}`,
        code: 'AUTH_INSUFFICIENT_PERMISSION',
      });
    }

    next();
  };
};

module.exports = {
  verifyToken,
  requireRole,
};
