const jwt = require('jsonwebtoken');

/**
 * Generate JWT token
 * @param {Object} payload - Data to encode in token
 * @param {string} expiresIn - Token expiration time (default: 7d)
 * @returns {string} JWT token
 */
function generateToken(payload, expiresIn = process.env.JWT_EXPIRE || '7d') {
  try {
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn,
      algorithm: 'HS256',
    });
    return token;
  } catch (error) {
    throw new Error(`Token generation failed: ${error.message}`);
  }
}

/**
 * Generate refresh token
 * @param {Object} payload - Data to encode in token
 * @param {string} expiresIn - Token expiration time (default: 30d)
 * @returns {string} Refresh JWT token
 */
function generateRefreshToken(payload, expiresIn = process.env.JWT_REFRESH_EXPIRE || '30d') {
  try {
    const token = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn,
      algorithm: 'HS256',
    });
    return token;
  } catch (error) {
    throw new Error(`Refresh token generation failed: ${error.message}`);
  }
}

/**
 * Verify and decode JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'],
    });
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    }
    throw new Error(`Invalid token: ${error.message}`);
  }
}

/**
 * Verify and decode refresh token
 * @param {string} token - Refresh token to verify
 * @returns {Object} Decoded token payload
 */
function verifyRefreshToken(token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET, {
      algorithms: ['HS256'],
    });
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Refresh token has expired');
    }
    throw new Error(`Invalid refresh token: ${error.message}`);
  }
}

/**
 * Decode token without verification (useful for debugging)
 * @param {string} token - JWT token to decode
 * @returns {Object} Decoded token payload
 */
function decodeToken(token) {
  try {
    const decoded = jwt.decode(token);
    return decoded;
  } catch (error) {
    throw new Error(`Token decoding failed: ${error.message}`);
  }
}

module.exports = {
  generateToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken,
  decodeToken,
};
