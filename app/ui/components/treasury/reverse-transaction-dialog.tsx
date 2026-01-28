"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { AlertTriangle, Info, RotateCcw, Loader2 } from "lucide-react"
import { useI18n, interpolate } from "@/components/i18n-provider"
import { cn } from "@/lib/utils"

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

// Format currency for Guinea (GNF)
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("fr-GN", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
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

  // Correction options
  const [includeCorrection, setIncludeCorrection] = useState(false)
  const [correctAmount, setCorrectAmount] = useState<string>("")
  const [correctMethod, setCorrectMethod] = useState<"cash" | "orange_money" | "">("")

  const handleSubmit = async () => {
    if (!transaction) return

    if (reason.length < 10) {
      setError(t.treasury.reversalReasonTooShort)
      return
    }

    // Validate correction amount if included
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

      // Add correction data if included
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

      // Reset form
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
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
        {/* Red accent bar for reversal */}
        <div className="h-1 bg-red-500" />

        <div className="p-6">
          <DialogHeader className="pb-4">
            <DialogTitle className="flex items-center gap-3">
              <div className={cn(
                "p-2.5 rounded-xl",
                "bg-red-100 dark:bg-red-900/30",
                "ring-2 ring-red-200 dark:ring-red-800"
              )}>
                <RotateCcw className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <span className="text-red-700 dark:text-red-300">
                {t.treasury.reverseTransaction}
              </span>
            </DialogTitle>
            <DialogDescription>
              {t.treasury.reversalWarning}
            </DialogDescription>
          </DialogHeader>

          {transaction && (
            <div className="space-y-4">
              {/* Original transaction details */}
              <div className={cn(
                "rounded-xl border p-4 space-y-3",
                "border-red-200 dark:border-red-800",
                "bg-gradient-to-br from-red-50/50 to-red-50/30 dark:from-red-950/20 dark:to-red-950/10"
              )}>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <p className="text-sm font-medium text-red-700 dark:text-red-300">
                    Transaction à annuler
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Type:</span>
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
                    <span className="text-muted-foreground">Description:</span>
                    <p className="mt-1">{transaction.description}</p>
                  </div>
                )}
              </div>

              {/* Reason input */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {t.treasury.reversalReason} <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  placeholder={t.treasury.reversalReasonPlaceholder}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  className={cn(
                    "resize-none",
                    "focus-visible:ring-red-500 focus-visible:border-red-500",
                    reason.length < 10 && reason.length > 0 && "border-orange-300"
                  )}
                />
                <p className="text-xs text-muted-foreground">
                  {interpolate(t.treasury.minimumCharacters, { count: 10 })} ({reason.length}/10)
                </p>
              </div>

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

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">{t.treasury.correctAmount} (GNF)</Label>
                      <Input
                        type="text"
                        inputMode="numeric"
                        placeholder={formatCurrency(transaction.amount)}
                        value={correctAmount}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^\d]/g, "")
                          setCorrectAmount(value ? formatCurrency(parseInt(value)) : "")
                        }}
                        className="focus-visible:ring-blue-500 h-12 text-center text-lg font-bold"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">{t.treasury.correctMethod}</Label>
                      <Select
                        value={correctMethod}
                        onValueChange={(value: "cash" | "orange_money") => setCorrectMethod(value)}
                      >
                        <SelectTrigger className="focus:ring-blue-500">
                          <SelectValue placeholder={t.treasury.keepOriginalMethod} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">{t.enrollmentWizard.cash}</SelectItem>
                          <SelectItem value="orange_money">{t.enrollmentWizard.orangeMoney}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
                  {error}
                </div>
              )}
            </div>
          )}

          <DialogFooter className="border-t pt-4 mt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              {t.common.cancel}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !transaction || reason.length < 10}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t.treasury.reversing}
                </>
              ) : (
                <>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  {t.treasury.confirmReversal}
                </>
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
