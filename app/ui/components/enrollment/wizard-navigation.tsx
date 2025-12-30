"use client"

import { Button } from "@/components/ui/button"
import { useEnrollmentWizard } from "./wizard-context"
import { useI18n } from "@/components/i18n-provider"
import { ArrowLeft, ArrowRight, Save, Loader2, Send } from "lucide-react"
import { sizing } from "@/lib/design-tokens"

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
    // Only save when moving from step 2 onwards (student info step and beyond)
    // Don't save when moving from step 1 to step 2 (grade selection to student info)
    if (onSave && isDirty && currentStep >= 2) {
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
            <ArrowLeft className={sizing.icon.sm + " mr-2"} />
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
            <Save className={sizing.icon.sm + " mr-2"} />
            {t.enrollmentWizard.saveDraft}
          </Button>
        )}

        {/* Next/Continue button */}
        {!isLastStep && !isReviewStep && (
          <Button
            type="button"
            onClick={handleNext}
            disabled={isSubmitting || !canGoNext}
            className="bg-[#e79908] hover:bg-[#d68907] text-black dark:bg-gspn-maroon-950 dark:hover:bg-gspn-maroon-900 dark:text-white"
          >
            {isSubmitting ? (
              <Loader2 className={sizing.icon.sm + " mr-2 animate-spin"} />
            ) : null}
            {t.enrollmentWizard.saveAndContinue}
            <ArrowRight className={sizing.icon.sm + " ml-2"} />
          </Button>
        )}

        {/* Submit button (only on review step) */}
        {isReviewStep && (
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-[#e79908] hover:bg-[#d68907] text-black dark:bg-gspn-maroon-950 dark:hover:bg-gspn-maroon-900 dark:text-white"
          >
            {isSubmitting ? (
              <Loader2 className={sizing.icon.sm + " mr-2 animate-spin"} />
            ) : (
              <Send className={sizing.icon.sm + " mr-2"} />
            )}
            {t.enrollmentWizard.submitEnrollment}
          </Button>
        )}
      </div>
    </div>
  )
}
