"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useUrlFilters, stringFilter } from "@/hooks/use-url-filters"
import { SearchInput } from "@/components/ui/search-input"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useI18n } from "@/components/i18n-provider"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import {
  getEvaluationTypeLabel,
  type ActiveTrimester,
  type Grade,
  type GradeSubject,
  type Evaluation,
  type EvaluationType,
  type RawEvaluationResponse,
} from "@/lib/types/grading"
import { BookOpen, Calendar, RefreshCw } from "lucide-react"
import { EvaluationsTable } from "./evaluations-table"
import { EditEvaluationDialog } from "./edit-evaluation-dialog"
import { DeleteEvaluationDialog } from "./delete-evaluation-dialog"
import { RecalculatePromptDialog } from "./recalculate-prompt-dialog"

interface ManageEvaluationsTabProps {
  activeTrimester: ActiveTrimester
  grades: Grade[]
}

export function ManageEvaluationsTab({ activeTrimester, grades }: ManageEvaluationsTabProps) {
  const { t, locale } = useI18n()
  const { toast } = useToast()

  // URL-synced search
  const { filters, setFilter } = useUrlFilters({
    q: stringFilter(),
  })
  const evaluationSearch = filters.q

  // Filter state
  const [manageGradeId, setManageGradeId] = useState<string>("")
  const [manageSubjectId, setManageSubjectId] = useState<string>("")
  const [manageTypeFilter, setManageTypeFilter] = useState<string>("all")

  // Data state
  const [manageSubjects, setManageSubjects] = useState<GradeSubject[]>([])
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [isLoadingEvaluations, setIsLoadingEvaluations] = useState(false)

  // Edit dialog state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null)
  const [editScore, setEditScore] = useState<string>("")
  const [editNotes, setEditNotes] = useState<string>("")
  const [editDate, setEditDate] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Recalculation state
  const [showRecalculatePrompt, setShowRecalculatePrompt] = useState(false)
  const [isRecalculating, setIsRecalculating] = useState(false)

  // Fetch subjects when grade changes
  useEffect(() => {
    if (manageGradeId) {
      fetchManageSubjects(manageGradeId)
    } else {
      setManageSubjects([])
      setManageSubjectId("")
    }
  }, [manageGradeId])

  // Fetch evaluations when filters change
  useEffect(() => {
    if (manageGradeId) {
      fetchEvaluations()
    }
  }, [manageGradeId, manageSubjectId, manageTypeFilter])

  // Filter evaluations by search
  const filteredEvaluations = useMemo(() => {
    if (!evaluationSearch.trim()) return evaluations
    const query = evaluationSearch.toLowerCase()
    return evaluations.filter(
      (e) =>
        e.studentName.toLowerCase().includes(query) ||
        e.studentNumber.toLowerCase().includes(query) ||
        (e.subjectName && e.subjectName.toLowerCase().includes(query))
    )
  }, [evaluations, evaluationSearch])

  // Data fetching
  async function fetchManageSubjects(gradeId: string) {
    try {
      const res = await fetch(`/api/grades/${gradeId}/subjects`)
      if (res.ok) setManageSubjects(await res.json())
    } catch (err) {
      console.error("Error fetching subjects:", err)
    }
  }

  async function fetchEvaluations() {
    if (!manageGradeId) return

    setIsLoadingEvaluations(true)
    try {
      const params = new URLSearchParams({
        trimesterId: activeTrimester.id,
        gradeId: manageGradeId,
      })
      if (manageSubjectId && manageSubjectId !== "all") {
        params.set("gradeSubjectId", manageSubjectId)
      }
      if (manageTypeFilter !== "all") {
        params.set("type", manageTypeFilter)
      }

      const res = await fetch(`/api/evaluations?${params}`)
      if (res.ok) {
        const data = await res.json()
        const transformed: Evaluation[] = data.map((e: RawEvaluationResponse) => ({
          id: e.id,
          studentProfileId: e.studentProfileId,
          studentName: `${e.studentProfile?.lastName || ""} ${e.studentProfile?.firstName || ""}`.trim(),
          studentNumber: e.studentProfile?.studentNumber || "",
          gradeSubjectId: e.gradeSubjectId,
          subjectName:
            locale === "fr" ? e.gradeSubject?.subject?.nameFr : e.gradeSubject?.subject?.nameEn,
          type: e.type,
          score: e.score,
          maxScore: e.maxScore,
          date: e.date,
          notes: e.notes,
          trimesterId: e.trimesterId,
          gradeName: e.gradeSubject?.grade?.name || "",
        }))
        setEvaluations(transformed)
      }
    } catch (err) {
      console.error("Error fetching evaluations:", err)
    } finally {
      setIsLoadingEvaluations(false)
    }
  }

  const getEvalTypeLabel = useCallback(
    (type: EvaluationType) => getEvaluationTypeLabel(type, t),
    [t]
  )

  function openEditDialog(evaluation: Evaluation) {
    setSelectedEvaluation(evaluation)
    setEditScore(String(evaluation.score))
    setEditNotes(evaluation.notes || "")
    setEditDate(new Date(evaluation.date).toISOString().split("T")[0])
    setIsEditDialogOpen(true)
  }

  async function handleUpdateEvaluation() {
    if (!selectedEvaluation) return

    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/evaluations/${selectedEvaluation.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          score: parseFloat(editScore),
          date: editDate,
          notes: editNotes || null,
        }),
      })

      if (res.ok) {
        setIsEditDialogOpen(false)
        setSelectedEvaluation(null)
        toast({ title: t.common.success, description: t.grading.evaluationUpdated })
        fetchEvaluations()
        setShowRecalculatePrompt(true)
      } else {
        const data = await res.json()
        toast({
          title: t.common.error,
          description: data.message || t.grading.failedToUpdateEvaluation,
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Error updating evaluation:", err)
      toast({
        title: t.common.error,
        description: t.grading.failedToUpdateEvaluation,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDeleteEvaluation() {
    if (!selectedEvaluation) return

    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/evaluations/${selectedEvaluation.id}`, {
        method: "DELETE",
      })

      if (res.ok) {
        setIsDeleteDialogOpen(false)
        setSelectedEvaluation(null)
        toast({ title: t.common.success, description: t.grading.evaluationDeleted })
        fetchEvaluations()
        setShowRecalculatePrompt(true)
      } else {
        const data = await res.json()
        toast({
          title: t.common.error,
          description: data.message || t.grading.failedToDeleteEvaluation,
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Error deleting evaluation:", err)
      toast({
        title: t.common.error,
        description: t.grading.failedToDeleteEvaluation,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleRecalculate() {
    setIsRecalculating(true)
    try {
      const avgRes = await fetch("/api/evaluations/calculate-averages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trimesterId: activeTrimester.id }),
      })
      if (!avgRes.ok) throw new Error("Failed to calculate averages")

      const summaryRes = await fetch("/api/evaluations/student-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trimesterId: activeTrimester.id }),
      })
      if (!summaryRes.ok) throw new Error("Failed to calculate summaries")

      toast({ title: t.common.success, description: t.grading.calculationComplete })
    } catch (err) {
      console.error("Error recalculating:", err)
      toast({
        title: t.common.error,
        description: t.grading.failedToRecalculate,
        variant: "destructive",
      })
    } finally {
      setIsRecalculating(false)
      setShowRecalculatePrompt(false)
    }
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gspn-maroon-500/10 rounded-xl">
            <BookOpen className="h-6 w-6 text-gspn-maroon-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{t.grading.manageEvaluations}</h1>
            <p className="text-muted-foreground">{t.grading.viewEvaluations}</p>
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

      {/* Filters */}
      <Card className="mb-6 border shadow-sm overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
            {t.grading.viewEvaluations}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="grid gap-2">
              <Label>{t.grading.selectGrade}</Label>
              <Select value={manageGradeId} onValueChange={setManageGradeId}>
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
                value={manageSubjectId}
                onValueChange={setManageSubjectId}
                disabled={!manageGradeId || manageSubjects.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t.grading.allSubjects} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.grading.allSubjects}</SelectItem>
                  {manageSubjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {locale === "fr" ? subject.subjectNameFr : subject.subjectNameEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>{t.grading.filterByType}</Label>
              <Select value={manageTypeFilter} onValueChange={setManageTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.grading.allTypes}</SelectItem>
                  <SelectItem value="interrogation">{t.grading.interrogation}</SelectItem>
                  <SelectItem value="devoir_surveille">{t.grading.devoirSurveille}</SelectItem>
                  <SelectItem value="composition">{t.grading.composition}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>{t.grading.searchStudent}</Label>
              <SearchInput
                placeholder={t.grading.searchStudentPlaceholder}
                value={evaluationSearch}
                onChange={(v) => setFilter("q", v)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Evaluations Table */}
      <Card className="border shadow-sm overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
              {t.grading.evaluations}
            </CardTitle>
            <CardDescription>
              {evaluationSearch
                ? `${filteredEvaluations.length} / ${evaluations.length}`
                : evaluations.length}{" "}
              {t.grading.evaluations.toLowerCase()}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchEvaluations}
            disabled={isLoadingEvaluations || !manageGradeId}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isLoadingEvaluations && "animate-spin")} />
            {t.common.reset}
          </Button>
        </CardHeader>
        <CardContent>
          <EvaluationsTable
            evaluations={filteredEvaluations}
            isLoading={isLoadingEvaluations}
            hasGradeSelected={!!manageGradeId}
            hasSearchQuery={!!evaluationSearch}
            getEvaluationTypeLabel={getEvalTypeLabel}
            onEdit={openEditDialog}
            onDelete={(evaluation) => {
              setSelectedEvaluation(evaluation)
              setIsDeleteDialogOpen(true)
            }}
          />
        </CardContent>
      </Card>

      {/* Dialogs */}
      <EditEvaluationDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        evaluation={selectedEvaluation}
        editScore={editScore}
        editNotes={editNotes}
        editDate={editDate}
        onScoreChange={setEditScore}
        onNotesChange={setEditNotes}
        onDateChange={setEditDate}
        isSubmitting={isSubmitting}
        onConfirm={handleUpdateEvaluation}
      />
      <DeleteEvaluationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        evaluation={selectedEvaluation}
        isDeleting={isSubmitting}
        onConfirm={handleDeleteEvaluation}
      />
      <RecalculatePromptDialog
        open={showRecalculatePrompt}
        onOpenChange={setShowRecalculatePrompt}
        isRecalculating={isRecalculating}
        onConfirm={handleRecalculate}
      />
    </>
  )
}
