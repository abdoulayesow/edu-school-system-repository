/**
 * Find Students Script
 * Find students with completed enrollments for testing
 * Run: npx tsx scripts/find-students.ts
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config({ path: '.env' })

const { Pool } = pg
const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  console.error('❌ DATABASE_URL not set in environment')
  process.exit(1)
}

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function findStudents() {
  try {
    // Find students with completed enrollments in the active school year
    const enrollments = await prisma.enrollment.findMany({
      where: {
        schoolYear: { isActive: true },
        status: 'completed',
      },
      take: 10,
      select: {
        studentId: true,
        firstName: true,
        lastName: true,
        gradeId: true,
      },
      orderBy: [
        { lastName: 'asc' },
        { firstName: 'asc' },
      ],
    });

    console.log('\n=== STUDENTS WITH COMPLETED ENROLLMENTS ===\n');

    if (enrollments.length === 0) {
      console.log('No students found with completed enrollments in the active school year.');
      console.log('\nTo test enrollment, you need students with status="completed" enrollments.');
      await prisma.$disconnect();
      return;
    }

    // Get student profiles and grades
    const personIds = enrollments.map(e => e.studentId).filter(Boolean) as string[];

    const students = await prisma.person.findMany({
      where: { id: { in: personIds } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        studentProfile: {
          select: {
            studentNumber: true,
            currentGrade: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    students.forEach((student) => {
      console.log(`Name: ${student.firstName} ${student.lastName}`);
      console.log(`  Person ID: ${student.id}`);
      if (student.studentProfile) {
        console.log(`  Student Number: ${student.studentProfile.studentNumber}`);
        console.log(`  Current Grade: ${student.studentProfile.currentGrade?.name || 'N/A'}`);
      } else {
        console.log(`  ⚠️  NO STUDENT PROFILE FOUND!`);
      }
      console.log('');
    });

    await prisma.$disconnect();
    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

findStudents();
