"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
import { Loader2, Users, AlertTriangle, ArrowRight } from "lucide-react"

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

interface StudentInRoom {
  id: string
  studentProfileId: string
  studentProfile: {
    id: string
    person: {
      firstName: string
      lastName: string
    }
    studentNumber?: string
  }
}

interface BulkMoveDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  gradeId: string
  gradeName: string
  schoolYearId: string
  rooms: Room[]
  onSuccess: () => void
}

export function BulkMoveDialog({
  open,
  onOpenChange,
  gradeId,
  gradeName,
  schoolYearId,
  rooms,
  onSuccess,
}: BulkMoveDialogProps) {
  const { t } = useI18n()
  const [sourceRoomId, setSourceRoomId] = useState<string>("")
  const [targetRoomId, setTargetRoomId] = useState<string>("")
  const [studentsInRoom, setStudentsInRoom] = useState<StudentInRoom[]>([])
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get selected rooms
  const sourceRoom = useMemo(
    () => rooms.find((r) => r.id === sourceRoomId),
    [rooms, sourceRoomId]
  )

  const targetRoom = useMemo(
    () => rooms.find((r) => r.id === targetRoomId),
    [rooms, targetRoomId]
  )

  // Get available capacity in target room
  const availableCapacity = useMemo(() => {
    if (!targetRoom) return 0
    return targetRoom.capacity - targetRoom._count.studentAssignments
  }, [targetRoom])

  // Filter active rooms
  const activeRooms = useMemo(
    () => rooms.filter((r) => r.isActive),
    [rooms]
  )

  // Target rooms exclude source room
  const targetRoomOptions = useMemo(
    () => activeRooms.filter((r) => r.id !== sourceRoomId),
    [activeRooms, sourceRoomId]
  )

  // Fetch students when source room changes
  useEffect(() => {
    if (open && sourceRoomId && gradeId) {
      fetchStudentsInRoom()
    }
  }, [open, sourceRoomId, gradeId])

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setSourceRoomId("")
      setTargetRoomId("")
      setStudentsInRoom([])
      setSelectedStudentIds(new Set())
      setError(null)
    }
  }, [open])

  // Reset target and selection when source changes
  useEffect(() => {
    setTargetRoomId("")
    setSelectedStudentIds(new Set())
  }, [sourceRoomId])

  async function fetchStudentsInRoom() {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(
        `/api/admin/grades/${gradeId}/rooms/${sourceRoomId}`
      )
      if (res.ok) {
        const data = await res.json()
        setStudentsInRoom(data.studentAssignments || [])
      } else {
        setError(t.admin.failedToFetchStudents)
      }
    } catch {
      setError(t.admin.failedToFetchStudents)
    } finally {
      setIsLoading(false)
    }
  }

  function toggleStudent(studentProfileId: string) {
    const newSet = new Set(selectedStudentIds)
    if (newSet.has(studentProfileId)) {
      newSet.delete(studentProfileId)
    } else {
      // Check if adding would exceed target capacity
      if (targetRoom && newSet.size >= availableCapacity) {
        return
      }
      newSet.add(studentProfileId)
    }
    setSelectedStudentIds(newSet)
  }

  function selectAll() {
    const maxToSelect = Math.min(studentsInRoom.length, availableCapacity)
    const newSet = new Set<string>()
    studentsInRoom.slice(0, maxToSelect).forEach((s) => {
      newSet.add(s.studentProfileId)
    })
    setSelectedStudentIds(newSet)
  }

  function deselectAll() {
    setSelectedStudentIds(new Set())
  }

  async function handleSubmit() {
    if (!targetRoomId || selectedStudentIds.size === 0) return

    setIsSubmitting(true)
    setError(null)

    try {
      const res = await fetch("/api/admin/room-assignments/bulk-move", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentProfileIds: Array.from(selectedStudentIds),
          targetRoomId,
          schoolYearId,
        }),
      })

      if (res.ok) {
        onSuccess()
        onOpenChange(false)
      } else {
        const data = await res.json()
        setError(data.message || t.admin.failedToMoveStudents)
      }
    } catch {
      setError(t.admin.failedToMoveStudents)
    } finally {
      setIsSubmitting(false)
    }
  }

  const canSubmit = targetRoomId && selectedStudentIds.size > 0 && !isSubmitting

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{t.admin.moveStudentsTitle}</DialogTitle>
          <DialogDescription>
            {gradeName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Room selectors */}
          <div className="grid grid-cols-[1fr,auto,1fr] gap-4 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t.admin.sourceRoom}</label>
              <Select value={sourceRoomId} onValueChange={setSourceRoomId}>
                <SelectTrigger>
                  <SelectValue placeholder={t.admin.roomAssignments.selectRoom} />
                </SelectTrigger>
                <SelectContent>
                  {activeRooms.map((room) => (
                    <SelectItem key={room.id} value={room.id}>
                      <div className="flex items-center justify-between gap-2">
                        <span>{room.displayName}</span>
                        <Badge variant="outline" className="ml-2">
                          {room._count.studentAssignments}/{room.capacity}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <ArrowRight className="size-5 text-muted-foreground mb-2" />

            <div className="space-y-2">
              <label className="text-sm font-medium">{t.admin.targetRoom}</label>
              <Select
                value={targetRoomId}
                onValueChange={setTargetRoomId}
                disabled={!sourceRoomId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t.admin.roomAssignments.selectRoom} />
                </SelectTrigger>
                <SelectContent>
                  {targetRoomOptions.map((room) => {
                    const isFull = room._count.studentAssignments >= room.capacity
                    return (
                      <SelectItem
                        key={room.id}
                        value={room.id}
                        disabled={isFull}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span>{room.displayName}</span>
                          <Badge
                            variant={isFull ? "destructive" : "outline"}
                            className="ml-2"
                          >
                            {room._count.studentAssignments}/{room.capacity}
                          </Badge>
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Capacity warning */}
          {targetRoom && availableCapacity < 5 && availableCapacity > 0 && (
            <div className="flex items-center gap-2 text-warning text-sm">
              <AlertTriangle className="size-4" />
              <span>
                {t.admin.roomAssignments.roomNearCapacity} ({availableCapacity} {t.common.students} available)
              </span>
            </div>
          )}

          {/* Students list */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">
                {t.admin.selectStudentsToMove}
              </label>
              {sourceRoomId && targetRoomId && studentsInRoom.length > 0 && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={selectAll}
                    disabled={!targetRoom || availableCapacity === 0}
                  >
                    {t.admin.roomAssignments.selectAll}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={deselectAll}
                    disabled={selectedStudentIds.size === 0}
                  >
                    {t.admin.roomAssignments.deselectAll}
                  </Button>
                </div>
              )}
            </div>

            <div className="border rounded-md flex-1 overflow-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="size-6 animate-spin text-muted-foreground" />
                </div>
              ) : !sourceRoomId ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <Users className="size-8 mb-2" />
                  <p className="text-sm">{t.admin.sourceRoom}</p>
                </div>
              ) : studentsInRoom.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <Users className="size-8 mb-2" />
                  <p className="text-sm">{t.admin.noStudentsInRoom}</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>{t.common.student}</TableHead>
                      <TableHead>ID</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentsInRoom.map((assignment) => {
                      const student = assignment.studentProfile
                      const isSelected = selectedStudentIds.has(student.id)
                      const isDisabled =
                        !targetRoomId ||
                        (!isSelected && selectedStudentIds.size >= availableCapacity)

                      return (
                        <TableRow
                          key={student.id}
                          className={isDisabled && !isSelected ? "opacity-50" : ""}
                        >
                          <TableCell>
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleStudent(student.id)}
                              disabled={isDisabled && !isSelected}
                            />
                          </TableCell>
                          <TableCell>
                            {student.person.firstName} {student.person.lastName}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {student.studentNumber || "-"}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm">
              <AlertTriangle className="size-4" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between">
          <div className="text-sm text-muted-foreground">
            {selectedStudentIds.size} {t.admin.studentsSelected}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t.common.cancel}
            </Button>
            <Button onClick={handleSubmit} disabled={!canSubmit}>
              {isSubmitting && <Loader2 className="size-4 mr-2 animate-spin" />}
              {t.admin.moveSelected}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
