const { v4: uuidv4 } = require('uuid');
const pool = require('../config/database');
const { sendSuccess, sendCreated, sendError, sendNotFound, sendPaginated } = require('../utils/response');

/**
 * Create a new class
 * POST /api/classes
 */
async function createClass(req, res) {
  const client = await pool.connect();

  try {
    const { schoolId, name, gradeLevel, teacherId, capacity } = req.body;

    // Verify school exists
    const schoolCheck = await client.query(
      'SELECT id FROM schools WHERE id = $1 AND is_active = true',
      [schoolId]
    );

    if (schoolCheck.rows.length === 0) {
      return sendError(res, 400, 'School not found', 'SCHOOL_NOT_FOUND');
    }

    // Check if class name already exists in school
    const nameCheck = await client.query(
      'SELECT id FROM classes WHERE school_id = $1 AND name = $2',
      [schoolId, name]
    );

    if (nameCheck.rows.length > 0) {
      return sendError(res, 409, 'Class with this name already exists in this school', 'DUPLICATE_CLASS');
    }

    // If teacher is provided, verify teacher exists in same school
    if (teacherId) {
      const teacherCheck = await client.query(
        'SELECT id FROM users WHERE id = $1 AND school_id = $2 AND role = $3 AND is_active = true',
        [teacherId, schoolId, 'teacher']
      );

      if (teacherCheck.rows.length === 0) {
        return sendError(res, 400, 'Teacher not found in this school', 'TEACHER_NOT_FOUND');
      }
    }

    // Create class
    const classId = uuidv4();
    const now = new Date();

    const result = await client.query(
      `INSERT INTO classes (id, school_id, name, grade_level, teacher_id, capacity, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, name, grade_level, teacher_id, capacity, is_active, created_at`,
      [classId, schoolId, name, gradeLevel || null, teacherId || null, capacity || null, now, now]
    );

    const classData = result.rows[0];

    return sendCreated(res, {
      id: classData.id,
      name: classData.name,
      gradeLevel: classData.grade_level,
      teacherId: classData.teacher_id,
      capacity: classData.capacity,
      isActive: classData.is_active,
      createdAt: classData.created_at,
    }, 'Class created successfully');
  } catch (error) {
    console.error('Create class error:', error);
    return sendError(res, 500, error.message, 'CREATE_CLASS_ERROR');
  } finally {
    client.release();
  }
}

/**
 * Get all classes
 * GET /api/classes
 */
async function getAllClasses(req, res) {
  const client = await pool.connect();

  try {
    const schoolId = req.query.schoolId;
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    const gradeLevel = req.query.gradeLevel;
    const search = req.query.search || '';

    // Verify school exists
    const schoolCheck = await client.query(
      'SELECT id FROM schools WHERE id = $1',
      [schoolId]
    );

    if (schoolCheck.rows.length === 0) {
      return sendNotFound(res, 'School not found', 'SCHOOL_NOT_FOUND');
    }

    const offset = (page - 1) * pageSize;
    const searchTerm = `%${search}%`;

    let countQuery = 'SELECT COUNT(*) as count FROM classes WHERE school_id = $1 AND is_active = true AND name ILIKE $2';
    let countParams = [schoolId, searchTerm];

    if (gradeLevel) {
      countQuery += ' AND grade_level = $3';
      countParams.push(gradeLevel);
    }

    const countResult = await client.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    let dataQuery = `SELECT id, name, grade_level, teacher_id, capacity, is_active, created_at
                     FROM classes
                     WHERE school_id = $1 AND is_active = true AND name ILIKE $2`;
    let dataParams = [schoolId, searchTerm];

    if (gradeLevel) {
      dataQuery += ' AND grade_level = $3';
      dataParams.push(gradeLevel);
    }

    dataQuery += ' ORDER BY grade_level, name LIMIT $' + (dataParams.length + 1) + ' OFFSET $' + (dataParams.length + 2);
    dataParams.push(pageSize, offset);

    const result = await client.query(dataQuery, dataParams);

    const classes = result.rows.map(c => ({
      id: c.id,
      name: c.name,
      gradeLevel: c.grade_level,
      teacherId: c.teacher_id,
      capacity: c.capacity,
      isActive: c.is_active,
      createdAt: c.created_at,
    }));

    return sendPaginated(res, classes, page, pageSize, total, 'Classes retrieved successfully');
  } catch (error) {
    console.error('Get all classes error:', error);
    return sendError(res, 500, error.message, 'GET_CLASSES_ERROR');
  } finally {
    client.release();
  }
}

/**
 * Get class by ID with details
 * GET /api/classes/:id
 */
async function getClassById(req, res) {
  const client = await pool.connect();

  try {
    const { id } = req.params;

    const result = await client.query(
      `SELECT id, school_id, name, grade_level, teacher_id, capacity, is_active, created_at, updated_at
       FROM classes WHERE id = $1 AND is_active = true`,
      [id]
    );

    if (result.rows.length === 0) {
      return sendNotFound(res, 'Class not found', 'CLASS_NOT_FOUND');
    }

    const classData = result.rows[0];

    // Get student count
    const studentCountResult = await client.query(
      'SELECT COUNT(*) as count FROM class_students WHERE class_id = $1 AND enrollment_status = $2',
      [id, 'active']
    );

    const studentCount = parseInt(studentCountResult.rows[0].count);

    return sendSuccess(res, 200, {
      id: classData.id,
      schoolId: classData.school_id,
      name: classData.name,
      gradeLevel: classData.grade_level,
      teacherId: classData.teacher_id,
      capacity: classData.capacity,
      isActive: classData.is_active,
      studentCount,
      createdAt: classData.created_at,
      updatedAt: classData.updated_at,
    }, 'Class retrieved successfully');
  } catch (error) {
    console.error('Get class error:', error);
    return sendError(res, 500, error.message, 'GET_CLASS_ERROR');
  } finally {
    client.release();
  }
}

/**
 * Update class
 * PUT /api/classes/:id
 */
async function updateClass(req, res) {
  const client = await pool.connect();

  try {
    const { id } = req.params;
    const { name, gradeLevel, teacherId, capacity } = req.body;

    // Check if class exists
    const checkResult = await client.query(
      'SELECT id FROM classes WHERE id = $1 AND is_active = true',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return sendNotFound(res, 'Class not found', 'CLASS_NOT_FOUND');
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
    if (gradeLevel !== undefined) {
      updateFields.push(`grade_level = $${paramCount}`);
      updateValues.push(gradeLevel);
      paramCount++;
    }
    if (teacherId !== undefined) {
      updateFields.push(`teacher_id = $${paramCount}`);
      updateValues.push(teacherId);
      paramCount++;
    }
    if (capacity !== undefined) {
      updateFields.push(`capacity = $${paramCount}`);
      updateValues.push(capacity);
      paramCount++;
    }

    if (updateFields.length === 0) {
      return sendError(res, 400, 'No fields to update', 'NO_FIELDS_TO_UPDATE');
    }

    updateFields.push(`updated_at = $${paramCount}`);
    updateValues.push(now);
    updateValues.push(id);

    const result = await client.query(
      `UPDATE classes SET ${updateFields.join(', ')} WHERE id = $${paramCount + 1} RETURNING *`,
      updateValues
    );

    const classData = result.rows[0];

    return sendSuccess(res, 200, {
      id: classData.id,
      name: classData.name,
      gradeLevel: classData.grade_level,
      teacherId: classData.teacher_id,
      capacity: classData.capacity,
      isActive: classData.is_active,
      updatedAt: classData.updated_at,
    }, 'Class updated successfully');
  } catch (error) {
    console.error('Update class error:', error);
    return sendError(res, 500, error.message, 'UPDATE_CLASS_ERROR');
  } finally {
    client.release();
  }
}

/**
 * Delete class (soft delete)
 * DELETE /api/classes/:id
 */
async function deleteClass(req, res) {
  const client = await pool.connect();

  try {
    const { id } = req.params;

    // Check if class exists
    const checkResult = await client.query(
      'SELECT id FROM classes WHERE id = $1 AND is_active = true',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return sendNotFound(res, 'Class not found', 'CLASS_NOT_FOUND');
    }

    const now = new Date();
    await client.query(
      'UPDATE classes SET is_active = false, updated_at = $1 WHERE id = $2',
      [now, id]
    );

    return sendSuccess(res, 200, null, 'Class deleted successfully');
  } catch (error) {
    console.error('Delete class error:', error);
    return sendError(res, 500, error.message, 'DELETE_CLASS_ERROR');
  } finally {
    client.release();
  }
}

module.exports = {
  createClass,
  getAllClasses,
  getClassById,
  updateClass,
  deleteClass,
};
