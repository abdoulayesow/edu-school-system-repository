"use client"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { CheckCircle, AlertTriangle, XCircle, AlertCircle, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import type { DecisionType } from "@/lib/types/grading"
import { getDecisionConfig } from "@/lib/grading-utils"

interface DecisionBadgeProps {
  decision: DecisionType | null
  isOverride?: boolean
  t: {
    grading: {
      admis: string
      rattrapage: string
      redouble: string
      decisionPending: string
      decisionOverridden: string
    }
  }
}

const ICON_MAP = {
  "check-circle": CheckCircle,
  "alert-triangle": AlertTriangle,
  "x-circle": XCircle,
  "alert-circle": AlertCircle,
} as const

export function DecisionBadge({ decision, isOverride, t }: DecisionBadgeProps) {
  const config = getDecisionConfig(decision)
  const Icon = ICON_MAP[config.iconName]

  // Get label - handle pending and null cases
  const getLabel = () => {
    if (!decision || decision === "pending") return t.grading.decisionPending
    return t.grading[decision]
  }
  const label = getLabel()

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium",
        config.bgColor,
        config.color
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      <span>{label}</span>
      {isOverride && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <RefreshCw className="h-3 w-3 ml-0.5" />
            </TooltipTrigger>
            <TooltipContent>
              <p>{t.grading.decisionOverridden}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  )
}
