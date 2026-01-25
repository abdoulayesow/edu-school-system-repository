"use client"

import { useEffect, useState } from "react"
import { useExpenseWizard, PaymentMethod } from "../wizard-context"
import { useI18n } from "@/components/i18n-provider"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import {
  Banknote,
  Smartphone,
  AlertCircle,
  DollarSign,
  LockKeyhole,
} from "lucide-react"

interface MethodOption {
  value: PaymentMethod
  icon: React.ElementType
  gradient: string
  label: string
  labelFr: string
}

const methods: MethodOption[] = [
  {
    value: "cash",
    icon: Banknote,
    gradient: "from-emerald-500 to-green-500",
    label: "Cash",
    labelFr: "Espèces",
  },
  {
    value: "orange_money",
    icon: Smartphone,
    gradient: "from-orange-500 to-amber-500",
    label: "Orange Money",
    labelFr: "Orange Money",
  },
]

export function StepAmount() {
  const { state, updateData, setBalances } = useExpenseWizard()
  const { t, locale } = useI18n()
  const { data, registryBalance, mobileMoneyBalance, safeBalance, registryClosed } = state
  const [transactionRefError, setTransactionRefError] = useState<string | null>(null)
  const [isLoadingBalances, setIsLoadingBalances] = useState(true)

  const validateTransactionRef = (ref: string): boolean => {
    if (!ref || ref.trim() === "") {
      setTransactionRefError(
        locale === "fr"
          ? "Le numéro de transaction est requis pour Orange Money"
          : "Transaction number is required for Orange Money"
      )
      return false
    }

    // Orange Money transaction refs are typically: OM followed by 10-12 digits
    // Or can be other formats like MP, OTP, etc. Let's be flexible but ensure minimum length
    const cleaned = ref.trim()
    if (cleaned.length < 6) {
      setTransactionRefError(
        locale === "fr"
          ? "Le numéro de transaction semble trop court (minimum 6 caractères)"
          : "Transaction number seems too short (minimum 6 characters)"
      )
      return false
    }

    // Check for at least some alphanumeric content
    if (!/[a-zA-Z0-9]/.test(cleaned)) {
      setTransactionRefError(
        locale === "fr"
          ? "Le numéro de transaction doit contenir des lettres ou des chiffres"
          : "Transaction number must contain letters or numbers"
      )
      return false
    }

    setTransactionRefError(null)
    return true
  }

  const handleTransactionRefChange = (value: string) => {
    updateData({ transactionRef: value })
    if (data.method === "orange_money") {
      if (value.trim()) {
        validateTransactionRef(value)
      } else {
        setTransactionRefError(
          locale === "fr"
            ? "Le numéro de transaction est requis pour Orange Money"
            : "Transaction number is required for Orange Money"
        )
      }
    }
  }

  // Clear error when switching away from Orange Money
  useEffect(() => {
    if (data.method !== "orange_money") {
      setTransactionRefError(null)
    }
  }, [data.method])

  // Fetch treasury balances
  useEffect(() => {
    async function fetchBalances() {
      setIsLoadingBalances(true)
      try {
        const res = await fetch('/api/treasury/balance')
        if (res.ok) {
          const balanceData = await res.json()
          setBalances({
            registryBalance: balanceData.registryBalance ?? 0,
            mobileMoneyBalance: balanceData.mobileMoneyBalance ?? 0,
            safeBalance: balanceData.safeBalance ?? 0,
            registryClosed: (balanceData.registryBalance ?? 0) === 0,
          })
        }
      } catch (error) {
        console.error('Failed to fetch balances:', error)
      } finally {
        setIsLoadingBalances(false)
      }
    }
    fetchBalances()
  }, [setBalances])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale === "fr" ? "fr-GN" : "en-US", {
      style: "currency",
      currency: "GNF",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getCurrentBalance = () => {
    if (data.method === "cash") return registryBalance ?? 0
    if (data.method === "orange_money") return mobileMoneyBalance ?? 0
    return safeBalance ?? 0
  }

  const showBalanceWarning = () => {
    if (!data.amount || data.amount <= 0) return false
    if (data.method === "cash" || data.method === "orange_money") {
      return data.amount > getCurrentBalance()
    }
    return false
  }

  const showRegistryClosedWarning = () => {
    return data.method === "cash" && registryClosed
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
          {t.expenseWizard?.amountAndMethod || "Amount & Payment Method"}
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          {locale === "fr"
            ? "Indiquez le montant et la méthode de paiement"
            : "Specify the amount and payment method"}
        </p>
      </div>

      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Amount Input */}
        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: "100ms" }}>
          <Label htmlFor="amount" className="text-base font-semibold flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-orange-100 dark:bg-orange-900/30">
              <DollarSign className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            </div>
            {t.expenses?.amount || "Amount"} (GNF) *
          </Label>
          <div className="relative">
            <Input
              id="amount"
              type="number"
              min="0"
              step="1"
              value={data.amount || ""}
              onChange={(e) => updateData({ amount: parseFloat(e.target.value) || undefined })}
              placeholder="0"
              className="border-2 focus:border-orange-500 dark:focus:border-orange-400 transition-colors text-2xl font-bold py-6 pr-16"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 font-semibold">
              GNF
            </div>
          </div>
          {data.amount && data.amount > 0 && (
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium animate-in fade-in duration-300">
              {formatCurrency(data.amount)}
            </p>
          )}
        </div>

        {/* Payment Method Selection */}
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: "200ms" }}>
          <Label className="text-base font-semibold">
            {t.expenses?.paymentMethod || "Payment Method"} *
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {methods.map((method, index) => {
              const Icon = method.icon
              const isSelected = data.method === method.value

              return (
                <button
                  key={method.value}
                  type="button"
                  onClick={() => updateData({ method: method.value })}
                  aria-label={`Select ${locale === "fr" ? method.labelFr : method.label} payment method`}
                  aria-pressed={isSelected}
                  role="radio"
                  aria-checked={isSelected}
                  className={cn(
                    "relative overflow-hidden rounded-xl border-2 p-4 transition-all duration-300",
                    "hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2",
                    "focus-visible:ring-4 focus-visible:ring-orange-400/50 focus-visible:shadow-xl",
                    "animate-in fade-in slide-in-from-bottom duration-300",
                    isSelected
                      ? "border-orange-500 bg-orange-50 dark:bg-orange-950/30 shadow-lg scale-105"
                      : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300"
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Icon */}
                  <div className={cn(
                    "inline-flex p-2 rounded-lg mb-2 transition-all duration-300",
                    isSelected ? "scale-110" : ""
                  )}>
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${method.gradient} flex items-center justify-center`}>
                      <Icon className="w-4 h-4 text-white" strokeWidth={2.5} />
                    </div>
                  </div>

                  {/* Label */}
                  <p className={cn(
                    "text-sm font-semibold transition-colors duration-300",
                    isSelected ? "text-orange-700 dark:text-orange-300" : "text-slate-700 dark:text-slate-300"
                  )}>
                    {locale === "fr" ? method.labelFr : method.label}
                  </p>

                  {/* Selection indicator */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center animate-in zoom-in duration-200">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Transaction Reference for Orange Money */}
        {data.method === "orange_money" && (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Label htmlFor="transactionRef" className="text-base font-semibold flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              {t.expenses?.transactionReference || "Transaction Reference"} *
            </Label>
            <div className="relative">
              <Input
                id="transactionRef"
                value={data.transactionRef || ""}
                onChange={(e) => handleTransactionRefChange(e.target.value)}
                placeholder={locale === "fr" ? "Ex: OM123456789" : "Ex: OM123456789"}
                className={`border-2 transition-colors font-mono pr-10 ${
                  transactionRefError
                    ? "border-red-500 dark:border-red-400 focus:border-red-600 dark:focus:border-red-500"
                    : "focus:border-orange-500 dark:focus:border-orange-400"
                }`}
                aria-invalid={!!transactionRefError}
                aria-describedby={transactionRefError ? "transaction-ref-error" : undefined}
              />
              {transactionRefError && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400" />
                </div>
              )}
            </div>
            {transactionRefError && (
              <Alert variant="destructive" className="animate-in slide-in-from-top-2 duration-300">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription id="transaction-ref-error">{transactionRefError}</AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Balance Display and Warnings */}
        {(data.method === "cash" || data.method === "orange_money") && (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Current Balance */}
            {isLoadingBalances ? (
              <div className="rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-gradient-to-br from-slate-50 to-transparent dark:from-slate-900/50 dark:to-transparent p-4">
                <div className="flex items-center justify-between">
                  <div className="h-5 w-40 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                  <div className="h-7 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                </div>
              </div>
            ) : (
              <div className="rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-gradient-to-br from-slate-50 to-transparent dark:from-slate-900/50 dark:to-transparent p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {data.method === "cash"
                      ? locale === "fr" ? "Solde caisse actuel" : "Current registry balance"
                      : locale === "fr" ? "Solde Orange Money" : "Orange Money balance"}
                  </span>
                  <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {formatCurrency(getCurrentBalance())}
                  </span>
                </div>

                {data.amount && data.amount > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">
                        {locale === "fr" ? "Montant à déduire" : "Amount to deduct"}
                      </span>
                      <span className="font-semibold text-red-600 dark:text-red-400">
                        -{formatCurrency(data.amount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm font-bold pt-2 border-t border-slate-200 dark:border-slate-700">
                      <span className="text-slate-700 dark:text-slate-300">
                        {locale === "fr" ? "Nouveau solde" : "New balance"}
                      </span>
                      <span className={cn(
                        getCurrentBalance() - data.amount < 0
                          ? "text-red-600 dark:text-red-400"
                          : "text-emerald-600 dark:text-emerald-400"
                      )}>
                        {formatCurrency(getCurrentBalance() - data.amount)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Registry Closed Warning */}
            {showRegistryClosedWarning() && (
              <Alert variant="destructive" className="animate-in slide-in-from-top-2 duration-300">
                <LockKeyhole className="h-4 w-4" />
                <AlertDescription>
                  {locale === "fr"
                    ? "La caisse est fermée. Veuillez d'abord effectuer l'ouverture journalière pour enregistrer des dépenses en espèces."
                    : "Registry is closed. Please perform daily opening first to record cash expenses."}
                </AlertDescription>
              </Alert>
            )}

            {/* Insufficient Funds Warning */}
            {showBalanceWarning() && !showRegistryClosedWarning() && (
              <Alert variant="destructive" className="animate-in slide-in-from-top-2 duration-300">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {locale === "fr"
                    ? `Fonds insuffisants. Solde disponible: ${formatCurrency(getCurrentBalance())}`
                    : `Insufficient funds. Available balance: ${formatCurrency(getCurrentBalance())}`}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
