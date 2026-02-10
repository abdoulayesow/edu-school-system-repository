"use client"

import { useState, useEffect, useCallback } from "react"
import { FormDialog, FormField, dialogThemes } from "@/components/ui/form-dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { DialogFooter } from "@/components/ui/dialog"
import { useI18n } from "@/components/i18n-provider"
import { Loader2, Check, X, Clock, FileQuestion, ClipboardCheck } from "lucide-react"
import { cn } from "@/lib/utils"

interface Room {
  id: string
  name: string
  displayName: string
  students: {
    id: string
    firstName: string
    lastName: string
    studentNumber?: string
  }[]
}

interface AttendanceRecord {
  studentProfileId: string
  status: "present" | "absent" | "late" | "excused"
  notes?: string
}

interface AttendanceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  room: Room | null
  gradeId: string
  schoolYearId: string
  onSuccess?: () => void
}

export function AttendanceDialog({
  open,
  onOpenChange,
  room,
  gradeId,
  schoolYearId,
  onSuccess,
}: AttendanceDialogProps) {
  const { t } = useI18n()
  const [date, setDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split("T")[0]
  })
  const [records, setRecords] = useState<Map<string, AttendanceRecord>>(new Map())
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Initialize records when room changes or dialog opens
  const initializeRecords = useCallback(() => {
    if (room) {
      const initialRecords = new Map<string, AttendanceRecord>()
      room.students.forEach(student => {
        initialRecords.set(student.id, {
          studentProfileId: student.id,
          status: "present", // Default to present
          notes: "",
        })
      })
      setRecords(initialRecords)
    }
  }, [room])

  // Fetch existing attendance when dialog opens
  const fetchExistingAttendance = useCallback(async () => {
    if (!room || !date) return

    try {
      setIsLoading(true)
      const res = await fetch(
        `/api/admin/attendance/room?gradeRoomId=${room.id}&date=${date}`
      )

      if (res.ok) {
        const data = await res.json()
        if (data.records && data.records.length > 0) {
          const existingRecords = new Map<string, AttendanceRecord>()

          // Start with all students as present
          room.students.forEach(student => {
            existingRecords.set(student.id, {
              studentProfileId: student.id,
              status: "present",
              notes: "",
            })
          })

          // Override with existing records
          data.records.forEach((record: { studentProfileId: string; status: string; notes?: string }) => {
            existingRecords.set(record.studentProfileId, {
              studentProfileId: record.studentProfileId,
              status: record.status as AttendanceRecord["status"],
              notes: record.notes || "",
            })
          })

          setRecords(existingRecords)
        } else {
          initializeRecords()
        }
      }
    } catch (err) {
      console.error("Failed to fetch attendance:", err)
      initializeRecords()
    } finally {
      setIsLoading(false)
    }
  }, [room, date, initializeRecords])

  useEffect(() => {
    if (open && room) {
      fetchExistingAttendance()
      setError(null)
      setSuccess(null)
    }
  }, [open, room, date, fetchExistingAttendance])

  const handleStatusChange = (studentId: string, status: AttendanceRecord["status"]) => {
    setRecords(prev => {
      const next = new Map(prev)
      const existing = next.get(studentId)
      next.set(studentId, {
        studentProfileId: studentId,
        status,
        notes: existing?.notes || "",
      })
      return next
    })
  }

  const handleSave = async () => {
    if (!room) return

    try {
      setIsSaving(true)
      setError(null)

      const res = await fetch("/api/admin/attendance/room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gradeRoomId: room.id,
          date,
          entryMode: "checklist",
          records: Array.from(records.values()),
        }),
      })

      if (res.ok) {
        setSuccess(t.admin.roomAssignments.attendanceSaved)
        onSuccess?.()

        // Close after a short delay
        setTimeout(() => {
          onOpenChange(false)
        }, 1500)
      } else {
        const data = await res.json()
        setError(data.error || t.admin.roomAssignments.attendanceError)
      }
    } catch {
      setError(t.admin.roomAssignments.attendanceError)
    } finally {
      setIsSaving(false)
    }
  }

  const markAllAs = (status: AttendanceRecord["status"]) => {
    if (!room) return

    setRecords(prev => {
      const next = new Map(prev)
      room.students.forEach(student => {
        const existing = next.get(student.id)
        next.set(student.id, {
          studentProfileId: student.id,
          status,
          notes: existing?.notes || "",
        })
      })
      return next
    })
  }

  const getStatusCounts = () => {
    let present = 0, absent = 0, late = 0, excused = 0
    records.forEach(record => {
      switch (record.status) {
        case "present": present++; break
        case "absent": absent++; break
        case "late": late++; break
        case "excused": excused++; break
      }
    })
    return { present, absent, late, excused }
  }

  const counts = getStatusCounts()

  if (!room) return null

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t.admin.roomAssignments.attendanceForRoom.replace("{roomName}", room.displayName || room.name)}
      description={`${room.students.length} ${t.common.students}`}
      icon={ClipboardCheck}
      accentColor="emerald"
      maxWidth="sm:max-w-2xl"
      error={error}
      footer={
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t.common.cancel}
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || records.size === 0}
            className={dialogThemes.emerald.submitBg}
          >
            {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {t.admin.roomAssignments.saveAttendance}
          </Button>
        </DialogFooter>
      }
    >
      {/* Date picker */}
      <FormField label={t.admin.roomAssignments.attendanceDate}>
        <Input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="w-[200px]"
        />
      </FormField>

      {/* Quick actions */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {t.admin.roomAssignments.markAll}
        </span>
        <Button variant="outline" size="sm" onClick={() => markAllAs("present")}>
          <Check className="h-3 w-3 mr-1" />
          {t.admin.roomAssignments.markPresent}
        </Button>
        <Button variant="outline" size="sm" onClick={() => markAllAs("absent")}>
          <X className="h-3 w-3 mr-1" />
          {t.admin.roomAssignments.markAbsent}
        </Button>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-2">
        <Badge variant="default" className="bg-emerald-600">
          <Check className="h-3 w-3 mr-1" />
          {counts.present}
        </Badge>
        <Badge variant="destructive">
          <X className="h-3 w-3 mr-1" />
          {counts.absent}
        </Badge>
        <Badge variant="secondary" className="bg-yellow-500 text-white">
          <Clock className="h-3 w-3 mr-1" />
          {counts.late}
        </Badge>
        <Badge variant="outline">
          <FileQuestion className="h-3 w-3 mr-1" />
          {counts.excused}
        </Badge>
      </div>

      {/* Student list */}
      <div className="border rounded-lg p-2 max-h-[350px] overflow-y-auto space-y-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          room.students.map(student => {
            const record = records.get(student.id)
            const status = record?.status || "present"

            return (
              <div
                key={student.id}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="font-medium text-sm">
                    {student.firstName} {student.lastName}
                  </div>
                  {student.studentNumber && (
                    <div className="text-xs text-muted-foreground">
                      {student.studentNumber}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant={status === "present" ? "default" : "outline"}
                    className={cn(
                      "h-8 w-8 p-0",
                      status === "present" && "bg-emerald-600 hover:bg-emerald-700"
                    )}
                    onClick={() => handleStatusChange(student.id, "present")}
                    title={t.admin.roomAssignments.markPresent}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={status === "absent" ? "destructive" : "outline"}
                    className="h-8 w-8 p-0"
                    onClick={() => handleStatusChange(student.id, "absent")}
                    title={t.admin.roomAssignments.markAbsent}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={status === "late" ? "default" : "outline"}
                    className={cn(
                      "h-8 w-8 p-0",
                      status === "late" && "bg-yellow-500 hover:bg-yellow-600"
                    )}
                    onClick={() => handleStatusChange(student.id, "late")}
                    title={t.admin.roomAssignments.markLate}
                  >
                    <Clock className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={status === "excused" ? "secondary" : "outline"}
                    className="h-8 w-8 p-0"
                    onClick={() => handleStatusChange(student.id, "excused")}
                    title={t.admin.roomAssignments.markExcused}
                  >
                    <FileQuestion className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Success Message */}
      {success && (
        <div className={cn(
          "p-3 rounded-xl border",
          "bg-gradient-to-br from-emerald-50 to-emerald-50/50 dark:from-emerald-950/30 dark:to-emerald-950/10",
          "border-emerald-300 dark:border-emerald-700"
        )}>
          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
            {success}
          </p>
        </div>
      )}
    </FormDialog>
  )
}
