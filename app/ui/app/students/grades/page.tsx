"use client"

import { useState, useEffect, useMemo } from "react"
import { PageContainer } from "@/components/layout"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { useI18n } from "@/components/i18n-provider"
import {
  School,
  Loader2,
  Users,
  DoorOpen,
  ChevronDown,
  ChevronRight,
  UserPlus,
  ArrowRightLeft,
  GraduationCap,
} from "lucide-react"
import { RoomAssignmentDialog, BulkMoveDialog, AutoAssignDialog } from "@/components/room-assignments"

interface SchoolYear {
  id: string
  name: string
  status: "new" | "active" | "passed"
  isActive: boolean
}

interface Room {
  id: string
  name: string
  displayName: string
  capacity: number
  isActive: boolean
  _count: {
    studentAssignments: number
  }
}

interface GradeSubject {
  id: string
  coefficient: number
  hoursPerWeek: number | null
  series: string | null
  subject: {
    id: string
    code: string
    nameFr: string
    nameEn: string
  }
}

interface Grade {
  id: string
  name: string
  code: string | null
  level: "kindergarten" | "elementary" | "college" | "high_school"
  order: number
  tuitionFee: number
  capacity: number
  series: string | null
  isEnabled: boolean
  rooms: Room[]
  subjects: GradeSubject[]
  _count: {
    enrollments: number
  }
}

const LEVELS = ["all", "kindergarten", "elementary", "college", "high_school"] as const
type Level = (typeof LEVELS)[number]

export default function GradesClassesPage() {
  const { t, locale } = useI18n()

  const LEVEL_LABELS: Record<Level, string> = {
    all: t.common.all,
    kindergarten: t.admin.levelKindergarten,
    elementary: t.admin.levelElementary,
    college: t.admin.levelCollege,
    high_school: t.admin.levelHighSchool,
  }

  const [activeSchoolYear, setActiveSchoolYear] = useState<SchoolYear | null>(null)
  const [grades, setGrades] = useState<Grade[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const [selectedLevel, setSelectedLevel] = useState<Level>("all")
  const [expandedGrades, setExpandedGrades] = useState<Set<string>>(new Set())

  // Dialog states
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [autoAssignDialogOpen, setAutoAssignDialogOpen] = useState(false)
  const [bulkMoveDialogOpen, setBulkMoveDialogOpen] = useState(false)
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null)

  useEffect(() => {
    setIsMounted(true)
    fetchActiveSchoolYear()
  }, [])

  useEffect(() => {
    if (activeSchoolYear?.id) {
      fetchGrades()
    }
  }, [activeSchoolYear?.id])

  async function fetchActiveSchoolYear() {
    try {
      const res = await fetch("/api/admin/school-years")
      if (res.ok) {
        const data = await res.json()
        // Get the active year only
        const activeYear = data.find((sy: SchoolYear) => sy.status === "active")
        if (activeYear) {
          setActiveSchoolYear(activeYear)
        } else if (data.length > 0) {
          // Fallback to most recent if no active
          setActiveSchoolYear(data[0])
        }
      }
    } catch (err) {
      console.error("Error fetching school years:", err)
    }
  }

  async function fetchGrades() {
    if (!activeSchoolYear?.id) return
    setIsLoading(true)
    try {
      const res = await fetch(`/api/admin/grades?schoolYearId=${activeSchoolYear.id}`)
      if (res.ok) {
        const data = await res.json()
        setGrades(data)
      }
    } catch (err) {
      console.error("Error fetching grades:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredGrades = useMemo(() => {
    let filtered = grades.filter((g) => g.isEnabled)
    if (selectedLevel !== "all") {
      filtered = filtered.filter((g) => g.level === selectedLevel)
    }
    return filtered
  }, [grades, selectedLevel])

  function getLevelBadge(level: Grade["level"]) {
    const colors: Record<Grade["level"], string> = {
      kindergarten: "bg-pink-500",
      elementary: "bg-blue-500",
      college: "bg-green-500",
      high_school: "bg-purple-500",
    }
    return <Badge className={colors[level]}>{LEVEL_LABELS[level]}</Badge>
  }

  function toggleGradeExpanded(gradeId: string) {
    const newSet = new Set(expandedGrades)
    if (newSet.has(gradeId)) {
      newSet.delete(gradeId)
    } else {
      newSet.add(gradeId)
    }
    setExpandedGrades(newSet)
  }

  function openAssignDialog(grade: Grade) {
    setSelectedGrade(grade)
    setAssignDialogOpen(true)
  }

  function openAutoAssignDialog(grade: Grade) {
    setSelectedGrade(grade)
    setAutoAssignDialogOpen(true)
  }

  function openBulkMoveDialog(grade: Grade) {
    setSelectedGrade(grade)
    setBulkMoveDialogOpen(true)
  }

  function handleDialogSuccess() {
    fetchGrades()
  }

  // Calculate totals for a grade
  function getGradeTotals(grade: Grade) {
    const totalAssigned = grade.rooms.reduce(
      (sum, room) => sum + room._count.studentAssignments,
      0
    )
    const totalRoomCapacity = grade.rooms.reduce((sum, room) => sum + room.capacity, 0)
    const unassigned = grade._count.enrollments - totalAssigned
    return { totalAssigned, totalRoomCapacity, unassigned }
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

  return (
    <PageContainer maxWidth="full">
      {/* Page Header with Brand Styling */}
      <div className="relative mb-6 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="h-1 bg-gspn-maroon-500" />
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-gspn-maroon-500/10 rounded-xl">
                  <GraduationCap className="h-6 w-6 text-gspn-maroon-500" />
                </div>
                <h1 className="text-3xl font-bold text-foreground">{t.nav.gradesClasses}</h1>
              </div>
              <p className="text-muted-foreground mt-1">{t.students.gradesClassesSubtitle}</p>
            </div>
            {/* Current School Year Indicator */}
            {activeSchoolYear && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gspn-maroon-50 dark:bg-gspn-maroon-950/30 border border-gspn-maroon-200 dark:border-gspn-maroon-800">
                <span className="text-sm text-gspn-maroon-700 dark:text-gspn-maroon-400">
                  {locale === "fr" ? "Année scolaire:" : "School Year:"}
                </span>
                <span className="text-sm font-semibold text-gspn-maroon-800 dark:text-gspn-maroon-300">
                  {activeSchoolYear.name}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Level Filter */}
      <Tabs
        value={selectedLevel}
        onValueChange={(v) => setSelectedLevel(v as Level)}
        className="mb-6"
      >
        <TabsList>
          {LEVELS.map((level) => (
            <TabsTrigger key={level} value={level}>
              {LEVEL_LABELS[level]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Grades Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gspn-maroon-500" />
        </div>
      ) : filteredGrades.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <School className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p>{t.admin.noDataFound}</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredGrades.map((grade) => {
            const { totalAssigned, totalRoomCapacity, unassigned } = getGradeTotals(grade)
            const hasUnassigned = unassigned > 0
            const activeRooms = grade.rooms.filter((r) => r.isActive)

            return (
              <Card key={grade.id} className="border shadow-sm overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {grade.name}
                          {grade.series && <Badge variant="outline">{grade.series}</Badge>}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          {getLevelBadge(grade.level)}
                          {grade.code && (
                            <span className="text-xs text-muted-foreground">{grade.code}</span>
                          )}
                        </CardDescription>
                      </div>
                    </div>
                    {/* Assign button in header - visible when there are unassigned students */}
                    {hasUnassigned && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={activeRooms.length === 0}
                        onClick={() => openAssignDialog(grade)}
                        title={activeRooms.length === 0 ? t.students.noRoomsConfigured : undefined}
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        {t.admin.assignStudents}
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-muted rounded p-2">
                      <div className="text-lg font-semibold">{grade._count.enrollments}</div>
                      <div className="text-xs text-muted-foreground">{t.admin.students}</div>
                    </div>
                    <div className="bg-muted rounded p-2">
                      <div className="text-lg font-semibold">{totalAssigned}</div>
                      <div className="text-xs text-muted-foreground">{t.students.assigned}</div>
                    </div>
                    <div className={`rounded p-2 ${hasUnassigned ? "bg-yellow-100 dark:bg-yellow-900/30" : "bg-muted"}`}>
                      <div className={`text-lg font-semibold ${hasUnassigned ? "text-yellow-600 dark:text-yellow-400" : ""}`}>
                        {unassigned}
                      </div>
                      <div className="text-xs text-muted-foreground">{t.students.unassigned}</div>
                    </div>
                  </div>

                  {/* Rooms */}
                  <Collapsible
                    open={expandedGrades.has(grade.id)}
                    onOpenChange={() => toggleGradeExpanded(grade.id)}
                  >
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="w-full justify-between">
                        <span className="flex items-center gap-2">
                          <DoorOpen className="h-4 w-4" />
                          {t.students.roomsAndStudents} ({activeRooms.length})
                        </span>
                        {expandedGrades.has(grade.id) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2 space-y-2">
                      {activeRooms.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-2">
                          {t.admin.noRoomsConfigured}
                        </p>
                      ) : (
                        activeRooms.map((room) => {
                          const isFull = room._count.studentAssignments >= room.capacity
                          const isNearFull =
                            room._count.studentAssignments / room.capacity >= 0.9

                          return (
                            <div
                              key={room.id}
                              className="flex items-center justify-between p-2 bg-muted rounded text-sm"
                            >
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{room.displayName}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">
                                  {room._count.studentAssignments}/{room.capacity}
                                </span>
                                {isFull && (
                                  <Badge variant="destructive" className="text-xs">
                                    {t.admin.roomFull}
                                  </Badge>
                                )}
                                {isNearFull && !isFull && (
                                  <Badge variant="secondary" className="text-xs">
                                    {t.admin.roomAssignments.roomNearCapacity}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )
                        })
                      )}

                      {/* Move Students Button - only shown when there are assigned students and multiple rooms */}
                      {totalAssigned > 0 && activeRooms.length > 1 && (
                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => openBulkMoveDialog(grade)}
                          >
                            <ArrowRightLeft className="h-3 w-3 mr-1" />
                            {t.admin.moveStudents}
                          </Button>
                        </div>
                      )}
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Subjects Preview */}
                  {grade.subjects.length > 0 && (
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">{t.admin.subjects}:</span>{" "}
                      {grade.subjects
                        .slice(0, 3)
                        .map((s) => (locale === "fr" ? s.subject.nameFr : s.subject.nameEn))
                        .join(", ")}
                      {grade.subjects.length > 3 && ` +${grade.subjects.length - 3}`}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Room Assignment Dialog */}
      {selectedGrade && (
        <RoomAssignmentDialog
          open={assignDialogOpen}
          onOpenChange={setAssignDialogOpen}
          gradeId={selectedGrade.id}
          gradeName={selectedGrade.name}
          schoolYearId={activeSchoolYear?.id || ""}
          rooms={selectedGrade.rooms}
          onSuccess={handleDialogSuccess}
        />
      )}

      {/* Bulk Move Dialog */}
      {selectedGrade && (
        <BulkMoveDialog
          open={bulkMoveDialogOpen}
          onOpenChange={setBulkMoveDialogOpen}
          gradeId={selectedGrade.id}
          gradeName={selectedGrade.name}
          schoolYearId={activeSchoolYear?.id || ""}
          rooms={selectedGrade.rooms}
          onSuccess={handleDialogSuccess}
        />
      )}

      {/* Auto-Assign Dialog */}
      {selectedGrade && (
        <AutoAssignDialog
          open={autoAssignDialogOpen}
          onOpenChange={setAutoAssignDialogOpen}
          gradeId={selectedGrade.id}
          gradeName={selectedGrade.name}
          schoolYearId={activeSchoolYear?.id || ""}
          rooms={selectedGrade.rooms}
          onSuccess={handleDialogSuccess}
        />
      )}
    </PageContainer>
  )
}
