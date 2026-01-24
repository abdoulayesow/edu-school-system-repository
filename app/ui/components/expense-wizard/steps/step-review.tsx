"use client"

import { useExpenseWizard } from "../wizard-context"
import { useI18n } from "@/components/i18n-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import {
  FileText,
  Wrench,
  Zap,
  Users,
  Truck,
  Phone,
  HelpCircle,
  Banknote,
  Smartphone,
  Building2,
  FileCheck,
  Calendar,
  User,
  DollarSign,
  Receipt,
  Edit,
} from "lucide-react"

export function StepReview() {
  const { state, goToStep } = useExpenseWizard()
  const { t, locale } = useI18n()
  const { data } = state

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale === "fr" ? "fr-GN" : "en-US", {
      style: "currency",
      currency: "GNF",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-US", {
      dateStyle: "medium",
    }).format(new Date(dateString))
  }

  const getCategoryIcon = () => {
    const icons = {
      supplies: FileText,
      maintenance: Wrench,
      utilities: Zap,
      salary: Users,
      transport: Truck,
      communication: Phone,
      other: HelpCircle,
    }
    return icons[data.category || "other"]
  }

  const getCategoryLabel = () => {
    const labels = {
      supplies: t.expenses?.categories?.supplies || "Supplies",
      maintenance: t.expenses?.categories?.maintenance || "Maintenance",
      utilities: t.expenses?.categories?.utilities || "Utilities",
      salary: t.expenses?.categories?.salary || "Salary",
      transport: t.expenses?.categories?.transport || "Transport",
      communication: t.expenses?.categories?.communication || "Communication",
      other: t.expenses?.categories?.other || "Other",
    }
    return labels[data.category || "other"]
  }

  const getCategoryGradient = () => {
    const gradients = {
      supplies: "from-blue-500 to-cyan-500",
      maintenance: "from-orange-500 to-red-500",
      utilities: "from-yellow-500 to-amber-500",
      salary: "from-emerald-500 to-green-500",
      transport: "from-purple-500 to-pink-500",
      communication: "from-indigo-500 to-blue-500",
      other: "from-slate-500 to-gray-500",
    }
    return gradients[data.category || "other"]
  }

  const getMethodIcon = () => {
    const icons = {
      cash: Banknote,
      orange_money: Smartphone,
      bank_transfer: Building2,
      check: FileCheck,
      other: HelpCircle,
    }
    return icons[data.method || "cash"]
  }

  const getMethodLabel = () => {
    const labels = {
      cash: locale === "fr" ? "Espèces" : "Cash",
      orange_money: "Orange Money",
      bank_transfer: locale === "fr" ? "Virement bancaire" : "Bank Transfer",
      check: locale === "fr" ? "Chèque" : "Check",
      other: locale === "fr" ? "Autre" : "Other",
    }
    return labels[data.method || "cash"]
  }

  const CategoryIcon = getCategoryIcon()
  const MethodIcon = getMethodIcon()

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
          {t.expenseWizard?.reviewExpense || "Review Expense"}
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          {locale === "fr"
            ? "Vérifiez les détails avant de créer la dépense"
            : "Verify the details before creating the expense"}
        </p>
      </div>

      {/* Receipt-style Card */}
      <div className="max-w-2xl mx-auto">
        <div className="relative overflow-hidden rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl">
          {/* Decorative header */}
          <div className="relative h-2 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500" />

          {/* Receipt content */}
          <div className="p-8 space-y-6">
            {/* Header */}
            <div className="text-center space-y-3 pb-6 border-b-2 border-dashed border-slate-200 dark:border-slate-700">
              <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30">
                <Receipt className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {t.expenseWizard?.expenseSummary || "Expense Summary"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                {new Date().toLocaleString(locale === "fr" ? "fr-FR" : "en-US")}
              </p>
            </div>

            {/* Amount - Hero */}
            <div className="text-center py-6 rounded-xl bg-gradient-to-br from-orange-50 via-amber-50 to-orange-50 dark:from-orange-950/30 dark:via-amber-950/30 dark:to-orange-950/30 border border-orange-200 dark:border-orange-800">
              <div className="text-xs uppercase tracking-widest text-slate-600 dark:text-slate-400 mb-2 font-semibold">
                {t.expenses?.amount || "Amount"}
              </div>
              <div className="text-5xl font-bold font-mono text-orange-900 dark:text-orange-100">
                {formatCurrency(data.amount || 0)}
              </div>
            </div>

            {/* Details Grid */}
            <div className="space-y-4">
              {/* Category */}
              <div className="flex items-start justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 group hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${getCategoryGradient()}`}>
                    <CategoryIcon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                      {t.expenses?.category || "Category"}
                    </div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100">
                      {getCategoryLabel()}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => goToStep(0)}
                  className="md:opacity-0 md:group-hover:opacity-100 opacity-100 transition-opacity"
                >
                  <Edit className="w-3.5 h-3.5 mr-1.5" />
                  {t.common?.edit || "Edit"}
                </Button>
              </div>

              {/* Payment Method */}
              <div className="flex items-start justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 group hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500">
                    <MethodIcon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                      {t.expenses?.paymentMethod || "Payment Method"}
                    </div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100">
                      {getMethodLabel()}
                    </div>
                    {data.method === "orange_money" && data.transactionRef && (
                      <div className="text-xs text-slate-600 dark:text-slate-400 font-mono mt-1">
                        {data.transactionRef}
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => goToStep(2)}
                  className="md:opacity-0 md:group-hover:opacity-100 opacity-100 transition-opacity"
                >
                  <Edit className="w-3.5 h-3.5 mr-1.5" />
                  {t.common?.edit || "Edit"}
                </Button>
              </div>

              {/* Date */}
              <div className="flex items-start justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 group hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-slate-200 dark:bg-slate-700">
                    <Calendar className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                      {t.expenses?.expenseDate || "Expense Date"}
                    </div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100">
                      {data.date && formatDate(data.date)}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => goToStep(1)}
                  className="md:opacity-0 md:group-hover:opacity-100 opacity-100 transition-opacity"
                >
                  <Edit className="w-3.5 h-3.5 mr-1.5" />
                  {t.common?.edit || "Edit"}
                </Button>
              </div>

              {/* Description */}
              <div className="flex items-start justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 group hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <div className="flex-1 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-slate-200 dark:bg-slate-700">
                    <FileText className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                      {t.expenses?.description || "Description"}
                    </div>
                    <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      {data.description}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => goToStep(1)}
                  className="md:opacity-0 md:group-hover:opacity-100 opacity-100 transition-opacity flex-shrink-0"
                >
                  <Edit className="w-3.5 h-3.5 mr-1.5" />
                  {t.common?.edit || "Edit"}
                </Button>
              </div>

              {/* Vendor (if provided) */}
              {data.vendorName && (
                <div className="flex items-start justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 group hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-slate-200 dark:bg-slate-700">
                      <User className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                        {t.expenses?.vendor || "Vendor"}
                      </div>
                      <div className="font-semibold text-slate-900 dark:text-slate-100">
                        {data.vendorName}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => goToStep(1)}
                    className="md:opacity-0 md:group-hover:opacity-100 opacity-100 transition-opacity"
                  >
                    <Edit className="w-3.5 h-3.5 mr-1.5" />
                    {t.common?.edit || "Edit"}
                  </Button>
                </div>
              )}

              {/* Receipt URL (if provided) */}
              {data.receiptUrl && (
                <div className="flex items-start justify-between p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 group hover:bg-indigo-100 dark:hover:bg-indigo-950/50 transition-colors">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="p-2 rounded-lg bg-indigo-200 dark:bg-indigo-900/50">
                      <Receipt className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-indigo-600 dark:text-indigo-400 mb-1">
                        {t.expenses?.receiptUrl || "Receipt"}
                      </div>
                      <a
                        href={data.receiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-indigo-700 dark:text-indigo-300 hover:text-indigo-900 dark:hover:text-indigo-100 underline break-all"
                      >
                        {data.receiptUrl}
                      </a>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => goToStep(3)}
                    className="md:opacity-0 md:group-hover:opacity-100 opacity-100 transition-opacity flex-shrink-0"
                  >
                    <Edit className="w-3.5 h-3.5 mr-1.5" />
                    {t.common?.edit || "Edit"}
                  </Button>
                </div>
              )}

              {/* Notes (if provided) */}
              {data.notes && (
                <div className="flex items-start justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 group hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <div className="flex-1 flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-slate-200 dark:bg-slate-700">
                      <FileText className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                        {t.expenses?.notes || "Notes"}
                      </div>
                      <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {data.notes}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => goToStep(3)}
                    className="md:opacity-0 md:group-hover:opacity-100 opacity-100 transition-opacity flex-shrink-0"
                  >
                    <Edit className="w-3.5 h-3.5 mr-1.5" />
                    {t.common?.edit || "Edit"}
                  </Button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="pt-6 border-t-2 border-dashed border-slate-200 dark:border-slate-700">
              <p className="text-center text-xs text-slate-500 dark:text-slate-400">
                {locale === "fr"
                  ? "Cliquez sur 'Créer la dépense' pour enregistrer"
                  : "Click 'Create Expense' to record"}
              </p>
            </div>
          </div>

          {/* Decorative footer */}
          <div className="relative h-2 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500" />
        </div>
      </div>
    </div>
  )
}
