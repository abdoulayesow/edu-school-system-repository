"use client"

import { useCallback, useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { EnrollmentWizardProvider, useEnrollmentWizard } from "./wizard-context"
import { WizardProgress } from "./wizard-progress"
import { WizardNavigation } from "./wizard-navigation"
import { StepGradeSelection } from "./steps/step-grade-selection"
import { StepStudentInfo } from "./steps/step-student-info"
import { StepPaymentBreakdown } from "./steps/step-payment-breakdown"
import { StepPaymentTransaction } from "./steps/step-payment-transaction"
import { StepReview } from "./steps/step-review"
import { StepConfirmation } from "./steps/step-confirmation"
import { useI18n } from "@/components/i18n-provider"
import { AlertCircle, Calendar, GraduationCap } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { sizing } from "@/lib/design-tokens"

interface EnrollmentWizardProps {
  schoolYearId?: string
  schoolYearName?: string
}

function WizardContent({ schoolYearId, schoolYearName }: EnrollmentWizardProps) {
  const { t } = useI18n()
  const { state, updateData, setError, setSubmitting, setEnrollmentId, nextStep } =
    useEnrollmentWizard()
  const { currentStep, error, isSubmitting, data } = state
  const [isSaving, setIsSaving] = useState(false)

  // Initialize school year if provided
  useEffect(() => {
    if (schoolYearId && !data.schoolYearId) {
      updateData({ schoolYearId })
    }
  }, [schoolYearId, data.schoolYearId, updateData])

  // Auto-save function
  const handleSave = useCallback(async () => {
    // Only save if we have grade AND student information (firstName and lastName)
    // This ensures we only save after step 2 (student info), not after step 1 (grade selection)
    if (!data.enrollmentId && (!data.gradeId || !data.firstName || !data.lastName)) {
      // Nothing to save yet - need both grade selection and student information
      return
    }

    setIsSaving(true)
    setError(undefined)

    try {
      const endpoint = state.enrollmentId
        ? `/api/enrollments/${state.enrollmentId}`
        : "/api/enrollments"

      const method = state.enrollmentId ? "PUT" : "POST"

      // Prepare payload - only include non-empty values for optional fields
      const payload: Record<string, unknown> = {
        schoolYearId: data.schoolYearId,
        gradeId: data.gradeId,
        currentStep,
      }

      // Only include firstName/lastName if they have values (optional for drafts)
      if (data.firstName && data.firstName.trim()) {
        payload.firstName = data.firstName
      }
      if (data.lastName && data.lastName.trim()) {
        payload.lastName = data.lastName
      }

      // Include other optional fields if they exist
      if (data.dateOfBirth) payload.dateOfBirth = data.dateOfBirth
      if (data.gender) payload.gender = data.gender
      if (data.phone) payload.phone = data.phone
      if (data.email) payload.email = data.email
      if (data.photoUrl) payload.photoUrl = data.photoUrl
      if (data.birthCertificateUrl) payload.birthCertificateUrl = data.birthCertificateUrl
      if (data.fatherName) payload.fatherName = data.fatherName
      if (data.fatherPhone) payload.fatherPhone = data.fatherPhone
      if (data.fatherEmail) payload.fatherEmail = data.fatherEmail
      if (data.motherName) payload.motherName = data.motherName
      if (data.motherPhone) payload.motherPhone = data.motherPhone
      if (data.motherEmail) payload.motherEmail = data.motherEmail
      if (data.address) payload.address = data.address
      if (data.studentId) payload.studentId = data.studentId
      if (data.adjustedTuitionFee !== undefined) payload.adjustedTuitionFee = data.adjustedTuitionFee
      if (data.adjustmentReason) payload.adjustmentReason = data.adjustmentReason

      payload.isReturningStudent = data.isReturningStudent || false

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Failed to save enrollment" }))
        const errorMessage = errorData.errors
          ? `Validation error: ${errorData.errors.map((e: { path: string[]; message: string }) => 
              `${e.path.join(".")}: ${e.message}`).join(", ")}`
          : errorData.message || "Failed to save enrollment"
        throw new Error(errorMessage)
      }

      const result = await response.json()
      if (!state.enrollmentId && result.id) {
        setEnrollmentId(result.id)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save")
    } finally {
      setIsSaving(false)
    }
  }, [data, currentStep, state.enrollmentId, setError, setEnrollmentId, updateData])

  // Submit enrollment
  const handleSubmit = useCallback(async () => {
    if (!state.enrollmentId) {
      // Save first if not saved
      await handleSave()
    }

    setSubmitting(true)
    setError(undefined)

    try {
      const response = await fetch(`/api/enrollments/${state.enrollmentId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to submit enrollment")
      }

      const result = await response.json()

      // Update data with result
      updateData({
        enrollmentNumber: result.enrollmentNumber,
        studentNumber: result.student?.studentNumber,
      })

      // Go to confirmation step
      nextStep()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit")
    } finally {
      setSubmitting(false)
    }
  }, [state.enrollmentId, handleSave, setSubmitting, setError, updateData, nextStep])

  // Render current step
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <StepGradeSelection />
      case 2:
        return <StepStudentInfo />
      case 3:
        return <StepPaymentBreakdown />
      case 4:
        return <StepPaymentTransaction />
      case 5:
        return <StepReview />
      case 6:
        return <StepConfirmation />
      default:
        return null
    }
  }

  return (
    <div className="w-full">
      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="text-2xl">{t.enrollmentWizard.title}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <Calendar className={sizing.icon.sm} />
                {schoolYearName || t.enrollmentWizard.schoolYear}
              </CardDescription>
            </div>
            {isSaving && (
              <span className="text-sm text-muted-foreground">
                {t.enrollmentWizard.draftSaved}...
              </span>
            )}
          </div>

          <WizardProgress />

          {error && (
            <Alert variant="destructive">
              <AlertCircle className={sizing.icon.sm} />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardHeader>

        <CardContent>
          {/* Selected Grade Header - shown on steps 2-6 */}
          {currentStep > 1 && data.gradeName && (
            <div className="mb-6 p-3 bg-muted/50 rounded-lg border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GraduationCap className={sizing.icon.sm + " text-primary"} />
                  <span className="text-sm font-medium">{data.gradeName}</span>
                  <Badge variant="outline" className="text-xs">
                    {data.level === "kindergarten" && t.enrollmentWizard.kindergarten}
                    {data.level === "elementary" && t.enrollmentWizard.elementary}
                    {data.level === "college" && t.enrollmentWizard.college}
                    {data.level === "high_school" && t.enrollmentWizard.highSchool}
                  </Badge>
                </div>
                <span className="text-sm text-muted-foreground font-mono">
                  {new Intl.NumberFormat("fr-GN", {
                    style: "currency",
                    currency: "GNF",
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(data.tuitionFee)}
                </span>
              </div>
            </div>
          )}

          {renderStep()}

          {currentStep < 6 && (
            <WizardNavigation onSave={handleSave} onSubmit={handleSubmit} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export function EnrollmentWizard(props: EnrollmentWizardProps) {
  return (
    <EnrollmentWizardProvider>
      <WizardContent {...props} />
    </EnrollmentWizardProvider>
  )
}
