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
} from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import { PermissionGuard } from "@/components/permission-guard"
import { PageContainer } from "@/components/layout/PageContainer"
import { downloadBulletinPDF } from "@/components/bulletin-pdf"
import Link from "next/link"

interface Trimester {
  id: string
  number: number
  name: string
  nameFr: string
  nameEn: string
  isActive: boolean
  schoolYear: {
    id: string
    name: string
  }
}

interface Grade {
  id: string
  name: string
  level: string
}

interface Student {
  id: string
  firstName: string
  lastName: string
  studentNumber: string
  currentGrade: Grade | null
}

interface SubjectEvaluation {
  id: string
  score: number
  maxScore: number
  date: string
}

interface Subject {
  id: string
  subjectId: string
  code: string
  nameFr: string
  nameEn: string
  coefficient: number
  average: number | null
  teacherRemark: string | null
  evaluations: {
    interrogations: SubjectEvaluation[]
    devoirsSurveilles: SubjectEvaluation[]
    compositions: SubjectEvaluation[]
  }
}

interface BulletinData {
  student: {
    id: string
    firstName: string
    lastName: string
    dateOfBirth: string | null
    photoUrl: string | null
    studentNumber: string
    grade: Grade | null
  }
  trimester: {
    id: string
    number: number
    name: string
    nameFr: string
    nameEn: string
    schoolYear: { id: string; name: string }
  }
  subjects: Subject[]
  totalCoefficient: number
  summary: {
    generalAverage: number | null
    rank: number | null
    totalStudents: number | null
    conduct: number | null
    decision: string
    decisionOverride: boolean
    generalRemark: string | null
    absences: number | null
    lates: number | null
    calculatedAt: string | null
  } | null
  classStats: {
    classAverage: number | null
    highestAverage: number | null
    lowestAverage: number | null
    passCount: number
    passRate: number | null
    totalStudents: number
  } | null
}

export default function BulletinPage() {
  const { t, locale } = useI18n()
  const { data: session } = useSession()

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Selection state
  const [trimesters, setTrimesters] = useState<Trimester[]>([])
  const [grades, setGrades] = useState<Grade[]>([])
  const [students, setStudents] = useState<Student[]>([])

  const [selectedTrimesterId, setSelectedTrimesterId] = useState<string>("")
  const [selectedGradeId, setSelectedGradeId] = useState<string>("")
  const [selectedStudentId, setSelectedStudentId] = useState<string>("")

  // Bulletin data
  const [bulletin, setBulletin] = useState<BulletinData | null>(null)
  const [loadingBulletin, setLoadingBulletin] = useState(false)
  const [downloadingPDF, setDownloadingPDF] = useState(false)

  // Handle PDF download
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
        setError("Failed to load data")
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

  const getDecisionBadge = (decision: string, override: boolean) => {
    const variants: Record<string, "success" | "warning" | "destructive" | "secondary"> = {
      admis: "success",
      rattrapage: "warning",
      redouble: "destructive",
      pending: "secondary",
    }

    const labels: Record<string, string> = {
      admis: t.grading.admis,
      rattrapage: t.grading.rattrapage,
      redouble: t.grading.redouble,
      pending: t.grading.decisionPending,
    }

    return (
      <div className="flex items-center gap-2">
        <Badge variant={variants[decision] || "secondary"}>
          {labels[decision] || decision}
        </Badge>
        {override && (
          <Badge variant="outline" className="text-xs">
            {locale === "fr" ? "Décision modifiée" : "Overridden"}
          </Badge>
        )}
      </div>
    )
  }

  const formatScore = (score: number | null, maxScore = 20): string => {
    if (score === null) return "-"
    return `${score.toFixed(2)}/${maxScore}`
  }

  const getScoreColor = (score: number | null): string => {
    if (score === null) return "text-muted-foreground"
    if (score >= 14) return "text-success"
    if (score >= 10) return "text-primary"
    if (score >= 8) return "text-warning"
    return "text-destructive"
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
      {/* Maroon accent bar */}
      <div className="h-1 bg-gspn-maroon-500 -mx-4 sm:-mx-6 lg:-mx-8 mb-6" />

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/students/grades" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" />
          {locale === "fr" ? "Retour aux classes" : "Back to classes"}
        </Link>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-gspn-maroon-500/10 rounded-xl">
          <FileText className="size-6 text-gspn-maroon-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">
            {locale === "fr" ? "Bulletin de Notes" : "Report Card"}
          </h1>
          <p className="text-muted-foreground">
            {locale === "fr"
              ? "Consulter le bulletin trimestriel d'un élève"
              : "View a student's trimester report card"}
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6 border shadow-sm overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
            {locale === "fr" ? "Sélection" : "Selection"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                {locale === "fr" ? "Trimestre" : "Trimester"}
              </label>
              <Select value={selectedTrimesterId} onValueChange={setSelectedTrimesterId}>
                <SelectTrigger>
                  <SelectValue placeholder={locale === "fr" ? "Choisir un trimestre" : "Select trimester"} />
                </SelectTrigger>
                <SelectContent>
                  {trimesters.map((trimester) => (
                    <SelectItem key={trimester.id} value={trimester.id}>
                      {locale === "fr" ? trimester.nameFr : trimester.nameEn}
                      {trimester.isActive && ` (${locale === "fr" ? "Actif" : "Active"})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                {locale === "fr" ? "Classe" : "Class"}
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
                {locale === "fr" ? "Élève" : "Student"}
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
                        ? locale === "fr"
                          ? "Sélectionnez d'abord une classe"
                          : "Select a class first"
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
                    {locale === "fr" ? "Télécharger PDF" : "Download PDF"}
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
                    {locale === "fr" ? "Absences" : "Absences"}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4 pb-4 text-center">
                  <div className="text-2xl font-bold">
                    {bulletin.summary.lates ?? "-"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {locale === "fr" ? "Retards" : "Lates"}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4 pb-4 text-center">
                  {getDecisionBadge(bulletin.summary.decision, bulletin.summary.decisionOverride)}
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
                  {locale === "fr" ? "Statistiques de classe" : "Class Statistics"}
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
                        {locale === "fr" ? "Meilleure" : "Highest"}
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
                        {locale === "fr" ? "Plus basse" : "Lowest"}
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
                {locale === "fr" ? "Résultats par matière" : "Subject Results"}
              </CardTitle>
              <CardDescription>
                {bulletin.subjects.length} {locale === "fr" ? "matières" : "subjects"} -{" "}
                {locale === "fr" ? "Coefficient total" : "Total coefficient"}: {bulletin.totalCoefficient}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[150px]">
                        {locale === "fr" ? "Matière" : "Subject"}
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
                        <TableRow key={subject.id}>
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
                  {locale === "fr" ? "Appréciation générale" : "General Remark"}
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
            {locale === "fr"
              ? "Aucune donnée disponible pour cet élève et ce trimestre"
              : "No data available for this student and trimester"}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {locale === "fr"
              ? "Sélectionnez un trimestre, une classe et un élève pour afficher le bulletin"
              : "Select a trimester, class, and student to view the report card"}
          </CardContent>
        </Card>
      )}
    </PageContainer>
  )
}
