"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, ClipboardCheck, CheckCircle2, AlertTriangle, Wallet } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import { cn } from "@/lib/utils"

interface VerifyCashDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  expectedBalance: number
}

// Format currency for Guinea (GNF)
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("fr-GN", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function VerifyCashDialog({
  open,
  onOpenChange,
  onSuccess,
  expectedBalance,
}: VerifyCashDialogProps) {
  const { t } = useI18n()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [countedAmount, setCountedAmount] = useState("")
  const [explanation, setExplanation] = useState("")

  async function handleSubmit() {
    setError(null)

    // Validation
    const countedNum = parseInt(countedAmount.replace(/\s/g, ""), 10)
    if (isNaN(countedNum) || countedNum < 0) {
      setError(t?.treasury?.invalidAmount || "Montant invalide")
      return
    }

    // If there's a discrepancy, explanation is required
    if (countedNum !== expectedBalance && !explanation.trim()) {
      setError(t?.treasury?.explanationRequired || "Explication requise en cas d'écart")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/treasury/verifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          countedBalance: countedNum,
          explanation: explanation.trim() || undefined,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Failed to record verification")
      }

      // Reset form and close
      resetForm()
      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to record verification")
    } finally {
      setIsSubmitting(false)
    }
  }

  function resetForm() {
    setCountedAmount("")
    setExplanation("")
    setError(null)
  }

  function handleOpenChange(newOpen: boolean) {
    if (!newOpen) resetForm()
    onOpenChange(newOpen)
  }

  const countedNum = parseInt(countedAmount.replace(/\s/g, ""), 10)
  const hasValue = !isNaN(countedNum) && countedAmount.length > 0
  const discrepancy = hasValue ? countedNum - expectedBalance : 0
  const hasDiscrepancy = hasValue && discrepancy !== 0
  const isMatch = hasValue && discrepancy === 0

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
        {/* Amber accent bar for cash verification */}
        <div className="h-1 bg-amber-500" />

        <div className="p-6">
          <DialogHeader className="pb-4">
            <DialogTitle className="flex items-center gap-3">
              <div className={cn(
                "p-2.5 rounded-xl",
                "bg-amber-100 dark:bg-amber-900/30",
                "ring-2 ring-amber-200 dark:ring-amber-800"
              )}>
                <ClipboardCheck className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <span className="text-amber-700 dark:text-amber-300">
                {t?.treasury?.verifyNow || "Vérification de la caisse"}
              </span>
            </DialogTitle>
            <DialogDescription>
              {t?.treasury?.verifyDesc || "Comptez l'argent physique dans la caisse et entrez le montant"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Expected Balance - Enhanced Card */}
            <div className={cn(
              "rounded-xl border p-4 text-center relative overflow-hidden",
              "border-amber-300 dark:border-amber-700",
              "bg-gradient-to-br from-amber-50 to-amber-50/50 dark:from-amber-950/30 dark:to-amber-950/10",
              "ring-1 ring-amber-200 dark:ring-amber-800"
            )}>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Wallet className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                  {t?.treasury?.expectedBalance || "Solde attendu"}
                </p>
              </div>
              <p className="text-3xl font-bold text-amber-700 dark:text-amber-300">
                {formatCurrency(expectedBalance)} <span className="text-lg font-medium">GNF</span>
              </p>
            </div>

            {/* Counted Amount Input */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                {t?.treasury?.countedBalance || "Solde compté"} (GNF)
              </Label>
              <Input
                type="text"
                inputMode="numeric"
                placeholder="Entrez le montant compté"
                value={countedAmount}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, "")
                  setCountedAmount(raw ? formatCurrency(parseInt(raw, 10)) : "")
                }}
                className={cn(
                  "text-2xl font-bold h-14 text-center",
                  "focus-visible:ring-amber-500 focus-visible:border-amber-500"
                )}
                autoFocus
              />
            </div>

            {/* Result Display */}
            {hasValue && (
              <div className={cn(
                "p-4 rounded-xl border",
                isMatch
                  ? "bg-gradient-to-br from-emerald-50 to-emerald-50/50 dark:from-emerald-950/30 dark:to-emerald-950/10 border-emerald-300 dark:border-emerald-700 ring-1 ring-emerald-200 dark:ring-emerald-800"
                  : "bg-gradient-to-br from-red-50 to-red-50/50 dark:from-red-950/30 dark:to-red-950/10 border-red-300 dark:border-red-700 ring-1 ring-red-200 dark:ring-red-800"
              )}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isMatch ? (
                      <>
                        <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                          {t?.treasury?.verificationMatch || "Conforme"}
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900/40">
                          <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                        </div>
                        <span className="font-semibold text-red-700 dark:text-red-300">
                          {t?.treasury?.verificationDiscrepancy || "Écart détecté"}
                        </span>
                      </>
                    )}
                  </div>
                  {hasDiscrepancy && (
                    <span className={cn(
                      "font-bold px-2 py-1 rounded-lg text-sm",
                      discrepancy > 0
                        ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
                        : "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300"
                    )}>
                      {discrepancy > 0 ? "+" : ""}{formatCurrency(discrepancy)} GNF
                    </span>
                  )}
                </div>

                {hasDiscrepancy && (
                  <p className="text-sm mt-2 text-muted-foreground">
                    {discrepancy > 0
                      ? (t?.treasury?.excessCash || "Il y a plus d'argent que prévu dans la caisse")
                      : (t?.treasury?.missingCash || "Il manque de l'argent dans la caisse")}
                  </p>
                )}
              </div>
            )}

            {/* Explanation (required if discrepancy) */}
            {hasDiscrepancy && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-red-600 dark:text-red-400">
                  {t?.treasury?.explanationRequired || "Explication requise"} *
                </Label>
                <Textarea
                  placeholder={t?.treasury?.explanationPlaceholder || "Expliquez la raison de cet écart..."}
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  rows={3}
                  className="border-red-200 dark:border-red-800 focus-visible:ring-red-500 focus-visible:border-red-500 resize-none"
                />
              </div>
            )}

            {/* Warning about adjustment */}
            {hasDiscrepancy && (
              <Alert variant="destructive" className="border-red-300 dark:border-red-800">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {t?.treasury?.discrepancyWarning || "Si vous confirmez, le solde de la caisse sera ajusté au montant compté."}
                </AlertDescription>
              </Alert>
            )}

            {/* Error Message */}
            {error && (
              <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
                {error}
              </div>
            )}
          </div>

          <DialogFooter className="border-t pt-4 mt-2">
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              {t?.common?.cancel || "Annuler"}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !hasValue || (hasDiscrepancy && !explanation.trim())}
              className={cn(
                isMatch
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-amber-600 hover:bg-amber-700 text-white"
              )}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <ClipboardCheck className="mr-2 h-4 w-4" />
              {isMatch
                ? (t?.treasury?.confirmVerification || "Confirmer vérification")
                : (t?.treasury?.recordDiscrepancy || "Enregistrer l'écart")}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
