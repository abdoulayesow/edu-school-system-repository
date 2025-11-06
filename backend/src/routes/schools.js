const express = require('express');
const Joi = require('joi');
const schoolController = require('../controllers/schoolController');
const { verifyToken, requireRole } = require('../middleware/auth');
const { validateBody, validateParams, validateQuery } = require('../middleware/validation');

const router = express.Router();

// Validation schemas
const createSchoolSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().optional(),
  country: Joi.string().optional(),
  city: Joi.string().optional(),
  address: Joi.string().optional(),
  subscriptionPlan: Joi.string().valid('Premium', 'Platinum').optional(),
});

const updateSchoolSchema = Joi.object({
  name: Joi.string().optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string().optional(),
  country: Joi.string().optional(),
  city: Joi.string().optional(),
  address: Joi.string().optional(),
  subscriptionPlan: Joi.string().valid('Premium', 'Platinum').optional(),
});

const idParamsSchema = Joi.object({
  id: Joi.string().uuid().required(),
});

const listSchoolsSchema = Joi.object({
  page: Joi.number().min(1).optional(),
  pageSize: Joi.number().min(1).max(100).optional(),
  search: Joi.string().optional(),
});

/**
 * @route POST /api/schools
 * @desc Create a new school
 * @access Private (Admin only)
 */
router.post(
  '/',
  verifyToken,
  requireRole('admin'),
  validateBody(createSchoolSchema),
  schoolController.createSchool
);

/**
 * @route GET /api/schools
 * @desc Get all schools with pagination and search
 * @access Private
 */
router.get(
  '/',
  verifyToken,
  validateQuery(listSchoolsSchema),
  schoolController.getAllSchools
);

/**
 * @route GET /api/schools/:id
 * @desc Get school by ID with statistics
 * @access Private
 */
router.get(
  '/:id',
  verifyToken,
  validateParams(idParamsSchema),
  schoolController.getSchoolById
);

/**
 * @route PUT /api/schools/:id
 * @desc Update school information
 * @access Private (Admin of that school)
 */
router.put(
  '/:id',
  verifyToken,
  requireRole('admin'),
  validateParams(idParamsSchema),
  validateBody(updateSchoolSchema),
  schoolController.updateSchool
);

/**
 * @route DELETE /api/schools/:id
 * @desc Soft delete school
 * @access Private (Admin only)
 */
router.delete(
  '/:id',
  verifyToken,
  requireRole('admin'),
  validateParams(idParamsSchema),
  schoolController.deleteSchool
);

module.exports = router;
