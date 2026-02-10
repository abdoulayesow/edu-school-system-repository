"use client"

import { useState } from "react"
import { FormDialog, FormField } from "@/components/ui/form-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DialogFooter } from "@/components/ui/dialog"
import { AlertTriangle, ArrowRight, Loader2, CheckCircle2, Sunrise, Wallet, CreditCard } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import { cn } from "@/lib/utils"
import { formatCurrency, DISCREPANCY_THRESHOLD } from "@/lib/format"

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
  const countedNum = parseInt(countedSafeBalance) || 0
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

  const stepDescription = step === 1 ? reg.stepSafeCounting : reg.stepFloatTransfer

  return (
    <FormDialog
      open={open}
      onOpenChange={handleClose}
      title={reg.dailyOpening}
      description={reg.dailyOpeningDesc.replace("{step}", step.toString()).replace("{description}", stepDescription)}
      icon={Sunrise}
      accentColor="emerald"
      error={error}
      footer={
        <DialogFooter>
          {step === 1 ? (
            <>
              <Button variant="outline" onClick={handleClose}>
                {reg.cancel}
              </Button>
              <Button
                onClick={handleNext}
                disabled={!countedSafeBalance || currentRegistryBalance > 0}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
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
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !floatAmount}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {reg.opening}
                  </>
                ) : (
                  <>
                    <Sunrise className="mr-2 h-4 w-4" />
                    {reg.openTheDay}
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      }
    >
      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-2">
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
          step >= 1
            ? "bg-emerald-500 text-white"
            : "bg-muted text-muted-foreground"
        )}>
          1
        </div>
        <div className={cn(
          "w-12 h-1 rounded-full transition-all",
          step >= 2 ? "bg-emerald-500" : "bg-muted"
        )} />
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
          step >= 2
            ? "bg-emerald-500 text-white"
            : "bg-muted text-muted-foreground"
        )}>
          2
        </div>
      </div>

      {/* Check if registry is already open */}
      {currentRegistryBalance > 0 && step === 1 && (
        <Alert variant="destructive" className="border-red-300 dark:border-red-800">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {reg.registryAlreadyHasBalance.replace("{amount}", formatCurrency(currentRegistryBalance) + " GNF")}
          </AlertDescription>
        </Alert>
      )}

      {/* Step 1: Count Safe */}
      {step === 1 && (
        <>
          {/* Expected Balance Card */}
          <div className={cn(
            "rounded-xl border p-4 relative overflow-hidden",
            "border-amber-300 dark:border-amber-700",
            "bg-gradient-to-br from-amber-50 to-amber-50/50 dark:from-amber-950/30 dark:to-amber-950/10",
            "ring-1 ring-amber-200 dark:ring-amber-800"
          )}>
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                {reg.expectedSafeBalance}
              </p>
            </div>
            <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">
              {formatCurrency(currentSafeBalance)} <span className="text-base font-medium">GNF</span>
            </p>
          </div>

          {/* Counted Amount Input */}
          <FormField label={`${reg.countedSafeAmount} (GNF)`} hint={reg.countedSafeAmountHint}>
            <Input
              type="text"
              inputMode="numeric"
              value={countedSafeBalance}
              onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, "")
                setCountedSafeBalance(raw)
              }}
              placeholder={reg.countedSafeAmountPlaceholder}
              disabled={currentRegistryBalance > 0}
              className="text-xl font-bold h-12 text-center"
            />
          </FormField>

          {/* Discrepancy Alert */}
          {countedSafeBalance && discrepancy !== 0 && (
            <div className={cn(
              "p-4 rounded-xl border",
              Math.abs(discrepancy) > DISCREPANCY_THRESHOLD
                ? "bg-gradient-to-br from-red-50 to-red-50/50 dark:from-red-950/30 dark:to-red-950/10 border-red-300 dark:border-red-700"
                : "bg-gradient-to-br from-orange-50 to-orange-50/50 dark:from-orange-950/30 dark:to-orange-950/10 border-orange-300 dark:border-orange-700"
            )}>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className={cn(
                  "h-4 w-4",
                  Math.abs(discrepancy) > DISCREPANCY_THRESHOLD ? "text-red-600" : "text-orange-600"
                )} />
                <span className={cn(
                  "font-semibold",
                  Math.abs(discrepancy) > DISCREPANCY_THRESHOLD ? "text-red-700 dark:text-red-300" : "text-orange-700 dark:text-orange-300"
                )}>
                  {discrepancy > 0 ? reg.surplus : reg.shortage} {formatCurrency(Math.abs(discrepancy))} GNF
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{reg.adjustmentWillBeCreated}</p>
            </div>
          )}
        </>
      )}

      {/* Step 2: Set Float Amount */}
      {step === 2 && (
        <>
          {/* Counted Safe Balance Confirmation */}
          <div className={cn(
            "rounded-xl border p-4 relative overflow-hidden",
            "border-emerald-300 dark:border-emerald-700",
            "bg-gradient-to-br from-emerald-50 to-emerald-50/50 dark:from-emerald-950/30 dark:to-emerald-950/10",
            "ring-1 ring-emerald-200 dark:ring-emerald-800"
          )}>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                {reg.countedSafeAmount}
              </p>
            </div>
            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
              {formatCurrency(countedNum)} <span className="text-base font-medium">GNF</span>
            </p>
            {discrepancy !== 0 && (
              <p className="text-sm mt-2 text-orange-600 dark:text-orange-400">
                {t.treasury.discrepancy}: {discrepancy > 0 ? "+" : ""}{formatCurrency(discrepancy)} GNF
              </p>
            )}
          </div>

          {/* Float Amount Input */}
          <FormField label={`${reg.floatAmountLabel} (GNF)`} hint={`${reg.standardFloat}: ${formatCurrency(defaultFloatAmount)} GNF`}>
            <Input
              type="text"
              inputMode="numeric"
              value={floatAmount}
              onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, "")
                setFloatAmount(raw)
              }}
              className="text-xl font-bold h-12 text-center"
            />
          </FormField>

          {/* Balance Preview */}
          <div className="p-3 rounded-lg bg-muted/30 border border-dashed space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-amber-600" />
                {reg.safeAfterTransfer}:
              </span>
              <span className="font-semibold text-amber-600 dark:text-amber-400">
                {formatCurrency(countedNum - floatAmountNum)} GNF
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-emerald-600" />
                {reg.registryAfterTransfer}:
              </span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(floatAmountNum)} GNF
              </span>
            </div>
          </div>

          {/* Notes */}
          <FormField label={reg.notesOptional} optional>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={reg.notesPlaceholder}
              rows={2}
              className="resize-none"
            />
          </FormField>
        </>
      )}
    </FormDialog>
  )
}
