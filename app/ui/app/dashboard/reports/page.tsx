"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Users, TrendingDown, BarChart3, Calendar, Loader2, AlertTriangle } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import { PageContainer } from "@/components/layout"
import { PermissionGuard, NoPermission } from "@/components/permission-guard"
import { sizing, typography } from "@/lib/design-tokens"
import { cn, formatDate } from "@/lib/utils"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts"

interface Grade {
  id: string
  name: string
  code: string | null
  level: string
  order: number
  tuitionFee: number
  stats: {
    studentCount: number
    subjectCount: number
    attendanceRate: number | null
    paymentRate: number | null
    paymentBreakdown: {
      late: number
      onTime: number
      complete: number
    }
  }
}

interface AttendanceStats {
  grade: {
    id: string
    name: string
    level: string
  }
  summary: {
    totalRecords: number
    present: number
    absent: number
    late: number
    excused: number
    attendanceRate: number
  }
  sessionsCount: number
  completedSessions: number
  dailyBreakdown: Array<{
    date: string
    present: number
    absent: number
    late: number
    excused: number
    total: number
  }>
  topAbsences: Array<{
    studentProfileId: string
    studentNumber: string | null
    person: { firstName: string; lastName: string; photoUrl: string | null } | null
    absenceCount: number
  }>
}

export default function ReportsPage() {
  const { t, locale } = useI18n()
  const [grades, setGrades] = useState<Grade[]>([])
  const [selectedGradeId, setSelectedGradeId] = useState<string | null>(null)
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(false)
  const [selectedLevel, setSelectedLevel] = useState<string>("all")

  // Fetch grades on mount
  useEffect(() => {
    async function fetchGrades() {
      try {
        const res = await fetch("/api/grades")
        if (res.ok) {
          const data = await res.json()
          setGrades(data.grades || [])
          // Auto-select first grade if available
          if (data.grades?.length > 0) {
            setSelectedGradeId(data.grades[0].id)
          }
        }
      } catch (err) {
        console.error("Error fetching grades:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchGrades()
  }, [])

  // Fetch attendance stats when grade changes
  useEffect(() => {
    if (!selectedGradeId) return

    async function fetchAttendanceStats() {
      setStatsLoading(true)
      try {
        const res = await fetch(`/api/attendance/stats/grade/${selectedGradeId}`)
        if (res.ok) {
          const data = await res.json()
          setAttendanceStats(data)
        }
      } catch (err) {
        console.error("Error fetching attendance stats:", err)
      } finally {
        setStatsLoading(false)
      }
    }
    fetchAttendanceStats()
  }, [selectedGradeId])

  // Filter grades by level
  const filteredGrades = useMemo(() => {
    if (selectedLevel === "all") return grades
    return grades.filter(g => g.level === selectedLevel)
  }, [grades, selectedLevel])

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const totalStudents = grades.reduce((sum, g) => sum + g.stats.studentCount, 0)
    const gradesWithAttendance = grades.filter(g => g.stats.attendanceRate !== null)
    const avgAttendance = gradesWithAttendance.length > 0
      ? Math.round(gradesWithAttendance.reduce((sum, g) => sum + (g.stats.attendanceRate || 0), 0) / gradesWithAttendance.length)
      : 0
    const atRiskCount = grades.reduce((sum, g) => sum + g.stats.paymentBreakdown.late, 0)

    return {
      totalGrades: grades.length,
      totalStudents,
      avgAttendance,
      atRiskCount,
    }
  }, [grades])

  // Prepare attendance trend data
  const attendanceTrendData = useMemo(() => {
    if (!attendanceStats?.dailyBreakdown) return []
    // Reverse to show chronological order and limit to last 14 days
    return attendanceStats.dailyBreakdown
      .slice(0, 14)
      .reverse()
      .map(day => ({
        date: formatDate(day.date, locale),
        rate: day.total > 0 ? Math.round((day.present + day.late + day.excused) / day.total * 100) : 0,
        present: day.present,
        absent: day.absent,
      }))
  }, [attendanceStats])

  // Prepare grade attendance chart data
  const gradeAttendanceData = useMemo(() => {
    return filteredGrades
      .filter(g => g.stats.attendanceRate !== null)
      .map(g => ({
        name: g.name,
        attendance: g.stats.attendanceRate,
      }))
  }, [filteredGrades])

  if (loading) {
    return (
      <PageContainer maxWidth="full">
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PageContainer>
    )
  }

  return (
    <PermissionGuard
      checks={[
        { resource: "academic_reports", action: "view" },
        { resource: "attendance_reports", action: "view" },
      ]}
      fallback={
        <PageContainer maxWidth="full">
          <NoPermission
            title={t.permissions?.accessDenied || "Access Denied"}
            description={t.permissions?.noReportsPermission || "You don't have permission to view reports."}
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
                <BarChart3 className="size-8 text-gspn-maroon-600 dark:text-gspn-maroon-400" />
              </div>
              <div>
                <h1 className={cn(typography.heading.page, "text-foreground")}>
                  {t.reports.title}
                </h1>
                <p className="text-muted-foreground mt-1">{t.reports.subtitle}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="h-1 bg-gspn-maroon-500" />
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-gspn-maroon-500/10 rounded-xl">
                  <BookOpen className="size-5 text-gspn-maroon-600 dark:text-gspn-maroon-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-muted-foreground">{t.reports.totalActivities}</p>
                  <div className={cn(typography.stat.md, "text-gspn-maroon-700 dark:text-gspn-maroon-300")}>
                    {summaryStats.totalGrades}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{t.common.level}s</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="h-1 bg-blue-500" />
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-blue-500/10 rounded-xl">
                  <Users className="size-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-muted-foreground">{t.reports.enrolledStudents}</p>
                  <div className={cn(typography.stat.md, "text-blue-700 dark:text-blue-300")}>
                    {summaryStats.totalStudents}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{t.reports.totalEnrollments}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="h-1 bg-emerald-500" />
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-emerald-500/10 rounded-xl">
                  <BarChart3 className="size-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-muted-foreground">{t.reports.averageAttendance}</p>
                  <div className={cn(typography.stat.md, "text-emerald-700 dark:text-emerald-300")}>
                    {summaryStats.avgAttendance}%
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {summaryStats.avgAttendance >= 80 ? t.reports.satisfactoryPerformance : t.reports.needsFollowup}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="h-1 bg-amber-500" />
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-amber-500/10 rounded-xl">
                  <TrendingDown className="size-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-muted-foreground">{t.reports.atRiskStudents}</p>
                  <div className={cn(typography.stat.md, "text-amber-700 dark:text-amber-300")}>
                    {summaryStats.atRiskCount}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{t.reports.lowParticipation}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-gspn-gold-500 data-[state=active]:text-black"
            >
              {t.reports.tabOverview}
            </TabsTrigger>
            <TabsTrigger
              value="participation"
              className="data-[state=active]:bg-gspn-gold-500 data-[state=active]:text-black"
            >
              {t.reports.tabParticipation}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">

            {/* Level Filter */}
            <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-gradient-to-br from-slate-50/50 to-transparent dark:from-slate-900/30 dark:to-transparent shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-slate-100 dark:bg-slate-800 border-b-2 border-slate-200 dark:border-slate-700">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <BookOpen className="size-4" />
                  {locale === "fr" ? "Filtrer par niveau" : "Filter by Level"}
                </h3>
              </div>
              <div className="p-4">
                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger className="w-full md:w-[300px]">
                    <SelectValue placeholder={t.reports.allLevels} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.reports.allLevels}</SelectItem>
                    <SelectItem value="elementary">Primaire</SelectItem>
                    <SelectItem value="college">Collège</SelectItem>
                    <SelectItem value="high_school">Lycée</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Grades List */}
            <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-gradient-to-br from-slate-50/50 to-transparent dark:from-slate-900/30 dark:to-transparent shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-slate-100 dark:bg-slate-800 border-b-2 border-slate-200 dark:border-slate-700">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Users className="size-4" />
                  {t.reports.allActivities}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {filteredGrades.length} {t.reports.activitiesShown}
                </p>
              </div>
              <div className="p-4">
                {filteredGrades.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertTriangle className={cn(sizing.icon.xl, "mx-auto mb-2 opacity-50")} />
                    <p>Aucune classe trouvée</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredGrades.map((grade) => (
                      <div
                        key={grade.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-gspn-gold-400 dark:hover:border-gspn-gold-500 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2.5 bg-gspn-maroon-500/10 rounded-xl">
                            <BookOpen className="size-5 text-gspn-maroon-600 dark:text-gspn-maroon-400" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-foreground">{grade.name}</h3>
                              <Badge variant="outline" className="text-xs">
                                {grade.level === "elementary" ? "Primaire" :
                                 grade.level === "college" ? "Collège" : "Lycée"}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>{grade.stats.studentCount} {t.common.students}</span>
                              <span>•</span>
                              <span>{grade.stats.subjectCount} matières</span>
                              <span>•</span>
                              <span className={cn(
                                grade.stats.paymentRate && grade.stats.paymentRate >= 70
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : "text-amber-600 dark:text-amber-400"
                              )}>
                                {grade.stats.paymentRate ?? 0}% paiements
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={cn(
                            "text-2xl font-bold",
                            (grade.stats.attendanceRate ?? 0) >= 80
                              ? "text-emerald-600 dark:text-emerald-400"
                              : (grade.stats.attendanceRate ?? 0) >= 60
                                ? "text-amber-600 dark:text-amber-400"
                                : "text-red-600 dark:text-red-400"
                          )}>
                            {grade.stats.attendanceRate ?? "--"}%
                          </p>
                          <p className="text-xs text-muted-foreground">{t.reports.averageAttendanceRate}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Participation Tab */}
          <TabsContent value="participation" className="space-y-6">
            {/* Grade Selector */}
            <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-gradient-to-br from-slate-50/50 to-transparent dark:from-slate-900/30 dark:to-transparent shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-slate-100 dark:bg-slate-800 border-b-2 border-slate-200 dark:border-slate-700">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <BookOpen className="size-4" />
                  {locale === "fr" ? "Sélectionner une classe" : "Select a Class"}
                </h3>
              </div>
              <div className="p-4">
                <Select value={selectedGradeId || ""} onValueChange={setSelectedGradeId}>
                  <SelectTrigger className="w-full md:w-[300px]">
                    <SelectValue placeholder={locale === "fr" ? "Sélectionner une classe" : "Select a class"} />
                  </SelectTrigger>
                  <SelectContent>
                    {grades.map((grade) => (
                      <SelectItem key={grade.id} value={grade.id}>
                        {grade.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {statsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className={cn(sizing.icon.xl, "animate-spin text-gspn-maroon-500")} />
              </div>
            ) : attendanceStats ? (
              <>
                {/* Attendance Trend Chart */}
                <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-gradient-to-br from-slate-50/50 to-transparent dark:from-slate-900/30 dark:to-transparent shadow-sm overflow-hidden">
                  <div className="px-6 py-4 bg-slate-100 dark:bg-slate-800 border-b-2 border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                          <Calendar className="size-4" />
                          {t.reports.attendanceTrend}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {t.reports.weeklyAttendanceRate} - {attendanceStats.grade.name}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={cn(typography.stat.md, "text-gspn-maroon-700 dark:text-gspn-maroon-300")}>
                          {attendanceStats.summary.attendanceRate}%
                        </p>
                        <p className="text-xs text-muted-foreground">{locale === "fr" ? "Taux global" : "Overall rate"}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    {attendanceTrendData.length > 0 ? (
                      <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={attendanceTrendData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                            <XAxis
                              dataKey="date"
                              tickLine={false}
                              tickMargin={10}
                              axisLine={false}
                              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                            />
                            <YAxis
                              tickLine={false}
                              axisLine={false}
                              domain={[0, 100]}
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
                              formatter={(value: number) => [`${value}%`, locale === "fr" ? "Taux" : "Rate"]}
                            />
                            <Line
                              type="monotone"
                              dataKey="rate"
                              stroke="#8B2332"
                              strokeWidth={2}
                              dot={{ r: 4, fill: "#8B2332" }}
                              activeDot={{ r: 6, fill: "#D4AF37" }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                        {locale === "fr" ? "Aucune donnée de présence disponible" : "No attendance data available"}
                      </div>
                    )}
                  </div>
                </div>

                {/* Session Summary */}
                <div className="grid gap-4 md:grid-cols-4">
                  <Card className="overflow-hidden shadow-sm">
                    <div className="h-1 bg-gspn-maroon-500" />
                    <CardContent className="pt-6">
                      <p className="text-sm font-medium text-muted-foreground">Sessions</p>
                      <div className={cn(typography.stat.md, "text-gspn-maroon-700 dark:text-gspn-maroon-300")}>
                        {attendanceStats.sessionsCount}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {attendanceStats.completedSessions} {locale === "fr" ? "complétées" : "completed"}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="overflow-hidden shadow-sm">
                    <div className="h-1 bg-emerald-500" />
                    <CardContent className="pt-6">
                      <p className="text-sm font-medium text-muted-foreground">
                        {locale === "fr" ? "Présents" : "Present"}
                      </p>
                      <div className={cn(typography.stat.md, "text-emerald-700 dark:text-emerald-300")}>
                        {attendanceStats.summary.present}
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="overflow-hidden shadow-sm">
                    <div className="h-1 bg-red-500" />
                    <CardContent className="pt-6">
                      <p className="text-sm font-medium text-muted-foreground">
                        {locale === "fr" ? "Absents" : "Absent"}
                      </p>
                      <div className={cn(typography.stat.md, "text-red-700 dark:text-red-300")}>
                        {attendanceStats.summary.absent}
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="overflow-hidden shadow-sm">
                    <div className="h-1 bg-amber-500" />
                    <CardContent className="pt-6">
                      <p className="text-sm font-medium text-muted-foreground">
                        {locale === "fr" ? "Retards" : "Late"}
                      </p>
                      <div className={cn(typography.stat.md, "text-amber-700 dark:text-amber-300")}>
                        {attendanceStats.summary.late}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Top Absences */}
                {attendanceStats.topAbsences.length > 0 && (
                  <div className="rounded-2xl border-2 border-amber-300 dark:border-amber-700 bg-gradient-to-br from-amber-50/50 to-transparent dark:from-amber-900/20 dark:to-transparent shadow-sm overflow-hidden">
                    <div className="px-6 py-4 bg-amber-100 dark:bg-amber-900/30 border-b-2 border-amber-300 dark:border-amber-700">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-2">
                        <TrendingDown className="size-4" />
                        {t.reports.lowParticipationStudents}
                      </h3>
                      <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                        {t.reports.studentsNeedingFollowup}
                      </p>
                    </div>
                    <div className="p-4 space-y-3">
                      {attendanceStats.topAbsences.map((student) => (
                        <div
                          key={student.studentProfileId}
                          className="flex items-center justify-between p-4 rounded-lg bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <h4 className="font-semibold text-foreground">
                                {student.person?.firstName} {student.person?.lastName}
                              </h4>
                              {student.studentNumber && (
                                <Badge variant="outline">{student.studentNumber}</Badge>
                              )}
                            </div>
                            <div className="text-sm text-amber-600 dark:text-amber-400">
                              {student.absenceCount} {locale === "fr" ? "absences enregistrées" : "recorded absences"}
                            </div>
                          </div>
                          <div className="p-2 bg-amber-500/10 rounded-xl">
                            <AlertTriangle className="size-5 text-amber-600 dark:text-amber-400" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Attendance by Grade Chart */}
                {gradeAttendanceData.length > 0 && (
                  <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-gradient-to-br from-slate-50/50 to-transparent dark:from-slate-900/30 dark:to-transparent shadow-sm overflow-hidden">
                    <div className="px-6 py-4 bg-slate-100 dark:bg-slate-800 border-b-2 border-slate-200 dark:border-slate-700">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <BarChart3 className="size-4" />
                        {t.reports.attendanceByActivity}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {t.reports.attendanceComparison}
                      </p>
                    </div>
                    <div className="p-4">
                      <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={gradeAttendanceData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                            <XAxis
                              dataKey="name"
                              tickLine={false}
                              tickMargin={10}
                              axisLine={false}
                              angle={-45}
                              textAnchor="end"
                              height={100}
                              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                            />
                            <YAxis
                              tickLine={false}
                              axisLine={false}
                              domain={[0, 100]}
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
                              formatter={(value: number) => [`${value}%`, locale === "fr" ? "Présence" : "Attendance"]}
                            />
                            <Bar dataKey="attendance" fill="#10B981" radius={[6, 6, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-gradient-to-br from-slate-50/50 to-transparent dark:from-slate-900/30 dark:to-transparent shadow-sm overflow-hidden p-12 text-center">
                <div className="p-4 bg-gspn-maroon-500/10 rounded-xl w-fit mx-auto mb-4">
                  <BookOpen className={cn(sizing.icon.xl, "text-gspn-maroon-600 dark:text-gspn-maroon-400")} />
                </div>
                <p className="text-muted-foreground">
                  {locale === "fr"
                    ? "Sélectionnez une classe pour voir les statistiques de présence"
                    : "Select a class to view attendance statistics"
                  }
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
    </PageContainer>
    </PermissionGuard>
  )
}
