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

async function checkInvalidEnrollments() {
  try {
    console.log('\n=== Checking Enrollment Data Integrity ===\n')

    // Get all enrollments with their student IDs
    const enrollments = await prisma.enrollment.findMany({
      where: {
        schoolYear: { isActive: true },
        status: 'completed'
      },
      select: {
        id: true,
        studentId: true
      }
    })

    console.log(`Total active completed enrollments: ${enrollments.length}`)

    // Get unique student IDs
    const studentIds = [...new Set(enrollments.map(e => e.studentId).filter(Boolean))] as string[]
    console.log(`Unique student IDs: ${studentIds.length}\n`)

    // Check which ones exist as Person records
    const existingPersons = await prisma.person.findMany({
      where: {
        id: { in: studentIds }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true
      }
    })

    const existingPersonIds = new Set(existingPersons.map(p => p.id))
    const invalidStudentIds = studentIds.filter(id => !existingPersonIds.has(id))

    console.log(`✅ Valid Person records: ${existingPersons.length}`)
    console.log(`❌ Invalid/Missing Person records: ${invalidStudentIds.length}\n`)

    if (invalidStudentIds.length > 0) {
      console.log('First 10 invalid student IDs:')
      invalidStudentIds.slice(0, 10).forEach((id, i) => {
        console.log(`  ${i + 1}. ${id}`)
      })

      console.log('\n=== Checking for StudentProfile match ===')
      // Maybe these IDs are StudentProfile IDs instead?
      const studentProfiles = await prisma.studentProfile.findMany({
        where: {
          id: { in: invalidStudentIds.slice(0, 10) }
        },
        include: {
          person: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          }
        }
      })

      if (studentProfiles.length > 0) {
        console.log(`\n⚠️  FOUND! These "studentId"s are actually StudentProfile IDs:`)
        studentProfiles.forEach(sp => {
          console.log(`  StudentProfile ID: ${sp.id}`)
          console.log(`    → Actual Person ID: ${sp.personId}`)
          console.log(`    → Name: ${sp.person?.firstName} ${sp.person?.lastName}\n`)
        })
      }
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

checkInvalidEnrollments()
