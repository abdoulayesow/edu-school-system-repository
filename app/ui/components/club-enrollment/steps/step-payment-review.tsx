"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Users,
  GraduationCap,
  User,
  Calendar,
  DollarSign,
  CreditCard,
  Edit,
  AlertCircle,
  CalendarClock,
  Calculator,
  Info,
} from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { sizing } from "@/lib/design-tokens"
import { useI18n } from "@/components/i18n-provider"
import { useClubEnrollmentWizard } from "../wizard-context"

interface MonthInfo {
  month: string
  year: number
  isPast: boolean
  isToday: boolean
}

export function StepPaymentReview() {
  const { t, locale } = useI18n()
  const { state, setPayment, goToStep } = useClubEnrollmentWizard()

  const [isEditingTotal, setIsEditingTotal] = useState(false)
  const [customTotal, setCustomTotal] = useState<string>("")
  const [showProrationDialog, setShowProrationDialog] = useState(false)
  const [hasShownProrationPrompt, setHasShownProrationPrompt] = useState(false)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-GN", {
      style: "currency",
      currency: "GNF",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }

  // Calculate monthly fee breakdown
  const monthlyCalculation = useMemo(() => {
    if (!state.data.startDate || !state.data.endDate || !state.data.monthlyFee) {
      return {
        months: [],
        totalMonths: 0,
        totalMonthlyFees: 0,
        remainingMonths: 0,
        proratedMonthlyFees: 0,
        isMidYear: false,
      }
    }

    const start = new Date(state.data.startDate)
    const end = new Date(state.data.endDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const months: MonthInfo[] = []
    const current = new Date(start)

    while (current <= end) {
      const monthDate = new Date(current)
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
      const isToday = today >= monthStart && today < new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1)
      const isPast = today > new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0)

      months.push({
        month: monthDate.toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US", {
          month: "long",
          year: "numeric",
        }),
        year: monthDate.getFullYear(),
        isPast,
        isToday,
      })

      current.setMonth(current.getMonth() + 1)
    }

    const totalMonths = months.length
    const remainingMonths = months.filter(m => !m.isPast).length
    const isMidYear = remainingMonths < totalMonths && remainingMonths > 0

    return {
      months,
      totalMonths,
      totalMonthlyFees: totalMonths * (state.data.monthlyFee || 0),
      remainingMonths,
      proratedMonthlyFees: remainingMonths * (state.data.monthlyFee || 0),
      isMidYear,
    }
  }, [state.data.startDate, state.data.endDate, state.data.monthlyFee, locale])

  // Show proration dialog on mid-year enrollment (once per session)
  useEffect(() => {
    if (monthlyCalculation.isMidYear && !hasShownProrationPrompt && !isEditingTotal) {
      setShowProrationDialog(true)
      setHasShownProrationPrompt(true)
    }
  }, [monthlyCalculation.isMidYear, hasShownProrationPrompt, isEditingTotal])

  // Calculate total fees
  const fullYearTotal = (state.data.enrollmentFee || 0) + monthlyCalculation.totalMonthlyFees
  const proratedTotal = (state.data.enrollmentFee || 0) + monthlyCalculation.proratedMonthlyFees
  const displayTotal = isEditingTotal && customTotal ? parseInt(customTotal) || 0 : fullYearTotal

  const handlePaymentChange = (field: string, value: string | number) => {
    setPayment({ [field]: value })
  }

  const handleApplyProration = () => {
    setCustomTotal(proratedTotal.toString())
    setIsEditingTotal(true)
    setShowProrationDialog(false)
  }

  const handleKeepFullAmount = () => {
    setShowProrationDialog(false)
  }

  const handleToggleEditTotal = () => {
    if (!isEditingTotal) {
      setCustomTotal(fullYearTotal.toString())
      setIsEditingTotal(true)
    } else {
      setCustomTotal("")
      setIsEditingTotal(false)
    }
  }

  const initials = state.data.studentName
    ? state.data.studentName
        .split(" ")
        .map((n) => n[0])
        .join("")
    : "?"

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Review & Payment</h2>
        <p className="text-gray-600">Review enrollment details and record payment (optional)</p>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Club Summary */}
        <div className="p-6 bg-white border-2 border-gray-200 rounded-xl space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg text-gray-900">Club Details</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => goToStep(1)}
              className="gap-1 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
            >
              <Edit className={sizing.icon.xs} />
              Edit
            </Button>
          </div>

          <div className="space-y-3">
            {/* Club Name */}
            <div>
              <div className="text-sm text-gray-500 mb-1">Club Name</div>
              <div className="font-semibold text-gray-900">
                {locale === "fr" && state.data.clubNameFr
                  ? state.data.clubNameFr
                  : state.data.clubName}
              </div>
              {state.data.categoryName && (
                <Badge variant="secondary" className="mt-1">
                  {state.data.categoryName}
                </Badge>
              )}
            </div>

            {/* Leader */}
            {state.data.leaderName && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className={sizing.icon.xs} />
                <span>{state.data.leaderName}</span>
              </div>
            )}

            {/* Dates */}
            {state.data.startDate && state.data.endDate && (
              <div>
                <div className="text-sm text-gray-500 mb-1">Duration</div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Calendar className={sizing.icon.xs} />
                  <span>
                    {formatDate(state.data.startDate)} - {formatDate(state.data.endDate)}
                  </span>
                </div>
              </div>
            )}

            {/* Capacity */}
            {state.data.capacity && (
              <div>
                <div className="text-sm text-gray-500 mb-1">Enrollment</div>
                <div className="text-sm text-gray-700">
                  {state.data.currentEnrollments}/{state.data.capacity} students
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Student Summary */}
        <div className="p-6 bg-white border-2 border-gray-200 rounded-xl space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg text-gray-900">Student Details</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => goToStep(2)}
              className="gap-1 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
            >
              <Edit className={sizing.icon.xs} />
              Edit
            </Button>
          </div>

          <div className="flex items-start gap-3">
            <Avatar className="w-16 h-16 border-2 border-gray-200">
              <AvatarImage src={state.data.studentPhoto || undefined} alt={state.data.studentName} />
              <AvatarFallback className="bg-amber-100 text-amber-700 font-semibold text-lg">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="font-bold text-gray-900 mb-2">{state.data.studentName}</div>
              {state.data.studentGrade && (
                <Badge variant="outline">
                  <GraduationCap className={cn(sizing.icon.xs, "mr-1")} />
                  {state.data.studentGrade}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fee Breakdown */}
      <div className="space-y-4">
        <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
              <DollarSign className={sizing.icon.sm} />
              Fee Breakdown
            </h3>
            {state.data.monthlyFee && state.data.monthlyFee > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleEditTotal}
                className="gap-1 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
              >
                <Calculator className={sizing.icon.xs} />
                {isEditingTotal ? "Reset" : "Adjust Total"}
              </Button>
            )}
          </div>

          <div className="space-y-3">
            {/* Enrollment Fee */}
            <div className="flex justify-between text-gray-700">
              <span>Enrollment Fee (One-time)</span>
              <span className="font-semibold">{formatCurrency(state.data.enrollmentFee || 0)}</span>
            </div>

            {/* Monthly Fee Info */}
            {state.data.monthlyFee && state.data.monthlyFee > 0 && (
              <>
                <div className="flex justify-between text-gray-700">
                  <span>Monthly Fee</span>
                  <span className="font-semibold">{formatCurrency(state.data.monthlyFee)}</span>
                </div>

                {/* Monthly Breakdown */}
                {monthlyCalculation.totalMonths > 0 && (
                  <div className="pt-2 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CalendarClock className={sizing.icon.xs} />
                      <span>
                        {monthlyCalculation.totalMonths} month{monthlyCalculation.totalMonths !== 1 ? 's' : ''}
                        {state.data.startDate && state.data.endDate && (
                          <> ({formatDate(state.data.startDate)} - {formatDate(state.data.endDate)})</>
                        )}
                      </span>
                    </div>

                    {/* Mid-year indicator */}
                    {monthlyCalculation.isMidYear && (
                      <Alert className="bg-blue-50 border-blue-200 py-2">
                        <Info className={sizing.icon.sm} />
                        <AlertDescription className="text-sm">
                          {monthlyCalculation.remainingMonths} of {monthlyCalculation.totalMonths} months remaining.
                          Prorated amount: {formatCurrency(proratedTotal)}
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Total Monthly Fees ({monthlyCalculation.totalMonths} × {formatCurrency(state.data.monthlyFee)})</span>
                      <span className="font-semibold">{formatCurrency(monthlyCalculation.totalMonthlyFees)}</span>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Custom Total Field */}
            {isEditingTotal && (
              <div className="pt-3 border-t-2 border-amber-300 space-y-2">
                <Label htmlFor="customTotal" className="text-sm font-medium text-gray-700">
                  Adjusted Total Amount
                </Label>
                <Input
                  id="customTotal"
                  type="number"
                  value={customTotal}
                  onChange={(e) => setCustomTotal(e.target.value)}
                  className="h-11 text-lg font-bold"
                  placeholder={fullYearTotal.toString()}
                />
                <p className="text-xs text-gray-500">
                  Original total: {formatCurrency(fullYearTotal)}
                  {monthlyCalculation.isMidYear && ` • Prorated: ${formatCurrency(proratedTotal)}`}
                </p>
              </div>
            )}

            {/* Total */}
            <div className="pt-3 border-t-2 border-amber-300 flex justify-between text-lg font-bold text-gray-900">
              <span>
                Total Amount
                {monthlyCalculation.isMidYear && !isEditingTotal && (
                  <span className="ml-2 text-xs font-normal text-gray-500">(Full Year)</span>
                )}
              </span>
              <span className="text-amber-700">{formatCurrency(displayTotal)}</span>
            </div>
          </div>
        </div>

        {/* Month-by-Month Breakdown (Collapsible) */}
        {monthlyCalculation.months.length > 0 && (
          <details className="group">
            <summary className="cursor-pointer p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-amber-300 transition-colors">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-900 flex items-center gap-2">
                  <Calendar className={sizing.icon.sm} />
                  View Monthly Breakdown ({monthlyCalculation.totalMonths} months)
                </span>
                <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
              </div>
            </summary>
            <div className="mt-2 p-4 bg-white border-2 border-gray-200 rounded-xl space-y-2">
              {monthlyCalculation.months.map((m, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "flex items-center justify-between p-2 rounded-lg",
                    m.isPast && "bg-gray-100 text-gray-400 line-through",
                    m.isToday && "bg-amber-100 border-2 border-amber-400 font-semibold",
                    !m.isPast && !m.isToday && "bg-green-50"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{m.month}</span>
                    {m.isToday && (
                      <Badge variant="secondary" className="text-xs bg-amber-200 text-amber-900">
                        Current
                      </Badge>
                    )}
                    {m.isPast && (
                      <Badge variant="secondary" className="text-xs">
                        Past
                      </Badge>
                    )}
                  </div>
                  <span className="text-sm font-semibold">
                    {formatCurrency(state.data.monthlyFee || 0)}
                  </span>
                </div>
              ))}
            </div>
          </details>
        )}
      </div>

      {/* Payment Section */}
      <div className="p-6 bg-white border-2 border-gray-200 rounded-xl space-y-6">
        <div className="flex items-center gap-2">
          <CreditCard className={sizing.icon.sm} />
          <h3 className="font-bold text-lg text-gray-900">Record Payment (Optional)</h3>
        </div>

        <Alert className="bg-blue-50 border-blue-200">
          <AlertCircle className={sizing.icon.sm} />
          <AlertDescription>
            You can record payment now or later. If payment is not recorded, the enrollment will be
            saved as pending payment.
          </AlertDescription>
        </Alert>

        <div className="space-y-6">
          {/* Payment Amount */}
          <div className="space-y-2">
            <Label htmlFor="paymentAmount">Payment Amount</Label>
            <Input
              id="paymentAmount"
              type="number"
              placeholder="0"
              value={state.data.paymentAmount || ""}
              onChange={(e) => handlePaymentChange("paymentAmount", parseInt(e.target.value) || 0)}
              className="h-11"
            />
            <p className="text-sm text-gray-500">
              Enter the amount being paid (can be partial payment)
            </p>
          </div>

          {/* Payment Method */}
          {state.data.paymentAmount && state.data.paymentAmount > 0 && (
            <>
              <div className="space-y-3">
                <Label>Payment Method</Label>
                <RadioGroup
                  value={state.data.paymentMethod || ""}
                  onValueChange={(v) => handlePaymentChange("paymentMethod", v)}
                >
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:border-amber-300 transition-colors">
                    <RadioGroupItem value="cash" id="cash" />
                    <Label htmlFor="cash" className="flex-1 cursor-pointer">
                      Cash
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:border-amber-300 transition-colors">
                    <RadioGroupItem value="orange_money" id="orange_money" />
                    <Label htmlFor="orange_money" className="flex-1 cursor-pointer">
                      Orange Money
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Receipt Number */}
              <div className="space-y-2">
                <Label htmlFor="receiptNumber">Receipt Number *</Label>
                <Input
                  id="receiptNumber"
                  type="text"
                  placeholder="REC-2024-00001"
                  value={state.data.receiptNumber || ""}
                  onChange={(e) => handlePaymentChange("receiptNumber", e.target.value)}
                  className="h-11"
                  required={!!state.data.paymentAmount && state.data.paymentAmount > 0}
                />
              </div>

              {/* Transaction Reference */}
              <div className="space-y-2">
                <Label htmlFor="transactionRef">Transaction Reference (Optional)</Label>
                <Input
                  id="transactionRef"
                  type="text"
                  placeholder="OM-123456789"
                  value={state.data.transactionRef || ""}
                  onChange={(e) => handlePaymentChange("transactionRef", e.target.value)}
                  className="h-11"
                />
              </div>
            </>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional notes about this enrollment..."
              value={state.data.notes || ""}
              onChange={(e) => handlePaymentChange("notes", e.target.value)}
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* Proration Dialog */}
      <Dialog open={showProrationDialog} onOpenChange={setShowProrationDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CalendarClock className={cn(sizing.icon.md, "text-blue-700")} />
              </div>
              <div>
                <DialogTitle className="text-xl">Mid-Year Enrollment Detected</DialogTitle>
                <DialogDescription className="text-sm mt-1">
                  Adjust the total amount for remaining months?
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Alert className="bg-blue-50 border-blue-200">
              <Info className={sizing.icon.sm} />
              <AlertDescription>
                {state.data.startDate && (
                  <>
                    This club started in {formatDate(state.data.startDate)}, but we're enrolling the student today.
                    {' '}{monthlyCalculation.totalMonths - monthlyCalculation.remainingMonths} month
                    {monthlyCalculation.totalMonths - monthlyCalculation.remainingMonths !== 1 ? 's have' : ' has'} already passed.
                  </>
                )}
              </AlertDescription>
            </Alert>

            <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Full Year Total:</span>
                <span className="font-semibold text-gray-900">{formatCurrency(fullYearTotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Months Passed:</span>
                <span className="font-semibold text-gray-900">
                  {monthlyCalculation.totalMonths - monthlyCalculation.remainingMonths} of {monthlyCalculation.totalMonths}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Months Remaining:</span>
                <span className="font-semibold text-gray-900">{monthlyCalculation.remainingMonths}</span>
              </div>
              <div className="pt-2 border-t flex justify-between">
                <span className="font-semibold text-gray-900">Prorated Amount:</span>
                <span className="font-bold text-lg text-blue-700">{formatCurrency(proratedTotal)}</span>
              </div>
              <p className="text-xs text-gray-500">
                Enrollment Fee ({formatCurrency(state.data.enrollmentFee || 0)}) + Monthly Fees for {monthlyCalculation.remainingMonths} remaining months
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Button
                onClick={handleApplyProration}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Use Prorated Amount ({formatCurrency(proratedTotal)})
              </Button>
              <Button
                variant="outline"
                onClick={handleKeepFullAmount}
                className="w-full"
              >
                Keep Full Year Amount ({formatCurrency(fullYearTotal)})
              </Button>
            </div>

            <p className="text-xs text-gray-500 text-center">
              You can always adjust the total manually using the "Adjust Total" button
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
