"use client"

import { Button } from "@/components/ui/button"
import { useEnrollmentWizard } from "./wizard-context"
import { useI18n } from "@/components/i18n-provider"
import { ArrowLeft, ArrowRight, Save, Loader2, Send } from "lucide-react"

interface WizardNavigationProps {
  onSave?: () => Promise<void>
  onSubmit?: () => Promise<void>
}

export function WizardNavigation({ onSave, onSubmit }: WizardNavigationProps) {
  const { t } = useI18n()
  const { state, nextStep, prevStep, canProceed } = useEnrollmentWizard()
  const { currentStep, isSubmitting, isDirty } = state

  const isFirstStep = currentStep === 1
  const isLastStep = currentStep === 6
  const isReviewStep = currentStep === 5
  const canGoNext = canProceed(currentStep)

  const handleNext = async () => {
    if (onSave && isDirty) {
      await onSave()
    }
    nextStep()
  }

  const handleSubmit = async () => {
    if (onSubmit) {
      await onSubmit()
    }
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t">
      <div>
        {!isFirstStep && !isLastStep && (
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={isSubmitting}
            className="bg-transparent"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t.enrollmentWizard.goBack}
          </Button>
        )}
      </div>

      <div className="flex gap-3">
        {/* Save Draft button (not on first or last step) */}
        {!isFirstStep && !isLastStep && onSave && (
          <Button
            type="button"
            variant="outline"
            onClick={onSave}
            disabled={isSubmitting || !isDirty}
            className="bg-transparent"
          >
            <Save className="h-4 w-4 mr-2" />
            {t.enrollmentWizard.saveDraft}
          </Button>
        )}

        {/* Next/Continue button */}
        {!isLastStep && !isReviewStep && (
          <Button
            type="button"
            onClick={handleNext}
            disabled={isSubmitting || !canGoNext}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : null}
            {t.enrollmentWizard.saveAndContinue}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}

        {/* Submit button (only on review step) */}
        {isReviewStep && (
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-primary"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            {t.enrollmentWizard.submitEnrollment}
          </Button>
        )}
      </div>
    </div>
  )
}
