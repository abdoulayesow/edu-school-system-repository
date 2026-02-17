"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, User, Clock, GraduationCap, Users, Loader2, Calendar } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import { useToast } from "@/hooks/use-toast"
import { usePermission } from "@/components/permission-guard"
import { PageContainer } from "@/components/layout"
import { StatCard } from "@/components/students"
import { TimetableGrid } from "@/components/timetable/timetable-grid"
import { SectionSelector } from "@/components/timetable/section-selector"
import { SlotEditorDialog } from "@/components/timetable/slot-editor-dialog"
import { cn } from "@/lib/utils"
import type {
  Grade,
  GradeDetail,
  Subject,
  DaySchedule,
  TimePeriod,
  GradeRoom,
  ScheduleSlotFull,
  GradeSubject,
  TeacherProfile,
} from "@/lib/types/timetable"

export default function TimetablePage() {
  const { t, locale } = useI18n()
  const { toast } = useToast()
  const { granted: canCreateSlots, loading: loadingPermissions } = usePermission("schedule", "create")
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
  const [editorSlot, setEditorSlot] = useState<ScheduleSlotFull | null>(null)
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
        } else {
          toast({
            title: t.common.error,
            description: t.timetable.slotEditor.errorFetch,
            variant: "destructive",
          })
        }
      } catch (err) {
        console.error("Failed to fetch grades:", err)
        toast({
          title: t.common.error,
          description: t.timetable.slotEditor.errorFetch,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    fetchGrades()
  }, [t, toast])

  // Fetch grade rooms for section selector
  const fetchGradeRooms = useCallback(async () => {
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
      } else {
        toast({
          title: t.common.error,
          description: t.timetable.slotEditor.errorFetch,
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Failed to fetch grade rooms:", err)
      toast({
        title: t.common.error,
        description: t.timetable.slotEditor.errorFetch,
        variant: "destructive",
      })
    }
  }, [selectedGradeId, selectedGradeRoomId, t, toast])

  // Fetch subjects when grade changes (consolidated - single API call for both display and editor)
  useEffect(() => {
    if (!selectedGradeId) return

    async function fetchGradeData() {
      setLoadingSubjects(true)
      try {
        const res = await fetch(`/api/timetable?gradeId=${selectedGradeId}`)
        if (res.ok) {
          const data = await res.json()

          // Set display data
          setGradeDetail(data.grade)
          setSubjects(data.subjects || [])
          setTotalHours(data.totalHours || 0)

          // Transform for slot editor (single fetch instead of duplicate!)
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
        } else {
          toast({
            title: t.common.error,
            description: t.timetable.slotEditor.errorFetch,
            variant: "destructive",
          })
        }
      } catch (err) {
        console.error("Failed to fetch grade data:", err)
        toast({
          title: t.common.error,
          description: t.timetable.slotEditor.errorFetch,
          variant: "destructive",
        })
      } finally {
        setLoadingSubjects(false)
      }
    }

    fetchGradeData()
    fetchGradeRooms()
  }, [selectedGradeId, fetchGradeRooms, t, toast])

  // Fetch teachers
  useEffect(() => {
    async function fetchTeachers() {
      try {
        const res = await fetch("/api/teachers")
        if (res.ok) {
          const data = await res.json()
          setTeachers(data)
        } else {
          toast({
            title: t.common.error,
            description: t.timetable.slotEditor.errorFetch,
            variant: "destructive",
          })
        }
      } catch (err) {
        console.error("Failed to fetch teachers:", err)
        toast({
          title: t.common.error,
          description: t.timetable.slotEditor.errorFetch,
          variant: "destructive",
        })
      }
    }
    fetchTeachers()
  }, [t, toast])

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
        } else {
          toast({
            title: t.common.error,
            description: t.timetable.slotEditor.errorFetch,
            variant: "destructive",
          })
        }
      } catch (err) {
        console.error("Failed to fetch weekly schedule:", err)
        toast({
          title: t.common.error,
          description: t.timetable.slotEditor.errorFetch,
          variant: "destructive",
        })
      } finally {
        setLoadingSchedule(false)
      }
    }
    fetchWeeklySchedule()
  }, [selectedGradeRoomId, t, toast])

  // Slot editor handlers (optimized with useCallback)
  const handleSlotClick = useCallback((day: string, timePeriodId: string, slot: any) => {
    setEditorDay(day)
    setEditorTimePeriodId(timePeriodId)
    setEditorSlot(slot)
    setIsSlotEditorOpen(true)
  }, [])

  const handleAddSlot = useCallback((day: string, timePeriodId: string) => {
    // Check permission before opening dialog
    if (!canCreateSlots) {
      toast({
        title: t.permissions.accessDenied,
        description: t.permissions.noSchedulePermission,
        variant: "destructive",
      })
      return
    }

    setEditorDay(day)
    setEditorTimePeriodId(timePeriodId)
    setEditorSlot(null)
    setIsSlotEditorOpen(true)
  }, [canCreateSlots, toast])

  const handleSlotEditorSuccess = useCallback(() => {
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
          toast({
            title: t.common.error,
            description: t.timetable.slotEditor.errorFetch,
            variant: "destructive",
          })
        })
    }
  }, [selectedGradeRoomId, t, toast])

  // Calculate stats (optimized with useMemo)
  const totalStudents = useMemo(
    () => grades.reduce((sum, g) => sum + g.studentCount, 0),
    [grades]
  )

  const totalSubjects = useMemo(
    () => grades.reduce((sum, g) => sum + g.subjectCount, 0),
    [grades]
  )

  if (loading) {
    return (
      <PageContainer maxWidth="full">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gspn-maroon-500" />
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer maxWidth="full">
      {/* Page Header with Brand Styling */}
      <div className="relative mb-6 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="h-1 bg-gspn-maroon-500" />
        <div className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-gspn-maroon-500/10 rounded-xl">
              <Calendar className="h-6 w-6 text-gspn-maroon-500" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">{t.classes.title}</h1>
          </div>
          <p className="text-muted-foreground mt-1">{t.classes.subtitle}</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <StatCard
          title={t.classes.totalClasses}
          value={grades.length}
          description={t.classes.allClasses}
          icon={GraduationCap}
        />
        <StatCard
          title={t.classes.totalStudents}
          value={totalStudents}
          description={t.classes.acrossAllClasses}
          icon={Users}
        />
        <StatCard
          title={t.common.subjects}
          value={totalSubjects}
          description={t.classes.scheduledToday}
          icon={BookOpen}
        />
      </div>

      {/* View Toggle Tabs */}
      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "subjects" | "schedule")} className="mb-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger
            value="subjects"
            className={cn(
              "flex items-center gap-2",
              viewMode === "subjects"
                ? "bg-gspn-gold-500 text-black dark:bg-gspn-gold-500 dark:text-black"
                : "hover:bg-gspn-maroon-50 dark:hover:bg-gspn-maroon-900"
            )}
          >
            <BookOpen className="h-4 w-4" />
            {t.classes.subjects}
          </TabsTrigger>
          <TabsTrigger
            value="schedule"
            className={cn(
              "flex items-center gap-2",
              viewMode === "schedule"
                ? "bg-gspn-gold-500 text-black dark:bg-gspn-gold-500 dark:text-black"
                : "hover:bg-gspn-maroon-50 dark:hover:bg-gspn-maroon-900"
            )}
          >
            <Calendar className="h-4 w-4" />
            {t.classes.schedule}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Grade List Sidebar */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border shadow-sm overflow-hidden">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
                <div>
                  <CardTitle className="text-base">{t.classes.classes}</CardTitle>
                  <CardDescription>{t.grades.selectClass}</CardDescription>
                </div>
              </div>
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
                        ? "bg-gspn-maroon-50 dark:bg-gspn-maroon-950/30 border-gspn-maroon-300 dark:border-gspn-maroon-700"
                        : "bg-background hover:bg-muted border-border"
                    }`}
                  >
                    <div className="text-left">
                      <p className="font-medium text-sm">{grade.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {grade.subjectCount} {t.common.subjects.toLowerCase()}
                      </p>
                    </div>
                    <Badge className="text-xs bg-gspn-gold-50 border-gspn-gold-200 text-gspn-gold-700 dark:bg-gspn-gold-950/50 dark:border-gspn-gold-800 dark:text-gspn-gold-300">
                      {grade.studentCount}
                    </Badge>
                  </button>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="border shadow-sm overflow-hidden">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
                <CardTitle className="text-base">{t.classes.statistics}</CardTitle>
              </div>
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
                <span className="text-xl font-bold text-gspn-maroon-600">{totalSubjects}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-5 space-y-4">
          {viewMode === "subjects" ? (
            /* Subjects View */
            <Card className="border shadow-sm overflow-hidden">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
                  <div>
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
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {loadingSubjects ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="size-8 animate-spin text-gspn-maroon-500" />
                  </div>
                ) : subjects.length > 0 ? (
                  subjects.map((subject) => (
                    <div
                      key={subject.id}
                      className="flex items-start gap-4 p-4 rounded-lg border border-border hover:border-gspn-maroon-300 hover:shadow-md hover:shadow-gspn-gold-500/10 dark:hover:border-gspn-maroon-700 transition-all duration-200"
                    >
                      <div className="flex flex-col items-center justify-center min-w-[60px] p-2 rounded-lg bg-muted">
                        <Clock className="size-4 text-gspn-maroon-500 dark:text-gspn-maroon-400 mb-1" />
                        <span className="text-sm font-medium">{subject.hoursPerWeek}h</span>
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-foreground flex items-center gap-2">
                              <BookOpen className="size-4 text-gspn-maroon-500" />
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
                          <Badge className="text-xs bg-gspn-maroon-50 border-gspn-maroon-200 text-gspn-maroon-700 dark:bg-gspn-maroon-950/50 dark:border-gspn-maroon-800 dark:text-gspn-maroon-300">
                            Coef. {subject.coefficient}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))
                ) : selectedGradeId ? (
                  <div className="text-center py-12">
                    <BookOpen className="size-12 text-gspn-maroon-300 dark:text-gspn-maroon-700 mx-auto mb-4" />
                    <p className="text-muted-foreground">{t.common.noData}</p>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <GraduationCap className="size-12 text-gspn-maroon-300 dark:text-gspn-maroon-700 mx-auto mb-4" />
                    <p className="text-muted-foreground">{t.grades.selectClass}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            /* Schedule View */
            <>
              <Card className="border shadow-sm overflow-hidden">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
                    <div>
                      <CardTitle>{t.classes.weeklySchedule}</CardTitle>
                      <CardDescription>
                        {locale === 'fr'
                          ? 'Cliquez sur un créneau pour modifier ou ajouter un cours'
                          : 'Click a slot to edit or add a class'}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Section Selector */}
                  <SectionSelector
                    gradeRooms={gradeRooms}
                    value={selectedGradeRoomId}
                    onValueChange={setSelectedGradeRoomId}
                    label={t.classes.section}
                  />

                  {/* Timetable Grid */}
                  {loadingSchedule ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="size-8 animate-spin text-gspn-maroon-500" />
                    </div>
                  ) : timePeriods.length === 0 ? (
                    <div className="text-center py-12">
                      <Clock className="size-12 text-gspn-maroon-300 dark:text-gspn-maroon-700 mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        {t.classes.noPeriodsDefinedSchedule}
                      </p>
                    </div>
                  ) : (
                    <TimetableGrid
                      weeklySchedule={weeklySchedule}
                      timePeriods={timePeriods}
                      onSlotClick={handleSlotClick}
                      onAddSlot={canCreateSlots ? handleAddSlot : undefined}
                      locale={locale}
                      canEdit={canCreateSlots}
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
