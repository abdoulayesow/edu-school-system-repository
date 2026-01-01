"use client"

import { useState, useEffect, useMemo } from "react"
import { PageContainer } from "@/components/layout"
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { useI18n } from "@/components/i18n-provider"
import {
  Plus,
  School,
  Edit,
  Trash2,
  Loader2,
  Users,
  DoorOpen,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Power,
  PowerOff,
} from "lucide-react"

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

interface Subject {
  id: string
  code: string
  nameFr: string
  nameEn: string
  isOptional: boolean
}

const LEVELS = ["all", "kindergarten", "elementary", "college", "high_school"] as const
type Level = (typeof LEVELS)[number]

export default function GradesPage() {
  const { t, locale } = useI18n()

  const LEVEL_LABELS: Record<Level, string> = {
    all: t.common.all,
    kindergarten: t.admin.levelKindergarten,
    elementary: t.admin.levelElementary,
    college: t.admin.levelCollege,
    high_school: t.admin.levelHighSchool,
  }
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([])
  const [selectedYearId, setSelectedYearId] = useState<string>("")
  const [grades, setGrades] = useState<Grade[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const [selectedLevel, setSelectedLevel] = useState<Level>("all")
  const [expandedGrades, setExpandedGrades] = useState<Set<string>>(new Set())

  // Dialog states
  const [isGradeDialogOpen, setIsGradeDialogOpen] = useState(false)
  const [isRoomDialogOpen, setIsRoomDialogOpen] = useState(false)
  const [isSubjectDialogOpen, setIsSubjectDialogOpen] = useState(false)
  const [isDeleteGradeDialogOpen, setIsDeleteGradeDialogOpen] = useState(false)
  const [isDeleteRoomDialogOpen, setIsDeleteRoomDialogOpen] = useState(false)
  const [deleteRoomHasStudents, setDeleteRoomHasStudents] = useState<number>(0)
  const [deleteTargetRoomId, setDeleteTargetRoomId] = useState<string>("")

  // Form states
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const [gradeForm, setGradeForm] = useState({
    name: "",
    code: "",
    level: "college" as Grade["level"],
    order: 0,
    tuitionFee: 0,
    capacity: 70,
    series: "",
    isEnabled: true,
  })

  const [roomForm, setRoomForm] = useState({
    name: "",
    displayName: "",
    capacity: 35,
    isActive: true,
  })

  const [subjectForm, setSubjectForm] = useState({
    subjectId: "",
    coefficient: 1,
    hoursPerWeek: 2,
    series: "",
  })

  useEffect(() => {
    setIsMounted(true)
    fetchSchoolYears()
    fetchSubjects()
  }, [])

  useEffect(() => {
    if (selectedYearId) {
      fetchGrades()
    }
  }, [selectedYearId])

  async function fetchSchoolYears() {
    try {
      const res = await fetch("/api/admin/school-years")
      if (res.ok) {
        const data = await res.json()
        setSchoolYears(data)
        // Select the active year by default
        const activeYear = data.find((sy: SchoolYear) => sy.status === "active")
        if (activeYear) {
          setSelectedYearId(activeYear.id)
        } else if (data.length > 0) {
          setSelectedYearId(data[0].id)
        }
      }
    } catch (err) {
      console.error("Error fetching school years:", err)
    }
  }

  async function fetchGrades() {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/admin/grades?schoolYearId=${selectedYearId}`)
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

  async function fetchSubjects() {
    try {
      const res = await fetch("/api/admin/subjects")
      if (res.ok) {
        const data = await res.json()
        setSubjects(data)
      }
    } catch (err) {
      console.error("Error fetching subjects:", err)
    }
  }

  const filteredGrades = useMemo(() => {
    if (selectedLevel === "all") return grades
    return grades.filter((g) => g.level === selectedLevel)
  }, [grades, selectedLevel])

  const selectedSchoolYear = useMemo(
    () => schoolYears.find((sy) => sy.id === selectedYearId),
    [schoolYears, selectedYearId]
  )

  const canEdit = selectedSchoolYear?.status !== "passed"

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat("fr-GN", {
      style: "currency",
      currency: "GNF",
      minimumFractionDigits: 0,
    }).format(amount)
  }

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

  // Grade CRUD
  async function handleCreateGrade() {
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/admin/grades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...gradeForm,
          schoolYearId: selectedYearId,
          series: gradeForm.series || null,
        }),
      })
      if (res.ok) {
        setIsGradeDialogOpen(false)
        resetGradeForm()
        fetchGrades()
      } else {
        const data = await res.json()
        alert(data.message || "Failed to create grade")
      }
    } catch (err) {
      console.error("Error creating grade:", err)
      alert("Failed to create grade")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleUpdateGrade() {
    if (!selectedGrade) return
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/admin/grades/${selectedGrade.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...gradeForm,
          series: gradeForm.series || null,
        }),
      })
      if (res.ok) {
        setIsGradeDialogOpen(false)
        setSelectedGrade(null)
        setIsEditing(false)
        resetGradeForm()
        fetchGrades()
      } else {
        const data = await res.json()
        alert(data.message || "Failed to update grade")
      }
    } catch (err) {
      console.error("Error updating grade:", err)
      alert("Failed to update grade")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDeleteGrade() {
    if (!selectedGrade) return
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/admin/grades/${selectedGrade.id}`, {
        method: "DELETE",
      })
      if (res.ok) {
        setIsDeleteGradeDialogOpen(false)
        setSelectedGrade(null)
        fetchGrades()
      } else {
        const data = await res.json()
        alert(data.message || "Failed to delete grade")
      }
    } catch (err) {
      console.error("Error deleting grade:", err)
      alert("Failed to delete grade")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleToggleGrade(grade: Grade) {
    try {
      const res = await fetch(`/api/admin/grades/${grade.id}/toggle`, {
        method: "POST",
      })
      if (res.ok) {
        fetchGrades()
      } else {
        const data = await res.json()
        alert(data.message || "Failed to toggle grade")
      }
    } catch (err) {
      console.error("Error toggling grade:", err)
    }
  }

  function resetGradeForm() {
    setGradeForm({
      name: "",
      code: "",
      level: "college",
      order: 0,
      tuitionFee: 0,
      capacity: 70,
      series: "",
      isEnabled: true,
    })
  }

  function openEditGradeDialog(grade: Grade) {
    setSelectedGrade(grade)
    setGradeForm({
      name: grade.name,
      code: grade.code || "",
      level: grade.level,
      order: grade.order,
      tuitionFee: grade.tuitionFee,
      capacity: grade.capacity,
      series: grade.series || "",
      isEnabled: grade.isEnabled,
    })
    setIsEditing(true)
    setIsGradeDialogOpen(true)
  }

  // Room CRUD
  async function handleCreateRoom() {
    if (!selectedGrade) return
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/admin/grades/${selectedGrade.id}/rooms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(roomForm),
      })
      if (res.ok) {
        setIsRoomDialogOpen(false)
        resetRoomForm()
        fetchGrades()
      } else {
        const data = await res.json()
        alert(data.message || "Failed to create room")
      }
    } catch (err) {
      console.error("Error creating room:", err)
      alert("Failed to create room")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleUpdateRoom() {
    if (!selectedGrade || !selectedRoom) return
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/admin/grades/${selectedGrade.id}/rooms/${selectedRoom.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(roomForm),
      })
      if (res.ok) {
        setIsRoomDialogOpen(false)
        setSelectedRoom(null)
        setIsEditing(false)
        resetRoomForm()
        fetchGrades()
      } else {
        const data = await res.json()
        alert(data.message || "Failed to update room")
      }
    } catch (err) {
      console.error("Error updating room:", err)
      alert("Failed to update room")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDeleteRoom(targetRoomId?: string, removeAssignments?: boolean) {
    if (!selectedGrade || !selectedRoom) return
    setIsSubmitting(true)
    try {
      // Build query params for reassignment options
      const params = new URLSearchParams()
      if (targetRoomId) params.set("targetRoomId", targetRoomId)
      if (removeAssignments) params.set("removeAssignments", "true")
      const queryString = params.toString() ? `?${params.toString()}` : ""

      const res = await fetch(
        `/api/admin/grades/${selectedGrade.id}/rooms/${selectedRoom.id}${queryString}`,
        { method: "DELETE" }
      )

      const data = await res.json()

      if (res.ok) {
        setIsDeleteRoomDialogOpen(false)
        setSelectedRoom(null)
        setDeleteRoomHasStudents(0)
        setDeleteTargetRoomId("")
        fetchGrades()
      } else if (data.requiresAction && data.studentCount) {
        // Room has students - show reassignment options
        setDeleteRoomHasStudents(data.studentCount)
      } else {
        alert(data.message || "Failed to delete room")
      }
    } catch (err) {
      console.error("Error deleting room:", err)
      alert("Failed to delete room")
    } finally {
      setIsSubmitting(false)
    }
  }

  function resetRoomForm() {
    setRoomForm({
      name: "",
      displayName: "",
      capacity: 35,
      isActive: true,
    })
  }

  function openAddRoomDialog(grade: Grade) {
    setSelectedGrade(grade)
    resetRoomForm()
    setIsEditing(false)
    setIsRoomDialogOpen(true)
  }

  function openEditRoomDialog(grade: Grade, room: Room) {
    setSelectedGrade(grade)
    setSelectedRoom(room)
    setRoomForm({
      name: room.name,
      displayName: room.displayName,
      capacity: room.capacity,
      isActive: room.isActive,
    })
    setIsEditing(true)
    setIsRoomDialogOpen(true)
  }

  // Subject Assignment
  async function handleAssignSubject() {
    if (!selectedGrade) return
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/admin/grades/${selectedGrade.id}/subjects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...subjectForm,
          series: subjectForm.series || null,
        }),
      })
      if (res.ok) {
        setIsSubjectDialogOpen(false)
        resetSubjectForm()
        fetchGrades()
      } else {
        const data = await res.json()
        alert(data.message || "Failed to assign subject")
      }
    } catch (err) {
      console.error("Error assigning subject:", err)
      alert("Failed to assign subject")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleRemoveSubject(gradeId: string, subjectId: string) {
    if (!confirm("Are you sure you want to remove this subject?")) return
    try {
      const res = await fetch(`/api/admin/grades/${gradeId}/subjects?subjectId=${subjectId}`, {
        method: "DELETE",
      })
      if (res.ok) {
        fetchGrades()
      } else {
        const data = await res.json()
        alert(data.message || "Failed to remove subject")
      }
    } catch (err) {
      console.error("Error removing subject:", err)
    }
  }

  function resetSubjectForm() {
    setSubjectForm({
      subjectId: "",
      coefficient: 1,
      hoursPerWeek: 2,
      series: "",
    })
  }

  function openSubjectDialog(grade: Grade) {
    setSelectedGrade(grade)
    resetSubjectForm()
    setIsSubjectDialogOpen(true)
  }

  if (!isMounted) {
    return (
      <PageContainer maxWidth="full">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer maxWidth="full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">{t.admin.gradesRoomsTitle}</h1>
          <p className="text-muted-foreground">{t.admin.gradesRoomsSubtitle}</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedYearId} onValueChange={setSelectedYearId}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder={t.admin.selectSchoolYear} />
            </SelectTrigger>
            <SelectContent>
              {schoolYears.map((sy) => (
                <SelectItem key={sy.id} value={sy.id}>
                  {sy.name}
                  {sy.status === "active" && " (Active)"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {canEdit && (
            <Button
              onClick={() => {
                resetGradeForm()
                setIsEditing(false)
                setSelectedGrade(null)
                setIsGradeDialogOpen(true)
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              {t.admin.addGrade}
            </Button>
          )}
        </div>
      </div>

      {/* Level Filter */}
      <Tabs value={selectedLevel} onValueChange={(v) => setSelectedLevel(v as Level)} className="mb-6">
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
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredGrades.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <School className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p>{t.admin.noDataFound}</p>
          {canEdit && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                resetGradeForm()
                setIsEditing(false)
                setSelectedGrade(null)
                setIsGradeDialogOpen(true)
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              {t.admin.addGrade}
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredGrades.map((grade) => (
            <Card key={grade.id} className={!grade.isEnabled ? "opacity-60" : ""}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {grade.name}
                      {grade.series && (
                        <Badge variant="outline">{grade.series}</Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      {getLevelBadge(grade.level)}
                      {grade.code && (
                        <span className="text-xs text-muted-foreground">
                          {grade.code}
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  {canEdit && (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleGrade(grade)}
                        title={grade.isEnabled ? t.admin.disableGrade : t.admin.enableGrade}
                      >
                        {grade.isEnabled ? (
                          <Power className="h-4 w-4 text-green-500" />
                        ) : (
                          <PowerOff className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditGradeDialog(grade)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {grade._count.enrollments === 0 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedGrade(grade)
                            setIsDeleteGradeDialogOpen(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
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
                    <div className="text-lg font-semibold">{grade.rooms.length}</div>
                    <div className="text-xs text-muted-foreground">{t.admin.rooms}</div>
                  </div>
                  <div className="bg-muted rounded p-2">
                    <div className="text-lg font-semibold">{grade.subjects.length}</div>
                    <div className="text-xs text-muted-foreground">{t.admin.subjects}</div>
                  </div>
                </div>

                {/* Tuition */}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t.admin.tuitionFee}:</span>
                  <span className="font-medium">{formatCurrency(grade.tuitionFee)}</span>
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
                        {t.admin.manageRooms} ({grade.rooms.length})
                      </span>
                      {expandedGrades.has(grade.id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2 space-y-2">
                    {/* Capacity Tracker */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/50 rounded p-2">
                      <span>{t.admin.gradeCapacity}: {grade.capacity}</span>
                      <span>
                        {t.admin.allocated}: {grade.rooms.reduce((sum, r) => sum + r.capacity, 0)}/{grade.capacity}
                      </span>
                      <span className={grade.rooms.reduce((sum, r) => sum + r.capacity, 0) >= grade.capacity ? "text-destructive" : "text-green-600"}>
                        {t.admin.available}: {grade.capacity - grade.rooms.reduce((sum, r) => sum + r.capacity, 0)}
                      </span>
                    </div>
                    {grade.rooms.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-2">
                        {t.admin.noRoomsConfigured}
                      </p>
                    ) : (
                      grade.rooms.map((room) => (
                        <div
                          key={room.id}
                          className="flex items-center justify-between p-2 bg-muted rounded text-sm"
                        >
                          <div>
                            <span className="font-medium">{room.displayName}</span>
                            <span className="text-muted-foreground ml-2">
                              {room._count.studentAssignments}/{room.capacity}
                            </span>
                            {room._count.studentAssignments >= room.capacity && (
                              <Badge variant="destructive" className="ml-2 text-xs">
                                {t.admin.roomFull}
                              </Badge>
                            )}
                          </div>
                          {canEdit && (
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => openEditRoomDialog(grade, room)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              {room._count.studentAssignments === 0 && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => {
                                    setSelectedGrade(grade)
                                    setSelectedRoom(room)
                                    setIsDeleteRoomDialogOpen(true)
                                  }}
                                >
                                  <Trash2 className="h-3 w-3 text-destructive" />
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                    <div className="flex gap-2">
                      {canEdit && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => openAddRoomDialog(grade)}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          {t.admin.addRoom}
                        </Button>
                      )}
                                          </div>
                  </CollapsibleContent>
                </Collapsible>
              </CardContent>
              <CardFooter className="pt-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => openSubjectDialog(grade)}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  {t.admin.manageSubjects} ({grade.subjects.length})
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Grade Dialog */}
      <Dialog open={isGradeDialogOpen} onOpenChange={setIsGradeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? t.admin.editGrade : t.admin.addGrade}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="grade-name">{t.admin.gradeName}</Label>
                <Input
                  id="grade-name"
                  value={gradeForm.name}
                  onChange={(e) => setGradeForm({ ...gradeForm, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="grade-code">{t.admin.gradeCode}</Label>
                <Input
                  id="grade-code"
                  value={gradeForm.code}
                  onChange={(e) => setGradeForm({ ...gradeForm, code: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="grade-level">{t.admin.gradeLevel}</Label>
                <Select
                  value={gradeForm.level}
                  onValueChange={(v) => setGradeForm({ ...gradeForm, level: v as Grade["level"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kindergarten">{t.admin.levelKindergarten}</SelectItem>
                    <SelectItem value="elementary">{t.admin.levelElementary}</SelectItem>
                    <SelectItem value="college">{t.admin.levelCollege}</SelectItem>
                    <SelectItem value="high_school">{t.admin.levelHighSchool}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="grade-order">{t.admin.order}</Label>
                <Input
                  id="grade-order"
                  type="number"
                  value={gradeForm.order}
                  onChange={(e) => setGradeForm({ ...gradeForm, order: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            {gradeForm.level === "high_school" && (
              <div className="grid gap-2">
                <Label htmlFor="grade-series">{t.admin.gradeSeries}</Label>
                <Select
                  value={gradeForm.series || "none"}
                  onValueChange={(v) => setGradeForm({ ...gradeForm, series: v === "none" ? "" : v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t.admin.selectSeriesOptional} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t.admin.none}</SelectItem>
                    <SelectItem value="SM">{t.admin.seriesSM}</SelectItem>
                    <SelectItem value="SS">{t.admin.seriesSS}</SelectItem>
                    <SelectItem value="SE">{t.admin.seriesSE}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="grade-tuition">{t.admin.tuitionFee} (GNF)</Label>
                <Input
                  id="grade-tuition"
                  type="number"
                  value={gradeForm.tuitionFee}
                  onChange={(e) => setGradeForm({ ...gradeForm, tuitionFee: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="grade-capacity">{t.admin.gradeCapacity}</Label>
                <Input
                  id="grade-capacity"
                  type="number"
                  value={gradeForm.capacity}
                  onChange={(e) => setGradeForm({ ...gradeForm, capacity: parseInt(e.target.value) || 70 })}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="grade-enabled"
                checked={gradeForm.isEnabled}
                onCheckedChange={(checked) => setGradeForm({ ...gradeForm, isEnabled: checked })}
              />
              <Label htmlFor="grade-enabled">{t.admin.enabledForEnrollment}</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGradeDialogOpen(false)}>
              {t.common.cancel}
            </Button>
            <Button onClick={isEditing ? handleUpdateGrade : handleCreateGrade} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t.common.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Room Dialog */}
      <Dialog open={isRoomDialogOpen} onOpenChange={setIsRoomDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? t.admin.editRoom : t.admin.addRoom}
            </DialogTitle>
            <DialogDescription>
              {selectedGrade?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="room-name">{t.admin.roomName}</Label>
                <Input
                  id="room-name"
                  placeholder={t.admin.roomNamePlaceholder}
                  value={roomForm.name}
                  onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="room-display">{t.admin.roomDisplayName}</Label>
                <Input
                  id="room-display"
                  placeholder={t.admin.roomDisplayNamePlaceholder}
                  value={roomForm.displayName}
                  onChange={(e) => setRoomForm({ ...roomForm, displayName: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="room-capacity">{t.admin.roomCapacity}</Label>
              <Input
                id="room-capacity"
                type="number"
                value={roomForm.capacity}
                onChange={(e) => setRoomForm({ ...roomForm, capacity: parseInt(e.target.value) || 35 })}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="room-active"
                checked={roomForm.isActive}
                onCheckedChange={(checked) => setRoomForm({ ...roomForm, isActive: checked })}
              />
              <Label htmlFor="room-active">{t.admin.active}</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRoomDialogOpen(false)}>
              {t.common.cancel}
            </Button>
            <Button onClick={isEditing ? handleUpdateRoom : handleCreateRoom} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t.common.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Subject Assignment Dialog */}
      <Dialog open={isSubjectDialogOpen} onOpenChange={setIsSubjectDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t.admin.manageSubjects}</DialogTitle>
            <DialogDescription>
              {selectedGrade?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {/* Current Subjects */}
            {selectedGrade && selectedGrade.subjects.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-medium mb-2">{t.admin.assignedSubjects}</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedGrade.subjects.map((gs) => (
                    <div
                      key={gs.id}
                      className="flex items-center justify-between p-2 bg-muted rounded text-sm"
                    >
                      <div>
                        <span className="font-medium">
                          {locale === "fr" ? gs.subject.nameFr : gs.subject.nameEn}
                        </span>
                        <span className="text-muted-foreground ml-2">
                          ({gs.subject.code})
                        </span>
                        <span className="text-muted-foreground ml-2">
                          {t.admin.coefficientShort}: {gs.coefficient}
                        </span>
                        {gs.hoursPerWeek && (
                          <span className="text-muted-foreground ml-2">
                            {gs.hoursPerWeek}{t.admin.hoursPerWeekShort}
                          </span>
                        )}
                      </div>
                      {canEdit && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleRemoveSubject(selectedGrade.id, gs.subject.id)}
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add New Subject */}
            {canEdit && (
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium mb-2">{t.admin.addSubject}</h4>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label>{t.admin.subjects}</Label>
                    <Select
                      value={subjectForm.subjectId}
                      onValueChange={(v) => setSubjectForm({ ...subjectForm, subjectId: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t.admin.selectTeacher} />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects
                          .filter((s) => !selectedGrade?.subjects.some((gs) => gs.subject.id === s.id))
                          .map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {locale === "fr" ? s.nameFr : s.nameEn} ({s.code})
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>{t.admin.coefficient}</Label>
                      <Input
                        type="number"
                        value={subjectForm.coefficient}
                        onChange={(e) => setSubjectForm({ ...subjectForm, coefficient: parseInt(e.target.value) || 1 })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>{t.admin.hoursWeek}</Label>
                      <Input
                        type="number"
                        value={subjectForm.hoursPerWeek}
                        onChange={(e) => setSubjectForm({ ...subjectForm, hoursPerWeek: parseInt(e.target.value) || 2 })}
                      />
                    </div>
                  </div>
                  <Button onClick={handleAssignSubject} disabled={isSubmitting || !subjectForm.subjectId}>
                    {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {t.admin.addSubject}
                  </Button>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSubjectDialogOpen(false)}>
              {t.common.close}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Grade Confirmation */}
      <AlertDialog open={isDeleteGradeDialogOpen} onOpenChange={setIsDeleteGradeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.admin.deleteGrade}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.admin.deleteGradeConfirmation}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteGrade}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t.common.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Room Confirmation */}
      <AlertDialog
        open={isDeleteRoomDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteRoomDialogOpen(open)
          if (!open) {
            setDeleteRoomHasStudents(0)
            setDeleteTargetRoomId("")
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.admin.confirmDeleteRoom}</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteRoomHasStudents > 0 ? (
                <span>
                  {t.admin.deleteRoomWithStudents.replace("{count}", String(deleteRoomHasStudents))}
                </span>
              ) : (
                t.admin.deleteGradeConfirmation
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {/* Show reassignment options if room has students */}
          {deleteRoomHasStudents > 0 && selectedGrade && selectedRoom && (
            <div className="py-4">
              <Select value={deleteTargetRoomId} onValueChange={setDeleteTargetRoomId}>
                <SelectTrigger>
                  <SelectValue placeholder={t.admin.targetRoom} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__remove__">{t.admin.removeAllAssignments}</SelectItem>
                  {selectedGrade.rooms
                    .filter((r) => r.id !== selectedRoom.id && r.isActive)
                    .map((room) => {
                      const availableCapacity = room.capacity - room._count.studentAssignments
                      const canFitAll = availableCapacity >= deleteRoomHasStudents
                      return (
                        <SelectItem
                          key={room.id}
                          value={room.id}
                          disabled={!canFitAll}
                        >
                          {room.displayName} ({room._count.studentAssignments}/{room.capacity})
                          {!canFitAll && " - Insufficient capacity"}
                        </SelectItem>
                      )
                    })}
                </SelectContent>
              </Select>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
            {deleteRoomHasStudents > 0 ? (
              <AlertDialogAction
                onClick={() => {
                  if (deleteTargetRoomId === "__remove__") {
                    handleDeleteRoom(undefined, true)
                  } else if (deleteTargetRoomId) {
                    handleDeleteRoom(deleteTargetRoomId)
                  }
                }}
                disabled={isSubmitting || !deleteTargetRoomId}
                className="bg-destructive text-destructive-foreground"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {t.admin.moveAndDelete}
              </AlertDialogAction>
            ) : (
              <AlertDialogAction
                onClick={() => handleDeleteRoom()}
                disabled={isSubmitting}
                className="bg-destructive text-destructive-foreground"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {t.common.delete}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      </PageContainer>
  )
}
