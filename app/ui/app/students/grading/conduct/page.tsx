"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { PageContainer } from "@/components/layout"
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
import { PermissionGuard } from "@/components/permission-guard"
import { cn } from "@/lib/utils"
import { componentClasses } from "@/lib/design-tokens"
import {
  Save,
  Loader2,
  Calendar,
  AlertCircle,
  ClipboardCheck,
  Users,
  MessageSquareText,
  Scale,
} from "lucide-react"

// Shared types and utilities
import type {
  ActiveTrimester,
  Grade,
  StudentSummary,
  ConductEntry,
  RemarkEntry,
  DecisionEntry,
  DecisionType,
  ConductTabId,
  RawStudentSummaryResponse,
} from "@/lib/types/grading"

// Extracted table components
import { ConductTable, RemarksTable, DecisionsTable } from "@/components/grading"

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface TabButtonProps {
  label: string
  icon: React.ComponentType<{ className?: string }>
  isActive: boolean
  onClick: () => void
}

function TabButton({ label, icon: Icon, isActive, onClick }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        componentClasses.tabButtonBase,
        isActive ? componentClasses.tabButtonActive : componentClasses.tabButtonInactive
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </button>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ConductEntryPage() {
  const { t, locale } = useI18n()
  const { toast } = useToast()

  // Data state
  const [activeTrimester, setActiveTrimester] = useState<ActiveTrimester | null>(null)
  const [grades, setGrades] = useState<Grade[]>([])
  const [summaries, setSummaries] = useState<StudentSummary[]>([])

  // Entry maps for each tab
  const [conductEntries, setConductEntries] = useState<Map<string, ConductEntry>>(new Map())
  const [remarkEntries, setRemarkEntries] = useState<Map<string, RemarkEntry>>(new Map())
  const [decisionEntries, setDecisionEntries] = useState<Map<string, DecisionEntry>>(new Map())

  // Selection state
  const [selectedGradeId, setSelectedGradeId] = useState<string>("")
  const [activeTab, setActiveTab] = useState<ConductTabId>("conduct")

  // UI state
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingSummaries, setIsLoadingSummaries] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Tab configuration
  const tabs: { id: ConductTabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "conduct", label: t.nav.conductEntry, icon: ClipboardCheck },
    { id: "remarks", label: t.grading.generalRemark, icon: MessageSquareText },
    { id: "decisions", label: t.grading.decision, icon: Scale },
  ]

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  useEffect(() => {
    setIsMounted(true)
    fetchActiveTrimester()
    fetchGrades()
  }, [])

  useEffect(() => {
    if (activeTrimester && selectedGradeId) {
      fetchSummaries()
    } else {
      setSummaries([])
      resetAllEntries()
    }
  }, [activeTrimester, selectedGradeId])

  async function fetchActiveTrimester() {
    try {
      const res = await fetch("/api/trimesters/active")
      if (res.ok) {
        const data = await res.json()
        setActiveTrimester(data)
      }
    } catch (err) {
      console.error("Error fetching active trimester:", err)
      toast({ title: t.common.error, description: t.common.errorFetchingData, variant: "destructive" })
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
      toast({ title: t.common.error, description: t.common.errorFetchingData, variant: "destructive" })
    }
  }

  async function fetchSummaries() {
    if (!activeTrimester || !selectedGradeId) return

    setIsLoadingSummaries(true)
    try {
      const params = new URLSearchParams({
        trimesterId: activeTrimester.id,
        gradeId: selectedGradeId,
      })

      const res = await fetch(`/api/evaluations/student-summary?${params}`)
      if (res.ok) {
        const data = await res.json()
        const transformed: StudentSummary[] = data.map((s: RawStudentSummaryResponse) => ({
          id: s.id,
          studentProfileId: s.studentProfileId,
          studentName: s.studentName || `${s.studentProfile?.lastName || ""} ${s.studentProfile?.firstName || ""}`.trim(),
          studentNumber: s.studentNumber || s.studentProfile?.studentNumber || "",
          conduct: s.conduct,
          absences: s.absences,
          lates: s.lates,
          generalAverage: s.generalAverage,
          rank: s.rank,
          totalStudents: s.totalStudents,
          decision: s.decision,
          decisionOverride: s.decisionOverride || false,
          generalRemark: s.generalRemark,
        }))
        setSummaries(transformed)
        initializeEntries(transformed)
      }
    } catch (err) {
      console.error("Error fetching summaries:", err)
    } finally {
      setIsLoadingSummaries(false)
    }
  }

  // ============================================================================
  // ENTRY MANAGEMENT
  // ============================================================================

  function initializeEntries(studentSummaries: StudentSummary[]) {
    const newConductEntries = new Map<string, ConductEntry>()
    const newRemarkEntries = new Map<string, RemarkEntry>()
    const newDecisionEntries = new Map<string, DecisionEntry>()

    studentSummaries.forEach((s) => {
      newConductEntries.set(s.id, {
        conduct: s.conduct !== null ? String(s.conduct) : "",
        absences: s.absences !== null ? String(s.absences) : "",
        lates: s.lates !== null ? String(s.lates) : "",
        hasChanges: false,
      })

      newRemarkEntries.set(s.id, {
        remark: s.generalRemark || "",
        hasChanges: false,
      })

      newDecisionEntries.set(s.id, {
        decision: s.decision,
        hasChanges: false,
      })
    })

    setConductEntries(newConductEntries)
    setRemarkEntries(newRemarkEntries)
    setDecisionEntries(newDecisionEntries)
  }

  function resetAllEntries() {
    setConductEntries(new Map())
    setRemarkEntries(new Map())
    setDecisionEntries(new Map())
  }

  // ============================================================================
  // CHANGE HANDLERS
  // ============================================================================

  const handleConductChange = useCallback((summaryId: string, field: "conduct" | "absences" | "lates", value: string) => {
    if (field === "conduct") {
      const numValue = parseFloat(value)
      if (value !== "" && (isNaN(numValue) || numValue < 0 || numValue > 20)) return
    } else {
      const numValue = parseInt(value)
      if (value !== "" && (isNaN(numValue) || numValue < 0)) return
    }

    setConductEntries((prev) => {
      const newEntries = new Map(prev)
      const entry = newEntries.get(summaryId)
      if (entry) {
        newEntries.set(summaryId, { ...entry, [field]: value, hasChanges: true })
      }
      return newEntries
    })
  }, [])

  const handleRemarkChange = useCallback((summaryId: string, value: string) => {
    setRemarkEntries((prev) => {
      const newEntries = new Map(prev)
      const entry = newEntries.get(summaryId)
      if (entry) {
        newEntries.set(summaryId, { remark: value, hasChanges: true })
      }
      return newEntries
    })
  }, [])

  const handleDecisionChange = useCallback((summaryId: string, value: DecisionType) => {
    setDecisionEntries((prev) => {
      const newEntries = new Map(prev)
      newEntries.set(summaryId, { decision: value, hasChanges: true })
      return newEntries
    })
  }, [])

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const hasChanges = useMemo(() => {
    switch (activeTab) {
      case "conduct":
        return Array.from(conductEntries.values()).some((e) => e.hasChanges)
      case "remarks":
        return Array.from(remarkEntries.values()).some((e) => e.hasChanges)
      case "decisions":
        return Array.from(decisionEntries.values()).some((e) => e.hasChanges)
      default:
        return false
    }
  }, [activeTab, conductEntries, remarkEntries, decisionEntries])

  const changedCount = useMemo(() => {
    switch (activeTab) {
      case "conduct":
        return Array.from(conductEntries.values()).filter((e) => e.hasChanges).length
      case "remarks":
        return Array.from(remarkEntries.values()).filter((e) => e.hasChanges).length
      case "decisions":
        return Array.from(decisionEntries.values()).filter((e) => e.hasChanges).length
      default:
        return 0
    }
  }, [activeTab, conductEntries, remarkEntries, decisionEntries])

  // ============================================================================
  // SAVE HANDLERS
  // ============================================================================

  async function handleSave() {
    if (!hasChanges) return

    setIsSubmitting(true)
    try {
      const updatePromises: Promise<boolean>[] = []

      if (activeTab === "conduct") {
        conductEntries.forEach((entry, summaryId) => {
          if (entry.hasChanges) {
            updatePromises.push(
              fetch(`/api/evaluations/student-summary/${summaryId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  conduct: entry.conduct ? parseFloat(entry.conduct) : null,
                  absences: entry.absences ? parseInt(entry.absences) : null,
                  lates: entry.lates ? parseInt(entry.lates) : null,
                }),
              }).then((res) => res.ok)
            )
          }
        })
      } else if (activeTab === "remarks") {
        remarkEntries.forEach((entry, summaryId) => {
          if (entry.hasChanges) {
            updatePromises.push(
              fetch(`/api/evaluations/student-summary/${summaryId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ generalRemark: entry.remark || null }),
              }).then((res) => res.ok)
            )
          }
        })
      } else if (activeTab === "decisions") {
        decisionEntries.forEach((entry, summaryId) => {
          if (entry.hasChanges && entry.decision) {
            updatePromises.push(
              fetch(`/api/evaluations/student-summary/${summaryId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ decision: entry.decision }),
              }).then((res) => res.ok)
            )
          }
        })
      }

      const results = await Promise.all(updatePromises)
      const allSuccessful = results.every((r) => r)

      if (allSuccessful) {
        toast({
          title: t.common.success,
          description: activeTab === "conduct"
            ? t.grading.conductSaved
            : activeTab === "remarks"
            ? t.grading.remarksSaved
            : t.grading.decisionUpdated,
        })

        // Mark all entries as not changed for the current tab
        if (activeTab === "conduct") {
          setConductEntries((prev) => {
            const newEntries = new Map(prev)
            newEntries.forEach((entry, key) => {
              newEntries.set(key, { ...entry, hasChanges: false })
            })
            return newEntries
          })
        } else if (activeTab === "remarks") {
          setRemarkEntries((prev) => {
            const newEntries = new Map(prev)
            newEntries.forEach((entry, key) => {
              newEntries.set(key, { ...entry, hasChanges: false })
            })
            return newEntries
          })
        } else if (activeTab === "decisions") {
          // Re-fetch to get updated override status
          fetchSummaries()
        }
      } else {
        toast({
          title: t.common.error,
          description: t.grading.someUpdatesFailed,
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Error saving data:", err)
      toast({
        title: t.common.error,
        description: t.grading.failedToSaveData,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // ============================================================================
  // MAIN RENDER
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
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gspn-maroon-500/10 rounded-xl">
            <ClipboardCheck className="h-6 w-6 text-gspn-maroon-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{t.nav.conductEntry}</h1>
            <p className="text-muted-foreground">{t.grading.conductEntrySubtitle}</p>
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

      {/* Grade Selection */}
      <Card className="mb-6 border shadow-sm overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
            {t.grading.selectGrade}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
          </div>
        </CardContent>
      </Card>

      {/* Content Area */}
      {selectedGradeId && (
        <Card className="border shadow-sm overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b">
            <div className={cn(componentClasses.tabListBase, "px-4")}>
              {tabs.map((tab) => (
                <TabButton
                  key={tab.id}
                  id={tab.id}
                  label={tab.label}
                  icon={tab.icon}
                  isActive={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                />
              ))}
            </div>
          </div>

          {/* Card Header with Save Button */}
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
                {tabs.find((t) => t.id === activeTab)?.label}
              </CardTitle>
              <CardDescription>
                {summaries.length} {t.common.students}
                {hasChanges && (
                  <span className="ml-2 text-yellow-600 dark:text-yellow-400">
                    • {changedCount} {t.grading.unsavedChanges}
                  </span>
                )}
              </CardDescription>
            </div>
            <PermissionGuard resource="grades" action="update" inline>
              <Button
                onClick={handleSave}
                disabled={!hasChanges || isSubmitting}
                className={componentClasses.primaryActionButton}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {activeTab === "conduct"
                  ? t.grading.saveConductData
                  : activeTab === "remarks"
                  ? t.grading.saveRemarks
                  : t.grading.updateDecision}
              </Button>
            </PermissionGuard>
          </CardHeader>

          <CardContent>
            {isLoadingSummaries ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-8 w-8 animate-spin text-gspn-maroon-500" />
              </div>
            ) : summaries.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t.grading.noStudentsFound}</p>
              </div>
            ) : (
              <>
                {activeTab === "conduct" && (
                  <ConductTable
                    summaries={summaries}
                    conductEntries={conductEntries}
                    onConductChange={handleConductChange}
                    t={t}
                  />
                )}
                {activeTab === "remarks" && (
                  <RemarksTable
                    summaries={summaries}
                    remarkEntries={remarkEntries}
                    onRemarkChange={handleRemarkChange}
                    t={t}
                  />
                )}
                {activeTab === "decisions" && (
                  <DecisionsTable
                    summaries={summaries}
                    decisionEntries={decisionEntries}
                    onDecisionChange={handleDecisionChange}
                    t={t}
                  />
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!selectedGradeId && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ClipboardCheck className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">{t.grading.selectGrade}</h3>
            <p className="text-muted-foreground text-center max-w-md">
              {t.grading.conductEntrySubtitle}
            </p>
          </CardContent>
        </Card>
      )}
    </PageContainer>
  )
}
