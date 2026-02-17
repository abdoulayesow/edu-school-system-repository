"use client"

import { useState } from "react"
import { FormDialog, FormField } from "@/components/ui/form-dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Receipt, Smartphone } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/format"

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
  const { t } = useI18n()
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    const parsedAmount = parseInt(amount.replace(/\s/g, ""), 10)

    if (!parsedAmount || parsedAmount <= 0) {
      setError(t.treasury.invalidAmount)
      return
    }

    if (parsedAmount > currentBalance) {
      setError(t.treasury.mobileMoney.insufficientOrangeMoney)
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
        throw new Error(errorData.message || t.treasury.mobileMoney.failedToRecordFee)
      }

      resetForm()
      onOpenChange(false)
      onSuccess?.()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t.treasury.mobileMoney.failedToRecordFee)
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
    <FormDialog
      open={open}
      onOpenChange={handleOpenChange}
      title={t.treasury.mobileMoney.title}
      description={t.treasury.mobileMoney.description}
      icon={Receipt}
      accentColor="orange"
      submitLabel={t.treasury.mobileMoney.submitLabel}
      submitIcon={Receipt}
      onSubmit={handleSubmit}
      onCancel={() => handleOpenChange(false)}
      isSubmitting={isSubmitting}
      isDisabled={!parsedAmount || insufficientFunds}
      error={error}
    >
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
            {t.treasury.mobileMoney.orangeMoneyBalance}
          </p>
        </div>
        <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
          {formatCurrency(currentBalance)} <span className="text-base font-medium">GNF</span>
        </p>
      </div>

      {/* Amount Input */}
      <FormField label={t.treasury.mobileMoney.feeAmount} required hint={t.treasury.mobileMoney.feeAmountHint}>
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
            insufficientFunds && parsedAmount > 0 && "border-red-500 focus-visible:ring-red-500"
          )}
        />
      </FormField>

      {/* Balance Preview */}
      {parsedAmount > 0 && (
        <div className="p-3 rounded-lg bg-muted/30 border border-dashed text-center">
          <p className="text-xs text-muted-foreground mb-1">
            {t.treasury.mobileMoney.newOrangeMoneyBalance}
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
          {t.treasury.mobileMoney.insufficientOrangeMoney}
        </div>
      )}

      {/* Description */}
      <FormField label={t.common.description} optional>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t.treasury.mobileMoney.descriptionPlaceholder}
          rows={2}
          className="resize-none"
        />
      </FormField>
    </FormDialog>
  )
}
