"use client"

import { Suspense, useState, useEffect, useMemo, useCallback, useRef } from "react"
import { useUrlFilters, stringFilter, tabFilter } from "@/hooks/use-url-filters"
import {
  useGradeEntryPreferences,
  useGradeEntryDraft,
  formatRelativeTime,
} from "@/hooks/use-grade-entry-preferences"
import { SearchInput } from "@/components/ui/search-input"
import { PageContainer } from "@/components/layout"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
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
import { formatDateLong, cn } from "@/lib/utils"
import { componentClasses } from "@/lib/design-tokens"
import {
  Plus,
  Save,
  Loader2,
  BookOpen,
  Users,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Edit,
  RefreshCw,
  Keyboard,
  RotateCcw,
  CloudOff,
  Cloud,
  X,
  ChevronRight,
  Sparkles,
} from "lucide-react"

// ============================================================================
// Types
// ============================================================================

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
  level: string
}

interface GradeSubject {
  id: string
  subjectId: string
  subjectCode: string
  subjectNameFr: string
  subjectNameEn: string
  coefficient: number
}

interface Student {
  id: string
  studentProfileId: string
  firstName: string
  lastName: string
  studentNumber: string
}

interface GradeEntry {
  studentProfileId: string
  score: string
  notes: string
  hasChanges: boolean
}

interface Evaluation {
  id: string
  studentProfileId: string
  studentName: string
  studentNumber: string
  gradeSubjectId: string
  subjectName: string
  type: EvaluationType
  score: number
  maxScore: number
  date: string
  notes: string | null
  trimesterId: string
  gradeName: string
}

type EvaluationType = "interrogation" | "devoir_surveille" | "composition"

const ENTRY_TABS = ["entry", "manage"] as const
type EntryTab = (typeof ENTRY_TABS)[number]

const EVALUATION_TYPE_ORDER: EvaluationType[] = ["interrogation", "devoir_surveille", "composition"]
const AUTO_SAVE_INTERVAL = 30000 // 30 seconds

// ============================================================================
// Component
// ============================================================================

function GradeEntryPageContent() {
  const { t, locale } = useI18n()
  const { toast } = useToast()

  // URL-synced filters
  const { filters, setFilter } = useUrlFilters({
    tab: tabFilter(ENTRY_TABS, "entry"),
    q: stringFilter(),
  })
  const activeTab = filters.tab as EntryTab
  const evaluationSearch = filters.q

  // Core data state
  const [activeTrimester, setActiveTrimester] = useState<ActiveTrimester | null>(null)
  const [grades, setGrades] = useState<Grade[]>([])
  const [subjects, setSubjects] = useState<GradeSubject[]>([])
  const [students, setStudents] = useState<Student[]>([])
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
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false)
  const [preferencesRestored, setPreferencesRestored] = useState(false)

  // Draft state
  const [showDraftPrompt, setShowDraftPrompt] = useState(false)
  const [isAutoSaving, setIsAutoSaving] = useState(false)

  // Manage evaluations state
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [isLoadingEvaluations, setIsLoadingEvaluations] = useState(false)
  const [manageGradeId, setManageGradeId] = useState<string>("")
  const [manageSubjectId, setManageSubjectId] = useState<string>("")
  const [manageTypeFilter, setManageTypeFilter] = useState<string>("all")
  const [manageSubjects, setManageSubjects] = useState<GradeSubject[]>([])

  // Edit dialog state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null)
  const [editScore, setEditScore] = useState<string>("")
  const [editNotes, setEditNotes] = useState<string>("")
  const [editDate, setEditDate] = useState<string>("")

  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Recalculation prompt state
  const [showRecalculatePrompt, setShowRecalculatePrompt] = useState(false)
  const [isRecalculating, setIsRecalculating] = useState(false)

  // Refs for keyboard navigation
  const scoreInputRefs = useRef<Map<string, HTMLInputElement>>(new Map())
  const notesInputRefs = useRef<Map<string, HTMLInputElement>>(new Map())

  // Preferences and draft hooks
  const {
    preferences,
    isLoaded: prefsLoaded,
    savePreferences,
    clearPreferences,
  } = useGradeEntryPreferences(activeTrimester?.schoolYear.id)

  const {
    draft,
    isLoaded: draftLoaded,
    lastSaved,
    saveDraft,
    clearDraft,
    hasMatchingDraft,
  } = useGradeEntryDraft(activeTrimester?.id)

  // ============================================================================
  // Data Fetching
  // ============================================================================

  useEffect(() => {
    setIsMounted(true)
    fetchActiveTrimester()
    fetchGrades()
  }, [])

  useEffect(() => {
    if (selectedGradeId) {
      fetchSubjects(selectedGradeId)
      fetchStudents(selectedGradeId)
    } else {
      setSubjects([])
      setStudents([])
    }
  }, [selectedGradeId])

  // Restore preferences once loaded
  useEffect(() => {
    if (prefsLoaded && preferences && grades.length > 0 && !preferencesRestored && !selectedGradeId) {
      // Validate the grade still exists
      const gradeExists = grades.some((g) => g.id === preferences.gradeId)
      if (gradeExists) {
        setSelectedGradeId(preferences.gradeId)
        setSelectedType(preferences.evaluationType)
        setMaxScore(preferences.maxScore)
        setPreferencesRestored(true)

        toast({
          description: t.grading.lastUsedSettings,
          duration: 2000,
        })
      }
    }
  }, [prefsLoaded, preferences, grades, preferencesRestored, selectedGradeId, t, toast])

  // Restore subject from preferences once subjects are loaded
  useEffect(() => {
    if (preferencesRestored && preferences && subjects.length > 0 && !selectedSubjectId) {
      const subjectExists = subjects.some((s) => s.id === preferences.subjectId)
      if (subjectExists) {
        setSelectedSubjectId(preferences.subjectId)
      }
    }
  }, [preferencesRestored, preferences, subjects, selectedSubjectId])

  // Check for existing draft when grade/subject change
  useEffect(() => {
    if (
      draftLoaded &&
      draft &&
      selectedGradeId &&
      selectedSubjectId &&
      hasMatchingDraft(selectedGradeId, selectedSubjectId) &&
      students.length > 0
    ) {
      // Check if we have any scores entered (ignore if draft prompt already shown)
      const currentHasScores = Array.from(gradeEntries.values()).some((e) => e.score !== "")
      if (!currentHasScores) {
        setShowDraftPrompt(true)
      }
    }
  }, [draftLoaded, draft, selectedGradeId, selectedSubjectId, hasMatchingDraft, students])

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

  async function fetchStudents(gradeId: string) {
    try {
      const res = await fetch(`/api/grades/${gradeId}/students`)
      if (res.ok) {
        const data = await res.json()
        setStudents(data)
        // Initialize grade entries
        const entries = new Map<string, GradeEntry>()
        data.forEach((student: Student) => {
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

  // ============================================================================
  // Auto-save Draft
  // ============================================================================

  useEffect(() => {
    if (!activeTrimester || !selectedGradeId || !selectedSubjectId) return

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
    activeTrimester,
    selectedGradeId,
    selectedSubjectId,
    selectedType,
    evaluationDate,
    maxScore,
    gradeEntries,
    saveDraft,
  ])

  // ============================================================================
  // Computed Values (must be before keyboard navigation)
  // ============================================================================

  const entriesWithScores = useMemo(() => {
    return Array.from(gradeEntries.values()).filter((e) => e.score !== "")
  }, [gradeEntries])

  const canSubmit = useMemo(() => {
    return (
      activeTrimester &&
      selectedSubjectId &&
      evaluationDate &&
      entriesWithScores.length > 0
    )
  }, [activeTrimester, selectedSubjectId, evaluationDate, entriesWithScores])

  // ============================================================================
  // Keyboard Navigation
  // ============================================================================

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ctrl+S to save
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault()
        if (canSubmit && !isSubmitting) {
          handleSubmit()
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [canSubmit, isSubmitting])

  const handleScoreKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>, studentId: string, index: number) => {
      const studentIds = students.map((s) => s.studentProfileId)

      if (e.key === "Enter" || (e.key === "Tab" && !e.shiftKey)) {
        e.preventDefault()
        // Move to next student's score input
        const nextIndex = index + 1
        if (nextIndex < studentIds.length) {
          const nextId = studentIds[nextIndex]
          scoreInputRefs.current.get(nextId)?.focus()
        }
      } else if (e.key === "Tab" && e.shiftKey) {
        e.preventDefault()
        // Move to previous student's notes or score
        const prevIndex = index - 1
        if (prevIndex >= 0) {
          const prevId = studentIds[prevIndex]
          notesInputRefs.current.get(prevId)?.focus()
        }
      } else if (e.key === "ArrowDown") {
        e.preventDefault()
        const nextIndex = index + 1
        if (nextIndex < studentIds.length) {
          const nextId = studentIds[nextIndex]
          scoreInputRefs.current.get(nextId)?.focus()
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        const prevIndex = index - 1
        if (prevIndex >= 0) {
          const prevId = studentIds[prevIndex]
          scoreInputRefs.current.get(prevId)?.focus()
        }
      }
    },
    [students]
  )

  const handleNotesKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>, studentId: string, index: number) => {
      const studentIds = students.map((s) => s.studentProfileId)

      if (e.key === "Enter" || (e.key === "Tab" && !e.shiftKey)) {
        e.preventDefault()
        // Move to next student's score input
        const nextIndex = index + 1
        if (nextIndex < studentIds.length) {
          const nextId = studentIds[nextIndex]
          scoreInputRefs.current.get(nextId)?.focus()
        }
      } else if (e.key === "Tab" && e.shiftKey) {
        e.preventDefault()
        // Move back to current student's score
        scoreInputRefs.current.get(studentId)?.focus()
      }
    },
    [students]
  )

  // ============================================================================
  // Handlers
  // ============================================================================

  function handleScoreChange(studentProfileId: string, value: string) {
    const numValue = parseFloat(value)
    if (value !== "" && (isNaN(numValue) || numValue < 0 || numValue > maxScore)) {
      return
    }

    setGradeEntries((prev) => {
      const newEntries = new Map(prev)
      const entry = newEntries.get(studentProfileId)
      if (entry) {
        newEntries.set(studentProfileId, {
          ...entry,
          score: value,
          hasChanges: true,
        })
      }
      return newEntries
    })
  }

  function handleNotesChange(studentProfileId: string, value: string) {
    setGradeEntries((prev) => {
      const newEntries = new Map(prev)
      const entry = newEntries.get(studentProfileId)
      if (entry) {
        newEntries.set(studentProfileId, {
          ...entry,
          notes: value,
          hasChanges: true,
        })
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
          newEntries.set(studentId, {
            ...existing,
            score: data.score,
            notes: data.notes,
            hasChanges: true,
          })
        }
      })
      return newEntries
    })

    setShowDraftPrompt(false)
    toast({
      description: t.grading.draftRestored,
      duration: 2000,
    })
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
          trimesterId: activeTrimester!.id,
          type: selectedType,
          date: evaluationDate,
          maxScore,
          evaluations,
        }),
      })

      if (res.ok) {
        // Clear draft on successful save
        clearDraft()

        // Reset form entries but keep selections
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
          description: data.message || "Failed to save grades",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Error saving grades:", err)
      toast({
        title: t.common.error,
        description: "Failed to save grades",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleQuickReentry() {
    // Get next evaluation type in cycle
    const currentIndex = EVALUATION_TYPE_ORDER.indexOf(selectedType)
    const nextType = EVALUATION_TYPE_ORDER[(currentIndex + 1) % EVALUATION_TYPE_ORDER.length]
    setSelectedType(nextType)
    savePreferences({ evaluationType: nextType })

    // Reset success message and focus first score input
    setShowSuccessMessage(false)
    setTimeout(() => {
      const firstStudentId = students[0]?.studentProfileId
      if (firstStudentId) {
        scoreInputRefs.current.get(firstStudentId)?.focus()
      }
    }, 100)
  }

  function getEvaluationTypeLabel(type: EvaluationType) {
    switch (type) {
      case "interrogation":
        return t.grading.interrogation
      case "devoir_surveille":
        return t.grading.devoirSurveille
      case "composition":
        return t.grading.composition
    }
  }

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

  // ============================================================================
  // Manage Tab Logic
  // ============================================================================

  // Filter evaluations by search query
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

  // Manage tab: Fetch subjects when grade changes
  useEffect(() => {
    if (manageGradeId) {
      fetchManageSubjects(manageGradeId)
    } else {
      setManageSubjects([])
      setManageSubjectId("")
    }
  }, [manageGradeId])

  // Manage tab: Fetch evaluations when filters change
  useEffect(() => {
    if (activeTrimester && manageGradeId) {
      fetchEvaluations()
    }
  }, [activeTrimester, manageGradeId, manageSubjectId, manageTypeFilter])

  async function fetchManageSubjects(gradeId: string) {
    try {
      const res = await fetch(`/api/grades/${gradeId}/subjects`)
      if (res.ok) {
        const data = await res.json()
        setManageSubjects(data)
      }
    } catch (err) {
      console.error("Error fetching subjects:", err)
    }
  }

  async function fetchEvaluations() {
    if (!activeTrimester || !manageGradeId) return

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
        const transformed: Evaluation[] = data.map((e: any) => ({
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
        toast({
          title: t.common.success,
          description: t.grading.evaluationUpdated,
        })
        fetchEvaluations()
        setShowRecalculatePrompt(true)
      } else {
        const data = await res.json()
        toast({
          title: t.common.error,
          description: data.message || "Failed to update evaluation",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Error updating evaluation:", err)
      toast({
        title: t.common.error,
        description: "Failed to update evaluation",
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
        toast({
          title: t.common.success,
          description: t.grading.evaluationDeleted,
        })
        fetchEvaluations()
        setShowRecalculatePrompt(true)
      } else {
        const data = await res.json()
        toast({
          title: t.common.error,
          description: data.message || "Failed to delete evaluation",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Error deleting evaluation:", err)
      toast({
        title: t.common.error,
        description: "Failed to delete evaluation",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleRecalculate() {
    if (!activeTrimester) return

    setIsRecalculating(true)
    try {
      const avgRes = await fetch("/api/evaluations/calculate-averages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trimesterId: activeTrimester.id }),
      })

      if (!avgRes.ok) {
        throw new Error("Failed to calculate averages")
      }

      const summaryRes = await fetch("/api/evaluations/student-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trimesterId: activeTrimester.id }),
      })

      if (!summaryRes.ok) {
        throw new Error("Failed to calculate summaries")
      }

      toast({
        title: t.common.success,
        description: t.grading.calculationComplete,
      })
    } catch (err) {
      console.error("Error recalculating:", err)
      toast({
        title: t.common.error,
        description: "Failed to recalculate",
        variant: "destructive",
      })
    } finally {
      setIsRecalculating(false)
      setShowRecalculatePrompt(false)
    }
  }

  // ============================================================================
  // Render
  // ============================================================================

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
          {/* Auto-save indicator */}
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
          {/* Keyboard shortcuts button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowKeyboardHelp(true)}
              >
                <Keyboard className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t.grading.keyboardShortcuts}</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Tabs for Entry and Manage */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setFilter("tab", v as EntryTab)}
        className="w-full"
      >
        <TabsList className="mb-6">
          <TabsTrigger value="entry">{t.grading.enterGrades}</TabsTrigger>
          <TabsTrigger value="manage">{t.grading.manageEvaluations}</TabsTrigger>
        </TabsList>

        {/* Entry Tab */}
        <TabsContent value="entry">
          {/* Success Message with Quick Re-entry */}
          {showSuccessMessage && (
            <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="text-green-700 dark:text-green-300 font-medium">
                    {t.grading.gradesSaved}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSuccessMessage(false)}
                    className="text-green-700 border-green-300 hover:bg-green-100"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={handleQuickReentry}
                    className={cn(componentClasses.primaryActionButton, "gap-2")}
                  >
                    <Sparkles className="h-4 w-4" />
                    {t.grading.quickReentry}
                    <ChevronRight className="h-4 w-4" />
                    <span className="text-xs opacity-80">
                      {getEvaluationTypeLabel(
                        EVALUATION_TYPE_ORDER[
                          (EVALUATION_TYPE_ORDER.indexOf(selectedType) + 1) %
                            EVALUATION_TYPE_ORDER.length
                        ]
                      )}
                    </span>
                  </Button>
                </div>
              </div>
            </div>
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
                      <SelectItem value="interrogation">
                        {t.grading.interrogation} (×1)
                      </SelectItem>
                      <SelectItem value="devoir_surveille">
                        {t.grading.devoirSurveille} (×2)
                      </SelectItem>
                      <SelectItem value="composition">
                        {t.grading.composition} (×2)
                      </SelectItem>
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

          {/* Grade Entry Table */}
          {selectedGradeId && selectedSubjectId && (
            <Card className="border shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 delay-75">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
                    {selectedSubject &&
                      (locale === "fr"
                        ? selectedSubject.subjectNameFr
                        : selectedSubject.subjectNameEn)}
                  </CardTitle>
                  <CardDescription>
                    {getEvaluationTypeLabel(selectedType)} - {t.grading.coefficient}: ×
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
                {students.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>{t.grading.allStudents}</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className={componentClasses.tableHeaderRow}>
                        <TableHead className="w-12">#</TableHead>
                        <TableHead>{t.common.student}</TableHead>
                        <TableHead className="w-32">
                          {t.grading.score} ({t.grading.outOf} {maxScore})
                        </TableHead>
                        <TableHead>{t.grading.teacherRemark}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((student, index) => {
                        const entry = gradeEntries.get(student.studentProfileId)
                        const score = entry?.score || ""
                        const numScore = parseFloat(score)
                        const isPassing = !isNaN(numScore) && numScore >= 10

                        return (
                          <TableRow
                            key={student.studentProfileId}
                            className={cn(
                              componentClasses.tableRowHover,
                              "group"
                            )}
                          >
                            <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">
                                  {student.lastName} {student.firstName}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {student.studentNumber}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Input
                                  ref={(el) => {
                                    if (el) {
                                      scoreInputRefs.current.set(student.studentProfileId, el)
                                    }
                                  }}
                                  type="number"
                                  min="0"
                                  max={maxScore}
                                  step="0.5"
                                  value={score}
                                  onChange={(e) =>
                                    handleScoreChange(student.studentProfileId, e.target.value)
                                  }
                                  onKeyDown={(e) =>
                                    handleScoreKeyDown(e, student.studentProfileId, index)
                                  }
                                  className={cn(
                                    "w-20 transition-all",
                                    "focus:ring-2 focus:ring-gspn-gold-500 focus:border-gspn-gold-500",
                                    score !== ""
                                      ? isPassing
                                        ? "border-green-500 bg-green-50/50 dark:bg-green-950/20"
                                        : "border-red-500 bg-red-50/50 dark:bg-red-950/20"
                                      : ""
                                  )}
                                  placeholder="--"
                                />
                                {score !== "" && (
                                  <span
                                    className={cn(
                                      "text-sm font-medium",
                                      isPassing ? "text-green-600" : "text-red-600"
                                    )}
                                  >
                                    /{maxScore}
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Input
                                ref={(el) => {
                                  if (el) {
                                    notesInputRefs.current.set(student.studentProfileId, el)
                                  }
                                }}
                                value={entry?.notes || ""}
                                onChange={(e) =>
                                  handleNotesChange(student.studentProfileId, e.target.value)
                                }
                                onKeyDown={(e) =>
                                  handleNotesKeyDown(e, student.studentProfileId, index)
                                }
                                placeholder={t.grading.remarkPlaceholder}
                                className="max-w-md focus:ring-2 focus:ring-gspn-gold-500 focus:border-gspn-gold-500"
                              />
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
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
        </TabsContent>

        {/* Manage Evaluations Tab */}
        <TabsContent value="manage">
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
                <RefreshCw
                  className={cn("h-4 w-4 mr-2", isLoadingEvaluations && "animate-spin")}
                />
                {t.common.reset}
              </Button>
            </CardHeader>
            <CardContent>
              {isLoadingEvaluations ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-8 w-8 animate-spin text-gspn-maroon-500" />
                </div>
              ) : !manageGradeId ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{t.grading.selectGrade}</p>
                </div>
              ) : filteredEvaluations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{evaluationSearch ? t.common.noResults : t.grading.noEvaluationsFound}</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className={componentClasses.tableHeaderRow}>
                      <TableHead>{t.common.student}</TableHead>
                      <TableHead>{t.common.subjects}</TableHead>
                      <TableHead>{t.grading.evaluationType}</TableHead>
                      <TableHead className="text-center">{t.grading.score}</TableHead>
                      <TableHead>{t.common.date}</TableHead>
                      <TableHead>{t.grading.teacherRemark}</TableHead>
                      <TableHead className="text-right">{t.common.actions}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEvaluations.map((evaluation) => (
                      <TableRow key={evaluation.id} className={componentClasses.tableRowHover}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{evaluation.studentName}</div>
                            <div className="text-sm text-muted-foreground">
                              {evaluation.studentNumber}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{evaluation.subjectName}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{getEvaluationTypeLabel(evaluation.type)}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <span
                            className={cn(
                              "font-medium",
                              evaluation.score >= 10 ? "text-green-600" : "text-red-600"
                            )}
                          >
                            {evaluation.score}/{evaluation.maxScore}
                          </span>
                        </TableCell>
                        <TableCell>{formatDateLong(evaluation.date, locale)}</TableCell>
                        <TableCell className="max-w-xs truncate">{evaluation.notes || "-"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <PermissionGuard resource="grades" action="update" inline>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditDialog(evaluation)}
                                title={t.common.edit}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </PermissionGuard>
                            <PermissionGuard resource="grades" action="delete" inline>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedEvaluation(evaluation)
                                  setIsDeleteDialogOpen(true)
                                }}
                                title={t.common.delete}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </PermissionGuard>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Draft Restore Prompt */}
      <AlertDialog open={showDraftPrompt} onOpenChange={setShowDraftPrompt}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CloudOff className="h-5 w-5 text-gspn-gold-500" />
              {t.grading.draftAvailable}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {draft && (
                <span>
                  {Object.keys(draft.entries).length} {t.grading.gradesEntered.toLowerCase()} •{" "}
                  {formatRelativeTime(new Date(draft.savedAt), locale as "en" | "fr")}
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDiscardDraft}>
              {t.grading.discardDraft}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRestoreDraft}
              className={componentClasses.primaryActionButton}
            >
              {t.grading.restoreDraft}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Keyboard Shortcuts Help Dialog */}
      <Dialog open={showKeyboardHelp} onOpenChange={setShowKeyboardHelp}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Keyboard className="h-5 w-5 text-gspn-maroon-500" />
              {t.grading.keyboardShortcuts}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <span>{t.grading.shortcutSave}</span>
              <kbd className="px-2 py-1 bg-muted rounded text-sm font-mono">Ctrl+S</kbd>
            </div>
            <div className="flex items-center justify-between">
              <span>{t.grading.shortcutNextStudent}</span>
              <div className="flex gap-1">
                <kbd className="px-2 py-1 bg-muted rounded text-sm font-mono">Enter</kbd>
                <span className="text-muted-foreground">or</span>
                <kbd className="px-2 py-1 bg-muted rounded text-sm font-mono">↓</kbd>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>{t.grading.shortcutPrevStudent}</span>
              <kbd className="px-2 py-1 bg-muted rounded text-sm font-mono">↑</kbd>
            </div>
            <div className="flex items-center justify-between">
              <span>{t.grading.shortcutNextField}</span>
              <kbd className="px-2 py-1 bg-muted rounded text-sm font-mono">Tab</kbd>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowKeyboardHelp(false)}>{t.common.close}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Evaluation Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.grading.editEvaluation}</DialogTitle>
            <DialogDescription>
              {selectedEvaluation?.studentName} - {selectedEvaluation?.subjectName}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>{t.grading.score}</Label>
                <Input
                  type="number"
                  min="0"
                  max={selectedEvaluation?.maxScore || 20}
                  step="0.5"
                  value={editScore}
                  onChange={(e) => setEditScore(e.target.value)}
                />
                <span className="text-sm text-muted-foreground">
                  {t.grading.outOf} {selectedEvaluation?.maxScore || 20}
                </span>
              </div>
              <div className="grid gap-2">
                <Label>{t.grading.evaluationDate}</Label>
                <Input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>{t.grading.teacherRemark}</Label>
              <Textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder={t.grading.remarkPlaceholder}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              {t.common.cancel}
            </Button>
            <Button onClick={handleUpdateEvaluation} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t.common.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.grading.deleteEvaluation}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.grading.deleteEvaluationConfirmation}
              <br />
              <span className="font-medium">
                {selectedEvaluation?.studentName} - {selectedEvaluation?.subjectName} (
                {selectedEvaluation?.score}/{selectedEvaluation?.maxScore})
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEvaluation}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t.common.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Recalculation Prompt Dialog */}
      <AlertDialog open={showRecalculatePrompt} onOpenChange={setShowRecalculatePrompt}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.grading.recalculateAverages}</AlertDialogTitle>
            <AlertDialogDescription>{t.grading.recalculatePromptMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.grading.skipRecalculate}</AlertDialogCancel>
            <AlertDialogAction onClick={handleRecalculate} disabled={isRecalculating}>
              {isRecalculating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t.grading.recalculateNow}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  )
}

export default function GradeEntryPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gspn-maroon-500"></div></div>}>
      <GradeEntryPageContent />
    </Suspense>
  )
}
