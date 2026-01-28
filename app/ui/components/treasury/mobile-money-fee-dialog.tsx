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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Receipt, Smartphone, Loader2 } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import { cn } from "@/lib/utils"

interface MobileMoneyFeeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentBalance: number
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

export function MobileMoneyFeeDialog({
  open,
  onOpenChange,
  currentBalance,
  onSuccess,
}: MobileMoneyFeeDialogProps) {
  const { t } = useI18n()
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    const parsedAmount = parseInt(amount.replace(/\s/g, ""), 10)

    if (!parsedAmount || parsedAmount <= 0) {
      setError(t?.treasury?.invalidAmount || "Montant invalide")
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

      resetForm()
      onOpenChange(false)
      onSuccess?.()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to record fee")
    } finally {
      setIsSubmitting(false)
    }
  }

  function resetForm() {
    setAmount("")
    setDescription("")
    setError(null)
  }

  function handleOpenChange(newOpen: boolean) {
    if (!newOpen) resetForm()
    onOpenChange(newOpen)
  }

  const parsedAmount = parseInt(amount.replace(/\s/g, ""), 10) || 0
  const insufficientFunds = parsedAmount > currentBalance
  const newBalance = currentBalance - parsedAmount

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
        {/* Orange accent bar for Orange Money */}
        <div className="h-1 bg-orange-500" />

        <div className="p-6">
          <DialogHeader className="pb-4">
            <DialogTitle className="flex items-center gap-3">
              <div className={cn(
                "p-2.5 rounded-xl",
                "bg-orange-100 dark:bg-orange-900/30",
                "ring-2 ring-orange-200 dark:ring-orange-800"
              )}>
                <Receipt className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <span className="text-orange-700 dark:text-orange-300">
                Enregistrer Frais Orange Money
              </span>
            </DialogTitle>
            <DialogDescription>
              Enregistrer les frais de transaction Orange Money
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Current Balance Card */}
            <div className={cn(
              "rounded-xl border p-4 relative overflow-hidden",
              "border-orange-300 dark:border-orange-700",
              "bg-gradient-to-br from-orange-50 to-orange-50/50 dark:from-orange-950/30 dark:to-orange-950/10",
              "ring-1 ring-orange-200 dark:ring-orange-800"
            )}>
              <div className="flex items-center gap-2 mb-2">
                <Smartphone className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                <p className="text-sm font-medium text-orange-700 dark:text-orange-300">
                  Solde Orange Money
                </p>
              </div>
              <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                {formatCurrency(currentBalance)} <span className="text-base font-medium">GNF</span>
              </p>
            </div>

            {/* Amount Input */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Montant des frais (GNF) <span className="text-red-500">*</span>
              </Label>
              <Input
                value={amount}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, "")
                  setAmount(raw ? formatCurrency(parseInt(raw, 10)) : "")
                }}
                placeholder="0"
                type="text"
                inputMode="numeric"
                className={cn(
                  "text-2xl font-bold h-14 text-center",
                  "focus-visible:ring-orange-500 focus-visible:border-orange-500",
                  insufficientFunds && parsedAmount > 0 && "border-red-500 focus-visible:ring-red-500"
                )}
              />
              <p className="text-xs text-muted-foreground">
                Entrez le montant des frais de transaction
              </p>
            </div>

            {/* Balance Preview */}
            {parsedAmount > 0 && (
              <div className="p-3 rounded-lg bg-muted/30 border border-dashed text-center">
                <p className="text-xs text-muted-foreground mb-1">
                  Nouveau solde Orange Money
                </p>
                <p className={cn(
                  "text-sm font-semibold",
                  insufficientFunds ? "text-red-600" : "text-orange-600 dark:text-orange-400"
                )}>
                  {formatCurrency(newBalance)} GNF
                </p>
              </div>
            )}

            {/* Insufficient Funds Warning */}
            {insufficientFunds && parsedAmount > 0 && (
              <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
                Solde Orange Money insuffisant
              </div>
            )}

            {/* Description */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                {t?.common?.description || "Description"}{" "}
                <span className="text-muted-foreground font-normal">({t?.common?.optional || "optionnel"})</span>
              </Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Frais de transaction Orange Money..."
                rows={2}
                className="focus-visible:ring-orange-500 resize-none"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
                {error}
              </div>
            )}
          </div>

          <DialogFooter className="border-t pt-4 mt-2">
            <Button
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              {t?.common?.cancel || "Annuler"}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !parsedAmount || insufficientFunds}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Receipt className="mr-2 h-4 w-4" />
              Enregistrer
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
