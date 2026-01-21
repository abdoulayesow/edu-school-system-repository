// Club Enrollment Wizard Types

export type ClubEnrollmentStep = 1 | 2 | 3 | 4

export type PayerType = "father" | "mother" | "enrolling_person" | "other"

export interface PayerInfo {
  type: PayerType
  name: string
  phone: string
  email?: string
}

export interface EnrollmentPayerInfo {
  fatherName?: string | null
  fatherPhone?: string | null
  fatherEmail?: string | null
  motherName?: string | null
  motherPhone?: string | null
  motherEmail?: string | null
  enrollingPersonName?: string | null
  enrollingPersonPhone?: string | null
  enrollingPersonEmail?: string | null
}

export interface StudentParentInfo {
  fatherName?: string | null
  fatherPhone?: string | null
  motherName?: string | null
  motherPhone?: string | null
}

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
  studentDateOfBirth?: string | null
  studentGender?: string | null
  studentParentInfo?: StudentParentInfo | null
  enrollmentPayerInfo?: EnrollmentPayerInfo

  // Step 3: Payment
  paymentAmount: number
  paymentMethod: "cash" | "orange_money" | null
  receiptNumber: string
  transactionRef: string
  notes: string
  payer?: PayerInfo

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
    middleName?: string | null
    lastName: string
    photoUrl: string | null
    dateOfBirth?: string | null
    gender?: string | null
    phone?: string | null
    email?: string | null
  }
  parentInfo?: {
    fatherName?: string | null
    fatherPhone?: string | null
    motherName?: string | null
    motherPhone?: string | null
  } | null
  enrollmentPayerInfo?: EnrollmentPayerInfo | null
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
