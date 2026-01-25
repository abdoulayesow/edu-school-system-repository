/**
 * Create Missing Student Profiles
 * Creates StudentProfile records for Person records that have enrollments but no profile
 * Run: npx tsx scripts/create-missing-student-profiles.ts
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

async function createMissingProfiles() {
  try {
    console.log('\n=== Finding persons with enrollments but no StudentProfile ===\n')

    // Get all completed enrollments
    const enrollments = await prisma.enrollment.findMany({
      where: {
        schoolYear: { isActive: true },
        status: 'completed',
        studentId: { not: null }
      },
      distinct: ['studentId'],
      select: {
        studentId: true,
        gradeId: true,
      },
    })

    const personIds = enrollments.map(e => e.studentId).filter(Boolean) as string[]
    console.log(`Found ${personIds.length} unique person IDs with completed enrollments`)

    // Check which ones already have student profiles
    const existingProfiles = await prisma.studentProfile.findMany({
      where: {
        personId: { in: personIds }
      },
      select: { personId: true }
    })

    const existingPersonIds = new Set(existingProfiles.map(p => p.personId))
    const missingPersonIds = personIds.filter(id => !existingPersonIds.has(id))

    console.log(`${existingProfiles.length} already have StudentProfile`)
    console.log(`${missingPersonIds.length} are MISSING StudentProfile\n`)

    if (missingPersonIds.length === 0) {
      console.log('✓ All persons have student profiles!')
      await prisma.$disconnect()
      await pool.end()
      return
    }

    console.log('Creating StudentProfile records for missing persons...\n')

    // Get enrollment data for missing persons to set their current grade
    const enrollmentsByPerson = new Map()
    enrollments.forEach(e => {
      if (e.studentId && missingPersonIds.includes(e.studentId)) {
        enrollmentsByPerson.set(e.studentId, e)
      }
    })

    let created = 0
    for (const personId of missingPersonIds) {
      const enrollment = enrollmentsByPerson.get(personId)
      try {
        await prisma.studentProfile.create({
          data: {
            personId,
            studentStatus: 'active',
            currentGradeId: enrollment?.gradeId || null,
          }
        })
        created++
        if (created % 10 === 0) {
          console.log(`  Created ${created}/${missingPersonIds.length}...`)
        }
      } catch (error: any) {
        console.error(`  Error creating profile for ${personId}:`, error.message)
      }
    }

    console.log(`\n✓ Created ${created} StudentProfile records!`)
    console.log('\nNow students should appear in the club enrollment wizard.')

    await prisma.$disconnect()
    await pool.end()
  } catch (error) {
    console.error('Error:', error)
    await prisma.$disconnect()
    await pool.end()
    process.exit(1)
  }
}

createMissingProfiles()
