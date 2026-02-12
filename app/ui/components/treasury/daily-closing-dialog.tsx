"use client"

import { useState } from "react"
import { FormDialog, FormField } from "@/components/ui/form-dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, CheckCircle2, Lock, Sunset, Wallet } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import { cn } from "@/lib/utils"
import { formatCurrency, DISCREPANCY_THRESHOLD } from "@/lib/format"

interface DailyClosingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  currentRegistryBalance: number
  currentSafeBalance: number
}

export function DailyClosingDialog({
  open,
  onOpenChange,
  onSuccess,
  currentRegistryBalance,
  currentSafeBalance,
}: DailyClosingDialogProps) {
  const { t } = useI18n()
  const [countedRegistryBalance, setCountedRegistryBalance] = useState("")
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const discrepancy = countedRegistryBalance ? parseInt(countedRegistryBalance) - currentRegistryBalance : 0
  const countedAmount = parseInt(countedRegistryBalance) || 0
  const reg = t.treasury.registry

  const handleReset = () => {
    setCountedRegistryBalance("")
    setNotes("")
    setError(null)
    setIsSubmitting(false)
  }

  const handleClose = () => {
    handleReset()
    onOpenChange(false)
  }

  const handleSubmit = async () => {
    if (!countedRegistryBalance || countedAmount < 0) {
      setError(reg.countedRegistryAmountPlaceholder)
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch("/api/treasury/daily-closing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          countedRegistryBalance: countedAmount,
          notes: notes || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || reg.closingFailed)
      }

      onSuccess()
      handleClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isMatch = countedRegistryBalance && discrepancy === 0

  return (
    <FormDialog
      open={open}
      onOpenChange={handleClose}
      title={reg.dailyClosing}
      description={reg.dailyClosingDesc}
      icon={Sunset}
      accentColor="maroon"
      submitLabel={reg.closeTheDay}
      submitIcon={Lock}
      cancelLabel={reg.cancel}
      onSubmit={handleSubmit}
      onCancel={handleClose}
      isSubmitting={isSubmitting}
      isDisabled={!countedRegistryBalance || currentRegistryBalance === 0}
      error={error}
    >
      {/* Check if registry is empty */}
      {currentRegistryBalance === 0 && (
        <Alert variant="destructive" className="border-red-300 dark:border-red-800">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {reg.registryAlreadyEmpty}
          </AlertDescription>
        </Alert>
      )}

      {/* Counted Amount Input */}
      <FormField label={`${reg.countedRegistryAmount} (GNF)`} hint={reg.countedRegistryAmountHint}>
        <Input
          type="text"
          inputMode="numeric"
          value={countedRegistryBalance}
          onChange={(e) => {
            const raw = e.target.value.replace(/\D/g, "")
            setCountedRegistryBalance(raw)
          }}
          placeholder={reg.countedRegistryAmountPlaceholder}
          disabled={currentRegistryBalance === 0}
          className="text-xl font-bold h-12 text-center"
        />
      </FormField>

      {/* Discrepancy Alert */}
      {countedRegistryBalance && discrepancy !== 0 && (
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

      {/* Match Success */}
      {isMatch && (
        <div className={cn(
          "p-4 rounded-xl border",
          "bg-gradient-to-br from-emerald-50 to-emerald-50/50 dark:from-emerald-950/30 dark:to-emerald-950/10",
          "border-emerald-300 dark:border-emerald-700 ring-1 ring-emerald-200 dark:ring-emerald-800"
        )}>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="font-semibold text-emerald-700 dark:text-emerald-300">
              {reg.noDiscrepancy}
            </span>
          </div>
          <p className="text-sm mt-2 text-muted-foreground">{reg.countMatchesExpected}</p>
        </div>
      )}

      {/* Safe Balance After Closing Preview */}
      {countedRegistryBalance && (
        <div className={cn(
          "rounded-xl border p-4 relative overflow-hidden",
          "border-amber-300 dark:border-amber-700",
          "bg-gradient-to-br from-amber-50 to-amber-50/50 dark:from-amber-950/30 dark:to-amber-950/10",
          "ring-1 ring-amber-200 dark:ring-amber-800"
        )}>
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
              {reg.safeAfterClosing}
            </p>
          </div>
          <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">
            {formatCurrency(currentSafeBalance + countedAmount)} <span className="text-base font-medium">GNF</span>
          </p>
          <p className="text-xs mt-2 text-muted-foreground">
            {t.treasury.safeBalance} ({formatCurrency(currentSafeBalance)}) + {t.treasury.transactionTypes.adjustment} ({formatCurrency(countedAmount)})
          </p>
        </div>
      )}

      {/* Notes */}
      <FormField label={reg.notesOptional} optional>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={reg.notesPlaceholder}
          rows={2}
          disabled={currentRegistryBalance === 0}
          className="resize-none"
        />
      </FormField>
    </FormDialog>
  )
}
