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
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useI18n } from "@/components/i18n-provider"
import { Loader2, Users, AlertTriangle, CheckCircle2 } from "lucide-react"

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

interface StudentRoomChangeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  studentId: string
  studentName: string
  studentProfileId: string
  gradeId: string
  gradeName: string
  currentRoomId: string | null
  currentRoomName: string | null
  schoolYearId: string
  onSuccess: () => void
}

export function StudentRoomChangeDialog({
  open,
  onOpenChange,
  studentId,
  studentName,
  studentProfileId,
  gradeId,
  gradeName,
  currentRoomId,
  currentRoomName,
  schoolYearId,
  onSuccess,
}: StudentRoomChangeDialogProps) {
  const { t } = useI18n()
  const [rooms, setRooms] = useState<Room[]>([])
  const [selectedRoomId, setSelectedRoomId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

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

  // Filter active rooms (excluding current room)
  const availableRooms = useMemo(
    () => rooms.filter((r) => r.isActive && r.id !== currentRoomId),
    [rooms, currentRoomId]
  )

  // Fetch rooms when dialog opens
  useEffect(() => {
    if (open && gradeId && schoolYearId) {
      fetchRooms()
    }
  }, [open, gradeId, schoolYearId])

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setSelectedRoomId("")
      setError(null)
      setSuccessMessage(null)
    }
  }, [open])

  async function fetchRooms() {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/grades/${gradeId}/rooms`)
      if (res.ok) {
        const data = await res.json()
        setRooms(data.rooms || [])
      } else {
        setError(t.admin.roomAssignments.fetchError)
      }
    } catch {
      setError(t.admin.roomAssignments.fetchError)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSubmit() {
    if (!selectedRoomId) return

    setIsSubmitting(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const res = await fetch("/api/admin/room-assignments/reassign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentProfileId,
          newGradeRoomId: selectedRoomId,
          schoolYearId,
        }),
      })

      if (res.ok) {
        setSuccessMessage(t.admin.roomAssignments.reassignSuccess || "Room changed successfully")
        onSuccess()

        // Close after a delay
        setTimeout(() => {
          onOpenChange(false)
        }, 1500)
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            {t.students.changeRoom}
          </DialogTitle>
          <DialogDescription>
            {studentName} - {gradeName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current Room */}
          {currentRoomName && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                {t.admin.roomAssignments.currentRoom || "Current Room"}
              </label>
              <div className="p-3 bg-muted rounded-lg">
                <span className="font-medium">{currentRoomName}</span>
              </div>
            </div>
          )}

          {/* New Room Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t.admin.roomAssignments.newRoom || "New Room"}
            </label>
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Select value={selectedRoomId} onValueChange={setSelectedRoomId}>
                <SelectTrigger>
                  <SelectValue placeholder={t.admin.roomAssignments.selectRoom} />
                </SelectTrigger>
                <SelectContent>
                  {availableRooms.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      {t.admin.roomAssignments.noRoomsAvailable}
                    </div>
                  ) : (
                    availableRooms.map((room) => {
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
            )}
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
                  ({availableCapacity} {t.admin.available})
                </span>
              )}
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
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedRoomId || availableCapacity <= 0}
          >
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isSubmitting ? t.common.loading : t.common.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
