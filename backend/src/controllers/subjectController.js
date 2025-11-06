const { v4: uuidv4 } = require('uuid');
const pool = require('../config/database');
const { sendSuccess, sendCreated, sendError, sendNotFound, sendPaginated } = require('../utils/response');

/**
 * Create a new subject
 * POST /api/subjects
 */
async function createSubject(req, res) {
  const client = await pool.connect();

  try {
    const { schoolId, name, code } = req.body;

    // Verify school exists
    const schoolCheck = await client.query(
      'SELECT id FROM schools WHERE id = $1 AND is_active = true',
      [schoolId]
    );

    if (schoolCheck.rows.length === 0) {
      return sendError(res, 400, 'School not found', 'SCHOOL_NOT_FOUND');
    }

    // Check if subject already exists in school
    const nameCheck = await client.query(
      'SELECT id FROM subjects WHERE school_id = $1 AND name = $2',
      [schoolId, name]
    );

    if (nameCheck.rows.length > 0) {
      return sendError(res, 409, 'Subject already exists in this school', 'DUPLICATE_SUBJECT');
    }

    // Create subject
    const subjectId = uuidv4();
    const now = new Date();

    const result = await client.query(
      `INSERT INTO subjects (id, school_id, name, code, created_at)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, code, is_active, created_at`,
      [subjectId, schoolId, name, code || null, now]
    );

    const subject = result.rows[0];

    return sendCreated(res, {
      id: subject.id,
      name: subject.name,
      code: subject.code,
      isActive: subject.is_active,
      createdAt: subject.created_at,
    }, 'Subject created successfully');
  } catch (error) {
    console.error('Create subject error:', error);
    return sendError(res, 500, error.message, 'CREATE_SUBJECT_ERROR');
  } finally {
    client.release();
  }
}

/**
 * Get all subjects
 * GET /api/subjects
 */
async function getAllSubjects(req, res) {
  const client = await pool.connect();

  try {
    const schoolId = req.query.schoolId;
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
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

    // Get total count
    const countResult = await client.query(
      'SELECT COUNT(*) as count FROM subjects WHERE school_id = $1 AND is_active = true AND (name ILIKE $2 OR code ILIKE $2)',
      [schoolId, searchTerm]
    );
    const total = parseInt(countResult.rows[0].count);

    // Get paginated results
    const result = await client.query(
      `SELECT id, name, code, is_active, created_at
       FROM subjects
       WHERE school_id = $1 AND is_active = true AND (name ILIKE $2 OR code ILIKE $2)
       ORDER BY name
       LIMIT $3 OFFSET $4`,
      [schoolId, searchTerm, pageSize, offset]
    );

    const subjects = result.rows.map(subject => ({
      id: subject.id,
      name: subject.name,
      code: subject.code,
      isActive: subject.is_active,
      createdAt: subject.created_at,
    }));

    return sendPaginated(res, subjects, page, pageSize, total, 'Subjects retrieved successfully');
  } catch (error) {
    console.error('Get all subjects error:', error);
    return sendError(res, 500, error.message, 'GET_SUBJECTS_ERROR');
  } finally {
    client.release();
  }
}

/**
 * Get subject by ID
 * GET /api/subjects/:id
 */
async function getSubjectById(req, res) {
  const client = await pool.connect();

  try {
    const { id } = req.params;

    const result = await client.query(
      `SELECT id, school_id, name, code, is_active, created_at
       FROM subjects WHERE id = $1 AND is_active = true`,
      [id]
    );

    if (result.rows.length === 0) {
      return sendNotFound(res, 'Subject not found', 'SUBJECT_NOT_FOUND');
    }

    const subject = result.rows[0];

    // Get count of grades for this subject
    const gradesResult = await client.query(
      'SELECT COUNT(*) as count FROM grades WHERE subject_id = $1',
      [id]
    );

    const gradesCount = parseInt(gradesResult.rows[0].count);

    return sendSuccess(res, 200, {
      id: subject.id,
      schoolId: subject.school_id,
      name: subject.name,
      code: subject.code,
      isActive: subject.is_active,
      gradesCount,
      createdAt: subject.created_at,
    }, 'Subject retrieved successfully');
  } catch (error) {
    console.error('Get subject error:', error);
    return sendError(res, 500, error.message, 'GET_SUBJECT_ERROR');
  } finally {
    client.release();
  }
}

/**
 * Update subject
 * PUT /api/subjects/:id
 */
async function updateSubject(req, res) {
  const client = await pool.connect();

  try {
    const { id } = req.params;
    const { name, code } = req.body;

    // Check if subject exists
    const checkResult = await client.query(
      'SELECT id FROM subjects WHERE id = $1 AND is_active = true',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return sendNotFound(res, 'Subject not found', 'SUBJECT_NOT_FOUND');
    }

    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    if (name !== undefined) {
      updateFields.push(`name = $${paramCount}`);
      updateValues.push(name);
      paramCount++;
    }
    if (code !== undefined) {
      updateFields.push(`code = $${paramCount}`);
      updateValues.push(code);
      paramCount++;
    }

    if (updateFields.length === 0) {
      return sendError(res, 400, 'No fields to update', 'NO_FIELDS_TO_UPDATE');
    }

    updateValues.push(id);

    const result = await client.query(
      `UPDATE subjects SET ${updateFields.join(', ')} WHERE id = $${paramCount + 1} RETURNING *`,
      updateValues
    );

    const subject = result.rows[0];

    return sendSuccess(res, 200, {
      id: subject.id,
      name: subject.name,
      code: subject.code,
      isActive: subject.is_active,
    }, 'Subject updated successfully');
  } catch (error) {
    console.error('Update subject error:', error);
    return sendError(res, 500, error.message, 'UPDATE_SUBJECT_ERROR');
  } finally {
    client.release();
  }
}

/**
 * Delete subject (soft delete)
 * DELETE /api/subjects/:id
 */
async function deleteSubject(req, res) {
  const client = await pool.connect();

  try {
    const { id } = req.params;

    // Check if subject exists
    const checkResult = await client.query(
      'SELECT id FROM subjects WHERE id = $1 AND is_active = true',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return sendNotFound(res, 'Subject not found', 'SUBJECT_NOT_FOUND');
    }

    await client.query(
      'UPDATE subjects SET is_active = false WHERE id = $1',
      [id]
    );

    return sendSuccess(res, 200, null, 'Subject deleted successfully');
  } catch (error) {
    console.error('Delete subject error:', error);
    return sendError(res, 500, error.message, 'DELETE_SUBJECT_ERROR');
  } finally {
    client.release();
  }
}

module.exports = {
  createSubject,
  getAllSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject,
};
