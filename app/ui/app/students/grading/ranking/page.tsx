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
import { useI18n } from "@/components/i18n-provider"
import { useToast } from "@/components/ui/use-toast"
import { PermissionGuard } from "@/components/permission-guard"
import { PageContainer } from "@/components/layout/PageContainer"
import { BulletinPDFDocument } from "@/components/bulletin-pdf"
import { pdf } from "@react-pdf/renderer"
import JSZip from "jszip"
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

interface RankedStudent {
  id: string
  studentProfileId: string
  studentName: string
  gradeId: string
  gradeName: string
  generalAverage: number | null
  rank: number | null
  totalStudents: number | null
  conduct: number | null
  decision: string
  decisionOverride: boolean
  absences: number | null
  lates: number | null
}

interface ClassStats {
  classAverage: number | null
  highestAverage: number | null
  lowestAverage: number | null
  passCount: number
  passRate: number | null
  totalStudents: number
}

export default function ClassRankingPage() {
  const { t, locale } = useI18n()
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(true)
  const [trimesters, setTrimesters] = useState<Trimester[]>([])
  const [grades, setGrades] = useState<Grade[]>([])

  const [selectedTrimesterId, setSelectedTrimesterId] = useState<string>("")
  const [selectedGradeId, setSelectedGradeId] = useState<string>("")

  const [students, setStudents] = useState<RankedStudent[]>([])
  const [classStats, setClassStats] = useState<ClassStats | null>(null)
  const [loadingRanking, setLoadingRanking] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState<string | null>(null)

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
          const active = trimData.find((t: Trimester) => t.isActive)
          if (active) {
            setSelectedTrimesterId(active.id)
          }
        }

        if (gradeRes.ok) {
          const gradeData = await gradeRes.json()
          setGrades(gradeData)
        }
      } catch (err) {
        console.error("Error fetching initial data:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchInitialData()
  }, [])

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
    } finally {
      setLoadingRanking(false)
    }
  }, [selectedTrimesterId, selectedGradeId])

  useEffect(() => {
    fetchRanking()
  }, [fetchRanking])

  // Batch download all bulletins as ZIP
  const handleDownloadAllBulletins = useCallback(async () => {
    if (!selectedTrimesterId || !selectedGradeId || students.length === 0) {
      return
    }

    const selectedTrimester = trimesters.find((t) => t.id === selectedTrimesterId)
    const selectedGrade = grades.find((g) => g.id === selectedGradeId)

    if (!selectedTrimester || !selectedGrade) {
      return
    }

    try {
      setIsDownloading(true)
      setDownloadProgress(t.grading.generatingBulletins)

      const zip = new JSZip()
      let successCount = 0
      let errorCount = 0

      // Process each student
      for (let i = 0; i < students.length; i++) {
        const student = students[i]
        setDownloadProgress(
          `${t.grading.generatingBulletins} (${i + 1}/${students.length})`
        )

        try {
          // Fetch bulletin data for this student
          const bulletinRes = await fetch(
            `/api/evaluations/bulletin?studentProfileId=${student.studentProfileId}&trimesterId=${selectedTrimesterId}`
          )

          if (!bulletinRes.ok) {
            errorCount++
            continue
          }

          const bulletinData = await bulletinRes.json()

          // Generate PDF blob
          const pdfBlob = await pdf(
            <BulletinPDFDocument data={bulletinData} locale={locale as "fr" | "en"} />
          ).toBlob()

          // Add to ZIP with sanitized filename
          const sanitizedName = student.studentName.replace(/[^a-zA-Z0-9\s]/g, "").replace(/\s+/g, "_")
          const filename = `bulletin_${sanitizedName}.pdf`
          zip.file(filename, pdfBlob)
          successCount++
        } catch (err) {
          console.error(`Error generating bulletin for ${student.studentName}:`, err)
          errorCount++
        }
      }

      if (successCount > 0) {
        // Generate ZIP file
        setDownloadProgress(locale === "fr" ? "Création de l'archive..." : "Creating archive...")
        const zipBlob = await zip.generateAsync({ type: "blob" })

        // Trigger download
        const url = URL.createObjectURL(zipBlob)
        const link = document.createElement("a")
        link.href = url
        const trimesterName = locale === "fr" ? selectedTrimester.nameFr : selectedTrimester.nameEn
        link.download = `bulletins_${selectedGrade.name}_${trimesterName.replace(/\s+/g, "_")}.zip`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)

        toast({
          title: t.common.success,
          description: `${t.grading.bulletinsDownloaded} (${successCount}/${students.length})`,
        })
      }

      if (errorCount > 0) {
        toast({
          title: t.common.error,
          description: locale === "fr"
            ? `${errorCount} bulletin(s) n'ont pas pu être générés`
            : `${errorCount} bulletin(s) could not be generated`,
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Error downloading bulletins:", err)
      toast({
        title: t.common.error,
        description: locale === "fr"
          ? "Erreur lors du téléchargement des bulletins"
          : "Error downloading bulletins",
        variant: "destructive",
      })
    } finally {
      setIsDownloading(false)
      setDownloadProgress(null)
    }
  }, [selectedTrimesterId, selectedGradeId, students, trimesters, grades, locale, t, toast])

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

  const getScoreColor = (score: number | null): string => {
    if (score === null) return "text-muted-foreground"
    if (score >= 14) return "text-success"
    if (score >= 10) return "text-primary"
    if (score >= 8) return "text-warning"
    return "text-destructive"
  }

  const getDecisionBadge = (decision: string) => {
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
      <Badge variant={variants[decision] || "secondary"}>
        {labels[decision] || decision}
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <PageContainer maxWidth="lg">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/students/grades" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" />
          {locale === "fr" ? "Retour aux classes" : "Back to classes"}
        </Link>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Trophy className="size-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">
              {locale === "fr" ? "Classement de la Classe" : "Class Ranking"}
            </h1>
            <p className="text-muted-foreground">
              {locale === "fr"
                ? "Voir le classement des élèves par moyenne générale"
                : "View student rankings by general average"}
            </p>
          </div>
        </div>
        {students.length > 0 && (
          <PermissionGuard resource="report_cards" action="export" inline>
            <Button
              onClick={handleDownloadAllBulletins}
              disabled={isDownloading}
              variant="outline"
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
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                {locale === "fr" ? "Élèves" : "Students"}
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
                {locale === "fr" ? "Meilleure" : "Highest"}
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
                {locale === "fr" ? "Plus basse" : "Lowest"}
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
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : students.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>
              {locale === "fr" ? "Classement des élèves" : "Student Ranking"}
            </CardTitle>
            <CardDescription>
              {students.length} {locale === "fr" ? "élèves classés" : "students ranked"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16 text-center">{t.grading.rank}</TableHead>
                    <TableHead>{locale === "fr" ? "Élève" : "Student"}</TableHead>
                    <TableHead className="text-center">{t.grading.generalAverage}</TableHead>
                    <TableHead className="text-center w-[200px]">
                      {locale === "fr" ? "Progression" : "Progress"}
                    </TableHead>
                    <TableHead className="text-center">{t.grading.conduct}</TableHead>
                    <TableHead className="text-center">{t.grading.decision}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student, index) => (
                    <TableRow
                      key={student.id}
                      className={
                        student.rank && student.rank <= 3
                          ? "bg-primary/5"
                          : undefined
                      }
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
                        {getDecisionBadge(student.decision)}
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
            {locale === "fr"
              ? "Aucun classement disponible pour cette classe et ce trimestre"
              : "No ranking available for this class and trimester"}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {locale === "fr"
              ? "Sélectionnez un trimestre et une classe pour afficher le classement"
              : "Select a trimester and class to view the ranking"}
          </CardContent>
        </Card>
      )}
    </PageContainer>
  )
}
