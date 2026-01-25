"use client"

import { useExpenseWizard } from "../wizard-context"
import { useI18n } from "@/components/i18n-provider"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Eye, PlusCircle, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

interface StepCompletionProps {
  onComplete?: () => void
}

export function StepCompletion({ onComplete }: StepCompletionProps) {
  const { state, reset } = useExpenseWizard()
  const { t, locale } = useI18n()
  const { data } = state
  const router = useRouter()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale === "fr" ? "fr-GN" : "en-US", {
      style: "currency",
      currency: "GNF",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const handleViewExpense = () => {
    if (data.expenseId) {
      router.push(`/accounting/expenses/${data.expenseId}`)
    }
  }

  const handleCreateAnother = () => {
    reset()
  }

  const handleBackToExpenses = () => {
    if (onComplete) {
      onComplete()
    } else {
      router.push("/accounting/expenses")
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in zoom-in duration-700">
      {/* Success Icon */}
      <div className="flex justify-center animate-in zoom-in duration-500" style={{ animationDelay: "200ms" }}>
        <div className="relative">
          {/* Pulse rings */}
          <div className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-20" />
          <div className="absolute inset-0 rounded-full bg-emerald-500 animate-pulse opacity-30" style={{ animationDelay: "150ms" }} />

          {/* Main icon */}
          <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center shadow-2xl shadow-emerald-500/50">
            <CheckCircle2 className="w-14 h-14 text-white" strokeWidth={2.5} />
          </div>
        </div>
      </div>

      {/* Success Message */}
      <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: "300ms" }}>
        <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 dark:from-emerald-400 dark:to-green-400 bg-clip-text text-transparent">
          {t.expenseWizard?.expenseCreated || "Expense Created Successfully!"}
        </h2>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-md mx-auto">
          {locale === "fr"
            ? "Votre dépense a été enregistrée avec succès dans le système"
            : "Your expense has been successfully recorded in the system"}
        </p>
      </div>

      {/* Expense Summary Card */}
      <div className="max-w-lg mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: "400ms" }}>
        <div className="rounded-2xl border-2 border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-50 dark:from-emerald-950/30 dark:via-green-950/30 dark:to-emerald-950/30 p-6 shadow-xl">
          <div className="space-y-4">
            {/* Expense ID */}
            {data.expenseId && (
              <div className="text-center pb-4 border-b border-emerald-200 dark:border-emerald-800">
                <div className="text-xs uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-2 font-semibold">
                  {t.expenses?.expenseId || "Expense ID"}
                </div>
                <div className="text-xl font-mono font-bold text-emerald-900 dark:text-emerald-100">
                  {data.expenseId.slice(0, 8).toUpperCase()}
                </div>
              </div>
            )}

            {/* Amount */}
            <div className="text-center">
              <div className="text-xs uppercase tracking-widest text-slate-600 dark:text-slate-400 mb-2 font-semibold">
                {t.expenses?.amount || "Amount"}
              </div>
              <div className="text-4xl font-bold font-mono text-emerald-900 dark:text-emerald-100">
                {formatCurrency(data.amount || 0)}
              </div>
            </div>

            {/* Timestamp */}
            {data.createdAt && (
              <div className="text-center pt-4 border-t border-emerald-200 dark:border-emerald-800">
                <div className="text-xs text-emerald-700 dark:text-emerald-300">
                  {new Date(data.createdAt).toLocaleString(locale === "fr" ? "fr-FR" : "en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 max-w-lg mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: "500ms" }}>
        {data.expenseId && (
          <Button
            onClick={handleViewExpense}
            size="lg"
            className="gap-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-lg hover:shadow-xl transition-all font-semibold"
          >
            <Eye className="w-4 h-4" />
            {t.expenseWizard?.viewExpense || "View Expense"}
          </Button>
        )}

        <Button
          onClick={handleCreateAnother}
          size="lg"
          variant="outline"
          className="gap-2 border-2 border-orange-500 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/30 shadow-md hover:shadow-lg transition-all font-semibold"
        >
          <PlusCircle className="w-4 h-4" />
          {t.expenseWizard?.createAnother || "Create Another"}
        </Button>

        <Button
          onClick={handleBackToExpenses}
          size="lg"
          variant="ghost"
          className="gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
        >
          <ArrowLeft className="w-4 h-4" />
          {t.expenseWizard?.backToExpenses || "Back to Expenses"}
        </Button>
      </div>

      {/* Decorative elements */}
      <div className="flex justify-center pt-4 opacity-50">
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-2 h-2 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  )
}
