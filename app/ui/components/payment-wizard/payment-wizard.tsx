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

function WizardContent({ initialStudentId, onComplete, onCancel }: PaymentWizardProps) {
  const { t } = useI18n()
  const {
    state,
    updateData,
    setError,
    setSubmitting,
    nextStep,
    prevStep,
    canProceed,
    loadStudent,
    goToStep,
    markStepComplete,
  } = usePaymentWizard()
  const { currentStep, error, isSubmitting, isFullyPaid, data } = state
  const [isAutoLoading, setIsAutoLoading] = useState(false)

  // Auto-load student when initialStudentId is provided
  useEffect(() => {
    async function autoLoadStudent() {
      if (!initialStudentId || data.enrollmentId) return // Already loaded or no initial ID

      setIsAutoLoading(true)
      try {
        // Fetch student balance data
        const response = await fetch(`/api/students/${initialStudentId}/balance`)
        if (!response.ok) {
          console.error("Failed to load student for payment wizard")
          setIsAutoLoading(false)
          return
        }

        const balanceData = await response.json()

        // Map schedule progress - preserve all fields from API
        const scheduleProgress = (balanceData.scheduleProgress || []).map((s: {
          id: string
          scheduleNumber: number
          amount: number
          paidAmount: number
          remainingAmount: number
          isPaid: boolean
          dueDate: string
          months: string[]
        }) => ({
          id: s.id,
          scheduleNumber: s.scheduleNumber,
          amount: s.amount,
          paidAmount: s.paidAmount,
          remainingAmount: s.remainingAmount,
          isPaid: s.isPaid,
          dueDate: s.dueDate,
          months: s.months || [],
        }))

        // Map previous payments
        const previousPayments = (balanceData.payments || [])
          .filter((p: { status: string }) => p.status === "confirmed")
          .map((p: {
            id: string
            amount: number
            method: "cash" | "orange_money"
            receiptNumber: string
            recordedAt: string
            recorder?: { name: string }
          }) => ({
            id: p.id,
            amount: p.amount,
            method: p.method,
            receiptNumber: p.receiptNumber,
            recordedAt: p.recordedAt,
            recorderName: p.recorder?.name,
          }))

        // Prepare enrollment payer info
        const enrollmentPayerInfo = {
          fatherName: balanceData.enrollment?.fatherName,
          fatherPhone: balanceData.enrollment?.fatherPhone,
          fatherEmail: balanceData.enrollment?.fatherEmail,
          motherName: balanceData.enrollment?.motherName,
          motherPhone: balanceData.enrollment?.motherPhone,
          motherEmail: balanceData.enrollment?.motherEmail,
          enrollingPersonType: balanceData.enrollment?.enrollingPersonType,
          enrollingPersonName: balanceData.enrollment?.enrollingPersonName,
          enrollingPersonRelation: balanceData.enrollment?.enrollingPersonRelation,
          enrollingPersonPhone: balanceData.enrollment?.enrollingPersonPhone,
          enrollingPersonEmail: balanceData.enrollment?.enrollingPersonEmail,
        }

        // Set payment type to tuition
        updateData({ paymentType: "tuition" })

        // Load student data into wizard
        loadStudent({
          studentId: initialStudentId,
          studentNumber: balanceData.student?.studentNumber,
          studentFirstName: balanceData.student?.firstName,
          studentMiddleName: balanceData.student?.middleName,
          studentLastName: balanceData.student?.lastName,
          studentPhotoUrl: balanceData.student?.photoUrl,
          studentDateOfBirth: balanceData.student?.dateOfBirth,
          studentGender: balanceData.student?.gender,
          studentPhone: balanceData.student?.phone,
          studentEmail: balanceData.student?.email,
          studentAddress: balanceData.enrollment?.address,
          enrollmentId: balanceData.enrollment?.id,
          gradeId: balanceData.enrollment?.grade?.id,
          gradeName: balanceData.enrollment?.grade?.name,
          schoolYearId: balanceData.enrollment?.schoolYear?.id,
          schoolYearName: balanceData.enrollment?.schoolYear?.name,
          tuitionFee: balanceData.balance?.tuitionFee || 0,
          totalPaid: balanceData.balance?.totalPaid || 0,
          remainingBalance: balanceData.balance?.remainingBalance || 0,
          paymentStatus: balanceData.balance?.paymentStatus || "on_time",
          expectedPaymentPercentage: balanceData.balance?.expectedPaymentPercentage || 0,
          actualPaymentPercentage: balanceData.balance?.paymentPercentage || 0,
          scheduleProgress,
          previousPayments,
          enrollmentPayerInfo,
        })

        // Mark steps 0 and 1 as complete and skip to step 2 (Payment Schedule)
        markStepComplete(0)
        markStepComplete(1)
        goToStep(2)
      } catch (err) {
        console.error("Failed to auto-load student:", err)
      } finally {
        setIsAutoLoading(false)
      }
    }

    autoLoadStudent()
  }, [initialStudentId]) // Only run once when initialStudentId is set

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

  // Show loading state while auto-loading student
  if (isAutoLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">{t?.paymentWizard?.loadingStudent || "Loading student information..."}</p>
      </div>
    )
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
      <WizardContent initialStudentId={initialStudentId} onComplete={onComplete} onCancel={onCancel} />
    </PaymentWizardProvider>
  )
}
