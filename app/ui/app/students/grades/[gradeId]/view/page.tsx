"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams, useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { useI18n } from "@/components/i18n-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { PermissionGuard } from "@/components/permission-guard"
import { PageContainer } from "@/components/layout"
import {
  ArrowLeft,
  Users,
  RefreshCw,
  MoreVertical,
  ArrowRightLeft,
  UserMinus,
  ClipboardCheck,
  GripVertical,
  ChevronDown,
} from "lucide-react"
import { AttendanceDialog } from "@/components/attendance/attendance-dialog"

interface Student {
  id: string
  firstName: string
  lastName: string
  studentNumber?: string
  gender?: string
  dateOfBirth?: string
  photoUrl?: string
  assignedAt?: string
  assignmentId?: string
  enrolledAt?: string
}

interface Room {
  id: string
  name: string
  displayName: string
  capacity: number
  students: Student[]
}

interface GradeData {
  grade: {
    id: string
    name: string
    level: "kindergarten" | "elementary" | "college" | "high_school"
    capacity: number
  }
  rooms: Room[]
  unassignedStudents: Student[]
  stats: {
    totalEnrolled: number
    totalAssigned: number
    totalUnassigned: number
    totalCapacity: number
    roomUtilization: number
  }
}

const LEVEL_BADGE_COLORS: Record<string, string> = {
  kindergarten: "bg-gspn-maroon-100 text-gspn-maroon-700 dark:bg-gspn-maroon-900/30 dark:text-gspn-maroon-300",
  elementary: "bg-gspn-gold-100 text-gspn-gold-700 dark:bg-gspn-gold-900/30 dark:text-gspn-gold-300",
  college: "bg-gspn-maroon-100 text-gspn-maroon-700 dark:bg-gspn-maroon-900/30 dark:text-gspn-maroon-300",
  high_school: "bg-gspn-gold-100 text-gspn-gold-700 dark:bg-gspn-gold-900/30 dark:text-gspn-gold-300",
}

export default function GradeViewPage() {
  const { t } = useI18n()
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const schoolYearId = searchParams.get("schoolYearId") || ""
  const gradeId = params.gradeId as string
  const { toast } = useToast()

  const LEVEL_LABELS: Record<string, string> = {
    kindergarten: t.admin.levelKindergarten,
    elementary: t.admin.levelElementary,
    college: t.admin.levelCollege,
    high_school: t.admin.levelHighSchool,
  }

  const [data, setData] = useState<GradeData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRoomId, setSelectedRoomId] = useState<string>("all")
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set())
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [attendanceDialogOpen, setAttendanceDialogOpen] = useState(false)
  const [selectedRoomForAttendance, setSelectedRoomForAttendance] = useState<Room | null>(null)
  const [draggedStudent, setDraggedStudent] = useState<Student | null>(null)
  const [studentToRemove, setStudentToRemove] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!schoolYearId) return

    try {
      setIsRefreshing(true)
      const res = await fetch(
        `/api/admin/grades/${gradeId}/room-view?schoolYearId=${schoolYearId}`
      )
      if (res.ok) {
        const result = await res.json()
        setData(result)
        setError(null)
      } else {
        setError(t.admin.roomAssignments.fetchError)
      }
    } catch {
      setError(t.admin.roomAssignments.fetchError)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [gradeId, schoolYearId, t.admin.roomAssignments.fetchError])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleStudentSelect = (studentId: string) => {
    setSelectedStudents(prev => {
      const next = new Set(prev)
      if (next.has(studentId)) {
        next.delete(studentId)
      } else {
        next.add(studentId)
      }
      return next
    })
  }

  const handleSelectAll = (roomId: string) => {
    const room = data?.rooms.find(r => r.id === roomId)
    if (!room) return

    setSelectedStudents(prev => {
      const next = new Set(prev)
      const allSelected = room.students.every(s => prev.has(s.id))
      if (allSelected) {
        room.students.forEach(s => next.delete(s.id))
      } else {
        room.students.forEach(s => next.add(s.id))
      }
      return next
    })
  }

  const handleMoveStudent = async (studentId: string, targetRoomId: string) => {
    try {
      const res = await fetch("/api/admin/room-assignments/bulk-move", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentProfileIds: [studentId],
          targetRoomId,
          schoolYearId,
        }),
      })

      if (res.ok) {
        toast({ title: t.admin.roomAssignments.bulkMoveSuccess.replace("{count}", "1") })
        fetchData()
        setSelectedStudents(new Set())
      } else {
        toast({ variant: "destructive", title: t.common.error, description: t.admin.roomAssignments.reassignError })
      }
    } catch {
      toast({ variant: "destructive", title: t.common.error, description: t.admin.roomAssignments.reassignError })
    }
  }

  const handleBulkMove = async (targetRoomId: string) => {
    if (selectedStudents.size === 0) return

    try {
      const res = await fetch("/api/admin/room-assignments/bulk-move", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentProfileIds: Array.from(selectedStudents),
          targetRoomId,
          schoolYearId,
        }),
      })

      if (res.ok) {
        toast({ title: t.admin.roomAssignments.bulkMoveSuccess.replace("{count}", String(selectedStudents.size)) })
        fetchData()
        setSelectedStudents(new Set())
      } else {
        toast({ variant: "destructive", title: t.common.error, description: t.admin.roomAssignments.reassignError })
      }
    } catch {
      toast({ variant: "destructive", title: t.common.error, description: t.admin.roomAssignments.reassignError })
    }
  }

  const handleAssignStudent = async (studentId: string, roomId: string) => {
    try {
      const res = await fetch("/api/admin/room-assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignments: [
            {
              studentProfileId: studentId,
              gradeRoomId: roomId,
            },
          ],
          schoolYearId,
        }),
      })

      if (res.ok) {
        toast({ title: t.admin.roomAssignments.assignmentSuccess.replace("{count}", "1") })
        fetchData()
      } else {
        toast({ variant: "destructive", title: t.common.error, description: t.admin.roomAssignments.assignmentError })
      }
    } catch {
      toast({ variant: "destructive", title: t.common.error, description: t.admin.roomAssignments.assignmentError })
    }
  }

  const handleRemoveAssignment = async (studentId: string) => {
    // Find the assignment ID
    let assignmentId: string | null = null
    data?.rooms.forEach(room => {
      const student = room.students.find(s => s.id === studentId)
      if (student?.assignmentId) {
        assignmentId = student.assignmentId
      }
    })

    if (!assignmentId) return

    try {
      const res = await fetch(`/api/admin/room-assignments/${assignmentId}`, {
        method: "DELETE",
      })

      if (res.ok) {
        toast({ title: t.admin.roomAssignments.bulkRemoveSuccess.replace("{count}", "1") })
        fetchData()
        setSelectedStudents(prev => {
          const next = new Set(prev)
          next.delete(studentId)
          return next
        })
      } else {
        toast({ variant: "destructive", title: t.common.error, description: t.admin.roomAssignments.reassignError })
      }
    } catch {
      toast({ variant: "destructive", title: t.common.error, description: t.admin.roomAssignments.reassignError })
    }
  }

  const handleDragStart = (student: Student) => {
    setDraggedStudent(student)
  }

  const handleDragEnd = () => {
    setDraggedStudent(null)
  }

  const handleDrop = (targetRoomId: string) => {
    if (!draggedStudent) return

    // Check if student is unassigned or from another room
    const isUnassigned = data?.unassignedStudents.some(s => s.id === draggedStudent.id)

    if (isUnassigned) {
      handleAssignStudent(draggedStudent.id, targetRoomId)
    } else {
      handleMoveStudent(draggedStudent.id, targetRoomId)
    }

    setDraggedStudent(null)
  }

  const openAttendanceDialog = (room: Room) => {
    setSelectedRoomForAttendance(room)
    setAttendanceDialogOpen(true)
  }

  const filteredRooms = data?.rooms.filter(
    room => selectedRoomId === "all" || room.id === selectedRoomId
  ) || []

  if (!schoolYearId) {
    return (
      <PageContainer maxWidth="full">
        <div className="text-center text-muted-foreground">
          {t.admin.roomAssignments.fetchError}
        </div>
      </PageContainer>
    )
  }

  if (isLoading) {
    return (
      <PageContainer maxWidth="full">
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
            </div>
            <Skeleton className="h-96" />
          </div>
        </div>
      </PageContainer>
    )
  }

  if (error || !data) {
    return (
      <PageContainer maxWidth="full">
        <div className="text-center text-destructive">{error || t.admin.roomAssignments.fetchError}</div>
      </PageContainer>
    )
  }

  return (
    <PageContainer maxWidth="full">
      {/* Header */}
      <div className="relative mb-6 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="h-1 bg-gspn-maroon-500" />
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/students/grades">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div className="p-2.5 bg-gspn-maroon-500/10 rounded-xl">
                <Users className="h-6 w-6 text-gspn-maroon-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  {data.grade.name}
                  <Badge className={LEVEL_BADGE_COLORS[data.grade.level] || ""}>
                    {LEVEL_LABELS[data.grade.level] || data.grade.level}
                  </Badge>
                </h1>
                <p className="text-muted-foreground">
                  {t.admin.roomAssignments.viewGrade}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchData}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                {isRefreshing ? t.common.loading : t.common.refresh}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border shadow-sm overflow-hidden">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold font-mono tabular-nums">{data.stats.totalEnrolled}</div>
            <div className="text-sm text-muted-foreground">{t.admin.students}</div>
          </CardContent>
        </Card>
        <Card className="border shadow-sm overflow-hidden">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">{data.stats.totalAssigned}</div>
            <div className="text-sm text-muted-foreground">{t.students.assigned}</div>
          </CardContent>
        </Card>
        <Card className="border shadow-sm overflow-hidden">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold font-mono tabular-nums text-amber-600 dark:text-amber-400">{data.stats.totalUnassigned}</div>
            <div className="text-sm text-muted-foreground">{t.students.unassigned}</div>
          </CardContent>
        </Card>
        <Card className="border shadow-sm overflow-hidden">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold font-mono tabular-nums">{data.stats.roomUtilization}%</div>
            <div className="text-sm text-muted-foreground">{t.admin.roomAssignments.roomUtilization}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4">
        <Select value={selectedRoomId} onValueChange={setSelectedRoomId}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder={t.admin.roomAssignments.filterByRoom} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.admin.roomAssignments.allRooms}</SelectItem>
            {data.rooms.map(room => (
              <SelectItem key={room.id} value={room.id}>
                {room.displayName || room.name} ({room.students.length}/{room.capacity})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedStudents.size > 0 && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{t.admin.roomAssignments.selectedCount.replace("{count}", String(selectedStudents.size))}</Badge>
            <PermissionGuard resource="schedule" action="create" inline>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    {t.admin.roomAssignments.moveToRoom}
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {data.rooms.map(room => (
                    <DropdownMenuItem
                      key={room.id}
                      onClick={() => handleBulkMove(room.id)}
                    >
                      {room.displayName || room.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </PermissionGuard>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedStudents(new Set())}
            >
              {t.common.clear}
            </Button>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rooms (2/3 width) */}
        <div className="lg:col-span-2 space-y-4">
          {filteredRooms.map(room => (
            <Card
              key={room.id}
              className={`border shadow-sm overflow-hidden transition-colors ${draggedStudent ? "border-dashed border-2" : ""}`}
              onDragOver={e => e.preventDefault()}
              onDrop={() => handleDrop(room.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
                    {room.displayName || room.name}
                    <Badge variant={room.students.length >= room.capacity ? "destructive" : "secondary"}>
                      {room.students.length}/{room.capacity}
                    </Badge>
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <PermissionGuard resource="attendance" action="create" inline>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openAttendanceDialog(room)}
                      >
                        <ClipboardCheck className="h-4 w-4 mr-2" />
                        {t.admin.roomAssignments.takeAttendance}
                      </Button>
                    </PermissionGuard>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSelectAll(room.id)}
                    >
                      {room.students.every(s => selectedStudents.has(s.id))
                        ? t.admin.roomAssignments.deselectAll
                        : t.admin.roomAssignments.selectAll}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {room.students.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {t.admin.roomAssignments.dropStudentHere}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {room.students.map(student => (
                      <div
                        key={student.id}
                        className="flex items-center justify-between p-2 rounded hover:bg-muted/50 group"
                        draggable
                        onDragStart={() => handleDragStart(student)}
                        onDragEnd={handleDragEnd}
                      >
                        <div className="flex items-center gap-3">
                          <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                          <Checkbox
                            checked={selectedStudents.has(student.id)}
                            onCheckedChange={() => handleStudentSelect(student.id)}
                          />
                          <div>
                            <div className="font-medium">
                              {student.firstName} {student.lastName}
                            </div>
                            {student.studentNumber && (
                              <div className="text-sm text-muted-foreground">
                                {student.studentNumber}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <PermissionGuard resource="schedule" action="create" inline>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => {
                                    // Show room selection for move
                                    setSelectedStudents(new Set([student.id]))
                                  }}
                                >
                                  <ArrowRightLeft className="h-4 w-4 mr-2" />
                                  {t.admin.roomAssignments.moveStudent}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => setStudentToRemove(student.id)}
                                >
                                  <UserMinus className="h-4 w-4 mr-2" />
                                  {t.admin.roomAssignments.removeStudent}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </PermissionGuard>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Unassigned students (1/3 width) */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4 border shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
                {t.admin.roomAssignments.unassignedStudentsPanel}
                <Badge variant="secondary">{data.unassignedStudents.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.unassignedStudents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {t.admin.roomAssignments.noUnassignedStudents}
                </div>
              ) : (
                <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                  {data.unassignedStudents.map(student => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-2 rounded hover:bg-muted/50 cursor-grab"
                      draggable
                      onDragStart={() => handleDragStart(student)}
                      onDragEnd={handleDragEnd}
                    >
                      <div className="flex items-center gap-3">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">
                            {student.firstName} {student.lastName}
                          </div>
                          {student.studentNumber && (
                            <div className="text-sm text-muted-foreground">
                              {student.studentNumber}
                            </div>
                          )}
                        </div>
                      </div>

                      <PermissionGuard resource="schedule" action="create" inline>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {data.rooms.map(room => (
                              <DropdownMenuItem
                                key={room.id}
                                onClick={() => handleAssignStudent(student.id, room.id)}
                                disabled={room.students.length >= room.capacity}
                              >
                                {t.admin.roomAssignments.assignToRoomName.replace("{roomName}", room.displayName || room.name)}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </PermissionGuard>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Remove Assignment Confirmation */}
      <AlertDialog open={!!studentToRemove} onOpenChange={(open) => !open && setStudentToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.common.confirmRemove}</AlertDialogTitle>
            <AlertDialogDescription>{t.admin.roomAssignments.confirmRemoveAssignment}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (studentToRemove) { handleRemoveAssignment(studentToRemove); setStudentToRemove(null) } }}>
              {t.admin.roomAssignments.removeStudent}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Attendance Dialog */}
      <AttendanceDialog
        open={attendanceDialogOpen}
        onOpenChange={setAttendanceDialogOpen}
        room={selectedRoomForAttendance}
        gradeId={gradeId}
        schoolYearId={schoolYearId}
        onSuccess={fetchData}
      />
    </PageContainer>
  )
}
