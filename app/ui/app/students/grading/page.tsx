"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { PageContainer } from "@/components/layout"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useI18n } from "@/components/i18n-provider"
import { useToast } from "@/components/ui/use-toast"
import { useCalculation } from "@/hooks/use-calculation"
import {
  LayoutDashboard,
  Calendar,
  Loader2,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Users,
  Trophy,
  FileText,
  PenLine,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { componentClasses } from "@/lib/design-tokens"
import { SummaryStatsSection } from "./_components/summary-stats-section"
import { ClassProgressAccordion } from "./_components/class-progress-accordion"
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
  const [expandedGrade, setExpandedGrade] = useState<string | null>(null)

  const { isCalculating, handleCalculateAll } = useCalculation({
    trimesterId: activeTrimester?.id,
    onSuccess: fetchData,
  })

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
      toast({ title: t.common.error, description: t.common.errorFetchingData, variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleRefresh() {
    setIsRefreshing(true)
    await fetchData()
    setIsRefreshing(false)
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
      <SummaryStatsSection
        totalGrades={progressData?.summary.totalGrades || 0}
        completeCount={complete.length}
        inProgressCount={inProgress.length}
        rankingsReady={progressData?.summary.gradesWithRankings || 0}
      />

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
                  value={progressData && progressData.summary.totalGrades > 0 ? (progressData.summary.gradesWithAllCompositions / progressData.summary.totalGrades) * 100 : 0}
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
          <ClassProgressAccordion
            grades={progressData?.grades || []}
            expandedGrade={expandedGrade}
            onToggleGrade={(id) => setExpandedGrade(expandedGrade === id ? null : id)}
          />
        </CardContent>
      </Card>
    </PageContainer>
  )
}
