"use client"

import { useState, useEffect } from "react"
import { PageContainer } from "@/components/layout"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useI18n } from "@/components/i18n-provider"
import { useToast } from "@/components/ui/use-toast"
import { PermissionGuard } from "@/components/permission-guard"
import {
  Save,
  Loader2,
  Calendar,
  AlertCircle,
  MessageSquare,
} from "lucide-react"

interface ActiveTrimester {
  id: string
  number: number
  nameFr: string
  nameEn: string
  schoolYear: {
    id: string
    name: string
  }
}

interface Grade {
  id: string
  name: string
  code: string
}

interface GradeSubject {
  id: string
  subjectId: string
  subjectCode: string
  subjectNameFr: string
  subjectNameEn: string
  coefficient: number
}

interface SubjectAverage {
  id: string
  studentProfileId: string
  studentName: string
  studentNumber: string
  average: number | null
  teacherRemark: string | null
}

export default function TeacherRemarksPage() {
  const { t, locale } = useI18n()
  const { toast } = useToast()

  const [activeTrimester, setActiveTrimester] = useState<ActiveTrimester | null>(null)
  const [grades, setGrades] = useState<Grade[]>([])
  const [subjects, setSubjects] = useState<GradeSubject[]>([])
  const [averages, setAverages] = useState<SubjectAverage[]>([])

  // Selection state
  const [selectedGradeId, setSelectedGradeId] = useState<string>("")
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("")

  // Remarks state
  const [remarks, setRemarks] = useState<Map<string, string>>(new Map())
  const [hasChanges, setHasChanges] = useState(false)

  // UI state
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingAverages, setIsLoadingAverages] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    fetchActiveTrimester()
    fetchGrades()
  }, [])

  useEffect(() => {
    if (selectedGradeId) {
      fetchSubjects(selectedGradeId)
    } else {
      setSubjects([])
      setSelectedSubjectId("")
    }
  }, [selectedGradeId])

  useEffect(() => {
    if (activeTrimester && selectedGradeId && selectedSubjectId) {
      fetchAverages()
    } else {
      setAverages([])
      setRemarks(new Map())
      setHasChanges(false)
    }
  }, [activeTrimester, selectedGradeId, selectedSubjectId])

  async function fetchActiveTrimester() {
    try {
      const res = await fetch("/api/trimesters/active")
      if (res.ok) {
        const data = await res.json()
        setActiveTrimester(data)
      }
    } catch (err) {
      console.error("Error fetching active trimester:", err)
    } finally {
      setIsLoading(false)
    }
  }

  async function fetchGrades() {
    try {
      const res = await fetch("/api/grades")
      if (res.ok) {
        const data = await res.json()
        setGrades(data)
      }
    } catch (err) {
      console.error("Error fetching grades:", err)
    }
  }

  async function fetchSubjects(gradeId: string) {
    try {
      const res = await fetch(`/api/grades/${gradeId}/subjects`)
      if (res.ok) {
        const data = await res.json()
        setSubjects(data)
      }
    } catch (err) {
      console.error("Error fetching subjects:", err)
    }
  }

  async function fetchAverages() {
    if (!activeTrimester || !selectedGradeId || !selectedSubjectId) return

    setIsLoadingAverages(true)
    try {
      const params = new URLSearchParams({
        trimesterId: activeTrimester.id,
        gradeId: selectedGradeId,
        gradeSubjectId: selectedSubjectId,
      })

      const res = await fetch(`/api/evaluations/calculate-averages?${params}`)
      if (res.ok) {
        const data = await res.json()
        // Transform the data
        const transformed: SubjectAverage[] = data.map((avg: any) => ({
          id: avg.id,
          studentProfileId: avg.studentProfileId,
          studentName: `${avg.studentProfile?.lastName || ""} ${avg.studentProfile?.firstName || ""}`.trim(),
          studentNumber: avg.studentProfile?.studentNumber || "",
          average: avg.average,
          teacherRemark: avg.teacherRemark,
        }))
        setAverages(transformed)

        // Initialize remarks map with existing values
        const remarksMap = new Map<string, string>()
        transformed.forEach((avg) => {
          remarksMap.set(avg.id, avg.teacherRemark || "")
        })
        setRemarks(remarksMap)
        setHasChanges(false)
      }
    } catch (err) {
      console.error("Error fetching averages:", err)
    } finally {
      setIsLoadingAverages(false)
    }
  }

  function handleRemarkChange(averageId: string, value: string) {
    setRemarks((prev) => {
      const newRemarks = new Map(prev)
      newRemarks.set(averageId, value)
      return newRemarks
    })
    setHasChanges(true)
  }

  async function handleSaveRemarks() {
    setIsSubmitting(true)
    try {
      const updates = Array.from(remarks.entries()).map(([id, remark]) => ({
        subjectAverageId: id,
        teacherRemark: remark || null,
      }))

      const res = await fetch("/api/evaluations/subject-averages/remarks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      })

      if (res.ok) {
        toast({
          title: t.common.success,
          description: t.grading.remarksSaved,
        })
        setHasChanges(false)
      } else {
        const data = await res.json()
        toast({
          title: t.common.error,
          description: data.message || "Failed to save remarks",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Error saving remarks:", err)
      toast({
        title: t.common.error,
        description: "Failed to save remarks",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  function getScoreColor(score: number | null) {
    if (score === null) return "text-muted-foreground"
    if (score >= 14) return "text-green-600"
    if (score >= 10) return "text-blue-600"
    if (score >= 8) return "text-yellow-600"
    return "text-red-600"
  }

  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId)

  if (!isMounted) {
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
            <p className="text-muted-foreground mt-2">
              {t.admin.configureTrimesters}
            </p>
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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gspn-maroon-500/10 rounded-xl">
            <MessageSquare className="h-6 w-6 text-gspn-maroon-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{t.nav.teacherRemarks}</h1>
            <p className="text-muted-foreground">{t.grading.teacherRemarksSubtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm py-1 px-3">
            <Calendar className="h-4 w-4 mr-2" />
            {locale === "fr" ? activeTrimester.nameFr : activeTrimester.nameEn}
          </Badge>
          <Badge variant="secondary" className="text-sm py-1 px-3">
            {activeTrimester.schoolYear.name}
          </Badge>
        </div>
      </div>

      {/* Selection Controls */}
      <Card className="mb-6 border shadow-sm overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
            {t.grading.selectSubject}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label>{t.grading.selectGrade}</Label>
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

            <div className="grid gap-2">
              <Label>{t.grading.selectSubject}</Label>
              <Select
                value={selectedSubjectId}
                onValueChange={setSelectedSubjectId}
                disabled={!selectedGradeId || subjects.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t.grading.selectSubject} />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {locale === "fr" ? subject.subjectNameFr : subject.subjectNameEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Remarks Table */}
      {selectedGradeId && selectedSubjectId && (
        <Card className="border shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
                {selectedSubject && (locale === "fr" ? selectedSubject.subjectNameFr : selectedSubject.subjectNameEn)}
              </CardTitle>
              <CardDescription>
                {averages.length} {t.common.students}
                {hasChanges && (
                  <span className="ml-2 text-yellow-600">• {t.grading.unsavedChanges}</span>
                )}
              </CardDescription>
            </div>
            <PermissionGuard resource="grades" action="update" inline>
              <Button
                onClick={handleSaveRemarks}
                disabled={!hasChanges || isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {t.grading.saveRemarks}
              </Button>
            </PermissionGuard>
          </CardHeader>
          <CardContent>
            {isLoadingAverages ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-8 w-8 animate-spin text-gspn-maroon-500" />
              </div>
            ) : averages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t.grading.noAveragesFound}</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>{t.common.student}</TableHead>
                    <TableHead className="w-24 text-center">{t.grading.average}</TableHead>
                    <TableHead>{t.grading.teacherRemark}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {averages.map((avg, index) => (
                    <TableRow key={avg.id}>
                      <TableCell className="text-muted-foreground">
                        {index + 1}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{avg.studentName}</div>
                          <div className="text-sm text-muted-foreground">
                            {avg.studentNumber}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`font-medium ${getScoreColor(avg.average)}`}>
                          {avg.average !== null ? avg.average.toFixed(2) : "-"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Textarea
                          value={remarks.get(avg.id) || ""}
                          onChange={(e) => handleRemarkChange(avg.id, e.target.value)}
                          placeholder={t.grading.remarkPlaceholder}
                          className="min-h-[60px]"
                          rows={2}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!selectedGradeId && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">{t.grading.selectGrade}</h3>
            <p className="text-muted-foreground text-center max-w-md">
              {t.grading.teacherRemarksSubtitle}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Unsaved Changes Dialog */}
      <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.grading.unsavedChanges}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.grading.unsavedChanges}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={handleSaveRemarks}>
              {t.grading.saveRemarks}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  )
}
