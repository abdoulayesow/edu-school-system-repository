"use client"

import { useState } from "react"
import { FormDialog, FormField } from "@/components/ui/form-dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AlertTriangle, Info, RotateCcw } from "lucide-react"
import { useI18n, interpolate } from "@/components/i18n-provider"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/format"

interface ReverseTransactionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction: {
    id: string
    type: string
    amount: number
    description: string | null
    direction: "in" | "out"
    studentId?: string | null
    payerName?: string | null
  } | null
  onSuccess?: () => void
}

export function ReverseTransactionDialog({
  open,
  onOpenChange,
  transaction,
  onSuccess,
}: ReverseTransactionDialogProps) {
  const { t } = useI18n()
  const [reason, setReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [includeCorrection, setIncludeCorrection] = useState(false)
  const [correctAmount, setCorrectAmount] = useState<string>("")
  const [correctMethod, setCorrectMethod] = useState<"cash" | "orange_money" | "">("")

  const handleSubmit = async () => {
    if (!transaction) return

    if (reason.length < 10) {
      setError(t.treasury.reversalReasonTooShort)
      return
    }

    if (includeCorrection && correctAmount) {
      const amount = parseInt(correctAmount.replace(/\s/g, ""))
      if (isNaN(amount) || amount <= 0) {
        setError(t.treasury.invalidCorrectionAmount)
        return
      }
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const requestBody: {
        reason: string
        correctAmount?: number
        correctMethod?: "cash" | "orange_money"
      } = { reason }

      if (includeCorrection) {
        if (correctAmount) {
          requestBody.correctAmount = parseInt(correctAmount.replace(/\s/g, ""))
        }
        if (correctMethod) {
          requestBody.correctMethod = correctMethod
        }
      }

      const response = await fetch(`/api/treasury/transactions/${transaction.id}/reverse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || t.treasury.reversalFailed)
      }

      resetForm()
      onOpenChange(false)
      onSuccess?.()
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : t.treasury.reversalFailed
      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  function resetForm() {
    setReason("")
    setIncludeCorrection(false)
    setCorrectAmount("")
    setCorrectMethod("")
    setError(null)
  }

  const handleClose = () => {
    resetForm()
    onOpenChange(false)
  }

  const getTypeLabel = (type: string) => {
    const typeLabels: Record<string, string> = {
      student_payment: t.treasury.transactionTypes.studentPayment,
      expense_payment: t.treasury.transactionTypes.expensePayment,
      mobile_money_income: t.treasury.transactionTypes.mobileMoneyIncome,
      mobile_money_payment: t.treasury.transactionTypes.mobileMoneyPayment,
      bank_deposit: t.treasury.transactionTypes.bankDeposit,
      bank_withdrawal: t.treasury.transactionTypes.bankWithdrawal,
      adjustment: t.treasury.transactionTypes.adjustment,
      other_income: t.treasury.transactionTypes.otherIncome,
    }
    return typeLabels[type] || type
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={handleClose}
      title={t.treasury.reverseTransaction}
      description={t.treasury.reversalWarning}
      icon={RotateCcw}
      accentColor="red"
      submitLabel={t.treasury.confirmReversal}
      submitIcon={RotateCcw}
      cancelLabel={t.common.cancel}
      onSubmit={handleSubmit}
      onCancel={handleClose}
      isSubmitting={isSubmitting}
      isDisabled={!transaction || reason.length < 10}
      error={error}
    >
      {transaction && (
        <>
          {/* Original transaction details */}
          <div className={cn(
            "rounded-xl border p-4 space-y-3",
            "border-red-200 dark:border-red-800",
            "bg-gradient-to-br from-red-50/50 to-red-50/30 dark:from-red-950/20 dark:to-red-950/10"
          )}>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <p className="text-sm font-medium text-red-700 dark:text-red-300">
                {t.treasury.transactionToReverse}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">{t.treasury.type}:</span>
                <p className="font-medium">{getTypeLabel(transaction.type)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">{t.treasury.amount}:</span>
                <p className="font-bold text-red-600 dark:text-red-400">
                  {formatCurrency(transaction.amount)} GNF
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">{t.treasury.direction}:</span>
                <p className="font-medium">
                  {transaction.direction === "in" ? t.treasury.incoming : t.treasury.outgoing}
                </p>
              </div>
            </div>
            {transaction.description && (
              <div className="text-sm pt-2 border-t border-red-200 dark:border-red-800">
                <span className="text-muted-foreground">{t.common.description}:</span>
                <p className="mt-1">{transaction.description}</p>
              </div>
            )}
          </div>

          {/* Reason input */}
          <FormField label={t.treasury.reversalReason} required hint={`${interpolate(t.treasury.minimumCharacters, { count: 10 })} (${reason.length}/10)`}>
            <Textarea
              placeholder={t.treasury.reversalReasonPlaceholder}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className={cn(
                "resize-none",
                reason.length < 10 && reason.length > 0 && "border-orange-300"
              )}
            />
          </FormField>

          {/* Correction section */}
          <div className={cn(
            "space-y-3 rounded-xl border p-4",
            includeCorrection
              ? "border-blue-300 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-950/20"
              : "border-border"
          )}>
            <div className="flex items-center space-x-3">
              <Checkbox
                id="includeCorrection"
                checked={includeCorrection}
                onCheckedChange={(checked) => setIncludeCorrection(checked === true)}
              />
              <Label htmlFor="includeCorrection" className="cursor-pointer font-medium">
                {t.treasury.includeCorrection}
              </Label>
            </div>

            {includeCorrection && (
              <div className="space-y-3 pl-6 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-start gap-2 rounded-lg bg-blue-100 dark:bg-blue-900/40 p-3 text-xs text-blue-700 dark:text-blue-300">
                  <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{t.treasury.correctionExplanation}</span>
                </div>

                <FormField label={`${t.treasury.correctAmount} (GNF)`}>
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder={formatCurrency(transaction.amount)}
                    value={correctAmount}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^\d]/g, "")
                      setCorrectAmount(value ? formatCurrency(parseInt(value)) : "")
                    }}
                    className="h-12 text-center text-lg font-bold"
                  />
                </FormField>

                <FormField label={t.treasury.correctMethod}>
                  <Select
                    value={correctMethod}
                    onValueChange={(value: "cash" | "orange_money") => setCorrectMethod(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t.treasury.keepOriginalMethod} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">{t.enrollmentWizard.cash}</SelectItem>
                      <SelectItem value="orange_money">{t.enrollmentWizard.orangeMoney}</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
              </div>
            )}
          </div>
        </>
      )}
    </FormDialog>
  )
}
