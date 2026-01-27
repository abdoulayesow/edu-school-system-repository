"use client"

import { Check, Tag, FileText, DollarSign, Receipt, FileCheck, PartyPopper } from "lucide-react"
import { cn } from "@/lib/utils"
import { useI18n } from "@/components/i18n-provider"

interface WizardProgressProps {
  currentStep: number
}

const stepIcons = [Tag, FileText, DollarSign, Receipt, FileCheck, PartyPopper]

const steps = [
  { key: "category", iconLabel: "1", icon: Tag },
  { key: "details", iconLabel: "2", icon: FileText },
  { key: "amount", iconLabel: "3", icon: DollarSign },
  { key: "receipt", iconLabel: "4", icon: Receipt },
  { key: "review", iconLabel: "5", icon: FileCheck },
  { key: "complete", iconLabel: "6", icon: PartyPopper },
]

export function WizardProgress({ currentStep }: WizardProgressProps) {
  const { t } = useI18n()

  const stepLabels = {
    0: t.expenseWizard?.step0 || "Category",
    1: t.expenseWizard?.step1 || "Details",
    2: t.expenseWizard?.step2 || "Amount",
    3: t.expenseWizard?.step3 || "Receipt",
    4: t.expenseWizard?.step4 || "Review",
    5: t.expenseWizard?.step5 || "Complete",
  }

  return (
    <div className="w-full">
      {/* Desktop Progress Bar */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between relative">
          {/* Background line */}
          <div className="absolute top-5 left-0 right-0 h-1 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 rounded-full"
               style={{ zIndex: 0 }}
          />

          {/* Progress line */}
          <div
            className="absolute top-5 left-0 h-1 bg-gradient-to-r from-gspn-maroon-500 via-gspn-maroon-400 to-gspn-gold-500 rounded-full transition-all duration-700 ease-out shadow-lg shadow-gspn-maroon-500/30"
            style={{
              width: `${(currentStep / (steps.length - 1)) * 100}%`,
              zIndex: 1,
            }}
          />

          {/* Steps */}
          {steps.map((step, index) => {
            const isCompleted = index < currentStep
            const isCurrent = index === currentStep
            const isUpcoming = index > currentStep
            const StepIcon = step.icon

            return (
              <div
                key={step.key}
                className="relative flex flex-col items-center gap-3"
                style={{ zIndex: 2 }}
                aria-current={isCurrent ? "step" : undefined}
              >
                {/* Circle */}
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 border-2",
                    isCompleted &&
                      "bg-gradient-to-br from-gspn-maroon-500 to-gspn-maroon-600 border-gspn-maroon-400 text-white shadow-lg shadow-gspn-maroon-500/40 scale-110",
                    isCurrent &&
                      "bg-white dark:bg-slate-900 border-gspn-gold-500 text-gspn-maroon-600 dark:text-gspn-maroon-400 shadow-xl shadow-gspn-gold-500/30 scale-125 ring-4 ring-gspn-gold-500/20",
                    isUpcoming &&
                      "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" strokeWidth={3} />
                  ) : (
                    <StepIcon className="w-5 h-5" strokeWidth={2} />
                  )}
                </div>

                {/* Label */}
                <div
                  className={cn(
                    "text-xs font-semibold transition-all duration-300 absolute top-14 whitespace-nowrap",
                    isCurrent && "text-gspn-maroon-600 dark:text-gspn-maroon-400 scale-110",
                    isCompleted && "text-slate-700 dark:text-slate-300",
                    isUpcoming && "text-slate-500 dark:text-slate-400"
                  )}
                >
                  {stepLabels[index as keyof typeof stepLabels]}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Mobile Progress Bar */}
      <div className="md:hidden space-y-3">
        {/* Progress indicator */}
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {stepLabels[currentStep as keyof typeof stepLabels]}
          </span>
          <span className="text-slate-500 dark:text-slate-400 font-mono">
            {currentStep + 1} / {steps.length}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-gspn-maroon-500 to-gspn-gold-500 transition-all duration-700 ease-out rounded-full shadow-md"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Step dots */}
        <div className="flex gap-1.5 justify-center">
          {steps.map((_, index) => (
            <div
              key={index}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                index <= currentStep
                  ? "w-8 bg-gradient-to-r from-gspn-maroon-500 to-gspn-gold-500"
                  : "w-1.5 bg-slate-300 dark:bg-slate-700"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
