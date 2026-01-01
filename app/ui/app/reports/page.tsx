"use client"

import { useState, useEffect, useMemo } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { BookOpen, Users, TrendingDown, BarChart3, Calendar, Loader2, AlertTriangle } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import { PageContainer } from "@/components/layout"
import { sizing } from "@/lib/design-tokens"
import { formatDate } from "@/lib/utils"

// Lazy load recharts components
const LineChart = dynamic(() => import("recharts").then(mod => mod.LineChart) as never, { ssr: false }) as typeof import("recharts").LineChart
const Line = dynamic(() => import("recharts").then(mod => mod.Line) as never, { ssr: false }) as typeof import("recharts").Line
const BarChart = dynamic(() => import("recharts").then(mod => mod.BarChart) as never, { ssr: false }) as typeof import("recharts").BarChart
const Bar = dynamic(() => import("recharts").then(mod => mod.Bar) as never, { ssr: false }) as typeof import("recharts").Bar
const CartesianGrid = dynamic(() => import("recharts").then(mod => mod.CartesianGrid) as never, { ssr: false }) as typeof import("recharts").CartesianGrid
const XAxis = dynamic(() => import("recharts").then(mod => mod.XAxis) as never, { ssr: false }) as typeof import("recharts").XAxis
const YAxis = dynamic(() => import("recharts").then(mod => mod.YAxis) as never, { ssr: false }) as typeof import("recharts").YAxis

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

  const chartConfig = {
    rate: {
      label: t.reports.ratePercent,
      color: "hsl(var(--primary))",
    },
  } satisfies ChartConfig

  const attendanceChartConfig = {
    attendance: {
      label: t.nav.attendance,
      color: "hsl(var(--success))",
    },
  } satisfies ChartConfig

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
    <PageContainer maxWidth="full">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">{t.reports.title}</h1>
          <p className="text-muted-foreground">{t.reports.subtitle}</p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card className="py-5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.reports.totalActivities}</CardTitle>
              <BookOpen className={sizing.icon.lg} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summaryStats.totalGrades}</div>
              <p className="text-xs text-muted-foreground">
                {t.common.level}s
              </p>
            </CardContent>
          </Card>

          <Card className="py-5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.reports.enrolledStudents}</CardTitle>
              <Users className={sizing.icon.lg} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summaryStats.totalStudents}</div>
              <p className="text-xs text-muted-foreground">{t.reports.totalEnrollments}</p>
            </CardContent>
          </Card>

          <Card className="py-5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.reports.averageAttendance}</CardTitle>
              <BarChart3 className={sizing.icon.lg} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summaryStats.avgAttendance}%</div>
              <p className="text-xs text-muted-foreground">
                {summaryStats.avgAttendance >= 80 ? t.reports.satisfactoryPerformance : t.reports.needsFollowup}
              </p>
            </CardContent>
          </Card>

          <Card className="py-5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.reports.atRiskStudents}</CardTitle>
              <TrendingDown className={sizing.icon.lg} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summaryStats.atRiskCount}</div>
              <p className="text-xs text-muted-foreground">{t.reports.lowParticipation}</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">{t.reports.tabOverview}</TabsTrigger>
            <TabsTrigger value="participation">{t.reports.tabParticipation}</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">

            {/* Level Filter */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                      <SelectTrigger>
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
              </CardContent>
            </Card>

            {/* Grades List */}
            <Card>
              <CardHeader>
                <CardTitle>{t.reports.allActivities}</CardTitle>
                <CardDescription>
                  {filteredGrades.length} {t.reports.activitiesShown}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredGrades.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Aucune classe trouvée</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredGrades.map((grade) => (
                      <div
                        key={grade.id}
                        className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-lg bg-primary/10">
                            <BookOpen className="h-5 w-5 text-primary" />
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
                              <span className={grade.stats.paymentRate && grade.stats.paymentRate >= 70 ? "text-success" : "text-warning"}>
                                {grade.stats.paymentRate ?? 0}% paiements
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-2xl font-bold ${
                            (grade.stats.attendanceRate ?? 0) >= 80 ? "text-success" :
                            (grade.stats.attendanceRate ?? 0) >= 60 ? "text-warning" : "text-destructive"
                          }`}>
                            {grade.stats.attendanceRate ?? "--"}%
                          </p>
                          <p className="text-xs text-muted-foreground">{t.reports.averageAttendanceRate}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Participation Tab */}
          <TabsContent value="participation" className="space-y-6">
            {/* Grade Selector */}
            <Card>
              <CardContent className="pt-6">
                <Select value={selectedGradeId || ""} onValueChange={setSelectedGradeId}>
                  <SelectTrigger className="w-full md:w-[300px]">
                    <SelectValue placeholder="Sélectionner une classe" />
                  </SelectTrigger>
                  <SelectContent>
                    {grades.map((grade) => (
                      <SelectItem key={grade.id} value={grade.id}>
                        {grade.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {statsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : attendanceStats ? (
              <>
                {/* Attendance Trend Chart */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Calendar className="h-5 w-5 text-primary" />
                          {t.reports.attendanceTrend}
                        </CardTitle>
                        <CardDescription>
                          {t.reports.weeklyAttendanceRate} - {attendanceStats.grade.name}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">{attendanceStats.summary.attendanceRate}%</p>
                        <p className="text-xs text-muted-foreground">Taux global</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {attendanceTrendData.length > 0 ? (
                      <ChartContainer config={chartConfig}>
                        <LineChart data={attendanceTrendData} accessibilityLayer>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="date" tickLine={false} tickMargin={10} axisLine={false} />
                          <YAxis tickLine={false} axisLine={false} domain={[0, 100]} />
                          <ChartTooltip content={<ChartTooltipContent formatter={(value) => `${value}%`} />} />
                          <Line
                            type="monotone"
                            dataKey="rate"
                            stroke="var(--color-rate)"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                        </LineChart>
                      </ChartContainer>
                    ) : (
                      <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                        Aucune donnée de présence disponible
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Session Summary */}
                <div className="grid gap-4 md:grid-cols-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Sessions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{attendanceStats.sessionsCount}</div>
                      <p className="text-xs text-muted-foreground">
                        {attendanceStats.completedSessions} complétées
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-success">Présents</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-success">{attendanceStats.summary.present}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-destructive">Absents</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-destructive">{attendanceStats.summary.absent}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-warning">Retards</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-warning">{attendanceStats.summary.late}</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Top Absences */}
                {attendanceStats.topAbsences.length > 0 && (
                  <Card className="border-warning/50 bg-warning/5">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingDown className="h-5 w-5 text-warning" />
                        {t.reports.lowParticipationStudents}
                      </CardTitle>
                      <CardDescription>{t.reports.studentsNeedingFollowup}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {attendanceStats.topAbsences.map((student) => (
                          <div
                            key={student.studentProfileId}
                            className="flex items-center justify-between p-4 rounded-lg border bg-card"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="font-semibold text-foreground">
                                  {student.person?.firstName} {student.person?.lastName}
                                </h4>
                                {student.studentNumber && (
                                  <Badge variant="outline">{student.studentNumber}</Badge>
                                )}
                              </div>
                              <div className="text-sm text-warning">
                                {student.absenceCount} absences enregistrées
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="h-8 w-8 rounded-full bg-warning/20 flex items-center justify-center">
                                <AlertTriangle className="h-4 w-4 text-warning" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Attendance by Grade Chart */}
                {gradeAttendanceData.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-success" />
                        {t.reports.attendanceByActivity}
                      </CardTitle>
                      <CardDescription>{t.reports.attendanceComparison}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer config={attendanceChartConfig}>
                        <BarChart data={gradeAttendanceData} accessibilityLayer>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis
                            dataKey="name"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            angle={-45}
                            textAnchor="end"
                            height={100}
                          />
                          <YAxis tickLine={false} axisLine={false} domain={[0, 100]} />
                          <ChartTooltip content={<ChartTooltipContent formatter={(value) => `${value}%`} />} />
                          <Bar dataKey="attendance" fill="var(--color-attendance)" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Sélectionnez une classe pour voir les statistiques de présence</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
    </PageContainer>
  )
}
