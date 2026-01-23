"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
import { AlertTriangle } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import type { ApiPayment } from "@/lib/hooks/use-api"

interface ReversePaymentDialogProps {
  payment: ApiPayment
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function ReversePaymentDialog({
  payment,
  open,
  onOpenChange,
  onSuccess,
}: ReversePaymentDialogProps) {
  const router = useRouter()
  const { t } = useI18n()

  // Form state
  const [reason, setReason] = useState("")

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-GN", {
      style: "decimal",
      minimumFractionDigits: 0,
    }).format(amount) + " GNF"
  }

  const getMethodLabel = (method: string) => {
    return method === "cash" ? t.enrollmentWizard.cash : t.enrollmentWizard.orangeMoney
  }

  const validateForm = (): boolean => {
    setError(null)

    if (reason.length < 10) {
      setError(t.accounting.minimumReasonLength)
      return false
    }

    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`/api/payments/${payment.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: reason.trim(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to reverse payment")
      }

      // Reset form
      setReason("")
      onOpenChange(false)
      onSuccess()

      // Redirect to payments list
      router.push("/accounting/payments")
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to reverse payment"
      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setReason("")
    setError(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            {t.accounting.reversePaymentTitle}
          </DialogTitle>
          <DialogDescription className="text-left pt-2">
            {t.accounting.reversePaymentDescription}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Warning message */}
          <div className="rounded-lg border-2 border-destructive/20 bg-destructive/5 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
              <div className="space-y-1 text-sm">
                <p className="font-medium text-destructive">
                  {t.accounting.reversePaymentWarning}
                </p>
              </div>
            </div>
          </div>

          {/* Payment details summary */}
          <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t.accounting.receiptNumber}:</span>
              <span className="font-mono font-medium">{payment.receiptNumber}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Amount:</span>
              <span className="font-medium">{formatCurrency(payment.amount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t.accounting.method}:</span>
              <span className="font-medium">{getMethodLabel(payment.method)}</span>
            </div>
            {payment.transactionRef && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t.accounting.transactionReference}:</span>
                <span className="font-mono text-xs">{payment.transactionRef}</span>
              </div>
            )}
          </div>

          {/* Reason input */}
          <div className="space-y-2">
            <Label htmlFor="reason">
              {t.accounting.reasonForReversal} <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="reason"
              placeholder={t.accounting.reasonPlaceholder}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {t.accounting.minimumReasonLength}
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
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
            variant="destructive"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? t.treasury.reversing : t.accounting.confirmReversal}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
