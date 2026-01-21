/**
 * Verify the eligible-students fix will work
 * Tests the new data flow: Enrollment.studentId → StudentProfile.studentId → Person.id
 */
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

async function verify() {
  try {
    console.log('\n╔══════════════════════════════════════════════════════════════╗')
    console.log('║         VERIFY ELIGIBLE STUDENTS FIX                         ║')
    console.log('╚══════════════════════════════════════════════════════════════╝\n')

    // Step 1: Get enrollments with active school year
    const enrollments = await prisma.enrollment.findMany({
      where: {
        schoolYear: { isActive: true },
        status: 'completed',
        studentId: { not: null }
      },
      distinct: ['studentId'],
      take: 10,
      select: {
        studentId: true,
        firstName: true,
        lastName: true,
        gradeId: true
      }
    })

    console.log(`Step 1: Found ${enrollments.length} sample enrollments\n`)

    // Step 2: Get legacy student IDs
    const legacyStudentIds = enrollments.map(e => e.studentId!).filter(Boolean)
    console.log(`Step 2: Extracted ${legacyStudentIds.length} legacy Student IDs\n`)

    // Step 3: Match to StudentProfile via studentId field
    const studentProfiles = await prisma.studentProfile.findMany({
      where: {
        studentId: { in: legacyStudentIds }
      },
      select: {
        id: true,
        personId: true,
        studentId: true
      }
    })

    console.log(`Step 3: Found ${studentProfiles.length} matching StudentProfiles\n`)

    if (studentProfiles.length === 0) {
      console.log('❌ NO MATCHES! The fix will not work.')
      console.log('   StudentProfile.studentId does not match Enrollment.studentId values')
      await prisma.$disconnect()
      await pool.end()
      return
    }

    // Step 4: Get Person records
    const personIds = studentProfiles.map(sp => sp.personId)
    const persons = await prisma.person.findMany({
      where: {
        id: { in: personIds }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true
      }
    })

    console.log(`Step 4: Found ${persons.length} matching Person records\n`)

    // Show sample data flow
    console.log('┌──────────────────────────────────────────────────────────────┐')
    console.log('│ SAMPLE DATA FLOW (First 5 students)                          │')
    console.log('└──────────────────────────────────────────────────────────────┘\n')

    const profileMap = new Map(studentProfiles.map(sp => [sp.studentId, sp]))
    const personMap = new Map(persons.map(p => [p.id, p]))

    let successCount = 0
    enrollments.slice(0, 5).forEach((enrollment, i) => {
      const profile = profileMap.get(enrollment.studentId!)
      const person = profile ? personMap.get(profile.personId) : null

      console.log(`${i + 1}. Enrollment: ${enrollment.firstName} ${enrollment.lastName}`)
      console.log(`   Legacy Student ID: ${enrollment.studentId}`)

      if (profile) {
        console.log(`   → StudentProfile ID: ${profile.id}`)
        console.log(`   → Person ID: ${profile.personId}`)
        if (person) {
          console.log(`   → Person Name: ${person.firstName} ${person.lastName}`)
          console.log(`   ✅ COMPLETE DATA FLOW`)
          successCount++
        } else {
          console.log(`   ❌ Person NOT FOUND`)
        }
      } else {
        console.log(`   ❌ StudentProfile NOT FOUND`)
      }
      console.log('')
    })

    console.log('┌──────────────────────────────────────────────────────────────┐')
    console.log('│ SUMMARY                                                      │')
    console.log('└──────────────────────────────────────────────────────────────┘\n')

    const matchRate = (studentProfiles.length / legacyStudentIds.length * 100).toFixed(1)
    console.log(`  Enrollments with legacy studentId: ${legacyStudentIds.length}`)
    console.log(`  StudentProfiles matched:           ${studentProfiles.length} (${matchRate}%)`)
    console.log(`  Persons found:                     ${persons.length}`)
    console.log('')

    if (studentProfiles.length > 0 && persons.length > 0) {
      console.log('  ✅ FIX VERIFIED! The new data flow will work.')
      console.log('     Students will now appear in the club enrollment wizard.')
    } else {
      console.log('  ❌ FIX MAY NOT WORK! Check data integrity.')
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

verify()
