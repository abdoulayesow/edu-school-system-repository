const express = require('express');
const Joi = require('joi');
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');
const { validateBody } = require('../middleware/validation');

const router = express.Router();

// Validation schemas
const registerSchema = Joi.object({
  schoolId: Joi.string().uuid().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  phone: Joi.string().optional(),
  role: Joi.string().valid('teacher', 'admin', 'accountant', 'secretary', 'parent').optional(),
});

const loginSchema = Joi.object({
  schoolId: Joi.string().uuid().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const refreshSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).required(),
});

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', validateBody(registerSchema), authController.register);

/**
 * @route POST /api/auth/login
 * @desc Login user and get tokens
 * @access Public
 */
router.post('/login', validateBody(loginSchema), authController.login);

/**
 * @route POST /api/auth/refresh
 * @desc Refresh access token
 * @access Public
 */
router.post('/refresh', validateBody(refreshSchema), authController.refresh);

/**
 * @route GET /api/auth/me
 * @desc Get current user profile
 * @access Private
 */
router.get('/me', verifyToken, authController.getCurrentUser);

/**
 * @route PUT /api/auth/change-password
 * @desc Change user password
 * @access Private
 */
router.put('/change-password', verifyToken, validateBody(changePasswordSchema), authController.changePassword);

module.exports = router;
