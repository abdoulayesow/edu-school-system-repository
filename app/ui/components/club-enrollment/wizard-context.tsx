"use client"

import React, { createContext, useContext, useReducer, useCallback } from "react"
import type {
  ClubEnrollmentWizardState,
  ClubEnrollmentAction,
  ClubEnrollmentStep,
  ClubEnrollmentData,
} from "@/lib/types/club-enrollment"

const initialState: ClubEnrollmentWizardState = {
  currentStep: 1,
  completedSteps: [],
  data: {
    clubId: "",
    clubName: "",
    clubNameFr: null,
    categoryName: null,
    leaderName: null,
    enrollmentFee: 0,
    monthlyFee: null,
    startDate: "",
    endDate: "",
    currentEnrollments: 0,
    capacity: 0,
    studentId: "",
    studentName: "",
    studentGrade: "",
    studentPhoto: null,
    studentDateOfBirth: null,
    studentGender: null,
    studentParentInfo: null,
    paymentAmount: 0,
    paymentMethod: null,
    receiptNumber: "",
    transactionRef: "",
    notes: "",
  },
  isDirty: false,
  isSubmitting: false,
}

function wizardReducer(
  state: ClubEnrollmentWizardState,
  action: ClubEnrollmentAction
): ClubEnrollmentWizardState {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, currentStep: action.step }

    case "COMPLETE_STEP":
      return {
        ...state,
        completedSteps: state.completedSteps.includes(action.step)
          ? state.completedSteps
          : [...state.completedSteps, action.step].sort(),
      }

    case "SET_CLUB":
      return {
        ...state,
        data: { ...state.data, ...action.club },
        isDirty: true,
        error: undefined, // Auto-clear errors when user makes changes
      }

    case "SET_STUDENT":
      return {
        ...state,
        data: { ...state.data, ...action.student },
        isDirty: true,
        error: undefined, // Auto-clear errors when user makes changes
      }

    case "SET_PAYMENT":
      return {
        ...state,
        data: { ...state.data, ...action.payment },
        isDirty: true,
        error: undefined, // Auto-clear errors when user makes changes
      }

    case "SET_ENROLLMENT_ID":
      return {
        ...state,
        data: { ...state.data, enrollmentId: action.enrollmentId },
        isDirty: false,
      }

    case "SET_ENROLLMENT_NUMBER":
      return {
        ...state,
        data: {
          ...state.data,
          enrollmentNumber: action.enrollmentNumber,
          status: action.status,
        },
      }

    case "SET_ERROR":
      return { ...state, error: action.error, isSubmitting: false }

    case "CLEAR_ERROR":
      return { ...state, error: undefined }

    case "SET_SUBMITTING":
      return { ...state, isSubmitting: action.isSubmitting }

    case "RESET":
      return initialState

    default:
      return state
  }
}

interface ClubEnrollmentWizardContextValue {
  state: ClubEnrollmentWizardState
  nextStep: () => void
  prevStep: () => void
  goToStep: (step: ClubEnrollmentStep) => void
  completeStep: (step: ClubEnrollmentStep) => void
  setClub: (club: Partial<ClubEnrollmentData>) => void
  setStudent: (student: Partial<ClubEnrollmentData>) => void
  setPayment: (payment: Partial<ClubEnrollmentData>) => void
  setEnrollmentId: (id: string) => void
  setEnrollmentNumber: (number: string, status: string) => void
  setError: (error: string) => void
  clearError: () => void
  setSubmitting: (isSubmitting: boolean) => void
  reset: () => void
  canProceed: () => boolean
}

const ClubEnrollmentWizardContext = createContext<
  ClubEnrollmentWizardContextValue | undefined
>(undefined)

export function ClubEnrollmentWizardProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [state, dispatch] = useReducer(wizardReducer, initialState)

  const nextStep = useCallback(() => {
    if (state.currentStep < 4) {
      dispatch({ type: "COMPLETE_STEP", step: state.currentStep })
      dispatch({ type: "SET_STEP", step: (state.currentStep + 1) as ClubEnrollmentStep })
    }
  }, [state.currentStep])

  const prevStep = useCallback(() => {
    if (state.currentStep > 1) {
      dispatch({ type: "SET_STEP", step: (state.currentStep - 1) as ClubEnrollmentStep })
    }
  }, [state.currentStep])

  const goToStep = useCallback(
    (step: ClubEnrollmentStep) => {
      // Can only go to completed steps or the next step
      if (
        state.completedSteps.includes(step) ||
        step === state.currentStep + 1
      ) {
        dispatch({ type: "SET_STEP", step })
      }
    },
    [state.completedSteps, state.currentStep]
  )

  const completeStep = useCallback((step: ClubEnrollmentStep) => {
    dispatch({ type: "COMPLETE_STEP", step })
  }, [])

  const setClub = useCallback((club: Partial<ClubEnrollmentData>) => {
    dispatch({ type: "SET_CLUB", club })
  }, [])

  const setStudent = useCallback((student: Partial<ClubEnrollmentData>) => {
    dispatch({ type: "SET_STUDENT", student })
  }, [])

  const setPayment = useCallback((payment: Partial<ClubEnrollmentData>) => {
    dispatch({ type: "SET_PAYMENT", payment })
  }, [])

  const setEnrollmentId = useCallback((id: string) => {
    dispatch({ type: "SET_ENROLLMENT_ID", enrollmentId: id })
  }, [])

  const setEnrollmentNumber = useCallback((number: string, status: string) => {
    dispatch({ type: "SET_ENROLLMENT_NUMBER", enrollmentNumber: number, status })
  }, [])

  const setError = useCallback((error: string) => {
    dispatch({ type: "SET_ERROR", error })
  }, [])

  const clearError = useCallback(() => {
    dispatch({ type: "CLEAR_ERROR" })
  }, [])

  const setSubmitting = useCallback((isSubmitting: boolean) => {
    dispatch({ type: "SET_SUBMITTING", isSubmitting })
  }, [])

  const reset = useCallback(() => {
    dispatch({ type: "RESET" })
  }, [])

  const canProceed = useCallback(() => {
    const { currentStep, data } = state

    switch (currentStep) {
      case 1:
        // Must have selected a club
        return !!(data.clubId && data.clubName)

      case 2:
        // Must have selected a student
        return !!(data.studentId && data.studentName)

      case 3:
        // If payment amount > 0, must have receipt number, method, and payer info
        if (data.paymentAmount && data.paymentAmount > 0) {
          // Must have payment method and receipt number
          if (!data.receiptNumber || !data.paymentMethod) return false

          // Must have payer info with name and phone
          if (!data.payer?.name || !data.payer?.phone) return false

          // Validate phone is not empty/placeholder
          const phone = data.payer.phone.trim()
          if (!phone || phone === "+224") return false

          return true
        }
        // Otherwise can proceed (no payment required)
        return true

      case 4:
        // Confirmation step - always can proceed
        return true

      default:
        return false
    }
  }, [state])

  const value: ClubEnrollmentWizardContextValue = {
    state,
    nextStep,
    prevStep,
    goToStep,
    completeStep,
    setClub,
    setStudent,
    setPayment,
    setEnrollmentId,
    setEnrollmentNumber,
    setError,
    clearError,
    setSubmitting,
    reset,
    canProceed,
  }

  return (
    <ClubEnrollmentWizardContext.Provider value={value}>
      {children}
    </ClubEnrollmentWizardContext.Provider>
  )
}

export function useClubEnrollmentWizard() {
  const context = useContext(ClubEnrollmentWizardContext)
  if (!context) {
    throw new Error(
      "useClubEnrollmentWizard must be used within ClubEnrollmentWizardProvider"
    )
  }
  return context
}
