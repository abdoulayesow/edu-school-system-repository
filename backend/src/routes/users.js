const express = require('express');
const Joi = require('joi');
const userController = require('../controllers/userController');
const { verifyToken, requireRole } = require('../middleware/auth');
const { validateBody, validateParams, validateQuery } = require('../middleware/validation');

const router = express.Router();

// Validation schemas
const createUserSchema = Joi.object({
  schoolId: Joi.string().uuid().required(),
  email: Joi.string().email().required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  phone: Joi.string().optional(),
  role: Joi.string().valid('teacher', 'accountant', 'secretary', 'parent').required(),
});

const updateUserSchema = Joi.object({
  firstName: Joi.string().optional(),
  lastName: Joi.string().optional(),
  phone: Joi.string().optional(),
  role: Joi.string().valid('teacher', 'accountant', 'secretary', 'parent').optional(),
});

const updateRoleSchema = Joi.object({
  role: Joi.string().valid('teacher', 'accountant', 'secretary', 'parent', 'admin').required(),
});

const idParamsSchema = Joi.object({
  id: Joi.string().uuid().required(),
});

const listUsersSchema = Joi.object({
  schoolId: Joi.string().uuid().required(),
  page: Joi.number().min(1).optional(),
  pageSize: Joi.number().min(1).max(100).optional(),
  role: Joi.string().valid('teacher', 'admin', 'accountant', 'secretary', 'parent').optional(),
  search: Joi.string().optional(),
});

/**
 * @route POST /api/users
 * @desc Create a new user (admin invites user)
 * @access Private (Admin only)
 */
router.post(
  '/',
  verifyToken,
  requireRole('admin'),
  validateBody(createUserSchema),
  userController.createUser
);

/**
 * @route GET /api/users
 * @desc Get all users in a school with pagination and filtering
 * @access Private
 */
router.get(
  '/',
  verifyToken,
  validateQuery(listUsersSchema),
  userController.getAllUsers
);

/**
 * @route GET /api/users/:id
 * @desc Get user by ID
 * @access Private
 */
router.get(
  '/:id',
  verifyToken,
  validateParams(idParamsSchema),
  userController.getUserById
);

/**
 * @route PUT /api/users/:id
 * @desc Update user information
 * @access Private (Admin of that school)
 */
router.put(
  '/:id',
  verifyToken,
  requireRole('admin'),
  validateParams(idParamsSchema),
  validateBody(updateUserSchema),
  userController.updateUser
);

/**
 * @route PATCH /api/users/:id/role
 * @desc Update user role
 * @access Private (Admin only)
 */
router.patch(
  '/:id/role',
  verifyToken,
  requireRole('admin'),
  validateParams(idParamsSchema),
  validateBody(updateRoleSchema),
  userController.updateUserRole
);

/**
 * @route PATCH /api/users/:id/deactivate
 * @desc Deactivate user account
 * @access Private (Admin only)
 */
router.patch(
  '/:id/deactivate',
  verifyToken,
  requireRole('admin'),
  validateParams(idParamsSchema),
  userController.deactivateUser
);

module.exports = router;
