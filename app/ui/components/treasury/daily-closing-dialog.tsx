"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Loader2, CheckCircle2, Lock } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-GN", {
      style: "decimal",
      minimumFractionDigits: 0,
    }).format(amount) + " GNF"
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{reg.dailyClosing}</DialogTitle>
          <DialogDescription>
            {reg.dailyClosingDesc}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Check if registry is empty */}
        {currentRegistryBalance === 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {reg.registryAlreadyEmpty}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <p className="text-sm text-muted-foreground">{reg.expectedRegistryBalance}</p>
            <p className="text-2xl font-bold">{formatCurrency(currentRegistryBalance)}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="countedRegistry">{reg.countedRegistryAmount}</Label>
            <Input
              id="countedRegistry"
              type="number"
              min="0"
              step="1000"
              value={countedRegistryBalance}
              onChange={(e) => setCountedRegistryBalance(e.target.value)}
              placeholder={reg.countedRegistryAmountPlaceholder}
              disabled={currentRegistryBalance === 0}
            />
            <p className="text-xs text-muted-foreground">
              {reg.countedRegistryAmountHint}
            </p>
          </div>

          {countedRegistryBalance && discrepancy !== 0 && (
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

          {countedRegistryBalance && (
            <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 p-4 space-y-2 border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-muted-foreground">{reg.safeAfterClosing}</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(currentSafeBalance + countedAmount)}
              </p>
              <p className="text-xs text-muted-foreground">
                {t.treasury.safeBalance} ({formatCurrency(currentSafeBalance)}) + {t.treasury.transactionTypes.adjustment} ({formatCurrency(countedAmount)})
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">{reg.notesOptional}</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={reg.notesPlaceholder}
              rows={3}
              disabled={currentRegistryBalance === 0}
            />
          </div>

          {countedRegistryBalance && discrepancy === 0 && (
            <Alert>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription>
                <span className="font-medium text-green-600">{reg.noDiscrepancy}</span>
                <br />
                {reg.countMatchesExpected}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            {reg.cancel}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !countedRegistryBalance || currentRegistryBalance === 0}
            variant="default"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {reg.closing}
              </>
            ) : (
              <>
                <Lock className="mr-2 h-4 w-4" />
                {reg.closeTheDay}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
