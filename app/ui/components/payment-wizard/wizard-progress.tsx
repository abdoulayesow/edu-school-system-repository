"use client"

import { useI18n } from "@/components/i18n-provider"
import { cn } from "@/lib/utils"
import { Check, User, Calendar, CreditCard, FileCheck, PartyPopper } from "lucide-react"
import { sizing } from "@/lib/design-tokens"

interface WizardProgressProps {
  currentStep: number
  isFullyPaid?: boolean
}

export function WizardProgress({ currentStep, isFullyPaid }: WizardProgressProps) {
  const { t } = useI18n()

  const steps = [
    {
      number: 1,
      label: t?.paymentWizard?.step1 || "Student",
      icon: User
    },
    {
      number: 2,
      label: t?.paymentWizard?.step2 || "Schedule",
      icon: Calendar
    },
    {
      number: 3,
      label: t?.paymentWizard?.step3 || "Payment",
      icon: CreditCard
    },
    {
      number: 4,
      label: t?.paymentWizard?.step4 || "Review",
      icon: FileCheck
    },
    {
      number: 5,
      label: t?.paymentWizard?.step5 || "Complete",
      icon: isFullyPaid ? PartyPopper : Check
    },
  ]

  return (
    <nav aria-label="Payment wizard progress">
      <ol className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.number
          const isCurrent = currentStep === step.number
          const Icon = step.icon

          return (
            <li key={step.number} className="flex-1 relative">
              <div className="flex flex-col items-center">
                {/* Step Circle */}
                <div
                  className={cn(
                    "relative z-10 flex items-center justify-center rounded-full border-2 transition-all duration-300",
                    sizing.avatar.md,
                    isCompleted && "bg-nav-highlight border-nav-highlight text-black dark:bg-gspn-gold-500 dark:border-gspn-gold-500 dark:text-gspn-maroon-950",
                    isCurrent && "border-nav-highlight bg-gspn-gold-50 text-black dark:border-gspn-gold-500 dark:bg-gspn-gold-500/30 dark:text-gspn-gold-200 ring-4 ring-nav-highlight/20 dark:ring-gspn-gold-500/20",
                    !isCompleted && !isCurrent && "border-muted bg-muted/50 text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <Check className={sizing.icon.sm} />
                  ) : (
                    <Icon className={sizing.icon.sm} />
                  )}
                </div>

                {/* Step Label */}
                <span
                  className={cn(
                    "mt-2 text-xs font-medium text-center transition-colors duration-200",
                    isCurrent && "text-black dark:text-gspn-gold-200 font-semibold",
                    isCompleted && "text-black dark:text-gspn-gold-200",
                    !isCompleted && !isCurrent && "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "absolute top-4 left-1/2 w-full h-0.5 -translate-y-1/2",
                    "transition-colors duration-300",
                    isCompleted ? "bg-nav-highlight dark:bg-gspn-gold-500" : "bg-muted"
                  )}
                  style={{ left: "calc(50% + 16px)", width: "calc(100% - 32px)" }}
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
