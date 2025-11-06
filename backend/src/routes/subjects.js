const express = require('express');
const Joi = require('joi');
const subjectController = require('../controllers/subjectController');
const { verifyToken } = require('../middleware/auth');
const { validateBody, validateParams, validateQuery } = require('../middleware/validation');

const router = express.Router();

// Validation schemas
const createSubjectSchema = Joi.object({
  schoolId: Joi.string().uuid().required(),
  name: Joi.string().required(),
  code: Joi.string().optional(),
});

const updateSubjectSchema = Joi.object({
  name: Joi.string().optional(),
  code: Joi.string().optional(),
});

const idParamsSchema = Joi.object({
  id: Joi.string().uuid().required(),
});

const listSubjectsSchema = Joi.object({
  schoolId: Joi.string().uuid().required(),
  page: Joi.number().min(1).optional(),
  pageSize: Joi.number().min(1).max(100).optional(),
  search: Joi.string().optional(),
});

/**
 * @route POST /api/subjects
 * @desc Create a new subject
 * @access Private
 */
router.post(
  '/',
  verifyToken,
  validateBody(createSubjectSchema),
  subjectController.createSubject
);

/**
 * @route GET /api/subjects
 * @desc Get all subjects with pagination and search
 * @access Private
 */
router.get(
  '/',
  verifyToken,
  validateQuery(listSubjectsSchema),
  subjectController.getAllSubjects
);

/**
 * @route GET /api/subjects/:id
 * @desc Get subject by ID with grades count
 * @access Private
 */
router.get(
  '/:id',
  verifyToken,
  validateParams(idParamsSchema),
  subjectController.getSubjectById
);

/**
 * @route PUT /api/subjects/:id
 * @desc Update subject
 * @access Private
 */
router.put(
  '/:id',
  verifyToken,
  validateParams(idParamsSchema),
  validateBody(updateSubjectSchema),
  subjectController.updateSubject
);

/**
 * @route DELETE /api/subjects/:id
 * @desc Delete subject (soft delete)
 * @access Private
 */
router.delete(
  '/:id',
  verifyToken,
  validateParams(idParamsSchema),
  subjectController.deleteSubject
);

module.exports = router;
