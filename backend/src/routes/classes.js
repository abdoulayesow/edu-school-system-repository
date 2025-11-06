const express = require('express');
const Joi = require('joi');
const classController = require('../controllers/classController');
const { verifyToken } = require('../middleware/auth');
const { validateBody, validateParams, validateQuery } = require('../middleware/validation');

const router = express.Router();

// Validation schemas
const createClassSchema = Joi.object({
  schoolId: Joi.string().uuid().required(),
  name: Joi.string().required(),
  gradeLevel: Joi.number().optional(),
  teacherId: Joi.string().uuid().optional(),
  capacity: Joi.number().optional(),
});

const updateClassSchema = Joi.object({
  name: Joi.string().optional(),
  gradeLevel: Joi.number().optional(),
  teacherId: Joi.string().uuid().optional(),
  capacity: Joi.number().optional(),
});

const idParamsSchema = Joi.object({
  id: Joi.string().uuid().required(),
});

const listClassesSchema = Joi.object({
  schoolId: Joi.string().uuid().required(),
  page: Joi.number().min(1).optional(),
  pageSize: Joi.number().min(1).max(100).optional(),
  gradeLevel: Joi.number().optional(),
  search: Joi.string().optional(),
});

/**
 * @route POST /api/classes
 * @desc Create a new class
 * @access Private
 */
router.post(
  '/',
  verifyToken,
  validateBody(createClassSchema),
  classController.createClass
);

/**
 * @route GET /api/classes
 * @desc Get all classes with pagination and filtering
 * @access Private
 */
router.get(
  '/',
  verifyToken,
  validateQuery(listClassesSchema),
  classController.getAllClasses
);

/**
 * @route GET /api/classes/:id
 * @desc Get class by ID with student count
 * @access Private
 */
router.get(
  '/:id',
  verifyToken,
  validateParams(idParamsSchema),
  classController.getClassById
);

/**
 * @route PUT /api/classes/:id
 * @desc Update class information
 * @access Private
 */
router.put(
  '/:id',
  verifyToken,
  validateParams(idParamsSchema),
  validateBody(updateClassSchema),
  classController.updateClass
);

/**
 * @route DELETE /api/classes/:id
 * @desc Delete class (soft delete)
 * @access Private
 */
router.delete(
  '/:id',
  verifyToken,
  validateParams(idParamsSchema),
  classController.deleteClass
);

module.exports = router;
