/**
 * Debug Eligible Students API Logic
 * Exactly replicates the API endpoint logic to debug why no students appear
 * Run: npx tsx scripts/debug-eligible-students.ts
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

async function debugEligibleStudents() {
  try {
    const clubId = 'cmkibs7pt00062cu83ks8w0p0'

    console.log('\n=== STEP 1: Get Club ===')
    const club = await prisma.club.findUnique({
      where: { id: clubId },
      include: {
        eligibilityRule: {
          include: {
            gradeRules: true,
          },
        },
        schoolYear: true,
      },
    })

    console.log(`Club: ${club?.name}`)
    console.log(`Eligibility Rule: ${club?.eligibilityRule?.ruleType || 'NONE'}`)

    console.log('\n=== STEP 2: Build Query ===')
    const enrollmentWhere: any = {
      schoolYear: { isActive: true },
      status: 'completed',
    }
    console.log('Enrollment where:', JSON.stringify(enrollmentWhere, null, 2))

    console.log('\n=== STEP 3: Fetch Enrollments ===')
    const enrollments = await prisma.enrollment.findMany({
      where: enrollmentWhere,
      distinct: ['studentId'],
      select: {
        studentId: true,
        firstName: true,
        lastName: true,
        photoUrl: true,
        gradeId: true,
      },
      orderBy: [
        { lastName: 'asc' },
        { firstName: 'asc' },
      ],
    })

    console.log(`Found ${enrollments.length} enrollments`)
    console.log('First 3 enrollments:')
    enrollments.slice(0, 3).forEach(e => {
      console.log(`  - ${e.firstName} ${e.lastName} (studentId: ${e.studentId})`)
    })

    console.log('\n=== STEP 4: Get Person IDs ===')
    const personIds = enrollments
      .map(e => e.studentId)
      .filter(Boolean) as string[]
    console.log(`Person IDs count: ${personIds.length}`)

    if (personIds.length === 0) {
      console.log('⚠️  NO PERSON IDS! This is the problem!')
      console.log('Enrollment.studentId field is NULL or missing!')
      await prisma.$disconnect()
      await pool.end()
      return
    }

    console.log('\n=== STEP 5: Fetch Student Profiles ===')
    const studentProfiles = await prisma.studentProfile.findMany({
      where: {
        personId: { in: personIds },
      },
      select: {
        id: true,
        personId: true,
        studentId: true,
        currentGradeId: true,
      },
    })

    console.log(`Found ${studentProfiles.length} student profiles`)

    await prisma.$disconnect()
    await pool.end()
  } catch (error) {
    console.error('Error:', error)
    await prisma.$disconnect()
    await pool.end()
    process.exit(1)
  }
}

debugEligibleStudents()
