/**
 * Seed script to create school years, grades, students, enrollments, payments,
 * subjects, teachers, attendance, and expenses.
 * Run this to initialize the full system data.
 *
 * Usage:
 *   npx tsx app/db/prisma/seed.ts               # Seed all data
 *   npx tsx app/db/prisma/seed.ts --permissions # Only seed permissions
 *
 * To seed permissions separately:
 *   npx tsx app/db/prisma/seeds/seed-permissions.ts
 */

import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient, PaymentMethod, PaymentStatus, EnrollmentStatus, AttendanceStatus, AttendanceEntryMode, ExpenseStatus, ExpenseCategory, Gender, PersonStatus, StudentStatus, SalaryType, HoursRecordStatus, SalaryPaymentStatus, SalaryAdvanceStatus, RecoupmentStrategy, StaffRole, Role, SchoolLevel } from "@prisma/client"
import pg from "pg"
import fs from "fs"
import path from "path"
import { execSync } from "child_process"

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
interface GradeConfig {
  name: string
  level: SchoolLevel
  order: number
  tuitionFee: number
  capacity: number
  series?: string // SM, SS, SE for high school tracks
}

const GRADES_CONFIG: GradeConfig[] = [
  // Kindergarten (Maternelle) - PS, MS, GS
  { name: "Petite Section (PS)", level: "kindergarten", order: -2, tuitionFee: 1200000, capacity: 70 },
  { name: "Moyenne Section (MS)", level: "kindergarten", order: -1, tuitionFee: 1200000, capacity: 70 },
  { name: "Grande Section (GS)", level: "kindergarten", order: 0, tuitionFee: 1200000, capacity: 70 },

  // Elementary School (Primaire) - Grades 1-6
  { name: "1ère Année", level: "elementary", order: 1, tuitionFee: 800000, capacity: 70 },
  { name: "2ème Année", level: "elementary", order: 2, tuitionFee: 820000, capacity: 70 },
  { name: "3ème Année", level: "elementary", order: 3, tuitionFee: 840000, capacity: 70 },
  { name: "4ème Année", level: "elementary", order: 4, tuitionFee: 860000, capacity: 70 },
  { name: "5ème Année", level: "elementary", order: 5, tuitionFee: 880000, capacity: 70 },
  { name: "6ème Année", level: "elementary", order: 6, tuitionFee: 900000, capacity: 70 },

  // College (Collège) - Grades 7-10
  { name: "7ème Année", level: "college", order: 7, tuitionFee: 1000000, capacity: 70 },
  { name: "8ème Année", level: "college", order: 8, tuitionFee: 1025000, capacity: 70 },
  { name: "9ème Année", level: "college", order: 9, tuitionFee: 1050000, capacity: 70 },
  { name: "10ème Année", level: "college", order: 10, tuitionFee: 1100000, capacity: 70 },

  // High School (Lycée) - Grades 11-Terminal with specialized tracks (SM, SS, SE)
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

  // High School track-specific subjects
  { code: "PHYS", nameFr: "Physique", nameEn: "Physics", isOptional: false },
  { code: "CHIMIE", nameFr: "Chimie", nameEn: "Chemistry", isOptional: false },
  { code: "ECON", nameFr: "Économie", nameEn: "Economics", isOptional: false },
  { code: "SOCIO", nameFr: "Sociologie", nameEn: "Sociology", isOptional: false },

  // Optional subjects
  { code: "ARABE", nameFr: "Arabe", nameEn: "Arabic", isOptional: true },
  { code: "ESP", nameFr: "Espagnol", nameEn: "Spanish", isOptional: true },
]

// Grade-subject mappings (which subjects for which grades)
// Key: grade order (or "order_series" for high school tracks)
// Value: array of subject codes
const GRADE_SUBJECTS_MAP: { [key: string]: string[] } = {
  // Kindergarten - Maternelle (PS, MS, GS)
  "-2": ["LECTURE", "ECRITURE", "CALC", "DESSIN", "CHANT", "EPS"], // Petite Section
  "-1": ["LECTURE", "ECRITURE", "CALC", "DESSIN", "CHANT", "EPS"], // Moyenne Section
  "0": ["LECTURE", "ECRITURE", "CALC", "FRANCAIS", "DESSIN", "CHANT", "EPS"], // Grande Section

  // Elementary - Grades 1-2 (CP1, CP2)
  "1": ["LECTURE", "ECRITURE", "CALC", "FRANCAIS", "EDU_CIV", "HIST_GEO", "SCI_NAT", "DESSIN", "CHANT", "EPS", "TRAV_MAN"],
  "2": ["LECTURE", "ECRITURE", "CALC", "FRANCAIS", "EDU_CIV", "HIST_GEO", "SCI_NAT", "DESSIN", "CHANT", "EPS", "TRAV_MAN"],
  // Elementary - Grades 3-6 (CE1, CE2, CM1, CM2)
  "3": ["FRANCAIS", "MATH", "EDU_CIV", "HIST_GEO", "SCI_NAT", "DESSIN", "CHANT", "EPS", "TRAV_MAN"],
  "4": ["FRANCAIS", "MATH", "EDU_CIV", "HIST_GEO", "SCI_NAT", "DESSIN", "CHANT", "EPS", "TRAV_MAN"],
  "5": ["FRANCAIS", "MATH", "EDU_CIV", "HIST_GEO", "SCI_NAT", "DESSIN", "MUSIQUE", "EPS", "TRAV_MAN"],
  "6": ["FRANCAIS", "MATH", "EDU_CIV", "HIST_GEO", "SCI_NAT", "DESSIN", "MUSIQUE", "EPS", "TRAV_MAN"],
  // College - Grades 7-10
  "7": ["FRANCAIS", "MATH", "ANG", "HIST_GEO", "EDU_CIV", "SVT", "PC", "TECH", "ARTS_PLAST", "MUSIQUE", "EPS", "INFO"],
  "8": ["FRANCAIS", "MATH", "ANG", "HIST_GEO", "EDU_CIV", "SVT", "PC", "TECH", "ARTS_PLAST", "MUSIQUE", "EPS", "INFO"],
  "9": ["FRANCAIS", "MATH", "ANG", "HIST_GEO", "EDU_CIV", "SVT", "PC", "TECH", "ARTS_PLAST", "MUSIQUE", "EPS", "INFO", "ARABE"],
  "10": ["FRANCAIS", "MATH", "ANG", "HIST_GEO", "EDU_CIV", "SVT", "PC", "TECH", "ARTS_PLAST", "MUSIQUE", "EPS", "INFO", "ARABE"],

  // ========================================================================
  // HIGH SCHOOL TRACK-SPECIFIC SUBJECTS (Based on Guinea 2025 curriculum)
  // ========================================================================

  // Sciences Mathématiques (SM) - Focus on Math & Physics
  // Core: FRANCAIS, ANG, EPS, HIST_GEO | Specialized: MATH, PHYS, CHIMIE, SVT
  "11_SM": ["FRANCAIS", "MATH", "ANG", "HIST_GEO", "PHYS", "CHIMIE", "SVT", "EPS", "INFO"],
  "12_SM": ["FRANCAIS", "MATH", "ANG", "HIST_GEO", "PHYS", "CHIMIE", "SVT", "PHILO", "EPS"],
  "13_SM": ["FRANCAIS", "MATH", "ANG", "HIST_GEO", "PHYS", "CHIMIE", "SVT", "PHILO", "EPS"],

  // Sciences Expérimentales (SE) - Focus on Biology & Chemistry
  // Core: FRANCAIS, ANG, EPS, HIST_GEO | Specialized: SVT, PC, MATH
  "11_SE": ["FRANCAIS", "MATH", "ANG", "HIST_GEO", "SVT", "PC", "EPS", "INFO"],
  "12_SE": ["FRANCAIS", "MATH", "ANG", "HIST_GEO", "SVT", "PC", "PHILO", "EPS"],
  "13_SE": ["FRANCAIS", "MATH", "ANG", "HIST_GEO", "SVT", "PC", "PHILO", "EPS"],

  // Sciences Sociales (SS) - Focus on Humanities & Social Sciences
  // Core: FRANCAIS, ANG, EPS | Specialized: HIST_GEO, ECON, PHILO, SOCIO
  "11_SS": ["FRANCAIS", "MATH", "ANG", "HIST_GEO", "ECON", "SOCIO", "PC", "EPS", "INFO"],
  "12_SS": ["FRANCAIS", "MATH", "ANG", "HIST_GEO", "ECON", "SOCIO", "PHILO", "EPS"],
  "13_SS": ["FRANCAIS", "ANG", "HIST_GEO", "ECON", "SOCIO", "PHILO", "MATH", "EPS"],
}

// Helper function to get subject key for a grade
function getGradeSubjectKey(order: number, series?: string): string {
  if (series && order >= 11) {
    return `${order}_${series}`
  }
  return String(order)
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
  "Sciences Physiques": ["PHYS", "CHIMIE", "PC"],
  "Sciences Naturelles": ["SVT", "SCI_NAT"],
  "Langues": ["ANG", "ARABE", "ESP"],
  "Histoire-Géographie": ["HIST_GEO", "EDU_CIV"],
  "Arts": ["DESSIN", "ARTS_PLAST", "MUSIQUE", "CHANT"],
  "EPS": ["EPS"],
  "Technologie": ["TECH", "TECH_IND", "INFO", "TRAV_MAN"],
  "Philosophie": ["PHILO"],
  "Sciences Sociales": ["ECON", "SOCIO", "SES"],
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

// ========================================================================
// SALARY MANAGEMENT CONFIGS
// ========================================================================

interface StaffUserConfig {
  name: string
  email: string
  staffRole: StaffRole
  legacyRole: Role
  schoolLevel?: SchoolLevel
  salaryType: "hourly" | "fixed"
  isTeacher: boolean
}

const NON_TEACHER_STAFF_CONFIGS: StaffUserConfig[] = [
  { name: "Amadou Camara", email: "amadou.camara@gspn.edu.gn", staffRole: StaffRole.comptable, legacyRole: Role.accountant, salaryType: "fixed", isTeacher: false },
  { name: "Fatoumata Keita", email: "fatoumata.keita@gspn.edu.gn", staffRole: StaffRole.coordinateur, legacyRole: Role.accountant, salaryType: "fixed", isTeacher: false },
  { name: "Ibrahima Barry", email: "ibrahima.barry@gspn.edu.gn", staffRole: StaffRole.censeur, legacyRole: Role.academic_director, schoolLevel: SchoolLevel.college, salaryType: "fixed", isTeacher: false },
]

interface SalaryRateConfig {
  userIndex: number | "comptable" | "coordinateur"
  salaryType: SalaryType
  hourlyRate?: number
  fixedMonthly?: number
}

const SALARY_RATE_CONFIGS: SalaryRateConfig[] = [
  // Hourly college/lycee teachers
  { userIndex: 0, salaryType: SalaryType.hourly, hourlyRate: 75000 },
  { userIndex: 1, salaryType: SalaryType.hourly, hourlyRate: 80000 },
  { userIndex: 2, salaryType: SalaryType.hourly, hourlyRate: 65000 },
  { userIndex: 3, salaryType: SalaryType.hourly, hourlyRate: 90000 },
  { userIndex: 4, salaryType: SalaryType.hourly, hourlyRate: 50000 },
  { userIndex: 5, salaryType: SalaryType.hourly, hourlyRate: 100000 },
  // Fixed primary teachers
  { userIndex: 6, salaryType: SalaryType.fixed, fixedMonthly: 2500000 },
  { userIndex: 7, salaryType: SalaryType.fixed, fixedMonthly: 3000000 },
  { userIndex: 8, salaryType: SalaryType.fixed, fixedMonthly: 2000000 },
  { userIndex: 9, salaryType: SalaryType.fixed, fixedMonthly: 3500000 },
  // Non-teacher staff
  { userIndex: "comptable", salaryType: SalaryType.fixed, fixedMonthly: 3000000 },
  { userIndex: "coordinateur", salaryType: SalaryType.fixed, fixedMonthly: 2500000 },
]

interface HoursRecordConfig {
  userIndex: number
  month: number
  year: number
  totalHours: number
  status: HoursRecordStatus
  hasSubmitter: boolean
  hasReviewer: boolean
}

const HOURS_RECORD_CONFIGS: HoursRecordConfig[] = [
  { userIndex: 0, month: 10, year: 2025, totalHours: 48, status: HoursRecordStatus.approved, hasSubmitter: true, hasReviewer: true },
  { userIndex: 0, month: 11, year: 2025, totalHours: 52, status: HoursRecordStatus.approved, hasSubmitter: true, hasReviewer: true },
  { userIndex: 1, month: 10, year: 2025, totalHours: 40, status: HoursRecordStatus.approved, hasSubmitter: true, hasReviewer: true },
  { userIndex: 1, month: 11, year: 2025, totalHours: 44, status: HoursRecordStatus.approved, hasSubmitter: true, hasReviewer: true },
  { userIndex: 2, month: 10, year: 2025, totalHours: 36, status: HoursRecordStatus.submitted, hasSubmitter: true, hasReviewer: false },
  { userIndex: 2, month: 11, year: 2025, totalHours: 42, status: HoursRecordStatus.submitted, hasSubmitter: true, hasReviewer: false },
  { userIndex: 3, month: 10, year: 2025, totalHours: 56, status: HoursRecordStatus.approved, hasSubmitter: true, hasReviewer: true },
  { userIndex: 4, month: 10, year: 2025, totalHours: 30, status: HoursRecordStatus.draft, hasSubmitter: false, hasReviewer: false },
]

interface SalaryPaymentConfig {
  userIndex: number | "comptable"
  month: number
  year: number
  salaryType: SalaryType
  status: SalaryPaymentStatus
  method: PaymentMethod
  advanceDeduction: number
}

const SALARY_PAYMENT_CONFIGS: SalaryPaymentConfig[] = [
  { userIndex: 0, month: 10, year: 2025, salaryType: SalaryType.hourly, status: SalaryPaymentStatus.paid, method: PaymentMethod.cash, advanceDeduction: 0 },
  { userIndex: 0, month: 11, year: 2025, salaryType: SalaryType.hourly, status: SalaryPaymentStatus.paid, method: PaymentMethod.cash, advanceDeduction: 500000 },
  { userIndex: 1, month: 10, year: 2025, salaryType: SalaryType.hourly, status: SalaryPaymentStatus.approved, method: PaymentMethod.cash, advanceDeduction: 0 },
  { userIndex: 1, month: 11, year: 2025, salaryType: SalaryType.hourly, status: SalaryPaymentStatus.pending, method: PaymentMethod.cash, advanceDeduction: 0 },
  { userIndex: 3, month: 10, year: 2025, salaryType: SalaryType.hourly, status: SalaryPaymentStatus.paid, method: PaymentMethod.orange_money, advanceDeduction: 0 },
  { userIndex: 6, month: 10, year: 2025, salaryType: SalaryType.fixed, status: SalaryPaymentStatus.paid, method: PaymentMethod.cash, advanceDeduction: 500000 },
  { userIndex: 7, month: 10, year: 2025, salaryType: SalaryType.fixed, status: SalaryPaymentStatus.approved, method: PaymentMethod.cash, advanceDeduction: 0 },
  { userIndex: "comptable", month: 10, year: 2025, salaryType: SalaryType.fixed, status: SalaryPaymentStatus.pending, method: PaymentMethod.cash, advanceDeduction: 0 },
]

interface SalaryAdvanceConfig {
  userIndex: number
  amount: number
  method: PaymentMethod
  reason: string
  strategy: RecoupmentStrategy
  numberOfInstallments?: number
  totalRecouped: number
  remainingBalance: number
  status: SalaryAdvanceStatus
  disbursedDate: string
}

const SALARY_ADVANCE_CONFIGS: SalaryAdvanceConfig[] = [
  { userIndex: 0, amount: 1000000, method: PaymentMethod.cash, reason: "Frais médicaux urgents", strategy: RecoupmentStrategy.full, totalRecouped: 500000, remainingBalance: 500000, status: SalaryAdvanceStatus.active, disbursedDate: "2025-10-15" },
  { userIndex: 3, amount: 2000000, method: PaymentMethod.cash, reason: "Avance sur salaire - rentrée scolaire", strategy: RecoupmentStrategy.spread, numberOfInstallments: 4, totalRecouped: 0, remainingBalance: 2000000, status: SalaryAdvanceStatus.active, disbursedDate: "2025-11-01" },
  { userIndex: 6, amount: 500000, method: PaymentMethod.orange_money, reason: "Avance pour déménagement", strategy: RecoupmentStrategy.full, totalRecouped: 500000, remainingBalance: 0, status: SalaryAdvanceStatus.fully_recouped, disbursedDate: "2025-10-01" },
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
  // Check if --permissions flag is passed
  const args = process.argv.slice(2)
  const permissionsOnly = args.includes("--permissions")

  if (permissionsOnly) {
    console.log("🔐 Seeding permissions only...")
    execSync("npx tsx app/db/prisma/seeds/seed-permissions.ts", { stdio: "inherit" })
    return
  }

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
    const previousGrades: { id: string; order: number; tuitionFee: number; name: string; series?: string }[] = []
    for (const gradeConfig of GRADES_CONFIG) {
      let grade = await prisma.grade.findFirst({
        where: {
          schoolYearId: previousSchoolYear.id,
          order: gradeConfig.order,
          series: gradeConfig.series || null,
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
            series: gradeConfig.series,
            schoolYearId: previousSchoolYear.id,
          },
        })
      }
      previousGrades.push({ id: grade.id, order: grade.order, tuitionFee: grade.tuitionFee, name: grade.name, series: grade.series || undefined })
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
    const currentGrades: { id: string; order: number; tuitionFee: number; name: string; series?: string }[] = []
    for (const gradeConfig of GRADES_CONFIG) {
      let grade = await prisma.grade.findFirst({
        where: {
          schoolYearId: currentSchoolYear.id,
          order: gradeConfig.order,
          series: gradeConfig.series || null,
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
            series: gradeConfig.series,
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
            series: gradeConfig.series,
          },
        })
      }
      currentGrades.push({ id: grade.id, order: grade.order, tuitionFee: grade.tuitionFee, name: grade.name, series: grade.series || undefined })
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

        // Check if enrollment already exists (handles partial re-runs)
        const enrollmentNumber = `ENR-2024-${grade.order.toString().padStart(2, "0")}-${studentCounter.toString().padStart(5, "0")}`
        const existingEnrollment = await prisma.enrollment.findUnique({
          where: { enrollmentNumber },
        })

        if (existingEnrollment) {
          // Skip if enrollment exists, but still track for returning students
          if (existingEnrollment.studentId && grade.order < 13) {
            returningStudents.push({ studentId: existingEnrollment.studentId, gradeOrder: grade.order + 1 })
          }
          studentCounter++
          continue
        }

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
        }

        // Create enrollment for 2024-2025
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

        // Determine payment scenario for this enrollment based on enrollment counter
        // ~40% confirmed, ~20% pending_deposit, ~15% deposited, ~15% pending_review, ~10% partial/mixed
        const scenarioRoll = enrollmentCounter % 10
        let paymentScenario: "all_confirmed" | "pending_deposit" | "deposited" | "pending_review" | "mixed"
        if (scenarioRoll < 4) paymentScenario = "all_confirmed"
        else if (scenarioRoll < 6) paymentScenario = "pending_deposit"
        else if (scenarioRoll < 7) paymentScenario = "deposited"
        else if (scenarioRoll < 9) paymentScenario = "pending_review"
        else paymentScenario = "mixed"

        const BANKS = ["BICIGUI", "SGBG", "Ecobank", "Vista Bank", "Banque Centrale"]

        for (let scheduleIndex = 0; scheduleIndex < schedules.length; scheduleIndex++) {
          const scheduleData = schedules[scheduleIndex]

          // Determine if this schedule is paid based on scenario
          let isPaid = false
          let paymentStatus: PaymentStatus = PaymentStatus.pending_deposit
          let paymentMethod: PaymentMethod = PaymentMethod.cash
          let needsCashDeposit = false

          switch (paymentScenario) {
            case "all_confirmed":
              isPaid = true
              paymentStatus = PaymentStatus.confirmed
              paymentMethod = scheduleIndex % 3 === 2 ? PaymentMethod.orange_money : PaymentMethod.cash
              needsCashDeposit = paymentMethod === PaymentMethod.cash
              break
            case "pending_deposit":
              // First schedule confirmed, rest pending deposit
              if (scheduleIndex === 0) {
                isPaid = true
                paymentStatus = PaymentStatus.confirmed
                needsCashDeposit = true
              } else {
                isPaid = false
                paymentStatus = PaymentStatus.pending_deposit
              }
              break
            case "deposited":
              // First schedule confirmed, second deposited (awaiting review)
              if (scheduleIndex === 0) {
                isPaid = true
                paymentStatus = PaymentStatus.confirmed
                needsCashDeposit = true
              } else if (scheduleIndex === 1) {
                isPaid = false
                paymentStatus = PaymentStatus.deposited
                needsCashDeposit = true
              } else {
                continue // Skip third schedule
              }
              break
            case "pending_review":
              // Orange Money payments pending review
              paymentMethod = PaymentMethod.orange_money
              if (scheduleIndex === 0) {
                isPaid = true
                paymentStatus = PaymentStatus.confirmed
              } else if (scheduleIndex === 1) {
                isPaid = false
                paymentStatus = PaymentStatus.pending_review
              } else {
                continue // Skip third schedule
              }
              break
            case "mixed":
              // One confirmed, one rejected, one pending
              if (scheduleIndex === 0) {
                isPaid = true
                paymentStatus = PaymentStatus.confirmed
                needsCashDeposit = true
              } else if (scheduleIndex === 1) {
                isPaid = false
                paymentStatus = PaymentStatus.rejected
              } else {
                continue // Skip third schedule
              }
              break
          }

          const schedule = await prisma.paymentSchedule.create({
            data: {
              enrollmentId: enrollment.id,
              scheduleNumber: scheduleData.scheduleNumber,
              amount: scheduleData.amount,
              months: scheduleData.months,
              dueDate: scheduleData.dueDate,
              isPaid,
              paidAt: isPaid ? new Date(scheduleData.dueDate.getTime() - 7 * 24 * 60 * 60 * 1000) : null,
            },
          })

          // Create payment for this schedule
          const methodPrefix = paymentMethod === PaymentMethod.orange_money ? "OM" : "CASH"
          const receiptNumber = `GSPN-2025-${methodPrefix}-${(totalPayments + 1).toString().padStart(5, "0")}`
          const recordedAt = new Date(scheduleData.dueDate.getTime() - 7 * 24 * 60 * 60 * 1000)

          const payment = await prisma.payment.create({
            data: {
              enrollmentId: enrollment.id,
              paymentScheduleId: schedule.id,
              amount: scheduleData.amount,
              method: paymentMethod,
              status: paymentStatus,
              receiptNumber,
              transactionRef: paymentMethod === PaymentMethod.orange_money ? `OM-TXN-${Date.now()}-${totalPayments}` : null,
              recordedBy: director.id,
              recordedAt,
              confirmedBy: paymentStatus === PaymentStatus.confirmed ? director.id : null,
              confirmedAt: paymentStatus === PaymentStatus.confirmed ? recordedAt : null,
              reviewedBy: paymentStatus === PaymentStatus.rejected ? director.id : null,
              reviewedAt: paymentStatus === PaymentStatus.rejected ? recordedAt : null,
              reviewNotes: paymentStatus === PaymentStatus.rejected ? "Paiement rejeté - reçu non valide" : null,
              autoConfirmAt: paymentMethod === PaymentMethod.orange_money && paymentStatus === PaymentStatus.pending_review
                ? new Date(recordedAt.getTime() + 24 * 60 * 60 * 1000)
                : null,
            },
          })

          // Create CashDeposit for cash payments that are deposited or confirmed
          if (needsCashDeposit && paymentMethod === PaymentMethod.cash &&
              (paymentStatus === PaymentStatus.confirmed || paymentStatus === PaymentStatus.deposited)) {
            await prisma.cashDeposit.create({
              data: {
                paymentId: payment.id,
                bankReference: `DEP-${randomElement(BANKS).substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}`,
                depositDate: new Date(recordedAt.getTime() + 1 * 24 * 60 * 60 * 1000), // 1 day after recording
                depositedBy: director.id,
                depositedByName: "Moi-même",
                bankName: randomElement(BANKS),
              },
            })
          }

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

      // Check if TeacherProfile exists (by personId or employeeNumber)
      let teacherProfile = await prisma.teacherProfile.findUnique({
        where: { personId: person.id },
      })

      if (!teacherProfile) {
        // Also check by employeeNumber to handle re-runs
        teacherProfile = await prisma.teacherProfile.findUnique({
          where: { employeeNumber },
        })
      }

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
    // Create Staff Users (for salary management)
    // ========================================================================
    console.log("\n👤 Creating staff users for salary management...")

    // A. Create User records for the first 10 teachers
    const staffUsers: { id: string; salaryType: "hourly" | "fixed" }[] = []
    for (let i = 0; i < Math.min(10, teacherProfiles.length); i++) {
      const tp = teacherProfiles[i]
      const person = await prisma.person.findUnique({ where: { id: tp.personId } })
      if (!person) continue
      if (!person.email) continue

      const teacherEmail = person.email
      let user = await prisma.user.findUnique({ where: { email: teacherEmail } })
      if (!user) {
        user = await prisma.user.create({
          data: {
            name: `${person.firstName} ${person.lastName}`,
            email: teacherEmail,
            role: Role.teacher,
            staffRole: StaffRole.enseignant,
            staffProfileId: tp.id,
            schoolLevel: i < 6 ? SchoolLevel.college : SchoolLevel.elementary,
          },
        })
      }
      staffUsers.push({ id: user.id, salaryType: i < 6 ? "hourly" : "fixed" })
    }
    console.log(`   ✓ Created ${staffUsers.length} teacher user accounts`)

    // B. Create Non-Teacher Staff (Person + User)
    let comptableUser: { id: string } | null = null
    let coordinateurUser: { id: string } | null = null
    let censeurUser: { id: string } | null = null

    for (const staffConfig of NON_TEACHER_STAFF_CONFIGS) {
      let user = await prisma.user.findUnique({ where: { email: staffConfig.email } })
      if (!user) {
        // Create a Person record for this staff member
        const [firstName, lastName] = staffConfig.name.split(" ", 2)
        let person = await prisma.person.findUnique({ where: { email: staffConfig.email } })
        if (!person) {
          person = await prisma.person.create({
            data: {
              firstName: firstName || staffConfig.name,
              lastName: lastName || "",
              email: staffConfig.email,
              phone: randomPhone(),
              gender: staffConfig.name.startsWith("Fatoumata") ? Gender.female : Gender.male,
              status: PersonStatus.active,
            },
          })
        }

        user = await prisma.user.create({
          data: {
            name: staffConfig.name,
            email: staffConfig.email,
            role: staffConfig.legacyRole,
            staffRole: staffConfig.staffRole,
            schoolLevel: staffConfig.schoolLevel,
          },
        })
      }

      if (staffConfig.staffRole === StaffRole.comptable) comptableUser = { id: user.id }
      if (staffConfig.staffRole === StaffRole.coordinateur) coordinateurUser = { id: user.id }
      if (staffConfig.staffRole === StaffRole.censeur) censeurUser = { id: user.id }
    }
    console.log(`   ✓ Created non-teacher staff: comptable, coordinateur, censeur`)

    // ========================================================================
    // Initialize TreasuryBalance
    // ========================================================================
    const existingTreasury = await prisma.treasuryBalance.findFirst()
    if (!existingTreasury) {
      await prisma.treasuryBalance.create({
        data: {
          registryBalance: 15000000,
          safeBalance: 25000000,
          bankBalance: 50000000,
          mobileMoneyBalance: 5000000,
          lastVerifiedBy: director.id,
          lastVerifiedAt: new Date(),
        },
      })
      console.log("   ✓ Initialized TreasuryBalance (95M GNF total)")
    } else {
      console.log("   ⏭ TreasuryBalance already exists")
    }

    // ========================================================================
    // Create GradeSubjects and ClassAssignments
    // ========================================================================
    console.log("\n📖 Creating grade-subject mappings and teacher assignments...")
    let gradeSubjectCount = 0
    let classAssignmentCount = 0

    for (const grade of currentGrades) {
      // Use track-specific subject mapping for high school grades
      const subjectKey = getGradeSubjectKey(grade.order, grade.series)
      const subjectCodes = GRADE_SUBJECTS_MAP[subjectKey] || []

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
          // Determine coefficient based on track and subject
          let coefficient = 2
          if (subjectCode === "MATH") {
            coefficient = grade.series === "SM" ? 5 : grade.series === "SE" ? 3 : 2
          } else if (subjectCode === "FRANCAIS") {
            coefficient = 3
          } else if (subjectCode === "PHYS" || subjectCode === "CHIMIE") {
            coefficient = grade.series === "SM" ? 4 : 2
          } else if (subjectCode === "SVT") {
            coefficient = grade.series === "SE" ? 5 : 2
          } else if (subjectCode === "HIST_GEO" || subjectCode === "ECON") {
            coefficient = grade.series === "SS" ? 5 : 2
          } else if (subjectCode === "PHILO") {
            coefficient = grade.series === "SS" ? 4 : 3
          }

          gradeSubject = await prisma.gradeSubject.create({
            data: {
              gradeId: grade.id,
              subjectId,
              coefficient,
              hoursPerWeek: subjectCode === "EPS" ? 2 : coefficient >= 4 ? 5 : 3,
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
      // Check if StudentProfile already exists first
      let studentProfile = await prisma.studentProfile.findFirst({
        where: { studentId: student.id },
      })

      if (studentProfile) {
        // StudentProfile exists, use its person
        studentProfileMap.set(student.id, studentProfile.id)
        continue
      }

      // Check if Person exists for this student
      let person = await prisma.person.findFirst({
        where: {
          firstName: student.firstName,
          lastName: student.lastName,
          studentProfile: { studentId: student.id },
        },
      })

      if (!person) {
        // Generate unique email to avoid conflicts
        const uniqueEmail = student.email || `student-${student.id}@placeholder.local`

        // Check if Person with this email already exists
        person = await prisma.person.findUnique({
          where: { email: uniqueEmail },
        })

        if (!person) {
          person = await prisma.person.create({
            data: {
              firstName: student.firstName,
              lastName: student.lastName,
              email: uniqueEmail,
              dateOfBirth: student.dateOfBirth,
              gender: Math.random() > 0.5 ? Gender.male : Gender.female,
              status: PersonStatus.active,
            },
          })
        }
      }

      // Create StudentProfile (check if Person already has one)
      if (!studentProfile) {
        // Check if this Person already has a StudentProfile
        studentProfile = await prisma.studentProfile.findUnique({
          where: { personId: person.id },
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

      // Check if this grade already has attendance sessions (handles re-runs)
      const existingSessionCount = await prisma.attendanceSession.count({
        where: {
          gradeId: grade.id,
          date: { gte: attendanceStartDate },
        },
      })
      if (existingSessionCount > 0) {
        console.log(`   ⏭ ${grade.name}: ${existingSessionCount} sessions already exist`)
        continue
      }

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

    // Check if expenses already exist (handles re-runs)
    const existingExpenseCount = await prisma.expense.count()
    if (existingExpenseCount > 0) {
      console.log(`   ⏭ Skipping expenses (${existingExpenseCount} already exist)`)
    } else {
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
    }

    // ========================================================================
    // Create Salary Data
    // ========================================================================
    console.log("\n💵 Creating salary data...")

    // Helper to resolve userIndex to userId
    function resolveUserId(userIndex: number | "comptable" | "coordinateur"): string | null {
      if (userIndex === "comptable") return comptableUser?.id ?? null
      if (userIndex === "coordinateur") return coordinateurUser?.id ?? null
      return staffUsers[userIndex]?.id ?? null
    }

    // A. Salary Rates
    let salaryRateCount = 0
    const salaryRateMap = new Map<string, { id: string; salaryType: SalaryType; hourlyRate: number | null; fixedMonthly: number | null }>()

    for (const rateConfig of SALARY_RATE_CONFIGS) {
      const userId = resolveUserId(rateConfig.userIndex)
      if (!userId) continue

      const existingRate = await prisma.salaryRate.findFirst({
        where: { userId, effectiveTo: null },
      })

      if (existingRate) {
        salaryRateMap.set(userId, {
          id: existingRate.id,
          salaryType: existingRate.salaryType,
          hourlyRate: existingRate.hourlyRate,
          fixedMonthly: existingRate.fixedMonthly,
        })
        continue
      }

      const rate = await prisma.salaryRate.create({
        data: {
          userId,
          salaryType: rateConfig.salaryType,
          hourlyRate: rateConfig.hourlyRate ?? null,
          fixedMonthly: rateConfig.fixedMonthly ?? null,
          effectiveFrom: new Date("2025-09-01"),
        },
      })
      salaryRateMap.set(userId, {
        id: rate.id,
        salaryType: rate.salaryType,
        hourlyRate: rate.hourlyRate,
        fixedMonthly: rate.fixedMonthly,
      })
      salaryRateCount++
    }
    console.log(`   ✓ Created ${salaryRateCount} salary rates`)

    // B. Hours Records
    let hoursRecordCount = 0
    const hoursRecordMap = new Map<string, { id: string; totalHours: number }>()

    for (const hrConfig of HOURS_RECORD_CONFIGS) {
      const userId = staffUsers[hrConfig.userIndex]?.id
      if (!userId) continue

      const existingRecord = await prisma.hoursRecord.findUnique({
        where: {
          userId_schoolYearId_month_year: {
            userId,
            schoolYearId: currentSchoolYear.id,
            month: hrConfig.month,
            year: hrConfig.year,
          },
        },
      })

      if (existingRecord) {
        if (existingRecord.status === HoursRecordStatus.approved) {
          hoursRecordMap.set(`${userId}-${hrConfig.month}-${hrConfig.year}`, {
            id: existingRecord.id,
            totalHours: existingRecord.totalHours,
          })
        }
        continue
      }

      const submittedAt = hrConfig.hasSubmitter ? new Date(hrConfig.year, hrConfig.month - 1, 20) : null
      const reviewedAt = hrConfig.hasReviewer ? new Date(hrConfig.year, hrConfig.month - 1, 22) : null

      const record = await prisma.hoursRecord.create({
        data: {
          userId,
          schoolYearId: currentSchoolYear.id,
          month: hrConfig.month,
          year: hrConfig.year,
          totalHours: hrConfig.totalHours,
          status: hrConfig.status,
          submittedBy: hrConfig.hasSubmitter ? (censeurUser?.id ?? director.id) : null,
          submittedAt,
          reviewedBy: hrConfig.hasReviewer ? director.id : null,
          reviewedAt,
        },
      })

      if (hrConfig.status === HoursRecordStatus.approved) {
        hoursRecordMap.set(`${userId}-${hrConfig.month}-${hrConfig.year}`, {
          id: record.id,
          totalHours: record.totalHours,
        })
      }
      hoursRecordCount++
    }
    console.log(`   ✓ Created ${hoursRecordCount} hours records`)

    // C. Salary Payments
    let salaryPaymentCount = 0
    const salaryPaymentMap = new Map<string, { id: string }>()

    for (const payConfig of SALARY_PAYMENT_CONFIGS) {
      const userId = resolveUserId(payConfig.userIndex)
      if (!userId) continue

      const existingPayment = await prisma.salaryPayment.findUnique({
        where: {
          userId_schoolYearId_month_year: {
            userId,
            schoolYearId: currentSchoolYear.id,
            month: payConfig.month,
            year: payConfig.year,
          },
        },
      })

      if (existingPayment) {
        salaryPaymentMap.set(`${userId}-${payConfig.month}-${payConfig.year}`, { id: existingPayment.id })
        continue
      }

      const rateInfo = salaryRateMap.get(userId)
      if (!rateInfo) continue

      // Calculate gross amount
      let grossAmount = 0
      let hoursWorked: number | null = null
      let hoursRecordId: string | null = null

      if (payConfig.salaryType === SalaryType.hourly) {
        const hrKey = `${userId}-${payConfig.month}-${payConfig.year}`
        const hr = hoursRecordMap.get(hrKey)
        if (!hr) continue // Need approved hours for hourly payments
        hoursWorked = hr.totalHours
        hoursRecordId = hr.id
        grossAmount = hoursWorked * (rateInfo.hourlyRate ?? 0)
      } else {
        grossAmount = rateInfo.fixedMonthly ?? 0
      }

      const netAmount = grossAmount - payConfig.advanceDeduction

      // Set timestamps based on status
      const baseDate = new Date(payConfig.year, payConfig.month - 1, 25)
      const approvedAt = payConfig.status === SalaryPaymentStatus.approved || payConfig.status === SalaryPaymentStatus.paid
        ? new Date(baseDate.getTime() + 2 * 24 * 60 * 60 * 1000)
        : null
      const paidAt = payConfig.status === SalaryPaymentStatus.paid
        ? new Date(baseDate.getTime() + 5 * 24 * 60 * 60 * 1000)
        : null

      const payment = await prisma.salaryPayment.create({
        data: {
          userId,
          schoolYearId: currentSchoolYear.id,
          month: payConfig.month,
          year: payConfig.year,
          salaryType: payConfig.salaryType,
          hoursRecordId,
          salaryRateId: rateInfo.id,
          hoursWorked,
          hourlyRate: payConfig.salaryType === SalaryType.hourly ? rateInfo.hourlyRate : null,
          fixedMonthly: payConfig.salaryType === SalaryType.fixed ? rateInfo.fixedMonthly : null,
          grossAmount,
          advanceDeduction: payConfig.advanceDeduction,
          netAmount,
          method: payConfig.method,
          status: payConfig.status,
          approvedBy: approvedAt ? (comptableUser?.id ?? director.id) : null,
          approvedAt,
          paidBy: paidAt ? (comptableUser?.id ?? director.id) : null,
          paidAt,
        },
      })

      salaryPaymentMap.set(`${userId}-${payConfig.month}-${payConfig.year}`, { id: payment.id })
      salaryPaymentCount++
    }
    console.log(`   ✓ Created ${salaryPaymentCount} salary payments`)

    // D. Salary Advances
    let salaryAdvanceCount = 0
    const createdAdvances: { id: string; userIndex: number }[] = []

    for (const advConfig of SALARY_ADVANCE_CONFIGS) {
      const userId = staffUsers[advConfig.userIndex]?.id
      if (!userId) continue

      const existingCount = await prisma.salaryAdvance.count({ where: { userId } })
      if (existingCount > 0) continue

      const advance = await prisma.salaryAdvance.create({
        data: {
          userId,
          amount: advConfig.amount,
          method: advConfig.method,
          reason: advConfig.reason,
          strategy: advConfig.strategy,
          numberOfInstallments: advConfig.numberOfInstallments ?? null,
          totalRecouped: advConfig.totalRecouped,
          remainingBalance: advConfig.remainingBalance,
          status: advConfig.status,
          disbursedBy: comptableUser?.id ?? director.id,
          disbursedAt: new Date(advConfig.disbursedDate),
        },
      })
      createdAdvances.push({ id: advance.id, userIndex: advConfig.userIndex })
      salaryAdvanceCount++
    }
    console.log(`   ✓ Created ${salaryAdvanceCount} salary advances`)

    // E. Advance Recoupments
    let recoupmentCount = 0

    // Link advance #0 (staffUsers[0]) → payment staffUsers[0] Nov 2025 = 500k
    if (createdAdvances.length > 0) {
      const advance0 = createdAdvances.find(a => a.userIndex === 0)
      const userId0 = staffUsers[0]?.id
      if (advance0 && userId0) {
        const paymentKey0 = `${userId0}-11-2025`
        const payment0 = salaryPaymentMap.get(paymentKey0)
        if (payment0) {
          const existingRecoupment = await prisma.advanceRecoupment.findFirst({
            where: { salaryAdvanceId: advance0.id, salaryPaymentId: payment0.id },
          })
          if (!existingRecoupment) {
            await prisma.advanceRecoupment.create({
              data: {
                salaryAdvanceId: advance0.id,
                salaryPaymentId: payment0.id,
                amount: 500000,
              },
            })
            recoupmentCount++
          }
        }
      }

      // Link advance #2 (staffUsers[6]) → payment staffUsers[6] Oct 2025 = 500k
      const advance2 = createdAdvances.find(a => a.userIndex === 6)
      const userId6 = staffUsers[6]?.id
      if (advance2 && userId6) {
        const paymentKey6 = `${userId6}-10-2025`
        const payment6 = salaryPaymentMap.get(paymentKey6)
        if (payment6) {
          const existingRecoupment = await prisma.advanceRecoupment.findFirst({
            where: { salaryAdvanceId: advance2.id, salaryPaymentId: payment6.id },
          })
          if (!existingRecoupment) {
            await prisma.advanceRecoupment.create({
              data: {
                salaryAdvanceId: advance2.id,
                salaryPaymentId: payment6.id,
                amount: 500000,
              },
            })
            recoupmentCount++
          }
        }
      }
    }
    console.log(`   ✓ Created ${recoupmentCount} advance recoupments`)

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
    const salaryRateCountDb = await prisma.salaryRate.count()
    const hoursRecordCountDb = await prisma.hoursRecord.count()
    const salaryPaymentCountDb = await prisma.salaryPayment.count()
    const salaryAdvanceCountDb = await prisma.salaryAdvance.count()
    const treasuryExists = await prisma.treasuryBalance.findFirst()

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
    console.log(`\n   Salary Rates: ${salaryRateCountDb}`)
    console.log(`   Hours Records: ${hoursRecordCountDb}`)
    console.log(`   Salary Payments: ${salaryPaymentCountDb}`)
    console.log(`   Salary Advances: ${salaryAdvanceCountDb}`)
    console.log(`   Treasury Balance: ${treasuryExists ? "Initialized" : "Not initialized"}`)
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
