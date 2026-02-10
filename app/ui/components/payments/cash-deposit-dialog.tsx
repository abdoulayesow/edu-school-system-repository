"use client"

import { useState } from "react"
import { FormDialog, FormField } from "@/components/ui/form-dialog"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { BanknoteIcon, Building2, User } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import { formatAmountWithCurrency } from "@/lib/format"

interface Payment {
  id: string
  amount: number
  method: "cash" | "orange_money"
  status: string
  receiptNumber: string
  recordedAt: string
  enrollment?: {
    student?: {
      firstName: string
      lastName: string
    } | null
    grade?: {
      name: string
    } | null
  } | null
}

interface CashDepositDialogProps {
  payment: Payment | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

const BANKS = [
  { value: "BICIGUI", label: "BICIGUI" },
  { value: "SGBG", label: "SGBG" },
  { value: "Ecobank", label: "Ecobank" },
  { value: "Vista Bank", label: "Vista Bank" },
  { value: "Banque Centrale", label: "Banque Centrale" },
  { value: "other", label: "Autre" },
]

export function CashDepositDialog({
  payment,
  open,
  onOpenChange,
  onSuccess,
}: CashDepositDialogProps) {
  const { t } = useI18n()
  const [bankReference, setBankReference] = useState("")
  const [depositDate, setDepositDate] = useState(new Date().toISOString().split("T")[0])
  const [bankName, setBankName] = useState("")
  const [isMe, setIsMe] = useState(true)
  const [depositorName, setDepositorName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const formatAmount = formatAmountWithCurrency

  const handleSubmit = async () => {
    if (!payment || !bankReference || !depositDate || !bankName) {
      setError(t.treasury.deposit.fillRequiredFields)
      return
    }

    if (!isMe && !depositorName) {
      setError(t.treasury.deposit.depositorNameRequired)
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`/api/payments/${payment.id}/deposit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bankReference,
          depositDate: new Date(depositDate).toISOString(),
          bankName: bankName === "other" ? "Autre" : bankName,
          depositedByName: isMe ? t.treasury.deposit.myself : depositorName,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || t.treasury.deposit.depositFailed)
      }

      resetForm()
      onSuccess()
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : t.treasury.deposit.errorOccurred)
    } finally {
      setIsSubmitting(false)
    }
  }

  function resetForm() {
    setBankReference("")
    setDepositDate(new Date().toISOString().split("T")[0])
    setBankName("")
    setIsMe(true)
    setDepositorName("")
    setError(null)
  }

  function handleOpenChange(newOpen: boolean) {
    if (!newOpen) resetForm()
    onOpenChange(newOpen)
  }

  if (!payment) return null

  return (
    <FormDialog
      open={open}
      onOpenChange={handleOpenChange}
      title={t.treasury.deposit.title}
      description={t.treasury.deposit.description}
      icon={Building2}
      accentColor="blue"
      submitLabel={t.treasury.deposit.submitLabel}
      submitIcon={BanknoteIcon}
      onSubmit={handleSubmit}
      onCancel={() => handleOpenChange(false)}
      isSubmitting={isSubmitting}
      isDisabled={!bankReference || !depositDate || !bankName}
      error={error}
    >
      {/* Payment Info Summary */}
      <div className="p-3 rounded-lg bg-muted/50 border">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-medium">
              {payment.enrollment?.student?.firstName ?? "N/A"}{" "}
              {payment.enrollment?.student?.lastName ?? ""}
            </p>
            <p className="text-sm text-muted-foreground">
              {payment.receiptNumber}
            </p>
          </div>
          <p className="font-mono font-bold text-lg">
            {formatAmount(payment.amount)}
          </p>
        </div>
      </div>

      {/* Bank Reference */}
      <FormField label={t.treasury.bankReference} required>
        <Input
          placeholder={t.treasury.bankRefPlaceholder}
          value={bankReference}
          onChange={(e) => setBankReference(e.target.value)}
        />
      </FormField>

      {/* Deposit Date */}
      <FormField label={t.treasury.deposit.depositDate} required>
        <Input
          type="date"
          value={depositDate}
          onChange={(e) => setDepositDate(e.target.value)}
          max={new Date().toISOString().split("T")[0]}
        />
      </FormField>

      {/* Bank Name */}
      <FormField label={t.treasury.bankName} required>
        <Select value={bankName} onValueChange={setBankName}>
          <SelectTrigger>
            <SelectValue placeholder={t.treasury.deposit.selectBank} />
          </SelectTrigger>
          <SelectContent>
            {BANKS.map((bank) => (
              <SelectItem key={bank.value} value={bank.value}>
                {bank.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>

      {/* Depositor */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <User className="h-4 w-4" />
          {t.treasury.deposit.depositedBy}
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="isMe"
            checked={isMe}
            onCheckedChange={(checked) => setIsMe(checked === true)}
          />
          <Label htmlFor="isMe" className="text-sm font-medium leading-none cursor-pointer">
            {t.treasury.deposit.myself}
          </Label>
        </div>
        {!isMe && (
          <Input
            placeholder={t.treasury.deposit.depositorNamePlaceholder}
            value={depositorName}
            onChange={(e) => setDepositorName(e.target.value)}
          />
        )}
      </div>
    </FormDialog>
  )
}
