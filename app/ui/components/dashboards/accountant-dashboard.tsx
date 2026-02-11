"use client"

import { useMemo, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import {
  DollarSign,
  Wallet,
  Banknote,
  CreditCard,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Loader2,
  Receipt,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import { sizing, typography } from "@/lib/design-tokens"
import { cn } from "@/lib/utils"
import {
  useAccountingBalance,
  useCashNeedingDeposit,
  useUnreconciledDeposits,
  usePaymentStats,
  usePayments,
} from "@/lib/hooks/use-api"

function formatGNF(amount: number): string {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M GNF`
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)}K GNF`
  }
  return `${amount.toLocaleString()} GNF`
}

function formatFullGNF(amount: number): string {
  return new Intl.NumberFormat("fr-GN", {
    style: "currency",
    currency: "GNF",
    minimumFractionDigits: 0,
  }).format(amount)
}

interface AccountantDashboardProps {
  userName?: string
}

export function AccountantDashboard({ userName }: AccountantDashboardProps) {
  const { t, locale } = useI18n()
  const { toast } = useToast()

  // Fetch data
  const { data: balanceData, isLoading: balanceLoading, error: balanceError } = useAccountingBalance()
  const { data: cashToDepositData, isLoading: cashLoading, error: cashError } = useCashNeedingDeposit()
  const { data: depositsData, isLoading: depositsLoading, error: depositsError } = useUnreconciledDeposits()
  const { data: statsData, isLoading: statsLoading, error: statsError } = usePaymentStats()
  const { data: recentPaymentsData, isLoading: paymentsLoading, error: paymentsError } = usePayments({ limit: 5 })

  // Show error toast notifications
  useEffect(() => {
    if (balanceError || cashError || depositsError || statsError || paymentsError) {
      toast({
        variant: "destructive",
        title: t.common.error,
        description: t.dashboard.errors.financialDataUnavailable,
      })
    }
  }, [balanceError, cashError, depositsError, statsError, paymentsError, toast, t])

  const loading = balanceLoading || cashLoading || depositsLoading || statsLoading || paymentsLoading

  const balance = balanceData ?? null
  const cashNeedingDeposit = cashToDepositData?.payments ?? []
  const unreconciledDeposits = depositsData?.deposits ?? []
  const stats = statsData ?? null
  const recentPayments = recentPaymentsData?.payments ?? []

  // Calculate totals
  const totalCashToDeposit = useMemo(() => {
    return cashNeedingDeposit.reduce((sum, p) => sum + p.amount, 0)
  }, [cashNeedingDeposit])

  const cashVsOrangeMoney = useMemo(() => {
    if (!balance) return { cash: 0, orange: 0, total: 0 }
    const cash = balance.payments.byMethod.cash?.confirmed || 0
    const orange = balance.payments.byMethod.orange_money?.confirmed || 0
    return { cash, orange, total: cash + orange }
  }, [balance])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className={cn(sizing.icon.xl, "animate-spin text-gspn-maroon-500 mx-auto")} />
          <p className="text-muted-foreground">{locale === "fr" ? "Chargement..." : "Loading..."}</p>
        </div>
      </div>
    )
  }

  // Show error state if critical data failed to load
  const hasCriticalError = balanceError && statsError
  if (hasCriticalError) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4 max-w-md">
          <div className="p-3 bg-destructive/10 rounded-full w-fit mx-auto">
            <AlertCircle className={cn(sizing.icon.xl, "text-destructive")} />
          </div>
          <h3 className={cn(typography.heading.section, "text-foreground")}>
            {locale === "fr" ? "Erreur de chargement" : "Loading Error"}
          </h3>
          <p className="text-muted-foreground">
            {t.dashboard.errors.fetchFailed}
          </p>
          <Button onClick={() => window.location.reload()}>
            {locale === "fr" ? "Actualiser la page" : "Refresh Page"}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="h-1 bg-emerald-500" />
        <div className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 rounded-xl">
              <PiggyBank className="size-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h1 className={cn(typography.heading.page, "text-foreground")}>
                {locale === "fr" ? "Tableau de Bord Comptable" : "Accountant Dashboard"}
              </h1>
              <p className="text-muted-foreground mt-1">
                {userName
                  ? (locale === "fr" ? `Bienvenue, ${userName}` : `Welcome, ${userName}`)
                  : (locale === "fr" ? "Gestion financière quotidienne" : "Daily financial management")
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Financial Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Today's Collections */}
        <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="h-1 bg-emerald-500" />
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-emerald-500/10 rounded-xl">
                <DollarSign className="size-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground">
                  {locale === "fr" ? "Collectes du jour" : "Today's Collections"}
                </p>
                <div className={cn(typography.stat.sm, "text-emerald-700 dark:text-emerald-300")}>
                  {stats ? formatGNF(stats.today.amount) : "0 GNF"}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats?.today.count || 0} {locale === "fr" ? "paiements" : "payments"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cash Needing Deposit */}
        <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="h-1 bg-amber-500" />
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-amber-500/10 rounded-xl">
                <Banknote className="size-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground">
                  {locale === "fr" ? "Espèces à déposer" : "Cash to Deposit"}
                </p>
                <div className={cn(typography.stat.sm, "text-amber-700 dark:text-amber-300")}>
                  {formatGNF(totalCashToDeposit)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {cashNeedingDeposit.length} {locale === "fr" ? "paiements en attente" : "payments pending"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Confirmed */}
        <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="h-1 bg-blue-500" />
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-blue-500/10 rounded-xl">
                <TrendingUp className="size-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground">
                  {locale === "fr" ? "Confirmés cette semaine" : "Confirmed This Week"}
                </p>
                <div className={cn(typography.stat.sm, "text-blue-700 dark:text-blue-300")}>
                  {stats ? formatGNF(stats.confirmedThisWeek.amount) : "0 GNF"}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats?.confirmedThisWeek.count || 0} transactions
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Review */}
        <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="h-1 bg-gspn-maroon-500" />
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-gspn-maroon-500/10 rounded-xl">
                <Clock className="size-5 text-gspn-maroon-600 dark:text-gspn-maroon-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground">
                  {locale === "fr" ? "En attente de révision" : "Pending Review"}
                </p>
                <div className={cn(typography.stat.sm, "text-gspn-maroon-700 dark:text-gspn-maroon-300")}>
                  {stats ? formatGNF(stats.pending.amount) : "0 GNF"}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats?.pending.count || 0} {locale === "fr" ? "à confirmer" : "to confirm"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Cash to Deposit - Action Items */}
        <div className="lg:col-span-2 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-gradient-to-br from-slate-50/50 to-transparent dark:from-slate-900/30 dark:to-transparent shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-slate-100 dark:bg-slate-800 border-b-2 border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Banknote className="size-4" />
                {locale === "fr" ? "Espèces à Déposer en Banque" : "Cash Requiring Bank Deposit"}
              </h3>
              {cashNeedingDeposit.length > 0 && (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-700">
                  {cashNeedingDeposit.length} {locale === "fr" ? "en attente" : "pending"}
                </Badge>
              )}
            </div>
          </div>
          <div className="p-4">
            {cashNeedingDeposit.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle2 className={cn(sizing.icon.xl, "mx-auto mb-2 text-emerald-500 opacity-50")} />
                <p>{locale === "fr" ? "Toutes les espèces ont été déposées" : "All cash has been deposited"}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cashNeedingDeposit.slice(0, 5).map((payment) => {
                  const student = payment.enrollment?.student
                  return (
                    <Link
                      key={payment.id}
                      href={`/accounting/payments/${payment.id}`}
                      className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-gspn-gold-400 dark:hover:border-gspn-gold-500 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                          <Banknote className="size-4 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {student ? `${student.firstName} ${student.lastName}` : "N/A"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {locale === "fr" ? "Reçu" : "Receipt"} {payment.receiptNumber}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-amber-700 dark:text-amber-300">
                          {formatGNF(payment.amount)}
                        </span>
                        <ArrowRight className="size-4 text-muted-foreground" />
                      </div>
                    </Link>
                  )
                })}
                {cashNeedingDeposit.length > 5 && (
                  <Button variant="link" className="w-full" asChild>
                    <Link href="/accounting/payments?method=cash&needsDeposit=true">
                      {locale === "fr" ? `Voir tous les ${cashNeedingDeposit.length} paiements` : `View all ${cashNeedingDeposit.length} payments`}
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Payment Method Breakdown */}
        <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-gradient-to-br from-slate-50/50 to-transparent dark:from-slate-900/30 dark:to-transparent shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-slate-100 dark:bg-slate-800 border-b-2 border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <CreditCard className="size-4" />
              {locale === "fr" ? "Par Méthode de Paiement" : "By Payment Method"}
            </h3>
          </div>
          <div className="p-6 space-y-4">
            {/* Cash */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded">
                    <Banknote className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="text-sm font-medium">{locale === "fr" ? "Espèces" : "Cash"}</span>
                </div>
                <span className="text-sm font-semibold">{formatGNF(cashVsOrangeMoney.cash)}</span>
              </div>
              <Progress
                value={cashVsOrangeMoney.total > 0 ? (cashVsOrangeMoney.cash / cashVsOrangeMoney.total) * 100 : 0}
                className="h-2 bg-emerald-100 dark:bg-emerald-900/30"
              />
            </div>

            {/* Orange Money */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-orange-100 dark:bg-orange-900/30 rounded">
                    <CreditCard className="size-3.5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <span className="text-sm font-medium">Orange Money</span>
                </div>
                <span className="text-sm font-semibold">{formatGNF(cashVsOrangeMoney.orange)}</span>
              </div>
              <Progress
                value={cashVsOrangeMoney.total > 0 ? (cashVsOrangeMoney.orange / cashVsOrangeMoney.total) * 100 : 0}
                className="h-2 bg-orange-100 dark:bg-orange-900/30"
              />
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Total</span>
                <span className="font-bold text-lg">{formatGNF(cashVsOrangeMoney.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Payments */}
      <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-gradient-to-br from-slate-50/50 to-transparent dark:from-slate-900/30 dark:to-transparent shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-slate-100 dark:bg-slate-800 border-b-2 border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Receipt className="size-4" />
              {locale === "fr" ? "Paiements Récents" : "Recent Payments"}
            </h3>
            <Button variant="outline" size="sm" asChild>
              <Link href="/accounting/payments">
                {locale === "fr" ? "Voir tout" : "View all"}
              </Link>
            </Button>
          </div>
        </div>
        <div className="p-4">
          {recentPayments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Receipt className={cn(sizing.icon.xl, "mx-auto mb-2 opacity-50")} />
              <p>{locale === "fr" ? "Aucun paiement récent" : "No recent payments"}</p>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {recentPayments.map((payment) => {
                const student = payment.enrollment?.student || payment.clubEnrollment?.student
                const isConfirmed = payment.status === "confirmed"
                return (
                  <Link
                    key={payment.id}
                    href={`/accounting/payments/${payment.id}`}
                    className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-gspn-gold-400 dark:hover:border-gspn-gold-500 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <Badge
                        variant={isConfirmed ? "default" : "outline"}
                        className={isConfirmed ? "bg-emerald-500 text-white" : ""}
                      >
                        {payment.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{payment.receiptNumber}</span>
                    </div>
                    <p className="font-medium text-sm truncate">
                      {student ? `${student.firstName} ${student.lastName}` : "N/A"}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className={cn(
                        "font-semibold",
                        isConfirmed ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"
                      )}>
                        {formatGNF(payment.amount)}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {payment.method === "cash" ? (locale === "fr" ? "Espèces" : "Cash") : "Orange Money"}
                      </Badge>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
