"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, ArrowRight, Loader2, CheckCircle2 } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"

interface DailyOpeningDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  currentSafeBalance: number
  currentRegistryBalance: number
  defaultFloatAmount: number
}

export function DailyOpeningDialog({
  open,
  onOpenChange,
  onSuccess,
  currentSafeBalance,
  currentRegistryBalance,
  defaultFloatAmount,
}: DailyOpeningDialogProps) {
  const { t } = useI18n()
  const [step, setStep] = useState(1)
  const [countedSafeBalance, setCountedSafeBalance] = useState("")
  const [floatAmount, setFloatAmount] = useState(defaultFloatAmount.toString())
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const discrepancy = countedSafeBalance ? parseInt(countedSafeBalance) - currentSafeBalance : 0
  const floatAmountNum = parseInt(floatAmount) || 0
  const reg = t.treasury.registry

  const handleReset = () => {
    setStep(1)
    setCountedSafeBalance("")
    setFloatAmount(defaultFloatAmount.toString())
    setNotes("")
    setError(null)
    setIsSubmitting(false)
  }

  const handleClose = () => {
    handleReset()
    onOpenChange(false)
  }

  const handleNext = () => {
    if (step === 1) {
      if (!countedSafeBalance || parseInt(countedSafeBalance) < 0) {
        setError(reg.enterCountedSafeAmount)
        return
      }
      setError(null)
      setStep(2)
    }
  }

  const handleSubmit = async () => {
    if (!floatAmount || floatAmountNum <= 0) {
      setError(reg.floatAmountMustBePositive)
      return
    }

    if (parseInt(countedSafeBalance) < floatAmountNum) {
      setError(reg.insufficientFundsForFloat)
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch("/api/treasury/daily-opening", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          countedSafeBalance: parseInt(countedSafeBalance),
          floatAmount: floatAmountNum,
          notes: notes || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || reg.openingFailed)
      }

      onSuccess()
      handleClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-GN", {
      style: "decimal",
      minimumFractionDigits: 0,
    }).format(amount) + " GNF"
  }

  const stepDescription = step === 1 ? reg.stepSafeCounting : reg.stepFloatTransfer

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{reg.dailyOpening}</DialogTitle>
          <DialogDescription>
            {reg.dailyOpeningDesc.replace("{step}", step.toString()).replace("{description}", stepDescription)}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Check if registry is already open */}
        {currentRegistryBalance > 0 && step === 1 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {reg.registryAlreadyHasBalance.replace("{amount}", formatCurrency(currentRegistryBalance))}
            </AlertDescription>
          </Alert>
        )}

        {/* Step 1: Count Safe */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="rounded-lg bg-muted p-4 space-y-2">
              <p className="text-sm text-muted-foreground">{reg.expectedSafeBalance}</p>
              <p className="text-2xl font-bold">{formatCurrency(currentSafeBalance)}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="countedSafe">{reg.countedSafeAmount}</Label>
              <Input
                id="countedSafe"
                type="number"
                min="0"
                step="1000"
                value={countedSafeBalance}
                onChange={(e) => setCountedSafeBalance(e.target.value)}
                placeholder={reg.countedSafeAmountPlaceholder}
                disabled={currentRegistryBalance > 0}
              />
              <p className="text-xs text-muted-foreground">
                {reg.countedSafeAmountHint}
              </p>
            </div>

            {countedSafeBalance && discrepancy !== 0 && (
              <Alert variant={Math.abs(discrepancy) > 50000 ? "destructive" : "default"}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <span className="font-medium">
                    {discrepancy > 0 ? reg.surplus : reg.shortage} {formatCurrency(Math.abs(discrepancy))}
                  </span>
                  <br />
                  {reg.adjustmentWillBeCreated}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Step 2: Set Float Amount */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/20 p-4 space-y-2 border border-emerald-200 dark:border-emerald-800">
              <p className="text-sm text-muted-foreground">{reg.countedSafeAmount}</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(parseInt(countedSafeBalance))}</p>
              {discrepancy !== 0 && (
                <p className="text-sm text-orange-600">
                  {t.treasury.discrepancy}: {discrepancy > 0 ? "+" : ""}{formatCurrency(discrepancy)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="floatAmount">{reg.floatAmountLabel}</Label>
              <Input
                id="floatAmount"
                type="number"
                min="0"
                step="100000"
                value={floatAmount}
                onChange={(e) => setFloatAmount(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                {reg.standardFloat}: {formatCurrency(defaultFloatAmount)}
              </p>
            </div>

            <div className="rounded-lg bg-muted p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>{reg.safeAfterTransfer}:</span>
                <span className="font-semibold">{formatCurrency(parseInt(countedSafeBalance) - floatAmountNum)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>{reg.registryAfterTransfer}:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(floatAmountNum)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">{reg.notesOptional}</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={reg.notesPlaceholder}
                rows={3}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          {step === 1 ? (
            <>
              <Button variant="outline" onClick={handleClose}>
                {reg.cancel}
              </Button>
              <Button
                onClick={handleNext}
                disabled={!countedSafeBalance || currentRegistryBalance > 0}
              >
                {reg.next}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setStep(1)} disabled={isSubmitting}>
                {reg.back}
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting || !floatAmount}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {reg.opening}
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    {reg.openTheDay}
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
