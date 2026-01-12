"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { AlertTriangle, Info } from "lucide-react"
import { useI18n, interpolate } from "@/components/i18n-provider"

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
      setReason("")
      setIncludeCorrection(false)
      setCorrectAmount("")
      setCorrectMethod("")

      onOpenChange(false)
      onSuccess?.()
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : t.treasury.reversalFailed
      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setReason("")
    setIncludeCorrection(false)
    setCorrectAmount("")
    setCorrectMethod("")
    setError(null)
    onOpenChange(false)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-GN", {
      style: "decimal",
      minimumFractionDigits: 0,
    }).format(amount) + " GNF"
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            {t.treasury.reverseTransaction}
          </DialogTitle>
          <DialogDescription>
            {t.treasury.reversalWarning}
          </DialogDescription>
        </DialogHeader>

        {transaction && (
          <div className="space-y-4 py-4">
            {/* Original transaction details */}
            <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Type:</span>
                <span className="font-medium">{getTypeLabel(transaction.type)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t.treasury.amount}:</span>
                <span className="font-medium">{formatCurrency(transaction.amount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t.treasury.direction}:</span>
                <span className="font-medium">
                  {transaction.direction === "in" ? t.treasury.incoming : t.treasury.outgoing}
                </span>
              </div>
              {transaction.description && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Description:</span>
                  <p className="mt-1 text-sm">{transaction.description}</p>
                </div>
              )}
            </div>

            {/* Reason input */}
            <div className="space-y-2">
              <Label htmlFor="reason">
                {t.treasury.reversalReason} <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="reason"
                placeholder={t.treasury.reversalReasonPlaceholder}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {interpolate(t.treasury.minimumCharacters, { count: 10 })}
              </p>
            </div>

            {/* Correction section */}
            <div className="space-y-3 rounded-lg border p-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeCorrection"
                  checked={includeCorrection}
                  onCheckedChange={(checked) => setIncludeCorrection(checked === true)}
                />
                <Label htmlFor="includeCorrection" className="cursor-pointer font-normal">
                  {t.treasury.includeCorrection}
                </Label>
              </div>

              {includeCorrection && (
                <div className="space-y-3 pl-6 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-start gap-2 rounded bg-blue-50 dark:bg-blue-950/30 p-2 text-xs text-blue-700 dark:text-blue-400">
                    <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>{t.treasury.correctionExplanation}</span>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="correctAmount">{t.treasury.correctAmount}</Label>
                    <Input
                      id="correctAmount"
                      type="text"
                      placeholder={formatCurrency(transaction.amount)}
                      value={correctAmount}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^\d]/g, "")
                        setCorrectAmount(value ? parseInt(value).toLocaleString("fr-GN") : "")
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="correctMethod">{t.treasury.correctMethod}</Label>
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
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            {t.common.cancel}
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={isSubmitting || !transaction}
          >
            {isSubmitting ? t.treasury.reversing : t.treasury.confirmReversal}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
