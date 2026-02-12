"use client"

import { useState } from "react"
import { FormDialog, FormField } from "@/components/ui/form-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { AlertTriangle, ArrowRight, ArrowLeftRight, Wallet, CreditCard } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/format"

interface SafeTransferDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  currentSafeBalance: number
  currentRegistryBalance: number
}

export function SafeTransferDialog({
  open,
  onOpenChange,
  onSuccess,
  currentSafeBalance,
  currentRegistryBalance,
}: SafeTransferDialogProps) {
  const { t } = useI18n()
  const [direction, setDirection] = useState<"safe_to_registry" | "registry_to_safe">("safe_to_registry")
  const [amount, setAmount] = useState("")
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const amountNum = parseInt(amount) || 0
  const reg = t.treasury.registry

  const handleReset = () => {
    setDirection("safe_to_registry")
    setAmount("")
    setNotes("")
    setError(null)
    setIsSubmitting(false)
  }

  const handleClose = () => {
    handleReset()
    onOpenChange(false)
  }

  const handleSubmit = async () => {
    if (!amount || amountNum <= 0) {
      setError(t.treasury.invalidAmount)
      return
    }

    if (notes.length < 10) {
      setError(reg.notesRequired)
      return
    }

    if (direction === "safe_to_registry" && amountNum > currentSafeBalance) {
      setError(t.treasury.insufficientFundsSafe)
      return
    }

    if (direction === "registry_to_safe" && amountNum > currentRegistryBalance) {
      setError(reg.insufficientFundsInRegistry)
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch("/api/treasury/safe-transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          direction,
          amount: amountNum,
          notes,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || reg.transferFailed)
      }

      onSuccess()
      handleClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const sourceBalance = direction === "safe_to_registry" ? currentSafeBalance : currentRegistryBalance
  const newSourceBalance = sourceBalance - amountNum
  const newDestinationBalance = (direction === "safe_to_registry" ? currentRegistryBalance : currentSafeBalance) + amountNum
  const insufficientFunds = amountNum > sourceBalance && amountNum > 0

  return (
    <FormDialog
      open={open}
      onOpenChange={handleClose}
      title={reg.safeTransfer}
      description={reg.safeTransferDesc}
      icon={ArrowLeftRight}
      accentColor="amber"
      submitLabel={reg.performTransfer}
      submitIcon={ArrowLeftRight}
      cancelLabel={reg.cancel}
      onSubmit={handleSubmit}
      onCancel={handleClose}
      isSubmitting={isSubmitting}
      isDisabled={!amount || amountNum <= 0 || notes.length < 10 || insufficientFunds}
      error={error}
    >
      {/* Current Balances */}
      <div className="grid grid-cols-2 gap-3">
        <div className={cn(
          "rounded-xl border p-3 relative overflow-hidden transition-all",
          direction === "safe_to_registry"
            ? "border-amber-300 dark:border-amber-700 bg-gradient-to-br from-amber-50 to-amber-50/50 dark:from-amber-950/30 dark:to-amber-950/10 ring-1 ring-amber-200 dark:ring-amber-800"
            : "border-border bg-muted/50"
        )}>
          <div className="flex items-center gap-2 mb-1">
            <Wallet className={cn(
              "h-4 w-4",
              direction === "safe_to_registry" ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"
            )} />
            <p className="text-xs font-medium text-muted-foreground">{t.safe}</p>
          </div>
          <p className={cn(
            "text-lg font-bold",
            direction === "safe_to_registry" && "text-amber-700 dark:text-amber-300"
          )}>
            {formatCurrency(currentSafeBalance)} <span className="text-sm font-medium">GNF</span>
          </p>
        </div>

        <div className={cn(
          "rounded-xl border p-3 relative overflow-hidden transition-all",
          direction === "registry_to_safe"
            ? "border-emerald-300 dark:border-emerald-700 bg-gradient-to-br from-emerald-50 to-emerald-50/50 dark:from-emerald-950/30 dark:to-emerald-950/10 ring-1 ring-emerald-200 dark:ring-emerald-800"
            : "border-border bg-muted/50"
        )}>
          <div className="flex items-center gap-2 mb-1">
            <CreditCard className={cn(
              "h-4 w-4",
              direction === "registry_to_safe" ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
            )} />
            <p className="text-xs font-medium text-muted-foreground">{t.nav.treasury}</p>
          </div>
          <p className={cn(
            "text-lg font-bold",
            direction === "registry_to_safe" && "text-emerald-700 dark:text-emerald-300"
          )}>
            {formatCurrency(currentRegistryBalance)} <span className="text-sm font-medium">GNF</span>
          </p>
        </div>
      </div>

      {/* Direction Selection */}
      <FormField label={reg.transferDirection}>
        <RadioGroup value={direction} onValueChange={(value) => setDirection(value as "safe_to_registry" | "registry_to_safe")}>
          <div className={cn(
            "flex items-center space-x-3 rounded-xl border p-3 transition-all cursor-pointer",
            direction === "safe_to_registry"
              ? "border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/20"
              : "hover:bg-accent"
          )}>
            <RadioGroupItem value="safe_to_registry" id="safe_to_registry" />
            <Label htmlFor="safe_to_registry" className="flex-1 cursor-pointer">
              <span className="font-medium">{reg.safeToRegistry}</span>
              <p className="text-xs text-muted-foreground font-normal mt-0.5">{reg.safeToRegistryDesc}</p>
            </Label>
          </div>
          <div className={cn(
            "flex items-center space-x-3 rounded-xl border p-3 transition-all cursor-pointer",
            direction === "registry_to_safe"
              ? "border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/20"
              : "hover:bg-accent"
          )}>
            <RadioGroupItem value="registry_to_safe" id="registry_to_safe" />
            <Label htmlFor="registry_to_safe" className="flex-1 cursor-pointer">
              <span className="font-medium">{reg.registryToSafe}</span>
              <p className="text-xs text-muted-foreground font-normal mt-0.5">{reg.registryToSafeDesc}</p>
            </Label>
          </div>
        </RadioGroup>
      </FormField>

      {/* Transfer Direction Indicator */}
      <div className="flex items-center justify-center gap-3 py-3 px-4 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900">
        <div className={cn(
          "px-3 py-1.5 rounded-lg text-sm font-medium",
          direction === "safe_to_registry"
            ? "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300"
            : "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
        )}>
          {direction === "safe_to_registry" ? t.safe : t.nav.treasury}
        </div>
        <ArrowRight className="h-5 w-5 text-amber-500" />
        <div className={cn(
          "px-3 py-1.5 rounded-lg text-sm font-medium",
          direction === "safe_to_registry"
            ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
            : "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300"
        )}>
          {direction === "safe_to_registry" ? t.nav.treasury : t.safe}
        </div>
      </div>

      {/* Amount Input */}
      <FormField label={`${reg.amountToTransfer} (GNF)`} hint={`${reg.available}: ${formatCurrency(sourceBalance)} GNF`}>
        <Input
          type="text"
          inputMode="numeric"
          value={amount}
          onChange={(e) => {
            const raw = e.target.value.replace(/\D/g, "")
            setAmount(raw)
          }}
          placeholder="0"
          className={cn(
            "text-2xl font-bold h-14 text-center",
            insufficientFunds && "border-red-500 focus-visible:ring-red-500"
          )}
        />
      </FormField>

      {/* Balance Preview */}
      {amount && amountNum > 0 && (
        <div className="p-3 rounded-lg bg-muted/30 border border-dashed space-y-2">
          <p className="text-sm font-medium flex items-center gap-2 mb-2">
            {reg.previewAfterTransfer}
          </p>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-amber-600" />
              {t.safe}:
            </span>
            <span className="font-semibold">
              {formatCurrency(direction === "safe_to_registry" ? newSourceBalance : newDestinationBalance)} GNF
              {direction === "safe_to_registry" && <span className="text-red-600 ml-1">(-{formatCurrency(amountNum)})</span>}
              {direction === "registry_to_safe" && <span className="text-emerald-600 ml-1">(+{formatCurrency(amountNum)})</span>}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-emerald-600" />
              {t.nav.treasury}:
            </span>
            <span className="font-semibold">
              {formatCurrency(direction === "safe_to_registry" ? newDestinationBalance : newSourceBalance)} GNF
              {direction === "safe_to_registry" && <span className="text-emerald-600 ml-1">(+{formatCurrency(amountNum)})</span>}
              {direction === "registry_to_safe" && <span className="text-red-600 ml-1">(-{formatCurrency(amountNum)})</span>}
            </span>
          </div>
        </div>
      )}

      {/* Insufficient Funds Warning */}
      {insufficientFunds && (
        <Alert variant="destructive" className="border-red-300 dark:border-red-800">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {direction === "safe_to_registry"
              ? t.treasury.insufficientFundsSafe
              : reg.insufficientFundsInRegistry}
          </AlertDescription>
        </Alert>
      )}

      {/* Notes (Required) */}
      <FormField label={t.common.notes} required hint={reg.notesMinChars.replace("{count}", notes.length.toString())}>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={reg.transferReasonPlaceholder}
          rows={2}
          required
          className={cn(
            "resize-none",
            notes.length < 10 && notes.length > 0 && "border-orange-300"
          )}
        />
      </FormField>

      {/* Warning */}
      <Alert className="border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-xs">
          <strong>Important:</strong> {reg.adHocTransferNote}
        </AlertDescription>
      </Alert>
    </FormDialog>
  )
}
