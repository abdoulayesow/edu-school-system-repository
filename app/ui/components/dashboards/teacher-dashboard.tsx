"use client"

import { useMemo } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Users,
  BookOpen,
  Calendar,
  Clock,
  CheckCircle2,
  ArrowRight,
  Loader2,
  GraduationCap,
  ClipboardCheck,
  FileText,
  BarChart,
} from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import { sizing, typography, componentClasses } from "@/lib/design-tokens"
import { cn } from "@/lib/utils"
import { useGrades } from "@/lib/hooks/use-api"

interface TeacherDashboardProps {
  userName?: string
}

export function TeacherDashboard({ userName }: TeacherDashboardProps) {
  const { t, locale } = useI18n()

  // Fetch grades data (which includes attendance rates)
  const { data: gradesData, isLoading: gradesLoading } = useGrades()

  const loading = gradesLoading

  const grades = gradesData?.grades ?? []

  // Calculate overall stats
  const overallStats = useMemo(() => {
    const totalStudents = grades.reduce((sum, g) => sum + g.stats.studentCount, 0)
    const avgAttendance = grades.length > 0
      ? Math.round(grades.reduce((sum, g) => sum + (g.stats.attendanceRate || 0), 0) / grades.length)
      : 0
    return { totalStudents, avgAttendance, classCount: grades.length }
  }, [grades])

  // Today's date info
  const today = new Date()
  const dayName = today.toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US", { weekday: "long" })
  const dateStr = today.toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric"
  })

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

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="h-1 bg-gspn-maroon-500" />
        <div className="p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gspn-maroon-500/10 rounded-xl">
                <GraduationCap className="size-8 text-gspn-maroon-600 dark:text-gspn-maroon-400" />
              </div>
              <div>
                <h1 className={cn(typography.heading.page, "text-foreground")}>
                  {locale === "fr" ? "Tableau de Bord Enseignant" : "Teacher Dashboard"}
                </h1>
                <p className="text-muted-foreground mt-1">
                  {userName
                    ? (locale === "fr" ? `Bienvenue, ${userName}` : `Welcome, ${userName}`)
                    : (locale === "fr" ? "Gestion de vos classes" : "Manage your classes")
                  }
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium capitalize">{dayName}</p>
              <p className="text-xs text-muted-foreground">{dateStr}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Total Students */}
        <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="h-1 bg-gspn-maroon-500" />
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-gspn-maroon-500/10 rounded-xl">
                <Users className="size-5 text-gspn-maroon-600 dark:text-gspn-maroon-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground">
                  {locale === "fr" ? "Mes élèves" : "My Students"}
                </p>
                <div className={cn(typography.stat.md, "text-gspn-maroon-700 dark:text-gspn-maroon-300")}>
                  {overallStats.totalStudents}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {overallStats.classCount} {locale === "fr" ? "classes" : "classes"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Average Attendance */}
        <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="h-1 bg-emerald-500" />
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-emerald-500/10 rounded-xl">
                <ClipboardCheck className="size-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground">
                  {locale === "fr" ? "Taux de présence" : "Attendance Rate"}
                </p>
                <div className={cn(typography.stat.md, "text-emerald-700 dark:text-emerald-300")}>
                  {overallStats.avgAttendance}%
                </div>
                <div className="w-full bg-emerald-100 dark:bg-emerald-900/30 rounded-full h-1.5 mt-2">
                  <div
                    className="h-1.5 rounded-full bg-emerald-500"
                    style={{ width: `${overallStats.avgAttendance}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="h-1 bg-gspn-gold-500" />
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-gspn-gold-500/10 rounded-xl">
                <Calendar className="size-5 text-gspn-gold-600 dark:text-gspn-gold-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground">
                  {locale === "fr" ? "Actions du jour" : "Today's Actions"}
                </p>
                <div className="flex gap-2 mt-2">
                  <Button size="sm" className={componentClasses.primaryActionButton} asChild>
                    <Link href="/students/attendance">
                      <ClipboardCheck className="size-3.5 mr-1" />
                      {locale === "fr" ? "Présence" : "Attendance"}
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* My Classes */}
        <div className="lg:col-span-2 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-gradient-to-br from-slate-50/50 to-transparent dark:from-slate-900/30 dark:to-transparent shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-slate-100 dark:bg-slate-800 border-b-2 border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <BookOpen className="size-4" />
              {locale === "fr" ? "Mes Classes" : "My Classes"}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {locale === "fr" ? "Vue d'ensemble de vos classes" : "Overview of your classes"}
            </p>
          </div>
          <div className="p-4">
            {grades.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className={cn(sizing.icon.xl, "mx-auto mb-2 opacity-50")} />
                <p>{locale === "fr" ? "Aucune classe assignée" : "No classes assigned"}</p>
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {grades.map((grade) => (
                  <Link
                    key={grade.id}
                    href={`/students?gradeId=${grade.id}`}
                    className="p-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-gspn-gold-400 dark:hover:border-gspn-gold-500 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{grade.name}</h4>
                        <p className="text-xs text-muted-foreground capitalize">{grade.level}</p>
                      </div>
                      <Badge variant="outline">
                        {grade.stats.studentCount} {locale === "fr" ? "élèves" : "students"}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          {locale === "fr" ? "Présence" : "Attendance"}
                        </span>
                        <span className={cn(
                          "font-medium",
                          (grade.stats.attendanceRate || 0) >= 90
                            ? "text-emerald-600 dark:text-emerald-400"
                            : (grade.stats.attendanceRate || 0) >= 75
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-red-600 dark:text-red-400"
                        )}>
                          {grade.stats.attendanceRate || 0}%
                        </span>
                      </div>
                      <Progress
                        value={grade.stats.attendanceRate || 0}
                        className={cn(
                          "h-1.5",
                          (grade.stats.attendanceRate || 0) >= 90
                            ? "[&>div]:bg-emerald-500"
                            : (grade.stats.attendanceRate || 0) >= 75
                              ? "[&>div]:bg-amber-500"
                              : "[&>div]:bg-red-500"
                        )}
                      />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-gradient-to-br from-slate-50/50 to-transparent dark:from-slate-900/30 dark:to-transparent shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-slate-100 dark:bg-slate-800 border-b-2 border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Clock className="size-4" />
              {locale === "fr" ? "Accès Rapide" : "Quick Access"}
            </h3>
          </div>
          <div className="p-4 space-y-3">
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/students/attendance">
                <ClipboardCheck className="size-4 mr-2 text-emerald-600" />
                {locale === "fr" ? "Enregistrer la présence" : "Record Attendance"}
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/students/grades">
                <BarChart className="size-4 mr-2 text-blue-600" />
                {locale === "fr" ? "Saisie des notes" : "Grade Entry"}
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/students/timetable">
                <Calendar className="size-4 mr-2 text-gspn-maroon-600" />
                {locale === "fr" ? "Emploi du temps" : "Timetable"}
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/students">
                <Users className="size-4 mr-2 text-gspn-gold-600" />
                {locale === "fr" ? "Liste des élèves" : "Student List"}
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Class Performance Overview */}
      {grades.length > 0 && (
        <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-gradient-to-br from-slate-50/50 to-transparent dark:from-slate-900/30 dark:to-transparent shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-slate-100 dark:bg-slate-800 border-b-2 border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <BarChart className="size-4" />
              {locale === "fr" ? "Aperçu des Performances" : "Performance Overview"}
            </h3>
          </div>
          <div className="p-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {grades.slice(0, 4).map((grade) => (
                <div
                  key={grade.id}
                  className="p-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-sm">{grade.name}</h4>
                    <Users className="size-4 text-muted-foreground" />
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">{locale === "fr" ? "Élèves" : "Students"}</span>
                        <span className="font-medium">{grade.stats.studentCount}</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">{locale === "fr" ? "Présence" : "Attendance"}</span>
                        <span className="font-medium">{grade.stats.attendanceRate || 0}%</span>
                      </div>
                      <Progress value={grade.stats.attendanceRate || 0} className="h-1.5" />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">{locale === "fr" ? "Matières" : "Subjects"}</span>
                        <span className="font-medium">{grade.stats.subjectCount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
