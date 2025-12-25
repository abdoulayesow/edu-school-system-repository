"use client"

import { useEffect, useState, Suspense, lazy } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Users, DollarSign, AlertTriangle, TrendingUp, FileText, CheckCircle2, Clock, BarChart3, Loader2 } from "lucide-react"
import { useI18n, interpolate } from "@/components/i18n-provider"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// Lazy load heavy chart components
const BarChart = dynamic(() => import("recharts").then(mod => ({ default: mod.BarChart })), { ssr: false })
const Bar = dynamic(() => import("recharts").then(mod => ({ default: mod.Bar })), { ssr: false })
const PieChart = dynamic(() => import("recharts").then(mod => ({ default: mod.PieChart })), { ssr: false })
const Pie = dynamic(() => import("recharts").then(mod => ({ default: mod.Pie })), { ssr: false })
const Cell = dynamic(() => import("recharts").then(mod => ({ default: mod.Cell })), { ssr: false })
const CartesianGrid = dynamic(() => import("recharts").then(mod => ({ default: mod.CartesianGrid })), { ssr: false })
const XAxis = dynamic(() => import("recharts").then(mod => ({ default: mod.XAxis })), { ssr: false })
const YAxis = dynamic(() => import("recharts").then(mod => ({ default: mod.YAxis })), { ssr: false })

// Chart loading skeleton
function ChartSkeleton() {
  return (
    <div className="h-[300px] flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  )
}

export default function DirectorDashboard() {
  const { t } = useI18n()
  const [chartsLoaded, setChartsLoaded] = useState(false)

  // Initialize sync manager after dashboard mounts (deferred from app startup)
  useEffect(() => {
    // Defer sync manager initialization to avoid blocking initial render
    const timer = setTimeout(() => {
      import("@/lib/sync/manager").then(({ syncManager }) => {
        syncManager.initialize()
      })
    }, 1000) // Wait 1 second after mount

    // Mark charts as ready to render
    setChartsLoaded(true)

    return () => clearTimeout(timer)
  }, [])
  const enrollmentData = [
    { grade: "6ème", count: 95 },
    { grade: "7ème", count: 102 },
    { grade: "8ème", count: 98 },
    { grade: "9ème", count: 89 },
    { grade: "10ème", count: 87 },
    { grade: "11ème", count: 76 },
    { grade: "12ème", count: 68 },
  ]

  const revenueData = [
    { category: t.dashboard.tuition, value: 45000000, color: "hsl(var(--chart-1))" },
    { category: t.dashboard.extraActivities, value: 12000000, color: "hsl(var(--chart-2))" },
    { category: t.dashboard.canteen, value: 8500000, color: "hsl(var(--chart-3))" },
    { category: t.dashboard.transport, value: 6200000, color: "hsl(var(--chart-4))" },
  ]

  const pendingApprovals = [
    {
      id: 1,
      type: t.dashboard.paymentDiscount,
      student: "Fatoumata Diallo",
      submittedBy: "Ibrahima Bah",
      date: "2024-12-18",
      reason: t.dashboard.reasons.familySituation,
      amount: "150,000 GNF",
    },
    {
      id: 2,
      type: t.dashboard.lateEnrollment,
      student: "Mamadou Sylla",
      submittedBy: "Mariama Camara",
      date: "2024-12-17",
      reason: t.dashboard.reasons.schoolTransfer,
      amount: null,
    },
    {
      id: 3,
      type: t.dashboard.feeWaiver,
      student: "Aminata Touré",
      submittedBy: "Ibrahima Bah",
      date: "2024-12-17",
      reason: t.dashboard.reasons.billingError,
      amount: "200,000 GNF",
    },
    {
      id: 4,
      type: t.dashboard.paymentPlan,
      student: "Oumar Keita",
      submittedBy: "Ibrahima Bah",
      date: "2024-12-16",
      reason: t.dashboard.reasons.paymentSpread,
      amount: "450,000 GNF",
    },
    {
      id: 5,
      type: t.dashboard.activityModification,
      student: "Aissata Conte",
      submittedBy: "Mariama Camara",
      date: "2024-12-16",
      reason: t.dashboard.reasons.clubChange,
      amount: null,
    },
  ]

  const recentActivity = [
    {
      action: t.dashboard.financialPeriodClosed,
      user: "Ibrahima Bah",
      time: interpolate(t.dashboard.hoursAgo, { hours: 2 }),
      type: "success",
    },
    {
      action: interpolate(t.dashboard.bulkEnrollmentProcessed, { count: 23 }),
      user: "Mariama Camara",
      time: interpolate(t.dashboard.hoursAgo, { hours: 4 }),
      type: "info",
    },
    {
      action: t.dashboard.academicReportGenerated,
      user: "Fatoumata Diallo",
      time: interpolate(t.dashboard.hoursAgo, { hours: 5 }),
      type: "info",
    },
    {
      action: t.dashboard.bankDiscrepancyFlagged,
      user: "Ibrahima Bah",
      time: interpolate(t.dashboard.yesterdayAt, { time: "16:30" }),
      type: "warning",
    },
    {
      action: interpolate(t.dashboard.paymentValidation, { count: 12 }),
      user: "Ibrahima Bah",
      time: interpolate(t.dashboard.yesterdayAt, { time: "14:20" }),
      type: "success",
    },
  ]

  const chartConfig = {
    count: {
      label: t.common.students,
      color: "hsl(var(--primary))",
    },
  } satisfies ChartConfig

  return (
    <div className="min-h-screen bg-background pt-4 lg:pt-4">
      <main className="container mx-auto px-4 py-4">
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-foreground mb-2">{t.dashboard.title}</h1>
          <p className="text-muted-foreground">{interpolate(t.dashboard.greetingWithName, { name: "Ousmane Sylla" })}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t.dashboard.totalEnrollment}</CardTitle>
              <Users className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">615</div>
              <p className="text-xs text-success flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3" />
                <span>+5% {t.dashboard.vsLastMonth}</span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t.dashboard.revenue}</CardTitle>
              <DollarSign className="h-5 w-5 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">71.7M GNF</div>
              <p className="text-xs text-muted-foreground mt-1">{t.dashboard.pending}: 8.2M GNF</p>
            </CardContent>
          </Card>

          <Card className="border-warning/50 bg-warning/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-warning">{t.dashboard.pendingApprovals}</CardTitle>
              <AlertTriangle className="h-5 w-5 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-warning">5</div>
              <Button variant="link" className="p-0 h-auto text-xs text-warning hover:text-warning/80 mt-1">
                {t.dashboard.viewExceptions}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-destructive/50 bg-destructive/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-destructive">{t.dashboard.reconciliationFlags}</CardTitle>
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-destructive">2</div>
              <p className="text-xs text-destructive/80 mt-1">{t.dashboard.needsAttention}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-warning" />
                {t.dashboard.pendingExceptionTickets}
              </CardTitle>
              <CardDescription>{t.dashboard.requestsNeedingApproval}</CardDescription>
            </CardHeader>
            <CardContent>
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
                          {t.dashboard.by}: {approval.submittedBy}
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
                            <CheckCircle2 className="h-3 w-3 mr-1" />
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                {t.dashboard.recentActivity}
              </CardTitle>
              <CardDescription>{t.dashboard.importantEvents}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                    <div
                      className={`mt-0.5 h-2 w-2 rounded-full ${
                        activity.type === "success"
                          ? "bg-success"
                          : activity.type === "warning"
                            ? "bg-warning"
                            : "bg-primary"
                      }`}
                    />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium text-foreground">{activity.action}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{activity.user}</span>
                        <span>•</span>
                        <span>{activity.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="link" className="w-full mt-4">
                {t.dashboard.viewAllHistory}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                {t.dashboard.enrollmentByLevel}
              </CardTitle>
              <CardDescription>{t.dashboard.studentDistribution}</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig}>
                <BarChart data={enrollmentData} accessibilityLayer>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="grade" tickLine={false} tickMargin={10} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="var(--color-count)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-success" />
                {t.dashboard.revenueByCategory}
              </CardTitle>
              <CardDescription>{t.dashboard.revenueDistribution}</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{
                value: {
                  label: t.dashboard.revenue,
                  color: "hsl(var(--chart-1))" // Default color for single value
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
                      <ChartTooltipContent formatter={(value) => `${Number(value).toLocaleString()} GNF`} hideLabel />
                    }
                  />
                </PieChart>
              </ChartContainer>
              <Button variant="link" className="w-full mt-4">
                {t.dashboard.viewAllReports}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
