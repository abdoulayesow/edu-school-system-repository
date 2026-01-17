"use client"

import React, { createContext, useContext, useReducer, useCallback } from "react"

// =============================================================================
// STEP DEFINITIONS
// =============================================================================

export const PAYMENT_WIZARD_STEPS = [
  "payment-type",
  "student-selection",
  "payment-schedule",
  "payment-entry",
  "review",
  "completion",
] as const

export type PaymentWizardStep = (typeof PAYMENT_WIZARD_STEPS)[number]

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export type PayerType = "father" | "mother" | "enrolling_person" | "other"

export interface PayerInfo {
  type: PayerType
  name: string
  phone: string
  email?: string
}

export interface PaymentScheduleItem {
  id: string
  scheduleNumber: number
  amount: number
  paidAmount: number
  remainingAmount: number
  isPaid: boolean
  dueDate: string
  months: string[]
}

export interface PreviousPayment {
  id: string
  amount: number
  method: "cash" | "orange_money"
  receiptNumber: string
  recordedAt: string
  recorderName?: string
}

export interface EnrollmentPayerInfo {
  fatherName?: string
  fatherPhone?: string
  fatherEmail?: string
  motherName?: string
  motherPhone?: string
  motherEmail?: string
  enrollingPersonType?: string
  enrollingPersonName?: string
  enrollingPersonRelation?: string
  enrollingPersonPhone?: string
  enrollingPersonEmail?: string
}

export interface PaymentWizardData {
  // Step 0 - Payment Type Selection
  paymentType?: "tuition" | "club"

  // Step 1 - Student Selection (complete student info for verification)
  studentId?: string
  studentNumber?: string
  studentFirstName?: string
  studentMiddleName?: string
  studentLastName?: string
  studentPhotoUrl?: string
  studentDateOfBirth?: string
  studentGender?: "male" | "female"
  studentPhone?: string
  studentEmail?: string
  studentAddress?: string
  enrollmentId?: string
  gradeId?: string
  gradeName?: string
  schoolYearId?: string
  schoolYearName?: string

  // Club enrollment fields (when paymentType === "club")
  clubEnrollmentId?: string
  clubId?: string
  clubName?: string
  clubNameFr?: string
  clubFee?: number
  clubMonthlyFee?: number

  // Balance Info (loaded with student)
  tuitionFee: number
  totalPaid: number
  remainingBalance: number
  paymentStatus: "complete" | "on_time" | "late" | "in_advance"
  expectedPaymentPercentage: number
  actualPaymentPercentage: number

  // Payment Schedules (from balance API)
  scheduleProgress: PaymentScheduleItem[]

  // Previous Payments (for history display)
  previousPayments: PreviousPayment[]

  // Enrollment payer info (from enrollment)
  enrollmentPayerInfo?: EnrollmentPayerInfo

  // Step 3 - Payment Entry
  paymentAmount?: number
  paymentMethod?: "cash" | "orange_money"
  receiptNumber?: string
  transactionRef?: string
  notes?: string

  // Payer Info
  payer?: PayerInfo

  // Step 5 - Completion
  paymentId?: string
  createdAt?: string
}

// Initial wizard data
const initialData: PaymentWizardData = {
  // Payment type defaults to tuition for backward compatibility
  paymentType: "tuition",

  // Balance defaults
  tuitionFee: 0,
  totalPaid: 0,
  remainingBalance: 0,
  paymentStatus: "on_time",
  expectedPaymentPercentage: 0,
  actualPaymentPercentage: 0,
  scheduleProgress: [],
  previousPayments: [],
}

// =============================================================================
// STATE DEFINITION
// =============================================================================

export interface PaymentWizardState {
  currentStep: number
  completedSteps: number[]
  data: PaymentWizardData
  isSubmitting: boolean
  isFullyPaid: boolean
  error?: string
}

const initialState: PaymentWizardState = {
  currentStep: 0, // Start at step 0 (payment type selection)
  completedSteps: [],
  data: initialData,
  isSubmitting: false,
  isFullyPaid: false,
  error: undefined,
}

// =============================================================================
// ACTIONS
// =============================================================================

type WizardAction =
  | { type: "SET_STEP"; step: number }
  | { type: "NEXT_STEP" }
  | { type: "PREV_STEP" }
  | { type: "UPDATE_DATA"; data: Partial<PaymentWizardData> }
  | { type: "MARK_STEP_COMPLETE"; step: number }
  | { type: "SET_SUBMITTING"; isSubmitting: boolean }
  | { type: "SET_ERROR"; error: string | undefined }
  | { type: "SET_FULLY_PAID"; isFullyPaid: boolean }
  | { type: "RESET" }
  | { type: "LOAD_STUDENT"; studentData: Partial<PaymentWizardData> }

// =============================================================================
// REDUCER
// =============================================================================

function wizardReducer(
  state: PaymentWizardState,
  action: WizardAction
): PaymentWizardState {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, currentStep: action.step }

    case "NEXT_STEP": {
      // Skip payment schedule step (step 2) for club payments
      let nextStep = state.currentStep + 1
      if (nextStep === 2 && state.data.paymentType === "club") {
        nextStep = 3 // Skip to payment entry
      }

      return {
        ...state,
        currentStep: Math.min(nextStep, 5),
        completedSteps: state.completedSteps.includes(state.currentStep)
          ? state.completedSteps
          : [...state.completedSteps, state.currentStep],
      }
    }

    case "PREV_STEP": {
      // Skip payment schedule step (step 2) when going back for club payments
      let prevStep = state.currentStep - 1
      if (prevStep === 2 && state.data.paymentType === "club") {
        prevStep = 1 // Skip back to student selection
      }

      return { ...state, currentStep: Math.max(prevStep, 0) }
    }

    case "UPDATE_DATA":
      return {
        ...state,
        data: { ...state.data, ...action.data },
      }

    case "MARK_STEP_COMPLETE":
      return {
        ...state,
        completedSteps: state.completedSteps.includes(action.step)
          ? state.completedSteps
          : [...state.completedSteps, action.step],
      }

    case "SET_SUBMITTING":
      return { ...state, isSubmitting: action.isSubmitting }

    case "SET_ERROR":
      return { ...state, error: action.error }

    case "SET_FULLY_PAID":
      return { ...state, isFullyPaid: action.isFullyPaid }

    case "RESET":
      return initialState

    case "LOAD_STUDENT":
      // When loading student data, check if fully paid
      const isFullyPaid = action.studentData.remainingBalance === 0
      return {
        ...state,
        data: { ...state.data, ...action.studentData },
        isFullyPaid,
      }

    default:
      return state
  }
}

// =============================================================================
// CONTEXT
// =============================================================================

interface WizardContextType {
  state: PaymentWizardState
  goToStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void
  updateData: (data: Partial<PaymentWizardData>) => void
  markStepComplete: (step: number) => void
  setSubmitting: (isSubmitting: boolean) => void
  setError: (error: string | undefined) => void
  setFullyPaid: (isFullyPaid: boolean) => void
  reset: () => void
  loadStudent: (studentData: Partial<PaymentWizardData>) => void
  canProceed: (step: number) => boolean
}

const WizardContext = createContext<WizardContextType | undefined>(undefined)

// =============================================================================
// PROVIDER
// =============================================================================

export function PaymentWizardProvider({
  children,
  initialStudentId,
}: {
  children: React.ReactNode
  initialStudentId?: string
}) {
  const [state, dispatch] = useReducer(wizardReducer, {
    ...initialState,
    data: {
      ...initialData,
      studentId: initialStudentId,
    },
  })

  const goToStep = useCallback((step: number) => {
    dispatch({ type: "SET_STEP", step })
  }, [])

  const nextStep = useCallback(() => {
    dispatch({ type: "NEXT_STEP" })
  }, [])

  const prevStep = useCallback(() => {
    dispatch({ type: "PREV_STEP" })
  }, [])

  const updateData = useCallback((data: Partial<PaymentWizardData>) => {
    dispatch({ type: "UPDATE_DATA", data })
  }, [])

  const markStepComplete = useCallback((step: number) => {
    dispatch({ type: "MARK_STEP_COMPLETE", step })
  }, [])

  const setSubmitting = useCallback((isSubmitting: boolean) => {
    dispatch({ type: "SET_SUBMITTING", isSubmitting })
  }, [])

  const setError = useCallback((error: string | undefined) => {
    dispatch({ type: "SET_ERROR", error })
  }, [])

  const setFullyPaid = useCallback((isFullyPaid: boolean) => {
    dispatch({ type: "SET_FULLY_PAID", isFullyPaid })
  }, [])

  const reset = useCallback(() => {
    dispatch({ type: "RESET" })
  }, [])

  const loadStudent = useCallback((studentData: Partial<PaymentWizardData>) => {
    dispatch({ type: "LOAD_STUDENT", studentData })
  }, [])

  // Validation logic for each step
  const canProceed = useCallback(
    (step: number): boolean => {
      const { data, isFullyPaid } = state

      switch (step) {
        case 0: // Payment Type Selection
          // Must have payment type selected
          return !!data.paymentType

        case 1: // Student Selection
          // For tuition payments: must have student with enrollment
          if (data.paymentType === "tuition") {
            if (!data.studentId || !data.enrollmentId) return false
            // If fully paid, can still proceed to view schedule (celebration handled in step 2)
            return true
          }
          // For club payments: must have student with club enrollment
          if (data.paymentType === "club") {
            if (!data.studentId || !data.clubEnrollmentId) return false
            return true
          }
          return false

        case 2: // Payment Schedule (read-only, informational, tuition only)
          // If fully paid, cannot proceed to payment entry
          if (isFullyPaid) return false
          return true

        case 3: // Payment Entry
          // Amount required and valid
          if (!data.paymentAmount || data.paymentAmount <= 0) return false
          // For tuition, check against remaining balance
          if (data.paymentType === "tuition" && data.paymentAmount > data.remainingBalance) {
            return false
          }

          // Payment method required
          if (!data.paymentMethod) return false

          // Receipt number required
          if (!data.receiptNumber) return false

          // Orange Money requires transaction reference
          if (data.paymentMethod === "orange_money" && !data.transactionRef) {
            return false
          }

          // Payer info required
          if (!data.payer?.name || !data.payer?.phone) return false

          // Validate phone is not empty/placeholder
          const phone = data.payer.phone.trim()
          if (!phone || phone === "+224") return false

          return true

        case 4: // Review
          return true // Just review, can always submit from here

        case 5: // Completion
          return true

        default:
          return false
      }
    },
    [state]
  )

  return (
    <WizardContext.Provider
      value={{
        state,
        goToStep,
        nextStep,
        prevStep,
        updateData,
        markStepComplete,
        setSubmitting,
        setError,
        setFullyPaid,
        reset,
        loadStudent,
        canProceed,
      }}
    >
      {children}
    </WizardContext.Provider>
  )
}

// =============================================================================
// HOOK
// =============================================================================

export function usePaymentWizard() {
  const context = useContext(WizardContext)
  if (context === undefined) {
    throw new Error(
      "usePaymentWizard must be used within a PaymentWizardProvider"
    )
  }
  return context
}
