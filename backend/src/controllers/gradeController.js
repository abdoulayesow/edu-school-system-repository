const { v4: uuidv4 } = require('uuid');
const pool = require('../config/database');
const { sendSuccess, sendCreated, sendError, sendNotFound, sendPaginated } = require('../utils/response');

// Function to convert score to grade letter
function getGradeLetter(score) {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

/**
 * Record a student grade
 * POST /api/grades
 */
async function createGrade(req, res) {
  const client = await pool.connect();

  try {
    const { schoolId, studentId, subjectId, classId, score, term, academicYear, notes } = req.body;
    const teacherId = req.user.userId;

    // Verify teacher is from the same school
    const teacherCheck = await client.query(
      'SELECT id FROM users WHERE id = $1 AND school_id = $2 AND role = $3 AND is_active = true',
      [teacherId, schoolId, 'teacher']
    );

    if (teacherCheck.rows.length === 0) {
      return sendError(res, 403, 'Only teachers can record grades', 'PERMISSION_DENIED');
    }

    // Verify student, subject, and class exist
    const [studentRes, subjectRes, classRes] = await Promise.all([
      client.query('SELECT id FROM students WHERE id = $1 AND school_id = $2', [studentId, schoolId]),
      client.query('SELECT id FROM subjects WHERE id = $1 AND school_id = $2', [subjectId, schoolId]),
      client.query('SELECT id FROM classes WHERE id = $1 AND school_id = $2', [classId, schoolId]),
    ]);

    if (studentRes.rows.length === 0) {
      return sendError(res, 400, 'Student not found', 'STUDENT_NOT_FOUND');
    }
    if (subjectRes.rows.length === 0) {
      return sendError(res, 400, 'Subject not found', 'SUBJECT_NOT_FOUND');
    }
    if (classRes.rows.length === 0) {
      return sendError(res, 400, 'Class not found', 'CLASS_NOT_FOUND');
    }

    // Calculate grade letter
    const gradeLetter = getGradeLetter(score);

    // Create grade
    const gradeId = uuidv4();
    const now = new Date();

    const result = await client.query(
      `INSERT INTO grades (id, school_id, student_id, subject_id, class_id, teacher_id, score, grade_letter, term, academic_year, notes, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING id, score, grade_letter, term, academic_year, is_finalized, created_at`,
      [gradeId, schoolId, studentId, subjectId, classId, teacherId, score, gradeLetter, term, academicYear, notes || null, now, now]
    );

    const grade = result.rows[0];

    return sendCreated(res, {
      id: grade.id,
      studentId,
      subjectId,
      classId,
      teacherId,
      score: grade.score,
      gradeLetter: grade.grade_letter,
      term: grade.term,
      academicYear: grade.academic_year,
      isFinalized: grade.is_finalized,
      createdAt: grade.created_at,
    }, 'Grade recorded successfully');
  } catch (error) {
    console.error('Create grade error:', error);
    return sendError(res, 500, error.message, 'CREATE_GRADE_ERROR');
  } finally {
    client.release();
  }
}

/**
 * Get grades for a student
 * GET /api/grades/student/:studentId
 */
async function getStudentGrades(req, res) {
  const client = await pool.connect();

  try {
    const { studentId } = req.params;
    const academicYear = req.query.academicYear;
    const term = req.query.term;

    // Verify student exists
    const studentCheck = await client.query(
      'SELECT id FROM students WHERE id = $1 AND is_active = true',
      [studentId]
    );

    if (studentCheck.rows.length === 0) {
      return sendNotFound(res, 'Student not found', 'STUDENT_NOT_FOUND');
    }

    let query = `SELECT grades.id, grades.subject_id, grades.score, grades.grade_letter, grades.term, grades.academic_year,
                        grades.is_finalized, subjects.name as subject_name, created_at
                 FROM grades
                 JOIN subjects ON grades.subject_id = subjects.id
                 WHERE grades.student_id = $1`;
    let params = [studentId];

    if (academicYear) {
      query += ' AND grades.academic_year = $' + (params.length + 1);
      params.push(academicYear);
    }

    if (term) {
      query += ' AND grades.term = $' + (params.length + 1);
      params.push(term);
    }

    query += ' ORDER BY grades.academic_year DESC, grades.term DESC, subjects.name';

    const result = await client.query(query, params);

    const grades = result.rows.map(g => ({
      id: g.id,
      subjectId: g.subject_id,
      subjectName: g.subject_name,
      score: parseFloat(g.score),
      gradeLetter: g.grade_letter,
      term: g.term,
      academicYear: g.academic_year,
      isFinalized: g.is_finalized,
      createdAt: g.created_at,
    }));

    return sendSuccess(res, 200, grades, 'Student grades retrieved successfully');
  } catch (error) {
    console.error('Get student grades error:', error);
    return sendError(res, 500, error.message, 'GET_GRADES_ERROR');
  } finally {
    client.release();
  }
}

/**
 * Get grades for a class and subject
 * GET /api/grades/class/:classId
 */
async function getClassGrades(req, res) {
  const client = await pool.connect();

  try {
    const { classId } = req.params;
    const subjectId = req.query.subjectId;
    const academicYear = req.query.academicYear;
    const term = req.query.term;

    // Verify class exists
    const classCheck = await client.query(
      'SELECT id FROM classes WHERE id = $1 AND is_active = true',
      [classId]
    );

    if (classCheck.rows.length === 0) {
      return sendNotFound(res, 'Class not found', 'CLASS_NOT_FOUND');
    }

    let query = `SELECT grades.id, grades.student_id, grades.score, grades.grade_letter,
                        students.first_name, students.last_name, subjects.name as subject_name
                 FROM grades
                 JOIN students ON grades.student_id = students.id
                 JOIN subjects ON grades.subject_id = subjects.id
                 WHERE grades.class_id = $1`;
    let params = [classId];

    if (subjectId) {
      query += ' AND grades.subject_id = $' + (params.length + 1);
      params.push(subjectId);
    }

    if (academicYear) {
      query += ' AND grades.academic_year = $' + (params.length + 1);
      params.push(academicYear);
    }

    if (term) {
      query += ' AND grades.term = $' + (params.length + 1);
      params.push(term);
    }

    query += ' ORDER BY students.last_name, students.first_name';

    const result = await client.query(query, params);

    const grades = result.rows.map(g => ({
      id: g.id,
      studentId: g.student_id,
      studentName: `${g.first_name} ${g.last_name}`,
      subjectName: g.subject_name,
      score: parseFloat(g.score),
      gradeLetter: g.grade_letter,
    }));

    return sendSuccess(res, 200, grades, 'Class grades retrieved successfully');
  } catch (error) {
    console.error('Get class grades error:', error);
    return sendError(res, 500, error.message, 'GET_CLASS_GRADES_ERROR');
  } finally {
    client.release();
  }
}

/**
 * Update a grade
 * PUT /api/grades/:id
 */
async function updateGrade(req, res) {
  const client = await pool.connect();

  try {
    const { id } = req.params;
    const { score, notes } = req.body;
    const teacherId = req.user.userId;

    // Check if grade exists and teacher owns it
    const gradeCheck = await client.query(
      'SELECT id, is_finalized FROM grades WHERE id = $1 AND teacher_id = $2',
      [id, teacherId]
    );

    if (gradeCheck.rows.length === 0) {
      return sendNotFound(res, 'Grade not found or you do not have permission to edit it', 'GRADE_NOT_FOUND');
    }

    if (gradeCheck.rows[0].is_finalized) {
      return sendError(res, 409, 'Cannot update finalized grades', 'GRADE_FINALIZED');
    }

    const now = new Date();
    const gradeLetter = getGradeLetter(score);

    const result = await client.query(
      'UPDATE grades SET score = $1, grade_letter = $2, notes = $3, updated_at = $4 WHERE id = $5 RETURNING *',
      [score, gradeLetter, notes || null, now, id]
    );

    const grade = result.rows[0];

    return sendSuccess(res, 200, {
      id: grade.id,
      score: parseFloat(grade.score),
      gradeLetter: grade.grade_letter,
      notes: grade.notes,
      updatedAt: grade.updated_at,
    }, 'Grade updated successfully');
  } catch (error) {
    console.error('Update grade error:', error);
    return sendError(res, 500, error.message, 'UPDATE_GRADE_ERROR');
  } finally {
    client.release();
  }
}

/**
 * Finalize grade (lock from further edits)
 * PATCH /api/grades/:id/finalize
 */
async function finalizeGrade(req, res) {
  const client = await pool.connect();

  try {
    const { id } = req.params;

    // Check if grade exists
    const gradeCheck = await client.query(
      'SELECT id FROM grades WHERE id = $1',
      [id]
    );

    if (gradeCheck.rows.length === 0) {
      return sendNotFound(res, 'Grade not found', 'GRADE_NOT_FOUND');
    }

    const now = new Date();
    await client.query(
      'UPDATE grades SET is_finalized = true, updated_at = $1 WHERE id = $2',
      [now, id]
    );

    return sendSuccess(res, 200, null, 'Grade finalized successfully');
  } catch (error) {
    console.error('Finalize grade error:', error);
    return sendError(res, 500, error.message, 'FINALIZE_GRADE_ERROR');
  } finally {
    client.release();
  }
}

module.exports = {
  createGrade,
  getStudentGrades,
  getClassGrades,
  updateGrade,
  finalizeGrade,
};
