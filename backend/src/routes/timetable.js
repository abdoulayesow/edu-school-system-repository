const express = require('express');
const Joi = require('joi');
const timetableController = require('../controllers/timetableController');
const { verifyToken } = require('../middleware/auth');
const { validateBody, validateParams, validateQuery } = require('../middleware/validation');

const router = express.Router();

// Validation schemas
const createTimetableSchema = Joi.object({
  schoolId: Joi.string().uuid().required(),
  classId: Joi.string().uuid().required(),
  subjectId: Joi.string().uuid().required(),
  teacherId: Joi.string().uuid().required(),
  dayOfWeek: Joi.string().valid('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday').required(),
  startTime: Joi.string().pattern(/^\d{2}:\d{2}$/).required(),
  endTime: Joi.string().pattern(/^\d{2}:\d{2}$/).required(),
  room: Joi.string().optional(),
});

const updateTimetableSchema = Joi.object({
  dayOfWeek: Joi.string().valid('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday').optional(),
  startTime: Joi.string().pattern(/^\d{2}:\d{2}$/).optional(),
  endTime: Joi.string().pattern(/^\d{2}:\d{2}$/).optional(),
  room: Joi.string().optional(),
});

const idParamsSchema = Joi.object({
  id: Joi.string().uuid().required(),
});

const listTimetableSchema = Joi.object({
  classId: Joi.string().uuid().required(),
  page: Joi.number().min(1).optional(),
  pageSize: Joi.number().min(1).max(100).optional(),
  dayOfWeek: Joi.string().valid('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday').optional(),
});

/**
 * @route POST /api/timetable
 * @desc Create a timetable entry
 * @access Private
 */
router.post(
  '/',
  verifyToken,
  validateBody(createTimetableSchema),
  timetableController.createTimetableEntry
);

/**
 * @route GET /api/timetable
 * @desc Get class timetable with optional filtering by day
 * @access Private
 */
router.get(
  '/',
  verifyToken,
  validateQuery(listTimetableSchema),
  timetableController.getClassTimetable
);

/**
 * @route GET /api/timetable/:id
 * @desc Get timetable entry by ID
 * @access Private
 */
router.get(
  '/:id',
  verifyToken,
  validateParams(idParamsSchema),
  timetableController.getTimetableById
);

/**
 * @route PUT /api/timetable/:id
 * @desc Update timetable entry
 * @access Private
 */
router.put(
  '/:id',
  verifyToken,
  validateParams(idParamsSchema),
  validateBody(updateTimetableSchema),
  timetableController.updateTimetableEntry
);

/**
 * @route DELETE /api/timetable/:id
 * @desc Delete timetable entry
 * @access Private
 */
router.delete(
  '/:id',
  verifyToken,
  validateParams(idParamsSchema),
  timetableController.deleteTimetableEntry
);

module.exports = router;
