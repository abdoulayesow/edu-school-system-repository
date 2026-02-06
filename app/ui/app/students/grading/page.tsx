"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { PageContainer } from "@/components/layout"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useI18n } from "@/components/i18n-provider"
import { useToast } from "@/components/ui/use-toast"
import {
  LayoutDashboard,
  Calendar,
  Loader2,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  BookOpen,
  Users,
  Trophy,
  FileText,
  PenLine,
  Sparkles,
  Clock,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { componentClasses } from "@/lib/design-tokens"
import { getProgressColor } from "@/lib/grading-utils"
import type {
  ActiveTrimester,
  GradeProgress,
  SubjectProgress,
  ProgressData,
} from "@/lib/types/grading"

export default function GradingOverviewPage() {
  const { t, locale } = useI18n()
  const { toast } = useToast()

  const [activeTrimester, setActiveTrimester] = useState<ActiveTrimester | null>(null)
  const [progressData, setProgressData] = useState<ProgressData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isCalculating, setIsCalculating] = useState(false)
  const [expandedGrade, setExpandedGrade] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      setIsLoading(true)

      // Fetch active trimester
      const trimRes = await fetch("/api/trimesters/active")
      if (!trimRes.ok) {
        setActiveTrimester(null)
        return
      }

      const trimData = await trimRes.json()
      setActiveTrimester(trimData)

      // Fetch progress data
      const progressRes = await fetch(`/api/evaluations/progress?trimesterId=${trimData.id}`)
      if (progressRes.ok) {
        const data = await progressRes.json()
        setProgressData(data)
      }
    } catch (err) {
      console.error("Error fetching data:", err)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleRefresh() {
    setIsRefreshing(true)
    await fetchData()
    setIsRefreshing(false)
  }

  async function handleCalculateAll() {
    if (!activeTrimester) return

    setIsCalculating(true)
    try {
      // Calculate subject averages
      const avgRes = await fetch("/api/evaluations/calculate-averages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trimesterId: activeTrimester.id }),
      })

      if (!avgRes.ok) throw new Error("Failed to calculate averages")

      // Calculate student summaries
      const summaryRes = await fetch("/api/evaluations/student-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trimesterId: activeTrimester.id }),
      })

      if (!summaryRes.ok) throw new Error("Failed to calculate summaries")

      toast({
        title: t.common.success,
        description: t.grading.calculationComplete,
      })

      // Refresh data
      await fetchData()
    } catch (err) {
      console.error("Error calculating:", err)
      toast({
        title: t.common.error,
        description: t.grading.calculationFailed,
        variant: "destructive",
      })
    } finally {
      setIsCalculating(false)
    }
  }

  // Categorize grades by completion status
  const { complete, inProgress, notStarted } = useMemo(() => {
    if (!progressData) return { complete: [], inProgress: [], notStarted: [] }

    const complete: GradeProgress[] = []
    const inProgress: GradeProgress[] = []
    const notStarted: GradeProgress[] = []

    progressData.grades.forEach((grade) => {
      if (grade.completionProgress === 100 && grade.rankingsCalculated) {
        complete.push(grade)
      } else if (grade.compositionProgress > 0 || grade.subjectsWithComposition > 0) {
        inProgress.push(grade)
      } else {
        notStarted.push(grade)
      }
    })

    return { complete, inProgress, notStarted }
  }, [progressData])

  // Get subjects missing compositions
  const missingCompositions = useMemo(() => {
    if (!progressData) return []

    const missing: Array<{ grade: GradeProgress; subject: SubjectProgress }> = []
    progressData.grades.forEach((grade) => {
      grade.subjects.forEach((subject) => {
        if (!subject.hasComposition && grade.studentCount > 0) {
          missing.push({ grade, subject })
        }
      })
    })

    return missing.slice(0, 10) // Limit to 10 for display
  }, [progressData])

  const getStatusBadge = (grade: GradeProgress) => {
    if (grade.completionProgress === 100 && grade.rankingsCalculated) {
      return (
        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          {t.grading.complete}
        </Badge>
      )
    }
    if (grade.compositionProgress > 0 || grade.subjectsWithComposition > 0) {
      return (
        <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30">
          <Clock className="h-3 w-3 mr-1" />
          {t.grading.inProgress}
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="text-muted-foreground">
        <AlertCircle className="h-3 w-3 mr-1" />
        {t.grading.notStarted}
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <PageContainer maxWidth="full">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gspn-maroon-500" />
        </div>
      </PageContainer>
    )
  }

  if (!activeTrimester) {
    return (
      <PageContainer maxWidth="full">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <AlertCircle className="h-12 w-12 text-muted-foreground" />
          <div className="text-center">
            <h2 className="text-xl font-semibold">{t.admin.noActiveTrimester}</h2>
            <p className="text-muted-foreground mt-2">{t.admin.configureTrimesters}</p>
          </div>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer maxWidth="full">
      {/* Maroon accent bar */}
      <div className="h-1 bg-gspn-maroon-500 -mx-4 sm:-mx-6 lg:-mx-8 mb-6" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gspn-maroon-500/10 rounded-xl">
            <LayoutDashboard className="h-6 w-6 text-gspn-maroon-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{t.grading.trimesterOverview}</h1>
            <p className="text-muted-foreground">{t.grading.trackEvaluationProgress}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm py-1.5 px-3">
            <Calendar className="h-4 w-4 mr-2" />
            {locale === "fr" ? activeTrimester.nameFr : activeTrimester.nameEn}
          </Badge>
          <Badge variant="secondary" className="text-sm py-1.5 px-3">
            {activeTrimester.schoolYear.name}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
            {t.common.refresh}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card className="border shadow-sm overflow-hidden">
          <div className="h-1 bg-gspn-maroon-500" />
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gspn-maroon-500/10 rounded-lg">
                <BookOpen className="h-5 w-5 text-gspn-maroon-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t.grading.classes}</p>
                <p className="text-2xl font-bold">{progressData?.summary.totalGrades || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm overflow-hidden">
          <div className="h-1 bg-emerald-500" />
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t.grading.complete}</p>
                <p className="text-2xl font-bold">{complete.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm overflow-hidden">
          <div className="h-1 bg-amber-500" />
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t.grading.inProgress}</p>
                <p className="text-2xl font-bold">{inProgress.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm overflow-hidden">
          <div className="h-1 bg-gspn-gold-500" />
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gspn-gold-500/10 rounded-lg">
                <Trophy className="h-5 w-5 text-gspn-gold-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t.grading.rankingsReady}</p>
                <p className="text-2xl font-bold">{progressData?.summary.gradesWithRankings || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overall Progress */}
      <Card className="mb-6 border shadow-sm overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
              {t.gradesEnhanced.overallProgress}
            </CardTitle>
            <Button
              onClick={handleCalculateAll}
              disabled={isCalculating}
              className={componentClasses.primaryActionButton}
            >
              {isCalculating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              {t.grading.calculateAllNow}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{t.grading.compositionsEntered}</span>
                  <span className="text-sm text-muted-foreground">
                    {progressData?.summary.gradesWithAllCompositions || 0}/{progressData?.summary.totalGrades || 0}
                  </span>
                </div>
                <Progress
                  value={progressData ? (progressData.summary.gradesWithAllCompositions / progressData.summary.totalGrades) * 100 : 0}
                  className="h-2"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{t.grading.bulletinsReady}</span>
                  <span className="text-sm text-muted-foreground">
                    {progressData?.summary.gradesComplete || 0}/{progressData?.summary.totalGrades || 0}
                  </span>
                </div>
                <Progress
                  value={progressData?.summary.overallProgress || 0}
                  className="h-2"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Missing Compositions Alert */}
        {missingCompositions.length > 0 && (
          <Card className="border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2 text-amber-700 dark:text-amber-400">
                <AlertTriangle className="h-5 w-5" />
                {t.grading.missingCompositions}
              </CardTitle>
              <CardDescription>{t.grading.missingCompositionsSubtitle}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {missingCompositions.map(({ grade, subject }) => (
                  <div
                    key={`${grade.id}-${subject.id}`}
                    className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-background border"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-xs">
                        {grade.name}
                      </Badge>
                      <span className="text-sm">
                        {locale === "fr" ? subject.nameFr : subject.nameEn}
                      </span>
                    </div>
                    <Link href={`/students/grading/entry?grade=${grade.id}&subject=${subject.id}`}>
                      <Button variant="ghost" size="sm" className="h-7 text-gspn-maroon-500">
                        <PenLine className="h-3 w-3 mr-1" />
                        {t.grading.enterGrade}
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
              {missingCompositions.length === 10 && (
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  {t.grading.andMore}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
              {t.grading.quickActions}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <Link href="/students/grading/entry">
                <Button variant="outline" className="w-full justify-start h-auto py-3">
                  <PenLine className="h-4 w-4 mr-3 text-gspn-maroon-500" />
                  <div className="text-left">
                    <p className="font-medium">{t.grading.gradeEntry}</p>
                    <p className="text-xs text-muted-foreground">{t.grading.gradeEntrySubtitle}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground" />
                </Button>
              </Link>
              <Link href="/students/grading/conduct">
                <Button variant="outline" className="w-full justify-start h-auto py-3">
                  <Users className="h-4 w-4 mr-3 text-gspn-maroon-500" />
                  <div className="text-left">
                    <p className="font-medium">{t.nav.conductEntry}</p>
                    <p className="text-xs text-muted-foreground">{t.grading.conductEntrySubtitle}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground" />
                </Button>
              </Link>
              <Link href="/students/grading/ranking">
                <Button variant="outline" className="w-full justify-start h-auto py-3">
                  <Trophy className="h-4 w-4 mr-3 text-gspn-gold-500" />
                  <div className="text-left">
                    <p className="font-medium">{t.grading.classRanking}</p>
                    <p className="text-xs text-muted-foreground">{t.grading.classRankingSubtitle}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground" />
                </Button>
              </Link>
              <Link href="/students/grading/bulletin">
                <Button variant="outline" className="w-full justify-start h-auto py-3">
                  <FileText className="h-4 w-4 mr-3 text-gspn-maroon-500" />
                  <div className="text-left">
                    <p className="font-medium">{t.grading.bulletin}</p>
                    <p className="text-xs text-muted-foreground">{t.grading.bulletinSubtitle}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Class Progress List */}
      <Card className="mt-6 border shadow-sm overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
            {t.grading.progressByClass}
          </CardTitle>
          <CardDescription>{t.grading.clickClassForDetails}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {progressData?.grades.map((grade) => (
              <div key={grade.id}>
                <button
                  onClick={() => setExpandedGrade(expandedGrade === grade.id ? null : grade.id)}
                  className={cn(
                    "w-full p-3 rounded-lg border transition-all text-left",
                    "hover:border-gspn-maroon-500/50 hover:bg-muted/30",
                    expandedGrade === grade.id && "border-gspn-maroon-500 bg-muted/50"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="font-semibold">{grade.name}</div>
                      <Badge variant="outline" className="text-xs">
                        {grade.studentCount} {t.common.students}
                      </Badge>
                      {getStatusBadge(grade)}
                    </div>
                    <div className="flex items-center gap-4">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="w-32">
                            <Progress
                              value={grade.completionProgress}
                              className={cn("h-2", getProgressColor(grade.completionProgress))}
                            />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          {grade.completionProgress}% {t.grading.percentComplete}
                        </TooltipContent>
                      </Tooltip>
                      <span className="text-sm text-muted-foreground w-12 text-right">
                        {grade.completionProgress}%
                      </span>
                    </div>
                  </div>
                </button>

                {/* Expanded Details */}
                {expandedGrade === grade.id && (
                  <div className="mt-2 ml-4 p-4 rounded-lg bg-muted/30 border animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-muted-foreground">{t.grading.subjects}</p>
                        <p className="font-semibold">{grade.totalSubjects}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{t.grading.compositions}</p>
                        <p className="font-semibold">
                          {grade.subjectsWithComposition}/{grade.totalSubjects}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{t.grading.averages}</p>
                        <p className="font-semibold">
                          {grade.subjects.filter((s) => s.hasAverages).length}/{grade.totalSubjects}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{t.grading.rankings}</p>
                        <p className="font-semibold">
                          {grade.studentsWithRankings}/{grade.studentCount}
                        </p>
                      </div>
                    </div>

                    {/* Subject Details */}
                    <div className="space-y-1">
                      {grade.subjects.map((subject) => (
                        <div
                          key={subject.id}
                          className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-background text-sm"
                        >
                          <div className="flex items-center gap-2">
                            {subject.hasComposition ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                            ) : (
                              <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                            )}
                            <span>{locale === "fr" ? subject.nameFr : subject.nameEn}</span>
                            <span className="text-xs text-muted-foreground">
                              ({t.grading.coefficient}×{subject.coefficient})
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>I: {subject.interrogations}</span>
                            <span>DS: {subject.devoirsSurveilles}</span>
                            <span className={subject.hasComposition ? "text-emerald-600 font-medium" : "text-amber-600"}>
                              C: {subject.compositions}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 pt-3 border-t flex justify-end gap-2">
                      <Link href={`/students/grading/entry`}>
                        <Button variant="outline" size="sm">
                          <PenLine className="h-3.5 w-3.5 mr-1" />
                          {t.grading.gradeEntry}
                        </Button>
                      </Link>
                      <Link href={`/students/grading/ranking`}>
                        <Button variant="outline" size="sm">
                          <Trophy className="h-3.5 w-3.5 mr-1" />
                          {t.grading.classRanking}
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  )
}
