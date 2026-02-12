"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  ChevronDown,
  Receipt,
  Calendar,
  PartyPopper,
  Sparkles,
  Wallet,
  CircleDollarSign,
  ArrowRight,
} from "lucide-react"
import { usePaymentWizard } from "../wizard-context"
import { useI18n } from "@/components/i18n-provider"
import { cn, formatDateLong } from "@/lib/utils"
import { formatCurrency } from "@/lib/format"
import { formatDate } from "@/lib/utils"
import { sizing, typography, gradients, interactive } from "@/lib/design-tokens"

export function StepPaymentSchedule() {
  const { t, locale } = useI18n()
  const { state } = usePaymentWizard()
  const { data, isFullyPaid } = state
  const [showHistory, setShowHistory] = useState(false)

  // Payment status config
  const statusConfig = {
    complete: {
      icon: CheckCircle2,
      label: locale === "fr" ? "Payé intégralement" : "Fully Paid",
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
      borderColor: "border-emerald-200 dark:border-emerald-800",
      gradientFrom: "from-emerald-500",
      gradientTo: "to-teal-500",
    },
    in_advance: {
      icon: TrendingUp,
      label: locale === "fr" ? "En avance" : "Ahead of Schedule",
      color: "text-nav-highlight dark:text-gspn-gold-200",
      bgColor: "bg-nav-highlight/10 dark:bg-gspn-gold-900/30",
      borderColor: "border-nav-highlight/30 dark:border-gspn-gold-700",
      gradientFrom: "from-gspn-gold-500",
      gradientTo: "to-gspn-gold-300",
    },
    on_time: {
      icon: Clock,
      label: locale === "fr" ? "À jour" : "On Time",
      color: "text-slate-600 dark:text-slate-400",
      bgColor: "bg-slate-100 dark:bg-slate-800",
      borderColor: "border-slate-200 dark:border-slate-700",
      gradientFrom: "from-slate-500",
      gradientTo: "to-zinc-500",
    },
    late: {
      icon: AlertCircle,
      label: locale === "fr" ? "En retard" : "Behind Schedule",
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-100 dark:bg-amber-900/30",
      borderColor: "border-amber-200 dark:border-amber-800",
      gradientFrom: "from-amber-500",
      gradientTo: "to-orange-500",
    },
  }

  const currentStatus = statusConfig[data.paymentStatus] || statusConfig.on_time
  const StatusIcon = currentStatus.icon
  const progressPercent = data.tuitionFee > 0 ? (data.totalPaid / data.tuitionFee) * 100 : 0
  const expectedPercent = data.expectedPaymentPercentage || 0

  // Schedule month labels based on schedule number
  const getScheduleMonths = (scheduleNumber: number) => {
    if (locale === "fr") {
      switch (scheduleNumber) {
        case 1: return "Septembre - Décembre"
        case 2: return "Janvier - Avril"
        case 3: return "Mai - Juin"
        default: return ""
      }
    }
    switch (scheduleNumber) {
      case 1: return "September - December"
      case 2: return "January - April"
      case 3: return "May - June"
      default: return ""
    }
  }

  // If fully paid, show celebration screen
  if (isFullyPaid) {
    return (
      <div className="space-y-6">
        {/* Celebration Header */}
        <Card className={cn(
          "border-2 shadow-xl overflow-hidden relative",
          gradients.safe.light,
          gradients.safe.dark,
          gradients.safe.border
        )}>
          {/* Decorative gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-orange-500/10 pointer-events-none" />

          {/* Sparkle decorations */}
          <div className="absolute top-4 left-8 opacity-60">
            <Sparkles className="h-6 w-6 text-amber-400 animate-pulse" />
          </div>
          <div className="absolute top-12 right-12 opacity-40">
            <Sparkles className="h-4 w-4 text-yellow-400 animate-pulse" style={{ animationDelay: "0.5s" }} />
          </div>
          <div className="absolute bottom-8 left-16 opacity-50">
            <Sparkles className="h-5 w-5 text-orange-400 animate-pulse" style={{ animationDelay: "1s" }} />
          </div>

          <CardContent className="py-12 relative">
            <div className="text-center space-y-4">
              {/* Celebration Icon */}
              <div className={cn(
                "inline-flex p-5 rounded-full",
                "bg-gradient-to-br from-amber-100 to-yellow-100",
                "dark:from-amber-900/40 dark:to-yellow-900/40",
                "ring-4 ring-amber-200 dark:ring-amber-800",
                "animate-bounce"
              )} style={{ animationDuration: "2s" }}>
                <PartyPopper className="h-12 w-12 text-amber-600 dark:text-amber-400" />
              </div>

              {/* Title */}
              <div className="space-y-2">
                <h2 className={cn(
                  "text-3xl font-bold",
                  "bg-gradient-to-r from-amber-600 via-yellow-500 to-orange-500",
                  "bg-clip-text text-transparent"
                )}>
                  {locale === "fr" ? "Félicitations!" : "Congratulations!"}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {locale === "fr"
                    ? "Cette scolarité est entièrement payée"
                    : "This tuition is fully paid"}
                </p>
              </div>

              {/* Payment Summary */}
              <div className={cn(
                "inline-flex items-center gap-3 px-6 py-3 rounded-full",
                "bg-white/60 dark:bg-black/20",
                "border border-amber-200 dark:border-amber-800"
              )}>
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <span className={cn(typography.currency.lg, "text-emerald-600 dark:text-emerald-400")}>
                  {formatCurrency(data.totalPaid)}
                </span>
                <span className="text-muted-foreground">/</span>
                <span className="text-muted-foreground">
                  {formatCurrency(data.tuitionFee)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* All Schedules - Completed */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            {locale === "fr" ? "Échéancier des paiements" : "Payment Schedule"}
          </h4>
          <div className="grid md:grid-cols-3 gap-4">
            {data.scheduleProgress.map((schedule) => (
              <Card
                key={schedule.id}
                className="border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      {locale === "fr" ? `Tranche ${schedule.scheduleNumber}` : `Payment ${schedule.scheduleNumber}`}
                    </CardTitle>
                    <div className="p-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/50">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  </div>
                  <CardDescription className="text-xs">
                    {getScheduleMonths(schedule.scheduleNumber)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(schedule.amount)}
                      </span>
                    </div>
                    {schedule.dueDate && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className={sizing.icon.xs} />
                        <span>
                          {locale === "fr" ? "Échéance:" : "Due:"} {formatDateLong(new Date(schedule.dueDate), locale)}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Payment History */}
        {data.previousPayments.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Receipt className={sizing.icon.sm} />
                {t?.paymentWizard?.paymentHistory || "Payment History"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.previousPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="font-mono text-xs">
                        {payment.receiptNumber}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {payment.method === "cash"
                          ? (locale === "fr" ? "Espèces" : "Cash")
                          : "Orange Money"}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(payment.recordedAt, locale)}
                      </span>
                    </div>
                    <span className={cn(typography.currency.sm, "text-emerald-600 dark:text-emerald-400")}>
                      +{formatCurrency(payment.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  // Normal payment schedule view (not fully paid)
  return (
    <div className="space-y-6">
      {/* Status Overview Card */}
      <Card className={cn(
        "border-2 shadow-lg overflow-hidden",
        currentStatus.borderColor
      )}>
        <CardContent className="py-6">
          {/* Status Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={cn("p-3 rounded-xl", currentStatus.bgColor)}>
                <StatusIcon className={cn("h-6 w-6", currentStatus.color)} />
              </div>
              <div>
                <h3 className={cn("text-lg font-semibold", currentStatus.color)}>
                  {currentStatus.label}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {locale === "fr"
                    ? `${data.actualPaymentPercentage || Math.round(progressPercent)}% payé • ${expectedPercent}% attendu`
                    : `${data.actualPaymentPercentage || Math.round(progressPercent)}% paid • ${expectedPercent}% expected`}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                {locale === "fr" ? "Solde restant" : "Remaining"}
              </p>
              <p className={cn(typography.currency.lg, currentStatus.color)}>
                {formatCurrency(data.remainingBalance)}
              </p>
            </div>
          </div>

          {/* Progress Bar Section */}
          <div className="space-y-3">
            <div className="relative h-4 bg-muted rounded-full overflow-hidden">
              {/* Expected progress marker */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-foreground/30 z-10"
                style={{ left: `${Math.min(expectedPercent, 100)}%` }}
              >
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-foreground/30" />
              </div>
              {/* Actual progress */}
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  "bg-gradient-to-r",
                  currentStatus.gradientFrom,
                  currentStatus.gradientTo
                )}
                style={{ width: `${Math.min(progressPercent, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {locale === "fr" ? "Payé:" : "Paid:"} <span className="font-semibold text-foreground">{formatCurrency(data.totalPaid)}</span>
              </span>
              <span className="text-muted-foreground">
                {locale === "fr" ? "Total:" : "Total:"} <span className="font-semibold text-foreground">{formatCurrency(data.tuitionFee)}</span>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Schedule Cards - Similar to Enrollment Wizard */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <CircleDollarSign className={sizing.icon.sm} />
          {locale === "fr"
            ? `Échéancier des paiements (${data.scheduleProgress.length} tranches)`
            : `Payment Schedule (${data.scheduleProgress.length} installments)`}
        </h4>

        <div className="grid md:grid-cols-3 gap-4">
          {data.scheduleProgress.map((schedule, index) => {
            const isPaid = schedule.isPaid
            const hasPartialPayment = schedule.paidAmount > 0 && !isPaid
            const paymentProgress = schedule.amount > 0 ? (schedule.paidAmount / schedule.amount) * 100 : 0

            return (
              <Card
                key={schedule.id}
                className={cn(
                  "border-2 transition-all relative overflow-hidden",
                  isPaid && "border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20",
                  hasPartialPayment && "border-amber-200 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-950/10",
                  !isPaid && !hasPartialPayment && "border-muted",
                  interactive.card
                )}
              >
                {/* Progress indicator at top */}
                {!isPaid && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-muted">
                    <div
                      className={cn(
                        "h-full transition-all",
                        hasPartialPayment ? "bg-amber-500" : "bg-muted"
                      )}
                      style={{ width: `${paymentProgress}%` }}
                    />
                  </div>
                )}

                <CardHeader className={cn("pb-2", !isPaid && "pt-4")}>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-bold">
                      {locale === "fr" ? `Tranche ${schedule.scheduleNumber}` : `Payment ${schedule.scheduleNumber}`}
                    </CardTitle>
                    <div className={cn(
                      "p-2 rounded-full",
                      isPaid && "bg-emerald-100 dark:bg-emerald-900/50",
                      hasPartialPayment && "bg-amber-100 dark:bg-amber-900/50",
                      !isPaid && !hasPartialPayment && "bg-muted"
                    )}>
                      {isPaid ? (
                        <CheckCircle2 className={cn(sizing.icon.sm, "text-emerald-600 dark:text-emerald-400")} />
                      ) : hasPartialPayment ? (
                        <Clock className={cn(sizing.icon.sm, "text-amber-600 dark:text-amber-400")} />
                      ) : (
                        <Calendar className={cn(sizing.icon.sm, "text-muted-foreground")} />
                      )}
                    </div>
                  </div>
                  <CardDescription className="text-xs font-medium">
                    {getScheduleMonths(schedule.scheduleNumber)}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Amount Display */}
                  <div className="space-y-1">
                    <div className="flex items-baseline justify-between">
                      <span className={cn(
                        "text-2xl font-bold",
                        isPaid && "text-emerald-600 dark:text-emerald-400",
                        hasPartialPayment && "text-amber-600 dark:text-amber-400",
                        !isPaid && !hasPartialPayment && "text-foreground"
                      )}>
                        {formatCurrency(schedule.amount)}
                      </span>
                      {isPaid && (
                        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400 border-0">
                          {locale === "fr" ? "Payé" : "Paid"}
                        </Badge>
                      )}
                    </div>

                    {/* Partial payment details */}
                    {hasPartialPayment && (
                      <div className="text-sm space-y-1">
                        <div className="flex items-center justify-between text-muted-foreground">
                          <span>{locale === "fr" ? "Déjà payé:" : "Already paid:"}</span>
                          <span className="font-medium text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(schedule.paidAmount)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-muted-foreground">
                          <span>{locale === "fr" ? "Reste à payer:" : "Remaining:"}</span>
                          <span className="font-medium text-amber-600 dark:text-amber-400">
                            {formatCurrency(schedule.remainingAmount)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Due Date */}
                  {schedule.dueDate && (
                    <div className={cn(
                      "flex items-center gap-2 p-2 rounded-lg text-sm",
                      isPaid && "bg-emerald-100/50 dark:bg-emerald-900/20",
                      hasPartialPayment && "bg-amber-100/50 dark:bg-amber-900/20",
                      !isPaid && !hasPartialPayment && "bg-muted/50"
                    )}>
                      <Calendar className={cn(
                        sizing.icon.sm,
                        isPaid && "text-emerald-600 dark:text-emerald-400",
                        hasPartialPayment && "text-amber-600 dark:text-amber-400",
                        !isPaid && !hasPartialPayment && "text-muted-foreground"
                      )} />
                      <span className="text-muted-foreground">
                        {locale === "fr" ? "Échéance:" : "Due:"}
                      </span>
                      <span className="font-medium">
                        {formatDateLong(new Date(schedule.dueDate), locale)}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Summary Footer */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 rounded-xl p-5 border">
        <div className="grid grid-cols-3 gap-4 text-center mb-4">
          {data.scheduleProgress.map((schedule) => (
            <div key={schedule.id} className="space-y-1">
              <p className={cn(
                "text-xl font-bold",
                schedule.isPaid && "text-emerald-600 dark:text-emerald-400",
                !schedule.isPaid && schedule.paidAmount > 0 && "text-amber-600 dark:text-amber-400"
              )}>
                {formatCurrency(schedule.amount)}
              </p>
              <p className="text-xs text-muted-foreground">
                {locale === "fr" ? `Tranche ${schedule.scheduleNumber}` : `Payment ${schedule.scheduleNumber}`}
              </p>
            </div>
          ))}
        </div>
        <div className="pt-4 border-t border-muted flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              {locale === "fr" ? "Total scolarité" : "Total Tuition"}
            </p>
            <p className={cn(typography.currency.lg, "text-nav-highlight dark:text-gspn-gold-200")}>
              {formatCurrency(data.tuitionFee)}
            </p>
          </div>
          <ArrowRight className={cn(sizing.icon.lg, "text-muted-foreground/30")} />
          <div className="text-right">
            <p className="text-sm text-muted-foreground">
              {locale === "fr" ? "Reste à payer" : "Remaining Balance"}
            </p>
            <p className={cn(typography.currency.lg, "text-foreground")}>
              {formatCurrency(data.remainingBalance)}
            </p>
          </div>
        </div>
      </div>

      {/* Payment History Collapsible */}
      {data.previousPayments.length > 0 && (
        <Collapsible open={showHistory} onOpenChange={setShowHistory}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between hover:bg-muted/50">
              <span className="flex items-center gap-2">
                <Receipt className={sizing.icon.sm} />
                {t?.paymentWizard?.paymentHistory || "Payment History"}
                <Badge variant="secondary" className="ml-1">
                  {data.previousPayments.length}
                </Badge>
              </span>
              <ChevronDown className={cn(
                sizing.icon.sm,
                "transition-transform duration-200",
                showHistory && "rotate-180"
              )} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 pt-2">
            {data.previousPayments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-xs">
                      {payment.receiptNumber}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {payment.method === "cash"
                        ? (locale === "fr" ? "Espèces" : "Cash")
                        : "Orange Money"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(payment.recordedAt, locale)}
                    {payment.recorderName && ` • ${payment.recorderName}`}
                  </p>
                </div>
                <span className={cn(typography.currency.sm, "text-emerald-600 dark:text-emerald-400")}>
                  +{formatCurrency(payment.amount)}
                </span>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  )
}
