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
import { Skeleton } from "@/components/ui/skeleton"
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
    level: string
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

export default function GradeViewPage() {
  const { t } = useI18n()
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const schoolYearId = searchParams.get("schoolYearId") || ""
  const gradeId = params.gradeId as string

  const [data, setData] = useState<GradeData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRoomId, setSelectedRoomId] = useState<string>("all")
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set())
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [attendanceDialogOpen, setAttendanceDialogOpen] = useState(false)
  const [selectedRoomForAttendance, setSelectedRoomForAttendance] = useState<Room | null>(null)
  const [draggedStudent, setDraggedStudent] = useState<Student | null>(null)

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
        setError("Failed to load grade data")
      }
    } catch {
      setError("Failed to load grade data")
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [gradeId, schoolYearId])

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
        fetchData()
        setSelectedStudents(new Set())
      }
    } catch (err) {
      console.error("Failed to move student:", err)
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
        fetchData()
        setSelectedStudents(new Set())
      }
    } catch (err) {
      console.error("Failed to bulk move:", err)
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
        fetchData()
      }
    } catch (err) {
      console.error("Failed to assign student:", err)
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
        fetchData()
        setSelectedStudents(prev => {
          const next = new Set(prev)
          next.delete(studentId)
          return next
        })
      }
    } catch (err) {
      console.error("Failed to remove assignment:", err)
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
      <div className="container mx-auto py-6">
        <div className="text-center text-muted-foreground">
          School year ID is required
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center text-destructive">{error || "Failed to load data"}</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
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
                  <Badge variant="outline">{data.grade.level}</Badge>
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
                {isRefreshing ? t.common.loading : "Refresh"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border shadow-sm overflow-hidden">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{data.stats.totalEnrolled}</div>
            <div className="text-sm text-muted-foreground">{t.admin.students}</div>
          </CardContent>
        </Card>
        <Card className="border shadow-sm overflow-hidden">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">{data.stats.totalAssigned}</div>
            <div className="text-sm text-muted-foreground">Assigned</div>
          </CardContent>
        </Card>
        <Card className="border shadow-sm overflow-hidden">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-orange-600">{data.stats.totalUnassigned}</div>
            <div className="text-sm text-muted-foreground">Unassigned</div>
          </CardContent>
        </Card>
        <Card className="border shadow-sm overflow-hidden">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{data.stats.roomUtilization}%</div>
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
            <Badge variant="secondary">{selectedStudents.size} selected</Badge>
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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedStudents(new Set())}
            >
              Clear
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openAttendanceDialog(room)}
                    >
                      <ClipboardCheck className="h-4 w-4 mr-2" />
                      {t.admin.roomAssignments.takeAttendance}
                    </Button>
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
                                onClick={() => handleRemoveAssignment(student.id)}
                              >
                                <UserMinus className="h-4 w-4 mr-2" />
                                {t.admin.roomAssignments.removeStudent}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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
                              Assign to {room.displayName || room.name}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Attendance Dialog */}
      <AttendanceDialog
        open={attendanceDialogOpen}
        onOpenChange={setAttendanceDialogOpen}
        room={selectedRoomForAttendance}
        gradeId={gradeId}
        schoolYearId={schoolYearId}
        onSuccess={fetchData}
      />
    </div>
  )
}
