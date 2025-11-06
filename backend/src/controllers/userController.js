const { v4: uuidv4 } = require('uuid');
const pool = require('../config/database');
const { hashPassword } = require('../utils/hash');
const { sendSuccess, sendCreated, sendError, sendNotFound, sendPaginated } = require('../utils/response');

/**
 * Create a new user (admin invites user)
 * POST /api/users
 */
async function createUser(req, res) {
  const client = await pool.connect();

  try {
    const { schoolId, email, firstName, lastName, phone, role } = req.body;
    const createdByUserId = req.user.userId;

    // Verify requester is admin of the school
    const adminCheck = await client.query(
      'SELECT id FROM users WHERE id = $1 AND school_id = $2 AND role = $3',
      [createdByUserId, schoolId, 'admin']
    );

    if (adminCheck.rows.length === 0) {
      return sendError(res, 403, 'Only school admins can create users', 'PERMISSION_DENIED');
    }

    // Check if user already exists in this school
    const userCheck = await client.query(
      'SELECT id FROM users WHERE school_id = $1 AND email = $2',
      [schoolId, email]
    );

    if (userCheck.rows.length > 0) {
      return sendError(res, 409, 'User already exists in this school', 'DUPLICATE_USER');
    }

    // Generate temporary password
    const tempPassword = uuidv4().substring(0, 12);
    const passwordHash = await hashPassword(tempPassword);

    // Create user
    const userId = uuidv4();
    const now = new Date();

    const result = await client.query(
      `INSERT INTO users (id, school_id, email, password_hash, first_name, last_name, phone, role, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, email, first_name, last_name, phone, role, is_active, created_at`,
      [userId, schoolId, email, passwordHash, firstName, lastName, phone || null, role || 'teacher', now, now]
    );

    const user = result.rows[0];

    return sendCreated(res, {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        role: user.role,
        isActive: user.is_active,
        createdAt: user.created_at,
      },
      temporaryPassword: tempPassword,
      message: 'Please share the temporary password with the user. They should change it on first login.',
    }, 'User created successfully');
  } catch (error) {
    console.error('Create user error:', error);
    return sendError(res, 500, error.message, 'CREATE_USER_ERROR');
  } finally {
    client.release();
  }
}

/**
 * Get all users in a school
 * GET /api/users
 */
async function getAllUsers(req, res) {
  const client = await pool.connect();

  try {
    const schoolId = req.query.schoolId;
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    const role = req.query.role;
    const search = req.query.search || '';

    // Verify user has access to this school
    const schoolCheck = await client.query(
      'SELECT id FROM schools WHERE id = $1',
      [schoolId]
    );

    if (schoolCheck.rows.length === 0) {
      return sendNotFound(res, 'School not found', 'SCHOOL_NOT_FOUND');
    }

    const offset = (page - 1) * pageSize;
    const searchTerm = `%${search}%`;

    let countQuery = 'SELECT COUNT(*) as count FROM users WHERE school_id = $1 AND is_active = true AND (first_name ILIKE $2 OR last_name ILIKE $2 OR email ILIKE $2)';
    let countParams = [schoolId, searchTerm];

    if (role) {
      countQuery += ' AND role = $3';
      countParams.push(role);
    }

    const countResult = await client.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    let dataQuery = `SELECT id, email, first_name, last_name, phone, role, is_active, last_login, created_at
                     FROM users
                     WHERE school_id = $1 AND is_active = true AND (first_name ILIKE $2 OR last_name ILIKE $2 OR email ILIKE $2)`;
    let dataParams = [schoolId, searchTerm];

    if (role) {
      dataQuery += ' AND role = $3';
      dataParams.push(role);
    }

    dataQuery += ' ORDER BY created_at DESC LIMIT $' + (dataParams.length + 1) + ' OFFSET $' + (dataParams.length + 2);
    dataParams.push(pageSize, offset);

    const result = await client.query(dataQuery, dataParams);

    const users = result.rows.map(user => ({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      role: user.role,
      isActive: user.is_active,
      lastLogin: user.last_login,
      createdAt: user.created_at,
    }));

    return sendPaginated(res, users, page, pageSize, total, 'Users retrieved successfully');
  } catch (error) {
    console.error('Get all users error:', error);
    return sendError(res, 500, error.message, 'GET_USERS_ERROR');
  } finally {
    client.release();
  }
}

/**
 * Get user by ID
 * GET /api/users/:id
 */
async function getUserById(req, res) {
  const client = await pool.connect();

  try {
    const { id } = req.params;

    const result = await client.query(
      `SELECT id, school_id, email, first_name, last_name, phone, role, is_active, is_verified, last_login, created_at, updated_at
       FROM users WHERE id = $1 AND is_active = true`,
      [id]
    );

    if (result.rows.length === 0) {
      return sendNotFound(res, 'User not found', 'USER_NOT_FOUND');
    }

    const user = result.rows[0];

    return sendSuccess(res, 200, {
      id: user.id,
      schoolId: user.school_id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      role: user.role,
      isActive: user.is_active,
      isVerified: user.is_verified,
      lastLogin: user.last_login,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    }, 'User retrieved successfully');
  } catch (error) {
    console.error('Get user error:', error);
    return sendError(res, 500, error.message, 'GET_USER_ERROR');
  } finally {
    client.release();
  }
}

/**
 * Update user
 * PUT /api/users/:id
 */
async function updateUser(req, res) {
  const client = await pool.connect();

  try {
    const { id } = req.params;
    const { firstName, lastName, phone, role } = req.body;

    // Check if user exists
    const checkResult = await client.query(
      'SELECT id, school_id FROM users WHERE id = $1 AND is_active = true',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return sendNotFound(res, 'User not found', 'USER_NOT_FOUND');
    }

    const schoolId = checkResult.rows[0].school_id;

    // Verify requester is admin of the same school
    const adminCheck = await client.query(
      'SELECT id FROM users WHERE id = $1 AND school_id = $2 AND role = $3',
      [req.user.userId, schoolId, 'admin']
    );

    if (adminCheck.rows.length === 0) {
      return sendError(res, 403, 'Only school admins can update users', 'PERMISSION_DENIED');
    }

    const now = new Date();
    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    if (firstName !== undefined) {
      updateFields.push(`first_name = $${paramCount}`);
      updateValues.push(firstName);
      paramCount++;
    }
    if (lastName !== undefined) {
      updateFields.push(`last_name = $${paramCount}`);
      updateValues.push(lastName);
      paramCount++;
    }
    if (phone !== undefined) {
      updateFields.push(`phone = $${paramCount}`);
      updateValues.push(phone);
      paramCount++;
    }
    if (role !== undefined) {
      updateFields.push(`role = $${paramCount}`);
      updateValues.push(role);
      paramCount++;
    }

    if (updateFields.length === 0) {
      return sendError(res, 400, 'No fields to update', 'NO_FIELDS_TO_UPDATE');
    }

    updateFields.push(`updated_at = $${paramCount}`);
    updateValues.push(now);
    updateValues.push(id);

    const result = await client.query(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = $${paramCount + 1} RETURNING *`,
      updateValues
    );

    const user = result.rows[0];

    return sendSuccess(res, 200, {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      role: user.role,
      isActive: user.is_active,
      updatedAt: user.updated_at,
    }, 'User updated successfully');
  } catch (error) {
    console.error('Update user error:', error);
    return sendError(res, 500, error.message, 'UPDATE_USER_ERROR');
  } finally {
    client.release();
  }
}

/**
 * Update user role
 * PATCH /api/users/:id/role
 */
async function updateUserRole(req, res) {
  const client = await pool.connect();

  try {
    const { id } = req.params;
    const { role } = req.body;

    // Check if user exists
    const checkResult = await client.query(
      'SELECT id, school_id FROM users WHERE id = $1 AND is_active = true',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return sendNotFound(res, 'User not found', 'USER_NOT_FOUND');
    }

    const schoolId = checkResult.rows[0].school_id;

    // Verify requester is admin of the same school
    const adminCheck = await client.query(
      'SELECT id FROM users WHERE id = $1 AND school_id = $2 AND role = $3',
      [req.user.userId, schoolId, 'admin']
    );

    if (adminCheck.rows.length === 0) {
      return sendError(res, 403, 'Only school admins can change roles', 'PERMISSION_DENIED');
    }

    const now = new Date();
    const result = await client.query(
      'UPDATE users SET role = $1, updated_at = $2 WHERE id = $3 RETURNING *',
      [role, now, id]
    );

    const user = result.rows[0];

    return sendSuccess(res, 200, {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      updatedAt: user.updated_at,
    }, 'User role updated successfully');
  } catch (error) {
    console.error('Update role error:', error);
    return sendError(res, 500, error.message, 'UPDATE_ROLE_ERROR');
  } finally {
    client.release();
  }
}

/**
 * Deactivate user
 * PATCH /api/users/:id/deactivate
 */
async function deactivateUser(req, res) {
  const client = await pool.connect();

  try {
    const { id } = req.params;

    // Check if user exists
    const checkResult = await client.query(
      'SELECT id, school_id FROM users WHERE id = $1 AND is_active = true',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return sendNotFound(res, 'User not found', 'USER_NOT_FOUND');
    }

    const schoolId = checkResult.rows[0].school_id;

    // Verify requester is admin of the same school
    const adminCheck = await client.query(
      'SELECT id FROM users WHERE id = $1 AND school_id = $2 AND role = $3',
      [req.user.userId, schoolId, 'admin']
    );

    if (adminCheck.rows.length === 0) {
      return sendError(res, 403, 'Only school admins can deactivate users', 'PERMISSION_DENIED');
    }

    const now = new Date();
    await client.query(
      'UPDATE users SET is_active = false, updated_at = $1 WHERE id = $2',
      [now, id]
    );

    return sendSuccess(res, 200, null, 'User deactivated successfully');
  } catch (error) {
    console.error('Deactivate user error:', error);
    return sendError(res, 500, error.message, 'DEACTIVATE_USER_ERROR');
  } finally {
    client.release();
  }
}

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  updateUserRole,
  deactivateUser,
};
