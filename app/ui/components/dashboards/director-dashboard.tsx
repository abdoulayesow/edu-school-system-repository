"use client"

import { useMemo, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts"
import {
  Users,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Clock,
  BarChart3,
  Loader2,
  TrendingUp,
  Wallet,
  ArrowRight,
  Building2,
  AlertCircle,
} from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import { sizing, typography } from "@/lib/design-tokens"
import { paymentMethodColors } from "@/lib/chart-theme"
import { cn } from "@/lib/utils"
import {
  useGrades,
  useAccountingBalance,
  usePendingEnrollments,
  useUnreconciledDeposits,
  useCashNeedingDeposit,
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

interface DirectorDashboardProps {
  userName?: string
}

export function DirectorDashboard({ userName }: DirectorDashboardProps) {
  const { t, locale } = useI18n()
  const { toast } = useToast()

  // React Query hooks - fetch data in parallel with automatic caching
  const { data: gradesData, isLoading: gradesLoading, error: gradesError } = useGrades()
  const { data: balanceData, isLoading: balanceLoading, error: balanceError } = useAccountingBalance()
  const { data: enrollmentsData, isLoading: enrollmentsLoading, error: enrollmentsError } = usePendingEnrollments()
  const { data: depositsData, isLoading: depositsLoading, error: depositsError } = useUnreconciledDeposits()
  const { data: cashToDepositData, isLoading: cashToDepositLoading, error: cashError } = useCashNeedingDeposit()

  // Show error toast notifications
  useEffect(() => {
    if (gradesError) {
      toast({
        variant: "destructive",
        title: t.common.error,
        description: t.dashboard.errors.gradesUnavailable,
      })
    }
  }, [gradesError, toast, t])

  useEffect(() => {
    if (balanceError || depositsError || cashError) {
      toast({
        variant: "destructive",
        title: t.common.error,
        description: t.dashboard.errors.financialDataUnavailable,
      })
    }
  }, [balanceError, depositsError, cashError, toast, t])

  useEffect(() => {
    if (enrollmentsError) {
      toast({
        variant: "destructive",
        title: t.common.error,
        description: t.dashboard.errors.fetchFailed,
      })
    }
  }, [enrollmentsError, toast, t])

  // Extract data with defaults
  const grades = gradesData?.grades ?? []
  const balance = balanceData ?? null
  const pendingEnrollments = enrollmentsData ?? []
  const unreconciledDeposits = depositsData?.deposits ?? []
  const cashNeedingDeposit = cashToDepositData?.payments ?? []

  // Combined loading state for initial render
  const loading = gradesLoading || balanceLoading || enrollmentsLoading || depositsLoading || cashToDepositLoading

  // Calculate total enrollment
  const totalEnrollment = useMemo(() => {
    return grades.reduce((sum, g) => sum + g.stats.studentCount, 0)
  }, [grades])

  // Calculate collection rate
  const collectionRate = useMemo(() => {
    if (!balance) return 0
    const total = balance.summary.totalConfirmedPayments + balance.summary.totalPendingPayments
    if (total === 0) return 0
    return Math.round((balance.summary.totalConfirmedPayments / total) * 100)
  }, [balance])

  // Prepare enrollment chart data
  const enrollmentData = useMemo(() => {
    return grades
      .sort((a, b) => a.order - b.order)
      .map(g => ({
        grade: g.name,
        count: g.stats.studentCount,
      }))
  }, [grades])

  // Prepare revenue chart data
  const revenueData = useMemo(() => {
    if (!balance) return []

    const { byMethod } = balance.payments
    const data = []

    if (byMethod.cash?.confirmed > 0) {
      data.push({
        category: locale === "fr" ? "Espèces" : "Cash",
        value: byMethod.cash.confirmed,
        color: paymentMethodColors.cash,
      })
    }
    if (byMethod.orange_money?.confirmed > 0) {
      data.push({
        category: "Orange Money",
        value: byMethod.orange_money.confirmed,
        color: paymentMethodColors.orange_money,
      })
    }

    return data
  }, [balance, locale])

  // Combine pending items for display
  const pendingApprovals = useMemo(() => {
    const items: Array<{
      id: string
      type: string
      student: string
      submittedBy: string
      reason: string
      amount: string | null
      href: string
    }> = []

    // Add enrollments needing review
    pendingEnrollments.slice(0, 3).forEach(enrollment => {
      items.push({
        id: enrollment.id,
        type: t.dashboard.feeWaiver,
        student: `${enrollment.firstName} ${enrollment.lastName}`,
        submittedBy: enrollment.grade.name,
        reason: enrollment.adjustmentReason || (locale === "fr" ? "Ajustement de frais" : "Fee adjustment"),
        amount: enrollment.adjustedTuitionFee
          ? formatGNF(enrollment.adjustedTuitionFee)
          : null,
        href: `/students/enrollments/${enrollment.id}`,
      })
    })

    // Add cash payments needing deposit to bank
    cashNeedingDeposit.slice(0, 5 - items.length).forEach(payment => {
      const student = payment.enrollment?.student
      items.push({
        id: payment.id,
        type: t.dashboard.cashToDeposit || (locale === "fr" ? "Espèces à déposer" : "Cash to deposit"),
        student: student ? `${student.firstName} ${student.lastName}` : "N/A",
        submittedBy: payment.recorder?.name || (locale === "fr" ? "Système" : "System"),
        reason: `${locale === "fr" ? "Reçu" : "Receipt"} ${payment.receiptNumber}`,
        amount: formatGNF(payment.amount),
        href: `/accounting/payments/${payment.id}`,
      })
    })

    return items
  }, [pendingEnrollments, cashNeedingDeposit, t, locale])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className={cn(sizing.icon.xl, "animate-spin text-gspn-maroon-500 mx-auto")} />
          <p className="text-muted-foreground">{locale === "fr" ? "Chargement du tableau de bord..." : "Loading dashboard..."}</p>
        </div>
      </div>
    )
  }

  // Show error state if critical data failed to load
  const hasCriticalError = gradesError && balanceError
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
        <div className="h-1 bg-gspn-maroon-500" />
        <div className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gspn-maroon-500/10 rounded-xl">
              <Building2 className="size-8 text-gspn-maroon-600 dark:text-gspn-maroon-400" />
            </div>
            <div>
              <h1 className={cn(typography.heading.page, "text-foreground")}>
                {locale === "fr" ? "Tableau de Bord Directeur" : "Director Dashboard"}
              </h1>
              <p className="text-muted-foreground mt-1">
                {userName
                  ? (locale === "fr" ? `Bienvenue, ${userName}` : `Welcome back, ${userName}`)
                  : (locale === "fr" ? "Vue d'ensemble de l'établissement" : "School overview at a glance")
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics - 4 stat cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Enrollment */}
        <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="h-1 bg-gspn-maroon-500" />
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-gspn-maroon-500/10 rounded-xl">
                <Users className="size-5 text-gspn-maroon-600 dark:text-gspn-maroon-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground">{t.dashboard.totalEnrollment}</p>
                <div className={cn(typography.stat.md, "text-gspn-maroon-700 dark:text-gspn-maroon-300")}>
                  {totalEnrollment}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {grades.length} {locale === "fr" ? "classes" : "classes"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Revenue */}
        <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="h-1 bg-emerald-500" />
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-emerald-500/10 rounded-xl">
                <DollarSign className="size-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground">{t.dashboard.revenue}</p>
                <div className={cn(typography.stat.sm, "text-emerald-700 dark:text-emerald-300")}>
                  {balance ? formatGNF(balance.summary.totalConfirmedPayments) : "0 GNF"}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {t.dashboard.pending}: {balance ? formatGNF(balance.summary.totalPendingPayments) : "0 GNF"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Approvals */}
        <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="h-1 bg-amber-500" />
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-amber-500/10 rounded-xl">
                <AlertTriangle className="size-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground">{t.dashboard.pendingApprovals}</p>
                <div className={cn(typography.stat.md, "text-amber-700 dark:text-amber-300")}>
                  {pendingEnrollments.length + cashNeedingDeposit.length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {pendingEnrollments.length} {locale === "fr" ? "inscriptions" : "enrollments"}, {cashNeedingDeposit.length} {locale === "fr" ? "dépôts" : "deposits"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Collection Rate */}
        <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="h-1 bg-blue-500" />
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-blue-500/10 rounded-xl">
                <TrendingUp className="size-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground">
                  {locale === "fr" ? "Taux de recouvrement" : "Collection Rate"}
                </p>
                <div className={cn(typography.stat.md, "text-blue-700 dark:text-blue-300")}>
                  {collectionRate}%
                </div>
                <div className="w-full bg-blue-100 dark:bg-blue-900/30 rounded-full h-1.5 mt-2">
                  <div
                    className="h-1.5 rounded-full bg-blue-500"
                    style={{ width: `${collectionRate}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending Approvals Table */}
        <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-gradient-to-br from-slate-50/50 to-transparent dark:from-slate-900/30 dark:to-transparent shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-slate-100 dark:bg-slate-800 border-b-2 border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Clock className="size-4" />
              {t.dashboard.pendingExceptionTickets}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">{t.dashboard.requestsNeedingApproval}</p>
          </div>
          <div className="p-4">
            {pendingApprovals.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle2 className={cn(sizing.icon.xl, "mx-auto mb-2 text-emerald-500 opacity-50")} />
                <p>{locale === "fr" ? "Aucune approbation en attente" : "No pending approvals"}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingApprovals.map((approval) => (
                  <Link
                    key={approval.id}
                    href={approval.href}
                    className="block p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-gspn-gold-400 dark:hover:border-gspn-gold-500 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">{approval.type}</Badge>
                          {approval.amount && (
                            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                              {approval.amount}
                            </span>
                          )}
                        </div>
                        <p className="font-medium mt-1 truncate">{approval.student}</p>
                        <p className="text-xs text-muted-foreground truncate">{approval.reason}</p>
                      </div>
                      <ArrowRight className="size-4 text-muted-foreground flex-shrink-0" />
                    </div>
                  </Link>
                ))}
                <Button variant="link" className="w-full mt-2" asChild>
                  <Link href="/students/enrollments?status=needs_review">
                    {locale === "fr" ? "Voir toutes les approbations" : "View all approvals"}
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Financial Summary */}
        <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-gradient-to-br from-slate-50/50 to-transparent dark:from-slate-900/30 dark:to-transparent shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-slate-100 dark:bg-slate-800 border-b-2 border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Wallet className="size-4" />
              {locale === "fr" ? "Résumé Financier" : "Financial Summary"}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">{t.dashboard.importantEvents}</p>
          </div>
          <div className="p-4 space-y-3">
            {balance && (
              <>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800">
                  <div className="mt-0.5 h-2 w-2 rounded-full bg-emerald-500 flex-shrink-0" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      {locale === "fr" ? "Paiements confirmés" : "Confirmed payments"}: {formatGNF(balance.summary.totalConfirmedPayments)}
                    </p>
                    <div className="text-xs text-muted-foreground">
                      {balance.payments.byStatus.confirmed?.count || 0} transactions
                    </div>
                  </div>
                </div>

                {cashNeedingDeposit.length > 0 && (
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800">
                    <div className="mt-0.5 h-2 w-2 rounded-full bg-amber-500 flex-shrink-0" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium text-foreground">
                        {locale === "fr" ? "Espèces à déposer" : "Cash to deposit"}: {formatGNF(cashNeedingDeposit.reduce((sum, p) => sum + p.amount, 0))}
                      </p>
                      <div className="text-xs text-muted-foreground">
                        {cashNeedingDeposit.length} {locale === "fr" ? "paiements en espèces" : "cash payments"}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3 p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                  <div className="mt-0.5 h-2 w-2 rounded-full bg-gspn-maroon-500 flex-shrink-0" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      {locale === "fr" ? "Dépenses payées" : "Paid expenses"}: {formatGNF(balance.summary.totalPaidExpenses)}
                    </p>
                    <div className="text-xs text-muted-foreground">
                      {locale === "fr" ? "Marge nette" : "Net margin"}: {formatGNF(balance.summary.margin)}
                    </div>
                  </div>
                </div>

                {unreconciledDeposits.length > 0 && (
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                    <div className="mt-0.5 h-2 w-2 rounded-full bg-destructive flex-shrink-0" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium text-foreground">
                        {unreconciledDeposits.length} {locale === "fr" ? "dépôts non rapprochés" : "unreconciled deposits"}
                      </p>
                      <div className="text-xs text-muted-foreground">
                        Total: {formatGNF(unreconciledDeposits.reduce((sum, d) => sum + d.amount, 0))}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
            <Button variant="link" className="w-full mt-2" asChild>
              <Link href="/accounting">{t.dashboard.viewAllReports}</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Enrollment by Level */}
        <Card className="overflow-hidden shadow-sm">
          <div className="h-1 bg-gspn-maroon-500" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 bg-gspn-maroon-500/10 rounded-lg">
                <BarChart3 className={cn(sizing.icon.md, "text-gspn-maroon-600 dark:text-gspn-maroon-400")} />
              </div>
              {t.dashboard.enrollmentByLevel}
            </CardTitle>
            <CardDescription>{t.dashboard.studentDistribution}</CardDescription>
          </CardHeader>
          <CardContent>
            {enrollmentData.length > 0 ? (
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={enrollmentData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="grade"
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                      tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                      labelStyle={{ fontWeight: 600 }}
                    />
                    <Bar
                      dataKey="count"
                      fill="#8B2332"
                      radius={[6, 6, 0, 0]}
                      name={t.common.students}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                {locale === "fr" ? "Aucune donnée d'inscription disponible" : "No enrollment data available"}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Revenue by Method */}
        <Card className="overflow-hidden shadow-sm">
          <div className="h-1 bg-emerald-500" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <DollarSign className={cn(sizing.icon.md, "text-emerald-600 dark:text-emerald-400")} />
              </div>
              {t.dashboard.revenueByCategory}
            </CardTitle>
            <CardDescription>{t.dashboard.revenueDistribution}</CardDescription>
          </CardHeader>
          <CardContent>
            {revenueData.length > 0 ? (
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={revenueData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ category, percent }) => `${category}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={90}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {revenueData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                      formatter={(value: number) => formatGNF(value)}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <DollarSign className={cn(sizing.icon.xl, "mx-auto mb-2 opacity-50")} />
                  <p>{locale === "fr" ? "Aucun paiement confirmé" : "No confirmed payments"}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
