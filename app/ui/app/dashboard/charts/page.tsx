"use client"

import { useMemo, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts"
import {
  PieChart as PieChartIcon,
  Users,
  DollarSign,
  TrendingUp,
  BookOpen,
  Loader2,
  Wallet,
  GraduationCap,
  AlertCircle,
} from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import { PageContainer } from "@/components/layout"
import { PermissionGuard, NoPermission } from "@/components/permission-guard"
import { sizing, typography } from "@/lib/design-tokens"
import { cn } from "@/lib/utils"
import {
  useGrades,
  useAccountingBalance,
  useExpenses,
} from "@/lib/hooks/use-api"

// GSPN brand colors
const COLORS = {
  maroon: "#8B2332",
  gold: "#D4AF37",
  emerald: "#10B981",
  blue: "#3B82F6",
  amber: "#F59E0B",
  red: "#EF4444",
  purple: "#8B5CF6",
  slate: "#64748B",
}

// Chart color palettes
const LEVEL_COLORS = [COLORS.maroon, COLORS.gold, COLORS.emerald, COLORS.blue]
const PAYMENT_COLORS = [COLORS.emerald, COLORS.amber, COLORS.red]
const EXPENSE_COLORS = [COLORS.maroon, COLORS.gold, COLORS.blue, COLORS.purple, COLORS.slate, COLORS.amber]

function formatGNF(amount: number): string {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M GNF`
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)}K GNF`
  }
  return `${amount.toLocaleString()} GNF`
}

export default function ChartsPage() {
  const { t, locale } = useI18n()
  const { toast } = useToast()

  // Fetch data
  const { data: gradesData, isLoading: gradesLoading, error: gradesError } = useGrades()
  const { data: balanceData, isLoading: balanceLoading, error: balanceError } = useAccountingBalance()
  const { data: expensesData, isLoading: expensesLoading, error: expensesError } = useExpenses({ status: "approved" })

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
    if (balanceError || expensesError) {
      toast({
        variant: "destructive",
        title: t.common.error,
        description: t.dashboard.errors.financialDataUnavailable,
      })
    }
  }, [balanceError, expensesError, toast, t])

  const grades = gradesData?.grades ?? []
  const balance = balanceData ?? null
  const expenses = expensesData?.expenses ?? []

  const loading = gradesLoading || balanceLoading || expensesLoading

  // Enrollment by level (Pie)
  const enrollmentByLevel = useMemo(() => {
    const levelCounts: Record<string, number> = {}
    grades.forEach(g => {
      const levelName = g.level === "kindergarten"
        ? (locale === "fr" ? "Maternelle" : "Kindergarten")
        : g.level === "elementary" || g.level === "primary"
          ? (locale === "fr" ? "Primaire" : "Elementary")
          : g.level === "college" || g.level === "middle"
            ? (locale === "fr" ? "Collège" : "Middle")
            : (locale === "fr" ? "Lycée" : "High School")
      levelCounts[levelName] = (levelCounts[levelName] || 0) + g.stats.studentCount
    })
    return Object.entries(levelCounts).map(([name, value]) => ({ name, value }))
  }, [grades, locale])

  // Total students
  const totalStudents = useMemo(() => {
    return grades.reduce((sum, g) => sum + g.stats.studentCount, 0)
  }, [grades])

  // Payment status distribution (Pie)
  const paymentStatusData = useMemo(() => {
    if (!balance) return []
    const { totalConfirmedPayments, totalPendingPayments } = balance.summary

    const data = []
    if (totalConfirmedPayments > 0) {
      data.push({
        name: locale === "fr" ? "Confirmés" : "Confirmed",
        value: totalConfirmedPayments,
      })
    }
    if (totalPendingPayments > 0) {
      data.push({
        name: locale === "fr" ? "En attente" : "Pending",
        value: totalPendingPayments,
      })
    }
    return data
  }, [balance, locale])

  // Collection rate by grade (Bar)
  const collectionByGrade = useMemo(() => {
    return grades
      .filter(g => g.stats.studentCount > 0)
      .sort((a, b) => a.order - b.order)
      .slice(0, 12) // Limit to 12 grades for readability
      .map(g => ({
        name: g.name,
        rate: g.stats.paymentRate ?? 0,
        students: g.stats.studentCount,
      }))
  }, [grades])

  // Expense categories (Pie)
  const expensesByCategory = useMemo(() => {
    const categoryTotals: Record<string, number> = {}
    expenses.forEach(exp => {
      const category = exp.category || (locale === "fr" ? "Autre" : "Other")
      categoryTotals[category] = (categoryTotals[category] || 0) + exp.amount
    })
    return Object.entries(categoryTotals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6) // Top 6 categories
  }, [expenses, locale])

  // Total expenses
  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, exp) => sum + exp.amount, 0)
  }, [expenses])

  // Total revenue
  const totalRevenue = useMemo(() => {
    if (!balance) return 0
    return balance.summary.totalConfirmedPayments
  }, [balance])

  if (loading) {
    return (
      <PageContainer maxWidth="full">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center space-y-4">
            <Loader2 className={cn(sizing.icon.xl, "animate-spin text-gspn-maroon-500 mx-auto")} />
            <p className="text-muted-foreground">
              {locale === "fr" ? "Chargement des graphiques..." : "Loading charts..."}
            </p>
          </div>
        </div>
      </PageContainer>
    )
  }

  // Show error state if critical data failed to load
  const hasCriticalError = gradesError && balanceError
  if (hasCriticalError) {
    return (
      <PageContainer maxWidth="full">
        <div className="flex items-center justify-center min-h-[50vh]">
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
      </PageContainer>
    )
  }

  return (
    <PermissionGuard
      checks={[
        { resource: "financial_reports", action: "view" },
        { resource: "academic_reports", action: "view" },
      ]}
      fallback={
        <PageContainer maxWidth="full">
          <NoPermission
            title={t.permissions?.accessDenied || "Access Denied"}
            description={locale === "fr"
              ? "Vous n'avez pas la permission de voir les graphiques."
              : "You don't have permission to view charts."
            }
          />
        </PageContainer>
      }
    >
      <PageContainer maxWidth="full">
        {/* Page Header */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm mb-6">
          <div className="h-1 bg-gspn-maroon-500" />
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gspn-maroon-500/10 rounded-xl">
                <PieChartIcon className="size-8 text-gspn-maroon-600 dark:text-gspn-maroon-400" />
              </div>
              <div>
                <h1 className={cn(typography.heading.page, "text-foreground")}>
                  {locale === "fr" ? "Graphiques & Analyses" : "Charts & Analytics"}
                </h1>
                <p className="text-muted-foreground mt-1">
                  {locale === "fr"
                    ? "Visualisation des données financières et académiques"
                    : "Financial and academic data visualization"
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card className="overflow-hidden shadow-sm">
            <div className="h-1 bg-gspn-maroon-500" />
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-gspn-maroon-500/10 rounded-xl">
                  <Users className="size-5 text-gspn-maroon-600 dark:text-gspn-maroon-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-muted-foreground">
                    {locale === "fr" ? "Total Élèves" : "Total Students"}
                  </p>
                  <div className={cn(typography.stat.md, "text-gspn-maroon-700 dark:text-gspn-maroon-300")}>
                    {totalStudents.toLocaleString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden shadow-sm">
            <div className="h-1 bg-emerald-500" />
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-emerald-500/10 rounded-xl">
                  <TrendingUp className="size-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-muted-foreground">
                    {locale === "fr" ? "Revenus Confirmés" : "Confirmed Revenue"}
                  </p>
                  <div className={cn(typography.stat.md, "text-emerald-700 dark:text-emerald-300")}>
                    {formatGNF(totalRevenue)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden shadow-sm">
            <div className="h-1 bg-amber-500" />
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-amber-500/10 rounded-xl">
                  <Wallet className="size-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-muted-foreground">
                    {locale === "fr" ? "Total Dépenses" : "Total Expenses"}
                  </p>
                  <div className={cn(typography.stat.md, "text-amber-700 dark:text-amber-300")}>
                    {formatGNF(totalExpenses)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden shadow-sm">
            <div className="h-1 bg-blue-500" />
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-blue-500/10 rounded-xl">
                  <GraduationCap className="size-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-muted-foreground">
                    {locale === "fr" ? "Classes Actives" : "Active Classes"}
                  </p>
                  <div className={cn(typography.stat.md, "text-blue-700 dark:text-blue-300")}>
                    {grades.length}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Enrollment by Level */}
          <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-gradient-to-br from-slate-50/50 to-transparent dark:from-slate-900/30 dark:to-transparent shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-slate-100 dark:bg-slate-800 border-b-2 border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Users className="size-4" />
                {locale === "fr" ? "Répartition par Niveau" : "Distribution by Level"}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {locale === "fr" ? "Élèves inscrits par cycle" : "Students enrolled by cycle"}
              </p>
            </div>
            <div className="p-4">
              {enrollmentByLevel.length > 0 ? (
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={enrollmentByLevel}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={90}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {enrollmentByLevel.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={LEVEL_COLORS[index % LEVEL_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--background))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                        formatter={(value: number) => [
                          `${value} ${locale === "fr" ? "élèves" : "students"}`,
                          locale === "fr" ? "Effectif" : "Count"
                        ]}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[280px] flex items-center justify-center text-muted-foreground">
                  {locale === "fr" ? "Aucune donnée disponible" : "No data available"}
                </div>
              )}
            </div>
          </div>

          {/* Payment Status Distribution */}
          <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-gradient-to-br from-slate-50/50 to-transparent dark:from-slate-900/30 dark:to-transparent shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-slate-100 dark:bg-slate-800 border-b-2 border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <DollarSign className="size-4" />
                {locale === "fr" ? "Statut des Paiements" : "Payment Status"}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {locale === "fr" ? "Confirmés vs En attente" : "Confirmed vs Pending"}
              </p>
            </div>
            <div className="p-4">
              {paymentStatusData.length > 0 ? (
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={paymentStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={90}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {paymentStatusData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={PAYMENT_COLORS[index % PAYMENT_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--background))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                        formatter={(value: number) => [formatGNF(value), locale === "fr" ? "Montant" : "Amount"]}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[280px] flex items-center justify-center text-muted-foreground">
                  {locale === "fr" ? "Aucun paiement enregistré" : "No payments recorded"}
                </div>
              )}
            </div>
          </div>

          {/* Collection Rate by Grade */}
          <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-gradient-to-br from-slate-50/50 to-transparent dark:from-slate-900/30 dark:to-transparent shadow-sm overflow-hidden lg:col-span-2">
            <div className="px-6 py-4 bg-slate-100 dark:bg-slate-800 border-b-2 border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <TrendingUp className="size-4" />
                {locale === "fr" ? "Taux de Recouvrement par Classe" : "Collection Rate by Class"}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {locale === "fr" ? "Pourcentage de paiements complétés" : "Percentage of completed payments"}
              </p>
            </div>
            <div className="p-4">
              {collectionByGrade.length > 0 ? (
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={collectionByGrade}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis
                        dataKey="name"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        domain={[0, 100]}
                        tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                        tickFormatter={(value) => `${value}%`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--background))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                        labelStyle={{ fontWeight: 600 }}
                        formatter={(value: number, name: string) => {
                          if (name === "rate") return [`${value}%`, locale === "fr" ? "Taux" : "Rate"]
                          return [value, name]
                        }}
                      />
                      <Bar
                        dataKey="rate"
                        fill={COLORS.maroon}
                        radius={[6, 6, 0, 0]}
                        name={locale === "fr" ? "Taux" : "Rate"}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                  {locale === "fr" ? "Aucune donnée de recouvrement" : "No collection data"}
                </div>
              )}
            </div>
          </div>

          {/* Expense Categories */}
          <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-gradient-to-br from-slate-50/50 to-transparent dark:from-slate-900/30 dark:to-transparent shadow-sm overflow-hidden lg:col-span-2">
            <div className="px-6 py-4 bg-slate-100 dark:bg-slate-800 border-b-2 border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Wallet className="size-4" />
                {locale === "fr" ? "Répartition des Dépenses" : "Expense Breakdown"}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {locale === "fr" ? "Par catégorie de dépense" : "By expense category"}
              </p>
            </div>
            <div className="p-4">
              {expensesByCategory.length > 0 ? (
                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={expensesByCategory}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={90}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {expensesByCategory.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--background))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                            fontSize: "12px",
                          }}
                          formatter={(value: number) => [formatGNF(value), locale === "fr" ? "Montant" : "Amount"]}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-3">
                    {expensesByCategory.map((cat, index) => (
                      <div
                        key={cat.name}
                        className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: EXPENSE_COLORS[index % EXPENSE_COLORS.length] }}
                          />
                          <span className="font-medium text-sm">{cat.name}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {formatGNF(cat.value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-[280px] flex items-center justify-center text-muted-foreground">
                  {locale === "fr" ? "Aucune dépense enregistrée" : "No expenses recorded"}
                </div>
              )}
            </div>
          </div>
        </div>
      </PageContainer>
    </PermissionGuard>
  )
}
