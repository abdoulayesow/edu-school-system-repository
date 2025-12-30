"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { useEnrollmentWizard } from "../wizard-context"
import { useI18n } from "@/components/i18n-provider"
import { calculatePaymentSchedules } from "@/lib/enrollment/calculations"
import { Banknote, Smartphone, Upload, Check, SkipForward, Info, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/utils/currency"
import { sizing } from "@/lib/design-tokens"

export function StepPaymentTransaction() {
  const { t } = useI18n()
  const { state, updateData, nextStep } = useEnrollmentWizard()
  const { data } = state

  const [showPaymentForm, setShowPaymentForm] = useState(data.paymentMade)
  const [isGeneratingReceipt, setIsGeneratingReceipt] = useState(false)


  // Calculate coverage based on payment amount
  const totalTuition = data.adjustedTuitionFee || data.originalTuitionFee || 0
  const paymentAmount = data.paymentAmount || 0

  // Calculate simple coverage for new enrollment (no existing payments)
  // Use current school year start (September 1st)
  const currentYear = new Date().getFullYear()
  const schoolYearStart = new Date().getMonth() >= 8
    ? new Date(currentYear, 8, 1)  // Sep 1 of current year
    : new Date(currentYear - 1, 8, 1)  // Sep 1 of previous year
  const schedules = totalTuition > 0 ? calculatePaymentSchedules(totalTuition, schoolYearStart) : []
  const percentPaid = totalTuition > 0 ? (paymentAmount / totalTuition) * 100 : 0
  const remainingBalance = Math.max(0, totalTuition - paymentAmount)

  // Calculate which months are covered based on payment amount
  const coveredMonths: string[] = []
  let remainingPayment = paymentAmount
  for (const schedule of schedules) {
    if (remainingPayment >= schedule.amount) {
      coveredMonths.push(...schedule.months)
      remainingPayment -= schedule.amount
    } else if (remainingPayment > 0) {
      // Partial coverage of this schedule - add proportional months
      const coverageRatio = remainingPayment / schedule.amount
      const monthsToAdd = Math.ceil(schedule.months.length * coverageRatio)
      coveredMonths.push(...schedule.months.slice(0, monthsToAdd))
      remainingPayment = 0
    }
  }

  const coverage = { percentPaid, coveredMonths, remainingBalance }

  // Fetch next receipt number from API
  const fetchNextReceiptNumber = useCallback(async (method: "cash" | "orange_money") => {
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

  // Handle payment method change
  const handleMethodChange = async (method: "cash" | "orange_money") => {
    updateData({ paymentMethod: method })

    // Auto-generate receipt number if not already set or if method changed
    if (!data.receiptNumber || !data.receiptNumber.includes(method === "cash" ? "CASH" : "OM")) {
      const receiptNumber = await fetchNextReceiptNumber(method)
      if (receiptNumber) {
        updateData({ receiptNumber })
      }
    }
  }

  // Handle amount change
  const handleAmountChange = (value: string) => {
    const amount = parseInt(value.replace(/\D/g, ""), 10)
    if (!isNaN(amount) && amount >= 0) {
      updateData({ paymentAmount: amount, paymentMade: amount > 0 })
    } else if (value === "") {
      updateData({ paymentAmount: undefined, paymentMade: false })
    }
  }

  // Skip payment
  const handleSkipPayment = () => {
    updateData({
      paymentMade: false,
      paymentAmount: undefined,
      paymentMethod: undefined,
      receiptNumber: undefined,
      transactionRef: undefined,
    })
    nextStep()
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">
          {t.enrollmentWizard.paymentTransaction}
        </h3>
        <p className="text-sm text-muted-foreground">
          {t.enrollmentWizard.paymentOptional}
        </p>
      </div>

      {/* Payment Option */}
      {!showPaymentForm ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card
            className="cursor-pointer hover:border-primary transition-colors"
            onClick={() => setShowPaymentForm(true)}
          >
            <CardContent className="pt-6 text-center">
              <Banknote className={sizing.icon.xl + " mx-auto text-primary mb-4"} />
              <CardTitle className="text-base">
                {t.enrollmentWizard.makePayment}
              </CardTitle>
              <CardDescription className="mt-2">
                {t.enrollmentWizard.paymentCoverage}
              </CardDescription>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:border-muted-foreground transition-colors"
            onClick={handleSkipPayment}
          >
            <CardContent className="pt-6 text-center">
              <SkipForward className={sizing.icon.xl + " mx-auto text-muted-foreground mb-4"} />
              <CardTitle className="text-base text-muted-foreground">
                {t.enrollmentWizard.skipPayment}
              </CardTitle>
              <CardDescription className="mt-2">
                {t.enrollmentWizard.paymentOptional}
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Payment Method */}
          <div className="space-y-4">
            <Label>{t.enrollmentWizard.paymentMethod}</Label>
            <RadioGroup
              value={data.paymentMethod || ""}
              onValueChange={(v) => handleMethodChange(v as "cash" | "orange_money")}
              className="grid grid-cols-2 gap-4"
            >
              <Label
                htmlFor="cash"
                className={cn(
                  "flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors",
                  data.paymentMethod === "cash" && "border-primary bg-primary/5"
                )}
              >
                <RadioGroupItem value="cash" id="cash" />
                <Banknote className={sizing.toolbarIcon} />
                <span>{t.enrollmentWizard.cash}</span>
              </Label>
              <Label
                htmlFor="orange_money"
                className={cn(
                  "flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors",
                  data.paymentMethod === "orange_money" &&
                    "border-primary bg-primary/5"
                )}
              >
                <RadioGroupItem value="orange_money" id="orange_money" />
                <Smartphone className={sizing.toolbarIcon} />
                <span>{t.enrollmentWizard.orangeMoney}</span>
              </Label>
            </RadioGroup>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">{t.enrollmentWizard.amount} (GNF)</Label>
            <Input
              id="amount"
              type="text"
              value={data.paymentAmount?.toLocaleString() || ""}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="500,000"
            />
            <p className="text-sm text-muted-foreground">
              {t.enrollmentWizard.totalYearlyAmount}: {formatCurrency(totalTuition)}
            </p>
          </div>

          {/* Payment Coverage Preview */}
          {paymentAmount > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">
                  {t.enrollmentWizard.paymentCoverage}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {t.enrollmentWizard.percentPaid}
                    </span>
                    <Badge variant={coverage.percentPaid >= 100 ? "default" : "secondary"}>
                      {coverage.percentPaid.toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {coverage.coveredMonths.map((month) => (
                      <Badge key={month} variant="outline" className="gap-1">
                        <Check className={sizing.icon.xs} />
                        {month}
                      </Badge>
                    ))}
                  </div>
                  {coverage.remainingBalance > 0 && (
                    <p className="text-sm text-muted-foreground">
                      Remaining: {formatCurrency(coverage.remainingBalance)}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Receipt Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="receiptNumber">
                {t.enrollmentWizard.receiptNumber}
              </Label>
              <div className="relative">
                <Input
                  id="receiptNumber"
                  value={data.receiptNumber || ""}
                  readOnly
                  disabled={!isGeneratingReceipt}
                  placeholder={
                    data.paymentMethod === "orange_money"
                      ? "GSPN-2025-OM-00001"
                      : "GSPN-2025-CASH-00001"
                  }
                  className={cn(
                    "font-mono bg-muted cursor-not-allowed",
                    isGeneratingReceipt && "pr-10"
                  )}
                />
                {isGeneratingReceipt && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className={sizing.icon.sm + " animate-spin text-muted-foreground"} />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Badge variant="secondary" className="text-xs py-0">
                  {t.enrollmentWizard.autoGenerated || "Auto-generated"}
                </Badge>
                <span>{t.enrollmentWizard.receiptIdUnique || "Unique receipt ID"}</span>
              </div>
            </div>
            {data.paymentMethod === "orange_money" && (
              <div className="space-y-2">
                <Label htmlFor="transactionRef">
                  {t.enrollmentWizard.transactionRef}
                </Label>
                <Input
                  id="transactionRef"
                  value={data.transactionRef || ""}
                  onChange={(e) => updateData({ transactionRef: e.target.value })}
                  placeholder="Transaction ID"
                />
              </div>
            )}
          </div>

          {/* Receipt Upload */}
          <div className="space-y-2">
            <Label htmlFor="receipt">{t.enrollmentWizard.uploadReceipt}</Label>
            <div className="flex items-center gap-4">
              <Input
                id="receipt"
                type="file"
                accept="image/*,.pdf"
                className="flex-1"
                onChange={(e) => {
                  // Handle file upload - in real app, upload to storage
                  const file = e.target.files?.[0]
                  if (file) {
                    // For now, just store the file name
                    updateData({ receiptImageUrl: URL.createObjectURL(file) })
                  }
                }}
              />
              <Button variant="outline" size="icon" className="bg-transparent shrink-0">
                <Upload className={sizing.icon.sm} />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {t.enrollmentWizard.receiptRequired}
            </p>
          </div>

          {/* Cancel Payment */}
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setShowPaymentForm(false)
              updateData({
                paymentMade: false,
                paymentAmount: undefined,
                paymentMethod: undefined,
                receiptNumber: undefined,
                transactionRef: undefined,
              })
            }}
            className="text-muted-foreground"
          >
            {t.enrollmentWizard.skipPayment}
          </Button>
        </div>
      )}

      {/* Info Alert */}
      <Alert>
        <Info className={sizing.icon.sm} />
        <AlertDescription>{t.enrollmentWizard.paymentOptional}</AlertDescription>
      </Alert>
    </div>
  )
}
