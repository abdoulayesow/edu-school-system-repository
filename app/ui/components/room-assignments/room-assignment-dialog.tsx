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
import { Loader2, Users, AlertTriangle, CheckCircle2, Lock, LockOpen, Eye, Sparkles } from "lucide-react"
import Link from "next/link"
import { AutoAssignDialog } from "./auto-assign-dialog"

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

interface UnassignedStudent {
  id: string
  firstName: string
  lastName: string
  studentNumber?: string
  isLocked?: boolean
}

interface RoomAssignmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  gradeId: string
  gradeName: string
  schoolYearId: string
  rooms: Room[]
  onSuccess: () => void
}

export function RoomAssignmentDialog({
  open,
  onOpenChange,
  gradeId,
  gradeName,
  schoolYearId,
  rooms,
  onSuccess,
}: RoomAssignmentDialogProps) {
  const { t } = useI18n()
  const [selectedRoomId, setSelectedRoomId] = useState<string>("")
  const [unassignedStudents, setUnassignedStudents] = useState<UnassignedStudent[]>([])
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [autoAssignDialogOpen, setAutoAssignDialogOpen] = useState(false)

  // Get selected room
  const selectedRoom = useMemo(
    () => rooms.find((r) => r.id === selectedRoomId),
    [rooms, selectedRoomId]
  )

  // Get available capacity
  const availableCapacity = useMemo(() => {
    if (!selectedRoom) return 0
    return selectedRoom.capacity - selectedRoom._count.studentAssignments
  }, [selectedRoom])

  // Filter active rooms
  const activeRooms = useMemo(
    () => rooms.filter((r) => r.isActive),
    [rooms]
  )

  // Fetch unassigned students when dialog opens
  useEffect(() => {
    if (open && gradeId && schoolYearId) {
      fetchUnassignedStudents()
    }
  }, [open, gradeId, schoolYearId])

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setSelectedRoomId("")
      setSelectedStudentIds(new Set())
      setError(null)
      setSuccessMessage(null)
    }
  }, [open])

  async function fetchUnassignedStudents() {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(
        `/api/admin/room-assignments?gradeId=${gradeId}&schoolYearId=${schoolYearId}&unassigned=true`
      )
      if (res.ok) {
        const data = await res.json()
        setUnassignedStudents(data)
      } else {
        setError(t.admin.roomAssignments.fetchError)
      }
    } catch {
      setError(t.admin.roomAssignments.fetchError)
    } finally {
      setIsLoading(false)
    }
  }

  function toggleStudent(studentId: string) {
    const newSet = new Set(selectedStudentIds)
    if (newSet.has(studentId)) {
      newSet.delete(studentId)
    } else {
      // Check if adding would exceed capacity
      if (selectedRoom && newSet.size >= availableCapacity) {
        return // Don't add more than available capacity
      }
      newSet.add(studentId)
    }
    setSelectedStudentIds(newSet)
  }

  function selectAll() {
    // Select up to available capacity
    const maxToSelect = Math.min(unassignedStudents.length, availableCapacity)
    const newSet = new Set(
      unassignedStudents.slice(0, maxToSelect).map((s) => s.id)
    )
    setSelectedStudentIds(newSet)
  }

  function deselectAll() {
    setSelectedStudentIds(new Set())
  }

  async function toggleLock(studentProfileId: string, isLocked: boolean) {
    try {
      const response = await fetch(`/api/admin/students/${studentProfileId}/lock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isLocked })
      })

      if (!response.ok) {
        throw new Error(t.admin.roomAssignments.lockToggleError)
      }

      // Refresh unassigned students list
      await fetchUnassignedStudents()
    } catch (err) {
      setError(err instanceof Error ? err.message : t.admin.roomAssignments.lockToggleError)
    }
  }

  async function handleAssign() {
    if (!selectedRoomId || selectedStudentIds.size === 0) return

    setIsSubmitting(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const assignments = Array.from(selectedStudentIds).map((studentProfileId) => ({
        studentProfileId,
        gradeRoomId: selectedRoomId,
      }))

      const res = await fetch("/api/admin/room-assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignments,
          schoolYearId,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        const successCount = data.created?.length || 0
        const errorCount = data.errors?.length || 0

        if (errorCount === 0) {
          setSuccessMessage(
            t.admin.roomAssignments.assignmentSuccess.replace("{count}", String(successCount))
          )
        } else {
          setSuccessMessage(
            t.admin.roomAssignments.assignmentPartialSuccess
              .replace("{success}", String(successCount))
              .replace("{failed}", String(errorCount))
          )
        }

        // Refresh unassigned students and notify parent
        await fetchUnassignedStudents()
        setSelectedStudentIds(new Set())
        onSuccess()

        // Close after a delay if all succeeded
        if (errorCount === 0) {
          setTimeout(() => {
            onOpenChange(false)
          }, 1500)
        }
      } else {
        const data = await res.json()
        setError(data.message || t.admin.roomAssignments.assignmentError)
      }
    } catch {
      setError(t.admin.roomAssignments.assignmentError)
    } finally {
      setIsSubmitting(false)
    }
  }

  function getRoomStatus(room: Room) {
    const usage = room._count.studentAssignments / room.capacity
    if (usage >= 1) return "full"
    if (usage >= 0.9) return "near"
    return "available"
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <DialogTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                {t.admin.roomAssignments.dialogTitle}
              </DialogTitle>
              <DialogDescription>
                {t.admin.roomAssignments.dialogDescription.replace("{gradeName}", gradeName)}
              </DialogDescription>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              {/* Auto-Assign button */}
              <Button
                variant="default"
                size="sm"
                onClick={() => setAutoAssignDialogOpen(true)}
                className="inline-flex items-center justify-center"
                title={t.admin.roomAssignments.autoAssignTooltip}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {t.admin.roomAssignments.autoAssign}
              </Button>

              {/* View Grade button */}
              <Button
                variant="outline"
                size="icon"
                asChild
                title={t.admin.roomAssignments.viewGradeTooltip}
              >
                <Link href={`/students/grades/${gradeId}/view?schoolYearId=${schoolYearId}`}>
                  <Eye className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col space-y-4 py-4">
          {/* Room Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{t.admin.roomAssignments.selectRoom}</label>
            <Select value={selectedRoomId} onValueChange={setSelectedRoomId}>
              <SelectTrigger>
                <SelectValue placeholder={t.admin.roomAssignments.selectRoom} />
              </SelectTrigger>
              <SelectContent>
                {activeRooms.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground text-center">
                    {t.admin.roomAssignments.noRoomsAvailable}
                  </div>
                ) : (
                  activeRooms.map((room) => {
                    const status = getRoomStatus(room)
                    return (
                      <SelectItem
                        key={room.id}
                        value={room.id}
                        disabled={status === "full"}
                      >
                        <div className="flex items-center gap-2">
                          <span>{room.displayName}</span>
                          <span className="text-muted-foreground">
                            ({room._count.studentAssignments}/{room.capacity})
                          </span>
                          {status === "full" && (
                            <Badge variant="destructive" className="text-xs">
                              {t.admin.roomAssignments.roomFull}
                            </Badge>
                          )}
                          {status === "near" && (
                            <Badge variant="secondary" className="text-xs">
                              {t.admin.roomAssignments.roomNearCapacity}
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    )
                  })
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Selected Room Capacity Info */}
          {selectedRoom && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {t.admin.roomAssignments.roomCapacity
                  .replace("{current}", String(selectedRoom._count.studentAssignments))
                  .replace("{capacity}", String(selectedRoom.capacity))}
              </span>
              {availableCapacity > 0 && (
                <span className="text-sm text-muted-foreground">
                  ({availableCapacity} available)
                </span>
              )}
            </div>
          )}

          {/* Student List */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">
                {t.admin.roomAssignments.unassignedStudents} ({unassignedStudents.length})
              </label>
              {selectedRoomId && unassignedStudents.length > 0 && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={selectAll}
                    disabled={!selectedRoomId || availableCapacity === 0}
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

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : unassignedStudents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle2 className="h-10 w-10 text-green-500 mb-2" />
                <p className="text-muted-foreground">
                  {t.admin.roomAssignments.noUnassignedStudents}
                </p>
              </div>
            ) : (
              <div className="flex-1 overflow-auto border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>{t.admin.roomAssignments.studentName}</TableHead>
                      <TableHead>{t.admin.roomAssignments.studentNumber}</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {unassignedStudents.map((student) => (
                      <TableRow
                        key={student.id}
                        className={selectedStudentIds.has(student.id) ? "bg-muted/50" : ""}
                      >
                        <TableCell>
                          <Checkbox
                            checked={selectedStudentIds.has(student.id)}
                            onCheckedChange={() => toggleStudent(student.id)}
                            disabled={
                              !selectedRoomId ||
                              (!selectedStudentIds.has(student.id) &&
                                selectedStudentIds.size >= availableCapacity)
                            }
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <span>{student.firstName} {student.lastName}</span>
                            {student.isLocked && (
                              <Badge variant="outline" className="text-xs">
                                <Lock className="h-3 w-3 mr-1" />
                                {t.admin.roomAssignments.locked}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {student.studentNumber || "-"}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleLock(student.id, !student.isLocked)}
                            title={student.isLocked ? t.admin.roomAssignments.unlockStudent : t.admin.roomAssignments.lockStudent}
                          >
                            {student.isLocked ? (
                              <LockOpen className="h-4 w-4" />
                            ) : (
                              <Lock className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          {/* Selected Count */}
          {selectedStudentIds.size > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="secondary">
                {t.admin.roomAssignments.selectedCount.replace(
                  "{count}",
                  String(selectedStudentIds.size)
                )}
              </Badge>
            </div>
          )}

          {/* Error/Success Messages */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm">{successMessage}</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t.common.cancel}
          </Button>
          <Button
            onClick={handleAssign}
            disabled={isSubmitting || !selectedRoomId || selectedStudentIds.size === 0}
          >
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isSubmitting
              ? t.admin.roomAssignments.assigningStudents
              : t.admin.roomAssignments.assignStudents}
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Auto-Assign Dialog (nested) */}
      <AutoAssignDialog
        open={autoAssignDialogOpen}
        onOpenChange={setAutoAssignDialogOpen}
        gradeId={gradeId}
        gradeName={gradeName}
        schoolYearId={schoolYearId}
        rooms={rooms}
        onSuccess={() => {
          fetchUnassignedStudents()
          onSuccess()
        }}
      />
    </Dialog>
  )
}
