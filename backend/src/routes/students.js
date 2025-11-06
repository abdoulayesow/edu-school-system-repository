const express = require('express');
const Joi = require('joi');
const studentController = require('../controllers/studentController');
const { verifyToken, requireRole } = require('../middleware/auth');
const { validateBody, validateParams, validateQuery } = require('../middleware/validation');

const router = express.Router();

// Validation schemas
const createStudentSchema = Joi.object({
  schoolId: Joi.string().uuid().required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: Joi.string().email().optional(),
  phone: Joi.string().optional(),
  dateOfBirth: Joi.date().optional(),
  gender: Joi.string().valid('M', 'F', 'Other').optional(),
  enrollmentDate: Joi.date().optional(),
  address: Joi.string().optional(),
  parentId: Joi.string().uuid().optional(),
});

const updateStudentSchema = Joi.object({
  firstName: Joi.string().optional(),
  lastName: Joi.string().optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string().optional(),
  dateOfBirth: Joi.date().optional(),
  gender: Joi.string().valid('M', 'F', 'Other').optional(),
  address: Joi.string().optional(),
  parentId: Joi.string().uuid().optional(),
});

const enrollSchema = Joi.object({
  classId: Joi.string().uuid().required(),
});

const idParamsSchema = Joi.object({
  id: Joi.string().uuid().required(),
});

const listStudentsSchema = Joi.object({
  schoolId: Joi.string().uuid().required(),
  page: Joi.number().min(1).optional(),
  pageSize: Joi.number().min(1).max(100).optional(),
  classId: Joi.string().uuid().optional(),
  search: Joi.string().optional(),
});

/**
 * @route POST /api/students
 * @desc Create a new student
 * @access Private
 */
router.post(
  '/',
  verifyToken,
  validateBody(createStudentSchema),
  studentController.createStudent
);

/**
 * @route GET /api/students
 * @desc Get all students in a school with pagination and filtering
 * @access Private
 */
router.get(
  '/',
  verifyToken,
  validateQuery(listStudentsSchema),
  studentController.getAllStudents
);

/**
 * @route GET /api/students/:id
 * @desc Get student by ID with enrolled classes
 * @access Private
 */
router.get(
  '/:id',
  verifyToken,
  validateParams(idParamsSchema),
  studentController.getStudentById
);

/**
 * @route PUT /api/students/:id
 * @desc Update student information
 * @access Private
 */
router.put(
  '/:id',
  verifyToken,
  validateParams(idParamsSchema),
  validateBody(updateStudentSchema),
  studentController.updateStudent
);

/**
 * @route POST /api/students/:id/enroll
 * @desc Enroll student in a class
 * @access Private
 */
router.post(
  '/:id/enroll',
  verifyToken,
  validateParams(idParamsSchema),
  validateBody(enrollSchema),
  studentController.enrollInClass
);

module.exports = router;
