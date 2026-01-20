// Club Enrollment Wizard Types

export type ClubEnrollmentStep = 1 | 2 | 3 | 4

export interface ClubEnrollmentData {
  // Step 1: Club Selection
  clubId: string
  clubName: string
  clubNameFr: string | null
  categoryName: string | null
  leaderName: string | null
  enrollmentFee: number
  monthlyFee: number | null
  startDate: string
  endDate: string
  currentEnrollments: number
  capacity: number

  // Step 2: Student Selection
  studentId: string
  studentName: string
  studentGrade: string
  studentPhoto: string | null

  // Step 3: Payment
  paymentAmount: number
  paymentMethod: "cash" | "orange_money" | null
  receiptNumber: string
  transactionRef: string
  notes: string

  // Metadata
  enrollmentId?: string
  enrollmentNumber?: string
  status?: string
}

export interface ClubOption {
  id: string
  name: string
  nameFr: string | null
  description: string | null
  categoryId: string | null
  category: {
    name: string
    nameFr: string | null
  } | null
  leaderId: string | null
  leaderType: "teacher" | "staff" | "student" | null
  leader: {
    id: string
    name: string
    type: string
    photoUrl?: string | null
  } | null
  fee: number
  monthlyFee: number | null
  startDate: string
  endDate: string
  capacity: number
  status: string
  _count: {
    enrollments: number
  }
}

export interface EligibleStudent {
  id: string // StudentProfile ID
  studentId: string // Person ID (used for enrollment creation)
  formattedStudentId?: string | null // Formatted ID like STD-2024-22052016-0036
  person: {
    firstName: string
    lastName: string
    photoUrl: string | null
  }
  currentGrade: {
    id: string
    name: string
    level: string
  } | null
  studentStatus?: string
  clubEnrollments?: Array<{
    club: {
      name: string
    }
  }>
}

export interface ClubEnrollmentWizardState {
  currentStep: ClubEnrollmentStep
  completedSteps: ClubEnrollmentStep[]
  data: Partial<ClubEnrollmentData>
  isDirty: boolean
  isSubmitting: boolean
  error?: string
}

export type ClubEnrollmentAction =
  | { type: "SET_STEP"; step: ClubEnrollmentStep }
  | { type: "COMPLETE_STEP"; step: ClubEnrollmentStep }
  | { type: "SET_CLUB"; club: Partial<ClubEnrollmentData> }
  | { type: "SET_STUDENT"; student: Partial<ClubEnrollmentData> }
  | { type: "SET_PAYMENT"; payment: Partial<ClubEnrollmentData> }
  | { type: "SET_ENROLLMENT_ID"; enrollmentId: string }
  | { type: "SET_ENROLLMENT_NUMBER"; enrollmentNumber: string; status: string }
  | { type: "SET_ERROR"; error: string }
  | { type: "CLEAR_ERROR" }
  | { type: "SET_SUBMITTING"; isSubmitting: boolean }
  | { type: "RESET" }
