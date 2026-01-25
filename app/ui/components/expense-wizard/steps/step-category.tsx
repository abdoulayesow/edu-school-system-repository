"use client"

import { useExpenseWizard, ExpenseCategory } from "../wizard-context"
import { useI18n } from "@/components/i18n-provider"
import { cn } from "@/lib/utils"
import {
  FileText,
  Wrench,
  Zap,
  Users,
  Truck,
  Phone,
  HelpCircle,
} from "lucide-react"

interface CategoryOption {
  value: ExpenseCategory
  icon: React.ElementType
  gradient: string
  borderColor: string
  textColor: string
  bgLight: string
  bgDark: string
}

const categories: CategoryOption[] = [
  {
    value: "supplies",
    icon: FileText,
    gradient: "from-blue-500 to-cyan-500",
    borderColor: "border-blue-300 dark:border-blue-700",
    textColor: "text-blue-700 dark:text-blue-300",
    bgLight: "bg-blue-50",
    bgDark: "dark:bg-blue-950/30",
  },
  {
    value: "maintenance",
    icon: Wrench,
    gradient: "from-orange-500 to-red-500",
    borderColor: "border-orange-300 dark:border-orange-700",
    textColor: "text-orange-700 dark:text-orange-300",
    bgLight: "bg-orange-50",
    bgDark: "dark:bg-orange-950/30",
  },
  {
    value: "utilities",
    icon: Zap,
    gradient: "from-yellow-500 to-amber-500",
    borderColor: "border-yellow-300 dark:border-yellow-700",
    textColor: "text-yellow-700 dark:text-yellow-300",
    bgLight: "bg-yellow-50",
    bgDark: "dark:bg-yellow-950/30",
  },
  {
    value: "salary",
    icon: Users,
    gradient: "from-emerald-500 to-green-500",
    borderColor: "border-emerald-300 dark:border-emerald-700",
    textColor: "text-emerald-700 dark:text-emerald-300",
    bgLight: "bg-emerald-50",
    bgDark: "dark:bg-emerald-950/30",
  },
  {
    value: "transport",
    icon: Truck,
    gradient: "from-purple-500 to-pink-500",
    borderColor: "border-purple-300 dark:border-purple-700",
    textColor: "text-purple-700 dark:text-purple-300",
    bgLight: "bg-purple-50",
    bgDark: "dark:bg-purple-950/30",
  },
  {
    value: "communication",
    icon: Phone,
    gradient: "from-indigo-500 to-blue-500",
    borderColor: "border-indigo-300 dark:border-indigo-700",
    textColor: "text-indigo-700 dark:text-indigo-300",
    bgLight: "bg-indigo-50",
    bgDark: "dark:bg-indigo-950/30",
  },
  {
    value: "other",
    icon: HelpCircle,
    gradient: "from-slate-500 to-gray-500",
    borderColor: "border-slate-300 dark:border-slate-700",
    textColor: "text-slate-700 dark:text-slate-300",
    bgLight: "bg-slate-50",
    bgDark: "dark:bg-slate-950/30",
  },
]

export function StepCategory() {
  const { state, updateData } = useExpenseWizard()
  const { t, locale } = useI18n()
  const { data } = state

  const getCategoryLabel = (category: ExpenseCategory) => {
    const labels = {
      supplies: t.expenses?.categories?.supplies || "Supplies",
      maintenance: t.expenses?.categories?.maintenance || "Maintenance",
      utilities: t.expenses?.categories?.utilities || "Utilities",
      salary: t.expenses?.categories?.salary || "Salary",
      transport: t.expenses?.categories?.transport || "Transport",
      communication: t.expenses?.categories?.communication || "Communication",
      other: t.expenses?.categories?.other || "Other",
    }
    return labels[category]
  }

  const getCategoryDescription = (category: ExpenseCategory) => {
    const descriptions = {
      supplies: locale === "fr" ? "Fournitures et équipements" : "Supplies and equipment",
      maintenance: locale === "fr" ? "Réparations et entretien" : "Repairs and maintenance",
      utilities: locale === "fr" ? "Électricité, eau, internet" : "Electricity, water, internet",
      salary: locale === "fr" ? "Salaires et rémunérations" : "Salaries and compensation",
      transport: locale === "fr" ? "Transport et déplacements" : "Transport and travel",
      communication: locale === "fr" ? "Téléphone et communication" : "Phone and communication",
      other: locale === "fr" ? "Autres dépenses" : "Other expenses",
    }
    return descriptions[category]
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
          {t.expenseWizard?.selectCategory || "Select Expense Category"}
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          {locale === "fr"
            ? "Choisissez la catégorie qui correspond le mieux à cette dépense"
            : "Choose the category that best matches this expense"}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
        {categories.map((category, index) => {
          const Icon = category.icon
          const isSelected = data.category === category.value

          return (
            <button
              key={category.value}
              type="button"
              onClick={() => updateData({ category: category.value })}
              aria-label={`Select ${getCategoryLabel(category.value)} category`}
              aria-pressed={isSelected}
              role="radio"
              aria-checked={isSelected}
              className={cn(
                "group relative overflow-hidden rounded-2xl border-2 p-6 transition-all duration-300",
                "hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2",
                "focus-visible:ring-4 focus-visible:ring-orange-400/50 focus-visible:shadow-xl",
                "animate-in fade-in slide-in-from-bottom-2",
                isSelected
                  ? `${category.borderColor} ${category.bgLight} ${category.bgDark} shadow-lg scale-105`
                  : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-600"
              )}
              style={{
                animationDelay: `${index * 50}ms`,
              }}
            >
              {/* Gradient background on hover/selected */}
              <div
                className={cn(
                  "absolute inset-0 opacity-0 transition-opacity duration-300",
                  isSelected ? "opacity-10" : "group-hover:opacity-5"
                )}
              >
                <div className={`w-full h-full bg-gradient-to-br ${category.gradient}`} />
              </div>

              {/* Content */}
              <div className="relative space-y-3">
                {/* Icon */}
                <div
                  className={cn(
                    "inline-flex p-3 rounded-xl transition-all duration-300",
                    isSelected
                      ? `${category.bgLight} ${category.bgDark}`
                      : "bg-slate-100 dark:bg-slate-800 group-hover:scale-110"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-6 h-6 transition-colors duration-300",
                      isSelected
                        ? category.textColor
                        : "text-slate-600 dark:text-slate-400"
                    )}
                    strokeWidth={2.5}
                  />
                </div>

                {/* Label */}
                <div className="space-y-1 text-left">
                  <h3
                    className={cn(
                      "font-bold text-base transition-colors duration-300",
                      isSelected
                        ? category.textColor
                        : "text-slate-900 dark:text-slate-100"
                    )}
                  >
                    {getCategoryLabel(category.value)}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {getCategoryDescription(category.value)}
                  </p>
                </div>

                {/* Selection indicator */}
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${category.gradient} flex items-center justify-center shadow-lg animate-in zoom-in duration-200`}>
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
