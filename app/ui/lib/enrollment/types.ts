/**
 * Enrollment System TypeScript Types
 *
 * These types mirror the Prisma schema and are used throughout the enrollment feature.
 */

// ============================================================================
// Enums
// ============================================================================

export type SchoolLevel = "kindergarten" | "elementary" | "college" | "high_school"

export type EnrollmentStatus =
  | "draft"
  | "submitted"
  | "needs_review"
  | "completed"
  | "rejected"
  | "cancelled"

export type PaymentMethod = "cash" | "orange_money"

export type PaymentStatus = "pending" | "confirmed" | "failed"

export type Gender = "male" | "female"

// ============================================================================
// School Year & Grade
// ============================================================================

export interface SchoolYear {
  id: string
  name: string // "2025 - 2026"
  startDate: Date
  endDate: Date
  enrollmentStart: Date
  enrollmentEnd: Date
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  grades?: Grade[]
}

export interface Grade {
  id: string
  name: string // "7eme Annee"
  level: SchoolLevel
  order: number // 1-13 for sorting
  tuitionFee: number // GNF
  schoolYearId: string
  schoolYear?: SchoolYear
  enrollmentCount?: number // Computed for display
  createdAt: Date
  updatedAt: Date
}

// ============================================================================
// Enrollment
// ============================================================================

export interface Enrollment {
  id: string
  enrollmentNumber?: string // ENR-2025-00001
  studentId?: string
  schoolYearId: string
  gradeId: string

  // Student info
  firstName: string
  lastName: string
  dateOfBirth?: Date
  gender?: Gender
  phone?: string
  email?: string
  photoUrl?: string
  birthCertificateUrl?: string

  // Parent info
  fatherName?: string
  fatherPhone?: string
  fatherEmail?: string
  motherName?: string
  motherPhone?: string
  motherEmail?: string
  address?: string

  // Financial
  originalTuitionFee: number
  adjustedTuitionFee?: number
  adjustmentReason?: string

  // Status
  status: EnrollmentStatus
  currentStep: number
  isReturningStudent: boolean
  draftExpiresAt?: Date
  submittedAt?: Date
  approvedAt?: Date
  approvedBy?: string
  autoApproveAt?: Date

  // Status change tracking (for completed/rejected/cancelled)
  statusComment?: string
  statusChangedAt?: Date
  statusChangedBy?: string

  // Audit
  createdBy: string
  createdAt: Date
  updatedAt: Date

  // Relations
  schoolYear?: SchoolYear
  grade?: Grade
  paymentSchedules?: PaymentSchedule[]
  payments?: Payment[]
  notes?: EnrollmentNote[]
}

// ============================================================================
// Payment Schedule
// ============================================================================

export interface PaymentSchedule {
  id: string
  enrollmentId: string
  scheduleNumber: number // 1, 2, or 3
  amount: number // GNF
  months: string[] // ["September", "October", "May"]
  dueDate: Date
  isPaid: boolean
  paidAt?: Date
  createdAt: Date
  updatedAt: Date

  // Computed fields for UI
  percentPaid?: number
  amountPaid?: number
}

// ============================================================================
// Payment
// ============================================================================

export interface Payment {
  id: string
  enrollmentId: string
  paymentScheduleId?: string
  amount: number // GNF
  method: PaymentMethod
  status: PaymentStatus
  receiptNumber: string
  transactionRef?: string
  receiptImageUrl?: string
  recordedBy: string
  recordedAt: Date
  confirmedBy?: string
  confirmedAt?: Date
  notes?: string
  createdAt: Date
  updatedAt: Date
}

// ============================================================================
// Enrollment Note
// ============================================================================

export interface EnrollmentNote {
  id: string
  enrollmentId: string
  title: string
  content: string
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

// ============================================================================
// Wizard Types
// ============================================================================

export type WizardStep = 1 | 2 | 3 | 4 | 5 | 6

export const WIZARD_STEPS: Record<WizardStep, string> = {
  1: "gradeSelection",
  2: "studentInfo",
  3: "paymentBreakdown",
  4: "paymentTransaction",
  5: "review",
  6: "confirmation",
}

export interface WizardState {
  currentStep: WizardStep
  enrollmentId?: string
  isReturningStudent: boolean
  isDraft: boolean
  canGoBack: boolean
  canGoNext: boolean
  isSubmitting: boolean
}

// Wizard data structure for enrollment wizard context
export interface EnrollmentWizardData {
  // Step 1 - Grade Selection
  schoolYearId: string
  gradeId: string
  gradeName: string
  level: SchoolLevel
  tuitionFee: number

  // Step 2 - Student Info
  isReturningStudent: boolean
  studentId?: string
  firstName: string
  middleName?: string
  lastName: string
  dateOfBirth?: string
  gender?: Gender
  phone?: string
  email?: string
  photoUrl?: string
  birthCertificateUrl?: string
  fatherName?: string
  fatherPhone?: string
  fatherEmail?: string
  motherName?: string
  motherPhone?: string
  motherEmail?: string
  address?: string
  notes: Array<{ title: string; content: string }>

  // Step 3 - Payment Breakdown
  originalTuitionFee: number
  adjustedTuitionFee?: number
  adjustmentReason?: string
  paymentSchedules: Array<{
    scheduleNumber: number
    amount: number
    months: string[]
    dueDate: string
  }>

  // Step 4 - Payment Transaction
  paymentMade: boolean
  paymentAmount?: number
  paymentMethod?: PaymentMethod
  receiptNumber?: string
  transactionRef?: string
  receiptImageUrl?: string

  // Step 6 - Confirmation (populated after submission)
  enrollmentId?: string
  enrollmentNumber?: string
  studentNumber?: string
}

// Wizard state for enrollment wizard context
export interface EnrollmentWizardState {
  currentStep: number
  completedSteps: number[]
  data: EnrollmentWizardData
  isDirty: boolean
  isSubmitting: boolean
  enrollmentId?: string
  error?: string
}

// ============================================================================
// Form Data Types (for wizard steps)
// ============================================================================

export interface GradeSelectionData {
  schoolYearId: string
  gradeId: string
  level: SchoolLevel
}

export interface StudentInfoData {
  isReturningStudent: boolean
  studentId?: string // For returning students
  firstName: string
  lastName: string
  dateOfBirth?: string // ISO date string for form
  gender?: Gender
  phone?: string
  email?: string
  photoUrl?: string
  birthCertificateUrl?: string
  fatherName?: string
  fatherPhone?: string
  fatherEmail?: string
  motherName?: string
  motherPhone?: string
  motherEmail?: string
  address?: string
  notes?: Array<{ title: string; content: string }>
}

export interface PaymentBreakdownData {
  originalTuitionFee: number
  adjustedTuitionFee?: number
  adjustmentReason?: string
  schedules: Array<{
    scheduleNumber: number
    amount: number
    months: string[]
    dueDate: string // ISO date string
  }>
}

export interface PaymentTransactionData {
  skipPayment: boolean
  amount?: number
  method?: PaymentMethod
  receiptNumber?: string
  transactionRef?: string
  receiptImageUrl?: string
  receiptImageFile?: File
}

// ============================================================================
// API Response Types
// ============================================================================

export interface EnrollmentListItem {
  id: string
  enrollmentNumber?: string
  firstName: string
  lastName: string
  gradeName: string
  status: EnrollmentStatus
  createdAt: Date
  submittedAt?: Date
}

export interface StudentSearchResult {
  id: string
  studentNumber?: string
  firstName: string
  lastName: string
  dateOfBirth?: string
  lastGrade?: string
  lastEnrollmentYear?: string
}

export interface EnrollmentSummary {
  enrollment: Enrollment
  schoolYear: SchoolYear
  grade: Grade
  paymentSchedules: PaymentSchedule[]
  payments: Payment[]
  notes: EnrollmentNote[]
  totalPaid: number
  totalOwed: number
  percentPaid: number
  studentNumber?: string
}

// ============================================================================
// Grade Level Configuration
// ============================================================================

export const GRADE_LEVELS: Record<SchoolLevel, { label: string; labelFr: string }> = {
  kindergarten: { label: "Kindergarten", labelFr: "Maternelle" },
  elementary: { label: "Elementary School", labelFr: "Primaire" },
  college: { label: "College", labelFr: "Collège" },
  high_school: { label: "High School", labelFr: "Lycée" },
}

export const GRADES_BY_LEVEL: Record<SchoolLevel, Array<{ order: number; name: string; nameFr: string }>> = {
  kindergarten: [
    { order: -2, name: "Petite Section (PS)", nameFr: "Petite Section (PS)" },
    { order: -1, name: "Moyenne Section (MS)", nameFr: "Moyenne Section (MS)" },
    { order: 0, name: "Grande Section (GS)", nameFr: "Grande Section (GS)" },
  ],
  elementary: [
    { order: 1, name: "Grade 1", nameFr: "1ère Année" },
    { order: 2, name: "Grade 2", nameFr: "2ème Année" },
    { order: 3, name: "Grade 3", nameFr: "3ème Année" },
    { order: 4, name: "Grade 4", nameFr: "4ème Année" },
    { order: 5, name: "Grade 5", nameFr: "5ème Année" },
    { order: 6, name: "Grade 6", nameFr: "6ème Année" },
  ],
  college: [
    { order: 7, name: "Grade 7", nameFr: "7ème Année" },
    { order: 8, name: "Grade 8", nameFr: "8ème Année" },
    { order: 9, name: "Grade 9", nameFr: "9ème Année" },
    { order: 10, name: "Grade 10", nameFr: "10ème Année" },
  ],
  high_school: [
    { order: 11, name: "Grade 11", nameFr: "11ème Année" },
    { order: 12, name: "Grade 12", nameFr: "12ème Année" },
    { order: 13, name: "Terminal", nameFr: "Terminale" },
  ],
}

// ============================================================================
// Payment Schedule Configuration
// ============================================================================

export const PAYMENT_SCHEDULE_CONFIG = {
  1: {
    months: ["September", "October", "May"],
    monthsFr: ["Septembre", "Octobre", "Mai"],
    description: "Schedule 1: Sep + Oct + May",
    descriptionFr: "Echeance 1: Sep + Oct + Mai",
  },
  2: {
    months: ["November", "December", "January"],
    monthsFr: ["Novembre", "Decembre", "Janvier"],
    description: "Schedule 2: Nov + Dec + Jan",
    descriptionFr: "Echeance 2: Nov + Dec + Jan",
  },
  3: {
    months: ["February", "March", "April"],
    monthsFr: ["Fevrier", "Mars", "Avril"],
    description: "Schedule 3: Feb + Mar + Apr",
    descriptionFr: "Echeance 3: Fev + Mar + Avr",
  },
} as const

export type PaymentScheduleNumber = keyof typeof PAYMENT_SCHEDULE_CONFIG
