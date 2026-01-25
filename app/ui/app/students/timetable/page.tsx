"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { BookOpen, User, Clock, GraduationCap, Users, Loader2, Calendar } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import { PageContainer } from "@/components/layout"
import { sizing } from "@/lib/design-tokens"
import { TimetableGrid, type DaySchedule, type TimePeriod } from "@/components/timetable/timetable-grid"
import { SectionSelector, type GradeRoom } from "@/components/timetable/section-selector"
import { SlotEditorDialog, type ScheduleSlot as DialogScheduleSlot, type GradeSubject, type TeacherProfile } from "@/components/timetable/slot-editor-dialog"

interface Grade {
  id: string
  name: string
  level: string
  studentCount: number
  subjectCount: number
}

interface Subject {
  id: string
  subjectId: string
  name: string
  code: string | null
  coefficient: number
  hoursPerWeek: number
  teacher: {
    id: string
    name: string
  } | null
}

interface GradeDetail {
  id: string
  name: string
  level: string
  studentCount: number
  leader: string | null
}

export default function TimetablePage() {
  const { t, locale } = useI18n()
  const [grades, setGrades] = useState<Grade[]>([])
  const [selectedGradeId, setSelectedGradeId] = useState<string | null>(null)
  const [gradeDetail, setGradeDetail] = useState<GradeDetail | null>(null)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [totalHours, setTotalHours] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingSubjects, setLoadingSubjects] = useState(false)

  // Weekly schedule state
  const [gradeRooms, setGradeRooms] = useState<GradeRoom[]>([])
  const [selectedGradeRoomId, setSelectedGradeRoomId] = useState<string>("")
  const [weeklySchedule, setWeeklySchedule] = useState<DaySchedule[]>([])
  const [timePeriods, setTimePeriods] = useState<TimePeriod[]>([])
  const [loadingSchedule, setLoadingSchedule] = useState(false)

  // Slot editor state
  const [isSlotEditorOpen, setIsSlotEditorOpen] = useState(false)
  const [editorDay, setEditorDay] = useState<string>("")
  const [editorTimePeriodId, setEditorTimePeriodId] = useState<string>("")
  const [editorSlot, setEditorSlot] = useState<DialogScheduleSlot | null>(null)
  const [gradeSubjects, setGradeSubjects] = useState<GradeSubject[]>([])
  const [teachers, setTeachers] = useState<TeacherProfile[]>([])

  // View mode
  const [viewMode, setViewMode] = useState<"subjects" | "schedule">("subjects")

  // Fetch grades on mount
  useEffect(() => {
    async function fetchGrades() {
      try {
        const res = await fetch("/api/timetable")
        if (res.ok) {
          const data = await res.json()
          setGrades(data.grades || [])
          // Select first grade by default
          if (data.grades?.length > 0) {
            setSelectedGradeId(data.grades[0].id)
          }
        }
      } catch (err) {
        console.error("Failed to fetch grades:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchGrades()
  }, [])

  // Fetch subjects when grade changes
  useEffect(() => {
    if (!selectedGradeId) return

    async function fetchSubjects() {
      setLoadingSubjects(true)
      try {
        const res = await fetch(`/api/timetable?gradeId=${selectedGradeId}`)
        if (res.ok) {
          const data = await res.json()
          setGradeDetail(data.grade)
          setSubjects(data.subjects || [])
          setTotalHours(data.totalHours || 0)
        }
      } catch (err) {
        console.error("Failed to fetch subjects:", err)
      } finally {
        setLoadingSubjects(false)
      }
    }
    fetchSubjects()

    // Also fetch grade rooms and grade subjects for the selected grade
    fetchGradeRooms()
    fetchGradeSubjects()
  }, [selectedGradeId])

  // Fetch grade rooms for section selector
  async function fetchGradeRooms() {
    if (!selectedGradeId) return
    try {
      const res = await fetch(`/api/grade-rooms?gradeId=${selectedGradeId}`)
      if (res.ok) {
        const data = await res.json()
        setGradeRooms(data)
        // Select first room by default
        if (data.length > 0 && !selectedGradeRoomId) {
          setSelectedGradeRoomId(data[0].id)
        }
      }
    } catch (err) {
      console.error("Failed to fetch grade rooms:", err)
    }
  }

  // Fetch grade subjects for slot editor
  async function fetchGradeSubjects() {
    if (!selectedGradeId) return
    try {
      const res = await fetch(`/api/timetable?gradeId=${selectedGradeId}`)
      if (res.ok) {
        const data = await res.json()
        // Transform subjects data to GradeSubject format
        const formattedSubjects: GradeSubject[] = data.subjects?.map((s: Subject) => ({
          id: s.id,
          subject: {
            id: s.subjectId,
            name: s.name,
            nameFr: s.name,
            code: s.code || "",
          },
        })) || []
        setGradeSubjects(formattedSubjects)
      }
    } catch (err) {
      console.error("Failed to fetch grade subjects:", err)
    }
  }

  // Fetch teachers
  useEffect(() => {
    async function fetchTeachers() {
      try {
        const res = await fetch("/api/teachers")
        if (res.ok) {
          const data = await res.json()
          setTeachers(data)
        }
      } catch (err) {
        console.error("Failed to fetch teachers:", err)
      }
    }
    fetchTeachers()
  }, [])

  // Fetch weekly schedule when grade room changes
  useEffect(() => {
    if (!selectedGradeRoomId) return

    async function fetchWeeklySchedule() {
      setLoadingSchedule(true)
      try {
        const res = await fetch(`/api/timetable?gradeRoomId=${selectedGradeRoomId}`)
        if (res.ok) {
          const data = await res.json()
          setWeeklySchedule(data.weeklySchedule || [])
          setTimePeriods(data.timePeriods || [])
        }
      } catch (err) {
        console.error("Failed to fetch weekly schedule:", err)
      } finally {
        setLoadingSchedule(false)
      }
    }
    fetchWeeklySchedule()
  }, [selectedGradeRoomId])

  // Slot editor handlers
  const handleSlotClick = (day: string, timePeriodId: string, slot: any) => {
    setEditorDay(day)
    setEditorTimePeriodId(timePeriodId)
    setEditorSlot(slot)
    setIsSlotEditorOpen(true)
  }

  const handleAddSlot = (day: string, timePeriodId: string) => {
    setEditorDay(day)
    setEditorTimePeriodId(timePeriodId)
    setEditorSlot(null)
    setIsSlotEditorOpen(true)
  }

  const handleSlotEditorSuccess = () => {
    // Refresh the schedule
    if (selectedGradeRoomId) {
      const url = `/api/timetable?gradeRoomId=${selectedGradeRoomId}`
      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          setWeeklySchedule(data.weeklySchedule || [])
          setTimePeriods(data.timePeriods || [])
        })
        .catch((err) => {
          console.error("Failed to refresh schedule:", err)
        })
    }
  }

  // Calculate stats
  const totalStudents = grades.reduce((sum, g) => sum + g.studentCount, 0)
  const totalSubjects = grades.reduce((sum, g) => sum + g.subjectCount, 0)

  if (loading) {
    return (
      <PageContainer maxWidth="full">
        <div className="mb-6">
          <Skeleton className="h-9 w-48 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer maxWidth="full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">{t.classes.title}</h1>
        <p className="text-muted-foreground">{t.classes.subtitle}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card className="py-5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.classes.totalClasses}</CardTitle>
            <GraduationCap className={sizing.icon.lg} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{grades.length}</div>
            <p className="text-xs text-muted-foreground">{t.classes.allClasses}</p>
          </CardContent>
        </Card>

        <Card className="py-5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.classes.totalStudents}</CardTitle>
            <Users className={sizing.icon.lg} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">{t.classes.acrossAllClasses}</p>
          </CardContent>
        </Card>

        <Card className="py-5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.common.subjects}</CardTitle>
            <BookOpen className={sizing.icon.lg} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSubjects}</div>
            <p className="text-xs text-muted-foreground">{t.classes.scheduledToday}</p>
          </CardContent>
        </Card>
      </div>

      {/* View Toggle Tabs */}
      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "subjects" | "schedule")} className="mb-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="subjects" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            {locale === 'fr' ? 'Matières' : 'Subjects'}
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {locale === 'fr' ? 'Emploi du temps' : 'Schedule'}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Grade List Sidebar */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t.classes.classes}</CardTitle>
              <CardDescription>{t.grades.selectClass}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {grades.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {t.common.noData}
                </p>
              ) : (
                grades.map((grade) => (
                  <button
                    key={grade.id}
                    onClick={() => setSelectedGradeId(grade.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                      selectedGradeId === grade.id
                        ? "bg-primary/10 border-primary"
                        : "bg-background hover:bg-muted border-border"
                    }`}
                  >
                    <div className="text-left">
                      <p className="font-medium text-sm">{grade.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {grade.subjectCount} {t.common.subjects.toLowerCase()}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {grade.studentCount}
                    </Badge>
                  </button>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t.classes.statistics}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t.classes.totalClasses}</span>
                <span className="text-xl font-bold">{grades.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t.classes.totalStudents}</span>
                <span className="text-xl font-bold">{totalStudents}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t.common.subjects}</span>
                <span className="text-xl font-bold text-primary">{totalSubjects}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-5 space-y-4">
          {viewMode === "subjects" ? (
            /* Subjects View */
            <Card>
              <CardHeader>
                <CardTitle>
                  {gradeDetail?.name || t.grades.selectClass}
                </CardTitle>
                <CardDescription>
                  {gradeDetail ? (
                    <>
                      {gradeDetail.studentCount} {t.common.students}
                      {gradeDetail.leader && ` • ${gradeDetail.leader}`}
                      {` • ${totalHours}h/${t.common.week}`}
                    </>
                  ) : (
                    t.grades.selectClass
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {loadingSubjects ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="size-8 animate-spin text-muted-foreground" />
                  </div>
                ) : subjects.length > 0 ? (
                  subjects.map((subject) => (
                    <div
                      key={subject.id}
                      className="flex items-start gap-4 p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
                    >
                      <div className="flex flex-col items-center justify-center min-w-[60px] p-2 rounded-lg bg-muted">
                        <Clock className="size-4 text-muted-foreground mb-1" />
                        <span className="text-sm font-medium">{subject.hoursPerWeek}h</span>
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-foreground flex items-center gap-2">
                              <BookOpen className="size-4 text-primary" />
                              {subject.name}
                            </h3>
                            {subject.teacher ? (
                              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                <User className="size-3" />
                                {subject.teacher.name}
                              </p>
                            ) : (
                              <p className="text-sm text-yellow-600 flex items-center gap-1 mt-1">
                                <User className="size-3" />
                                {t.common.notAssigned}
                              </p>
                            )}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            Coef. {subject.coefficient}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))
                ) : selectedGradeId ? (
                  <div className="text-center py-12">
                    <BookOpen className="size-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">{t.common.noData}</p>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <GraduationCap className="size-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">{t.grades.selectClass}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            /* Schedule View */
            <>
              <Card>
                <CardHeader>
                  <CardTitle>{locale === 'fr' ? 'Emploi du temps hebdomadaire' : 'Weekly Schedule'}</CardTitle>
                  <CardDescription>
                    {locale === 'fr'
                      ? 'Cliquez sur un créneau pour modifier ou ajouter un cours'
                      : 'Click a slot to edit or add a class'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Section Selector */}
                  <SectionSelector
                    gradeRooms={gradeRooms}
                    value={selectedGradeRoomId}
                    onValueChange={setSelectedGradeRoomId}
                    label={locale === 'fr' ? 'Section' : 'Section'}
                  />

                  {/* Timetable Grid */}
                  {loadingSchedule ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="size-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : timePeriods.length === 0 ? (
                    <div className="text-center py-12">
                      <Clock className="size-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        {locale === 'fr'
                          ? 'Aucune période définie. Veuillez créer des périodes dans les paramètres.'
                          : 'No time periods defined. Please create periods in settings.'}
                      </p>
                    </div>
                  ) : (
                    <TimetableGrid
                      weeklySchedule={weeklySchedule}
                      timePeriods={timePeriods}
                      onSlotClick={handleSlotClick}
                      onAddSlot={handleAddSlot}
                      locale={locale}
                    />
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>

      {/* Slot Editor Dialog */}
      <SlotEditorDialog
        open={isSlotEditorOpen}
        onOpenChange={setIsSlotEditorOpen}
        gradeRoomId={selectedGradeRoomId}
        timePeriodId={editorTimePeriodId}
        dayOfWeek={editorDay}
        slot={editorSlot}
        gradeSubjects={gradeSubjects}
        teachers={teachers}
        onSuccess={handleSlotEditorSuccess}
      />
    </PageContainer>
  )
}
