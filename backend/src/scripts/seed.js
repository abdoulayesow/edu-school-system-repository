#!/usr/bin/env node

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'friasoft_user',
  password: process.env.DB_PASSWORD || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'friasoft_dev',
});

function getGradeLetter(score) {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

async function seedDatabase() {
  const client = await pool.connect();
  try {
    console.log('\n╔════════════════════════════════════════════╗');
    console.log('║     Database Seed Script                   ║');
    console.log('║     Populating Test Data                   ║');
    console.log('╚════════════════════════════════════════════╝\n');

    const checkSchools = await client.query('SELECT COUNT(*) FROM schools');
    if (checkSchools.rows[0].count > 0) {
      console.log('⚠️  Database already contains data. Skipping seed.\n');
      process.exit(0);
    }

    console.log('🌱 Creating test data...\n');

    const schoolId = uuidv4();
    await client.query(
      'INSERT INTO schools (id, name, email, phone, country, city, subscription_plan) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [schoolId, 'Friasoft Test School', 'contact@friasoft-test.com', '+224 622 123 456', 'Guinea', 'Conakry', 'Premium']
    );
    console.log('  ✅ Created test school');

    const hashedPassword = await bcrypt.hash('password123', 10);
    const adminId = uuidv4();
    const teacherId = uuidv4();
    const accountantId = uuidv4();

    await client.query(
      'INSERT INTO users (id, school_id, email, password_hash, first_name, last_name, role, is_verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [adminId, schoolId, 'admin@friasoft-test.com', hashedPassword, 'Admin', 'User', 'admin', true]
    );
    console.log('  ✅ Created admin user (admin@friasoft-test.com / password123)');

    await client.query(
      'INSERT INTO users (id, school_id, email, password_hash, first_name, last_name, role, is_verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [teacherId, schoolId, 'teacher@friasoft-test.com', hashedPassword, 'John', 'Teacher', 'teacher', true]
    );
    console.log('  ✅ Created teacher user (teacher@friasoft-test.com / password123)');

    await client.query(
      'INSERT INTO users (id, school_id, email, password_hash, first_name, last_name, role, is_verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [accountantId, schoolId, 'accountant@friasoft-test.com', hashedPassword, 'Jane', 'Accountant', 'accountant', true]
    );
    console.log('  ✅ Created accountant user (accountant@friasoft-test.com / password123)');

    const classId = uuidv4();
    await client.query(
      'INSERT INTO classes (id, school_id, name, grade_level, teacher_id, capacity) VALUES (?, ?, ?, ?, ?, ?)',
      [classId, schoolId, 'Form 1A', 1, teacherId, 30]
    );
    console.log('  ✅ Created test class (Form 1A)');

    const subjectIds = [];
    const subjects = ['Mathematics', 'English', 'Science', 'History'];
    const codes = ['MATH', 'ENG', 'SCI', 'HIST'];
    for (let i = 0; i < subjects.length; i++) {
      const subjectId = uuidv4();
      subjectIds.push(subjectId);
      await client.query(
        'INSERT INTO subjects (id, school_id, name, code) VALUES (?, ?, ?, ?)',
        [subjectId, schoolId, subjects[i], codes[i]]
      );
    }
    console.log(`  ✅ Created ${subjects.length} test subjects`);

    const studentIds = [];
    const students = [
      {firstName: 'Ahmed', lastName: 'Diallo', email: 'ahmed@test.com', gender: 'M'},
      {firstName: 'Fatima', lastName: 'Kone', email: 'fatima@test.com', gender: 'F'},
      {firstName: 'Moussa', lastName: 'Traore', email: 'moussa@test.com', gender: 'M'}
    ];
    for (const student of students) {
      const studentId = uuidv4();
      studentIds.push(studentId);
      await client.query(
        'INSERT INTO students (id, school_id, first_name, last_name, email, gender, enrollment_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [studentId, schoolId, student.firstName, student.lastName, student.email, student.gender, new Date().toISOString().split('T')[0]]
      );
    }
    console.log(`  ✅ Created ${students.length} test students`);

    for (const studentId of studentIds) {
      await client.query(
        'INSERT INTO class_students (id, class_id, student_id, enrollment_status) VALUES (?, ?, ?, ?)',
        [uuidv4(), classId, studentId, 'active']
      );
    }
    console.log('  ✅ Enrolled students in class');

    const scores = [85, 78, 92, 88];
    let gradeCount = 0;
    for (const studentId of studentIds) {
      for (let i = 0; i < subjectIds.length; i++) {
        const score = scores[i];
        const gradeLetter = getGradeLetter(score);
        await client.query(
          'INSERT INTO grades (id, school_id, student_id, subject_id, class_id, teacher_id, score, grade_letter, term, academic_year) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [uuidv4(), schoolId, studentId, subjectIds[i], classId, teacherId, score, gradeLetter, 'Term 1', '2024-2025']
        );
        gradeCount++;
      }
    }
    console.log(`  ✅ Created ${gradeCount} test grades`);

    let invoiceCount = 0;
    for (const studentId of studentIds) {
      const invoiceNumber = 'INV-' + schoolId.substring(0, 8) + '-2024-' + (invoiceCount + 1);
      await client.query(
        'INSERT INTO invoices (id, school_id, student_id, invoice_number, description, amount, due_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [uuidv4(), schoolId, studentId, invoiceNumber, 'School fees for Term 1', 500000, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 'sent']
      );
      invoiceCount++;
    }
    console.log(`  ✅ Created ${invoiceCount} test invoices`);

    console.log('\n✅ Database seeding complete!\n');
    console.log('Test Credentials:');
    console.log('  Admin:      admin@friasoft-test.com / password123');
    console.log('  Teacher:    teacher@friasoft-test.com / password123');
    console.log('  Accountant: accountant@friasoft-test.com / password123\n');
    console.log('Test Data:');
    console.log('  School:   Friasoft Test School');
    console.log('  Class:    Form 1A');
    console.log('  Students: ' + studentIds.length);
    console.log('  Subjects: ' + subjectIds.length);
    console.log('  Invoices: ' + invoiceCount + '\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
    process.exit(1);
  } finally {
    await client.release();
    await pool.end();
  }
}

seedDatabase();
