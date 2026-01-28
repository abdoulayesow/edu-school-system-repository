"use client"

import { EnrollmentWizard } from "@/components/enrollment/enrollment-wizard"
import { useI18n } from "@/components/i18n-provider"
import { PageContainer } from "@/components/layout/PageContainer"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import type { EnrollmentWizardState } from "@/lib/enrollment/types"

export default function NewEnrollmentPage() {
  const { t } = useI18n()
  const searchParams = useSearchParams()
  const draftId = searchParams.get("draft")
  const stepParam = searchParams.get("step")
  const [initialState, setInitialState] = useState<EnrollmentWizardState | undefined>(undefined)
  const [loading, setLoading] = useState(!!draftId)

  useEffect(() => {
    if (!draftId) {
      setLoading(false)
      return
    }

    // Load draft enrollment
    async function loadDraft() {
      try {
        const response = await fetch(`/api/enrollments/${draftId}`)
        if (!response.ok) throw new Error("Failed to load draft")

        const enrollment = await response.json()

        // Determine which step to start from
        const startStep = stepParam
          ? parseInt(stepParam, 10)
          : enrollment.currentStep || 1

        // Determine which steps are complete based on enrollment data
        const completedSteps: number[] = []

        // Step 1 (Grade Selection): Complete if gradeId exists
        if (enrollment.gradeId) {
          completedSteps.push(1)
        }

        // Step 2 (Student Info): Complete if firstName, lastName, dateOfBirth exist
        if (enrollment.firstName && enrollment.lastName && enrollment.dateOfBirth) {
          completedSteps.push(2)
        }

        // Step 3 (Payment Breakdown): Complete if paymentSchedules exist
        if (enrollment.paymentSchedules && enrollment.paymentSchedules.length > 0) {
          completedSteps.push(3)
        }

        // Step 4 (Payment Transaction): Always complete (payment is optional)
        // Only mark as complete if we have basic enrollment data
        if (enrollment.gradeId && enrollment.firstName) {
          completedSteps.push(4)
        }

        // Convert API response to wizard state
        const wizardState: EnrollmentWizardState = {
          currentStep: startStep,
          completedSteps,
          isDirty: false,
          isSubmitting: false,
          enrollmentId: enrollment.id,
          error: undefined,
          data: {
            schoolYearId: enrollment.schoolYearId,
            gradeId: enrollment.gradeId,
            gradeName: enrollment.grade?.name || "",
            level: enrollment.grade?.level || "elementary",
            gradeOrder: enrollment.grade?.order || 0,
            tuitionFee: enrollment.adjustedTuitionFee || enrollment.originalTuitionFee || 0,
            originalTuitionFee: enrollment.originalTuitionFee || 0,
            adjustedTuitionFee: enrollment.adjustedTuitionFee,
            adjustmentReason: enrollment.adjustmentReason || undefined,
            isReturningStudent: !!enrollment.studentId,
            studentId: enrollment.studentId || undefined,
            firstName: enrollment.firstName || "",
            middleName: enrollment.middleName || undefined,
            lastName: enrollment.lastName || "",
            dateOfBirth: enrollment.dateOfBirth ? new Date(enrollment.dateOfBirth).toISOString().split("T")[0] : undefined,
            gender: enrollment.gender || undefined,
            phone: enrollment.phone || undefined,
            email: enrollment.email || undefined,
            photoUrl: enrollment.photoUrl || undefined,
            birthCertificateUrl: enrollment.birthCertificateUrl || undefined,
            fatherName: enrollment.fatherName || undefined,
            fatherPhone: enrollment.fatherPhone || undefined,
            fatherEmail: enrollment.fatherEmail || undefined,
            motherName: enrollment.motherName || undefined,
            motherPhone: enrollment.motherPhone || undefined,
            motherEmail: enrollment.motherEmail || undefined,
            address: enrollment.address || undefined,
            enrollingPersonType: enrollment.enrollingPersonType || undefined,
            enrollingPersonName: enrollment.enrollingPersonName || undefined,
            enrollingPersonRelation: enrollment.enrollingPersonRelation || undefined,
            enrollingPersonPhone: enrollment.enrollingPersonPhone || undefined,
            enrollingPersonEmail: enrollment.enrollingPersonEmail || undefined,
            paymentSchedules: enrollment.paymentSchedules || [],
            notes: enrollment.notes?.map((n: any) => ({ title: n.title, content: n.content })) || [],
            paymentMade: false,
            paymentAmount: undefined,
            paymentMethod: "cash",
            receiptNumber: undefined,
            transactionRef: undefined,
            receiptImageUrl: undefined,
          },
        }

        setInitialState(wizardState)
      } catch (error) {
        console.error("Failed to load draft:", error)
      } finally {
        setLoading(false)
      }
    }

    loadDraft()
  }, [draftId, stepParam])

  if (loading) {
    return (
      <PageContainer maxWidth="full">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gspn-maroon-500" />
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer maxWidth="full">
      {/* Header */}
      <div className="relative mb-6 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="h-1 bg-gspn-maroon-500" />
        <div className="p-6">
          <Button variant="ghost" asChild className="mb-4 -ml-2">
            <Link href="/students/enrollments" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              {t.common.back}
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gspn-maroon-500/10 rounded-xl">
              <ArrowLeft className="h-6 w-6 text-gspn-maroon-500 rotate-180" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {t.enrollmentWizard.title}
              </h1>
              <p className="text-muted-foreground mt-1">
                {t.enrollmentWizard.subtitle}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Wizard */}
      <EnrollmentWizard initialState={initialState} />
    </PageContainer>
  )
}
