"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  Loader2,
  ArrowLeft,
  FileText,
  Award,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  GraduationCap,
  ClipboardCheck,
  Download,
  FolderArchive,
  AlertCircle,
} from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import { useToast } from "@/components/ui/use-toast"
import { PermissionGuard } from "@/components/permission-guard"
import { PageContainer } from "@/components/layout/PageContainer"
import { downloadBulletinPDF } from "@/components/bulletin-pdf"
import Link from "next/link"
import { componentClasses } from "@/lib/design-tokens"
import { getScoreColor } from "@/lib/grading-utils"
import { DecisionBadge } from "@/components/grading"
import { useBatchBulletinDownload } from "@/hooks/use-batch-bulletin-download"
import type { Trimester, Grade, BulletinData, DecisionType } from "@/lib/types/grading"

interface BulletinStudent {
  id: string
  firstName: string
  lastName: string
  studentNumber: string
  currentGrade: Grade | null
}

export default function BulletinPage() {
  const { t, locale } = useI18n()
  const { toast } = useToast()
  const { data: session } = useSession()

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { isDownloading: isDownloadingAll, downloadProgress, downloadAllBulletins } = useBatchBulletinDownload()

  // Selection state
  const [trimesters, setTrimesters] = useState<Trimester[]>([])
  const [grades, setGrades] = useState<Grade[]>([])
  const [students, setStudents] = useState<BulletinStudent[]>([])

  const [selectedTrimesterId, setSelectedTrimesterId] = useState<string>("")
  const [selectedGradeId, setSelectedGradeId] = useState<string>("")
  const [selectedStudentId, setSelectedStudentId] = useState<string>("")

  // Bulletin data
  const [bulletin, setBulletin] = useState<BulletinData | null>(null)
  const [loadingBulletin, setLoadingBulletin] = useState(false)
  const [downloadingPDF, setDownloadingPDF] = useState(false)

  // Handle single PDF download
  const handleDownloadPDF = async () => {
    if (!bulletin) return
    try {
      setDownloadingPDF(true)
      await downloadBulletinPDF(bulletin, locale as "fr" | "en")
    } catch (err) {
      console.error("Error downloading PDF:", err)
    } finally {
      setDownloadingPDF(false)
    }
  }

  // Handle batch download of all bulletins for a class
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
        id: s.id,
        name: `${s.lastName} ${s.firstName}`,
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

  // Fetch initial data
  useEffect(() => {
    async function fetchInitialData() {
      try {
        setIsLoading(true)
        const [trimRes, gradeRes] = await Promise.all([
          fetch("/api/admin/trimesters"),
          fetch("/api/grades"),
        ])

        if (trimRes.ok) {
          const trimData = await trimRes.json()
          setTrimesters(trimData)
          // Select active trimester by default
          const active = trimData.find((t: Trimester) => t.isActive)
          if (active) {
            setSelectedTrimesterId(active.id)
          }
        }

        if (gradeRes.ok) {
          const gradeData = await gradeRes.json()
          setGrades(gradeData.grades || [])
        }
      } catch (err) {
        console.error("Error fetching initial data:", err)
        setError(t.grading.failedToLoadData)
      } finally {
        setIsLoading(false)
      }
    }

    fetchInitialData()
  }, [])

  // Fetch students when grade changes
  useEffect(() => {
    async function fetchStudents() {
      if (!selectedGradeId) {
        setStudents([])
        setSelectedStudentId("")
        return
      }

      try {
        const res = await fetch(`/api/students?gradeId=${selectedGradeId}`)
        if (res.ok) {
          const data = await res.json()
          setStudents(data)
        }
      } catch (err) {
        console.error("Error fetching students:", err)
      }
    }

    fetchStudents()
  }, [selectedGradeId])

  // Fetch bulletin when student and trimester are selected
  const fetchBulletin = useCallback(async () => {
    if (!selectedStudentId || !selectedTrimesterId) {
      setBulletin(null)
      return
    }

    try {
      setLoadingBulletin(true)
      const res = await fetch(
        `/api/evaluations/bulletin?studentProfileId=${selectedStudentId}&trimesterId=${selectedTrimesterId}`
      )
      if (res.ok) {
        const data = await res.json()
        setBulletin(data)
      } else {
        setBulletin(null)
      }
    } catch (err) {
      console.error("Error fetching bulletin:", err)
      setBulletin(null)
    } finally {
      setLoadingBulletin(false)
    }
  }, [selectedStudentId, selectedTrimesterId])

  useEffect(() => {
    fetchBulletin()
  }, [fetchBulletin])

  const formatScore = (score: number | null, maxScore = 20): string => {
    if (score === null) return "-"
    return `${score.toFixed(2)}/${maxScore}`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gspn-maroon-500" />
      </div>
    )
  }

  if (error) {
    return (
      <PageContainer maxWidth="lg">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <div className="text-center">
            <h2 className="text-xl font-semibold">{t.common.error}</h2>
            <p className="text-muted-foreground mt-2">{error}</p>
          </div>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer maxWidth="lg">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/students/grades" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" />
          {t.grading.backToClasses}
        </Link>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-gspn-maroon-500/10 rounded-xl">
          <FileText className="size-6 text-gspn-maroon-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">
            {t.grading.bulletin}
          </h1>
          <p className="text-muted-foreground">
            {t.grading.bulletinSubtitle}
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6 border shadow-sm overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
            {t.grading.selection}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                {t.trimesters.trimester}
              </label>
              <Select value={selectedTrimesterId} onValueChange={setSelectedTrimesterId}>
                <SelectTrigger>
                  <SelectValue placeholder={t.trimesters.selectTrimester} />
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

            <div>
              <label className="text-sm font-medium mb-2 block">
                {t.common.student}
              </label>
              <Select
                value={selectedStudentId}
                onValueChange={setSelectedStudentId}
                disabled={!selectedGradeId}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      !selectedGradeId
                        ? t.grading.selectClassFirst
                        : t.grading.selectStudent
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.lastName} {student.firstName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Batch Download Action */}
          {selectedGradeId && selectedTrimesterId && students.length > 0 && (
            <div className="mt-4 pt-4 border-t flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {students.length} {t.grading.studentsInClass}
              </p>
              <PermissionGuard resource="report_cards" action="export" inline>
                <Button
                  onClick={handleDownloadAllBulletins}
                  disabled={isDownloadingAll}
                  className={componentClasses.primaryActionButton}
                >
                  {isDownloadingAll ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {downloadProgress}
                    </>
                  ) : (
                    <>
                      <FolderArchive className="mr-2 h-4 w-4" />
                      {t.grading.downloadAllBulletins}
                    </>
                  )}
                </Button>
              </PermissionGuard>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulletin Content */}
      {loadingBulletin ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gspn-maroon-500" />
        </div>
      ) : bulletin ? (
        <div className="space-y-6">
          {/* Student Info Header */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row md:items-start gap-6">
                <Avatar className="size-20">
                  <AvatarImage src={bulletin.student.photoUrl || undefined} />
                  <AvatarFallback className="text-xl">
                    {bulletin.student.firstName[0]}
                    {bulletin.student.lastName[0]}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-1">
                    {bulletin.student.lastName.toUpperCase()} {bulletin.student.firstName}
                  </h2>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <GraduationCap className="size-4" />
                      {bulletin.student.grade?.name}
                    </span>
                    <span className="flex items-center gap-1">
                      <ClipboardCheck className="size-4" />
                      {bulletin.student.studentNumber}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="size-4" />
                      {locale === "fr" ? bulletin.trimester.nameFr : bulletin.trimester.nameEn} -{" "}
                      {bulletin.trimester.schoolYear.name}
                    </span>
                  </div>
                </div>

                {bulletin.summary && (
                  <div className="text-right">
                    <div className="text-4xl font-bold mb-1 text-primary">
                      {bulletin.summary.generalAverage?.toFixed(2) || "-"}
                      <span className="text-lg text-muted-foreground">/20</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {t.grading.generalAverage}
                    </div>
                  </div>
                )}
              </div>

              {/* PDF Download Button */}
              <div className="mt-4 pt-4 border-t flex justify-end">
                <PermissionGuard resource="report_cards" action="export" inline>
                  <Button
                    onClick={handleDownloadPDF}
                    disabled={downloadingPDF}
                    variant="outline"
                  >
                    {downloadingPDF ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="mr-2 h-4 w-4" />
                    )}
                    {t.grading.downloadPDF}
                  </Button>
                </PermissionGuard>
              </div>
            </CardContent>
          </Card>

          {/* Summary Stats */}
          {bulletin.summary && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Card>
                <CardContent className="pt-4 pb-4 text-center">
                  <div className="text-2xl font-bold text-primary">
                    {bulletin.summary.rank || "-"}
                    <span className="text-sm text-muted-foreground">
                      /{bulletin.summary.totalStudents || "-"}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">{t.grading.classRank}</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4 pb-4 text-center">
                  <div className={`text-2xl font-bold ${getScoreColor(bulletin.summary.conduct)}`}>
                    {bulletin.summary.conduct?.toFixed(1) || "-"}
                  </div>
                  <div className="text-xs text-muted-foreground">{t.grading.conduct}</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4 pb-4 text-center">
                  <div className="text-2xl font-bold">
                    {bulletin.summary.absences ?? "-"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t.grading.absences}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4 pb-4 text-center">
                  <div className="text-2xl font-bold">
                    {bulletin.summary.lates ?? "-"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t.grading.lates}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4 pb-4 text-center">
                  <DecisionBadge decision={bulletin.summary.decision as DecisionType} isOverride={bulletin.summary.decisionOverride} t={t} />
                  <div className="text-xs text-muted-foreground mt-1">{t.grading.decision}</div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Class Comparison */}
          {bulletin.classStats && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="size-4" />
                  {t.grading.classStatistics}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="size-8 rounded bg-primary/10 flex items-center justify-center">
                      <TrendingUp className="size-4 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">{bulletin.classStats.highestAverage?.toFixed(2) || "-"}</div>
                      <div className="text-xs text-muted-foreground">
                        {t.grading.highest}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="size-8 rounded bg-muted flex items-center justify-center">
                      <Award className="size-4 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="font-medium">{bulletin.classStats.classAverage?.toFixed(2) || "-"}</div>
                      <div className="text-xs text-muted-foreground">{t.grading.classAverage}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="size-8 rounded bg-destructive/10 flex items-center justify-center">
                      <TrendingDown className="size-4 text-destructive" />
                    </div>
                    <div>
                      <div className="font-medium">{bulletin.classStats.lowestAverage?.toFixed(2) || "-"}</div>
                      <div className="text-xs text-muted-foreground">
                        {t.grading.lowest}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="size-8 rounded bg-success/10 flex items-center justify-center">
                      <Users className="size-4 text-success" />
                    </div>
                    <div>
                      <div className="font-medium">
                        {bulletin.classStats.passCount}/{bulletin.classStats.totalStudents}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {t.grading.passRate} ({bulletin.classStats.passRate?.toFixed(1) || 0}%)
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Grades Table */}
          <Card className="border shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
                {t.grading.subjectResults}
              </CardTitle>
              <CardDescription>
                {bulletin.subjects.length} {t.grading.subjects} -{" "}
                {t.grading.totalCoefficient}: {bulletin.totalCoefficient}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className={componentClasses.tableHeaderRow}>
                      <TableHead className="min-w-[150px]">
                        {t.grading.subject}
                      </TableHead>
                      <TableHead className="text-center w-16">{t.grading.coefficient}</TableHead>
                      <TableHead className="text-center min-w-[80px]">
                        {t.grading.interrogationShort}
                      </TableHead>
                      <TableHead className="text-center min-w-[80px]">
                        {t.grading.devoirSurveilleShort}
                      </TableHead>
                      <TableHead className="text-center min-w-[80px]">
                        {t.grading.compositionShort}
                      </TableHead>
                      <TableHead className="text-center min-w-[80px]">{t.grading.average}</TableHead>
                      <TableHead className="min-w-[150px]">{t.grading.teacherRemark}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bulletin.subjects.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          {t.grading.noEvaluations}
                        </TableCell>
                      </TableRow>
                    ) : (
                      bulletin.subjects.map((subject) => (
                        <TableRow key={subject.id} className={componentClasses.tableRowHover}>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {locale === "fr" ? subject.nameFr : subject.nameEn}
                              </p>
                              <p className="text-xs text-muted-foreground">{subject.code}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline">{subject.coefficient}</Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="space-y-1">
                              {subject.evaluations.interrogations.map((e, i) => (
                                <div
                                  key={e.id}
                                  className={`text-sm ${getScoreColor((e.score / e.maxScore) * 20)}`}
                                >
                                  {e.score}/{e.maxScore}
                                </div>
                              ))}
                              {subject.evaluations.interrogations.length === 0 && (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="space-y-1">
                              {subject.evaluations.devoirsSurveilles.map((e) => (
                                <div
                                  key={e.id}
                                  className={`text-sm ${getScoreColor((e.score / e.maxScore) * 20)}`}
                                >
                                  {e.score}/{e.maxScore}
                                </div>
                              ))}
                              {subject.evaluations.devoirsSurveilles.length === 0 && (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="space-y-1">
                              {subject.evaluations.compositions.map((e) => (
                                <div
                                  key={e.id}
                                  className={`text-sm font-medium ${getScoreColor((e.score / e.maxScore) * 20)}`}
                                >
                                  {e.score}/{e.maxScore}
                                </div>
                              ))}
                              {subject.evaluations.compositions.length === 0 && (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className={`font-bold ${getScoreColor(subject.average)}`}>
                              {subject.average !== null ? subject.average.toFixed(2) : "-"}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {subject.teacherRemark || "-"}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* General Remark */}
          {bulletin.summary?.generalRemark && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">
                  {t.grading.generalRemark}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{bulletin.summary.generalRemark}</p>
              </CardContent>
            </Card>
          )}
        </div>
      ) : selectedStudentId && selectedTrimesterId ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {t.grading.noDataAvailable}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {t.grading.selectToView}
          </CardContent>
        </Card>
      )}
    </PageContainer>
  )
}
