/**
 * Seed script to create school years and grades.
 * Run this to initialize the enrollment system data.
 *
 * Usage: npx tsx app/db/prisma/seed.ts
 */

import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"
import pg from "pg"
import fs from "fs"
import path from "path"

const { Pool } = pg

// Load .env from app/ui if DATABASE_URL not set
if (!process.env.DATABASE_URL) {
  const envPath = path.join(process.cwd(), "app", "ui", ".env")
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8")
    for (const line of envContent.split("\n")) {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith("#")) {
        const [key, ...valueParts] = trimmed.split("=")
        const value = valueParts.join("=").replace(/^["']|["']$/g, "")
        if (key && !process.env[key]) {
          process.env[key] = value
        }
      }
    }
  }
}

// School year configuration
const SCHOOL_YEAR_CONFIG = {
  name: "2025 - 2026",
  startDate: new Date("2025-09-01"),
  endDate: new Date("2026-06-30"),
  enrollmentStart: new Date("2025-07-01"),
  enrollmentEnd: new Date("2026-06-15"),
  isActive: true,
}

// Grade configuration with tuition fees in GNF
// Elementary (1-6): 800,000 - 900,000 GNF
// College (7-10): 1,000,000 - 1,100,000 GNF
// High School (11-Terminal): 1,200,000 - 1,300,000 GNF
type SchoolLevel = "elementary" | "college" | "high_school"

interface GradeConfig {
  name: string
  level: SchoolLevel
  order: number
  tuitionFee: number
}

const GRADES_CONFIG: GradeConfig[] = [
  // Elementary School (Primaire) - Grades 1-6
  { name: "1ère Année", level: "elementary", order: 1, tuitionFee: 800000 },
  { name: "2ème Année", level: "elementary", order: 2, tuitionFee: 820000 },
  { name: "3ème Année", level: "elementary", order: 3, tuitionFee: 840000 },
  { name: "4ème Année", level: "elementary", order: 4, tuitionFee: 860000 },
  { name: "5ème Année", level: "elementary", order: 5, tuitionFee: 880000 },
  { name: "6ème Année", level: "elementary", order: 6, tuitionFee: 900000 },

  // College (Collège) - Grades 7-10
  { name: "7ème Année", level: "college", order: 7, tuitionFee: 1000000 },
  { name: "8ème Année", level: "college", order: 8, tuitionFee: 1025000 },
  { name: "9ème Année", level: "college", order: 9, tuitionFee: 1050000 },
  { name: "10ème Année", level: "college", order: 10, tuitionFee: 1100000 },

  // High School (Lycée) - Grades 11-Terminal
  { name: "11ème Année", level: "high_school", order: 11, tuitionFee: 1200000 },
  { name: "12ème Année", level: "high_school", order: 12, tuitionFee: 1250000 },
  { name: "Terminale", level: "high_school", order: 13, tuitionFee: 1300000 },
]

async function main() {
  console.log("🌱 Seeding school years and grades...")

  // Create Prisma client with pg adapter
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    console.error("❌ DATABASE_URL environment variable is not set")
    process.exit(1)
  }

  const pool = new Pool({ connectionString })
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })

  try {
    // Deactivate all existing school years first
    await prisma.schoolYear.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    })
    console.log("   Deactivated existing active school years")

    // Create or update the school year
    const existingSchoolYear = await prisma.schoolYear.findFirst({
      where: { name: SCHOOL_YEAR_CONFIG.name },
    })

    let schoolYear
    if (existingSchoolYear) {
      schoolYear = await prisma.schoolYear.update({
        where: { id: existingSchoolYear.id },
        data: {
          ...SCHOOL_YEAR_CONFIG,
          isActive: true,
        },
      })
      console.log(`✅ Updated existing school year: ${schoolYear.name}`)
    } else {
      schoolYear = await prisma.schoolYear.create({
        data: SCHOOL_YEAR_CONFIG,
      })
      console.log(`✅ Created new school year: ${schoolYear.name}`)
    }

    // Create or update grades
    console.log("\n📚 Creating grades...")
    for (const gradeConfig of GRADES_CONFIG) {
      const existingGrade = await prisma.grade.findFirst({
        where: {
          schoolYearId: schoolYear.id,
          order: gradeConfig.order,
        },
      })

      if (existingGrade) {
        await prisma.grade.update({
          where: { id: existingGrade.id },
          data: {
            name: gradeConfig.name,
            level: gradeConfig.level,
            tuitionFee: gradeConfig.tuitionFee,
          },
        })
        console.log(`   ✓ Updated: ${gradeConfig.name} (${formatCurrency(gradeConfig.tuitionFee)})`)
      } else {
        await prisma.grade.create({
          data: {
            name: gradeConfig.name,
            level: gradeConfig.level,
            order: gradeConfig.order,
            tuitionFee: gradeConfig.tuitionFee,
            schoolYearId: schoolYear.id,
          },
        })
        console.log(`   ✓ Created: ${gradeConfig.name} (${formatCurrency(gradeConfig.tuitionFee)})`)
      }
    }

    // Summary
    const gradeCount = await prisma.grade.count({
      where: { schoolYearId: schoolYear.id },
    })

    console.log("\n" + "=".repeat(50))
    console.log("✅ Seed completed!")
    console.log(`   School Year: ${schoolYear.name} (Active)`)
    console.log(`   Total Grades: ${gradeCount}`)
    console.log("   - Elementary (1-6): 6 grades")
    console.log("   - College (7-10): 4 grades")
    console.log("   - High School (11-Terminal): 3 grades")
    console.log("=".repeat(50))
  } catch (error) {
    console.error("❌ Failed to seed data:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
    await pool.end()
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("fr-GN", {
    style: "currency",
    currency: "GNF",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

main()
