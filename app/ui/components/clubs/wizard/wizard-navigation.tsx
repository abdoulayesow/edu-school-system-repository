"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"

interface WizardNavigationProps {
  currentStep: number
  totalSteps: number
  canProceed: boolean
  isSubmitting?: boolean
  onPrevious: () => void
  onNext: () => void
  onSubmit: () => void
}

export function WizardNavigation({
  currentStep,
  totalSteps,
  canProceed,
  isSubmitting = false,
  onPrevious,
  onNext,
  onSubmit,
}: WizardNavigationProps) {
  const { t } = useI18n()

  const isFirstStep = currentStep === 1
  const isLastStep = currentStep === totalSteps

  return (
    <div className="flex items-center justify-between pt-6 border-t border-border mt-6">
      <div>
        {!isFirstStep && (
          <Button
            type="button"
            variant="outline"
            onClick={onPrevious}
            disabled={isSubmitting}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            {t.clubWizard.previous}
          </Button>
        )}
      </div>

      <div>
        {isLastStep ? (
          <Button
            type="button"
            onClick={onSubmit}
            disabled={!canProceed || isSubmitting}
            className="gap-2 bg-nav-highlight hover:bg-nav-highlight/90 text-black dark:bg-gspn-gold-500 dark:hover:bg-gspn-gold-400 dark:text-nav-dark-text"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {t.clubWizard.createClub}
          </Button>
        ) : (
          <Button
            type="button"
            onClick={onNext}
            disabled={!canProceed}
            className="gap-2 bg-nav-highlight hover:bg-nav-highlight/90 text-black dark:bg-gspn-gold-500 dark:hover:bg-gspn-gold-400 dark:text-nav-dark-text"
          >
            {t.clubWizard.next}
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
