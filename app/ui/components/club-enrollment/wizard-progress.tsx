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
}: WizardProgressProps) {
  const { t } = useI18n()

  const steps = stepIcons.map((step) => ({
    ...step,
    label: t.clubEnrollmentWizard[`step${step.number}` as keyof typeof t.clubEnrollmentWizard] as string,
  }))
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
                    "w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 transform relative",
                    isActive && "scale-110 shadow-xl shadow-gspn-gold-500/30",
                    isCompleted
                      ? "bg-gradient-to-br from-gspn-gold-500 to-gspn-gold-600 text-white shadow-lg shadow-gspn-gold-500/30"
                      : isActive
                      ? "bg-gradient-to-br from-gspn-gold-50 to-gspn-gold-100 text-gspn-gold-700 border-2 border-gspn-gold-500 shadow-md"
                      : "bg-gray-100 text-gray-400 border-2 border-gray-200"
                  )}
                >
                  {/* Animated ring on active step */}
                  {isActive && (
                    <div className="absolute inset-0 rounded-full border-2 border-gspn-gold-400 animate-ping opacity-75" />
                  )}
                  {isCompleted ? (
                    <Check className={sizing.icon.sm} strokeWidth={3} />
                  ) : (
                    <Icon className={sizing.icon.sm} />
                  )}
                </div>

                {/* Label */}
                <div className="flex flex-col items-center gap-0.5">
                  <span
                    className={cn(
                      "text-xs font-semibold uppercase tracking-wider transition-colors",
                      isActive
                        ? "text-gspn-gold-700"
                        : isCompleted
                        ? "text-gspn-gold-600"
                        : "text-gray-400"
                    )}
                  >
                    {t.clubEnrollmentWizard.step} {step.number}
                  </span>
                  <span
                    className={cn(
                      "text-sm font-bold transition-colors whitespace-nowrap",
                      isActive
                        ? "text-gray-900"
                        : isCompleted
                        ? "text-gray-700"
                        : "text-gray-400"
                    )}
                  >
                    {step.label}
                  </span>
                </div>
              </button>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 h-[3px] mx-3 relative rounded-full overflow-hidden">
                  <div className="absolute inset-0 bg-gray-200" />
                  <div
                    className={cn(
                      "absolute inset-0 bg-gradient-to-r from-gspn-gold-500 to-gspn-gold-600 transition-all duration-700 ease-out",
                      completedSteps.includes(step.number as ClubEnrollmentStep)
                        ? "w-full"
                        : "w-0"
                    )}
                  />
                </div>
              )}
            </React.Fragment>
          )
        })}
      </div>

      {/* Mobile Progress */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            {t.clubEnrollmentWizard.step} {currentStep} / {steps.length}
          </span>
          <span className="text-sm font-medium text-amber-700">
            {steps.find((s) => s.number === currentStep)?.label}
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-500 ease-out"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </>
  )
}
