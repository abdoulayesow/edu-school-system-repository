/**
 * Seed script to create school years, grades, students, enrollments, and payments.
 * Run this to initialize the enrollment system data.
 *
 * Usage: npx tsx app/db/prisma/seed.ts
 */

import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient, PaymentMethod, PaymentStatus, EnrollmentStatus } from "@prisma/client"
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

// Director email for seed data
const DIRECTOR_EMAIL = "abdoulaye.sow.1989@gmail.com"

// Previous school year configuration (2024-2025)
const PREVIOUS_SCHOOL_YEAR_CONFIG = {
  name: "2024 - 2025",
  startDate: new Date("2024-09-01"),
  endDate: new Date("2025-06-30"),
  enrollmentStart: new Date("2024-07-01"),
  enrollmentEnd: new Date("2024-10-15"),
  isActive: false,
}

// Current school year configuration (2025-2026)
const SCHOOL_YEAR_CONFIG = {
  name: "2025 - 2026",
  startDate: new Date("2025-09-01"),
  endDate: new Date("2026-06-30"),
  enrollmentStart: new Date("2025-07-01"),
  enrollmentEnd: new Date("2026-06-15"),
  isActive: true,
}

// Guinean first names
const FIRST_NAMES = [
  "Fatoumata", "Mamadou", "Aminata", "Oumar", "Aissata",
  "Ibrahim", "Mariama", "Alseny", "Kadiatou", "Alpha",
  "Fanta", "Boubacar", "Djénéba", "Sékou", "Hawa",
  "Moussa", "Binta", "Abdoulaye", "Nana", "Thierno",
  "Oumou", "Lamine", "Maimouna", "Ibrahima", "Safiatou"
]

// Guinean last names
const LAST_NAMES = [
  "Diallo", "Sylla", "Touré", "Keita", "Conte",
  "Bah", "Camara", "Sow", "Barry", "Baldé",
  "Diakité", "Condé", "Traoré", "Soumah", "Bangoura"
]

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

// Helper to generate random date of birth for students
function generateDateOfBirth(gradeOrder: number): Date {
  // Grade 1 students are ~6 years old, Grade 13 students are ~18 years old
  const baseAge = 5 + gradeOrder
  const year = new Date().getFullYear() - baseAge
  const month = Math.floor(Math.random() * 12)
  const day = Math.floor(Math.random() * 28) + 1
  return new Date(year, month, day)
}

// Helper to format birthday as DDMMYYYY
function formatBirthday(date: Date): string {
  const day = date.getDate().toString().padStart(2, "0")
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  const year = date.getFullYear().toString()
  return `${day}${month}${year}`
}

// Helper to get random element from array
function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

// Helper to get random phone number
function randomPhone(): string {
  const prefixes = ["620", "621", "622", "623", "624", "625", "626", "627", "628", "629"]
  const prefix = randomElement(prefixes)
  const number = Math.floor(Math.random() * 1000000).toString().padStart(6, "0")
  return `+224 ${prefix} ${number.slice(0, 2)} ${number.slice(2, 4)} ${number.slice(4, 6)}`
}

async function main() {
  console.log("🌱 Seeding school years, grades, students, and enrollments...")

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
    // Get director user
    const director = await prisma.user.findUnique({
      where: { email: DIRECTOR_EMAIL },
    })

    if (!director) {
      console.error(`❌ Director user not found: ${DIRECTOR_EMAIL}`)
      console.log("   Please create the director user first via the application")
      process.exit(1)
    }
    console.log(`   Found director: ${director.name || director.email}`)

    // Deactivate all existing school years first
    await prisma.schoolYear.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    })
    console.log("   Deactivated existing active school years")

    // ========================================================================
    // Create Previous School Year (2024-2025)
    // ========================================================================
    console.log("\n📅 Creating previous school year (2024-2025)...")
    let previousSchoolYear = await prisma.schoolYear.findFirst({
      where: { name: PREVIOUS_SCHOOL_YEAR_CONFIG.name },
    })

    if (!previousSchoolYear) {
      previousSchoolYear = await prisma.schoolYear.create({
        data: PREVIOUS_SCHOOL_YEAR_CONFIG,
      })
      console.log(`   ✓ Created: ${previousSchoolYear.name}`)
    } else {
      console.log(`   ✓ Found existing: ${previousSchoolYear.name}`)
    }

    // Create grades for previous school year
    console.log("   Creating grades for 2024-2025...")
    const previousGrades: { id: string; order: number; tuitionFee: number; name: string }[] = []
    for (const gradeConfig of GRADES_CONFIG) {
      let grade = await prisma.grade.findFirst({
        where: {
          schoolYearId: previousSchoolYear.id,
          order: gradeConfig.order,
        },
      })

      if (!grade) {
        grade = await prisma.grade.create({
          data: {
            name: gradeConfig.name,
            level: gradeConfig.level,
            order: gradeConfig.order,
            tuitionFee: gradeConfig.tuitionFee,
            schoolYearId: previousSchoolYear.id,
          },
        })
      }
      previousGrades.push({ id: grade.id, order: grade.order, tuitionFee: grade.tuitionFee, name: grade.name })
    }
    console.log(`   ✓ Created ${previousGrades.length} grades for 2024-2025`)

    // ========================================================================
    // Create Current School Year (2025-2026)
    // ========================================================================
    console.log("\n📅 Creating current school year (2025-2026)...")
    let currentSchoolYear = await prisma.schoolYear.findFirst({
      where: { name: SCHOOL_YEAR_CONFIG.name },
    })

    if (currentSchoolYear) {
      currentSchoolYear = await prisma.schoolYear.update({
        where: { id: currentSchoolYear.id },
        data: { ...SCHOOL_YEAR_CONFIG, isActive: true },
      })
      console.log(`   ✓ Updated: ${currentSchoolYear.name} (Active)`)
    } else {
      currentSchoolYear = await prisma.schoolYear.create({
        data: SCHOOL_YEAR_CONFIG,
      })
      console.log(`   ✓ Created: ${currentSchoolYear.name} (Active)`)
    }

    // Create grades for current school year
    console.log("   Creating grades for 2025-2026...")
    const currentGrades: { id: string; order: number; tuitionFee: number; name: string }[] = []
    for (const gradeConfig of GRADES_CONFIG) {
      let grade = await prisma.grade.findFirst({
        where: {
          schoolYearId: currentSchoolYear.id,
          order: gradeConfig.order,
        },
      })

      if (!grade) {
        grade = await prisma.grade.create({
          data: {
            name: gradeConfig.name,
            level: gradeConfig.level,
            order: gradeConfig.order,
            tuitionFee: gradeConfig.tuitionFee,
            schoolYearId: currentSchoolYear.id,
          },
        })
      } else {
        await prisma.grade.update({
          where: { id: grade.id },
          data: {
            name: gradeConfig.name,
            level: gradeConfig.level,
            tuitionFee: gradeConfig.tuitionFee,
          },
        })
      }
      currentGrades.push({ id: grade.id, order: grade.order, tuitionFee: grade.tuitionFee, name: grade.name })
    }
    console.log(`   ✓ Created ${currentGrades.length} grades for 2025-2026`)

    // ========================================================================
    // Create Returning Students (5-10 per grade) for 2024-2025
    // ========================================================================
    console.log("\n👥 Creating returning students from 2024-2025...")
    let studentCounter = 1
    const returningStudents: { studentId: string; gradeOrder: number }[] = []

    for (const grade of previousGrades) {
      const numStudents = Math.floor(Math.random() * 6) + 5 // 5-10 students

      for (let i = 0; i < numStudents; i++) {
        const firstName = randomElement(FIRST_NAMES)
        const lastName = randomElement(LAST_NAMES)
        const dateOfBirth = generateDateOfBirth(grade.order)
        const birthdayStr = formatBirthday(dateOfBirth)
        const studentNumber = `STD-2024-${birthdayStr}-${studentCounter.toString().padStart(4, "0")}`

        // Check if student already exists
        let student = await prisma.student.findUnique({
          where: { studentNumber },
        })

        if (!student) {
          student = await prisma.student.create({
            data: {
              studentNumber,
              firstName,
              lastName,
              dateOfBirth,
              guardianName: `${randomElement(FIRST_NAMES)} ${lastName}`,
              guardianPhone: randomPhone(),
              grade: grade.name,
              status: "active",
              enrollmentDate: new Date("2024-09-01"),
            },
          })

          // Create enrollment for 2024-2025
          const enrollmentNumber = `ENR-2024-${grade.order.toString().padStart(2, "0")}-${studentCounter.toString().padStart(5, "0")}`
          await prisma.enrollment.create({
            data: {
              enrollmentNumber,
              studentId: student.id,
              schoolYearId: previousSchoolYear.id,
              gradeId: grade.id,
              firstName,
              lastName,
              dateOfBirth,
              gender: Math.random() > 0.5 ? "male" : "female",
              fatherName: `${randomElement(FIRST_NAMES)} ${lastName}`,
              fatherPhone: randomPhone(),
              motherName: `${randomElement(FIRST_NAMES)} ${lastName}`,
              motherPhone: randomPhone(),
              originalTuitionFee: grade.tuitionFee,
              status: EnrollmentStatus.completed,
              isReturningStudent: false,
              submittedAt: new Date("2024-08-15"),
              approvedAt: new Date("2024-08-20"),
              approvedBy: director.id,
              statusChangedAt: new Date("2024-08-20"),
              statusChangedBy: director.id,
              statusComment: "Enrollment approved for 2024-2025 school year",
              createdBy: director.id,
            },
          })
        }

        // Only some students will be returning (those not in Terminal)
        if (grade.order < 13) {
          returningStudents.push({ studentId: student.id, gradeOrder: grade.order + 1 })
        }
        studentCounter++
      }
    }
    console.log(`   ✓ Created ${studentCounter - 1} students from 2024-2025`)
    console.log(`   ✓ ${returningStudents.length} students eligible to return in 2025-2026`)

    // ========================================================================
    // Create Current Year Enrollments (10-15 per grade) for 2025-2026
    // ========================================================================
    console.log("\n📝 Creating enrollments for 2025-2026 with payments...")
    let enrollmentCounter = 1
    let totalEnrollments = 0
    let totalPayments = 0
    const usedReturningStudents = new Set<string>()

    for (const grade of currentGrades) {
      const numEnrollments = Math.floor(Math.random() * 6) + 10 // 10-15 enrollments

      // Get returning students for this grade
      const eligibleReturning = returningStudents.filter(
        (s) => s.gradeOrder === grade.order && !usedReturningStudents.has(s.studentId)
      )
      const numReturning = Math.min(eligibleReturning.length, Math.floor(numEnrollments / 2))

      for (let i = 0; i < numEnrollments; i++) {
        const isReturning = i < numReturning
        let studentId: string | null = null
        let firstName: string
        let lastName: string
        let dateOfBirth: Date
        let gender: string

        if (isReturning && eligibleReturning[i]) {
          // Use returning student
          studentId = eligibleReturning[i].studentId
          usedReturningStudents.add(studentId)

          const student = await prisma.student.findUnique({ where: { id: studentId } })
          if (student) {
            firstName = student.firstName
            lastName = student.lastName
            dateOfBirth = student.dateOfBirth || generateDateOfBirth(grade.order)
            gender = Math.random() > 0.5 ? "male" : "female"
          } else {
            continue
          }
        } else {
          // New student
          firstName = randomElement(FIRST_NAMES)
          lastName = randomElement(LAST_NAMES)
          dateOfBirth = generateDateOfBirth(grade.order)
          gender = Math.random() > 0.5 ? "male" : "female"
        }

        const enrollmentNumber = `ENR-2025-${grade.order.toString().padStart(2, "0")}-${enrollmentCounter.toString().padStart(5, "0")}`

        // Check if enrollment already exists
        const existingEnrollment = await prisma.enrollment.findUnique({
          where: { enrollmentNumber },
        })

        if (existingEnrollment) {
          enrollmentCounter++
          continue
        }

        // Create enrollment
        const enrollment = await prisma.enrollment.create({
          data: {
            enrollmentNumber,
            studentId,
            schoolYearId: currentSchoolYear.id,
            gradeId: grade.id,
            firstName,
            lastName,
            dateOfBirth,
            gender,
            fatherName: `${randomElement(FIRST_NAMES)} ${lastName}`,
            fatherPhone: randomPhone(),
            motherName: `${randomElement(FIRST_NAMES)} ${lastName}`,
            motherPhone: randomPhone(),
            address: `Quartier ${randomElement(["Tata", "Madina", "Kaloum", "Ratoma", "Matoto"])}, Labe, Guinee`,
            originalTuitionFee: grade.tuitionFee,
            status: EnrollmentStatus.completed,
            isReturningStudent: isReturning,
            submittedAt: new Date("2025-08-01"),
            approvedAt: new Date("2025-08-05"),
            approvedBy: director.id,
            statusChangedAt: new Date("2025-08-05"),
            statusChangedBy: director.id,
            statusComment: "Enrollment approved for 2025-2026 school year",
            createdBy: director.id,
          },
        })

        // Create 3 payment schedules
        const schedule1Amount = Math.floor(grade.tuitionFee / 3)
        const schedule2Amount = Math.floor(grade.tuitionFee / 3)
        const schedule3Amount = grade.tuitionFee - schedule1Amount - schedule2Amount

        const schedules = [
          {
            scheduleNumber: 1,
            amount: schedule1Amount,
            months: ["September", "October", "November"],
            dueDate: new Date("2025-09-15"),
          },
          {
            scheduleNumber: 2,
            amount: schedule2Amount,
            months: ["December", "January", "February"],
            dueDate: new Date("2025-12-15"),
          },
          {
            scheduleNumber: 3,
            amount: schedule3Amount,
            months: ["March", "April", "May", "June"],
            dueDate: new Date("2026-03-15"),
          },
        ]

        for (const scheduleData of schedules) {
          const schedule = await prisma.paymentSchedule.create({
            data: {
              enrollmentId: enrollment.id,
              scheduleNumber: scheduleData.scheduleNumber,
              amount: scheduleData.amount,
              months: scheduleData.months,
              dueDate: scheduleData.dueDate,
              isPaid: true,
              paidAt: new Date(scheduleData.dueDate.getTime() - 7 * 24 * 60 * 60 * 1000), // Paid 7 days before due
            },
          })

          // Create payment for this schedule
          const receiptNumber = `CASH-2025-${(totalPayments + 1).toString().padStart(5, "0")}`
          await prisma.payment.create({
            data: {
              enrollmentId: enrollment.id,
              paymentScheduleId: schedule.id,
              amount: scheduleData.amount,
              method: PaymentMethod.cash,
              status: PaymentStatus.confirmed,
              receiptNumber,
              recordedBy: director.id,
              recordedAt: schedule.paidAt!,
              confirmedBy: director.id,
              confirmedAt: schedule.paidAt!,
            },
          })
          totalPayments++
        }

        totalEnrollments++
        enrollmentCounter++
      }

      console.log(`   ✓ ${grade.name}: ${numEnrollments} enrollments (${numReturning} returning)`)
    }

    // Summary
    const gradeCount = await prisma.grade.count({
      where: { schoolYearId: currentSchoolYear.id },
    })

    const enrollmentCount = await prisma.enrollment.count({
      where: { schoolYearId: currentSchoolYear.id },
    })

    const paymentCount = await prisma.payment.count()

    console.log("\n" + "=".repeat(60))
    console.log("✅ Seed completed!")
    console.log("=".repeat(60))
    console.log("\n📊 Summary:")
    console.log(`   Previous School Year: ${previousSchoolYear.name}`)
    console.log(`   Current School Year: ${currentSchoolYear.name} (Active)`)
    console.log(`   Total Grades: ${gradeCount}`)
    console.log(`   - Elementary (1-6): 6 grades`)
    console.log(`   - College (7-10): 4 grades`)
    console.log(`   - High School (11-Terminal): 3 grades`)
    console.log(`\n   Returning Students (2024-2025): ${studentCounter - 1}`)
    console.log(`   Current Enrollments (2025-2026): ${enrollmentCount}`)
    console.log(`   Total Payments: ${paymentCount}`)
    console.log("=".repeat(60))
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
