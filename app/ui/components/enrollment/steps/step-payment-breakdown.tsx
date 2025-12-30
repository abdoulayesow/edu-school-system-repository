"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { useEnrollmentWizard } from "../wizard-context"
import { useI18n } from "@/components/i18n-provider"
import { calculatePaymentSchedules } from "@/lib/enrollment/calculations"
import { AlertTriangle, Calendar, Check, Percent } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/utils/currency"
import { sizing } from "@/lib/design-tokens"

// Percentage presets for quick selection
const PERCENTAGE_PRESETS = [10, 25, 50, 75, 100]

export function StepPaymentBreakdown() {
  const { t } = useI18n()
  const { state, updateData } = useEnrollmentWizard()
  const { data } = state

  // Calculate payment schedules
  const schedules = useMemo(() => {
    const tuitionFee = data.adjustedTuitionFee || data.originalTuitionFee
    if (!tuitionFee) return []

    // Assume school year starts in September
    const schoolYearStart = new Date()
    schoolYearStart.setMonth(8) // September
    schoolYearStart.setDate(1)

    return calculatePaymentSchedules(tuitionFee, schoolYearStart)
  }, [data.adjustedTuitionFee, data.originalTuitionFee])

  // Update schedules in state when calculated
  useEffect(() => {
    if (schedules.length > 0) {
      // Convert Date objects to ISO strings for storage
      const schedulesWithStringDates = schedules.map(s => ({
        scheduleNumber: s.scheduleNumber,
        amount: s.amount,
        months: s.months,
        dueDate: s.dueDate.toISOString(),
      }))
      updateData({ paymentSchedules: schedulesWithStringDates })
    }
  }, [schedules, updateData])


  // Handle fee adjustment toggle
  const handleAdjustmentToggle = (enabled: boolean) => {
    if (!enabled) {
      updateData({
        adjustedTuitionFee: undefined,
        adjustmentReason: undefined,
      })
    } else {
      updateData({
        adjustedTuitionFee: data.originalTuitionFee,
      })
    }
  }

  // Calculate current percentage
  const currentPercentage = useMemo(() => {
    if (!data.originalTuitionFee || !data.adjustedTuitionFee) return 100
    return Math.round((data.adjustedTuitionFee / data.originalTuitionFee) * 100)
  }, [data.adjustedTuitionFee, data.originalTuitionFee])

  // Handle adjusted amount change
  const handleAmountChange = (value: string) => {
    const amount = parseInt(value.replace(/\D/g, ""), 10)
    if (!isNaN(amount) && amount > 0) {
      updateData({ adjustedTuitionFee: amount })
    }
  }

  // Handle percentage preset button click
  const handlePercentageClick = (percentage: number) => {
    const newAmount = Math.round((data.originalTuitionFee * percentage) / 100)
    updateData({ adjustedTuitionFee: newAmount })
  }

  // Handle slider change
  const handleSliderChange = (value: number[]) => {
    const percentage = value[0]
    const newAmount = Math.round((data.originalTuitionFee * percentage) / 100)
    updateData({ adjustedTuitionFee: newAmount })
  }

  const hasAdjustment = data.adjustedTuitionFee !== undefined
  const isAdjusted =
    hasAdjustment && data.adjustedTuitionFee !== data.originalTuitionFee
  const displayTotal = data.adjustedTuitionFee || data.originalTuitionFee

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">
          {t.enrollmentWizard.paymentBreakdown}
        </h3>
        <p className="text-sm text-muted-foreground">
          {t.enrollmentWizard.totalYearlyAmount}: {data.gradeName}
        </p>
      </div>

      {/* Total Amount Display */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                {t.enrollmentWizard.totalYearlyAmount}
              </p>
              <p className="text-3xl font-bold text-primary">
                {formatCurrency(displayTotal)}
              </p>
              {isAdjusted && (
                <p className="text-sm text-muted-foreground line-through">
                  {t.enrollmentWizard.originalAmount}:{" "}
                  {formatCurrency(data.originalTuitionFee)}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="adjust"
                checked={hasAdjustment}
                onCheckedChange={handleAdjustmentToggle}
              />
              <Label htmlFor="adjust" className="text-sm">
                {t.enrollmentWizard.adjustAmount}
              </Label>
            </div>
          </div>

          {/* Adjustment Fields */}
          {hasAdjustment && (
            <div className="mt-4 pt-4 border-t space-y-4">
              {/* Percentage Preset Buttons */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Percent className={sizing.icon.sm} />
                  {t.enrollmentWizard.percentagePresets || "Quick Percentages"}
                </Label>
                <div className="flex flex-wrap gap-2">
                  {PERCENTAGE_PRESETS.map((pct) => (
                    <Button
                      key={pct}
                      type="button"
                      variant={currentPercentage === pct ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePercentageClick(pct)}
                      className="min-w-[60px]"
                    >
                      {pct}%
                    </Button>
                  ))}
                </div>
              </div>

              {/* Percentage Slider */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>{t.enrollmentWizard.adjustPercentage || "Adjust Percentage"}</Label>
                  <Badge variant="secondary" className="font-mono">
                    {currentPercentage}%
                  </Badge>
                </div>
                <Slider
                  value={[currentPercentage]}
                  onValueChange={handleSliderChange}
                  min={0}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Amount Input and Reason */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="adjustedAmount">
                    {t.enrollmentWizard.adjustedAmount} (GNF)
                  </Label>
                  <Input
                    id="adjustedAmount"
                    type="text"
                    value={data.adjustedTuitionFee?.toLocaleString() || ""}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    placeholder="1,000,000"
                  />
                  <p className="text-xs text-muted-foreground">
                    {t.enrollmentWizard.originalAmount || "Original"}: {formatCurrency(data.originalTuitionFee)}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reason">
                    {t.enrollmentWizard.adjustmentReason}
                  </Label>
                  <Input
                    id="reason"
                    value={data.adjustmentReason || ""}
                    onChange={(e) =>
                      updateData({ adjustmentReason: e.target.value })
                    }
                    placeholder={t.enrollmentWizard.adjustmentReason}
                  />
                </div>
              </div>

              {isAdjusted && (
                <Alert variant="destructive">
                  <AlertTriangle className={sizing.icon.sm} />
                  <AlertDescription>
                    {t.enrollmentWizard.requiresApproval}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Schedules */}
      <div className="space-y-4">
        <h4 className="font-medium">
          {t.enrollmentWizard.paymentBreakdown} (3 {t.enrollmentWizard.schedule1.split(" ")[0]}s)
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {schedules.map((schedule, index) => {
            const monthsLabel = [
              t.enrollmentWizard.schedule1Months,
              t.enrollmentWizard.schedule2Months,
              t.enrollmentWizard.schedule3Months,
            ][index]

            return (
              <Card key={schedule.scheduleNumber}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center justify-between">
                    {t.enrollmentWizard[`schedule${schedule.scheduleNumber}` as keyof typeof t.enrollmentWizard]}
                    <Badge variant="outline" className="font-mono">
                      {formatCurrency(schedule.amount)}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {monthsLabel}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className={sizing.icon.sm} />
                    <span>
                      {t.enrollmentWizard.dueBy}{" "}
                      {new Date(schedule.dueDate).toLocaleDateString("fr-GN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Summary */}
      <div className="bg-muted/50 rounded-lg p-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          {schedules.map((schedule) => (
            <div key={schedule.scheduleNumber}>
              <p className="text-2xl font-bold">
                {formatCurrency(schedule.amount)}
              </p>
              <p className="text-xs text-muted-foreground">
                {t.enrollmentWizard[`schedule${schedule.scheduleNumber}` as keyof typeof t.enrollmentWizard]}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t text-center">
          <p className="text-sm text-muted-foreground">
            {t.enrollmentWizard.totalYearlyAmount}
          </p>
          <p className="text-2xl font-bold text-primary">
            {formatCurrency(displayTotal)}
          </p>
        </div>
      </div>
    </div>
  )
}
