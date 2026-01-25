"use client"

import { useCallback, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ExpenseWizardProvider, useExpenseWizard } from "./wizard-context"
import { WizardProgress } from "./wizard-progress"
import { WizardNavigation } from "./wizard-navigation"
import { StepCategory } from "./steps/step-category"
import { StepDetails } from "./steps/step-details"
import { StepAmount } from "./steps/step-amount"
import { StepReceipt } from "./steps/step-receipt"
import { StepReview } from "./steps/step-review"
import { StepCompletion } from "./steps/step-completion"
import { useI18n } from "@/components/i18n-provider"
import { usePermission, NoPermission } from "@/components/permission-guard"
import { AlertCircle, Receipt, Loader2 } from "lucide-react"
import { sizing } from "@/lib/design-tokens"

interface ExpenseWizardProps {
  onComplete?: () => void
  onCancel?: () => void
}

function WizardContent({ onComplete, onCancel }: ExpenseWizardProps) {
  const { t } = useI18n()
  const {
    state,
    updateData,
    setError,
    setSubmitting,
    nextStep,
    prevStep,
    canProceed,
  } = useExpenseWizard()
  const { currentStep, error, isSubmitting, data } = state

  // Submit expense
  const handleSubmit = useCallback(async () => {
    // Validate required fields
    if (!data.category || !data.description || !data.date || !data.amount || !data.method) {
      setError("Missing required expense information")
      return
    }

    setSubmitting(true)
    setError(undefined)

    try {
      const payload = {
        category: data.category,
        description: data.description,
        vendorName: data.vendorName || undefined,
        date: data.date,
        amount: data.amount,
        method: data.method,
        transactionRef: data.transactionRef || undefined,
        receiptUrl: data.receiptUrl || undefined,
        notes: data.notes || undefined,
      }

      const response = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create expense")
      }

      const result = await response.json()

      // Update data with expense result
      updateData({
        expenseId: result.id,
        createdAt: result.createdAt,
      })

      // Go to completion step
      nextStep()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create expense")
    } finally {
      setSubmitting(false)
    }
  }, [data, setError, setSubmitting, updateData, nextStep])

  // Handle next step navigation
  const handleNext = useCallback(() => {
    if (currentStep === 4) {
      // Step 4 (Review) -> Submit and go to completion
      handleSubmit()
    } else {
      nextStep()
    }
  }, [currentStep, handleSubmit, nextStep])

  // Render current step
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <StepCategory />
      case 1:
        return <StepDetails />
      case 2:
        return <StepAmount />
      case 3:
        return <StepReceipt />
      case 4:
        return <StepReview />
      case 5:
        return <StepCompletion onComplete={onComplete} />
      default:
        return null
    }
  }

  // Get step title
  const getStepTitle = () => {
    const titles = {
      0: t?.expenseWizard?.step0 || "Category",
      1: t?.expenseWizard?.step1 || "Details",
      2: t?.expenseWizard?.step2 || "Amount",
      3: t?.expenseWizard?.step3 || "Receipt",
      4: t?.expenseWizard?.step4 || "Review",
      5: t?.expenseWizard?.step5 || "Complete",
    }
    return titles[currentStep as keyof typeof titles] || ""
  }

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <WizardProgress currentStep={currentStep} />

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="animate-in slide-in-from-top-2 duration-300">
          <AlertCircle className={sizing.icon.sm} />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Main Content Card */}
      <Card className="border-2 shadow-xl overflow-hidden bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-800/50">
        {currentStep < 5 && (
          <CardHeader className="pb-4 border-b bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 shadow-lg">
                <Receipt className={`${sizing.icon.md} text-white`} />
              </div>
              <span className="bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                {getStepTitle()}
              </span>
            </CardTitle>
          </CardHeader>
        )}
        <CardContent className={currentStep < 5 ? "pt-8 pb-6" : "p-8"}>
          {renderStep()}
        </CardContent>
      </Card>

      {/* Navigation */}
      {currentStep < 5 && (
        <WizardNavigation
          currentStep={currentStep}
          canProceed={canProceed(currentStep)}
          isSubmitting={isSubmitting}
          onBack={prevStep}
          onNext={handleNext}
          onCancel={onCancel}
        />
      )}
    </div>
  )
}

export function ExpenseWizard({ onComplete, onCancel }: ExpenseWizardProps) {
  const { t } = useI18n()
  const { granted, loading } = usePermission("safe_expense", "create")

  // Show loading state while checking permissions
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Show access denied message if user doesn't have permission
  if (!granted) {
    return (
      <NoPermission
        resource="safe_expense"
        action="create"
        title={t?.permissions?.accessDenied || "Access Denied"}
        description={t?.permissions?.noExpensePermission || "You don't have permission to create expenses. Please contact your administrator if you need access."}
      />
    )
  }

  return (
    <ExpenseWizardProvider>
      <WizardContent onComplete={onComplete} onCancel={onCancel} />
    </ExpenseWizardProvider>
  )
}
