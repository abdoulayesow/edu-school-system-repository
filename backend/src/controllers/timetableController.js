const { v4: uuidv4 } = require('uuid');
const pool = require('../config/database');
const { sendSuccess, sendCreated, sendError, sendNotFound, sendPaginated } = require('../utils/response');

/**
 * Create a timetable entry
 * POST /api/timetable
 */
async function createTimetableEntry(req, res) {
  const client = await pool.connect();

  try {
    const { schoolId, classId, subjectId, teacherId, dayOfWeek, startTime, endTime, room } = req.body;

    // Verify all referenced resources exist
    const [classRes, subjectRes, teacherRes] = await Promise.all([
      client.query('SELECT id FROM classes WHERE id = $1 AND school_id = $2', [classId, schoolId]),
      client.query('SELECT id FROM subjects WHERE id = $1 AND school_id = $2', [subjectId, schoolId]),
      client.query('SELECT id FROM users WHERE id = $1 AND school_id = $2 AND role = $3', [teacherId, schoolId, 'teacher']),
    ]);

    if (classRes.rows.length === 0) {
      return sendError(res, 400, 'Class not found', 'CLASS_NOT_FOUND');
    }
    if (subjectRes.rows.length === 0) {
      return sendError(res, 400, 'Subject not found', 'SUBJECT_NOT_FOUND');
    }
    if (teacherRes.rows.length === 0) {
      return sendError(res, 400, 'Teacher not found', 'TEACHER_NOT_FOUND');
    }

    // Create timetable entry
    const timetableId = uuidv4();
    const now = new Date();

    const result = await client.query(
      `INSERT INTO timetable (id, school_id, class_id, subject_id, teacher_id, day_of_week, start_time, end_time, room, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING id, day_of_week, start_time, end_time, room, is_active, created_at`,
      [timetableId, schoolId, classId, subjectId, teacherId, dayOfWeek, startTime, endTime, room || null, now, now]
    );

    const entry = result.rows[0];

    return sendCreated(res, {
      id: entry.id,
      dayOfWeek: entry.day_of_week,
      startTime: entry.start_time,
      endTime: entry.end_time,
      room: entry.room,
      isActive: entry.is_active,
      createdAt: entry.created_at,
    }, 'Timetable entry created successfully');
  } catch (error) {
    console.error('Create timetable error:', error);
    return sendError(res, 500, error.message, 'CREATE_TIMETABLE_ERROR');
  } finally {
    client.release();
  }
}

/**
 * Get timetable for a class
 * GET /api/timetable?classId=uuid
 */
async function getClassTimetable(req, res) {
  const client = await pool.connect();

  try {
    const classId = req.query.classId;
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    const dayOfWeek = req.query.dayOfWeek;

    // Verify class exists
    const classCheck = await client.query(
      'SELECT id, school_id FROM classes WHERE id = $1 AND is_active = true',
      [classId]
    );

    if (classCheck.rows.length === 0) {
      return sendNotFound(res, 'Class not found', 'CLASS_NOT_FOUND');
    }

    const offset = (page - 1) * pageSize;

    let countQuery = 'SELECT COUNT(*) as count FROM timetable WHERE class_id = $1 AND is_active = true';
    let countParams = [classId];

    if (dayOfWeek) {
      countQuery += ' AND day_of_week = $2';
      countParams.push(dayOfWeek);
    }

    const countResult = await client.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    let dataQuery = `SELECT timetable.id, timetable.day_of_week, timetable.start_time, timetable.end_time, timetable.room,
                            subjects.name as subject_name, users.first_name, users.last_name
                     FROM timetable
                     JOIN subjects ON timetable.subject_id = subjects.id
                     JOIN users ON timetable.teacher_id = users.id
                     WHERE timetable.class_id = $1 AND timetable.is_active = true`;
    let dataParams = [classId];

    if (dayOfWeek) {
      dataQuery += ' AND timetable.day_of_week = $2';
      dataParams.push(dayOfWeek);
    }

    dataQuery += ' ORDER BY CASE timetable.day_of_week
                            WHEN \'Monday\' THEN 1
                            WHEN \'Tuesday\' THEN 2
                            WHEN \'Wednesday\' THEN 3
                            WHEN \'Thursday\' THEN 4
                            WHEN \'Friday\' THEN 5
                            WHEN \'Saturday\' THEN 6
                            WHEN \'Sunday\' THEN 7
                          END, timetable.start_time
                  LIMIT $' + (dataParams.length + 1) + ' OFFSET $' + (dataParams.length + 2);
    dataParams.push(pageSize, offset);

    const result = await client.query(dataQuery, dataParams);

    const timetable = result.rows.map(entry => ({
      id: entry.id,
      dayOfWeek: entry.day_of_week,
      startTime: entry.start_time,
      endTime: entry.end_time,
      room: entry.room,
      subjectName: entry.subject_name,
      teacherName: `${entry.first_name} ${entry.last_name}`,
    }));

    return sendPaginated(res, timetable, page, pageSize, total, 'Timetable retrieved successfully');
  } catch (error) {
    console.error('Get timetable error:', error);
    return sendError(res, 500, error.message, 'GET_TIMETABLE_ERROR');
  } finally {
    client.release();
  }
}

/**
 * Get timetable by ID
 * GET /api/timetable/:id
 */
async function getTimetableById(req, res) {
  const client = await pool.connect();

  try {
    const { id } = req.params;

    const result = await client.query(
      `SELECT timetable.id, timetable.class_id, timetable.subject_id, timetable.teacher_id,
              timetable.day_of_week, timetable.start_time, timetable.end_time, timetable.room,
              classes.name as class_name, subjects.name as subject_name,
              users.first_name, users.last_name
       FROM timetable
       JOIN classes ON timetable.class_id = classes.id
       JOIN subjects ON timetable.subject_id = subjects.id
       JOIN users ON timetable.teacher_id = users.id
       WHERE timetable.id = $1 AND timetable.is_active = true`,
      [id]
    );

    if (result.rows.length === 0) {
      return sendNotFound(res, 'Timetable entry not found', 'TIMETABLE_NOT_FOUND');
    }

    const entry = result.rows[0];

    return sendSuccess(res, 200, {
      id: entry.id,
      classId: entry.class_id,
      className: entry.class_name,
      subjectId: entry.subject_id,
      subjectName: entry.subject_name,
      teacherId: entry.teacher_id,
      teacherName: `${entry.first_name} ${entry.last_name}`,
      dayOfWeek: entry.day_of_week,
      startTime: entry.start_time,
      endTime: entry.end_time,
      room: entry.room,
    }, 'Timetable entry retrieved successfully');
  } catch (error) {
    console.error('Get timetable by ID error:', error);
    return sendError(res, 500, error.message, 'GET_TIMETABLE_ERROR');
  } finally {
    client.release();
  }
}

/**
 * Update timetable entry
 * PUT /api/timetable/:id
 */
async function updateTimetableEntry(req, res) {
  const client = await pool.connect();

  try {
    const { id } = req.params;
    const { dayOfWeek, startTime, endTime, room } = req.body;

    // Check if entry exists
    const checkResult = await client.query(
      'SELECT id FROM timetable WHERE id = $1 AND is_active = true',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return sendNotFound(res, 'Timetable entry not found', 'TIMETABLE_NOT_FOUND');
    }

    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    if (dayOfWeek !== undefined) {
      updateFields.push(`day_of_week = $${paramCount}`);
      updateValues.push(dayOfWeek);
      paramCount++;
    }
    if (startTime !== undefined) {
      updateFields.push(`start_time = $${paramCount}`);
      updateValues.push(startTime);
      paramCount++;
    }
    if (endTime !== undefined) {
      updateFields.push(`end_time = $${paramCount}`);
      updateValues.push(endTime);
      paramCount++;
    }
    if (room !== undefined) {
      updateFields.push(`room = $${paramCount}`);
      updateValues.push(room);
      paramCount++;
    }

    if (updateFields.length === 0) {
      return sendError(res, 400, 'No fields to update', 'NO_FIELDS_TO_UPDATE');
    }

    updateFields.push(`updated_at = $${paramCount}`);
    updateValues.push(new Date());
    updateValues.push(id);

    const result = await client.query(
      `UPDATE timetable SET ${updateFields.join(', ')} WHERE id = $${paramCount + 1} RETURNING *`,
      updateValues
    );

    const entry = result.rows[0];

    return sendSuccess(res, 200, {
      id: entry.id,
      dayOfWeek: entry.day_of_week,
      startTime: entry.start_time,
      endTime: entry.end_time,
      room: entry.room,
      updatedAt: entry.updated_at,
    }, 'Timetable entry updated successfully');
  } catch (error) {
    console.error('Update timetable error:', error);
    return sendError(res, 500, error.message, 'UPDATE_TIMETABLE_ERROR');
  } finally {
    client.release();
  }
}

/**
 * Delete timetable entry
 * DELETE /api/timetable/:id
 */
async function deleteTimetableEntry(req, res) {
  const client = await pool.connect();

  try {
    const { id } = req.params;

    // Check if entry exists
    const checkResult = await client.query(
      'SELECT id FROM timetable WHERE id = $1 AND is_active = true',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return sendNotFound(res, 'Timetable entry not found', 'TIMETABLE_NOT_FOUND');
    }

    await client.query(
      'UPDATE timetable SET is_active = false, updated_at = $1 WHERE id = $2',
      [new Date(), id]
    );

    return sendSuccess(res, 200, null, 'Timetable entry deleted successfully');
  } catch (error) {
    console.error('Delete timetable error:', error);
    return sendError(res, 500, error.message, 'DELETE_TIMETABLE_ERROR');
  } finally {
    client.release();
  }
}

module.exports = {
  createTimetableEntry,
  getClassTimetable,
  getTimetableById,
  updateTimetableEntry,
  deleteTimetableEntry,
};
