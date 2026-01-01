"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Users,
  Calendar,
  Loader2,
  ChevronLeft,
  Save,
  ListChecks,
  UserX,
  Search,
  CalendarCheck,
  TrendingUp,
  CircleAlert
} from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import { PageContainer } from "@/components/layout"
import { sizing } from "@/lib/design-tokens"
import { formatDateWithDay } from "@/lib/utils"

type AttendanceStatus = "present" | "absent" | "late" | "excused" | null

interface Person {
  id: string
  firstName: string
  lastName: string
  photoUrl: string | null
}

interface Student {
  studentProfileId: string
  studentNumber: string
  person: Person | null
  status: AttendanceStatus
  notes: string | null
  recordId: string | null
}

interface Grade {
  id: string
  name: string
  level: string
  order: number
  stats: {
    studentCount: number
  }
}

interface AttendanceSession {
  id: string
  entryMode: "checklist" | "absences_only"
  isComplete: boolean
  completedAt: string | null
  recorder: { id: string; name: string } | null
}

interface AttendanceSummary {
  total: number
  present: number
  absent: number
  late: number
  excused: number
  notRecorded: number
}

interface AttendanceData {
  grade: { id: string; name: string; level: string }
  date: string
  session: AttendanceSession | null
  students: Student[]
  summary: AttendanceSummary
}

export default function AttendancePage() {
  const { t, locale } = useI18n()

  // Selection state
  const [grades, setGrades] = useState<Grade[]>([])
  const [selectedGradeId, setSelectedGradeId] = useState<string>("all")
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [entryMode, setEntryMode] = useState<"checklist" | "absences_only">("checklist")

  // Attendance state
  const [attendanceData, setAttendanceData] = useState<AttendanceData | null>(null)
  const [localAttendance, setLocalAttendance] = useState<Record<string, AttendanceStatus>>({})
  const [searchQuery, setSearchQuery] = useState("")

  // Loading states
  const [isLoadingGrades, setIsLoadingGrades] = useState(true)
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Track if we're in attendance-taking mode
  const [isRecording, setIsRecording] = useState(false)

  // Fetch grades on mount
  useEffect(() => {
    async function fetchGrades() {
      try {
        setIsLoadingGrades(true)
        const response = await fetch("/api/grades")
        if (!response.ok) throw new Error("Failed to fetch grades")
        const data = await response.json()
        setGrades(data.grades || [])
      } catch (err) {
        console.error("Error fetching grades:", err)
        setError("Échec du chargement des classes")
      } finally {
        setIsLoadingGrades(false)
      }
    }
    fetchGrades()
  }, [])

  // Fetch attendance when grade and date are selected
  useEffect(() => {
    if (!selectedGradeId || selectedGradeId === "all" || !selectedDate) return

    async function fetchAttendance() {
      try {
        setIsLoadingAttendance(true)
        setError(null)
        const response = await fetch(`/api/attendance/grade/${selectedGradeId}/${selectedDate}`)
        if (!response.ok) throw new Error("Failed to fetch attendance")
        const data: AttendanceData = await response.json()
        setAttendanceData(data)

        // Initialize local attendance from fetched data
        const initial: Record<string, AttendanceStatus> = {}
        data.students.forEach(student => {
          initial[student.studentProfileId] = student.status
        })
        setLocalAttendance(initial)

        // If there's an existing session, use its entry mode
        if (data.session) {
          setEntryMode(data.session.entryMode)
          setIsRecording(true)
        }
      } catch (err) {
        console.error("Error fetching attendance:", err)
        setError("Échec du chargement de la présence")
      } finally {
        setIsLoadingAttendance(false)
      }
    }
    fetchAttendance()
  }, [selectedGradeId, selectedDate])

  // Start recording attendance
  const startRecording = () => {
    if (!attendanceData) return

    // Initialize all as present for checklist mode, null for absences_only
    const initial: Record<string, AttendanceStatus> = {}
    attendanceData.students.forEach(student => {
      initial[student.studentProfileId] = entryMode === "checklist" ? "present" : null
    })
    setLocalAttendance(initial)
    setIsRecording(true)
  }

  // Toggle student attendance status
  const toggleStatus = (studentId: string) => {
    setLocalAttendance(prev => {
      const current = prev[studentId]
      let next: AttendanceStatus

      if (entryMode === "checklist") {
        // Cycle: present -> absent -> late -> excused -> present
        if (current === "present") next = "absent"
        else if (current === "absent") next = "late"
        else if (current === "late") next = "excused"
        else next = "present"
      } else {
        // Absences only: null -> absent -> late -> excused -> null (mark as present)
        if (current === null) next = "absent"
        else if (current === "absent") next = "late"
        else if (current === "late") next = "excused"
        else next = null
      }

      return { ...prev, [studentId]: next }
    })
  }

  // Save attendance
  const saveAttendance = async (isComplete: boolean = false) => {
    if (!attendanceData || !selectedGradeId) return

    try {
      setIsSaving(true)

      // Build records array
      const records = attendanceData.students.map(student => {
        const status = localAttendance[student.studentProfileId]
        return {
          studentProfileId: student.studentProfileId,
          status: status || (entryMode === "absences_only" ? "present" : status) || "present",
        }
      }).filter(r => r.status !== null)

      const response = await fetch(`/api/attendance/grade/${selectedGradeId}/${selectedDate}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entryMode,
          records,
          isComplete,
        }),
      })

      if (!response.ok) throw new Error("Failed to save attendance")

      // Refresh attendance data
      const refreshResponse = await fetch(`/api/attendance/grade/${selectedGradeId}/${selectedDate}`)
      if (refreshResponse.ok) {
        const data: AttendanceData = await refreshResponse.json()
        setAttendanceData(data)
      }

      if (isComplete) {
        setIsRecording(false)
      }
    } catch (err) {
      console.error("Error saving attendance:", err)
      setError("Échec de l'enregistrement")
    } finally {
      setIsSaving(false)
    }
  }

  // Filter students by search
  const filteredStudents = useMemo(() => {
    if (!attendanceData) return []
    if (!searchQuery) return attendanceData.students

    const query = searchQuery.toLowerCase()
    return attendanceData.students.filter(student => {
      const fullName = `${student.person?.firstName || ''} ${student.person?.lastName || ''}`.toLowerCase()
      return fullName.includes(query) || student.studentNumber?.toLowerCase().includes(query)
    })
  }, [attendanceData, searchQuery])

  // Calculate current summary from local state
  const currentSummary = useMemo(() => {
    if (!attendanceData) return null

    const summary = {
      total: attendanceData.students.length,
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
      notRecorded: 0,
    }

    attendanceData.students.forEach(student => {
      const status = localAttendance[student.studentProfileId]
      if (status === "present") summary.present++
      else if (status === "absent") summary.absent++
      else if (status === "late") summary.late++
      else if (status === "excused") summary.excused++
      else summary.notRecorded++
    })

    // In absences_only mode, not recorded = present
    if (entryMode === "absences_only") {
      summary.present = summary.notRecorded
      summary.notRecorded = 0
    }

    return summary
  }, [attendanceData, localAttendance, entryMode])

  const getStatusIcon = (status: AttendanceStatus) => {
    switch (status) {
      case "present": return <CheckCircle2 className="size-6 text-success" />
      case "absent": return <XCircle className="size-6 text-destructive" />
      case "late": return <Clock className="size-6 text-warning" />
      case "excused": return <AlertCircle className="size-6 text-blue-500" />
      default: return <div className="size-6 rounded-full border-2 border-muted-foreground/30" />
    }
  }

  const getStatusLabel = (status: AttendanceStatus) => {
    switch (status) {
      case "present": return t.attendance.statusPresent
      case "absent": return t.attendance.statusAbsent
      case "late": return "En retard"
      case "excused": return t.attendance.statusExcused
      default: return "Non marqué"
    }
  }

  const getStatusBadge = (status: AttendanceStatus) => {
    if (status === null) {
      return (
        <Badge variant="outline" className="bg-muted/10 text-muted-foreground border-muted/30">
          <CircleAlert className="size-3 mr-1" />
          {t.students.missingData || "Missing data"}
        </Badge>
      )
    }

    const config: Record<string, { className: string; label: string; icon: React.ElementType }> = {
      present: {
        className: "bg-success/10 text-success border-success/30",
        label: t.attendance.statusPresent,
        icon: CheckCircle2
      },
      absent: {
        className: "bg-destructive/10 text-destructive border-destructive/30",
        label: t.attendance.statusAbsent,
        icon: XCircle
      },
      late: {
        className: "bg-warning/10 text-warning border-warning/30",
        label: "En retard",
        icon: Clock
      },
      excused: {
        className: "bg-blue-500/10 text-blue-500 border-blue-500/30",
        label: t.attendance.statusExcused,
        icon: AlertCircle
      },
    }

    const { className, label, icon: Icon } = config[status] || { 
      className: "", 
      label: status, 
      icon: CheckCircle2 
    }

    return (
      <Badge variant="outline" className={className}>
        <Icon className="size-3 mr-1" />
        {label}
      </Badge>
    )
  }

  const getStatusBorder = (status: AttendanceStatus) => {
    switch (status) {
      case "present": return "border-success bg-success/5 hover:bg-success/10"
      case "absent": return "border-destructive bg-destructive/5 hover:bg-destructive/10"
      case "late": return "border-warning bg-warning/5 hover:bg-warning/10"
      case "excused": return "border-blue-500 bg-blue-500/5 hover:bg-blue-500/10"
      default: return "border-border hover:bg-muted/50"
    }
  }

  const selectedGrade = grades.find(g => g.id === selectedGradeId)

  // Calculate summary stats for cards
  const attendanceStats = useMemo(() => {
    if (!currentSummary) {
      return {
        totalSessions: 0,
        avgAttendanceRate: 0,
        presentToday: 0,
        absentToday: 0
      }
    }

    const total = currentSummary.total
    const present = currentSummary.present + currentSummary.late + currentSummary.excused
    const avgRate = total > 0 ? Math.round((present / total) * 100) : 0

    return {
      totalSessions: 1, // This would need to be fetched from API
      avgAttendanceRate: avgRate,
      presentToday: currentSummary.present + currentSummary.late + currentSummary.excused,
      absentToday: currentSummary.absent
    }
  }, [currentSummary])

  return (
    <PageContainer maxWidth="full">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">{t.attendance.title}</h1>
          <p className="text-muted-foreground">Suivi de présence par classe</p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card className="py-5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.attendance.totalSessions}</CardTitle>
              <CalendarCheck className={sizing.icon.lg} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{attendanceStats.totalSessions}</div>
              <p className="text-xs text-muted-foreground">{t.attendance.attendanceSessions}</p>
            </CardContent>
          </Card>

          <Card className="py-5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.attendance.averageAttendanceRate}</CardTitle>
              <TrendingUp className={sizing.icon.lg} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{attendanceStats.avgAttendanceRate}%</div>
              <p className="text-xs text-muted-foreground">{t.attendance.overallRate}</p>
            </CardContent>
          </Card>

          <Card className="py-5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.attendance.presentToday}</CardTitle>
              <CheckCircle2 className={sizing.icon.lg} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{attendanceStats.presentToday}</div>
              <p className="text-xs text-muted-foreground">{t.attendance.studentsPresent}</p>
            </CardContent>
          </Card>

          <Card className="py-5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.attendance.absentToday}</CardTitle>
              <XCircle className={sizing.icon.lg} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{attendanceStats.absentToday}</div>
              <p className="text-xs text-muted-foreground">{t.attendance.studentsAbsent}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        {!isRecording && (
          <Card className="mb-6 py-2">
            <CardHeader className="pb-1 px-6 pt-3">
              <CardTitle className="text-sm">{t.attendance.filterAttendance}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 pb-2 px-6">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Grade Selection */}
                {isLoadingGrades ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" />
                    Chargement des classes...
                  </div>
                ) : (
                  <Select value={selectedGradeId} onValueChange={setSelectedGradeId}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="All grades" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All grades</SelectItem>
                      {grades.map(grade => (
                        <SelectItem key={grade.id} value={grade.id}>
                          {grade.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {/* Date Selection */}
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full sm:w-[180px]"
                />

                {/* Entry Mode Selection */}
                <Select value={entryMode} onValueChange={(value: "checklist" | "absences_only") => setEntryMode(value)}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Entry mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checklist">Checklist</SelectItem>
                    <SelectItem value="absences_only">Absences Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Attendance Content */}
        {!isRecording ? (
          <div className="space-y-6">
            {/* Entry Mode Description */}
            <div className="p-3 rounded-lg bg-muted/50 border">
              <p className="text-xs text-muted-foreground">
                {entryMode === "checklist"
                  ? "Tous les élèves sont présents par défaut. Tapez pour changer le statut."
                  : "Marquez uniquement les absents et retards. Les non-marqués sont présents."}
              </p>
            </div>

            {/* Existing Session Info */}
            {attendanceData?.session && (
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
                <p className="text-sm font-medium text-primary">Session existante</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {attendanceData.session.isComplete
                    ? "Présence complétée"
                    : "Présence en cours"} - Mode: {attendanceData.session.entryMode === "checklist" ? "Liste complète" : "Absences seulement"}
                </p>
              </div>
            )}

            {/* Start Button */}
            <Button
              className="w-full"
              size="lg"
              disabled={!selectedGradeId || selectedGradeId === "all" || isLoadingAttendance}
              onClick={startRecording}
            >
              {isLoadingAttendance ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Chargement...
                </>
              ) : attendanceData?.session ? (
                <>Continuer la présence</>
              ) : (
                <>Commencer la présence</>
              )}
            </Button>

            {/* Recent Sessions Preview */}
            {attendanceData && !attendanceData.session && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Aperçu</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{attendanceData.grade.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDateWithDay(selectedDate, locale)}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      <Users className="size-3 mr-1" />
                      {attendanceData.summary.total} élèves
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          /* Attendance Recording View */
          <div className="space-y-4">
            {/* Back and Save Header */}
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    onClick={() => setIsRecording(false)}
                    className="gap-2"
                  >
                    <ChevronLeft className="size-4" />
                    Retour
                  </Button>
                  <div className="text-center">
                    <p className="font-semibold">{selectedGrade?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateWithDay(selectedDate, locale)}
                    </p>
                  </div>
                  <Button
                    onClick={() => saveAttendance(false)}
                    disabled={isSaving}
                    variant="outline"
                    size="sm"
                  >
                    {isSaving ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <>
                        <Save className="size-4 mr-1" />
                        Sauvegarder
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Summary Cards */}
            {currentSummary && (
              <div className="grid grid-cols-4 gap-2">
                <Card className="border-success/50">
                  <CardContent className="pt-4 pb-4 text-center">
                    <CheckCircle2 className="size-5 text-success mx-auto mb-1" />
                    <p className="text-xl font-bold">{currentSummary.present}</p>
                    <p className="text-xs text-muted-foreground">{t.attendance.present}</p>
                  </CardContent>
                </Card>
                <Card className="border-destructive/50">
                  <CardContent className="pt-4 pb-4 text-center">
                    <XCircle className="size-5 text-destructive mx-auto mb-1" />
                    <p className="text-xl font-bold">{currentSummary.absent}</p>
                    <p className="text-xs text-muted-foreground">{t.attendance.absent}</p>
                  </CardContent>
                </Card>
                <Card className="border-warning/50">
                  <CardContent className="pt-4 pb-4 text-center">
                    <Clock className="size-5 text-warning mx-auto mb-1" />
                    <p className="text-xl font-bold">{currentSummary.late}</p>
                    <p className="text-xs text-muted-foreground">Retards</p>
                  </CardContent>
                </Card>
                <Card className="border-blue-500/50">
                  <CardContent className="pt-4 pb-4 text-center">
                    <AlertCircle className="size-5 text-blue-500 mx-auto mb-1" />
                    <p className="text-xl font-bold">{currentSummary.excused}</p>
                    <p className="text-xs text-muted-foreground">{t.attendance.excused}</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un élève..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Mode Indicator */}
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              {entryMode === "checklist" ? (
                <>
                  <ListChecks className="size-4" />
                  Mode liste complète - Tapez pour changer le statut
                </>
              ) : (
                <>
                  <UserX className="size-4" />
                  Mode absences - Marquez les absents/retards
                </>
              )}
            </div>

            {/* Student List */}
            <Card>
              <CardContent className="pt-4 pb-2">
                <div className="space-y-2">
                  {filteredStudents.map((student) => {
                    const status = localAttendance[student.studentProfileId]
                    return (
                      <div
                        key={student.studentProfileId}
                        onClick={() => toggleStatus(student.studentProfileId)}
                        className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all ${getStatusBorder(status)}`}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="size-10">
                            <AvatarImage src={student.person?.photoUrl ?? undefined} />
                            <AvatarFallback>
                              {student.person?.firstName?.[0]}{student.person?.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {student.person?.firstName} {student.person?.lastName}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              {getStatusBadge(status)}
                            </div>
                          </div>
                        </div>
                        {getStatusIcon(status)}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Button
              size="lg"
              className="w-full h-14 text-lg"
              onClick={() => saveAttendance(true)}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="size-5 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="size-5 mr-2" />
              )}
              {t.attendance.submitAttendance}
            </Button>

            {/* Instructions */}
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="pt-4 pb-4">
                <h3 className="font-semibold text-foreground mb-2">{t.attendance.instructions}</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• {t.attendance.instruction1}</li>
                  <li>• Présent → Absent → Retard → Excusé → Présent</li>
                  <li>• Utilisez la recherche pour trouver un élève rapidement</li>
                  <li>• Sauvegardez régulièrement pour éviter la perte de données</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <Card className="mt-4 border-destructive">
            <CardContent className="pt-4 pb-4 text-center text-destructive">
              {error}
            </CardContent>
          </Card>
        )}
    </PageContainer>
  )
}
