"use client"

import { useState } from "react"
import { DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useI18n } from "@/components/i18n-provider"
import { ClubWizardData, ClubWizardProps, initialWizardData } from "./types"
import { validateStep1, validateStep2, canProceedToStep } from "./validation"
import { WizardProgress } from "./wizard-progress"
import { WizardNavigation } from "./wizard-navigation"
import { StepBasicInfo } from "./steps/step-basic-info"
import { StepDetails } from "./steps/step-details"
import { StepEligibility } from "./steps/step-eligibility"
import { StepReview } from "./steps/step-review"
import { useCreateClub } from "@/lib/hooks/use-api"
import { useToast } from "@/hooks/use-toast"
import confetti from "canvas-confetti"

export function ClubWizard({ onComplete, onCancel }: ClubWizardProps) {
  const { t } = useI18n()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(1)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [data, setData] = useState<ClubWizardData>(initialWizardData)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const createClub = useCreateClub()

  function updateData(updates: Partial<ClubWizardData>) {
    setData((prev) => ({ ...prev, ...updates }))
    // Clear related errors when data changes
    const updatedFields = Object.keys(updates)
    setErrors((prev) => {
      const newErrors = { ...prev }
      updatedFields.forEach((field) => delete newErrors[field])
      return newErrors
    })
  }

  function validateCurrentStep(): boolean {
    let validation
    switch (currentStep) {
      case 1:
        validation = validateStep1(data)
        break
      case 2:
        validation = validateStep2(data)
        break
      case 3:
        // Validate eligibility: if not all_grades, at least one grade must be selected
        if (data.eligibilityRuleType !== "all_grades" && (!data.eligibilityGradeIds || data.eligibilityGradeIds.length === 0)) {
          setErrors({ eligibility: "Please select at least one grade" })
          return false
        }
        return true
      case 4:
        return true
      default:
        return false
    }

    setErrors(validation.errors)
    return validation.isValid
  }

  function handleNext() {
    if (validateCurrentStep()) {
      // Mark current step as completed
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps((prev) => [...prev, currentStep])
      }
      // Move to next step
      setCurrentStep((prev) => Math.min(prev + 1, 4))
    }
  }

  function handlePrevious() {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  function handleStepClick(step: number) {
    setCurrentStep(step)
  }

  async function handleSubmit() {
    if (!canProceedToStep(4, data)) {
      toast({
        title: "Validation Error",
        description: "Please fix all errors before submitting",
        variant: "destructive",
      })
      return
    }

    try {
      // Prepare payload - startDate and endDate are required by API
      const payload = {
        name: data.name,
        description: data.description || undefined,
        categoryId: data.categoryId || undefined,
        leaderId: data.leaderId || undefined,
        startDate: data.startDate, // Required
        endDate: data.endDate, // Required
        capacity: data.capacity,
        status: data.status,
        monthlyFee: data.monthlyFee || 0,
        fee: data.fee,
        eligibilityRuleType: data.eligibilityRuleType,
        eligibilityGradeIds: data.eligibilityGradeIds,
      }

      await createClub.mutateAsync(payload as any)

      // Celebration confetti!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      })

      toast({
        title: "Success!",
        description: "Club created successfully",
      })

      // Call onComplete callback
      onComplete(data)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create club",
        variant: "destructive",
      })
    }
  }

  const canProceed = canProceedToStep(currentStep, data)

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <DialogHeader>
        <DialogTitle className="font-display text-2xl font-bold">
          {t.clubWizard.title}
        </DialogTitle>
      </DialogHeader>

      {/* Progress Indicator */}
      <WizardProgress
        currentStep={currentStep}
        completedSteps={completedSteps}
        onStepClick={handleStepClick}
      />

      {/* Step Content */}
      <div className="min-h-[400px]">
        {currentStep === 1 && (
          <StepBasicInfo data={data} updateData={updateData} errors={errors} />
        )}
        {currentStep === 2 && (
          <StepDetails data={data} updateData={updateData} errors={errors} />
        )}
        {currentStep === 3 && (
          <StepEligibility data={data} updateData={updateData} errors={errors} />
        )}
        {currentStep === 4 && (
          <StepReview
            data={data}
            updateData={updateData}
            errors={errors}
            onStepChange={handleStepClick}
          />
        )}
      </div>

      {/* Navigation */}
      <WizardNavigation
        currentStep={currentStep}
        totalSteps={4}
        canProceed={canProceed}
        isSubmitting={createClub.isPending}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
