"use client"

import { Button } from "@/components/ui/button"
import { CheckCircle2, X, Sparkles, ChevronRight } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import { componentClasses } from "@/lib/design-tokens"
import { cn } from "@/lib/utils"
import type { EvaluationType } from "@/lib/types/grading"

interface SuccessBannerProps {
  onDismiss: () => void
  onQuickReentry: () => void
  nextEvaluationType: EvaluationType
  getEvaluationTypeLabel: (type: EvaluationType) => string
}

export function SuccessBanner({
  onDismiss,
  onQuickReentry,
  nextEvaluationType,
  getEvaluationTypeLabel,
}: SuccessBannerProps) {
  const { t } = useI18n()

  return (
    <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <span className="text-green-700 dark:text-green-300 font-medium">
            {t.grading.gradesSaved}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onDismiss}
            className="text-green-700 border-green-300 hover:bg-green-100"
          >
            <X className="h-4 w-4" />
          </Button>
          <Button onClick={onQuickReentry} className={cn(componentClasses.primaryActionButton, "gap-2")}>
            <Sparkles className="h-4 w-4" />
            {t.grading.quickReentry}
            <ChevronRight className="h-4 w-4" />
            <span className="text-xs opacity-80">{getEvaluationTypeLabel(nextEvaluationType)}</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
