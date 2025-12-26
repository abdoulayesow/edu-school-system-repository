"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { BookOpen, Users, TrendingDown, BarChart3, Calendar } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"

// Lazy load recharts components to improve initial compile time
const LineChart = dynamic(() => import("recharts").then(mod => ({ default: mod.LineChart })), { ssr: false })
const Line = dynamic(() => import("recharts").then(mod => ({ default: mod.Line })), { ssr: false })
const BarChart = dynamic(() => import("recharts").then(mod => ({ default: mod.BarChart })), { ssr: false })
const Bar = dynamic(() => import("recharts").then(mod => ({ default: mod.Bar })), { ssr: false })
const CartesianGrid = dynamic(() => import("recharts").then(mod => ({ default: mod.CartesianGrid })), { ssr: false })
const XAxis = dynamic(() => import("recharts").then(mod => ({ default: mod.XAxis })), { ssr: false })
const YAxis = dynamic(() => import("recharts").then(mod => ({ default: mod.YAxis })), { ssr: false })

export default function ReportsPage() {
  const { t } = useI18n()
  const [selectedTeacher, setSelectedTeacher] = useState<string>("all")
  const [selectedGrade, setSelectedGrade] = useState<string>("all")

  const activities = [
    {
      id: 1,
      name: "English Class",
      type: "curricular",
      teacher: "Amadou Diallo",
      grade: "10ème",
      enrolled: 28,
      avgAttendance: 92,
    },
    {
      id: 2,
      name: "Mathematics Advanced",
      type: "curricular",
      teacher: "Fatoumata Sow",
      grade: "11ème",
      enrolled: 26,
      avgAttendance: 88,
    },
    {
      id: 3,
      name: "English Club",
      type: "extracurricular",
      teacher: "Amadou Diallo",
      grade: "Mixed",
      enrolled: 24,
      avgAttendance: 85,
    },
    {
      id: 4,
      name: "Football",
      type: "extracurricular",
      teacher: "Ibrahim Conte",
      grade: "Mixed",
      enrolled: 32,
      avgAttendance: 78,
    },
    {
      id: 5,
      name: "Physics",
      type: "curricular",
      teacher: "Mariama Bah",
      grade: "10ème",
      enrolled: 28,
      avgAttendance: 90,
    },
    {
      id: 6,
      name: "Computer Science",
      type: "curricular",
      teacher: "Oumar Sylla",
      grade: "11ème",
      enrolled: 22,
      avgAttendance: 94,
    },
  ]

  const attendanceTrend = [
    { week: "Sem 1", rate: 85 },
    { week: "Sem 2", rate: 88 },
    { week: "Sem 3", rate: 82 },
    { week: "Sem 4", rate: 87 },
    { week: "Sem 5", rate: 89 },
    { week: "Sem 6", rate: 86 },
    { week: "Sem 7", rate: 91 },
    { week: "Sem 8", rate: 88 },
  ]

  const lowParticipationStudents = [
    { name: "Oumar Keita", grade: "12ème", activities: 3, attendance: 45, reason: t.reports.lowFrequency },
    { name: "Aissata Conte", grade: "10ème", activities: 4, attendance: 52, reason: t.reports.repeatedAbsences },
    { name: "Mamadou Sylla", grade: "11ème", activities: 2, attendance: 38, reason: t.reports.veryLowParticipation },
    { name: "Aminata Touré", grade: "9ème", activities: 3, attendance: 58, reason: t.reports.needsFollowup },
  ]

  const teachers = ["Amadou Diallo", "Fatoumata Sow", "Ibrahim Conte", "Mariama Bah", "Oumar Sylla"]
  const grades = ["6ème", "7ème", "8ème", "9ème", "10ème", "11ème", "12ème"]

  const filteredActivities = activities.filter((activity) => {
    const matchesTeacher = selectedTeacher === "all" || activity.teacher === selectedTeacher
    const matchesGrade = selectedGrade === "all" || activity.grade === selectedGrade
    return matchesTeacher && matchesGrade
  })

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

  return (
    <div className="min-h-screen bg-background pt-4 lg:pt-4">
      <main className="container mx-auto px-4 py-4">
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-foreground mb-2">{t.reports.title}</h1>
          <p className="text-muted-foreground">{t.reports.subtitle} - Fatoumata Diallo</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">{t.reports.tabOverview}</TabsTrigger>
            <TabsTrigger value="participation">{t.reports.tabParticipation}</TabsTrigger>
          </TabsList>

          {/* Activity Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{t.reports.totalActivities}</CardTitle>
                  <BookOpen className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{activities.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {activities.filter((a) => a.type === "curricular").length} {t.reports.academicActivities} •{" "}
                    {activities.filter((a) => a.type === "extracurricular").length} {t.reports.extraActivities}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{t.reports.enrolledStudents}</CardTitle>
                  <Users className="h-5 w-5 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">
                    {activities.reduce((sum, a) => sum + a.enrolled, 0)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{t.reports.totalEnrollments}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{t.reports.averageAttendance}</CardTitle>
                  <BarChart3 className="h-5 w-5 text-success" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">
                    {Math.round(activities.reduce((sum, a) => sum + a.avgAttendance, 0) / activities.length)}%
                  </div>
                  <p className="text-xs text-success mt-1">{t.reports.satisfactoryPerformance}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{t.reports.atRiskStudents}</CardTitle>
                  <TrendingDown className="h-5 w-5 text-destructive" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-destructive">{lowParticipationStudents.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">{t.reports.lowParticipation}</p>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                      <SelectTrigger>
                        <SelectValue placeholder={t.reports.allTeachers} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t.reports.allTeachers}</SelectItem>
                        {teachers.map((teacher) => (
                          <SelectItem key={teacher} value={teacher}>
                            {teacher}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                      <SelectTrigger>
                        <SelectValue placeholder={t.reports.allLevels} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t.reports.allLevels}</SelectItem>
                        {grades.map((grade) => (
                          <SelectItem key={grade} value={grade}>
                            {grade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Activities List */}
            <Card>
              <CardHeader>
                <CardTitle>{t.reports.allActivities}</CardTitle>
                <CardDescription>
                  {filteredActivities.length} {t.reports.activitiesShown}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        {activity.type === "curricular" ? (
                          <div className="p-3 rounded-lg bg-primary/10">
                            <BookOpen className="h-5 w-5 text-primary" />
                          </div>
                        ) : (
                          <div className="p-3 rounded-lg bg-accent/10">
                            <Users className="h-5 w-5 text-accent" />
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-foreground">{activity.name}</h3>
                            <Badge
                              variant={activity.type === "curricular" ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {activity.type === "curricular" ? t.activities.academic : t.activities.extra}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{t.common.teacher}: {activity.teacher}</span>
                            <span>•</span>
                            <span>{t.common.level}: {activity.grade}</span>
                            <span>•</span>
                            <span>{activity.enrolled} {t.common.students}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-foreground">{activity.avgAttendance}%</p>
                        <p className="text-xs text-muted-foreground">{t.reports.averageAttendanceRate}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Participation Reports Tab */}
          <TabsContent value="participation" className="space-y-6">
            {/* Attendance Trend Chart */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      {t.reports.attendanceTrend}
                    </CardTitle>
                    <CardDescription>{t.reports.weeklyAttendanceRate} {t.activities.englishClub}</CardDescription>
                  </div>
                  <Select defaultValue="english-club">
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english-club">{t.activities.englishClub}</SelectItem>
                      <SelectItem value="math">{t.activities.advancedMath}</SelectItem>
                      <SelectItem value="football">{t.activities.football}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig}>
                  <LineChart data={attendanceTrend} accessibilityLayer>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="week" tickLine={false} tickMargin={10} axisLine={false} />
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
              </CardContent>
            </Card>

            {/* Low Participation Students */}
            <Card className="border-warning/50 bg-warning/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-warning" />
                  {t.reports.lowParticipationStudents}
                </CardTitle>
                <CardDescription>
                  {t.reports.studentsNeedingFollowup}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {lowParticipationStudents.map((student, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg border bg-card">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-foreground">{student.name}</h4>
                          <Badge variant="outline">{student.grade}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{student.activities} {t.reports.activitiesEnrolled}</span>
                          <span>•</span>
                          <span className="text-warning">{student.reason}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-warning">{student.attendance}%</p>
                        <p className="text-xs text-muted-foreground">{t.nav.attendance}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Attendance by Activity */}
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
                  <BarChart
                    data={activities.map((a) => ({ name: a.name, attendance: a.avgAttendance }))}
                    accessibilityLayer
                  >
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
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
