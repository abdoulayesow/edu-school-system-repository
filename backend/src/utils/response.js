/**
 * Send a success response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code (default: 200)
 * @param {Object} data - Response data
 * @param {string} message - Response message (default: 'Success')
 */
function sendSuccess(res, statusCode = 200, data = null, message = 'Success') {
  return res.status(statusCode).json({
    status: 'OK',
    message,
    data,
  });
}

/**
 * Send a created response (201)
 * @param {Object} res - Express response object
 * @param {Object} data - Response data
 * @param {string} message - Response message
 */
function sendCreated(res, data, message = 'Resource created successfully') {
  return res.status(201).json({
    status: 'OK',
    message,
    data,
  });
}

/**
 * Send an error response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code (default: 500)
 * @param {string} message - Error message
 * @param {string} code - Error code (default: 'INTERNAL_SERVER_ERROR')
 * @param {Object} errors - Additional error details
 */
function sendError(res, statusCode = 500, message = 'Internal Server Error', code = 'INTERNAL_SERVER_ERROR', errors = null) {
  const response = {
    status: 'ERROR',
    message,
    code,
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
}

/**
 * Send a validation error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {Array} errors - Array of validation errors
 */
function sendValidationError(res, message = 'Validation failed', errors = []) {
  return res.status(400).json({
    status: 'ERROR',
    message,
    code: 'VALIDATION_ERROR',
    errors,
  });
}

/**
 * Send an unauthorized error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {string} code - Error code
 */
function sendUnauthorized(res, message = 'Unauthorized', code = 'AUTH_UNAUTHORIZED') {
  return res.status(401).json({
    status: 'ERROR',
    message,
    code,
  });
}

/**
 * Send a forbidden error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {string} code - Error code
 */
function sendForbidden(res, message = 'Forbidden', code = 'AUTH_FORBIDDEN') {
  return res.status(403).json({
    status: 'ERROR',
    message,
    code,
  });
}

/**
 * Send a not found error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {string} code - Error code
 */
function sendNotFound(res, message = 'Resource not found', code = 'RESOURCE_NOT_FOUND') {
  return res.status(404).json({
    status: 'ERROR',
    message,
    code,
  });
}

/**
 * Send a paginated response
 * @param {Object} res - Express response object
 * @param {Array} data - Array of items
 * @param {number} page - Current page
 * @param {number} pageSize - Items per page
 * @param {number} total - Total number of items
 * @param {string} message - Response message
 */
function sendPaginated(res, data, page, pageSize, total, message = 'Data retrieved successfully') {
  return res.status(200).json({
    status: 'OK',
    message,
    data,
    pagination: {
      page,
      pageSize,
      total,
      pages: Math.ceil(total / pageSize),
    },
  });
}

module.exports = {
  sendSuccess,
  sendCreated,
  sendError,
  sendValidationError,
  sendUnauthorized,
  sendForbidden,
  sendNotFound,
  sendPaginated,
};
