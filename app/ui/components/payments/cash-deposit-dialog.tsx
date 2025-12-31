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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, BanknoteIcon, Building2, Calendar, User } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"

interface Payment {
  id: string
  amount: number
  method: "cash" | "orange_money"
  status: string
  receiptNumber: string
  recordedAt: string
  enrollment?: {
    student?: {
      firstName: string
      lastName: string
    } | null
    grade?: {
      name: string
    } | null
  } | null
}

interface CashDepositDialogProps {
  payment: Payment | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

const BANKS = [
  { value: "BICIGUI", label: "BICIGUI" },
  { value: "SGBG", label: "SGBG" },
  { value: "Ecobank", label: "Ecobank" },
  { value: "Vista Bank", label: "Vista Bank" },
  { value: "Banque Centrale", label: "Banque Centrale" },
  { value: "other", label: "Autre" },
]

export function CashDepositDialog({
  payment,
  open,
  onOpenChange,
  onSuccess,
}: CashDepositDialogProps) {
  const { t } = useI18n()
  const [bankReference, setBankReference] = useState("")
  const [depositDate, setDepositDate] = useState(new Date().toISOString().split("T")[0])
  const [bankName, setBankName] = useState("")
  const [isMe, setIsMe] = useState(true)
  const [depositorName, setDepositorName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("fr-GN").format(amount) + " GNF"
  }

  const handleSubmit = async () => {
    if (!payment || !bankReference || !depositDate || !bankName) {
      setError("Veuillez remplir tous les champs obligatoires")
      return
    }

    if (!isMe && !depositorName) {
      setError("Veuillez indiquer le nom du déposant")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`/api/payments/${payment.id}/deposit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bankReference,
          depositDate: new Date(depositDate).toISOString(),
          bankName: bankName === "other" ? "Autre" : bankName,
          depositedByName: isMe ? "Moi-même" : depositorName,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Erreur lors de l'enregistrement du dépôt")
      }

      // Reset form
      setBankReference("")
      setDepositDate(new Date().toISOString().split("T")[0])
      setBankName("")
      setIsMe(true)
      setDepositorName("")

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
      // Reset form on close
      setBankReference("")
      setDepositDate(new Date().toISOString().split("T")[0])
      setBankName("")
      setIsMe(true)
      setDepositorName("")
      setError(null)
    }
    onOpenChange(newOpen)
  }

  if (!payment) return null

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BanknoteIcon className="h-5 w-5 text-primary" />
            Enregistrer le dépôt bancaire
          </DialogTitle>
          <DialogDescription>
            Confirmer le dépôt à la banque pour ce paiement en espèces
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Payment Info Summary */}
          <div className="p-3 rounded-lg bg-muted/50 border">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">
                  {payment.enrollment?.student?.firstName ?? "N/A"}{" "}
                  {payment.enrollment?.student?.lastName ?? ""}
                </p>
                <p className="text-sm text-muted-foreground">
                  {payment.receiptNumber}
                </p>
              </div>
              <p className="font-mono font-bold text-lg">
                {formatAmount(payment.amount)}
              </p>
            </div>
          </div>

          {/* Bank Reference */}
          <div className="space-y-2">
            <Label htmlFor="bankReference" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Référence bancaire *
            </Label>
            <Input
              id="bankReference"
              placeholder="Ex: DEP-2025-001234"
              value={bankReference}
              onChange={(e) => setBankReference(e.target.value)}
            />
          </div>

          {/* Deposit Date */}
          <div className="space-y-2">
            <Label htmlFor="depositDate" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Date du dépôt *
            </Label>
            <Input
              id="depositDate"
              type="date"
              value={depositDate}
              onChange={(e) => setDepositDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
            />
          </div>

          {/* Bank Name */}
          <div className="space-y-2">
            <Label htmlFor="bankName">Banque *</Label>
            <Select value={bankName} onValueChange={setBankName}>
              <SelectTrigger id="bankName">
                <SelectValue placeholder="Sélectionner une banque" />
              </SelectTrigger>
              <SelectContent>
                {BANKS.map((bank) => (
                  <SelectItem key={bank.value} value={bank.value}>
                    {bank.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Depositor */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Déposé par
            </Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isMe"
                checked={isMe}
                onCheckedChange={(checked) => setIsMe(checked === true)}
              />
              <label
                htmlFor="isMe"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Moi-même
              </label>
            </div>
            {!isMe && (
              <Input
                placeholder="Nom du déposant"
                value={depositorName}
                onChange={(e) => setDepositorName(e.target.value)}
              />
            )}
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

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
              disabled={isSubmitting || !bankReference || !depositDate || !bankName}
            >
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Confirmer le dépôt
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
