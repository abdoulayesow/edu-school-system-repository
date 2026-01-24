"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, Loader2, X } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import { cn } from "@/lib/utils"

interface WizardNavigationProps {
  currentStep: number
  canProceed: boolean
  isSubmitting: boolean
  onBack: () => void
  onNext: () => void
  onCancel?: () => void
}

export function WizardNavigation({
  currentStep,
  canProceed,
  isSubmitting,
  onBack,
  onNext,
  onCancel,
}: WizardNavigationProps) {
  const { t } = useI18n()

  const isFirstStep = currentStep === 0
  const isReviewStep = currentStep === 4

  return (
    <div className="flex items-center justify-between gap-4 pt-6 border-t border-slate-200 dark:border-slate-800">
      {/* Back / Cancel */}
      <div>
        {isFirstStep ? (
          onCancel && (
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              className="gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 focus-visible:ring-4 focus-visible:ring-orange-400/50"
            >
              <X className="w-4 h-4" />
              {t.common?.cancel || "Cancel"}
            </Button>
          )
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={isSubmitting}
            className="gap-2 border-2 hover:border-slate-400 dark:hover:border-slate-500 focus-visible:ring-4 focus-visible:ring-orange-400/50"
          >
            <ArrowLeft className="w-4 h-4" />
            {t.common?.back || "Back"}
          </Button>
        )}
      </div>

      {/* Next / Submit */}
      <Button
        type="button"
        onClick={onNext}
        disabled={!canProceed || isSubmitting}
        className={cn(
          "gap-2 min-w-[140px] font-semibold shadow-lg transition-all text-white",
          "focus-visible:ring-4 focus-visible:ring-orange-400/50 focus-visible:shadow-xl",
          "active:scale-[0.98] hover:shadow-xl",
          isReviewStep
            ? "bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 shadow-emerald-500/30"
            : "bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 shadow-orange-500/30"
        )}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {t.common?.submitting || "Submitting..."}
          </>
        ) : isReviewStep ? (
          <>
            {t.expenseWizard?.submit || "Create Expense"}
            <ArrowRight className="w-4 h-4" />
          </>
        ) : (
          <>
            {t.common?.next || "Next"}
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </Button>
    </div>
  )
}
