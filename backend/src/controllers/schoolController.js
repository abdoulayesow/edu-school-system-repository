const { v4: uuidv4 } = require('uuid');
const pool = require('../config/database');
const { sendSuccess, sendCreated, sendError, sendNotFound, sendPaginated } = require('../utils/response');

/**
 * Create a new school
 * POST /api/schools
 */
async function createSchool(req, res) {
  const client = await pool.connect();

  try {
    const { name, email, phone, country, city, address, subscriptionPlan } = req.body;

    // Check if school with email already exists
    const emailCheck = await client.query(
      'SELECT id FROM schools WHERE email = $1',
      [email]
    );

    if (emailCheck.rows.length > 0) {
      return sendError(res, 409, 'School with this email already exists', 'DUPLICATE_SCHOOL');
    }

    // Create school
    const schoolId = uuidv4();
    const now = new Date();

    const result = await client.query(
      `INSERT INTO schools (id, name, email, phone, country, city, address, subscription_plan, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, name, email, phone, country, city, address, subscription_plan, is_active, created_at`,
      [schoolId, name, email, phone || null, country || null, city || null, address || null, subscriptionPlan || 'Premium', now, now]
    );

    const school = result.rows[0];

    return sendCreated(res, {
      id: school.id,
      name: school.name,
      email: school.email,
      phone: school.phone,
      country: school.country,
      city: school.city,
      address: school.address,
      subscriptionPlan: school.subscription_plan,
      isActive: school.is_active,
      createdAt: school.created_at,
    }, 'School created successfully');
  } catch (error) {
    console.error('Create school error:', error);
    return sendError(res, 500, error.message, 'CREATE_SCHOOL_ERROR');
  } finally {
    client.release();
  }
}

/**
 * Get all schools
 * GET /api/schools
 */
async function getAllSchools(req, res) {
  const client = await pool.connect();

  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    const search = req.query.search || '';

    const offset = (page - 1) * pageSize;

    // Get total count
    const countResult = await client.query(
      'SELECT COUNT(*) as count FROM schools WHERE is_active = true AND (name ILIKE $1 OR email ILIKE $1)',
      [`%${search}%`]
    );
    const total = parseInt(countResult.rows[0].count);

    // Get paginated results
    const result = await client.query(
      `SELECT id, name, email, phone, country, city, subscription_plan, is_active, created_at
       FROM schools
       WHERE is_active = true AND (name ILIKE $1 OR email ILIKE $1)
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [`%${search}%`, pageSize, offset]
    );

    const schools = result.rows.map(school => ({
      id: school.id,
      name: school.name,
      email: school.email,
      phone: school.phone,
      country: school.country,
      city: school.city,
      subscriptionPlan: school.subscription_plan,
      isActive: school.is_active,
      createdAt: school.created_at,
    }));

    return sendPaginated(res, schools, page, pageSize, total, 'Schools retrieved successfully');
  } catch (error) {
    console.error('Get all schools error:', error);
    return sendError(res, 500, error.message, 'GET_SCHOOLS_ERROR');
  } finally {
    client.release();
  }
}

/**
 * Get school by ID
 * GET /api/schools/:id
 */
async function getSchoolById(req, res) {
  const client = await pool.connect();

  try {
    const { id } = req.params;

    const result = await client.query(
      `SELECT id, name, email, phone, country, city, address, subscription_plan, is_active, created_at, updated_at
       FROM schools WHERE id = $1 AND is_active = true`,
      [id]
    );

    if (result.rows.length === 0) {
      return sendNotFound(res, 'School not found', 'SCHOOL_NOT_FOUND');
    }

    const school = result.rows[0];

    // Get school statistics
    const statsResult = await client.query(
      `SELECT
        (SELECT COUNT(*) FROM users WHERE school_id = $1) as users_count,
        (SELECT COUNT(*) FROM students WHERE school_id = $1) as students_count,
        (SELECT COUNT(*) FROM classes WHERE school_id = $1) as classes_count`,
      [id]
    );

    const stats = statsResult.rows[0];

    return sendSuccess(res, 200, {
      id: school.id,
      name: school.name,
      email: school.email,
      phone: school.phone,
      country: school.country,
      city: school.city,
      address: school.address,
      subscriptionPlan: school.subscription_plan,
      isActive: school.is_active,
      createdAt: school.created_at,
      updatedAt: school.updated_at,
      statistics: {
        usersCount: parseInt(stats.users_count),
        studentsCount: parseInt(stats.students_count),
        classesCount: parseInt(stats.classes_count),
      },
    }, 'School retrieved successfully');
  } catch (error) {
    console.error('Get school error:', error);
    return sendError(res, 500, error.message, 'GET_SCHOOL_ERROR');
  } finally {
    client.release();
  }
}

/**
 * Update school
 * PUT /api/schools/:id
 */
async function updateSchool(req, res) {
  const client = await pool.connect();

  try {
    const { id } = req.params;
    const { name, email, phone, country, city, address, subscriptionPlan } = req.body;

    // Check if school exists
    const checkResult = await client.query(
      'SELECT id FROM schools WHERE id = $1 AND is_active = true',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return sendNotFound(res, 'School not found', 'SCHOOL_NOT_FOUND');
    }

    // Check if email is already used by another school
    if (email) {
      const emailCheck = await client.query(
        'SELECT id FROM schools WHERE email = $1 AND id != $2',
        [email, id]
      );

      if (emailCheck.rows.length > 0) {
        return sendError(res, 409, 'Email already used by another school', 'DUPLICATE_EMAIL');
      }
    }

    const now = new Date();
    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    if (name !== undefined) {
      updateFields.push(`name = $${paramCount}`);
      updateValues.push(name);
      paramCount++;
    }
    if (email !== undefined) {
      updateFields.push(`email = $${paramCount}`);
      updateValues.push(email);
      paramCount++;
    }
    if (phone !== undefined) {
      updateFields.push(`phone = $${paramCount}`);
      updateValues.push(phone);
      paramCount++;
    }
    if (country !== undefined) {
      updateFields.push(`country = $${paramCount}`);
      updateValues.push(country);
      paramCount++;
    }
    if (city !== undefined) {
      updateFields.push(`city = $${paramCount}`);
      updateValues.push(city);
      paramCount++;
    }
    if (address !== undefined) {
      updateFields.push(`address = $${paramCount}`);
      updateValues.push(address);
      paramCount++;
    }
    if (subscriptionPlan !== undefined) {
      updateFields.push(`subscription_plan = $${paramCount}`);
      updateValues.push(subscriptionPlan);
      paramCount++;
    }

    updateFields.push(`updated_at = $${paramCount}`);
    updateValues.push(now);
    updateValues.push(id);

    const result = await client.query(
      `UPDATE schools SET ${updateFields.join(', ')} WHERE id = $${paramCount + 1} RETURNING *`,
      updateValues
    );

    const school = result.rows[0];

    return sendSuccess(res, 200, {
      id: school.id,
      name: school.name,
      email: school.email,
      phone: school.phone,
      country: school.country,
      city: school.city,
      address: school.address,
      subscriptionPlan: school.subscription_plan,
      isActive: school.is_active,
      createdAt: school.created_at,
      updatedAt: school.updated_at,
    }, 'School updated successfully');
  } catch (error) {
    console.error('Update school error:', error);
    return sendError(res, 500, error.message, 'UPDATE_SCHOOL_ERROR');
  } finally {
    client.release();
  }
}

/**
 * Delete (soft delete) school
 * DELETE /api/schools/:id
 */
async function deleteSchool(req, res) {
  const client = await pool.connect();

  try {
    const { id } = req.params;

    // Check if school exists
    const checkResult = await client.query(
      'SELECT id FROM schools WHERE id = $1 AND is_active = true',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return sendNotFound(res, 'School not found', 'SCHOOL_NOT_FOUND');
    }

    // Soft delete school
    const now = new Date();
    await client.query(
      'UPDATE schools SET is_active = false, deleted_at = $1, updated_at = $2 WHERE id = $3',
      [now, now, id]
    );

    return sendSuccess(res, 200, null, 'School deleted successfully');
  } catch (error) {
    console.error('Delete school error:', error);
    return sendError(res, 500, error.message, 'DELETE_SCHOOL_ERROR');
  } finally {
    client.release();
  }
}

module.exports = {
  createSchool,
  getAllSchools,
  getSchoolById,
  updateSchool,
  deleteSchool,
};
