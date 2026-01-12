"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { AlertTriangle, Loader2, ArrowRight } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"

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

    // Validate sufficient funds
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-GN", {
      style: "decimal",
      minimumFractionDigits: 0,
    }).format(amount) + " GNF"
  }

  const sourceBalance = direction === "safe_to_registry" ? currentSafeBalance : currentRegistryBalance
  const destinationBalance = direction === "safe_to_registry" ? currentRegistryBalance : currentSafeBalance
  const newSourceBalance = sourceBalance - amountNum
  const newDestinationBalance = destinationBalance + amountNum

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{reg.safeTransfer}</DialogTitle>
          <DialogDescription>
            {reg.safeTransferDesc}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          {/* Current Balances */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 p-3 border border-blue-200 dark:border-blue-800">
              <p className="text-xs text-muted-foreground mb-1">{t.safe}</p>
              <p className="text-lg font-bold text-blue-600">{formatCurrency(currentSafeBalance)}</p>
            </div>
            <div className="rounded-lg bg-green-50 dark:bg-green-950/20 p-3 border border-green-200 dark:border-green-800">
              <p className="text-xs text-muted-foreground mb-1">{t.nav.treasury}</p>
              <p className="text-lg font-bold text-green-600">{formatCurrency(currentRegistryBalance)}</p>
            </div>
          </div>

          {/* Direction Selection */}
          <div className="space-y-2">
            <Label>{reg.transferDirection}</Label>
            <RadioGroup value={direction} onValueChange={(value) => setDirection(value as "safe_to_registry" | "registry_to_safe")}>
              <div className="flex items-center space-x-2 rounded-lg border p-3 hover:bg-accent">
                <RadioGroupItem value="safe_to_registry" id="safe_to_registry" />
                <Label htmlFor="safe_to_registry" className="flex-1 cursor-pointer">
                  {reg.safeToRegistry}
                  <p className="text-xs text-muted-foreground font-normal">{reg.safeToRegistryDesc}</p>
                </Label>
              </div>
              <div className="flex items-center space-x-2 rounded-lg border p-3 hover:bg-accent">
                <RadioGroupItem value="registry_to_safe" id="registry_to_safe" />
                <Label htmlFor="registry_to_safe" className="flex-1 cursor-pointer">
                  {reg.registryToSafe}
                  <p className="text-xs text-muted-foreground font-normal">{reg.registryToSafeDesc}</p>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount">{reg.amountToTransfer}</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="10000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={reg.countedSafeAmountPlaceholder}
            />
            <p className="text-xs text-muted-foreground">
              {reg.available}: {formatCurrency(sourceBalance)}
            </p>
          </div>

          {/* Preview of new balances */}
          {amount && amountNum > 0 && (
            <div className="rounded-lg bg-muted p-4 space-y-2">
              <p className="text-sm font-medium mb-3 flex items-center gap-2">
                {reg.previewAfterTransfer}
                <ArrowRight className="h-4 w-4" />
              </p>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{t.safe}:</span>
                  <span className="font-semibold">
                    {formatCurrency(direction === "safe_to_registry" ? newSourceBalance : newDestinationBalance)}
                    {direction === "safe_to_registry" && <span className="text-red-600 ml-1">(-{formatCurrency(amountNum)})</span>}
                    {direction === "registry_to_safe" && <span className="text-green-600 ml-1">(+{formatCurrency(amountNum)})</span>}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>{t.nav.treasury}:</span>
                  <span className="font-semibold">
                    {formatCurrency(direction === "safe_to_registry" ? newDestinationBalance : newSourceBalance)}
                    {direction === "safe_to_registry" && <span className="text-green-600 ml-1">(+{formatCurrency(amountNum)})</span>}
                    {direction === "registry_to_safe" && <span className="text-red-600 ml-1">(-{formatCurrency(amountNum)})</span>}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Notes (Required) */}
          <div className="space-y-2">
            <Label htmlFor="notes">{t.common.notes} <span className="text-destructive">*</span></Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={reg.transferReasonPlaceholder}
              rows={3}
              required
            />
            <p className="text-xs text-muted-foreground">
              {reg.notesMinChars.replace("{count}", notes.length.toString())}
            </p>
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <strong>Important:</strong> {reg.adHocTransferNote}
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            {reg.cancel}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !amount || amountNum <= 0 || notes.length < 10}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {reg.transferring}
              </>
            ) : (
              <>
                <ArrowRight className="mr-2 h-4 w-4" />
                {reg.performTransfer}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
