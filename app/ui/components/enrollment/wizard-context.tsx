"use client"

import React, { createContext, useContext, useReducer, useCallback } from "react"
import type {
  EnrollmentWizardState,
  EnrollmentWizardData,
  SchoolLevel,
} from "@/lib/enrollment/types"

// Step names for reference
export const WIZARD_STEPS = [
  "grade-selection",
  "student-info",
  "payment-breakdown",
  "payment-transaction",
  "review",
  "confirmation",
] as const

export type WizardStep = (typeof WIZARD_STEPS)[number]

// Initial wizard data
const initialData: EnrollmentWizardData = {
  // Step 1 - Grade Selection
  schoolYearId: "",
  gradeId: "",
  gradeName: "",
  level: "elementary" as SchoolLevel,
  gradeOrder: 0,
  tuitionFee: 0,

  // Step 2 - Student Info
  isReturningStudent: false,
  studentId: undefined,
  firstName: "",
  lastName: "",
  dateOfBirth: undefined,
  gender: undefined,
  phone: undefined,
  email: undefined,
  photoUrl: undefined,
  birthCertificateUrl: undefined,
  fatherName: undefined,
  fatherPhone: undefined,
  fatherEmail: undefined,
  motherName: undefined,
  motherPhone: undefined,
  motherEmail: undefined,
  address: undefined,
  notes: [],

  // Enrolling person info
  enrollingPersonType: undefined,
  enrollingPersonName: undefined,
  enrollingPersonRelation: undefined,
  enrollingPersonPhone: undefined,
  enrollingPersonEmail: undefined,

  // Step 3 - Payment Breakdown
  originalTuitionFee: 0,
  adjustedTuitionFee: undefined,
  adjustmentReason: undefined,
  paymentSchedules: [],

  // Step 4 - Payment Transaction
  paymentMade: false,
  paymentAmount: undefined,
  paymentMethod: "cash",
  receiptNumber: undefined,
  transactionRef: undefined,
  receiptImageUrl: undefined,
}

// Initial wizard state
const initialState: EnrollmentWizardState = {
  currentStep: 1,
  completedSteps: [],
  data: initialData,
  isDirty: false,
  isSubmitting: false,
  enrollmentId: undefined,
  error: undefined,
}

// Action types
type WizardAction =
  | { type: "SET_STEP"; step: number }
  | { type: "NEXT_STEP" }
  | { type: "PREV_STEP" }
  | { type: "UPDATE_DATA"; data: Partial<EnrollmentWizardData> }
  | { type: "MARK_STEP_COMPLETE"; step: number }
  | { type: "SET_DIRTY"; isDirty: boolean }
  | { type: "SET_SUBMITTING"; isSubmitting: boolean }
  | { type: "SET_ENROLLMENT_ID"; id: string }
  | { type: "SET_ERROR"; error: string | undefined }
  | { type: "RESET" }
  | { type: "LOAD_DRAFT"; state: EnrollmentWizardState }

// Reducer
function wizardReducer(
  state: EnrollmentWizardState,
  action: WizardAction
): EnrollmentWizardState {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, currentStep: action.step }

    case "NEXT_STEP":
      return {
        ...state,
        currentStep: Math.min(state.currentStep + 1, 6),
        completedSteps: state.completedSteps.includes(state.currentStep)
          ? state.completedSteps
          : [...state.completedSteps, state.currentStep],
      }

    case "PREV_STEP":
      return { ...state, currentStep: Math.max(state.currentStep - 1, 1) }

    case "UPDATE_DATA":
      return {
        ...state,
        data: { ...state.data, ...action.data },
        isDirty: true,
      }

    case "MARK_STEP_COMPLETE":
      return {
        ...state,
        completedSteps: state.completedSteps.includes(action.step)
          ? state.completedSteps
          : [...state.completedSteps, action.step],
      }

    case "SET_DIRTY":
      return { ...state, isDirty: action.isDirty }

    case "SET_SUBMITTING":
      return { ...state, isSubmitting: action.isSubmitting }

    case "SET_ENROLLMENT_ID":
      return { ...state, enrollmentId: action.id }

    case "SET_ERROR":
      return { ...state, error: action.error }

    case "RESET":
      return initialState

    case "LOAD_DRAFT":
      return action.state

    default:
      return state
  }
}

// Context type
interface WizardContextType {
  state: EnrollmentWizardState
  goToStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void
  updateData: (data: Partial<EnrollmentWizardData>) => void
  markStepComplete: (step: number) => void
  setSubmitting: (isSubmitting: boolean) => void
  setEnrollmentId: (id: string) => void
  setError: (error: string | undefined) => void
  reset: () => void
  loadDraft: (state: EnrollmentWizardState) => void
  canProceed: (step: number) => boolean
}

const WizardContext = createContext<WizardContextType | undefined>(undefined)

// Provider component
export function EnrollmentWizardProvider({
  children,
  initialState: providedInitialState,
}: {
  children: React.ReactNode
  initialState?: EnrollmentWizardState
}) {
  const [state, dispatch] = useReducer(
    wizardReducer,
    providedInitialState || initialState
  )

  const goToStep = useCallback((step: number) => {
    dispatch({ type: "SET_STEP", step })
  }, [])

  const nextStep = useCallback(() => {
    dispatch({ type: "NEXT_STEP" })
  }, [])

  const prevStep = useCallback(() => {
    dispatch({ type: "PREV_STEP" })
  }, [])

  const updateData = useCallback((data: Partial<EnrollmentWizardData>) => {
    dispatch({ type: "UPDATE_DATA", data })
  }, [])

  const markStepComplete = useCallback((step: number) => {
    dispatch({ type: "MARK_STEP_COMPLETE", step })
  }, [])

  const setSubmitting = useCallback((isSubmitting: boolean) => {
    dispatch({ type: "SET_SUBMITTING", isSubmitting })
  }, [])

  const setEnrollmentId = useCallback((id: string) => {
    dispatch({ type: "SET_ENROLLMENT_ID", id })
  }, [])

  const setError = useCallback((error: string | undefined) => {
    dispatch({ type: "SET_ERROR", error })
  }, [])

  const reset = useCallback(() => {
    dispatch({ type: "RESET" })
  }, [])

  const loadDraft = useCallback((draftState: EnrollmentWizardState) => {
    dispatch({ type: "LOAD_DRAFT", state: draftState })
  }, [])

  // Validation logic for each step
  const canProceed = useCallback(
    (step: number): boolean => {
      const { data } = state

      switch (step) {
        case 1: // Grade Selection
          return !!data.gradeId && !!data.schoolYearId
        case 2: // Student Info
          // Basic requirements
          const hasBasicInfo = !!data.firstName &&
            !!data.lastName &&
            !!data.dateOfBirth &&
            (!!data.fatherName || !!data.motherName) &&
            (!!data.phone || !!data.fatherPhone || !!data.motherPhone)

          // Enrolling person requirements
          const hasEnrollingPerson = !!data.enrollingPersonType

          // Validate enrolling person phone based on type
          let enrollingPersonValid = false
          if (data.enrollingPersonType === "father") {
            // Father must have a valid phone number
            enrollingPersonValid = !!data.fatherPhone && data.fatherPhone.trim() !== "" && data.fatherPhone.trim() !== "+224"
          } else if (data.enrollingPersonType === "mother") {
            // Mother must have a valid phone number
            enrollingPersonValid = !!data.motherPhone && data.motherPhone.trim() !== "" && data.motherPhone.trim() !== "+224"
          } else if (data.enrollingPersonType === "other") {
            // Other person must have name, relation, and phone
            enrollingPersonValid = !!data.enrollingPersonName &&
              !!data.enrollingPersonRelation &&
              !!data.enrollingPersonPhone &&
              data.enrollingPersonPhone.trim() !== "" &&
              data.enrollingPersonPhone.trim() !== "+224"
          }

          return hasBasicInfo && hasEnrollingPerson && enrollingPersonValid
        case 3: // Payment Breakdown
          return data.paymentSchedules.length > 0
        case 4: // Payment Transaction (optional, but if making payment, receipt number is required)
          // If user is making a payment (amount > 0 and method selected), receipt number must be set
          if (data.paymentAmount && data.paymentAmount > 0 && data.paymentMethod) {
            return !!data.receiptNumber
          }
          return true // Payment is optional
        case 5: // Review
          return true // Just review, always can proceed
        case 6: // Confirmation
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
        setEnrollmentId,
        setError,
        reset,
        loadDraft,
        canProceed,
      }}
    >
      {children}
    </WizardContext.Provider>
  )
}

// Hook to use wizard context
export function useEnrollmentWizard() {
  const context = useContext(WizardContext)
  if (context === undefined) {
    throw new Error(
      "useEnrollmentWizard must be used within an EnrollmentWizardProvider"
    )
  }
  return context
}
