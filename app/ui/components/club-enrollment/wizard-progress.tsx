"use client"

import React from "react"
import { Check, Users, UserPlus, DollarSign, CreditCard, FileSearch, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { sizing } from "@/lib/design-tokens"
import { useI18n } from "@/components/i18n-provider"
import type { ClubEnrollmentStep } from "@/lib/types/club-enrollment"

interface WizardProgressProps {
  currentStep: ClubEnrollmentStep
  completedSteps: ClubEnrollmentStep[]
  onStepClick?: (step: ClubEnrollmentStep) => void
  skipStep1?: boolean
}

const stepIcons = [
  { number: 1, icon: Users },
  { number: 2, icon: UserPlus },
  { number: 3, icon: DollarSign },
  { number: 4, icon: CreditCard },
  { number: 5, icon: FileSearch },
  { number: 6, icon: CheckCircle },
] as const

export function WizardProgress({
  currentStep,
  completedSteps,
  onStepClick,
  skipStep1 = false,
}: WizardProgressProps) {
  const { t } = useI18n()

  const allSteps = stepIcons.map((step) => ({
    ...step,
    label: t.clubEnrollmentWizard[`step${step.number}` as keyof typeof t.clubEnrollmentWizard] as string,
  }))

  // Filter out step 1 if club is pre-selected
  const steps = skipStep1 ? allSteps.filter((step) => step.number !== 1) : allSteps
  return (
    <>
      {/* Desktop Progress */}
      <div className="hidden md:flex items-center justify-between w-full max-w-3xl mx-auto">
        {steps.map((step, index) => {
          const isActive = currentStep === step.number
          const isCompleted = completedSteps.includes(step.number as ClubEnrollmentStep)
          const isClickable = isCompleted || isActive
          const Icon = step.icon

          return (
            <React.Fragment key={step.number}>
              {/* Step */}
              <button
                onClick={() => isClickable && onStepClick?.(step.number as ClubEnrollmentStep)}
                disabled={!isClickable}
                className={cn(
                  "flex flex-col items-center gap-2 transition-all duration-300",
                  isClickable ? "cursor-pointer" : "cursor-not-allowed opacity-50"
                )}
              >
                {/* Icon Circle */}
                <div
                  className={cn(
                    "flex items-center justify-center w-9 h-9 rounded-full border-2 transition-all duration-300",
                    isActive && "animate-scale-in",
                    isCompleted
                      ? "bg-gspn-maroon-500 border-gspn-maroon-500 text-white"
                      : isActive
                        ? "border-gspn-maroon-500 bg-gspn-maroon-50 text-gspn-maroon-600"
                        : "border-muted-foreground/30 text-muted-foreground/50"
                  )}
                >
                  {isCompleted ? (
                    <Check className={sizing.toolbarIcon} />
                  ) : (
                    <Icon className={sizing.toolbarIcon} />
                  )}
                </div>

                {/* Label */}
                <span
                  className={cn(
                    "text-xs font-medium text-center max-w-[80px]",
                    isActive || isCompleted
                      ? "text-foreground"
                      : "text-muted-foreground/50"
                  )}
                >
                  {step.label}
                </span>
              </button>

              {/* Connector Line */}
              {index < steps.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-0.5 mx-2 transition-colors duration-500 ease-out",
                  completedSteps.includes(step.number as ClubEnrollmentStep)
                    ? "bg-gspn-maroon-500"
                    : "bg-muted-foreground/20"
                )}
              />
              )}
            </React.Fragment>
          )
        })}
      </div>

      {/* Mobile Progress */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">
            {t.clubEnrollmentWizard.step} {currentStep} / {steps.length}
          </span>
          <span className="text-sm font-medium text-foreground">
            {steps.find((s) => s.number === currentStep)?.label}
          </span>
        </div>
        <div className="flex gap-1">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.includes(step.number as ClubEnrollmentStep)
            const isCurrent = currentStep === step.number

            return (
              <div
                key={step.number}
                className={cn(
                  "flex-1 h-1.5 rounded-full transition-all duration-300",
                  isCompleted
                    ? "bg-gspn-maroon-500"
                    : isCurrent
                      ? "bg-gspn-maroon-300"
                      : "bg-muted-foreground/20"
                )}
              />
            )
          })}
        </div>
      </div>
    </>
  )
}
