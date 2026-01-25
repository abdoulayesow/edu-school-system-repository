"use client"

import { Button } from "@/components/ui/button"
import { useI18n } from "@/components/i18n-provider"
import { ArrowLeft, ArrowRight, Loader2, X } from "lucide-react"
import { sizing } from "@/lib/design-tokens"

interface WizardNavigationProps {
  currentStep: number
  canProceed: boolean
  isSubmitting: boolean
  isFullyPaid: boolean
  onBack: () => void
  onNext: () => void
  onCancel?: () => void
}

export function WizardNavigation({
  currentStep,
  canProceed,
  isSubmitting,
  isFullyPaid,
  onBack,
  onNext,
  onCancel,
}: WizardNavigationProps) {
  const { t } = useI18n()

  // Determine button labels
  const getNextLabel = () => {
    if (currentStep === 4) {
      return t?.paymentWizard?.submit || "Submit Payment"
    }
    return t?.paymentWizard?.next || "Continue"
  }

  // On step 2 (schedule), if fully paid, don't show next button
  const showNextButton = !(currentStep === 2 && isFullyPaid)

  return (
    <div className="flex items-center justify-between pt-4 border-t">
      <div className="flex items-center gap-2">
        {/* Cancel Button */}
        {onCancel && currentStep === 1 && (
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            <X className={`${sizing.icon.sm} mr-2`} />
            {t?.paymentWizard?.cancel || "Cancel"}
          </Button>
        )}

        {/* Back Button */}
        {currentStep > 1 && (
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={isSubmitting}
          >
            <ArrowLeft className={`${sizing.icon.sm} mr-2`} />
            {t?.paymentWizard?.back || "Back"}
          </Button>
        )}
      </div>

      {/* Next/Submit Button */}
      {showNextButton && (
        <Button
          type="button"
          onClick={onNext}
          disabled={!canProceed || isSubmitting}
          className="min-w-[140px] bg-nav-highlight hover:bg-nav-highlight/90 text-black dark:bg-gspn-maroon-950 dark:hover:bg-gspn-maroon-900 dark:text-white"
        >
          {isSubmitting ? (
            <>
              <Loader2 className={`${sizing.icon.sm} mr-2 animate-spin`} />
              {currentStep === 4
                ? (t?.paymentWizard?.submitting || "Submitting...")
                : (t?.common?.loading || "Loading...")}
            </>
          ) : (
            <>
              {getNextLabel()}
              {currentStep !== 4 && <ArrowRight className={`${sizing.icon.sm} ml-2`} />}
            </>
          )}
        </Button>
      )}
    </div>
  )
}
