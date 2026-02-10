"use client"

import { useState } from "react"
import { FormDialog, FormField } from "@/components/ui/form-dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { DialogFooter } from "@/components/ui/dialog"
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  BanknoteIcon,
  Smartphone,
  Building2,
} from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import { formatAmountWithCurrency } from "@/lib/format"

interface Payment {
  id: string
  amount: number
  method: "cash" | "orange_money"
  status: string
  receiptNumber: string
  transactionRef?: string | null
  recordedAt: string
  autoConfirmAt?: string | null
  enrollment?: {
    student?: {
      firstName: string
      lastName: string
      studentNumber: string
    } | null
    grade?: {
      name: string
    } | null
  } | null
  cashDeposit?: {
    bankReference: string
    depositDate: string
    bankName: string
    depositedByName: string
  } | null
}

interface PaymentReviewDialogProps {
  payment: Payment | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function PaymentReviewDialog({
  payment,
  open,
  onOpenChange,
  onSuccess,
}: PaymentReviewDialogProps) {
  const { t } = useI18n()
  const [action, setAction] = useState<"approve" | "reject" | null>(null)
  const [reviewNotes, setReviewNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const formatAmount = formatAmountWithCurrency

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Calculate time remaining for auto-confirm
  const getAutoConfirmCountdown = () => {
    if (!payment?.autoConfirmAt) return null
    const now = new Date()
    const autoConfirm = new Date(payment.autoConfirmAt)
    const diff = autoConfirm.getTime() - now.getTime()

    if (diff <= 0) return t.treasury.review.autoConfirmImminent

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 0) {
      return t.treasury.review.autoConfirmHoursMinutes
        .replace("{hours}", hours.toString())
        .replace("{minutes}", minutes.toString())
    }
    return t.treasury.review.autoConfirmMinutes.replace("{minutes}", minutes.toString())
  }

  const handleSubmit = async () => {
    if (!payment || !action) return

    if (action === "reject" && !reviewNotes.trim()) {
      setError(t.treasury.review.rejectionReasonRequired)
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`/api/payments/${payment.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          reviewNotes: reviewNotes.trim() || undefined,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || t.treasury.review.reviewFailed)
      }

      resetForm()
      onSuccess()
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.error)
    } finally {
      setIsSubmitting(false)
    }
  }

  function resetForm() {
    setAction(null)
    setReviewNotes("")
    setError(null)
  }

  function handleOpenChange(newOpen: boolean) {
    if (!newOpen) resetForm()
    onOpenChange(newOpen)
  }

  if (!payment) return null

  const autoConfirmCountdown = getAutoConfirmCountdown()

  return (
    <FormDialog
      open={open}
      onOpenChange={handleOpenChange}
      title={t.treasury.review.title}
      description={t.treasury.review.description}
      icon={CheckCircle2}
      accentColor="amber"
      maxWidth="sm:max-w-lg"
      error={error}
      footer={
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isSubmitting}>
            {t.common.cancel}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !action}
            variant={action === "reject" ? "destructive" : "default"}
          >
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {action === "approve" && t.treasury.review.confirmApprove}
            {action === "reject" && t.treasury.review.confirmReject}
            {!action && t.treasury.review.selectAction}
          </Button>
        </DialogFooter>
      }
    >
      {/* Payment Summary */}
      <div className="p-4 rounded-lg border bg-muted/30">
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="font-semibold text-lg">
              {payment.enrollment?.student?.firstName ?? "N/A"}{" "}
              {payment.enrollment?.student?.lastName ?? ""}
            </p>
            <p className="text-sm text-muted-foreground">
              {payment.enrollment?.student?.studentNumber} •{" "}
              {payment.enrollment?.grade?.name ?? "-"}
            </p>
          </div>
          <Badge
            variant="outline"
            className={
              payment.method === "cash"
                ? "text-green-600 border-green-600"
                : "text-orange-500 border-orange-500"
            }
          >
            {payment.method === "cash" ? (
              <>
                <BanknoteIcon className="h-3 w-3 mr-1" />
                {t.treasury.review.cash}
              </>
            ) : (
              <>
                <Smartphone className="h-3 w-3 mr-1" />
                {t.treasury.orangeMoney}
              </>
            )}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground">{t.treasury.amount}</p>
            <p className="font-mono font-bold text-lg">
              {formatAmount(payment.amount)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">{t.treasury.review.receipt}</p>
            <p className="font-mono">{payment.receiptNumber}</p>
          </div>
          <div>
            <p className="text-muted-foreground">{t.treasury.review.recordedDate}</p>
            <p>{formatDate(payment.recordedAt)}</p>
          </div>
          {payment.transactionRef && (
            <div>
              <p className="text-muted-foreground">{t.treasury.review.transactionRef}</p>
              <p className="font-mono">{payment.transactionRef}</p>
            </div>
          )}
        </div>
      </div>

      {/* Auto-confirm countdown for Orange Money */}
      {payment.method === "orange_money" && autoConfirmCountdown && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800">
          <Clock className="h-4 w-4 text-orange-500" />
          <span className="text-sm text-orange-700 dark:text-orange-300">
            {autoConfirmCountdown}
          </span>
        </div>
      )}

      {/* Cash Deposit Info */}
      {payment.method === "cash" && payment.cashDeposit && (
        <div className="p-3 rounded-lg border bg-blue-50 dark:bg-blue-950/20">
          <p className="font-medium text-sm mb-2 flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            {t.treasury.review.bankDepositInfo}
          </p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-muted-foreground">{t.treasury.review.reference}</p>
              <p className="font-mono">{payment.cashDeposit.bankReference}</p>
            </div>
            <div>
              <p className="text-muted-foreground">{t.treasury.review.bank}</p>
              <p>{payment.cashDeposit.bankName}</p>
            </div>
            <div>
              <p className="text-muted-foreground">{t.treasury.review.date}</p>
              <p>{formatDate(payment.cashDeposit.depositDate)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">{t.treasury.review.depositedBy}</p>
              <p>{payment.cashDeposit.depositedByName}</p>
            </div>
          </div>
        </div>
      )}

      {/* Action Selection */}
      <div className="space-y-3">
        <p className="text-sm font-medium">{t.treasury.review.action}</p>
        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant={action === "approve" ? "default" : "outline"}
            className={`h-auto py-3 ${
              action === "approve"
                ? "bg-success hover:bg-success/90 text-success-foreground"
                : "bg-transparent"
            }`}
            onClick={() => setAction("approve")}
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            {t.treasury.review.approve}
          </Button>
          <Button
            type="button"
            variant={action === "reject" ? "destructive" : "outline"}
            className={action !== "reject" ? "bg-transparent" : ""}
            onClick={() => setAction("reject")}
          >
            <XCircle className="h-4 w-4 mr-2" />
            {t.treasury.review.reject}
          </Button>
        </div>
      </div>

      {/* Notes (required for rejection) */}
      {action && (
        <FormField
          label={action === "reject" ? t.treasury.review.rejectionReason : t.treasury.review.notes}
          required={action === "reject"}
          optional={action === "approve"}
        >
          <Textarea
            placeholder={
              action === "reject"
                ? t.treasury.review.rejectionPlaceholder
                : t.treasury.review.notesPlaceholder
            }
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
            rows={3}
            className="resize-none"
          />
        </FormField>
      )}
    </FormDialog>
  )
}
