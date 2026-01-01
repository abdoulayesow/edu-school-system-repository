/**
 * Migration script for high school track system.
 *
 * This script handles the transition from 3 general high school grades (11, 12, Terminal)
 * to 9 track-specific grades (SM, SS, SE for each year).
 *
 * Usage:
 *   npx tsx scripts/migrate-high-school-tracks.ts           # Dry run - show what would change
 *   npx tsx scripts/migrate-high-school-tracks.ts --fix     # Apply changes
 *   npx tsx scripts/migrate-high-school-tracks.ts --report  # Generate detailed report
 */

import { PrismaClient, EnrollmentStatus } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import pg from "pg"
import dotenv from "dotenv"

// Load environment variables from app/db/.env
dotenv.config({ path: ".env" })

const { Pool } = pg
const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  console.error("DATABASE_URL not found in environment variables")
  process.exit(1)
}

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// High school grade orders
const HIGH_SCHOOL_ORDERS = [11, 12, 13]

interface EnrollmentWithGrade {
  id: string
  enrollmentNumber: string
  firstName: string
  lastName: string
  status: EnrollmentStatus
  grade: {
    id: string
    name: string
    order: number
    series: string | null
  }
}

async function main() {
  const args = process.argv.slice(2)
  const shouldFix = args.includes("--fix")
  const showReport = args.includes("--report")

  console.log("=".repeat(60))
  console.log("High School Track Migration Script")
  console.log("=".repeat(60))
  console.log()

  // Get current school year
  const currentSchoolYear = await prisma.schoolYear.findFirst({
    where: { isActive: true },
  })

  if (!currentSchoolYear) {
    console.error("No active school year found")
    process.exit(1)
  }

  console.log(`Active school year: ${currentSchoolYear.name}`)
  console.log()

  // Find all high school grades WITHOUT a series (old general grades)
  const oldHighSchoolGrades = await prisma.grade.findMany({
    where: {
      schoolYearId: currentSchoolYear.id,
      order: { in: HIGH_SCHOOL_ORDERS },
      series: null,
    },
    orderBy: { order: "asc" },
  })

  // Find all high school grades WITH a series (new track grades)
  const newTrackGrades = await prisma.grade.findMany({
    where: {
      schoolYearId: currentSchoolYear.id,
      order: { in: HIGH_SCHOOL_ORDERS },
      series: { not: null },
    },
    orderBy: [{ order: "asc" }, { series: "asc" }],
  })

  console.log("Current Grade Structure:")
  console.log("-".repeat(40))
  console.log(`Old general grades (no series): ${oldHighSchoolGrades.length}`)
  for (const grade of oldHighSchoolGrades) {
    console.log(`  - ${grade.name} (order: ${grade.order})`)
  }
  console.log()
  console.log(`New track grades (with series): ${newTrackGrades.length}`)
  for (const grade of newTrackGrades) {
    console.log(`  - ${grade.name} [${grade.series}] (order: ${grade.order})`)
  }
  console.log()

  // Find enrollments in old general grades
  const enrollmentsInOldGrades: EnrollmentWithGrade[] = await prisma.enrollment.findMany({
    where: {
      schoolYearId: currentSchoolYear.id,
      grade: {
        order: { in: HIGH_SCHOOL_ORDERS },
        series: null,
      },
    },
    include: {
      grade: {
        select: {
          id: true,
          name: true,
          order: true,
          series: true,
        },
      },
    },
    orderBy: [
      { grade: { order: "asc" } },
      { lastName: "asc" },
    ],
  }) as EnrollmentWithGrade[]

  console.log("=".repeat(60))
  console.log("Enrollments Needing Track Assignment")
  console.log("=".repeat(60))
  console.log()

  if (enrollmentsInOldGrades.length === 0) {
    console.log("✓ No enrollments found in old general high school grades.")
    console.log("  All high school students are already in track-specific grades.")
    console.log()
  } else {
    console.log(`Found ${enrollmentsInOldGrades.length} enrollments needing track assignment:`)
    console.log()

    // Group by grade
    const byGrade = enrollmentsInOldGrades.reduce((acc, enrollment) => {
      const gradeKey = enrollment.grade.name
      if (!acc[gradeKey]) acc[gradeKey] = []
      acc[gradeKey].push(enrollment)
      return acc
    }, {} as Record<string, EnrollmentWithGrade[]>)

    for (const [gradeName, enrollments] of Object.entries(byGrade)) {
      console.log(`${gradeName}: ${enrollments.length} students`)
      if (showReport) {
        for (const e of enrollments) {
          console.log(`    - ${e.lastName} ${e.firstName} (${e.enrollmentNumber}) [${e.status}]`)
        }
      }
      console.log()
    }

    if (shouldFix) {
      console.log("-".repeat(40))
      console.log("Applying changes...")
      console.log()

      // Mark enrollments as needs_review
      const updateResult = await prisma.enrollment.updateMany({
        where: {
          id: { in: enrollmentsInOldGrades.map((e) => e.id) },
        },
        data: {
          status: EnrollmentStatus.needs_review,
          statusComment: "Pending track assignment (SM/SS/SE) for high school",
        },
      })

      console.log(`✓ Updated ${updateResult.count} enrollments to 'needs_review' status`)
      console.log()
      console.log("Next steps:")
      console.log("1. Admin should review each enrollment")
      console.log("2. Assign appropriate track (SM, SS, or SE)")
      console.log("3. Move enrollment to the correct track-specific grade")
    } else {
      console.log("-".repeat(40))
      console.log("DRY RUN - No changes made")
      console.log()
      console.log("To apply changes, run with --fix flag:")
      console.log("  npx tsx scripts/migrate-high-school-tracks.ts --fix")
    }
  }

  // Summary of track grades
  console.log()
  console.log("=".repeat(60))
  console.log("Track Grade Summary")
  console.log("=".repeat(60))
  console.log()

  for (const grade of newTrackGrades) {
    const enrollmentCount = await prisma.enrollment.count({
      where: {
        gradeId: grade.id,
        schoolYearId: currentSchoolYear.id,
      },
    })
    const roomCount = await prisma.gradeRoom.count({
      where: { gradeId: grade.id },
    })
    const subjectCount = await prisma.gradeSubject.count({
      where: { gradeId: grade.id },
    })

    console.log(`${grade.name}:`)
    console.log(`  Enrollments: ${enrollmentCount}`)
    console.log(`  Rooms: ${roomCount}`)
    console.log(`  Subjects: ${subjectCount}`)
    console.log()
  }

  console.log("=".repeat(60))
  console.log("Migration script completed")
  console.log("=".repeat(60))
}

main()
  .catch((error) => {
    console.error("Error:", error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
