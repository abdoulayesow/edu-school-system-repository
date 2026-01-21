/**
 * Full Database Analysis Script
 * Analyzes Person, StudentProfile, Enrollment, and related tables
 * to understand data structure and identify integrity issues
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

async function analyze() {
  try {
    console.log('╔══════════════════════════════════════════════════════════════╗')
    console.log('║           FULL DATABASE ANALYSIS REPORT                      ║')
    console.log('╚══════════════════════════════════════════════════════════════╝\n')

    // ═══════════════════════════════════════════════════════════════
    // SECTION 1: TABLE COUNTS
    // ═══════════════════════════════════════════════════════════════
    console.log('┌──────────────────────────────────────────────────────────────┐')
    console.log('│ SECTION 1: TABLE RECORD COUNTS                               │')
    console.log('└──────────────────────────────────────────────────────────────┘\n')

    const personCount = await prisma.person.count()
    const studentProfileCount = await prisma.studentProfile.count()
    const enrollmentCount = await prisma.enrollment.count()
    const studentCount = await prisma.student.count()
    const clubEnrollmentCount = await prisma.clubEnrollment.count()
    const clubCount = await prisma.club.count()

    console.log(`  Person records:          ${personCount}`)
    console.log(`  StudentProfile records:  ${studentProfileCount}`)
    console.log(`  Student records:         ${studentCount}`)
    console.log(`  Enrollment records:      ${enrollmentCount}`)
    console.log(`  Club records:            ${clubCount}`)
    console.log(`  ClubEnrollment records:  ${clubEnrollmentCount}`)
    console.log('')

    // ═══════════════════════════════════════════════════════════════
    // SECTION 2: PERSON → STUDENTPROFILE RELATIONSHIP
    // ═══════════════════════════════════════════════════════════════
    console.log('┌──────────────────────────────────────────────────────────────┐')
    console.log('│ SECTION 2: PERSON ↔ STUDENTPROFILE RELATIONSHIP             │')
    console.log('└──────────────────────────────────────────────────────────────┘\n')

    const personsWithProfile = await prisma.person.count({
      where: { studentProfile: { isNot: null } }
    })
    const personsWithoutProfile = personCount - personsWithProfile

    console.log(`  Persons WITH StudentProfile:     ${personsWithProfile}`)
    console.log(`  Persons WITHOUT StudentProfile:  ${personsWithoutProfile}`)
    console.log('')

    // Check for orphan StudentProfiles (no matching Person)
    const allStudentProfiles = await prisma.studentProfile.findMany({
      select: { id: true, personId: true }
    })
    const allPersonIds = new Set((await prisma.person.findMany({ select: { id: true } })).map(p => p.id))
    const orphanProfiles = allStudentProfiles.filter(sp => !allPersonIds.has(sp.personId))

    console.log(`  Orphan StudentProfiles (no Person): ${orphanProfiles.length}`)
    console.log('')

    // ═══════════════════════════════════════════════════════════════
    // SECTION 3: ENROLLMENT.studentId ANALYSIS
    // ═══════════════════════════════════════════════════════════════
    console.log('┌──────────────────────────────────────────────────────────────┐')
    console.log('│ SECTION 3: ENROLLMENT.studentId FIELD ANALYSIS              │')
    console.log('└──────────────────────────────────────────────────────────────┘\n')

    const enrollments = await prisma.enrollment.findMany({
      select: { id: true, studentId: true, status: true }
    })

    const enrollmentsWithStudentId = enrollments.filter(e => e.studentId)
    const enrollmentsWithoutStudentId = enrollments.filter(e => !e.studentId)
    const uniqueStudentIds = [...new Set(enrollmentsWithStudentId.map(e => e.studentId!))]

    console.log(`  Total Enrollments:               ${enrollments.length}`)
    console.log(`  With studentId:                  ${enrollmentsWithStudentId.length}`)
    console.log(`  Without studentId (null):        ${enrollmentsWithoutStudentId.length}`)
    console.log(`  Unique studentId values:         ${uniqueStudentIds.length}`)
    console.log('')

    // Check what these studentIds actually point to
    console.log('  Checking what Enrollment.studentId values reference...\n')

    // Check if they're Person IDs
    const matchingPersons = await prisma.person.findMany({
      where: { id: { in: uniqueStudentIds } },
      select: { id: true }
    })
    console.log(`    → Match Person.id:           ${matchingPersons.length}/${uniqueStudentIds.length}`)

    // Check if they're StudentProfile IDs
    const matchingStudentProfiles = await prisma.studentProfile.findMany({
      where: { id: { in: uniqueStudentIds } },
      select: { id: true, personId: true }
    })
    console.log(`    → Match StudentProfile.id:   ${matchingStudentProfiles.length}/${uniqueStudentIds.length}`)

    // Check if they're Student IDs (legacy table)
    const matchingStudents = await prisma.student.findMany({
      where: { id: { in: uniqueStudentIds } },
      select: { id: true }
    })
    console.log(`    → Match Student.id:          ${matchingStudents.length}/${uniqueStudentIds.length}`)

    // Check if they're StudentProfile.studentId values
    const matchingByStudentIdField = await prisma.studentProfile.findMany({
      where: { studentId: { in: uniqueStudentIds } },
      select: { id: true, personId: true, studentId: true }
    })
    console.log(`    → Match StudentProfile.studentId: ${matchingByStudentIdField.length}/${uniqueStudentIds.length}`)
    console.log('')

    // Determine the actual mapping
    if (matchingStudentProfiles.length === uniqueStudentIds.length) {
      console.log('  ✅ FINDING: Enrollment.studentId contains StudentProfile.id values!')
    } else if (matchingPersons.length === uniqueStudentIds.length) {
      console.log('  ✅ FINDING: Enrollment.studentId contains Person.id values!')
    } else if (matchingStudents.length === uniqueStudentIds.length) {
      console.log('  ✅ FINDING: Enrollment.studentId contains Student.id values!')
    } else {
      console.log('  ⚠️  FINDING: Mixed or invalid Enrollment.studentId values!')
      console.log(`      ${matchingPersons.length} are Person IDs`)
      console.log(`      ${matchingStudentProfiles.length} are StudentProfile IDs`)
      console.log(`      ${matchingStudents.length} are Student IDs`)
      const unmatched = uniqueStudentIds.length - Math.max(matchingPersons.length, matchingStudentProfiles.length, matchingStudents.length)
      console.log(`      ${unmatched} are UNMATCHED (orphaned references)`)
    }
    console.log('')

    // ═══════════════════════════════════════════════════════════════
    // SECTION 4: STUDENTPROFILE.studentId ANALYSIS
    // ═══════════════════════════════════════════════════════════════
    console.log('┌──────────────────────────────────────────────────────────────┐')
    console.log('│ SECTION 4: STUDENTPROFILE.studentId FIELD ANALYSIS          │')
    console.log('└──────────────────────────────────────────────────────────────┘\n')

    const studentProfilesAll = await prisma.studentProfile.findMany({
      select: { id: true, personId: true, studentId: true }
    })

    const profilesWithStudentId = studentProfilesAll.filter(sp => sp.studentId)
    const profilesWithoutStudentId = studentProfilesAll.filter(sp => !sp.studentId)

    console.log(`  Total StudentProfiles:           ${studentProfilesAll.length}`)
    console.log(`  With studentId (legacy link):    ${profilesWithStudentId.length}`)
    console.log(`  Without studentId:               ${profilesWithoutStudentId.length}`)
    console.log('')

    if (profilesWithStudentId.length > 0) {
      // Check if StudentProfile.studentId links to Student table
      const linkedStudentIds = profilesWithStudentId.map(sp => sp.studentId!)
      const validStudentLinks = await prisma.student.findMany({
        where: { id: { in: linkedStudentIds } },
        select: { id: true }
      })
      console.log(`  StudentProfile.studentId → Student.id: ${validStudentLinks.length}/${linkedStudentIds.length} valid`)
    }
    console.log('')

    // ═══════════════════════════════════════════════════════════════
    // SECTION 5: SAMPLE DATA COMPARISON
    // ═══════════════════════════════════════════════════════════════
    console.log('┌──────────────────────────────────────────────────────────────┐')
    console.log('│ SECTION 5: SAMPLE DATA TRACE                                │')
    console.log('└──────────────────────────────────────────────────────────────┘\n')

    // Get a sample enrollment and trace the relationship
    const sampleEnrollment = await prisma.enrollment.findFirst({
      where: {
        studentId: { not: null },
        status: 'completed',
        schoolYear: { isActive: true }
      },
      select: {
        id: true,
        studentId: true,
        firstName: true,
        lastName: true,
        grade: { select: { name: true } }
      }
    })

    if (sampleEnrollment) {
      console.log('  Sample Enrollment:')
      console.log(`    ID: ${sampleEnrollment.id}`)
      console.log(`    Name: ${sampleEnrollment.firstName} ${sampleEnrollment.lastName}`)
      console.log(`    Grade: ${sampleEnrollment.grade.name}`)
      console.log(`    studentId field: ${sampleEnrollment.studentId}`)
      console.log('')

      // Check if this studentId is a StudentProfile.id
      const asStudentProfile = await prisma.studentProfile.findUnique({
        where: { id: sampleEnrollment.studentId! },
        include: { person: { select: { id: true, firstName: true, lastName: true } } }
      })

      if (asStudentProfile) {
        console.log('  ✅ Enrollment.studentId IS a StudentProfile.id!')
        console.log(`    StudentProfile.id: ${asStudentProfile.id}`)
        console.log(`    StudentProfile.personId: ${asStudentProfile.personId}`)
        console.log(`    Person name: ${asStudentProfile.person.firstName} ${asStudentProfile.person.lastName}`)
      } else {
        // Check if it's a Person.id
        const asPerson = await prisma.person.findUnique({
          where: { id: sampleEnrollment.studentId! },
          select: { id: true, firstName: true, lastName: true }
        })

        if (asPerson) {
          console.log('  ✅ Enrollment.studentId IS a Person.id!')
          console.log(`    Person.id: ${asPerson.id}`)
          console.log(`    Person name: ${asPerson.firstName} ${asPerson.lastName}`)
        } else {
          console.log('  ❌ Enrollment.studentId matches NEITHER Person nor StudentProfile!')
        }
      }
    }
    console.log('')

    // ═══════════════════════════════════════════════════════════════
    // SECTION 6: CLUB ENROLLMENT RELATIONSHIP
    // ═══════════════════════════════════════════════════════════════
    console.log('┌──────────────────────────────────────────────────────────────┐')
    console.log('│ SECTION 6: CLUB ENROLLMENT ANALYSIS                         │')
    console.log('└──────────────────────────────────────────────────────────────┘\n')

    const clubEnrollments = await prisma.clubEnrollment.findMany({
      select: { id: true, studentProfileId: true, clubId: true }
    })

    console.log(`  Total ClubEnrollments: ${clubEnrollments.length}`)

    // ClubEnrollment uses studentProfileId
    const ceStudentProfileIds = [...new Set(clubEnrollments.map(ce => ce.studentProfileId))]
    const validCeProfiles = await prisma.studentProfile.findMany({
      where: { id: { in: ceStudentProfileIds } },
      select: { id: true }
    })
    console.log(`  Valid studentProfileId refs: ${validCeProfiles.length}/${ceStudentProfileIds.length}`)
    console.log('')

    // ═══════════════════════════════════════════════════════════════
    // SECTION 7: SUMMARY AND RECOMMENDATIONS
    // ═══════════════════════════════════════════════════════════════
    console.log('╔══════════════════════════════════════════════════════════════╗')
    console.log('║                    SUMMARY & RECOMMENDATIONS                 ║')
    console.log('╚══════════════════════════════════════════════════════════════╝\n')

    if (matchingStudentProfiles.length === uniqueStudentIds.length) {
      console.log('  🔴 CRITICAL FINDING:')
      console.log('     Enrollment.studentId stores StudentProfile.id (NOT Person.id)')
      console.log('')
      console.log('  📋 CURRENT DATA FLOW (WRONG):')
      console.log('     Enrollment.studentId → Person.id lookup → FAILS')
      console.log('')
      console.log('  📋 CORRECT DATA FLOW SHOULD BE:')
      console.log('     Enrollment.studentId → StudentProfile.id → StudentProfile.personId → Person.id')
      console.log('')
      console.log('  🛠️  FIX REQUIRED:')
      console.log('     Update eligible-students/route.ts to:')
      console.log('     1. Recognize Enrollment.studentId as StudentProfile.id')
      console.log('     2. Use StudentProfile.personId to get Person records')
      console.log('     3. Return correct Person ID for enrollment creation')
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

analyze()
