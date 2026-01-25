"use client"

import React, { createContext, useContext, useReducer, useCallback } from "react"

// =============================================================================
// STEP DEFINITIONS
// =============================================================================

export const EXPENSE_WIZARD_STEPS = [
  "category-selection",
  "expense-details",
  "amount-method",
  "receipt-documentation",
  "review",
  "completion",
] as const

export type ExpenseWizardStep = (typeof EXPENSE_WIZARD_STEPS)[number]

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export type ExpenseCategory =
  | "supplies"
  | "maintenance"
  | "utilities"
  | "salary"
  | "transport"
  | "communication"
  | "other"

export type PaymentMethod = "cash" | "orange_money"

export interface ExpenseWizardData {
  // Step 0 - Category Selection
  category?: ExpenseCategory

  // Step 1 - Expense Details
  description?: string
  date?: string // ISO date string

  // DEPRECATED (kept for backwards compatibility)
  vendorName?: string
  receiptUrl?: string
  notes?: string

  // NEW FIELDS
  supplierId?: string
  supplierName?: string // For "Other" custom supplier
  initiatedById?: string // Staff who initiated the expense

  // Step 2 - Amount & Payment Method
  amount?: number
  method?: PaymentMethod
  transactionRef?: string // For orange_money

  // Step 3 - Receipt/Documentation (optional)
  billingReferenceId?: string // Invoice/receipt number
  receiptFile?: File | null // File object for upload
  receiptFileData?: string | null // base64 encoded for API
  receiptFileName?: string | null
  receiptFileType?: string | null // MIME type

  // Step 5 - Completion
  expenseId?: string
  createdAt?: string
}

// Initial wizard data
const initialData: ExpenseWizardData = {
  date: new Date().toISOString().split('T')[0], // Default to today
}

// =============================================================================
// STATE DEFINITION
// =============================================================================

export interface ExpenseWizardState {
  currentStep: number
  completedSteps: number[]
  data: ExpenseWizardData
  isSubmitting: boolean
  error?: string
  registryBalance?: number
  mobileMoneyBalance?: number
  safeBalance?: number
  registryClosed: boolean
}

const initialState: ExpenseWizardState = {
  currentStep: 0,
  completedSteps: [],
  data: initialData,
  isSubmitting: false,
  error: undefined,
  registryClosed: false,
}

// =============================================================================
// ACTIONS
// =============================================================================

type WizardAction =
  | { type: "SET_STEP"; step: number }
  | { type: "NEXT_STEP" }
  | { type: "PREV_STEP" }
  | { type: "UPDATE_DATA"; data: Partial<ExpenseWizardData> }
  | { type: "MARK_STEP_COMPLETE"; step: number }
  | { type: "SET_SUBMITTING"; isSubmitting: boolean }
  | { type: "SET_ERROR"; error: string | undefined }
  | { type: "SET_BALANCES"; balances: { registryBalance?: number; mobileMoneyBalance?: number; safeBalance?: number; registryClosed: boolean } }
  | { type: "RESET" }

// =============================================================================
// REDUCER
// =============================================================================

function wizardReducer(
  state: ExpenseWizardState,
  action: WizardAction
): ExpenseWizardState {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, currentStep: action.step }

    case "NEXT_STEP":
      return {
        ...state,
        currentStep: Math.min(state.currentStep + 1, 5),
        completedSteps: state.completedSteps.includes(state.currentStep)
          ? state.completedSteps
          : [...state.completedSteps, state.currentStep],
      }

    case "PREV_STEP":
      return { ...state, currentStep: Math.max(state.currentStep - 1, 0) }

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

    case "SET_BALANCES":
      return {
        ...state,
        registryBalance: action.balances.registryBalance,
        mobileMoneyBalance: action.balances.mobileMoneyBalance,
        safeBalance: action.balances.safeBalance,
        registryClosed: action.balances.registryClosed,
      }

    case "RESET":
      return initialState

    default:
      return state
  }
}

// =============================================================================
// CONTEXT
// =============================================================================

interface WizardContextType {
  state: ExpenseWizardState
  goToStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void
  updateData: (data: Partial<ExpenseWizardData>) => void
  markStepComplete: (step: number) => void
  setSubmitting: (isSubmitting: boolean) => void
  setError: (error: string | undefined) => void
  setBalances: (balances: { registryBalance?: number; mobileMoneyBalance?: number; safeBalance?: number; registryClosed: boolean }) => void
  reset: () => void
  canProceed: (step: number) => boolean
}

const WizardContext = createContext<WizardContextType | undefined>(undefined)

// =============================================================================
// PROVIDER
// =============================================================================

export function ExpenseWizardProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [state, dispatch] = useReducer(wizardReducer, initialState)

  const goToStep = useCallback((step: number) => {
    dispatch({ type: "SET_STEP", step })
  }, [])

  const nextStep = useCallback(() => {
    dispatch({ type: "NEXT_STEP" })
  }, [])

  const prevStep = useCallback(() => {
    dispatch({ type: "PREV_STEP" })
  }, [])

  const updateData = useCallback((data: Partial<ExpenseWizardData>) => {
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

  const setBalances = useCallback((balances: { registryBalance?: number; mobileMoneyBalance?: number; safeBalance?: number; registryClosed: boolean }) => {
    dispatch({ type: "SET_BALANCES", balances })
  }, [])

  const reset = useCallback(() => {
    dispatch({ type: "RESET" })
  }, [])

  // Validation logic for each step
  const canProceed = useCallback(
    (step: number): boolean => {
      const { data } = state

      switch (step) {
        case 0: // Category Selection
          return !!data.category

        case 1: // Expense Details
          return !!(
            data.description &&
            data.description.trim().length > 0 &&
            data.date
          )

        case 2: // Amount & Payment Method
          if (!data.amount || data.amount <= 0) return false
          if (!data.method) return false
          // Orange Money requires transaction reference
          if (data.method === "orange_money" && !data.transactionRef?.trim()) {
            return false
          }
          return true

        case 3: // Receipt/Documentation (optional step, can always proceed)
          return true

        case 4: // Review
          return true

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
        setBalances,
        reset,
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

export function useExpenseWizard() {
  const context = useContext(WizardContext)
  if (context === undefined) {
    throw new Error(
      "useExpenseWizard must be used within an ExpenseWizardProvider"
    )
  }
  return context
}
