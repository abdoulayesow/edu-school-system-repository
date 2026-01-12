"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Receipt } from "lucide-react"

interface MobileMoneyFeeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentBalance: number
  onSuccess?: () => void
}

export function MobileMoneyFeeDialog({
  open,
  onOpenChange,
  currentBalance,
  onSuccess,
}: MobileMoneyFeeDialogProps) {
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    const parsedAmount = parseInt(amount.replace(/\s/g, ""), 10)

    if (!parsedAmount || parsedAmount <= 0) {
      setError("Montant invalide")
      return
    }

    if (parsedAmount > currentBalance) {
      setError("Solde Orange Money insuffisant")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch("/api/treasury/mobile-money/fee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parsedAmount, description }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to record fee")
      }

      setAmount("")
      setDescription("")
      onOpenChange(false)
      onSuccess?.()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("fr-GN", {
      style: "decimal",
      minimumFractionDigits: 0,
    }).format(value) + " GNF"
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Enregistrer Frais Orange Money
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-lg border bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground mb-1">Solde actuel</p>
            <p className="text-2xl font-bold text-orange-600">
              {formatCurrency(currentBalance)}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">
              Montant des frais <span className="text-destructive">*</span>
            </Label>
            <Input
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="50 000"
              type="text"
            />
            <p className="text-xs text-muted-foreground">
              Entrez le montant des frais de transaction
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Frais de transaction Orange Money..."
              rows={3}
              className="resize-none"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
