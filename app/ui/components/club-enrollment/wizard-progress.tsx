"use client"

import React from "react"
import { Check, Users, UserPlus, CreditCard, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { sizing } from "@/lib/design-tokens"
import type { ClubEnrollmentStep } from "@/lib/types/club-enrollment"

interface WizardProgressProps {
  currentStep: ClubEnrollmentStep
  completedSteps: ClubEnrollmentStep[]
  onStepClick?: (step: ClubEnrollmentStep) => void
}

const steps = [
  { number: 1, label: "Select Club", icon: Users },
  { number: 2, label: "Select Student", icon: UserPlus },
  { number: 3, label: "Payment & Review", icon: CreditCard },
  { number: 4, label: "Confirmation", icon: CheckCircle },
] as const

export function WizardProgress({
  currentStep,
  completedSteps,
  onStepClick,
}: WizardProgressProps) {
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
                    "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 transform",
                    isActive && "scale-110 shadow-lg",
                    isCompleted
                      ? "bg-amber-500 text-white"
                      : isActive
                      ? "bg-amber-100 text-amber-700 border-2 border-amber-500"
                      : "bg-gray-100 text-gray-400 border-2 border-gray-200"
                  )}
                >
                  {isCompleted ? (
                    <Check className={sizing.icon.sm} strokeWidth={3} />
                  ) : (
                    <Icon className={sizing.icon.sm} />
                  )}
                </div>

                {/* Label */}
                <div className="flex flex-col items-center">
                  <span
                    className={cn(
                      "text-xs font-medium transition-colors",
                      isActive
                        ? "text-amber-700"
                        : isCompleted
                        ? "text-amber-600"
                        : "text-gray-500"
                    )}
                  >
                    Step {step.number}
                  </span>
                  <span
                    className={cn(
                      "text-sm font-semibold transition-colors whitespace-nowrap",
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
                <div className="flex-1 h-[2px] mx-2 relative">
                  <div className="absolute inset-0 bg-gray-200" />
                  <div
                    className={cn(
                      "absolute inset-0 bg-amber-500 transition-all duration-500",
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
            Step {currentStep} of {steps.length}
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
