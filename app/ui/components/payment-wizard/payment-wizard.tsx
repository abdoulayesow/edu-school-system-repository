"use client"

import { useCallback, useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PaymentWizardProvider, usePaymentWizard } from "./wizard-context"
import { WizardProgress } from "./wizard-progress"
import { WizardNavigation } from "./wizard-navigation"
import { StepPaymentType } from "./steps/step-payment-type"
import { StepStudentSelection } from "./steps/step-student-selection"
import { StepPaymentSchedule } from "./steps/step-payment-schedule"
import { StepPaymentEntry } from "./steps/step-payment-entry"
import { StepReview } from "./steps/step-review"
import { StepCompletion } from "./steps/step-completion"
import { useI18n } from "@/components/i18n-provider"
import { usePermission, NoPermission } from "@/components/permission-guard"
import { AlertCircle, Wallet, Loader2 } from "lucide-react"
import { sizing } from "@/lib/design-tokens"

interface PaymentWizardProps {
  initialStudentId?: string
  onComplete?: () => void
  onCancel?: () => void
}

function WizardContent({ onComplete, onCancel }: Omit<PaymentWizardProps, "initialStudentId">) {
  const { t } = useI18n()
  const {
    state,
    updateData,
    setError,
    setSubmitting,
    nextStep,
    prevStep,
    canProceed,
  } = usePaymentWizard()
  const { currentStep, error, isSubmitting, isFullyPaid, data } = state

  // Submit payment
  const handleSubmit = useCallback(async () => {
    // Validate based on payment type
    if (data.paymentType === "tuition" && !data.enrollmentId) {
      setError("Missing enrollment information for tuition payment")
      return
    }
    if (data.paymentType === "club" && !data.clubEnrollmentId) {
      setError("Missing club enrollment information for club payment")
      return
    }
    if (!data.paymentAmount || !data.paymentMethod || !data.receiptNumber) {
      setError("Missing required payment information")
      return
    }

    setSubmitting(true)
    setError(undefined)

    try {
      // Prepare payer info for notes field
      const payerInfo = data.payer ? {
        payer: {
          type: data.payer.type,
          name: data.payer.name,
          phone: data.payer.phone,
          email: data.payer.email,
        },
        userNotes: data.notes,
      } : { userNotes: data.notes }

      const payload = {
        paymentType: data.paymentType,
        enrollmentId: data.enrollmentId,
        clubEnrollmentId: data.clubEnrollmentId,
        amount: data.paymentAmount,
        method: data.paymentMethod,
        receiptNumber: data.receiptNumber,
        transactionRef: data.transactionRef,
        notes: JSON.stringify(payerInfo),
      }

      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to record payment")
      }

      const result = await response.json()

      // Update data with payment result
      updateData({
        paymentId: result.id,
        createdAt: result.createdAt,
      })

      // Go to completion step
      nextStep()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to record payment")
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
        return <StepPaymentType />
      case 1:
        return <StepStudentSelection />
      case 2:
        return <StepPaymentSchedule />
      case 3:
        return <StepPaymentEntry />
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
      0: t?.paymentWizard?.step0 || "Payment Type",
      1: t?.paymentWizard?.step1 || "Select Student",
      2: t?.paymentWizard?.step2 || "Payment Schedule",
      3: t?.paymentWizard?.step3 || "Payment Details",
      4: t?.paymentWizard?.step4 || "Review",
      5: t?.paymentWizard?.step5 || "Complete",
    }
    return titles[currentStep as keyof typeof titles] || ""
  }

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <WizardProgress currentStep={currentStep} isFullyPaid={isFullyPaid} />

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className={sizing.icon.sm} />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Main Content Card */}
      <Card className="border shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 rounded-lg bg-primary/10">
              <Wallet className={`${sizing.icon.md} text-primary`} />
            </div>
            {getStepTitle()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderStep()}
        </CardContent>
      </Card>

      {/* Navigation */}
      {currentStep < 5 && (
        <WizardNavigation
          currentStep={currentStep}
          canProceed={canProceed(currentStep)}
          isSubmitting={isSubmitting}
          isFullyPaid={isFullyPaid}
          onBack={prevStep}
          onNext={handleNext}
          onCancel={onCancel}
        />
      )}
    </div>
  )
}

export function PaymentWizard({ initialStudentId, onComplete, onCancel }: PaymentWizardProps) {
  const { t } = useI18n()
  const { granted, loading } = usePermission("payment_recording", "create")

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
        resource="payment_recording"
        action="create"
        title={t?.permissions?.accessDenied || "Access Denied"}
        description={t?.permissions?.noPaymentPermission || "You don't have permission to record payments. Please contact your administrator if you need access."}
      />
    )
  }

  return (
    <PaymentWizardProvider initialStudentId={initialStudentId}>
      <WizardContent onComplete={onComplete} onCancel={onCancel} />
    </PaymentWizardProvider>
  )
}
