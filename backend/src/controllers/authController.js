const { v4: uuidv4 } = require('uuid');
const pool = require('../config/database');
const { hashPassword, comparePasswords } = require('../utils/hash');
const { generateToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { sendSuccess, sendCreated, sendError, sendValidationError } = require('../utils/response');

/**
 * Register a new user
 * POST /api/auth/register
 */
async function register(req, res) {
  const client = await pool.connect();

  try {
    const { schoolId, email, password, firstName, lastName, phone, role } = req.body;

    // Check if user already exists
    const userCheck = await client.query(
      'SELECT id FROM users WHERE school_id = $1 AND email = $2',
      [schoolId, email]
    );

    if (userCheck.rows.length > 0) {
      return sendError(res, 409, 'User already exists with this email', 'DUPLICATE_USER');
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const userId = uuidv4();
    const now = new Date();

    const result = await client.query(
      `INSERT INTO users (id, school_id, email, password_hash, first_name, last_name, phone, role, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, email, first_name, last_name, role, created_at`,
      [userId, schoolId, email, passwordHash, firstName, lastName, phone || null, role || 'teacher', now, now]
    );

    const user = result.rows[0];

    // Generate tokens
    const token = generateToken({ userId: user.id, email: user.email, schoolId, role: role || 'teacher' });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email, schoolId });

    return sendCreated(res, {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        createdAt: user.created_at,
      },
      tokens: {
        accessToken: token,
        refreshToken,
      },
    }, 'User registered successfully');
  } catch (error) {
    console.error('Registration error:', error);
    return sendError(res, 500, error.message, 'REGISTRATION_ERROR');
  } finally {
    client.release();
  }
}

/**
 * Login user
 * POST /api/auth/login
 */
async function login(req, res) {
  const client = await pool.connect();

  try {
    const { email, password, schoolId } = req.body;

    // Find user by email and school
    const result = await client.query(
      `SELECT id, email, password_hash, first_name, last_name, role, school_id, is_active
       FROM users WHERE email = $1 AND school_id = $2`,
      [email, schoolId]
    );

    if (result.rows.length === 0) {
      return sendError(res, 401, 'Invalid email or password', 'AUTH_INVALID_CREDENTIALS');
    }

    const user = result.rows[0];

    // Check if user is active
    if (!user.is_active) {
      return sendError(res, 401, 'User account is deactivated', 'AUTH_ACCOUNT_INACTIVE');
    }

    // Compare passwords
    const isPasswordValid = await comparePasswords(password, user.password_hash);

    if (!isPasswordValid) {
      return sendError(res, 401, 'Invalid email or password', 'AUTH_INVALID_CREDENTIALS');
    }

    // Update last login
    await client.query(
      'UPDATE users SET last_login = $1 WHERE id = $2',
      [new Date(), user.id]
    );

    // Generate tokens
    const token = generateToken({ userId: user.id, email: user.email, schoolId: user.school_id, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email, schoolId: user.school_id });

    return sendSuccess(res, 200, {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        schoolId: user.school_id,
      },
      tokens: {
        accessToken: token,
        refreshToken,
      },
    }, 'Login successful');
  } catch (error) {
    console.error('Login error:', error);
    return sendError(res, 500, error.message, 'LOGIN_ERROR');
  } finally {
    client.release();
  }
}

/**
 * Refresh access token
 * POST /api/auth/refresh
 */
async function refresh(req, res) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return sendError(res, 400, 'Refresh token is required', 'MISSING_REFRESH_TOKEN');
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Generate new access token
    const newToken = generateToken({
      userId: decoded.userId,
      email: decoded.email,
      schoolId: decoded.schoolId,
      role: decoded.role,
    });

    return sendSuccess(res, 200, {
      accessToken: newToken,
    }, 'Token refreshed successfully');
  } catch (error) {
    console.error('Token refresh error:', error);
    return sendError(res, 401, error.message, 'INVALID_REFRESH_TOKEN');
  }
}

/**
 * Get current user profile
 * GET /api/auth/me
 */
async function getCurrentUser(req, res) {
  const client = await pool.connect();

  try {
    const userId = req.user.userId;

    const result = await client.query(
      `SELECT id, email, first_name, last_name, phone, role, school_id, is_active, is_verified, created_at
       FROM users WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return sendError(res, 404, 'User not found', 'USER_NOT_FOUND');
    }

    const user = result.rows[0];

    return sendSuccess(res, 200, {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      role: user.role,
      schoolId: user.school_id,
      isActive: user.is_active,
      isVerified: user.is_verified,
      createdAt: user.created_at,
    }, 'User profile retrieved successfully');
  } catch (error) {
    console.error('Get user error:', error);
    return sendError(res, 500, error.message, 'GET_USER_ERROR');
  } finally {
    client.release();
  }
}

/**
 * Update user password
 * PUT /api/auth/change-password
 */
async function changePassword(req, res) {
  const client = await pool.connect();

  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    // Get user's current password hash
    const result = await client.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return sendError(res, 404, 'User not found', 'USER_NOT_FOUND');
    }

    // Verify current password
    const isValid = await comparePasswords(currentPassword, result.rows[0].password_hash);

    if (!isValid) {
      return sendError(res, 401, 'Current password is incorrect', 'INVALID_CURRENT_PASSWORD');
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password
    await client.query(
      'UPDATE users SET password_hash = $1, updated_at = $2 WHERE id = $3',
      [newPasswordHash, new Date(), userId]
    );

    return sendSuccess(res, 200, null, 'Password changed successfully');
  } catch (error) {
    console.error('Change password error:', error);
    return sendError(res, 500, error.message, 'CHANGE_PASSWORD_ERROR');
  } finally {
    client.release();
  }
}

module.exports = {
  register,
  login,
  refresh,
  getCurrentUser,
  changePassword,
};
