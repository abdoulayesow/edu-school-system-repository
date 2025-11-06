const { v4: uuidv4 } = require('uuid');
const pool = require('../config/database');
const { sendSuccess, sendCreated, sendError, sendNotFound, sendPaginated } = require('../utils/response');

/**
 * Create a new student
 * POST /api/students
 */
async function createStudent(req, res) {
  const client = await pool.connect();

  try {
    const { schoolId, firstName, lastName, email, phone, dateOfBirth, gender, enrollmentDate, address, parentId } = req.body;

    // Verify school exists
    const schoolCheck = await client.query(
      'SELECT id FROM schools WHERE id = $1 AND is_active = true',
      [schoolId]
    );

    if (schoolCheck.rows.length === 0) {
      return sendError(res, 400, 'School not found', 'SCHOOL_NOT_FOUND');
    }

    // If parentId provided, verify parent exists in the same school
    if (parentId) {
      const parentCheck = await client.query(
        'SELECT id FROM users WHERE id = $1 AND school_id = $2 AND role = $3 AND is_active = true',
        [parentId, schoolId, 'parent']
      );

      if (parentCheck.rows.length === 0) {
        return sendError(res, 400, 'Parent user not found in this school', 'PARENT_NOT_FOUND');
      }
    }

    // Create student
    const studentId = uuidv4();
    const now = new Date();

    const result = await client.query(
      `INSERT INTO students (id, school_id, first_name, last_name, email, phone, date_of_birth, gender, enrollment_date, address, parent_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING id, first_name, last_name, email, phone, date_of_birth, gender, enrollment_date, address, parent_id, is_active, created_at`,
      [studentId, schoolId, firstName, lastName, email || null, phone || null, dateOfBirth || null, gender || null, enrollmentDate || null, address || null, parentId || null, now, now]
    );

    const student = result.rows[0];

    return sendCreated(res, {
      id: student.id,
      firstName: student.first_name,
      lastName: student.last_name,
      email: student.email,
      phone: student.phone,
      dateOfBirth: student.date_of_birth,
      gender: student.gender,
      enrollmentDate: student.enrollment_date,
      address: student.address,
      parentId: student.parent_id,
      isActive: student.is_active,
      createdAt: student.created_at,
    }, 'Student created successfully');
  } catch (error) {
    console.error('Create student error:', error);
    return sendError(res, 500, error.message, 'CREATE_STUDENT_ERROR');
  } finally {
    client.release();
  }
}

/**
 * Get all students in a school
 * GET /api/students
 */
async function getAllStudents(req, res) {
  const client = await pool.connect();

  try {
    const schoolId = req.query.schoolId;
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    const classId = req.query.classId;
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

    let countQuery = 'SELECT COUNT(*) as count FROM students WHERE school_id = $1 AND is_active = true AND (first_name ILIKE $2 OR last_name ILIKE $2 OR email ILIKE $2)';
    let countParams = [schoolId, searchTerm];

    if (classId) {
      countQuery = `SELECT COUNT(DISTINCT students.id) as count FROM students
                    JOIN class_students ON students.id = class_students.student_id
                    WHERE students.school_id = $1 AND students.is_active = true
                    AND class_students.class_id = $3
                    AND (students.first_name ILIKE $2 OR students.last_name ILIKE $2 OR students.email ILIKE $2)`;
      countParams = [schoolId, searchTerm, classId];
    }

    const countResult = await client.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    let dataQuery = `SELECT id, first_name, last_name, email, phone, date_of_birth, gender, enrollment_date, parent_id, is_active, created_at
                     FROM students
                     WHERE school_id = $1 AND is_active = true AND (first_name ILIKE $2 OR last_name ILIKE $2 OR email ILIKE $2)`;
    let dataParams = [schoolId, searchTerm];

    if (classId) {
      dataQuery = `SELECT DISTINCT students.id, students.first_name, students.last_name, students.email, students.phone, students.date_of_birth,
                          students.gender, students.enrollment_date, students.parent_id, students.is_active, students.created_at
                    FROM students
                    JOIN class_students ON students.id = class_students.student_id
                    WHERE students.school_id = $1 AND students.is_active = true
                    AND class_students.class_id = $3
                    AND (students.first_name ILIKE $2 OR students.last_name ILIKE $2 OR students.email ILIKE $2)`;
      dataParams = [schoolId, searchTerm, classId];
    }

    dataQuery += ' ORDER BY created_at DESC LIMIT $' + (dataParams.length + 1) + ' OFFSET $' + (dataParams.length + 2);
    dataParams.push(pageSize, offset);

    const result = await client.query(dataQuery, dataParams);

    const students = result.rows.map(student => ({
      id: student.id,
      firstName: student.first_name,
      lastName: student.last_name,
      email: student.email,
      phone: student.phone,
      dateOfBirth: student.date_of_birth,
      gender: student.gender,
      enrollmentDate: student.enrollment_date,
      parentId: student.parent_id,
      isActive: student.is_active,
      createdAt: student.created_at,
    }));

    return sendPaginated(res, students, page, pageSize, total, 'Students retrieved successfully');
  } catch (error) {
    console.error('Get all students error:', error);
    return sendError(res, 500, error.message, 'GET_STUDENTS_ERROR');
  } finally {
    client.release();
  }
}

/**
 * Get student by ID
 * GET /api/students/:id
 */
async function getStudentById(req, res) {
  const client = await pool.connect();

  try {
    const { id } = req.params;

    const result = await client.query(
      `SELECT id, school_id, first_name, last_name, email, phone, date_of_birth, gender, enrollment_date, address, parent_id, is_active, created_at, updated_at
       FROM students WHERE id = $1 AND is_active = true`,
      [id]
    );

    if (result.rows.length === 0) {
      return sendNotFound(res, 'Student not found', 'STUDENT_NOT_FOUND');
    }

    const student = result.rows[0];

    // Get classes this student is enrolled in
    const classesResult = await client.query(
      `SELECT classes.id, classes.name, classes.grade_level, classes.teacher_id, class_students.enrollment_status
       FROM classes
       JOIN class_students ON classes.id = class_students.class_id
       WHERE class_students.student_id = $1 AND class_students.enrollment_status = 'active'`,
      [id]
    );

    const classes = classesResult.rows.map(c => ({
      id: c.id,
      name: c.name,
      gradeLevel: c.grade_level,
      teacherId: c.teacher_id,
      enrollmentStatus: c.enrollment_status,
    }));

    return sendSuccess(res, 200, {
      id: student.id,
      schoolId: student.school_id,
      firstName: student.first_name,
      lastName: student.last_name,
      email: student.email,
      phone: student.phone,
      dateOfBirth: student.date_of_birth,
      gender: student.gender,
      enrollmentDate: student.enrollment_date,
      address: student.address,
      parentId: student.parent_id,
      isActive: student.is_active,
      createdAt: student.created_at,
      updatedAt: student.updated_at,
      classes,
    }, 'Student retrieved successfully');
  } catch (error) {
    console.error('Get student error:', error);
    return sendError(res, 500, error.message, 'GET_STUDENT_ERROR');
  } finally {
    client.release();
  }
}

/**
 * Update student
 * PUT /api/students/:id
 */
async function updateStudent(req, res) {
  const client = await pool.connect();

  try {
    const { id } = req.params;
    const { firstName, lastName, email, phone, dateOfBirth, gender, address, parentId } = req.body;

    // Check if student exists
    const checkResult = await client.query(
      'SELECT id FROM students WHERE id = $1 AND is_active = true',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return sendNotFound(res, 'Student not found', 'STUDENT_NOT_FOUND');
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
    if (dateOfBirth !== undefined) {
      updateFields.push(`date_of_birth = $${paramCount}`);
      updateValues.push(dateOfBirth);
      paramCount++;
    }
    if (gender !== undefined) {
      updateFields.push(`gender = $${paramCount}`);
      updateValues.push(gender);
      paramCount++;
    }
    if (address !== undefined) {
      updateFields.push(`address = $${paramCount}`);
      updateValues.push(address);
      paramCount++;
    }
    if (parentId !== undefined) {
      updateFields.push(`parent_id = $${paramCount}`);
      updateValues.push(parentId);
      paramCount++;
    }

    if (updateFields.length === 0) {
      return sendError(res, 400, 'No fields to update', 'NO_FIELDS_TO_UPDATE');
    }

    updateFields.push(`updated_at = $${paramCount}`);
    updateValues.push(now);
    updateValues.push(id);

    const result = await client.query(
      `UPDATE students SET ${updateFields.join(', ')} WHERE id = $${paramCount + 1} RETURNING *`,
      updateValues
    );

    const student = result.rows[0];

    return sendSuccess(res, 200, {
      id: student.id,
      firstName: student.first_name,
      lastName: student.last_name,
      email: student.email,
      phone: student.phone,
      dateOfBirth: student.date_of_birth,
      gender: student.gender,
      address: student.address,
      parentId: student.parent_id,
      updatedAt: student.updated_at,
    }, 'Student updated successfully');
  } catch (error) {
    console.error('Update student error:', error);
    return sendError(res, 500, error.message, 'UPDATE_STUDENT_ERROR');
  } finally {
    client.release();
  }
}

/**
 * Enroll student in class
 * POST /api/students/:id/enroll
 */
async function enrollInClass(req, res) {
  const client = await pool.connect();

  try {
    const { id } = req.params;
    const { classId } = req.body;

    // Check if student exists
    const studentCheck = await client.query(
      'SELECT id, school_id FROM students WHERE id = $1 AND is_active = true',
      [id]
    );

    if (studentCheck.rows.length === 0) {
      return sendNotFound(res, 'Student not found', 'STUDENT_NOT_FOUND');
    }

    const schoolId = studentCheck.rows[0].school_id;

    // Check if class exists and belongs to same school
    const classCheck = await client.query(
      'SELECT id FROM classes WHERE id = $1 AND school_id = $2 AND is_active = true',
      [classId, schoolId]
    );

    if (classCheck.rows.length === 0) {
      return sendError(res, 400, 'Class not found or does not belong to this school', 'CLASS_NOT_FOUND');
    }

    // Check if already enrolled
    const enrollmentCheck = await client.query(
      'SELECT id FROM class_students WHERE student_id = $1 AND class_id = $2 AND enrollment_status = $3',
      [id, classId, 'active']
    );

    if (enrollmentCheck.rows.length > 0) {
      return sendError(res, 409, 'Student already enrolled in this class', 'ALREADY_ENROLLED');
    }

    // Create enrollment
    const enrollmentId = uuidv4();
    const now = new Date();

    const result = await client.query(
      `INSERT INTO class_students (id, class_id, student_id, enrollment_status, joined_at)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, class_id, student_id, enrollment_status, joined_at`,
      [enrollmentId, classId, id, 'active', now]
    );

    const enrollment = result.rows[0];

    return sendCreated(res, {
      enrollmentId: enrollment.id,
      classId: enrollment.class_id,
      studentId: enrollment.student_id,
      enrollmentStatus: enrollment.enrollment_status,
      joinedAt: enrollment.joined_at,
    }, 'Student enrolled in class successfully');
  } catch (error) {
    console.error('Enroll student error:', error);
    return sendError(res, 500, error.message, 'ENROLL_ERROR');
  } finally {
    client.release();
  }
}

module.exports = {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  enrollInClass,
};
