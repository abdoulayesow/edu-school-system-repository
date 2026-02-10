"use client"

import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import {
  useGradeEntryPreferences,
  useGradeEntryDraft,
  formatRelativeTime,
} from "@/hooks/use-grade-entry-preferences"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PermissionGuard } from "@/components/permission-guard"
import { useI18n } from "@/components/i18n-provider"
import { useToast } from "@/components/ui/use-toast"
import { componentClasses } from "@/lib/design-tokens"
import {
  getEvaluationTypeLabel,
  type ActiveTrimester,
  type Grade,
  type GradeSubject,
  type GradeStudent,
  type GradeEntry,
  type EvaluationType,
} from "@/lib/types/grading"
import {
  Save,
  Loader2,
  BookOpen,
  Calendar,
  RotateCcw,
  Cloud,
  Keyboard,
} from "lucide-react"
import { ScoreEntryTable } from "./score-entry-table"
import { SubjectRemarksSection } from "./subject-remarks-section"
import { SuccessBanner } from "./success-banner"
import { DraftRestoreDialog } from "./draft-restore-dialog"
import { KeyboardHelpDialog } from "./keyboard-help-dialog"

const EVALUATION_TYPE_ORDER: EvaluationType[] = ["interrogation", "devoir_surveille", "composition"]
const AUTO_SAVE_INTERVAL = 30000

interface GradeEntryTabProps {
  activeTrimester: ActiveTrimester
  grades: Grade[]
}

export function GradeEntryTab({ activeTrimester, grades }: GradeEntryTabProps) {
  const { t, locale } = useI18n()
  const { toast } = useToast()

  // Core data
  const [subjects, setSubjects] = useState<GradeSubject[]>([])
  const [students, setStudents] = useState<GradeStudent[]>([])
  const [gradeEntries, setGradeEntries] = useState<Map<string, GradeEntry>>(new Map())

  // Selection state
  const [selectedGradeId, setSelectedGradeId] = useState<string>("")
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("")
  const [selectedType, setSelectedType] = useState<EvaluationType>("interrogation")
  const [evaluationDate, setEvaluationDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  )
  const [maxScore, setMaxScore] = useState<number>(20)

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false)
  const [preferencesRestored, setPreferencesRestored] = useState(false)

  // Draft state
  const [showDraftPrompt, setShowDraftPrompt] = useState(false)
  const [isAutoSaving, setIsAutoSaving] = useState(false)

  // Preferences and draft hooks
  const {
    preferences,
    isLoaded: prefsLoaded,
    savePreferences,
    clearPreferences,
  } = useGradeEntryPreferences(activeTrimester.schoolYear.id)

  const {
    draft,
    isLoaded: draftLoaded,
    lastSaved,
    saveDraft,
    clearDraft,
    hasMatchingDraft,
  } = useGradeEntryDraft(activeTrimester.id)

  // Fetch subjects + students when grade changes
  useEffect(() => {
    if (selectedGradeId) {
      fetchSubjects(selectedGradeId)
      fetchStudents(selectedGradeId)
    } else {
      setSubjects([])
      setStudents([])
    }
  }, [selectedGradeId])

  // Restore preferences
  useEffect(() => {
    if (prefsLoaded && preferences && grades.length > 0 && !preferencesRestored && !selectedGradeId) {
      const gradeExists = grades.some((g) => g.id === preferences.gradeId)
      if (gradeExists) {
        setSelectedGradeId(preferences.gradeId)
        setSelectedType(preferences.evaluationType)
        setMaxScore(preferences.maxScore)
        setPreferencesRestored(true)
        toast({ description: t.grading.lastUsedSettings, duration: 2000 })
      }
    }
  }, [prefsLoaded, preferences, grades, preferencesRestored, selectedGradeId, t, toast])

  // Restore subject from preferences
  useEffect(() => {
    if (preferencesRestored && preferences && subjects.length > 0 && !selectedSubjectId) {
      const subjectExists = subjects.some((s) => s.id === preferences.subjectId)
      if (subjectExists) {
        setSelectedSubjectId(preferences.subjectId)
      }
    }
  }, [preferencesRestored, preferences, subjects, selectedSubjectId])

  // Check for existing draft
  useEffect(() => {
    if (
      draftLoaded &&
      draft &&
      selectedGradeId &&
      selectedSubjectId &&
      hasMatchingDraft(selectedGradeId, selectedSubjectId) &&
      students.length > 0
    ) {
      const currentHasScores = Array.from(gradeEntries.values()).some((e) => e.score !== "")
      if (!currentHasScores) {
        setShowDraftPrompt(true)
      }
    }
  }, [draftLoaded, draft, selectedGradeId, selectedSubjectId, hasMatchingDraft, students])

  // Auto-save draft
  useEffect(() => {
    if (!selectedGradeId || !selectedSubjectId) return

    const hasAnyScores = Array.from(gradeEntries.values()).some((e) => e.score !== "")
    if (!hasAnyScores) return

    const interval = setInterval(() => {
      setIsAutoSaving(true)
      const entries: Record<string, { score: string; notes: string }> = {}
      gradeEntries.forEach((entry, key) => {
        if (entry.score !== "" || entry.notes !== "") {
          entries[key] = { score: entry.score, notes: entry.notes }
        }
      })

      saveDraft({
        gradeId: selectedGradeId,
        subjectId: selectedSubjectId,
        trimesterId: activeTrimester.id,
        evaluationType: selectedType,
        evaluationDate,
        maxScore,
        entries,
      })

      setTimeout(() => setIsAutoSaving(false), 1000)
    }, AUTO_SAVE_INTERVAL)

    return () => clearInterval(interval)
  }, [
    activeTrimester.id,
    selectedGradeId,
    selectedSubjectId,
    selectedType,
    evaluationDate,
    maxScore,
    gradeEntries,
    saveDraft,
  ])

  // Computed values
  const entriesWithScores = useMemo(() => {
    return Array.from(gradeEntries.values()).filter((e) => e.score !== "")
  }, [gradeEntries])

  const canSubmit = useMemo(() => {
    return selectedSubjectId && evaluationDate && entriesWithScores.length > 0
  }, [selectedSubjectId, evaluationDate, entriesWithScores])

  // Ctrl+S keyboard shortcut — use ref to avoid stale closure
  const handleSubmitRef = useRef<() => void>()
  handleSubmitRef.current = handleSubmit

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault()
        if (canSubmit && !isSubmitting) {
          handleSubmitRef.current?.()
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [canSubmit, isSubmitting])

  // Data fetching
  async function fetchSubjects(gradeId: string) {
    try {
      const res = await fetch(`/api/grades/${gradeId}/subjects`)
      if (res.ok) setSubjects(await res.json())
    } catch (err) {
      console.error("Error fetching subjects:", err)
    }
  }

  async function fetchStudents(gradeId: string) {
    try {
      const res = await fetch(`/api/grades/${gradeId}/students`)
      if (res.ok) {
        const data = await res.json()
        setStudents(data)
        const entries = new Map<string, GradeEntry>()
        data.forEach((student: GradeStudent) => {
          entries.set(student.studentProfileId, {
            studentProfileId: student.studentProfileId,
            score: "",
            notes: "",
            hasChanges: false,
          })
        })
        setGradeEntries(entries)
      }
    } catch (err) {
      console.error("Error fetching students:", err)
    }
  }

  // Handlers
  function handleScoreChange(studentProfileId: string, value: string) {
    const numValue = parseFloat(value)
    if (value !== "" && (isNaN(numValue) || numValue < 0 || numValue > maxScore)) return

    setGradeEntries((prev) => {
      const newEntries = new Map(prev)
      const entry = newEntries.get(studentProfileId)
      if (entry) {
        newEntries.set(studentProfileId, { ...entry, score: value, hasChanges: true })
      }
      return newEntries
    })
  }

  function handleNotesChange(studentProfileId: string, value: string) {
    setGradeEntries((prev) => {
      const newEntries = new Map(prev)
      const entry = newEntries.get(studentProfileId)
      if (entry) {
        newEntries.set(studentProfileId, { ...entry, notes: value, hasChanges: true })
      }
      return newEntries
    })
  }

  function handleGradeChange(gradeId: string) {
    setSelectedGradeId(gradeId)
    setSelectedSubjectId("")
    savePreferences({ gradeId })
  }

  function handleSubjectChange(subjectId: string) {
    setSelectedSubjectId(subjectId)
    savePreferences({ subjectId })
  }

  function handleTypeChange(type: EvaluationType) {
    setSelectedType(type)
    savePreferences({ evaluationType: type })
  }

  function handleMaxScoreChange(score: number) {
    setMaxScore(score)
    savePreferences({ maxScore: score })
  }

  function handleClearSelections() {
    setSelectedGradeId("")
    setSelectedSubjectId("")
    setSelectedType("interrogation")
    setMaxScore(20)
    clearPreferences()
    clearDraft()
  }

  function handleRestoreDraft() {
    if (!draft) return
    setSelectedType(draft.evaluationType)
    setEvaluationDate(draft.evaluationDate)
    setMaxScore(draft.maxScore)

    setGradeEntries((prev) => {
      const newEntries = new Map(prev)
      Object.entries(draft.entries).forEach(([studentId, data]) => {
        const existing = newEntries.get(studentId)
        if (existing) {
          newEntries.set(studentId, { ...existing, score: data.score, notes: data.notes, hasChanges: true })
        }
      })
      return newEntries
    })

    setShowDraftPrompt(false)
    toast({ description: t.grading.draftRestored, duration: 2000 })
  }

  function handleDiscardDraft() {
    clearDraft()
    setShowDraftPrompt(false)
  }

  async function handleSubmit() {
    if (!canSubmit) return

    setIsSubmitting(true)
    try {
      const evaluations = entriesWithScores.map((e) => ({
        studentProfileId: e.studentProfileId,
        score: parseFloat(e.score),
        notes: e.notes || undefined,
      }))

      const res = await fetch("/api/evaluations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gradeSubjectId: selectedSubjectId,
          trimesterId: activeTrimester.id,
          type: selectedType,
          date: evaluationDate,
          maxScore,
          evaluations,
        }),
      })

      if (res.ok) {
        clearDraft()
        const entries = new Map<string, GradeEntry>()
        students.forEach((student) => {
          entries.set(student.studentProfileId, {
            studentProfileId: student.studentProfileId,
            score: "",
            notes: "",
            hasChanges: false,
          })
        })
        setGradeEntries(entries)
        setShowSuccessMessage(true)
      } else {
        const data = await res.json()
        toast({
          title: t.common.error,
          description: data.message || t.grading.failedToSaveGrades,
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Error saving grades:", err)
      toast({
        title: t.common.error,
        description: t.grading.failedToSaveGrades,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleQuickReentry() {
    const currentIndex = EVALUATION_TYPE_ORDER.indexOf(selectedType)
    const nextType = EVALUATION_TYPE_ORDER[(currentIndex + 1) % EVALUATION_TYPE_ORDER.length]
    setSelectedType(nextType)
    savePreferences({ evaluationType: nextType })
    setShowSuccessMessage(false)
  }

  const getEvalTypeLabel = useCallback(
    (type: EvaluationType) => getEvaluationTypeLabel(type, t),
    [t]
  )

  function getEvaluationCoefficient(type: EvaluationType) {
    switch (type) {
      case "interrogation":
        return 1
      case "devoir_surveille":
        return 2
      case "composition":
        return 2
    }
  }

  const selectedSubject = useMemo(
    () => subjects.find((s) => s.id === selectedSubjectId),
    [subjects, selectedSubjectId]
  )

  const nextEvaluationType =
    EVALUATION_TYPE_ORDER[(EVALUATION_TYPE_ORDER.indexOf(selectedType) + 1) % EVALUATION_TYPE_ORDER.length]

  return (
    <>
      {/* Header badges */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gspn-maroon-500/10 rounded-xl">
            <BookOpen className="h-6 w-6 text-gspn-maroon-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{t.grading.gradeEntry}</h1>
            <p className="text-muted-foreground">{t.grading.gradeEntrySubtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isAutoSaving && (
            <Badge variant="outline" className="text-sm py-1 px-3 animate-pulse">
              <Cloud className="h-4 w-4 mr-2" />
              {t.grading.autoSaving}
            </Badge>
          )}
          {lastSaved && !isAutoSaving && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="text-sm py-1 px-3 text-muted-foreground">
                  <Cloud className="h-4 w-4 mr-2" />
                  {t.grading.draftSaved}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                {formatRelativeTime(lastSaved, locale as "en" | "fr")}
              </TooltipContent>
            </Tooltip>
          )}
          <Badge variant="outline" className="text-sm py-1 px-3">
            <Calendar className="h-4 w-4 mr-2" />
            {locale === "fr" ? activeTrimester.nameFr : activeTrimester.nameEn}
          </Badge>
          <Badge variant="secondary" className="text-sm py-1 px-3">
            {activeTrimester.schoolYear.name}
          </Badge>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={() => setShowKeyboardHelp(true)}>
                <Keyboard className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t.grading.keyboardShortcuts}</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Success Banner */}
      {showSuccessMessage && (
        <SuccessBanner
          onDismiss={() => setShowSuccessMessage(false)}
          onQuickReentry={handleQuickReentry}
          nextEvaluationType={nextEvaluationType}
          getEvaluationTypeLabel={getEvalTypeLabel}
        />
      )}

      {/* Selection Controls */}
      <Card className="mb-6 border shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
              {t.grading.enterGrades}
            </CardTitle>
            {(selectedGradeId || selectedSubjectId) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearSelections}
                className="text-muted-foreground"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                {t.grading.clearSelections}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="grid gap-2">
              <Label>{t.grading.selectGrade}</Label>
              <Select value={selectedGradeId} onValueChange={handleGradeChange}>
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
                onValueChange={handleSubjectChange}
                disabled={!selectedGradeId || subjects.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t.grading.selectSubject} />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {locale === "fr" ? subject.subjectNameFr : subject.subjectNameEn} (×
                      {subject.coefficient})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>{t.grading.evaluationType}</Label>
              <Select value={selectedType} onValueChange={(v) => handleTypeChange(v as EvaluationType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="interrogation">{t.grading.interrogation} (×1)</SelectItem>
                  <SelectItem value="devoir_surveille">{t.grading.devoirSurveille} (×2)</SelectItem>
                  <SelectItem value="composition">{t.grading.composition} (×2)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>{t.grading.evaluationDate}</Label>
              <Input
                type="date"
                value={evaluationDate}
                onChange={(e) => setEvaluationDate(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label>{t.grading.maxScore}</Label>
              <Input
                type="number"
                min="1"
                max="20"
                value={maxScore}
                onChange={(e) => handleMaxScoreChange(parseInt(e.target.value) || 20)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Score Entry Table */}
      {selectedGradeId && selectedSubjectId && (
        <Card className="border shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 delay-75">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
                {selectedSubject &&
                  (locale === "fr" ? selectedSubject.subjectNameFr : selectedSubject.subjectNameEn)}
              </CardTitle>
              <CardDescription>
                {getEvalTypeLabel(selectedType)} - {t.grading.coefficient}: ×
                {getEvaluationCoefficient(selectedType)}
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {t.grading.entriesCount
                  .replace("{entered}", String(entriesWithScores.length))
                  .replace("{total}", String(students.length))}
              </span>
              <PermissionGuard resource="grades" action="create" inline>
                <Button
                  onClick={handleSubmit}
                  disabled={!canSubmit || isSubmitting}
                  className={componentClasses.primaryActionButton}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {t.grading.saveAllGrades}
                  <kbd className="ml-2 hidden md:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                    ⌘S
                  </kbd>
                </Button>
              </PermissionGuard>
            </div>
          </CardHeader>
          <CardContent>
            <ScoreEntryTable
              students={students}
              gradeEntries={gradeEntries}
              maxScore={maxScore}
              onScoreChange={handleScoreChange}
              onNotesChange={handleNotesChange}
            />
          </CardContent>
        </Card>
      )}

      {/* Subject Remarks Section - shows when a grade + subject are selected */}
      {selectedGradeId && selectedSubjectId && (
        <div className="mt-6">
          <SubjectRemarksSection
            activeTrimester={activeTrimester}
            selectedGradeId={selectedGradeId}
            selectedSubjectId={selectedSubjectId}
            subjectLabel={
              selectedSubject
                ? locale === "fr"
                  ? selectedSubject.subjectNameFr
                  : selectedSubject.subjectNameEn
                : ""
            }
          />
        </div>
      )}

      {/* Empty State */}
      {!selectedGradeId && (
        <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">{t.grading.selectGrade}</h3>
            <p className="text-muted-foreground text-center max-w-md">
              {t.grading.gradeEntrySubtitle}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      <DraftRestoreDialog
        open={showDraftPrompt}
        onOpenChange={setShowDraftPrompt}
        draft={draft}
        onRestore={handleRestoreDraft}
        onDiscard={handleDiscardDraft}
      />
      <KeyboardHelpDialog open={showKeyboardHelp} onOpenChange={setShowKeyboardHelp} />
    </>
  )
}
