"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { AlertCircle } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import type { ApiPayment } from "@/lib/hooks/use-api"

interface EditPaymentDialogProps {
  payment: ApiPayment & {
    balanceInfo?: {
      tuitionFee: number
      totalPaid: number
      remainingBalance: number
    }
  }
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function EditPaymentDialog({
  payment,
  open,
  onOpenChange,
  onSuccess,
}: EditPaymentDialogProps) {
  const { t } = useI18n()

  // Form state
  const [amount, setAmount] = useState<string>("")
  const [receiptNumber, setReceiptNumber] = useState<string>("")
  const [transactionRef, setTransactionRef] = useState<string>("")
  const [notes, setNotes] = useState<string>("")

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize form when dialog opens or payment changes
  useEffect(() => {
    if (open && payment) {
      setAmount(payment.amount.toString())
      setReceiptNumber(payment.receiptNumber)
      setTransactionRef(payment.transactionRef || "")
      setNotes(payment.notes || "")
      setError(null)
    }
  }, [open, payment])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-GN", {
      style: "decimal",
      minimumFractionDigits: 0,
    }).format(amount) + " GNF"
  }

  const parseCurrencyInput = (value: string): number => {
    // Remove all non-digit characters
    const cleaned = value.replace(/[^\d]/g, "")
    return cleaned ? parseInt(cleaned, 10) : 0
  }

  const handleAmountChange = (value: string) => {
    const numericValue = parseCurrencyInput(value)
    if (numericValue === 0) {
      setAmount("")
    } else {
      // Format with thousand separators
      setAmount(new Intl.NumberFormat("fr-GN").format(numericValue))
    }
  }

  const validateForm = (): boolean => {
    setError(null)

    // Validate amount
    const numericAmount = parseCurrencyInput(amount)
    if (numericAmount <= 0) {
      setError(t.accounting.invalidAmount)
      return false
    }

    // Validate amount doesn't exceed remaining balance (for tuition)
    if (payment.paymentType === "tuition" && payment.balanceInfo) {
      const maxAllowed = payment.balanceInfo.remainingBalance + payment.amount
      if (numericAmount > maxAllowed) {
        setError(`Amount cannot exceed ${formatCurrency(maxAllowed)}`)
        return false
      }
    }

    // Validate receipt number
    if (!receiptNumber.trim()) {
      setError(t.accounting.receiptNumberRequired)
      return false
    }

    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsSubmitting(true)
    setError(null)

    try {
      const numericAmount = parseCurrencyInput(amount)

      const response = await fetch(`/api/payments/${payment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: numericAmount,
          receiptNumber: receiptNumber.trim(),
          transactionRef: transactionRef.trim() || null,
          notes: notes.trim() || null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update payment")
      }

      onOpenChange(false)
      onSuccess()
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update payment"
      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    // Reset form to original values
    setAmount(payment.amount.toString())
    setReceiptNumber(payment.receiptNumber)
    setTransactionRef(payment.transactionRef || "")
    setNotes(payment.notes || "")
    setError(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t.accounting.editPaymentTitle}</DialogTitle>
          <DialogDescription>
            {t.accounting.editPaymentDescription}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount">
              {t.accounting.amountLabel} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="amount"
              type="text"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="0"
              className="font-mono"
            />
            {payment.balanceInfo && (
              <p className="text-xs text-muted-foreground">
                Maximum: {formatCurrency(payment.balanceInfo.remainingBalance + payment.amount)}
              </p>
            )}
          </div>

          {/* Receipt Number Input */}
          <div className="space-y-2">
            <Label htmlFor="receiptNumber">
              {t.accounting.receiptNumberLabel} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="receiptNumber"
              type="text"
              value={receiptNumber}
              onChange={(e) => setReceiptNumber(e.target.value)}
              placeholder={t.accounting.receiptNumber}
            />
          </div>

          {/* Transaction Reference Input */}
          <div className="space-y-2">
            <Label htmlFor="transactionRef">{t.accounting.transactionRefLabel}</Label>
            <Input
              id="transactionRef"
              type="text"
              value={transactionRef}
              onChange={(e) => setTransactionRef(e.target.value)}
              placeholder={t.accounting.transactionRefOptional}
            />
          </div>

          {/* Notes Textarea */}
          <div className="space-y-2">
            <Label htmlFor="notes">{t.accounting.notesLabel}</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="resize-none"
              placeholder={t.accounting.paymentNotes}
            />
          </div>

          {/* Error Display */}
          {error && (
            <div className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            {t.common.cancel}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? t.common.saving : t.accounting.updatePayment}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
