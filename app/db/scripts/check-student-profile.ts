import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config({ path: '../ui/.env' })

const { Pool } = pg
const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  console.error('❌ DATABASE_URL not set')
  process.exit(1)
}

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function checkStudent() {
  try {
    const studentId = 'cmkh45e0j0001n8u8uibj6k4z'

    console.log('\n=== Checking Student ===')
    console.log('Student ID:', studentId)

    const person = await prisma.person.findUnique({
      where: { id: studentId },
      include: {
        studentProfile: true
      }
    })

    // Get enrollments separately
    const enrollments = await prisma.enrollment.findMany({
      where: {
        studentId: studentId,
        status: 'completed'
      },
      include: {
        schoolYear: true,
        grade: true
      }
    })

    if (!person) {
      console.log('❌ Person NOT FOUND')
    } else {
      console.log('✅ Person found:', person.firstName, person.lastName)
      console.log('Has StudentProfile:', person.studentProfile ? 'YES ✅' : 'NO ❌')

      if (person.studentProfile) {
        console.log('StudentProfile ID:', person.studentProfile.id)
        console.log('Status:', person.studentProfile.studentStatus)
        console.log('Current Grade ID:', person.studentProfile.currentGradeId)
      }

      console.log('\nEnrollments:', enrollments.length)
      enrollments.forEach(e => {
        console.log(`  - ${e.schoolYear.name} / ${e.grade.name} (${e.status})`)
      })
    }

    await prisma.$disconnect()
    await pool.end()
  } catch (error) {
    console.error('Error:', error)
    await prisma.$disconnect()
    await pool.end()
    process.exit(1)
  }
}

checkStudent()
