const Joi = require('joi');

/**
 * Middleware to validate request body against a schema
 * @param {Object} schema - Joi validation schema
 * @returns {Function} Express middleware
 */
const validateBody = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const messages = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return res.status(400).json({
        status: 'ERROR',
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        errors: messages,
      });
    }

    // Replace req.body with validated value
    req.body = value;
    next();
  };
};

/**
 * Middleware to validate request query against a schema
 * @param {Object} schema - Joi validation schema
 * @returns {Function} Express middleware
 */
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const messages = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return res.status(400).json({
        status: 'ERROR',
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        errors: messages,
      });
    }

    req.query = value;
    next();
  };
};

/**
 * Middleware to validate request params against a schema
 * @param {Object} schema - Joi validation schema
 * @returns {Function} Express middleware
 */
const validateParams = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const messages = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return res.status(400).json({
        status: 'ERROR',
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        errors: messages,
      });
    }

    req.params = value;
    next();
  };
};

module.exports = {
  validateBody,
  validateQuery,
  validateParams,
};
