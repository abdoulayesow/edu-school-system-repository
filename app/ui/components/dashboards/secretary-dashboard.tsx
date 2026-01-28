"use client"

import { useMemo } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  FileText,
  Users,
  UserPlus,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Loader2,
  ClipboardList,
  Send,
  FileCheck,
  Plus,
} from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import { sizing, typography, componentClasses } from "@/lib/design-tokens"
import { cn } from "@/lib/utils"
import { useEnrollments, useGrades } from "@/lib/hooks/use-api"

interface SecretaryDashboardProps {
  userName?: string
}

export function SecretaryDashboard({ userName }: SecretaryDashboardProps) {
  const { t, locale } = useI18n()

  // Fetch enrollments with different statuses
  const { data: allEnrollmentsData, isLoading: enrollmentsLoading } = useEnrollments({ limit: 100 })
  const { data: gradesData, isLoading: gradesLoading } = useGrades()

  const loading = enrollmentsLoading || gradesLoading

  const enrollments = allEnrollmentsData?.enrollments ?? []
  const stats = allEnrollmentsData?.stats ?? { total: 0, draft: 0, submitted: 0, needsReview: 0, completed: 0 }
  const grades = gradesData?.grades ?? []

  // Recent enrollments (last 5)
  const recentEnrollments = useMemo(() => {
    return [...enrollments]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
  }, [enrollments])

  // Enrollments by status for pipeline
  const pipeline = useMemo(() => {
    const draft = enrollments.filter(e => e.status === "draft").length
    const submitted = enrollments.filter(e => e.status === "submitted").length
    const needsReview = enrollments.filter(e => e.status === "needs_review").length
    const completed = enrollments.filter(e => e.status === "completed").length
    const total = draft + submitted + needsReview + completed
    return { draft, submitted, needsReview, completed, total }
  }, [enrollments])

  // Enrollment by grade
  const enrollmentsByGrade = useMemo(() => {
    return grades.map(grade => ({
      id: grade.id,
      name: grade.name,
      count: grade.stats.studentCount,
      capacity: grade.capacity,
      percentage: grade.capacity > 0 ? Math.round((grade.stats.studentCount / grade.capacity) * 100) : 0,
    })).sort((a, b) => a.name.localeCompare(b.name))
  }, [grades])

  const statusConfig: Record<string, { label: string; labelFr: string; color: string; icon: React.ElementType }> = {
    draft: { label: "Draft", labelFr: "Brouillon", color: "bg-slate-500", icon: FileText },
    submitted: { label: "Submitted", labelFr: "Soumis", color: "bg-blue-500", icon: Send },
    needs_review: { label: "Needs Review", labelFr: "En révision", color: "bg-amber-500", icon: AlertCircle },
    completed: { label: "Completed", labelFr: "Terminé", color: "bg-emerald-500", icon: CheckCircle2 },
  }

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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gspn-maroon-500/10 rounded-xl">
                <ClipboardList className="size-8 text-gspn-maroon-600 dark:text-gspn-maroon-400" />
              </div>
              <div>
                <h1 className={cn(typography.heading.page, "text-foreground")}>
                  {locale === "fr" ? "Tableau de Bord Secrétariat" : "Secretary Dashboard"}
                </h1>
                <p className="text-muted-foreground mt-1">
                  {userName
                    ? (locale === "fr" ? `Bienvenue, ${userName}` : `Welcome, ${userName}`)
                    : (locale === "fr" ? "Gestion des inscriptions" : "Enrollment management")
                  }
                </p>
              </div>
            </div>
            <Button className={componentClasses.primaryActionButton} asChild>
              <Link href="/students/enrollments/new">
                <Plus className="size-4 mr-2" />
                {locale === "fr" ? "Nouvelle inscription" : "New Enrollment"}
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Enrollment Pipeline Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Draft */}
        <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="h-1 bg-slate-500" />
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-slate-500/10 rounded-xl">
                <FileText className="size-5 text-slate-600 dark:text-slate-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground">
                  {locale === "fr" ? "Brouillons" : "Drafts"}
                </p>
                <div className={cn(typography.stat.md, "text-slate-700 dark:text-slate-300")}>
                  {pipeline.draft}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {locale === "fr" ? "À compléter" : "To complete"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submitted */}
        <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="h-1 bg-blue-500" />
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-blue-500/10 rounded-xl">
                <Send className="size-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground">
                  {locale === "fr" ? "Soumis" : "Submitted"}
                </p>
                <div className={cn(typography.stat.md, "text-blue-700 dark:text-blue-300")}>
                  {pipeline.submitted}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {locale === "fr" ? "En attente d'approbation" : "Awaiting approval"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Needs Review */}
        <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="h-1 bg-amber-500" />
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-amber-500/10 rounded-xl">
                <AlertCircle className="size-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground">
                  {locale === "fr" ? "En révision" : "Needs Review"}
                </p>
                <div className={cn(typography.stat.md, "text-amber-700 dark:text-amber-300")}>
                  {pipeline.needsReview}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {locale === "fr" ? "Requiert attention" : "Requires attention"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Completed */}
        <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="h-1 bg-emerald-500" />
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-emerald-500/10 rounded-xl">
                <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground">
                  {locale === "fr" ? "Terminés" : "Completed"}
                </p>
                <div className={cn(typography.stat.md, "text-emerald-700 dark:text-emerald-300")}>
                  {pipeline.completed}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {locale === "fr" ? "Cette année" : "This year"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Enrollments */}
        <div className="lg:col-span-2 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-gradient-to-br from-slate-50/50 to-transparent dark:from-slate-900/30 dark:to-transparent shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-slate-100 dark:bg-slate-800 border-b-2 border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Clock className="size-4" />
                {locale === "fr" ? "Inscriptions Récentes" : "Recent Enrollments"}
              </h3>
              <Button variant="outline" size="sm" asChild>
                <Link href="/students/enrollments">
                  {locale === "fr" ? "Voir tout" : "View all"}
                </Link>
              </Button>
            </div>
          </div>
          <div className="p-4">
            {recentEnrollments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className={cn(sizing.icon.xl, "mx-auto mb-2 opacity-50")} />
                <p>{locale === "fr" ? "Aucune inscription récente" : "No recent enrollments"}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentEnrollments.map((enrollment) => {
                  const config = statusConfig[enrollment.status] || statusConfig.draft
                  const StatusIcon = config.icon
                  return (
                    <Link
                      key={enrollment.id}
                      href={`/students/enrollments/${enrollment.id}`}
                      className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-gspn-gold-400 dark:hover:border-gspn-gold-500 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-lg", config.color + "/10")}>
                          <StatusIcon className={cn("size-4", config.color.replace("bg-", "text-"))} />
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {enrollment.firstName} {enrollment.lastName}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-muted-foreground">
                              {enrollment.grade?.name || "N/A"}
                            </span>
                            <Badge variant="outline" className="text-[10px] h-4">
                              {locale === "fr" ? config.labelFr : config.label}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">
                          {new Date(enrollment.createdAt).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US")}
                        </span>
                        <ArrowRight className="size-4 text-muted-foreground" />
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-gradient-to-br from-slate-50/50 to-transparent dark:from-slate-900/30 dark:to-transparent shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-slate-100 dark:bg-slate-800 border-b-2 border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <FileCheck className="size-4" />
              {locale === "fr" ? "Actions Rapides" : "Quick Actions"}
            </h3>
          </div>
          <div className="p-4 space-y-3">
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/students/enrollments/new">
                <UserPlus className="size-4 mr-2 text-emerald-600" />
                {locale === "fr" ? "Nouvelle inscription" : "New Enrollment"}
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/students/enrollments?status=draft">
                <FileText className="size-4 mr-2 text-slate-600" />
                {locale === "fr" ? "Continuer un brouillon" : "Continue Draft"}
                {pipeline.draft > 0 && (
                  <Badge variant="secondary" className="ml-auto">{pipeline.draft}</Badge>
                )}
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/students/enrollments?status=needs_review">
                <AlertCircle className="size-4 mr-2 text-amber-600" />
                {locale === "fr" ? "En attente de révision" : "Needs Review"}
                {pipeline.needsReview > 0 && (
                  <Badge variant="secondary" className="ml-auto bg-amber-100 text-amber-700">{pipeline.needsReview}</Badge>
                )}
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/students">
                <Users className="size-4 mr-2 text-gspn-maroon-600" />
                {locale === "fr" ? "Liste des élèves" : "Student List"}
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Enrollment by Grade */}
      <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-gradient-to-br from-slate-50/50 to-transparent dark:from-slate-900/30 dark:to-transparent shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-slate-100 dark:bg-slate-800 border-b-2 border-slate-200 dark:border-slate-700">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Users className="size-4" />
            {locale === "fr" ? "Effectifs par Classe" : "Students by Grade"}
          </h3>
        </div>
        <div className="p-4">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {enrollmentsByGrade.slice(0, 8).map((grade) => (
              <div
                key={grade.id}
                className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{grade.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {grade.count}/{grade.capacity}
                  </span>
                </div>
                <Progress
                  value={grade.percentage}
                  className={cn(
                    "h-2",
                    grade.percentage >= 90 ? "bg-amber-100" : "bg-slate-100",
                    grade.percentage >= 90 ? "[&>div]:bg-amber-500" : "[&>div]:bg-gspn-maroon-500"
                  )}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {grade.percentage}% {locale === "fr" ? "rempli" : "filled"}
                </p>
              </div>
            ))}
          </div>
          {enrollmentsByGrade.length > 8 && (
            <Button variant="link" className="w-full mt-4" asChild>
              <Link href="/admin/grades">
                {locale === "fr" ? "Voir toutes les classes" : "View all grades"}
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
