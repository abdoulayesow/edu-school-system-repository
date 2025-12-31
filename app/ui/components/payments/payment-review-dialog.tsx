"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  BanknoteIcon,
  Smartphone,
  User,
  Calendar,
  Building2,
} from "lucide-react"
import { useI18n } from "@/components/i18n-provider"

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

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("fr-GN").format(amount) + " GNF"
  }

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

    if (diff <= 0) return "Auto-confirmation imminente"

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 0) {
      return `Auto-confirmation dans ${hours}h ${minutes}min`
    }
    return `Auto-confirmation dans ${minutes} minutes`
  }

  const handleSubmit = async () => {
    if (!payment || !action) return

    if (action === "reject" && !reviewNotes.trim()) {
      setError("Veuillez indiquer le motif du rejet")
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
        throw new Error(data.message || "Erreur lors de la révision du paiement")
      }

      // Reset form
      setAction(null)
      setReviewNotes("")

      onSuccess()
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setAction(null)
      setReviewNotes("")
      setError(null)
    }
    onOpenChange(newOpen)
  }

  if (!payment) return null

  const autoConfirmCountdown = getAutoConfirmCountdown()

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            Révision du paiement
          </DialogTitle>
          <DialogDescription>
            Approuver ou rejeter ce paiement après vérification
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
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
                    Espèces
                  </>
                ) : (
                  <>
                    <Smartphone className="h-3 w-3 mr-1" />
                    Orange Money
                  </>
                )}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Montant</p>
                <p className="font-mono font-bold text-lg">
                  {formatAmount(payment.amount)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Reçu</p>
                <p className="font-mono">{payment.receiptNumber}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Date d'enregistrement</p>
                <p>{formatDate(payment.recordedAt)}</p>
              </div>
              {payment.transactionRef && (
                <div>
                  <p className="text-muted-foreground">Réf. transaction</p>
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
                Informations du dépôt bancaire
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Référence</p>
                  <p className="font-mono">{payment.cashDeposit.bankReference}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Banque</p>
                  <p>{payment.cashDeposit.bankName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p>{formatDate(payment.cashDeposit.depositDate)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Déposé par</p>
                  <p>{payment.cashDeposit.depositedByName}</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Selection */}
          <div className="space-y-3">
            <Label>Action</Label>
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
                Approuver
              </Button>
              <Button
                type="button"
                variant={action === "reject" ? "destructive" : "outline"}
                className={action !== "reject" ? "bg-transparent" : ""}
                onClick={() => setAction("reject")}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Rejeter
              </Button>
            </div>
          </div>

          {/* Notes (required for rejection) */}
          {action && (
            <div className="space-y-2">
              <Label htmlFor="reviewNotes">
                {action === "reject" ? "Motif du rejet *" : "Notes (optionnel)"}
              </Label>
              <Textarea
                id="reviewNotes"
                placeholder={
                  action === "reject"
                    ? "Expliquez la raison du rejet..."
                    : "Ajouter des notes si nécessaire..."
                }
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                rows={3}
              />
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
              className="bg-transparent"
            >
              Annuler
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !action}
              variant={action === "reject" ? "destructive" : "default"}
            >
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {action === "approve" && "Confirmer l'approbation"}
              {action === "reject" && "Confirmer le rejet"}
              {!action && "Sélectionner une action"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
