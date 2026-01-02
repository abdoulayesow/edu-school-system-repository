"use client"

import { useMemo } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Users, DollarSign, AlertTriangle, FileText, CheckCircle2, Clock, BarChart3, Loader2 } from "lucide-react"
import { useI18n, interpolate } from "@/components/i18n-provider"
import { PageContainer } from "@/components/layout"
import { sizing } from "@/lib/design-tokens"
import { paymentMethodColors, chartColors } from "@/lib/chart-theme"
import { cn } from "@/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  useGrades,
  useAccountingBalance,
  usePendingEnrollments,
  useUnreconciledDeposits,
  usePendingPayments,
} from "@/lib/hooks/use-api"

// Lazy load heavy chart components
const BarChart = dynamic(() => import("recharts").then(mod => mod.BarChart) as never, { ssr: false }) as typeof import("recharts").BarChart
const Bar = dynamic(() => import("recharts").then(mod => mod.Bar) as never, { ssr: false }) as typeof import("recharts").Bar
const PieChart = dynamic(() => import("recharts").then(mod => mod.PieChart) as never, { ssr: false }) as typeof import("recharts").PieChart
const Pie = dynamic(() => import("recharts").then(mod => mod.Pie) as never, { ssr: false }) as typeof import("recharts").Pie
const Cell = dynamic(() => import("recharts").then(mod => mod.Cell) as never, { ssr: false }) as typeof import("recharts").Cell
const CartesianGrid = dynamic(() => import("recharts").then(mod => mod.CartesianGrid) as never, { ssr: false }) as typeof import("recharts").CartesianGrid
const XAxis = dynamic(() => import("recharts").then(mod => mod.XAxis) as never, { ssr: false }) as typeof import("recharts").XAxis
const YAxis = dynamic(() => import("recharts").then(mod => mod.YAxis) as never, { ssr: false }) as typeof import("recharts").YAxis


function formatGNF(amount: number): string {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M GNF`
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)}K GNF`
  }
  return `${amount.toLocaleString()} GNF`
}

export default function DirectorDashboard() {
  const { t } = useI18n()

  // React Query hooks - fetch data in parallel with automatic caching
  const { data: gradesData, isLoading: gradesLoading } = useGrades()
  const { data: balanceData, isLoading: balanceLoading } = useAccountingBalance()
  const { data: enrollmentsData, isLoading: enrollmentsLoading } = usePendingEnrollments()
  const { data: depositsData, isLoading: depositsLoading } = useUnreconciledDeposits()
  const { data: paymentsData, isLoading: paymentsLoading } = usePendingPayments()

  // Extract data with defaults
  const grades = gradesData?.grades ?? []
  const balance = balanceData ?? null
  const pendingEnrollments = enrollmentsData ?? []
  const unreconciledDeposits = depositsData?.deposits ?? []
  const pendingPayments = paymentsData?.payments ?? []

  // Combined loading state for initial render
  const loading = gradesLoading || balanceLoading || enrollmentsLoading || depositsLoading || paymentsLoading

  // Calculate total enrollment
  const totalEnrollment = useMemo(() => {
    return grades.reduce((sum, g) => sum + g.stats.studentCount, 0)
  }, [grades])

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
        category: "Espèces",
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
  }, [balance])

  // Combine pending items for display
  const pendingApprovals = useMemo(() => {
    const items: Array<{
      id: string
      type: string
      student: string
      submittedBy: string
      reason: string
      amount: string | null
    }> = []

    // Add enrollments needing review
    pendingEnrollments.slice(0, 3).forEach(enrollment => {
      items.push({
        id: enrollment.id,
        type: t.dashboard.feeWaiver,
        student: `${enrollment.firstName} ${enrollment.lastName}`,
        submittedBy: enrollment.grade.name,
        reason: enrollment.adjustmentReason || "Ajustement de frais",
        amount: enrollment.adjustedTuitionFee
          ? formatGNF(enrollment.adjustedTuitionFee)
          : null,
      })
    })

    // Add payments pending review
    pendingPayments.slice(0, 5 - items.length).forEach(payment => {
      const student = payment.enrollment?.student
      items.push({
        id: payment.id,
        type: t.dashboard.paymentDiscount,
        student: student ? `${student.firstName} ${student.lastName}` : "N/A",
        submittedBy: payment.recorder?.name || "Système",
        reason: `Paiement ${payment.receiptNumber}`,
        amount: formatGNF(payment.amount),
      })
    })

    return items
  }, [pendingEnrollments, pendingPayments, t])

  const chartConfig = {
    count: {
      label: t.common.students,
      color: "hsl(var(--primary))",
    },
  } satisfies ChartConfig

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className={cn(sizing.icon.xl, "animate-spin text-muted-foreground")} />
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">{t.dashboard.title}</h1>
        <p className="text-muted-foreground">{t.dashboard.greetingWithName ? interpolate(t.dashboard.greetingWithName, { name: "" }) : t.dashboard.title}</p>
      </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card variant="stat" glow="gold" animate="fadeInUp" className="py-5 stagger-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.dashboard.totalEnrollment}</CardTitle>
              <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20">
                <Users className={cn(sizing.icon.md, "text-primary")} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="font-accent text-3xl font-bold tabular-nums">{totalEnrollment}</div>
              <p className="text-xs text-muted-foreground">
                {grades.length} classes
              </p>
            </CardContent>
          </Card>

          <Card variant="stat" glow="gold" animate="fadeInUp" className="py-5 stagger-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.dashboard.revenue}</CardTitle>
              <div className="p-2 rounded-lg bg-success/10 dark:bg-success/20">
                <DollarSign className={cn(sizing.icon.md, "text-success")} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="font-accent text-2xl font-bold tabular-nums">
                {balance ? formatGNF(balance.summary.totalConfirmedPayments) : "0 GNF"}
              </div>
              <p className="text-xs text-muted-foreground">
                {t.dashboard.pending}: {balance ? formatGNF(balance.summary.totalPendingPayments) : "0 GNF"}
              </p>
            </CardContent>
          </Card>

          <Card variant="stat" glow="primary" animate="fadeInUp" className="py-5 stagger-3">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t.dashboard.pendingApprovals}
              </CardTitle>
              <div className="p-2 rounded-lg bg-warning/10 dark:bg-warning/20">
                <AlertTriangle className={cn(sizing.icon.md, "text-warning")} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="font-accent text-3xl font-bold tabular-nums">
                {pendingEnrollments.length + pendingPayments.length}
              </div>
              <p className="text-xs text-muted-foreground">
                {pendingEnrollments.length} inscriptions, {pendingPayments.length} paiements
              </p>
            </CardContent>
          </Card>

          <Card variant="stat" glow="primary" animate="fadeInUp" className="py-5 stagger-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t.dashboard.reconciliationFlags}
              </CardTitle>
              <div className={cn(
                "p-2 rounded-lg",
                unreconciledDeposits.length > 0
                  ? "bg-destructive/10 dark:bg-destructive/20"
                  : "bg-muted"
              )}>
                <AlertTriangle className={cn(
                  sizing.icon.md,
                  unreconciledDeposits.length > 0 ? "text-destructive" : "text-muted-foreground"
                )} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="font-accent text-3xl font-bold tabular-nums">
                {unreconciledDeposits.length}
              </div>
              <p className="text-xs text-muted-foreground">
                {unreconciledDeposits.length > 0 ? t.dashboard.needsAttention : "Aucun"}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className={cn(sizing.icon.lg, "text-warning")} />
                {t.dashboard.pendingExceptionTickets}
              </CardTitle>
              <CardDescription>{t.dashboard.requestsNeedingApproval}</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingApprovals.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle2 className={cn(sizing.icon.xl, "mx-auto mb-2 text-success opacity-50")} />
                  <p>Aucune approbation en attente</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t.dashboard.requestType}</TableHead>
                      <TableHead>{t.dashboard.student}</TableHead>
                      <TableHead>{t.dashboard.details}</TableHead>
                      <TableHead className="text-right">{t.dashboard.actions}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingApprovals.map((approval) => (
                      <TableRow key={approval.id}>
                        <TableCell>
                          <Badge variant="outline">{approval.type}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{approval.student}</div>
                          <div className="text-xs text-muted-foreground">
                            {approval.submittedBy}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-foreground">
                            {approval.reason}
                          </div>
                          {approval.amount && (
                            <div className="text-sm font-semibold text-foreground mt-1">
                              {approval.amount}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" className="h-8">
                              <CheckCircle2 className={cn(sizing.icon.xs, "mr-1")} />
                              {t.dashboard.approve}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 bg-transparent"
                            >
                              {t.dashboard.review}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className={cn(sizing.icon.lg, "text-primary")} />
                {t.dashboard.recentActivity}
              </CardTitle>
              <CardDescription>{t.dashboard.importantEvents}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {balance && (
                  <>
                    <div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                      <div className="mt-0.5 h-2 w-2 rounded-full bg-success" />
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium text-foreground">
                          Paiements confirmés: {formatGNF(balance.summary.totalConfirmedPayments)}
                        </p>
                        <div className="text-xs text-muted-foreground">
                          {balance.payments.byStatus.confirmed?.count || 0} transactions
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                      <div className="mt-0.5 h-2 w-2 rounded-full bg-warning" />
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium text-foreground">
                          Paiements en attente: {formatGNF(balance.summary.totalPendingPayments)}
                        </p>
                        <div className="text-xs text-muted-foreground">
                          {(balance.payments.byStatus.pending_deposit?.count || 0) +
                           (balance.payments.byStatus.pending_review?.count || 0)} transactions
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                      <div className="mt-0.5 h-2 w-2 rounded-full bg-primary" />
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium text-foreground">
                          Dépenses payées: {formatGNF(balance.summary.totalPaidExpenses)}
                        </p>
                        <div className="text-xs text-muted-foreground">
                          Marge nette: {formatGNF(balance.summary.margin)}
                        </div>
                      </div>
                    </div>
                  </>
                )}
                {unreconciledDeposits.length > 0 && (
                  <div className="flex items-start gap-3 p-3 rounded-lg border bg-destructive/5">
                    <div className="mt-0.5 h-2 w-2 rounded-full bg-destructive" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium text-foreground">
                        {unreconciledDeposits.length} dépôts non rapprochés
                      </p>
                      <div className="text-xs text-muted-foreground">
                        Total: {formatGNF(unreconciledDeposits.reduce((sum, d) => sum + d.amount, 0))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <Button variant="link" className="w-full mt-4" asChild>
                <a href="/accounting">{t.dashboard.viewAllReports}</a>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className={cn(sizing.icon.lg, "text-primary")} />
                {t.dashboard.enrollmentByLevel}
              </CardTitle>
              <CardDescription>{t.dashboard.studentDistribution}</CardDescription>
            </CardHeader>
            <CardContent>
              {enrollmentData.length > 0 ? (
                <ChartContainer config={chartConfig}>
                  <BarChart data={enrollmentData} accessibilityLayer>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="grade" tickLine={false} tickMargin={10} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill="var(--color-count)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                  Aucune donnée d'inscription disponible
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className={cn(sizing.icon.lg, "text-success")} />
                {t.dashboard.revenueByCategory}
              </CardTitle>
              <CardDescription>{t.dashboard.revenueDistribution}</CardDescription>
            </CardHeader>
            <CardContent>
              {revenueData.length > 0 ? (
                <ChartContainer config={{
                  value: {
                    label: t.dashboard.revenue,
                    color: chartColors.primary
                  }
                }} className="h-[300px] flex items-center justify-center">
                  <PieChart width={300} height={300}>
                    <Pie
                      data={revenueData}
                      cx={150}
                      cy={150}
                      labelLine={false}
                      label={({ category, percent }) => `${category}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {revenueData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip
                      content={
                        <ChartTooltipContent formatter={(value) => formatGNF(Number(value))} hideLabel />
                      }
                    />
                  </PieChart>
                </ChartContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <DollarSign className={cn(sizing.icon.xl, "mx-auto mb-2 opacity-50")} />
                    <p>Aucun paiement confirmé</p>
                  </div>
                </div>
              )}
              <Button variant="link" className="w-full mt-4" asChild>
                <a href="/reports">{t.dashboard.viewAllReports}</a>
              </Button>
            </CardContent>
          </Card>
        </div>
    </PageContainer>
  )
}
