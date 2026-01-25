"use client"

import { usePaymentWizard } from "../wizard-context"
import { useI18n } from "@/components/i18n-provider"
import { GraduationCap, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { sizing } from "@/lib/design-tokens"

/**
 * Step 0: Payment Type Selection
 *
 * Distinctive design approach:
 * - Large, tactile selection cards with elegant depth
 * - Refined color palette: deep maroon for tuition, warm terracotta for clubs
 * - Subtle animations and hover states that feel premium
 * - Clear visual hierarchy with generous spacing
 */

type PaymentType = "tuition" | "club"

interface TypeOption {
  type: PaymentType
  icon: React.ElementType
  titleKey: string
  descriptionKey: string
  gradient: string
  hoverGradient: string
  borderColor: string
  iconColor: string
  selectedRing: string
}

const paymentTypeOptions: TypeOption[] = [
  {
    type: "tuition",
    icon: GraduationCap,
    titleKey: "schoolTuition",
    descriptionKey: "schoolTuitionDesc",
    gradient: "from-rose-50 via-amber-50 to-orange-50",
    hoverGradient: "hover:from-rose-100 hover:via-amber-100 hover:to-orange-100",
    borderColor: "border-rose-200 dark:border-rose-800",
    iconColor: "text-rose-600 dark:text-rose-400",
    selectedRing: "ring-rose-500",
  },
  {
    type: "club",
    icon: Users,
    titleKey: "clubPayment",
    descriptionKey: "clubPaymentDesc",
    gradient: "from-indigo-50 via-violet-50 to-purple-50",
    hoverGradient: "hover:from-indigo-100 hover:via-violet-100 hover:to-purple-100",
    borderColor: "border-indigo-200 dark:border-indigo-800",
    iconColor: "text-indigo-600 dark:text-indigo-400",
    selectedRing: "ring-indigo-500",
  },
]

export function StepPaymentType() {
  const { t } = useI18n()
  const { state, updateData } = usePaymentWizard()
  const { data } = state

  const handleSelect = (type: PaymentType) => {
    updateData({ paymentType: type })
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-3 pb-2">
        <h3 className="text-2xl font-bold tracking-tight text-foreground">
          {t?.paymentWizard?.selectPaymentType || "Select Payment Type"}
        </h3>
        <p className="text-muted-foreground text-sm max-w-lg mx-auto leading-relaxed">
          {t?.paymentWizard?.selectPaymentTypeDesc ||
            "Choose the type of payment you want to record. This will determine the available options in the next steps."}
        </p>
      </div>

      {/* Selection Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {paymentTypeOptions.map((option) => {
          const Icon = option.icon
          const isSelected = data.paymentType === option.type

          return (
            <button
              key={option.type}
              onClick={() => handleSelect(option.type)}
              className={cn(
                // Base styles
                "relative group",
                "rounded-2xl border-2 p-8",
                "bg-gradient-to-br",
                option.gradient,
                "dark:from-slate-900 dark:via-slate-800 dark:to-slate-900",

                // Border
                option.borderColor,

                // Transitions
                "transition-all duration-300 ease-out",

                // Hover states
                option.hoverGradient,
                "hover:shadow-xl hover:scale-[1.02]",
                "hover:border-opacity-80",

                // Selected state
                isSelected && [
                  "ring-4 ring-offset-2 ring-offset-background",
                  option.selectedRing,
                  "shadow-2xl scale-[1.02]",
                  "border-transparent",
                ],

                // Focus state
                "focus:outline-none focus-visible:ring-4 focus-visible:ring-offset-2",
                "focus-visible:ring-offset-background",
                isSelected ? option.selectedRing : "focus-visible:ring-gray-400",

                // Active state
                "active:scale-[0.99]",
              )}
            >
              {/* Selection Indicator - Elegant corner badge */}
              <div
                className={cn(
                  "absolute top-4 right-4",
                  "w-6 h-6 rounded-full border-2",
                  "transition-all duration-300",
                  isSelected
                    ? cn("bg-current", option.iconColor, "border-current scale-100")
                    : "bg-white dark:bg-slate-800 border-gray-300 dark:border-gray-600 scale-90 opacity-0 group-hover:opacity-100"
                )}
              >
                {isSelected && (
                  <svg
                    className="w-full h-full text-white dark:text-slate-900 p-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>

              {/* Icon Container */}
              <div className="flex flex-col items-center text-center space-y-4">
                <div
                  className={cn(
                    "p-4 rounded-2xl",
                    "bg-white/60 dark:bg-slate-800/60",
                    "backdrop-blur-sm",
                    "transition-transform duration-300",
                    "group-hover:scale-110",
                    isSelected && "scale-110 shadow-lg"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-12 h-12",
                      option.iconColor,
                      "transition-all duration-300",
                    )}
                    strokeWidth={1.5}
                  />
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <h4 className="text-xl font-bold text-foreground tracking-tight">
                    {t?.paymentWizard?.[option.titleKey as keyof typeof t.paymentWizard] || option.titleKey}
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed px-2">
                    {t?.paymentWizard?.[option.descriptionKey as keyof typeof t.paymentWizard] || option.descriptionKey}
                  </p>
                </div>
              </div>

              {/* Subtle shimmer effect on hover */}
              <div
                className={cn(
                  "absolute inset-0 rounded-2xl opacity-0",
                  "bg-gradient-to-r from-transparent via-white/10 to-transparent",
                  "group-hover:opacity-100",
                  "transition-opacity duration-500",
                  "pointer-events-none",
                )}
                style={{
                  transform: "translateX(-100%)",
                  animation: isSelected ? "shimmer 2s infinite" : undefined,
                }}
              />
            </button>
          )
        })}
      </div>

      {/* Subtle hint text */}
      <p className="text-center text-xs text-muted-foreground/70 max-w-md mx-auto pt-4">
        {t?.paymentWizard?.paymentTypeHint ||
          "You can change this selection by clicking the other option above."}
      </p>

      {/* Shimmer animation keyframes */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  )
}
