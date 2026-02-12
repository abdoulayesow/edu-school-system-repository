"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Loader2,
  ArrowLeft,
  FileText,
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
import { useBatchBulletinDownload } from "@/hooks/use-batch-bulletin-download"
import { useGradingFilters } from "@/hooks/use-grading-filters"
import { StudentBulletinHeader } from "./_components/student-bulletin-header"
import { BulletinSummaryStats } from "./_components/bulletin-summary-stats"
import { ClassComparisonStats } from "./_components/class-comparison-stats"
import type { BulletinData, BulletinStudent } from "@/lib/types/grading"


export default function BulletinPage() {
  const { t, locale } = useI18n()
  const { toast } = useToast()

  const {
    trimesters, selectedTrimesterId, setSelectedTrimesterId,
    grades, selectedGradeId, setSelectedGradeId,
    isLoading, error,
  } = useGradingFilters({ fetchTrimesters: true, fetchGrades: true })

  const { isDownloading: isDownloadingAll, downloadProgress, downloadAllBulletins } = useBatchBulletinDownload()

  const [students, setStudents] = useState<BulletinStudent[]>([])
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
      toast({ title: t.common.error, description: t.grading.failedToDownloadPDF, variant: "destructive" })
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
        toast({ title: t.common.error, description: t.common.errorFetchingData, variant: "destructive" })
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
      toast({ title: t.common.error, description: t.common.errorFetchingData, variant: "destructive" })
      setBulletin(null)
    } finally {
      setLoadingBulletin(false)
    }
  }, [selectedStudentId, selectedTrimesterId])

  useEffect(() => {
    fetchBulletin()
  }, [fetchBulletin])

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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gspn-maroon-500/10 rounded-xl">
            <FileText className="size-6 text-gspn-maroon-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{t.grading.bulletin}</h1>
            <p className="text-muted-foreground">{t.grading.bulletinSubtitle}</p>
          </div>
        </div>
        <Link href="/students/grading" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" />
          {t.grading.backToOverview}
        </Link>
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
          <StudentBulletinHeader
            bulletin={bulletin}
            locale={locale}
            downloadingPDF={downloadingPDF}
            onDownloadPDF={handleDownloadPDF}
          />

          {/* Summary Stats */}
          {bulletin.summary && (
            <BulletinSummaryStats summary={bulletin.summary} />
          )}

          {/* Class Comparison */}
          {bulletin.classStats && (
            <ClassComparisonStats classStats={bulletin.classStats} />
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
