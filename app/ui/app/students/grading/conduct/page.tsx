"use client"

import { useState, useEffect } from "react"
import { PageContainer } from "@/components/layout"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
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
import { useI18n } from "@/components/i18n-provider"
import { useToast } from "@/components/ui/use-toast"
import { PermissionGuard } from "@/components/permission-guard"
import {
  Save,
  Loader2,
  Calendar,
  AlertCircle,
  ClipboardCheck,
  Users,
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

interface StudentSummary {
  id: string
  studentProfileId: string
  studentName: string
  studentNumber: string
  conduct: number | null
  absences: number | null
  lates: number | null
  generalAverage: number | null
}

interface ConductEntry {
  summaryId: string
  conduct: string
  absences: string
  lates: string
  hasChanges: boolean
}

export default function ConductEntryPage() {
  const { t, locale } = useI18n()
  const { toast } = useToast()

  const [activeTrimester, setActiveTrimester] = useState<ActiveTrimester | null>(null)
  const [grades, setGrades] = useState<Grade[]>([])
  const [summaries, setSummaries] = useState<StudentSummary[]>([])
  const [entries, setEntries] = useState<Map<string, ConductEntry>>(new Map())

  // Selection state
  const [selectedGradeId, setSelectedGradeId] = useState<string>("")

  // UI state
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingSummaries, setIsLoadingSummaries] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

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
      setEntries(new Map())
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
        // Transform the data
        const transformed: StudentSummary[] = data.map((s: any) => ({
          id: s.id,
          studentProfileId: s.studentProfileId,
          studentName: s.studentName || `${s.studentProfile?.lastName || ""} ${s.studentProfile?.firstName || ""}`.trim(),
          studentNumber: s.studentNumber || s.studentProfile?.studentNumber || "",
          conduct: s.conduct,
          absences: s.absences,
          lates: s.lates,
          generalAverage: s.generalAverage,
        }))
        setSummaries(transformed)

        // Initialize entries map with existing values
        const entriesMap = new Map<string, ConductEntry>()
        transformed.forEach((s) => {
          entriesMap.set(s.id, {
            summaryId: s.id,
            conduct: s.conduct !== null ? String(s.conduct) : "",
            absences: s.absences !== null ? String(s.absences) : "",
            lates: s.lates !== null ? String(s.lates) : "",
            hasChanges: false,
          })
        })
        setEntries(entriesMap)
      }
    } catch (err) {
      console.error("Error fetching summaries:", err)
    } finally {
      setIsLoadingSummaries(false)
    }
  }

  function handleConductChange(summaryId: string, value: string) {
    const numValue = parseFloat(value)
    if (value !== "" && (isNaN(numValue) || numValue < 0 || numValue > 20)) {
      return
    }

    setEntries((prev) => {
      const newEntries = new Map(prev)
      const entry = newEntries.get(summaryId)
      if (entry) {
        newEntries.set(summaryId, {
          ...entry,
          conduct: value,
          hasChanges: true,
        })
      }
      return newEntries
    })
  }

  function handleAbsencesChange(summaryId: string, value: string) {
    const numValue = parseInt(value)
    if (value !== "" && (isNaN(numValue) || numValue < 0)) {
      return
    }

    setEntries((prev) => {
      const newEntries = new Map(prev)
      const entry = newEntries.get(summaryId)
      if (entry) {
        newEntries.set(summaryId, {
          ...entry,
          absences: value,
          hasChanges: true,
        })
      }
      return newEntries
    })
  }

  function handleLatesChange(summaryId: string, value: string) {
    const numValue = parseInt(value)
    if (value !== "" && (isNaN(numValue) || numValue < 0)) {
      return
    }

    setEntries((prev) => {
      const newEntries = new Map(prev)
      const entry = newEntries.get(summaryId)
      if (entry) {
        newEntries.set(summaryId, {
          ...entry,
          lates: value,
          hasChanges: true,
        })
      }
      return newEntries
    })
  }

  const hasChanges = Array.from(entries.values()).some((e) => e.hasChanges)
  const changedEntries = Array.from(entries.values()).filter((e) => e.hasChanges)

  async function handleSave() {
    if (changedEntries.length === 0) return

    setIsSubmitting(true)
    try {
      // Update each changed entry
      const promises = changedEntries.map(async (entry) => {
        const res = await fetch(`/api/evaluations/student-summary/${entry.summaryId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conduct: entry.conduct ? parseFloat(entry.conduct) : null,
            absences: entry.absences ? parseInt(entry.absences) : null,
            lates: entry.lates ? parseInt(entry.lates) : null,
          }),
        })
        return res.ok
      })

      const results = await Promise.all(promises)
      const allSuccessful = results.every((r) => r)

      if (allSuccessful) {
        toast({
          title: t.common.success,
          description: t.grading.conductSaved,
        })
        // Mark all entries as not changed
        setEntries((prev) => {
          const newEntries = new Map(prev)
          newEntries.forEach((entry, key) => {
            newEntries.set(key, { ...entry, hasChanges: false })
          })
          return newEntries
        })
      } else {
        toast({
          title: t.common.error,
          description: "Some updates failed",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Error saving conduct data:", err)
      toast({
        title: t.common.error,
        description: "Failed to save conduct data",
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

      {/* Selection Controls */}
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

      {/* Conduct Entry Table */}
      {selectedGradeId && (
        <Card className="border shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
                {t.nav.conductEntry}
              </CardTitle>
              <CardDescription>
                {summaries.length} {t.common.students}
                {hasChanges && (
                  <span className="ml-2 text-yellow-600">• {t.grading.unsavedChanges}</span>
                )}
              </CardDescription>
            </div>
            <PermissionGuard resource="grades" action="update" inline>
              <Button
                onClick={handleSave}
                disabled={!hasChanges || isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {t.grading.saveConductData}
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>{t.common.student}</TableHead>
                    <TableHead className="w-24 text-center">{t.grading.generalAverage}</TableHead>
                    <TableHead className="w-32">{t.grading.conductScore}</TableHead>
                    <TableHead className="w-28">{t.grading.absencesCount}</TableHead>
                    <TableHead className="w-28">{t.grading.latesCount}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summaries.map((summary, index) => {
                    const entry = entries.get(summary.id)
                    return (
                      <TableRow key={summary.id}>
                        <TableCell className="text-muted-foreground">
                          {index + 1}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{summary.studentName}</div>
                            <div className="text-sm text-muted-foreground">
                              {summary.studentNumber}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={`font-medium ${getScoreColor(summary.generalAverage)}`}>
                            {summary.generalAverage !== null ? summary.generalAverage.toFixed(2) : "-"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            max="20"
                            step="0.5"
                            value={entry?.conduct || ""}
                            onChange={(e) => handleConductChange(summary.id, e.target.value)}
                            placeholder="--"
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            value={entry?.absences || ""}
                            onChange={(e) => handleAbsencesChange(summary.id, e.target.value)}
                            placeholder="0"
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            value={entry?.lates || ""}
                            onChange={(e) => handleLatesChange(summary.id, e.target.value)}
                            placeholder="0"
                            className="w-20"
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
