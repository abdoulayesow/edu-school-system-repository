"use client"

import { cn } from "@/lib/utils"
import { Check, BookOpen, User, Calculator, CreditCard, FileSearch, CheckCircle } from "lucide-react"
import { useEnrollmentWizard } from "./wizard-context"
import { useI18n } from "@/components/i18n-provider"

const stepIcons = [
  BookOpen,
  User,
  Calculator,
  CreditCard,
  FileSearch,
  CheckCircle,
]

export function WizardProgress() {
  const { t } = useI18n()
  const { state, goToStep, canProceed } = useEnrollmentWizard()
  const { currentStep, completedSteps } = state

  const steps = [
    { number: 1, label: t.enrollmentWizard.step1 },
    { number: 2, label: t.enrollmentWizard.step2 },
    { number: 3, label: t.enrollmentWizard.step3 },
    { number: 4, label: t.enrollmentWizard.step4 },
    { number: 5, label: t.enrollmentWizard.step5 },
    { number: 6, label: t.enrollmentWizard.step6 },
  ]

  const handleStepClick = (stepNumber: number) => {
    // Can only go back to completed steps or the current step
    if (stepNumber < currentStep || completedSteps.includes(stepNumber - 1)) {
      goToStep(stepNumber)
    }
  }

  return (
    <div className="w-full">
      {/* Desktop view */}
      <div className="hidden md:flex items-center justify-between">
        {steps.map((step, index) => {
          const Icon = stepIcons[index]
          const isCompleted = completedSteps.includes(step.number)
          const isCurrent = currentStep === step.number
          const isClickable =
            step.number < currentStep || completedSteps.includes(step.number - 1)

          return (
            <div key={step.number} className="flex items-center flex-1">
              <button
                type="button"
                onClick={() => handleStepClick(step.number)}
                disabled={!isClickable}
                className={cn(
                  "flex flex-col items-center gap-2 group",
                  isClickable ? "cursor-pointer" : "cursor-default"
                )}
              >
                <div
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors",
                    isCompleted
                      ? "bg-primary border-primary text-primary-foreground"
                      : isCurrent
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-muted-foreground/30 text-muted-foreground/50"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs font-medium text-center max-w-[80px]",
                    isCurrent
                      ? "text-primary"
                      : isCompleted
                        ? "text-foreground"
                        : "text-muted-foreground/50"
                  )}
                >
                  {step.label}
                </span>
              </button>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-2",
                    completedSteps.includes(step.number)
                      ? "bg-primary"
                      : "bg-muted-foreground/20"
                  )}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Mobile view */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">
            {t.enrollmentWizard.step1.split(" ")[0]} {currentStep} / {steps.length}
          </span>
          <span className="text-sm font-medium text-primary">
            {steps[currentStep - 1]?.label}
          </span>
        </div>
        <div className="flex gap-1">
          {steps.map((step) => {
            const isCompleted = completedSteps.includes(step.number)
            const isCurrent = currentStep === step.number

            return (
              <div
                key={step.number}
                className={cn(
                  "flex-1 h-2 rounded-full transition-colors",
                  isCompleted
                    ? "bg-primary"
                    : isCurrent
                      ? "bg-primary/50"
                      : "bg-muted-foreground/20"
                )}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
