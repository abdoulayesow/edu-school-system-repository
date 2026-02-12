"use client"

import { useState, useCallback, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import {
  Banknote,
  Smartphone,
  User,
  UserCircle,
  Users,
  Loader2,
  Check,
  Info,
} from "lucide-react"
import { usePaymentWizard, type PayerType } from "../wizard-context"
import { useI18n } from "@/components/i18n-provider"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/format"
import { sizing, typography, interactive } from "@/lib/design-tokens"

export function StepPaymentEntry() {
  const { t, locale } = useI18n()
  const { state, updateData } = usePaymentWizard()
  const { data } = state

  const [isGeneratingReceipt, setIsGeneratingReceipt] = useState(false)

  // Quick amount buttons (percentages of remaining balance)
  const quickAmounts = [
    { label: "25%", value: Math.round(data.remainingBalance * 0.25) },
    { label: "50%", value: Math.round(data.remainingBalance * 0.5) },
    { label: "100%", value: data.remainingBalance },
  ]

  // Fetch next receipt number
  const fetchReceiptNumber = useCallback(async (method: "cash" | "orange_money") => {
    setIsGeneratingReceipt(true)
    try {
      const response = await fetch(`/api/payments/next-receipt-number?method=${method}`)
      if (response.ok) {
        const data = await response.json()
        return data.receiptNumber
      }
    } catch (err) {
      console.error("Failed to fetch receipt number:", err)
    } finally {
      setIsGeneratingReceipt(false)
    }
    return null
  }, [])

  // Auto-generate receipt number when method changes
  useEffect(() => {
    async function generateReceipt() {
      if (data.paymentMethod && !data.receiptNumber) {
        const receiptNumber = await fetchReceiptNumber(data.paymentMethod)
        if (receiptNumber) {
          updateData({ receiptNumber })
        }
      }
    }
    generateReceipt()
  }, [data.paymentMethod, data.receiptNumber, fetchReceiptNumber, updateData])

  // Handle payment method change
  const handleMethodChange = async (method: "cash" | "orange_money") => {
    updateData({ paymentMethod: method, receiptNumber: undefined })
  }

  // Handle amount change
  const handleAmountChange = (value: string) => {
    const amount = parseInt(value.replace(/\D/g, ""), 10)
    if (!isNaN(amount) && amount >= 0) {
      // Cap at remaining balance
      const cappedAmount = Math.min(amount, data.remainingBalance)
      updateData({ paymentAmount: cappedAmount })
    } else if (value === "") {
      updateData({ paymentAmount: undefined })
    }
  }

  // Handle payer type selection
  const handlePayerTypeChange = (type: PayerType) => {
    let payerInfo = { type, name: "", phone: "", email: "" }

    // Pre-fill from enrollment payer info
    switch (type) {
      case "father":
        payerInfo = {
          type,
          name: data.enrollmentPayerInfo?.fatherName || "",
          phone: data.enrollmentPayerInfo?.fatherPhone || "",
          email: data.enrollmentPayerInfo?.fatherEmail || "",
        }
        break
      case "mother":
        payerInfo = {
          type,
          name: data.enrollmentPayerInfo?.motherName || "",
          phone: data.enrollmentPayerInfo?.motherPhone || "",
          email: data.enrollmentPayerInfo?.motherEmail || "",
        }
        break
      case "enrolling_person":
        payerInfo = {
          type,
          name: data.enrollmentPayerInfo?.enrollingPersonName || "",
          phone: data.enrollmentPayerInfo?.enrollingPersonPhone || "",
          email: data.enrollmentPayerInfo?.enrollingPersonEmail || "",
        }
        break
      case "other":
        payerInfo = { type, name: "", phone: "", email: "" }
        break
    }

    updateData({ payer: payerInfo })
  }

  // Get payer type options
  const payerOptions = [
    {
      value: "father" as PayerType,
      label: locale === "fr" ? "Père" : "Father",
      icon: User,
      available: !!data.enrollmentPayerInfo?.fatherName,
      name: data.enrollmentPayerInfo?.fatherName,
    },
    {
      value: "mother" as PayerType,
      label: locale === "fr" ? "Mère" : "Mother",
      icon: UserCircle,
      available: !!data.enrollmentPayerInfo?.motherName,
      name: data.enrollmentPayerInfo?.motherName,
    },
    {
      value: "enrolling_person" as PayerType,
      label: locale === "fr" ? "Personne inscrivante" : "Enrolling Person",
      icon: Users,
      available: !!data.enrollmentPayerInfo?.enrollingPersonName,
      name: data.enrollmentPayerInfo?.enrollingPersonName,
    },
    {
      value: "other" as PayerType,
      label: locale === "fr" ? "Autre" : "Other",
      icon: User,
      available: true,
      name: null,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Payment Method */}
      <div className="space-y-4">
        <Label className="text-sm font-medium">
          {t?.paymentWizard?.paymentMethod || "Payment Method"}
        </Label>
        <RadioGroup
          value={data.paymentMethod || ""}
          onValueChange={(v) => handleMethodChange(v as "cash" | "orange_money")}
          className="grid grid-cols-2 gap-4"
        >
          <Label
            htmlFor="cash"
            className={cn(
              "flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all",
              interactive.card,
              data.paymentMethod === "cash"
                ? "border-emerald-500 bg-emerald-50 dark:border-emerald-400 dark:bg-emerald-950/30"
                : "border-muted hover:border-muted-foreground/50"
            )}
          >
            <RadioGroupItem value="cash" id="cash" className="sr-only" />
            <div className={cn(
              "p-2.5 rounded-full",
              data.paymentMethod === "cash"
                ? "bg-emerald-100 dark:bg-emerald-900/50"
                : "bg-muted"
            )}>
              <Banknote className={cn(
                sizing.icon.md,
                data.paymentMethod === "cash"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-muted-foreground"
              )} />
            </div>
            <div>
              <span className="font-medium">{locale === "fr" ? "Espèces" : "Cash"}</span>
              {data.paymentMethod === "cash" && (
                <Check className={cn(sizing.icon.sm, "inline ml-2 text-emerald-600 dark:text-emerald-400")} />
              )}
            </div>
          </Label>

          <Label
            htmlFor="orange_money"
            className={cn(
              "flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all",
              interactive.card,
              data.paymentMethod === "orange_money"
                ? "border-orange-500 bg-orange-50 dark:border-orange-400 dark:bg-orange-950/30"
                : "border-muted hover:border-muted-foreground/50"
            )}
          >
            <RadioGroupItem value="orange_money" id="orange_money" className="sr-only" />
            <div className={cn(
              "p-2.5 rounded-full",
              data.paymentMethod === "orange_money"
                ? "bg-orange-100 dark:bg-orange-900/50"
                : "bg-muted"
            )}>
              <Smartphone className={cn(
                sizing.icon.md,
                data.paymentMethod === "orange_money"
                  ? "text-orange-600 dark:text-orange-400"
                  : "text-muted-foreground"
              )} />
            </div>
            <div>
              <span className="font-medium">Orange Money</span>
              {data.paymentMethod === "orange_money" && (
                <Check className={cn(sizing.icon.sm, "inline ml-2 text-orange-600 dark:text-orange-400")} />
              )}
            </div>
          </Label>
        </RadioGroup>
      </div>

      {/* Amount Section */}
      <div className="space-y-3">
        <Label htmlFor="amount" className="text-sm font-medium">
          {t?.paymentWizard?.amount || "Amount"} (GNF)
        </Label>
        <Input
          id="amount"
          type="text"
          value={data.paymentAmount?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") || ""}
          onChange={(e) => handleAmountChange(e.target.value)}
          placeholder="0"
          className={cn(typography.currency.md, "h-14 text-right")}
        />

        {/* Quick Amount Buttons */}
        <div className="flex gap-2">
          {quickAmounts.map((qa) => (
            <Button
              key={qa.label}
              type="button"
              variant={data.paymentAmount === qa.value ? "default" : "outline"}
              size="sm"
              onClick={() => updateData({ paymentAmount: qa.value })}
              className="flex-1"
            >
              {qa.label}
              <span className="ml-1 text-xs opacity-70">
                ({formatCurrency(qa.value)})
              </span>
            </Button>
          ))}
        </div>

        {/* Balance Info */}
        <div className="flex items-center justify-between text-sm text-muted-foreground p-2 bg-muted/50 rounded">
          <span>{t?.paymentWizard?.remainingBalance || "Remaining balance"}:</span>
          <span className={typography.currency.sm}>{formatCurrency(data.remainingBalance)}</span>
        </div>
      </div>

      {/* Receipt and Transaction Reference */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="receiptNumber">
            {t?.paymentWizard?.receiptNumber || "Receipt Number"}
          </Label>
          <div className="relative">
            <Input
              id="receiptNumber"
              value={data.receiptNumber || ""}
              readOnly
              placeholder={isGeneratingReceipt ? "Generating..." : "Select payment method"}
              className={cn(
                "font-mono bg-muted cursor-not-allowed",
                isGeneratingReceipt && "pr-10"
              )}
            />
            {isGeneratingReceipt && (
              <Loader2 className={cn(
                "absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground",
                sizing.icon.sm
              )} />
            )}
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Info className={sizing.icon.xs} />
            {locale === "fr" ? "Généré automatiquement" : "Auto-generated"}
          </p>
        </div>

        {data.paymentMethod === "orange_money" && (
          <div className="space-y-2">
            <Label htmlFor="transactionRef">
              {t?.paymentWizard?.transactionRef || "Transaction Reference"} *
            </Label>
            <Input
              id="transactionRef"
              value={data.transactionRef || ""}
              onChange={(e) => updateData({ transactionRef: e.target.value })}
              placeholder="e.g., MP24010100001"
            />
            <p className="text-xs text-muted-foreground">
              {locale === "fr"
                ? "Référence fournie par Orange Money"
                : "Reference provided by Orange Money"}
            </p>
          </div>
        )}
      </div>

      {/* Payer Selection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className={sizing.icon.sm} />
            {t?.paymentWizard?.payerInfo || "Payer Information"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Payer Type Selection */}
          <RadioGroup
            value={data.payer?.type || ""}
            onValueChange={(v) => handlePayerTypeChange(v as PayerType)}
            className="grid grid-cols-2 md:grid-cols-4 gap-2"
          >
            {payerOptions.map((option) => {
              const Icon = option.icon
              const isSelected = data.payer?.type === option.value
              return (
                <Label
                  key={option.value}
                  htmlFor={`payer-${option.value}`}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 border rounded-lg cursor-pointer transition-all text-center",
                    interactive.card,
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-muted hover:border-muted-foreground/50",
                    !option.available && option.value !== "other" && "opacity-50"
                  )}
                >
                  <RadioGroupItem
                    value={option.value}
                    id={`payer-${option.value}`}
                    className="sr-only"
                  />
                  <Icon className={cn(
                    sizing.icon.md,
                    isSelected ? "text-primary" : "text-muted-foreground"
                  )} />
                  <span className="text-sm font-medium">{option.label}</span>
                  {option.name && (
                    <span className="text-xs text-muted-foreground truncate max-w-full">
                      {option.name}
                    </span>
                  )}
                  {isSelected && (
                    <Badge className="text-xs" variant="secondary">
                      <Check className={cn(sizing.icon.xs, "mr-1")} />
                      {locale === "fr" ? "Sélectionné" : "Selected"}
                    </Badge>
                  )}
                </Label>
              )
            })}
          </RadioGroup>

          {/* Payer Details (editable for "other" or to override) */}
          {data.payer && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="payerName">
                    {t?.paymentWizard?.payerName || "Payer Name"} *
                  </Label>
                  <Input
                    id="payerName"
                    value={data.payer.name}
                    onChange={(e) => updateData({
                      payer: { ...data.payer!, name: e.target.value }
                    })}
                    placeholder={locale === "fr" ? "Nom complet" : "Full name"}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payerPhone">
                    {t?.paymentWizard?.payerPhone || "Phone Number"} *
                  </Label>
                  <Input
                    id="payerPhone"
                    type="tel"
                    value={data.payer.phone}
                    onChange={(e) => updateData({
                      payer: { ...data.payer!, phone: e.target.value }
                    })}
                    placeholder="+224 XXX XX XX XX"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="payerEmail">
                  {t?.paymentWizard?.payerEmail || "Email"} ({locale === "fr" ? "optionnel" : "optional"})
                </Label>
                <Input
                  id="payerEmail"
                  type="email"
                  value={data.payer.email || ""}
                  onChange={(e) => updateData({
                    payer: { ...data.payer!, email: e.target.value }
                  })}
                  placeholder="email@example.com"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes (optional) */}
      <div className="space-y-2">
        <Label htmlFor="notes">
          {t?.paymentWizard?.notes || "Notes"} ({locale === "fr" ? "optionnel" : "optional"})
        </Label>
        <Input
          id="notes"
          value={data.notes || ""}
          onChange={(e) => updateData({ notes: e.target.value })}
          placeholder={locale === "fr" ? "Notes supplémentaires..." : "Additional notes..."}
        />
      </div>
    </div>
  )
}
