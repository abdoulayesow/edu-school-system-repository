"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  Loader2,
  ArrowLeft,
  Trophy,
  Medal,
  TrendingUp,
  TrendingDown,
  Users,
  Award,
  Target,
  Download,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useI18n } from "@/components/i18n-provider"
import { useToast } from "@/components/ui/use-toast"
import { PermissionGuard } from "@/components/permission-guard"
import { PageContainer } from "@/components/layout/PageContainer"
import Link from "next/link"
import { componentClasses } from "@/lib/design-tokens"
import { getScoreColor } from "@/lib/grading-utils"
import { DecisionBadge } from "@/components/grading"
import { useBatchBulletinDownload } from "@/hooks/use-batch-bulletin-download"
import { useGradingFilters } from "@/hooks/use-grading-filters"
import type { RankedStudent, ClassStats, DecisionType } from "@/lib/types/grading"

export default function ClassRankingPage() {
  const { t, locale } = useI18n()
  const { toast } = useToast()

  const {
    trimesters, selectedTrimesterId, setSelectedTrimesterId,
    grades, selectedGradeId, setSelectedGradeId,
    isLoading,
  } = useGradingFilters({ fetchTrimesters: true, fetchGrades: true })

  const [students, setStudents] = useState<RankedStudent[]>([])
  const [classStats, setClassStats] = useState<ClassStats | null>(null)
  const [loadingRanking, setLoadingRanking] = useState(false)
  const { isDownloading, downloadProgress, downloadAllBulletins } = useBatchBulletinDownload()

  // Fetch ranking when grade and trimester are selected
  const fetchRanking = useCallback(async () => {
    if (!selectedTrimesterId || !selectedGradeId) {
      setStudents([])
      setClassStats(null)
      return
    }

    try {
      setLoadingRanking(true)

      // Fetch student summaries
      const summaryRes = await fetch(
        `/api/evaluations/student-summary?trimesterId=${selectedTrimesterId}&gradeId=${selectedGradeId}`
      )

      if (summaryRes.ok) {
        const data = await summaryRes.json()
        setStudents(data)

        // Calculate class stats from the data
        if (data.length > 0) {
          const averages = data
            .filter((s: RankedStudent) => s.generalAverage !== null)
            .map((s: RankedStudent) => s.generalAverage as number)

          if (averages.length > 0) {
            const passCount = averages.filter((a: number) => a >= 10).length
            setClassStats({
              classAverage: averages.reduce((a: number, b: number) => a + b, 0) / averages.length,
              highestAverage: Math.max(...averages),
              lowestAverage: Math.min(...averages),
              passCount,
              passRate: (passCount / averages.length) * 100,
              totalStudents: averages.length,
            })
          } else {
            setClassStats(null)
          }
        } else {
          setClassStats(null)
        }
      }
    } catch (err) {
      console.error("Error fetching ranking:", err)
      toast({ title: t.common.error, description: t.common.errorFetchingData, variant: "destructive" })
    } finally {
      setLoadingRanking(false)
    }
  }, [selectedTrimesterId, selectedGradeId])

  useEffect(() => {
    fetchRanking()
  }, [fetchRanking])

  // Batch download all bulletins as ZIP
  const handleDownloadAllBulletins = useCallback(async () => {
    if (!selectedTrimesterId || !selectedGradeId || students.length === 0) return

    const selectedTrimester = trimesters.find((tr) => tr.id === selectedTrimesterId)
    const selectedGrade = grades.find((g) => g.id === selectedGradeId)
    if (!selectedTrimester || !selectedGrade) return

    const { successCount, errorCount } = await downloadAllBulletins({
      trimesterId: selectedTrimesterId,
      trimesterName: locale === "fr" ? selectedTrimester.nameFr : selectedTrimester.nameEn,
      gradeName: selectedGrade.name,
      students: students.map((s) => ({
        id: s.studentProfileId,
        name: s.studentName,
      })),
    })

    if (successCount > 0) {
      toast({
        title: t.common.success,
        description: `${t.grading.bulletinsDownloaded} (${successCount}/${students.length})`,
      })
    }
    if (errorCount > 0) {
      toast({
        title: t.common.error,
        description: t.grading.bulletinErrorCount.replace("{count}", String(errorCount)),
        variant: "destructive",
      })
    }
  }, [selectedTrimesterId, selectedGradeId, students, trimesters, grades, locale, t, toast, downloadAllBulletins])

  const getRankIcon = (rank: number | null) => {
    if (rank === 1) return <Trophy className="size-5 text-yellow-500" />
    if (rank === 2) return <Medal className="size-5 text-gray-400" />
    if (rank === 3) return <Medal className="size-5 text-amber-600" />
    return null
  }

  const getRankBadge = (rank: number | null) => {
    if (rank === null) return <Badge variant="outline">-</Badge>
    if (rank <= 3) {
      return (
        <div className="flex items-center gap-1">
          {getRankIcon(rank)}
          <span className="font-bold">{rank}</span>
        </div>
      )
    }
    return <span className="font-medium">{rank}</span>
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gspn-maroon-500" />
      </div>
    )
  }

  return (
    <PageContainer maxWidth="lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gspn-maroon-500/10 rounded-xl">
            <Trophy className="size-6 text-gspn-maroon-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{t.grading.classRanking}</h1>
            <p className="text-muted-foreground">{t.grading.classRankingSubtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {students.length > 0 && (
            <PermissionGuard resource="report_cards" action="export" inline>
              <Button
                onClick={handleDownloadAllBulletins}
                disabled={isDownloading}
                className={componentClasses.primaryActionButton}
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {downloadProgress || t.grading.generatingBulletins}
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    {t.grading.downloadAllBulletins}
                  </>
                )}
              </Button>
            </PermissionGuard>
          )}
          <Link href="/students/grading" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" />
            {t.grading.backToOverview}
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6 border shadow-sm overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
            {t.grading.filters}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                {t.admin.trimester}
              </label>
              <Select value={selectedTrimesterId} onValueChange={setSelectedTrimesterId}>
                <SelectTrigger>
                  <SelectValue placeholder={t.admin.selectTrimester} />
                </SelectTrigger>
                <SelectContent>
                  {trimesters.map((trimester) => (
                    <SelectItem key={trimester.id} value={trimester.id}>
                      {locale === "fr" ? trimester.nameFr : trimester.nameEn}
                      {trimester.isActive && ` (${t.common.active})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                {t.grading.class}
              </label>
              <Select value={selectedGradeId} onValueChange={setSelectedGradeId}>
                <SelectTrigger>
                  <SelectValue placeholder={t.grading.selectGrade} />
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
        </CardContent>
      </Card>

      {/* Class Stats */}
      {classStats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="pt-4 pb-4 text-center">
              <Users className="size-5 mx-auto mb-1 text-muted-foreground" />
              <div className="text-2xl font-bold">{classStats.totalStudents}</div>
              <div className="text-xs text-muted-foreground">
                {t.grading.studentsLabel}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 pb-4 text-center">
              <Award className="size-5 mx-auto mb-1 text-primary" />
              <div className="text-2xl font-bold text-primary">
                {classStats.classAverage?.toFixed(2) || "-"}
              </div>
              <div className="text-xs text-muted-foreground">{t.grading.classAverage}</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 pb-4 text-center">
              <TrendingUp className="size-5 mx-auto mb-1 text-success" />
              <div className="text-2xl font-bold text-success">
                {classStats.highestAverage?.toFixed(2) || "-"}
              </div>
              <div className="text-xs text-muted-foreground">
                {t.grading.highest}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 pb-4 text-center">
              <TrendingDown className="size-5 mx-auto mb-1 text-destructive" />
              <div className="text-2xl font-bold text-destructive">
                {classStats.lowestAverage?.toFixed(2) || "-"}
              </div>
              <div className="text-xs text-muted-foreground">
                {t.grading.lowest}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 pb-4 text-center">
              <Target className="size-5 mx-auto mb-1 text-success" />
              <div className="text-2xl font-bold text-success">
                {classStats.passRate?.toFixed(1) || 0}%
              </div>
              <div className="text-xs text-muted-foreground">
                {t.grading.passRate} ({classStats.passCount}/{classStats.totalStudents})
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Ranking Table */}
      {loadingRanking ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gspn-maroon-500" />
        </div>
      ) : students.length > 0 ? (
        <Card className="border shadow-sm overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
              {t.grading.studentRanking}
            </CardTitle>
            <CardDescription>
              {students.length} {t.grading.studentsRanked}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className={componentClasses.tableHeaderRow}>
                    <TableHead className="w-16 text-center">{t.grading.rank}</TableHead>
                    <TableHead>{t.common.student}</TableHead>
                    <TableHead className="text-center">{t.grading.generalAverage}</TableHead>
                    <TableHead className="text-center w-[200px]">
                      {t.grading.progress}
                    </TableHead>
                    <TableHead className="text-center">{t.grading.conduct}</TableHead>
                    <TableHead className="text-center">{t.grading.decision}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student, index) => (
                    <TableRow
                      key={student.id}
                      className={cn(
                        componentClasses.tableRowHover,
                        student.rank && student.rank <= 3 && "bg-primary/5"
                      )}
                    >
                      <TableCell className="text-center">
                        {getRankBadge(student.rank)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8">
                            <AvatarFallback className="text-xs">
                              {student.studentName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{student.studentName}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className={`text-lg font-bold ${getScoreColor(student.generalAverage)}`}
                        >
                          {student.generalAverage?.toFixed(2) || "-"}
                        </span>
                        <span className="text-muted-foreground text-sm">/20</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={student.generalAverage ? (student.generalAverage / 20) * 100 : 0}
                            className="h-2"
                          />
                          <span className="text-xs text-muted-foreground w-10">
                            {student.generalAverage
                              ? ((student.generalAverage / 20) * 100).toFixed(0)
                              : 0}
                            %
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={getScoreColor(student.conduct)}>
                          {student.conduct?.toFixed(1) || "-"}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <DecisionBadge decision={student.decision as DecisionType} t={t} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : selectedGradeId && selectedTrimesterId ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {t.grading.noRankingAvailable}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {t.grading.selectToViewRanking}
          </CardContent>
        </Card>
      )}
    </PageContainer>
  )
}
