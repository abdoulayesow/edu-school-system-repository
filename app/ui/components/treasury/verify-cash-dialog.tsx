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
import { Loader2, ClipboardCheck, CheckCircle2, AlertTriangle } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"

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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30">
              <ClipboardCheck className="h-5 w-5 text-purple-600" />
            </div>
            {t?.treasury?.verifyNow || "Vérification de la caisse"}
          </DialogTitle>
          <DialogDescription>
            {t?.treasury?.verifyDesc || "Comptez l'argent physique dans la caisse et entrez le montant"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Expected Balance - Prominent Display */}
          <div className="bg-muted p-4 rounded-lg text-center">
            <p className="text-sm text-muted-foreground mb-1">
              {t?.treasury?.expectedBalance || "Solde attendu"}
            </p>
            <p className="text-3xl font-bold">
              {formatCurrency(expectedBalance)} <span className="text-lg font-normal">GNF</span>
            </p>
          </div>

          {/* Counted Amount Input */}
          <div className="space-y-2">
            <Label className="text-base">
              {t?.treasury?.countedBalance || "Solde compté"}
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
              className="text-3xl font-bold h-16 text-center"
              autoFocus
            />
          </div>

          {/* Result Display */}
          {hasValue && (
            <div className={`p-4 rounded-lg ${
              isMatch
                ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isMatch ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-600">
                        {t?.treasury?.verificationMatch || "Conforme"}
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      <span className="font-medium text-red-600">
                        {t?.treasury?.verificationDiscrepancy || "Écart détecté"}
                      </span>
                    </>
                  )}
                </div>
                {hasDiscrepancy && (
                  <span className={`font-bold ${discrepancy > 0 ? "text-green-600" : "text-red-600"}`}>
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
              <Label className="text-base text-red-600">
                {t?.treasury?.explanationRequired || "Explication requise"} *
              </Label>
              <Textarea
                placeholder={t?.treasury?.explanationPlaceholder || "Expliquez la raison de cet écart..."}
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                rows={3}
                className="border-red-200 focus:border-red-500"
              />
            </div>
          )}

          {/* Warning about adjustment */}
          {hasDiscrepancy && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {t?.treasury?.discrepancyWarning || "Si vous confirmez, le solde de la caisse sera ajusté au montant compté."}
              </AlertDescription>
            </Alert>
          )}

          {/* Error Message */}
          {error && (
            <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            {t?.common?.cancel || "Annuler"}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !hasValue || (hasDiscrepancy && !explanation.trim())}
            className={isMatch ? "bg-green-600 hover:bg-green-700" : ""}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isMatch
              ? (t?.treasury?.confirmVerification || "Confirmer vérification")
              : (t?.treasury?.recordDiscrepancy || "Enregistrer l'écart")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
