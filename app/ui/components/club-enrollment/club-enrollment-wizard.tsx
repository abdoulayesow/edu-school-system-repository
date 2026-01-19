"use client"

import React, { useCallback, useEffect, useState } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { sizing } from "@/lib/design-tokens"
import { useI18n } from "@/components/i18n-provider"
import { useRouter, useSearchParams } from "next/navigation"
import { useClubEnrollmentWizard } from "./wizard-context"
import { WizardProgress } from "./wizard-progress"
import { WizardNavigation } from "./wizard-navigation"
import { StepClubSelection } from "./steps/step-club-selection"
import { StepStudentSelection } from "./steps/step-student-selection"
import { StepPaymentReview } from "./steps/step-payment-review"
import { StepConfirmation } from "./steps/step-confirmation"
import { ConfirmationModal } from "./confirmation-modal"

export function ClubEnrollmentWizard() {
  const { t } = useI18n()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const {
    state,
    nextStep,
    prevStep,
    goToStep,
    completeStep,
    setClub,
    setEnrollmentId,
    setEnrollmentNumber,
    setError,
    clearError,
    setSubmitting,
    canProceed,
  } = useClubEnrollmentWizard()

  // Load pre-selected club from URL parameter
  useEffect(() => {
    const clubId = searchParams.get("clubId")
    if (clubId && !state.data.clubId && state.currentStep === 1) {
      // Fetch club details and pre-populate
      const loadClub = async () => {
        try {
          const res = await fetch(`/api/clubs/${clubId}`)
          if (!res.ok) return
          const club = await res.json()

          setClub({
            clubId: club.id,
            clubName: club.name,
            clubNameFr: club.nameFr,
            categoryName: club.category?.name || null,
            leaderName: club.leader?.name || null,
            enrollmentFee: club.fee,
            monthlyFee: club.monthlyFee,
            startDate: club.startDate,
            endDate: club.endDate,
            currentEnrollments: club._count?.enrollments || 0,
            capacity: club.capacity,
          })

          // Auto-complete step 1 and move to step 2
          completeStep(1)
          goToStep(2)
        } catch (err) {
          // Silently fail - user can select club manually
        }
      }

      loadClub()
    }
  }, [searchParams, state.data.clubId, state.currentStep, setClub, completeStep, goToStep])

  // Handle navigation to next step
  const handleNext = useCallback(async () => {
    // Save as draft when moving from step 2 to 3
    if (state.currentStep === 2 && state.data.studentId) {
      await handleSave()
    }
    nextStep()
  }, [state.currentStep, state.data.studentId, nextStep])

  // Save enrollment as draft
  const handleSave = useCallback(async () => {
    if (!state.data.clubId || !state.data.studentId) {
      setError("Club and student must be selected before saving")
      return
    }

    try {
      setSubmitting(true)
      clearError()

      const payload = {
        clubId: state.data.clubId,
        studentId: state.data.studentId,
        status: "draft",
      }

      let res
      if (state.data.enrollmentId) {
        // Update existing draft
        res = await fetch(`/api/club-enrollments/${state.data.enrollmentId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      } else {
        // Create new draft
        res = await fetch("/api/club-enrollments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      }

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || "Failed to save enrollment")
      }

      const data = await res.json()
      setEnrollmentId(data.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save enrollment")
    } finally {
      setSubmitting(false)
    }
  }, [state.data, state.currentStep, setEnrollmentId, setError, clearError, setSubmitting])

  // Show confirmation modal before submitting
  const handleShowConfirmation = useCallback(async () => {
    setShowConfirmModal(true)
  }, [])

  // Submit final enrollment (called from confirmation modal)
  const handleSubmit = useCallback(async () => {
    if (!state.data.enrollmentId && !state.data.clubId) {
      setError("Missing enrollment data")
      setShowConfirmModal(false)
      return
    }

    try {
      setSubmitting(true)
      clearError()

      const payload: any = {
        clubId: state.data.clubId,
        studentId: state.data.studentId,
        status: "active",
      }

      // Include payment data if provided
      if (state.data.paymentAmount && state.data.paymentAmount > 0) {
        payload.payment = {
          amount: state.data.paymentAmount,
          method: state.data.paymentMethod,
          receiptNumber: state.data.receiptNumber,
          transactionRef: state.data.transactionRef,
        }
      }

      // Include notes if provided
      if (state.data.notes) {
        payload.notes = state.data.notes
      }

      let res
      if (state.data.enrollmentId) {
        // Update and submit existing draft
        res = await fetch(`/api/club-enrollments/${state.data.enrollmentId}/submit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      } else {
        // Create and submit new enrollment
        res = await fetch("/api/club-enrollments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      }

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || "Failed to submit enrollment")
      }

      const data = await res.json()
      setEnrollmentNumber(data.enrollmentNumber, data.status)
      setShowConfirmModal(false)
      nextStep()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit enrollment")
      setShowConfirmModal(false)
    } finally {
      setSubmitting(false)
    }
  }, [state.data, setEnrollmentNumber, setError, clearError, setSubmitting, nextStep])

  // Render current step
  const renderStep = () => {
    switch (state.currentStep) {
      case 1:
        return <StepClubSelection />
      case 2:
        return <StepStudentSelection />
      case 3:
        return <StepPaymentReview />
      case 4:
        return <StepConfirmation />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-amber-50/30 to-orange-50/20 py-8">
      <div className="container max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/clubs")}
            className="gap-2 mb-4 hover:bg-white/50"
          >
            <ArrowLeft className={sizing.icon.sm} />
            Back to Clubs
          </Button>

          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              Club Enrollment
            </h1>
            <p className="text-gray-600">Enroll a student in an extracurricular club</p>
          </div>
        </div>

        {/* Wizard Card */}
        <Card className="shadow-xl border-2 border-gray-200/50 backdrop-blur-sm bg-white/95">
          <CardHeader className="space-y-6 pb-6">
            {/* Progress Indicator */}
            <WizardProgress
              currentStep={state.currentStep}
              completedSteps={state.completedSteps}
              onStepClick={goToStep}
            />

            {/* Error Alert */}
            {state.error && (
              <Alert variant="destructive" className="animate-in slide-in-from-top-2">
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Step Content */}
            <div className="min-h-[400px]">{renderStep()}</div>

            {/* Navigation (hide on confirmation step) */}
            {state.currentStep < 4 && (
              <WizardNavigation
                currentStep={state.currentStep}
                canProceed={canProceed()}
                isSubmitting={state.isSubmitting}
                onPrevious={prevStep}
                onNext={handleNext}
                onSave={handleSave}
                onSubmit={handleShowConfirmation}
                isDirty={state.isDirty}
              />
            )}
          </CardContent>
        </Card>

        {/* Confirmation Modal */}
        <ConfirmationModal
          open={showConfirmModal}
          onOpenChange={setShowConfirmModal}
          data={state.data}
          isSubmitting={state.isSubmitting}
          onConfirm={handleSubmit}
        />
      </div>
    </div>
  )
}
