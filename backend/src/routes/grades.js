const express = require('express');
const Joi = require('joi');
const gradeController = require('../controllers/gradeController');
const { verifyToken, requireRole } = require('../middleware/auth');
const { validateBody, validateParams, validateQuery } = require('../middleware/validation');

const router = express.Router();

// Validation schemas
const createGradeSchema = Joi.object({
  schoolId: Joi.string().uuid().required(),
  studentId: Joi.string().uuid().required(),
  subjectId: Joi.string().uuid().required(),
  classId: Joi.string().uuid().required(),
  score: Joi.number().min(0).max(100).required(),
  term: Joi.string().required(),
  academicYear: Joi.string().required(),
  notes: Joi.string().optional(),
});

const updateGradeSchema = Joi.object({
  score: Joi.number().min(0).max(100).required(),
  notes: Joi.string().optional(),
});

const idParamsSchema = Joi.object({
  id: Joi.string().uuid().required(),
});

const studentIdParamsSchema = Joi.object({
  studentId: Joi.string().uuid().required(),
});

const classIdParamsSchema = Joi.object({
  classId: Joi.string().uuid().required(),
});

const studentGradesQuerySchema = Joi.object({
  academicYear: Joi.string().optional(),
  term: Joi.string().optional(),
});

const classGradesQuerySchema = Joi.object({
  subjectId: Joi.string().uuid().optional(),
  academicYear: Joi.string().optional(),
  term: Joi.string().optional(),
});

/**
 * @route POST /api/grades
 * @desc Record a student grade (teacher only)
 * @access Private (Teacher)
 */
router.post(
  '/',
  verifyToken,
  requireRole('teacher'),
  validateBody(createGradeSchema),
  gradeController.createGrade
);

/**
 * @route GET /api/grades/student/:studentId
 * @desc Get grades for a student
 * @access Private
 */
router.get(
  '/student/:studentId',
  verifyToken,
  validateParams(studentIdParamsSchema),
  validateQuery(studentGradesQuerySchema),
  gradeController.getStudentGrades
);

/**
 * @route GET /api/grades/class/:classId
 * @desc Get grades for a class
 * @access Private
 */
router.get(
  '/class/:classId',
  verifyToken,
  validateParams(classIdParamsSchema),
  validateQuery(classGradesQuerySchema),
  gradeController.getClassGrades
);

/**
 * @route PUT /api/grades/:id
 * @desc Update a grade (teacher only)
 * @access Private (Teacher)
 */
router.put(
  '/:id',
  verifyToken,
  requireRole('teacher'),
  validateParams(idParamsSchema),
  validateBody(updateGradeSchema),
  gradeController.updateGrade
);

/**
 * @route PATCH /api/grades/:id/finalize
 * @desc Finalize a grade (lock from edits)
 * @access Private (Teacher)
 */
router.patch(
  '/:id/finalize',
  verifyToken,
  requireRole('teacher'),
  validateParams(idParamsSchema),
  gradeController.finalizeGrade
);

module.exports = router;
