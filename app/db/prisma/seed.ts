/**
 * Seed script to create school years, grades, students, enrollments, payments,
 * subjects, teachers, attendance, and expenses.
 * Run this to initialize the full system data.
 *
 * Usage: npx tsx app/db/prisma/seed.ts
 */

import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient, PaymentMethod, PaymentStatus, EnrollmentStatus, AttendanceStatus, AttendanceEntryMode, ExpenseStatus, ExpenseCategory, Gender, PersonStatus, StudentStatus } from "@prisma/client"
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
// Kindergarten (PS, MS, GS): 1,200,000 GNF
// Elementary (1-6): 800,000 - 900,000 GNF
// College (7-10): 1,000,000 - 1,100,000 GNF
// High School (11-Terminal): 1,200,000 - 1,300,000 GNF
type SchoolLevel = "kindergarten" | "elementary" | "college" | "high_school"

interface GradeConfig {
  name: string
  level: SchoolLevel
  order: number
  tuitionFee: number
  capacity: number
}

const GRADES_CONFIG: GradeConfig[] = [
  // Kindergarten (Maternelle) - PS, MS, GS - smaller classes
  { name: "Petite Section (PS)", level: "kindergarten", order: -2, tuitionFee: 1200000, capacity: 25 },
  { name: "Moyenne Section (MS)", level: "kindergarten", order: -1, tuitionFee: 1200000, capacity: 25 },
  { name: "Grande Section (GS)", level: "kindergarten", order: 0, tuitionFee: 1200000, capacity: 30 },

  // Elementary School (Primaire) - Grades 1-6
  { name: "1ère Année", level: "elementary", order: 1, tuitionFee: 800000, capacity: 35 },
  { name: "2ème Année", level: "elementary", order: 2, tuitionFee: 820000, capacity: 35 },
  { name: "3ème Année", level: "elementary", order: 3, tuitionFee: 840000, capacity: 35 },
  { name: "4ème Année", level: "elementary", order: 4, tuitionFee: 860000, capacity: 35 },
  { name: "5ème Année", level: "elementary", order: 5, tuitionFee: 880000, capacity: 35 },
  { name: "6ème Année", level: "elementary", order: 6, tuitionFee: 900000, capacity: 35 },

  // College (Collège) - Grades 7-10
  { name: "7ème Année", level: "college", order: 7, tuitionFee: 1000000, capacity: 40 },
  { name: "8ème Année", level: "college", order: 8, tuitionFee: 1025000, capacity: 40 },
  { name: "9ème Année", level: "college", order: 9, tuitionFee: 1050000, capacity: 40 },
  { name: "10ème Année", level: "college", order: 10, tuitionFee: 1100000, capacity: 40 },

  // High School (Lycée) - Grades 11-Terminal
  { name: "11ème Année", level: "high_school", order: 11, tuitionFee: 1200000, capacity: 35 },
  { name: "12ème Année", level: "high_school", order: 12, tuitionFee: 1250000, capacity: 35 },
  { name: "Terminale", level: "high_school", order: 13, tuitionFee: 1300000, capacity: 30 },
]

// Subject configuration from Guinea curriculum
interface SubjectConfig {
  code: string
  nameFr: string
  nameEn: string
  isOptional: boolean
}

const SUBJECTS_CONFIG: SubjectConfig[] = [
  // Core subjects
  { code: "FRANCAIS", nameFr: "Français", nameEn: "French", isOptional: false },
  { code: "MATH", nameFr: "Mathématiques", nameEn: "Mathematics", isOptional: false },
  { code: "ANG", nameFr: "Anglais", nameEn: "English", isOptional: false },
  { code: "HIST_GEO", nameFr: "Histoire-Géographie", nameEn: "History-Geography", isOptional: false },
  { code: "EDU_CIV", nameFr: "Éducation civique et morale", nameEn: "Civic and Moral Education", isOptional: false },
  { code: "SVT", nameFr: "Sciences de la vie et de la terre", nameEn: "Life and Earth Sciences", isOptional: false },
  { code: "PC", nameFr: "Physique-Chimie", nameEn: "Physics-Chemistry", isOptional: false },
  { code: "EPS", nameFr: "Éducation physique et sportive", nameEn: "Physical Education", isOptional: false },

  // Elementary specific
  { code: "LECTURE", nameFr: "Lecture", nameEn: "Reading", isOptional: false },
  { code: "ECRITURE", nameFr: "Écriture", nameEn: "Writing", isOptional: false },
  { code: "CALC", nameFr: "Calcul", nameEn: "Arithmetic", isOptional: false },
  { code: "DESSIN", nameFr: "Dessin", nameEn: "Drawing/Art", isOptional: false },
  { code: "CHANT", nameFr: "Chant", nameEn: "Singing", isOptional: false },
  { code: "TRAV_MAN", nameFr: "Travaux manuels", nameEn: "Manual Work/Crafts", isOptional: false },
  { code: "SCI_NAT", nameFr: "Sciences naturelles", nameEn: "Natural Sciences", isOptional: false },

  // College/High school specific
  { code: "TECH", nameFr: "Technologie", nameEn: "Technology", isOptional: false },
  { code: "ARTS_PLAST", nameFr: "Arts plastiques", nameEn: "Visual Arts", isOptional: false },
  { code: "MUSIQUE", nameFr: "Éducation musicale", nameEn: "Music Education", isOptional: false },
  { code: "INFO", nameFr: "Informatique", nameEn: "Computer Science", isOptional: false },
  { code: "PHILO", nameFr: "Philosophie", nameEn: "Philosophy", isOptional: false },
  { code: "SES", nameFr: "Sciences économiques et sociales", nameEn: "Economic and Social Sciences", isOptional: false },
  { code: "TECH_IND", nameFr: "Technologie industrielle", nameEn: "Industrial Technology", isOptional: false },

  // Optional subjects
  { code: "ARABE", nameFr: "Arabe", nameEn: "Arabic", isOptional: true },
  { code: "ESP", nameFr: "Espagnol", nameEn: "Spanish", isOptional: true },
]

// Grade-subject mappings (which subjects for which grades)
// Key: grade order, Value: array of subject codes
const GRADE_SUBJECTS_MAP: { [gradeOrder: number]: string[] } = {
  // Kindergarten - Maternelle (PS, MS, GS)
  [-2]: ["LECTURE", "ECRITURE", "CALC", "DESSIN", "CHANT", "EPS"], // Petite Section
  [-1]: ["LECTURE", "ECRITURE", "CALC", "DESSIN", "CHANT", "EPS"], // Moyenne Section
  0: ["LECTURE", "ECRITURE", "CALC", "FRANCAIS", "DESSIN", "CHANT", "EPS"], // Grande Section

  // Elementary - Grades 1-2 (CP1, CP2)
  1: ["LECTURE", "ECRITURE", "CALC", "FRANCAIS", "EDU_CIV", "HIST_GEO", "SCI_NAT", "DESSIN", "CHANT", "EPS", "TRAV_MAN"],
  2: ["LECTURE", "ECRITURE", "CALC", "FRANCAIS", "EDU_CIV", "HIST_GEO", "SCI_NAT", "DESSIN", "CHANT", "EPS", "TRAV_MAN"],
  // Elementary - Grades 3-6 (CE1, CE2, CM1, CM2)
  3: ["FRANCAIS", "MATH", "EDU_CIV", "HIST_GEO", "SCI_NAT", "DESSIN", "CHANT", "EPS", "TRAV_MAN"],
  4: ["FRANCAIS", "MATH", "EDU_CIV", "HIST_GEO", "SCI_NAT", "DESSIN", "CHANT", "EPS", "TRAV_MAN"],
  5: ["FRANCAIS", "MATH", "EDU_CIV", "HIST_GEO", "SCI_NAT", "DESSIN", "MUSIQUE", "EPS", "TRAV_MAN"],
  6: ["FRANCAIS", "MATH", "EDU_CIV", "HIST_GEO", "SCI_NAT", "DESSIN", "MUSIQUE", "EPS", "TRAV_MAN"],
  // College - Grades 7-10
  7: ["FRANCAIS", "MATH", "ANG", "HIST_GEO", "EDU_CIV", "SVT", "PC", "TECH", "ARTS_PLAST", "MUSIQUE", "EPS", "INFO"],
  8: ["FRANCAIS", "MATH", "ANG", "HIST_GEO", "EDU_CIV", "SVT", "PC", "TECH", "ARTS_PLAST", "MUSIQUE", "EPS", "INFO"],
  9: ["FRANCAIS", "MATH", "ANG", "HIST_GEO", "EDU_CIV", "SVT", "PC", "TECH", "ARTS_PLAST", "MUSIQUE", "EPS", "INFO", "ARABE"],
  10: ["FRANCAIS", "MATH", "ANG", "HIST_GEO", "EDU_CIV", "SVT", "PC", "TECH", "ARTS_PLAST", "MUSIQUE", "EPS", "INFO", "ARABE"],
  // High School - Grade 11 (Seconde - common core)
  11: ["FRANCAIS", "MATH", "ANG", "HIST_GEO", "EDU_CIV", "SVT", "PC", "PHILO", "INFO", "EPS", "ARABE", "ESP"],
  // High School - Grades 12-13 will use series-specific subjects
  12: ["FRANCAIS", "MATH", "ANG", "HIST_GEO", "SVT", "PC", "PHILO", "EPS", "INFO"],
  13: ["FRANCAIS", "MATH", "ANG", "HIST_GEO", "SVT", "PC", "PHILO", "EPS", "INFO"],
}

// Teacher names (mix of first and last names for realistic combinations)
const TEACHER_FIRST_NAMES = [
  "Mohamed", "Ousmane", "Ibrahima", "Souleymane", "Mamadou",
  "Fatou", "Aissatou", "Mariama", "Kadiatou", "Hawa",
  "Abdoulaye", "Thierno", "Lansana", "Moussa", "Seydou"
]

const TEACHER_LAST_NAMES = [
  "Diallo", "Bah", "Barry", "Sow", "Camara",
  "Sylla", "Keita", "Conde", "Toure", "Traore"
]

// Teacher specializations mapped to subject codes
const TEACHER_SPECIALIZATIONS: { [key: string]: string[] } = {
  "Lettres": ["FRANCAIS", "LECTURE", "ECRITURE"],
  "Mathématiques": ["MATH", "CALC"],
  "Sciences": ["SVT", "SCI_NAT", "PC"],
  "Langues": ["ANG", "ARABE", "ESP"],
  "Histoire-Géographie": ["HIST_GEO", "EDU_CIV"],
  "Arts": ["DESSIN", "ARTS_PLAST", "MUSIQUE", "CHANT"],
  "EPS": ["EPS"],
  "Technologie": ["TECH", "TECH_IND", "INFO", "TRAV_MAN"],
  "Philosophie": ["PHILO", "SES"],
}

// Expense categories with sample descriptions
const EXPENSE_SAMPLES = [
  { category: ExpenseCategory.supplies, description: "Fournitures de bureau", amount: 250000 },
  { category: ExpenseCategory.supplies, description: "Manuels scolaires", amount: 500000 },
  { category: ExpenseCategory.maintenance, description: "Réparation fenêtres salle 3", amount: 150000 },
  { category: ExpenseCategory.maintenance, description: "Peinture extérieure", amount: 800000 },
  { category: ExpenseCategory.utilities, description: "Facture électricité novembre", amount: 180000 },
  { category: ExpenseCategory.utilities, description: "Facture eau octobre", amount: 75000 },
  { category: ExpenseCategory.transport, description: "Transport excursion CM2", amount: 300000 },
  { category: ExpenseCategory.communication, description: "Recharge internet mensuelle", amount: 100000 },
  { category: ExpenseCategory.other, description: "Décoration fête de fin d'année", amount: 200000 },
  { category: ExpenseCategory.other, description: "Équipement sportif", amount: 450000 },
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

// Helper to check if date is a school day
// Elementary/College: Mon-Fri, High School: Mon-Sat
function isSchoolDay(date: Date, level: SchoolLevel): boolean {
  const dayOfWeek = date.getDay() // 0 = Sunday, 6 = Saturday
  if (dayOfWeek === 0) return false // No school on Sunday
  if (dayOfWeek === 6) {
    // Saturday: only High School has class
    return level === "high_school"
  }
  return true // Monday-Friday
}

// Helper to get school days between two dates
function getSchoolDays(startDate: Date, endDate: Date, level: SchoolLevel): Date[] {
  const days: Date[] = []
  const current = new Date(startDate)

  while (current <= endDate) {
    if (isSchoolDay(current, level)) {
      days.push(new Date(current))
    }
    current.setDate(current.getDate() + 1)
  }

  return days
}

// Helper to generate random email for teachers
function generateTeacherEmail(firstName: string, lastName: string): string {
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@gspn.edu.gn`
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
            capacity: gradeConfig.capacity,
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
            capacity: gradeConfig.capacity,
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
            capacity: gradeConfig.capacity,
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

    // ========================================================================
    // Create Subjects
    // ========================================================================
    console.log("\n📚 Creating subjects...")
    const subjectMap = new Map<string, string>() // code -> id

    for (const subjectConfig of SUBJECTS_CONFIG) {
      let subject = await prisma.subject.findUnique({
        where: { code: subjectConfig.code },
      })

      if (!subject) {
        subject = await prisma.subject.create({
          data: {
            code: subjectConfig.code,
            nameFr: subjectConfig.nameFr,
            nameEn: subjectConfig.nameEn,
            isOptional: subjectConfig.isOptional,
          },
        })
      }
      subjectMap.set(subjectConfig.code, subject.id)
    }
    console.log(`   ✓ Created ${subjectMap.size} subjects`)

    // ========================================================================
    // Create Teachers (Person + TeacherProfile)
    // ========================================================================
    console.log("\n👨‍🏫 Creating teachers...")
    const teacherProfiles: { id: string; personId: string; specialization: string }[] = []
    const specializations = Object.keys(TEACHER_SPECIALIZATIONS)
    let teacherCounter = 0

    // Create 15-20 teachers
    const numTeachers = 18
    for (let i = 0; i < numTeachers; i++) {
      const firstName = randomElement(TEACHER_FIRST_NAMES)
      const lastName = randomElement(TEACHER_LAST_NAMES)
      const specialization = specializations[i % specializations.length]
      const email = generateTeacherEmail(firstName, lastName) + (i > 0 ? i : "")
      const employeeNumber = `EMP-2024-${(i + 1).toString().padStart(4, "0")}`

      // Check if Person already exists
      let person = await prisma.person.findFirst({
        where: {
          email: { startsWith: `${firstName.toLowerCase()}.${lastName.toLowerCase()}` },
        },
      })

      if (!person) {
        person = await prisma.person.create({
          data: {
            firstName,
            lastName,
            email,
            phone: randomPhone(),
            dateOfBirth: new Date(1975 + Math.floor(Math.random() * 20), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
            gender: i % 3 === 0 ? Gender.female : Gender.male,
            status: PersonStatus.active,
          },
        })
      }

      // Check if TeacherProfile exists
      let teacherProfile = await prisma.teacherProfile.findUnique({
        where: { personId: person.id },
      })

      if (!teacherProfile) {
        teacherProfile = await prisma.teacherProfile.create({
          data: {
            personId: person.id,
            employeeNumber,
            hireDate: new Date(2020 + Math.floor(Math.random() * 4), 8, 1),
            specialization,
          },
        })
      }

      teacherProfiles.push({
        id: teacherProfile.id,
        personId: person.id,
        specialization,
      })
      teacherCounter++
    }
    console.log(`   ✓ Created ${teacherCounter} teachers`)

    // ========================================================================
    // Create GradeSubjects and ClassAssignments
    // ========================================================================
    console.log("\n📖 Creating grade-subject mappings and teacher assignments...")
    let gradeSubjectCount = 0
    let classAssignmentCount = 0

    for (const grade of currentGrades) {
      const subjectCodes = GRADE_SUBJECTS_MAP[grade.order] || []

      for (const subjectCode of subjectCodes) {
        const subjectId = subjectMap.get(subjectCode)
        if (!subjectId) continue

        // Check if GradeSubject exists
        let gradeSubject = await prisma.gradeSubject.findFirst({
          where: {
            gradeId: grade.id,
            subjectId,
            series: null,
          },
        })

        if (!gradeSubject) {
          gradeSubject = await prisma.gradeSubject.create({
            data: {
              gradeId: grade.id,
              subjectId,
              coefficient: subjectCode === "MATH" || subjectCode === "FRANCAIS" ? 3 : 2,
              hoursPerWeek: subjectCode === "EPS" ? 2 : subjectCode === "MATH" || subjectCode === "FRANCAIS" ? 5 : 3,
            },
          })
          gradeSubjectCount++
        }

        // Find a teacher with matching specialization
        const subjectSpec = Object.entries(TEACHER_SPECIALIZATIONS).find(([, codes]) =>
          codes.includes(subjectCode)
        )
        if (subjectSpec) {
          const matchingTeacher = teacherProfiles.find(t => t.specialization === subjectSpec[0])
          if (matchingTeacher) {
            // Check if ClassAssignment exists
            const existingAssignment = await prisma.classAssignment.findFirst({
              where: {
                gradeSubjectId: gradeSubject.id,
                schoolYearId: currentSchoolYear.id,
              },
            })

            if (!existingAssignment) {
              await prisma.classAssignment.create({
                data: {
                  gradeSubjectId: gradeSubject.id,
                  teacherProfileId: matchingTeacher.id,
                  schoolYearId: currentSchoolYear.id,
                },
              })
              classAssignmentCount++
            }
          }
        }
      }
    }
    console.log(`   ✓ Created ${gradeSubjectCount} grade-subject mappings`)
    console.log(`   ✓ Created ${classAssignmentCount} teacher assignments`)

    // ========================================================================
    // Assign Grade Leaders
    // ========================================================================
    console.log("\n👔 Assigning grade leaders...")
    let gradeLeaderCount = 0

    for (let i = 0; i < currentGrades.length; i++) {
      const grade = currentGrades[i]
      const teacher = teacherProfiles[i % teacherProfiles.length]

      await prisma.grade.update({
        where: { id: grade.id },
        data: { gradeLeaderId: teacher.id },
      })
      gradeLeaderCount++
    }
    console.log(`   ✓ Assigned ${gradeLeaderCount} grade leaders`)

    // ========================================================================
    // Create StudentProfiles for existing students (for attendance)
    // ========================================================================
    console.log("\n👤 Creating student profiles...")
    const allStudents = await prisma.student.findMany({
      where: { status: "active" },
    })

    const studentProfileMap = new Map<string, string>() // studentId -> studentProfileId

    for (const student of allStudents) {
      // Check if Person exists for this student
      let person = await prisma.person.findFirst({
        where: {
          firstName: student.firstName,
          lastName: student.lastName,
          studentProfile: { studentId: student.id },
        },
      })

      if (!person) {
        person = await prisma.person.create({
          data: {
            firstName: student.firstName,
            lastName: student.lastName,
            email: student.email,
            dateOfBirth: student.dateOfBirth,
            gender: Math.random() > 0.5 ? Gender.male : Gender.female,
            status: PersonStatus.active,
          },
        })
      }

      // Check if StudentProfile exists
      let studentProfile = await prisma.studentProfile.findFirst({
        where: { studentId: student.id },
      })

      if (!studentProfile) {
        // Find current grade for student
        const enrollment = await prisma.enrollment.findFirst({
          where: {
            studentId: student.id,
            schoolYearId: currentSchoolYear.id,
            status: EnrollmentStatus.completed,
          },
          include: { grade: true },
        })

        studentProfile = await prisma.studentProfile.create({
          data: {
            personId: person.id,
            studentId: student.id,
            studentNumber: student.studentNumber,
            studentStatus: StudentStatus.active,
            enrollmentDate: student.enrollmentDate,
            currentGradeId: enrollment?.gradeId,
          },
        })
      }

      studentProfileMap.set(student.id, studentProfile.id)
    }
    console.log(`   ✓ Created ${studentProfileMap.size} student profiles`)

    // ========================================================================
    // Create Attendance Sessions and Records (Sept 15 to now, 10% absences)
    // ========================================================================
    console.log("\n📋 Creating attendance records...")
    const attendanceStartDate = new Date("2025-09-15")
    const attendanceEndDate = new Date() // Today
    let sessionCount = 0
    let recordCount = 0

    for (const grade of currentGrades) {
      const gradeConfig = GRADES_CONFIG.find(g => g.order === grade.order)
      if (!gradeConfig) continue

      const schoolDays = getSchoolDays(attendanceStartDate, attendanceEndDate, gradeConfig.level)

      // Get enrolled students for this grade
      const enrolledStudents = await prisma.enrollment.findMany({
        where: {
          gradeId: grade.id,
          schoolYearId: currentSchoolYear.id,
          status: EnrollmentStatus.completed,
        },
        include: { student: true },
      })

      for (const schoolDay of schoolDays) {
        // Check if session already exists
        const existingSession = await prisma.attendanceSession.findFirst({
          where: {
            gradeId: grade.id,
            date: schoolDay,
          },
        })

        if (existingSession) continue

        // Create attendance session
        const session = await prisma.attendanceSession.create({
          data: {
            gradeId: grade.id,
            date: schoolDay,
            entryMode: AttendanceEntryMode.checklist,
            isComplete: true,
            completedAt: new Date(schoolDay.getTime() + 9 * 60 * 60 * 1000), // 9 AM
            recordedBy: director.id,
          },
        })
        sessionCount++

        // Create attendance records for each student
        for (const enrollment of enrolledStudents) {
          if (!enrollment.studentId) continue

          const studentProfileId = studentProfileMap.get(enrollment.studentId)
          if (!studentProfileId) continue

          // 10% chance of absence
          const isAbsent = Math.random() < 0.10
          const isLate = !isAbsent && Math.random() < 0.05 // 5% chance of being late

          let status: AttendanceStatus
          if (isAbsent) {
            status = AttendanceStatus.absent
          } else if (isLate) {
            status = AttendanceStatus.late
          } else {
            status = AttendanceStatus.present
          }

          await prisma.attendanceRecord.create({
            data: {
              sessionId: session.id,
              studentProfileId,
              status,
              notes: isAbsent ? "Absence non justifiée" : null,
              recordedBy: director.id,
            },
          })
          recordCount++
        }
      }

      console.log(`   ✓ ${grade.name}: ${schoolDays.length} sessions created`)
    }
    console.log(`   ✓ Total: ${sessionCount} attendance sessions, ${recordCount} records`)

    // ========================================================================
    // Create Sample Expenses
    // ========================================================================
    console.log("\n💰 Creating sample expenses...")
    let expenseCount = 0

    for (const expenseSample of EXPENSE_SAMPLES) {
      // Randomize the date within the last 3 months
      const daysAgo = Math.floor(Math.random() * 90)
      const expenseDate = new Date()
      expenseDate.setDate(expenseDate.getDate() - daysAgo)

      // Randomize the status
      const statusOptions = [ExpenseStatus.pending, ExpenseStatus.approved, ExpenseStatus.paid, ExpenseStatus.rejected]
      const status = statusOptions[Math.floor(Math.random() * statusOptions.length)]

      await prisma.expense.create({
        data: {
          category: expenseSample.category,
          description: expenseSample.description,
          amount: expenseSample.amount + Math.floor(Math.random() * 50000), // Add some variance
          method: Math.random() > 0.8 ? PaymentMethod.orange_money : PaymentMethod.cash,
          date: expenseDate,
          vendorName: status !== ExpenseStatus.pending ? randomElement(["Papeterie Centrale", "Mamadou Fournitures", "EDG", "SOTELGUI"]) : null,
          status,
          requestedBy: director.id,
          approvedBy: status !== ExpenseStatus.pending && status !== ExpenseStatus.rejected ? director.id : null,
          approvedAt: status === ExpenseStatus.approved || status === ExpenseStatus.paid ? new Date(expenseDate.getTime() + 2 * 24 * 60 * 60 * 1000) : null,
          rejectionReason: status === ExpenseStatus.rejected ? "Budget insuffisant" : null,
          paidAt: status === ExpenseStatus.paid ? new Date(expenseDate.getTime() + 5 * 24 * 60 * 60 * 1000) : null,
        },
      })
      expenseCount++
    }
    console.log(`   ✓ Created ${expenseCount} sample expenses`)

    // Summary
    const gradeCount = await prisma.grade.count({
      where: { schoolYearId: currentSchoolYear.id },
    })

    const enrollmentCount = await prisma.enrollment.count({
      where: { schoolYearId: currentSchoolYear.id },
    })

    const paymentCount = await prisma.payment.count()
    const subjectCount = await prisma.subject.count()
    const teacherCount = await prisma.teacherProfile.count()
    const attendanceSessionCount = await prisma.attendanceSession.count()
    const attendanceRecordCount = await prisma.attendanceRecord.count()
    const expenseCountDb = await prisma.expense.count()

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
    console.log(`\n   Subjects: ${subjectCount}`)
    console.log(`   Teachers: ${teacherCount}`)
    console.log(`   Attendance Sessions: ${attendanceSessionCount}`)
    console.log(`   Attendance Records: ${attendanceRecordCount}`)
    console.log(`   Expenses: ${expenseCountDb}`)
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
