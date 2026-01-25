/**
 * Seed script to create club categories and sample clubs
 *
 * Usage:
 *   npx tsx app/db/prisma/seeds/seed-clubs.ts
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

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const DIRECTOR_EMAIL = "abdoulaye.sow.1989@gmail.com"

async function seedClubs() {
  console.log("🎭 Starting clubs seed...")

  // Get director user
  const director = await prisma.user.findUnique({
    where: { email: DIRECTOR_EMAIL },
  })

  if (!director) {
    console.error("❌ Director user not found. Please run the main seed script first.")
    return
  }

  // Get active school year
  const activeSchoolYear = await prisma.schoolYear.findFirst({
    where: { isActive: true },
  })

  if (!activeSchoolYear) {
    console.error("❌ Active school year not found. Please run the main seed script first.")
    return
  }

  console.log(`📅 Using school year: ${activeSchoolYear.name}`)

  // Get some teachers for club leaders
  const teachers = await prisma.teacherProfile.findMany({
    take: 10,
  })

  if (teachers.length === 0) {
    console.error("❌ No teachers found. Please run the main seed script first.")
    return
  }

  console.log(`👥 Found ${teachers.length} teachers for club leaders`)

  // 1. Create Club Categories
  console.log("\n📂 Creating club categories...")

  const categories = [
    {
      name: "Sports & Athletics",
      nameFr: "Sports et Athlétisme",
      description: "Physical activities, team sports, and athletic competitions",
      status: "active" as const,
      order: 1,
    },
    {
      name: "Arts & Creativity",
      nameFr: "Arts et Créativité",
      description: "Visual arts, crafts, and creative expression",
      status: "active" as const,
      order: 2,
    },
    {
      name: "Music & Performance",
      nameFr: "Musique et Spectacle",
      description: "Music, dance, theater, and performing arts",
      status: "active" as const,
      order: 3,
    },
    {
      name: "Academic Excellence",
      nameFr: "Excellence Académique",
      description: "Study groups, tutoring, and academic enrichment",
      status: "active" as const,
      order: 4,
    },
    {
      name: "Technology & Innovation",
      nameFr: "Technologie et Innovation",
      description: "Coding, robotics, and technology projects",
      status: "active" as const,
      order: 5,
    },
    {
      name: "Science & Discovery",
      nameFr: "Science et Découverte",
      description: "Scientific experiments, research, and exploration",
      status: "active" as const,
      order: 6,
    },
  ]

  const createdCategories = []
  for (const category of categories) {
    // Check if category already exists
    const existing = await prisma.clubCategory.findFirst({
      where: { name: category.name },
    })

    const created = existing || await prisma.clubCategory.create({
      data: category,
    })
    createdCategories.push(created)
    console.log(`  ✓ ${category.name}${existing ? ' (already exists)' : ''}`)
  }

  // 2. Create Clubs based on client requirements
  console.log("\n🎪 Creating clubs...")

  // Get Academic Excellence category for revision clubs
  const academicCategory = createdCategories.find((c) => c.name === "Academic Excellence")
  const techCategory = createdCategories.find((c) => c.name === "Technology & Innovation")

  const clubs = [
    // REVISION CLUBS (Academic Excellence category)
    {
      name: "Révision 9ème",
      nameFr: "Révision 9ème",
      description: "Programme de révision pour les élèves de 9ème année",
      categoryId: academicCategory?.id,
      leaderId: teachers[0]?.id,
      startDate: activeSchoolYear.startDate,
      endDate: activeSchoolYear.endDate,
      capacity: 40,
      status: "active" as const,
      monthlyFee: 30000, // 30,000 GNF/month
      fee: 0, // No one-time fee
      schoolYearId: activeSchoolYear.id,
      createdBy: director.id,
    },
    {
      name: "Révision 10ème & 12ème (Toutes options)",
      nameFr: "Révision 10ème & 12ème (Toutes options)",
      description: "Programme de révision pour 10ème et 12ème année, toutes options confondues",
      categoryId: academicCategory?.id,
      leaderId: teachers[1]?.id,
      startDate: activeSchoolYear.startDate,
      endDate: activeSchoolYear.endDate,
      capacity: 50,
      status: "active" as const,
      monthlyFee: 40000, // 40,000 GNF/month
      fee: 0,
      schoolYearId: activeSchoolYear.id,
      createdBy: director.id,
    },
    {
      name: "Révision Terminale SM & SS",
      nameFr: "Révision Terminale SM & SS",
      description: "Programme de révision spécialisé pour Terminale Sciences Mathématiques et Sciences Sociales",
      categoryId: academicCategory?.id,
      leaderId: teachers[2]?.id,
      startDate: activeSchoolYear.startDate,
      endDate: activeSchoolYear.endDate,
      capacity: 50,
      status: "active" as const,
      monthlyFee: 50000, // 50,000 GNF/month
      fee: 0,
      schoolYearId: activeSchoolYear.id,
      createdBy: director.id,
    },
    // COMPUTER SCIENCE CLUB (Technology category)
    {
      name: "Informatique (7ème - Terminale)",
      nameFr: "Informatique (7ème - Terminale)",
      description: "Cours d'informatique de la 7ème à la Terminale (sauf 10ème)",
      categoryId: techCategory?.id,
      leaderId: teachers[3]?.id,
      startDate: activeSchoolYear.startDate,
      endDate: activeSchoolYear.endDate,
      capacity: 30,
      status: "active" as const,
      monthlyFee: 20000, // 20,000 GNF/month
      fee: 0,
      schoolYearId: activeSchoolYear.id,
      createdBy: director.id,
    },
  ]

  const createdClubs = []
  for (const club of clubs) {
    const created = await prisma.club.create({
      data: club,
    })
    createdClubs.push(created)
    console.log(
      `  ✓ ${club.name} (${club.monthlyFee.toLocaleString()} GNF/month)`
    )
  }

  // 3. Create eligibility rules for clubs
  console.log("\n📋 Creating eligibility rules...")

  // Get all grades to create rules
  const grades = await prisma.grade.findMany({
    orderBy: { order: "asc" },
  })

  // Helper to find grade by name
  const findGrade = (name: string) => grades.find((g) => g.name === name)

  // Révision 9ème - Only 9ème (3eme)
  const revision9Club = createdClubs[0]
  if (revision9Club) {
    const grade9 = findGrade("3eme")
    if (grade9) {
      const rule = await prisma.clubEligibilityRule.create({
        data: {
          clubId: revision9Club.id,
          ruleType: "GRADE_BASED",
          gradeRules: {
            create: [{ gradeId: grade9.id }],
          },
        },
      })
      console.log(`  ✓ Eligibility rule for ${revision9Club.name}: Grade 9ème only`)
    }
  }

  // Révision 10ème & 12ème - 10ème (2nde) and 12ème (1ere)
  const revision1012Club = createdClubs[1]
  if (revision1012Club) {
    const grade10 = findGrade("2nde")
    const grade12 = findGrade("1ere")
    const eligibleGrades = [grade10, grade12].filter(Boolean)

    if (eligibleGrades.length > 0) {
      const rule = await prisma.clubEligibilityRule.create({
        data: {
          clubId: revision1012Club.id,
          ruleType: "GRADE_BASED",
          gradeRules: {
            create: eligibleGrades.map((g) => ({ gradeId: g!.id })),
          },
        },
      })
      console.log(`  ✓ Eligibility rule for ${revision1012Club.name}: Grades 10ème & 12ème`)
    }
  }

  // Révision Terminale SM & SS - Terminale only, with series restriction
  const revisionTerminaleClub = createdClubs[2]
  if (revisionTerminaleClub) {
    const gradeTerminale = findGrade("Terminale")
    if (gradeTerminale) {
      const rule = await prisma.clubEligibilityRule.create({
        data: {
          clubId: revisionTerminaleClub.id,
          ruleType: "GRADE_AND_SERIES",
          gradeRules: {
            create: [{ gradeId: gradeTerminale.id }],
          },
          seriesRules: {
            create: [
              { series: "SM" }, // Sciences Mathématiques
              { series: "SS" }, // Sciences Sociales
            ],
          },
        },
      })
      console.log(`  ✓ Eligibility rule for ${revisionTerminaleClub.name}: Terminale SM & SS only`)
    }
  }

  // Informatique - 7ème to Terminale (except 10ème)
  const informatiqueClub = createdClubs[3]
  if (informatiqueClub) {
    // Find all middle and high school grades except 10ème (2nde)
    const eligibleGrades = grades.filter((g) => {
      return (
        g.schoolLevel === "middle" || // All middle school (7ème-9ème)
        (g.schoolLevel === "high" && g.name !== "2nde") // High school except 10ème
      )
    })

    if (eligibleGrades.length > 0) {
      const rule = await prisma.clubEligibilityRule.create({
        data: {
          clubId: informatiqueClub.id,
          ruleType: "GRADE_BASED",
          gradeRules: {
            create: eligibleGrades.map((g) => ({ gradeId: g.id })),
          },
        },
      })
      console.log(`  ✓ Eligibility rule for ${informatiqueClub.name}: 7ème-Terminale (except 10ème)`)
    }
  }

  console.log("\n✅ Clubs seed completed!")
  console.log(`   - ${createdCategories.length} categories created`)
  console.log(`   - ${createdClubs.length} clubs created with eligibility rules`)
}

seedClubs()
  .then(async () => {
    await prisma.$disconnect()
    await pool.end()
    process.exit(0)
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    await pool.end()
    process.exit(1)
  })
