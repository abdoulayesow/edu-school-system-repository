/**
 * Script to create the 9 high school track grades (SM, SS, SE × 3 years)
 * Run this once to add the new track grades to the active school year.
 *
 * Usage:
 *   npx tsx scripts/create-track-grades.ts           # Dry run
 *   npx tsx scripts/create-track-grades.ts --apply   # Apply changes
 */

import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import pg from "pg"
import dotenv from "dotenv"

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

// Track grade configurations
const TRACK_GRADES = [
  // 11ème Année - 3 tracks
  { name: "11ème Année SM", level: "high_school", order: 11, tuitionFee: 1200000, capacity: 70, series: "SM" },
  { name: "11ème Année SS", level: "high_school", order: 11, tuitionFee: 1200000, capacity: 70, series: "SS" },
  { name: "11ème Année SE", level: "high_school", order: 11, tuitionFee: 1200000, capacity: 70, series: "SE" },
  // 12ème Année - 3 tracks
  { name: "12ème Année SM", level: "high_school", order: 12, tuitionFee: 1250000, capacity: 70, series: "SM" },
  { name: "12ème Année SS", level: "high_school", order: 12, tuitionFee: 1250000, capacity: 70, series: "SS" },
  { name: "12ème Année SE", level: "high_school", order: 12, tuitionFee: 1250000, capacity: 70, series: "SE" },
  // Terminale - 3 tracks
  { name: "Terminale SM", level: "high_school", order: 13, tuitionFee: 1300000, capacity: 70, series: "SM" },
  { name: "Terminale SS", level: "high_school", order: 13, tuitionFee: 1300000, capacity: 70, series: "SS" },
  { name: "Terminale SE", level: "high_school", order: 13, tuitionFee: 1300000, capacity: 70, series: "SE" },
]

// New subjects needed for tracks
const NEW_SUBJECTS = [
  { code: "PHYS", nameFr: "Physique", nameEn: "Physics", isOptional: false },
  { code: "CHIMIE", nameFr: "Chimie", nameEn: "Chemistry", isOptional: false },
  { code: "ECON", nameFr: "Économie", nameEn: "Economics", isOptional: false },
  { code: "SOCIO", nameFr: "Sociologie", nameEn: "Sociology", isOptional: false },
]

// Subject mappings for each track-grade
const GRADE_SUBJECTS_MAP: { [key: string]: string[] } = {
  "11_SM": ["FRANCAIS", "MATH", "ANG", "HIST_GEO", "PHYS", "CHIMIE", "SVT", "EPS", "INFO"],
  "12_SM": ["FRANCAIS", "MATH", "ANG", "HIST_GEO", "PHYS", "CHIMIE", "SVT", "PHILO", "EPS"],
  "13_SM": ["FRANCAIS", "MATH", "ANG", "HIST_GEO", "PHYS", "CHIMIE", "SVT", "PHILO", "EPS"],

  "11_SE": ["FRANCAIS", "MATH", "ANG", "HIST_GEO", "SVT", "PC", "EPS", "INFO"],
  "12_SE": ["FRANCAIS", "MATH", "ANG", "HIST_GEO", "SVT", "PC", "PHILO", "EPS"],
  "13_SE": ["FRANCAIS", "MATH", "ANG", "HIST_GEO", "SVT", "PC", "PHILO", "EPS"],

  "11_SS": ["FRANCAIS", "MATH", "ANG", "HIST_GEO", "ECON", "SOCIO", "PC", "EPS", "INFO"],
  "12_SS": ["FRANCAIS", "MATH", "ANG", "HIST_GEO", "ECON", "SOCIO", "PHILO", "EPS"],
  "13_SS": ["FRANCAIS", "ANG", "HIST_GEO", "ECON", "SOCIO", "PHILO", "MATH", "EPS"],
}

function getCoefficient(subjectCode: string, series: string): number {
  if (subjectCode === "MATH") {
    return series === "SM" ? 5 : series === "SE" ? 3 : 2
  } else if (subjectCode === "FRANCAIS") {
    return 3
  } else if (subjectCode === "PHYS" || subjectCode === "CHIMIE") {
    return series === "SM" ? 4 : 2
  } else if (subjectCode === "SVT") {
    return series === "SE" ? 5 : 2
  } else if (subjectCode === "HIST_GEO" || subjectCode === "ECON") {
    return series === "SS" ? 5 : 2
  } else if (subjectCode === "PHILO") {
    return series === "SS" ? 4 : 3
  }
  return 2
}

async function main() {
  const args = process.argv.slice(2)
  const shouldApply = args.includes("--apply")

  console.log("=".repeat(60))
  console.log("Create High School Track Grades Script")
  console.log("=".repeat(60))
  console.log()

  // Get active school year
  const schoolYear = await prisma.schoolYear.findFirst({
    where: { isActive: true },
  })

  if (!schoolYear) {
    console.error("No active school year found")
    process.exit(1)
  }

  console.log(`Active school year: ${schoolYear.name}`)
  console.log()

  // Check for existing track grades
  const existingTrackGrades = await prisma.grade.findMany({
    where: {
      schoolYearId: schoolYear.id,
      order: { in: [11, 12, 13] },
      series: { not: null },
    },
  })

  if (existingTrackGrades.length > 0) {
    console.log(`Found ${existingTrackGrades.length} existing track grades:`)
    for (const g of existingTrackGrades) {
      console.log(`  - ${g.name} [${g.series}]`)
    }
    console.log()
    console.log("Track grades already exist. Exiting.")
    return
  }

  console.log("Track grades to create:")
  for (const g of TRACK_GRADES) {
    console.log(`  - ${g.name} [${g.series}] (order: ${g.order})`)
  }
  console.log()

  if (!shouldApply) {
    console.log("-".repeat(40))
    console.log("DRY RUN - No changes made")
    console.log()
    console.log("To apply changes, run with --apply flag:")
    console.log("  npx tsx scripts/create-track-grades.ts --apply")
    return
  }

  console.log("-".repeat(40))
  console.log("Applying changes...")
  console.log()

  // Step 1: Create new subjects if they don't exist
  console.log("Step 1: Creating new subjects...")
  for (const subj of NEW_SUBJECTS) {
    const existing = await prisma.subject.findFirst({
      where: { code: subj.code },
    })
    if (!existing) {
      await prisma.subject.create({
        data: {
          code: subj.code,
          nameFr: subj.nameFr,
          nameEn: subj.nameEn,
          isOptional: subj.isOptional,
        },
      })
      console.log(`  ✓ Created subject: ${subj.code} (${subj.nameFr})`)
    } else {
      console.log(`  - Subject exists: ${subj.code}`)
    }
  }
  console.log()

  // Step 2: Create track grades
  console.log("Step 2: Creating track grades...")
  const createdGrades: { id: string; order: number; series: string; name: string }[] = []

  for (const gradeConfig of TRACK_GRADES) {
    const grade = await prisma.grade.create({
      data: {
        name: gradeConfig.name,
        level: gradeConfig.level,
        order: gradeConfig.order,
        series: gradeConfig.series,
        tuitionFee: gradeConfig.tuitionFee,
        capacity: gradeConfig.capacity,
        schoolYearId: schoolYear.id,
      },
    })
    createdGrades.push({
      id: grade.id,
      order: grade.order,
      series: grade.series!,
      name: grade.name,
    })
    console.log(`  ✓ Created grade: ${grade.name}`)
  }
  console.log()

  // Step 3: Create grade-subject associations
  console.log("Step 3: Creating grade-subject associations...")
  let totalSubjects = 0

  for (const grade of createdGrades) {
    const key = `${grade.order}_${grade.series}`
    const subjectCodes = GRADE_SUBJECTS_MAP[key] || []

    for (const code of subjectCodes) {
      const subject = await prisma.subject.findFirst({
        where: { code },
      })

      if (subject) {
        const coefficient = getCoefficient(code, grade.series)
        const hoursPerWeek = code === "EPS" ? 2 : coefficient >= 4 ? 5 : 3

        await prisma.gradeSubject.create({
          data: {
            gradeId: grade.id,
            subjectId: subject.id,
            coefficient,
            hoursPerWeek,
          },
        })
        totalSubjects++
      }
    }
    console.log(`  ✓ ${grade.name}: ${subjectCodes.length} subjects`)
  }
  console.log()

  console.log("=".repeat(60))
  console.log("Summary")
  console.log("=".repeat(60))
  console.log(`  Grades created: ${createdGrades.length}`)
  console.log(`  Subject associations: ${totalSubjects}`)
  console.log()
  console.log("Done!")
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
