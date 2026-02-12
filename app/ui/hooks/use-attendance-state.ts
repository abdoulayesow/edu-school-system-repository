import { useState, useCallback } from "react"
import { type AttendanceStatus, getNextStatus } from "@/lib/config/attendance-status"

export interface Person {
  id: string
  firstName: string
  lastName: string
  photoUrl: string | null
}

export interface Student {
  studentProfileId: string
  studentNumber: string
  person: Person | null
  status: AttendanceStatus
  notes: string | null
  recordId: string | null
}

export interface AttendanceSession {
  id: string
  entryMode: "checklist" | "absences_only"
  isComplete: boolean
  completedAt: string | null
  recorder: { id: string; name: string } | null
}

export interface AttendanceSummary {
  total: number
  present: number
  absent: number
  late: number
  excused: number
  notRecorded: number
}

export interface AttendanceData {
  grade: { id: string; name: string; level: string }
  date: string
  session: AttendanceSession | null
  students: Student[]
  summary: AttendanceSummary
}

export type EntryMode = "checklist" | "absences_only"

export function useAttendanceState(entryMode: EntryMode) {
  const [attendanceData, setAttendanceData] = useState<AttendanceData | null>(null)
  const [localAttendance, setLocalAttendance] = useState<Record<string, AttendanceStatus>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAttendance = useCallback(async (gradeId: string, date: string) => {
    if (!gradeId || gradeId === "all" || !date) return

    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch(`/api/attendance/grade/${gradeId}/${date}`)
      if (!response.ok) throw new Error("Failed to fetch attendance")
      const data: AttendanceData = await response.json()
      setAttendanceData(data)

      // Initialize local attendance from fetched data
      const initial: Record<string, AttendanceStatus> = {}
      data.students.forEach(student => {
        initial[student.studentProfileId] = student.status
      })
      setLocalAttendance(initial)

      return data
    } catch (err) {
      console.error("Error fetching attendance:", err)
      setError("Failed to load attendance")
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const initializeAttendance = useCallback((students: Student[]) => {
    const initial: Record<string, AttendanceStatus> = {}
    students.forEach(student => {
      initial[student.studentProfileId] = entryMode === "checklist" ? "present" : null
    })
    setLocalAttendance(initial)
  }, [entryMode])

  const toggleStatus = useCallback((studentId: string) => {
    setLocalAttendance(prev => {
      const current = prev[studentId]
      const next = getNextStatus(current, entryMode)
      return { ...prev, [studentId]: next }
    })
  }, [entryMode])

  const saveAttendance = useCallback(async (
    gradeId: string,
    date: string,
    isComplete: boolean = false
  ) => {
    if (!attendanceData) return false

    try {
      setIsSaving(true)
      setError(null)

      // Build records array
      const records = attendanceData.students.map(student => {
        const status = localAttendance[student.studentProfileId]
        return {
          studentProfileId: student.studentProfileId,
          status: status || (entryMode === "absences_only" ? "present" : status) || "present",
        }
      }).filter(r => r.status !== null)

      const response = await fetch(`/api/attendance/grade/${gradeId}/${date}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entryMode,
          records,
          isComplete,
        }),
      })

      if (!response.ok) throw new Error("Failed to save attendance")

      // Refresh attendance data
      const refreshResponse = await fetch(`/api/attendance/grade/${gradeId}/${date}`)
      if (refreshResponse.ok) {
        const data: AttendanceData = await refreshResponse.json()
        setAttendanceData(data)
      }

      return true
    } catch (err) {
      console.error("Error saving attendance:", err)
      setError("Failed to save")
      return false
    } finally {
      setIsSaving(false)
    }
  }, [attendanceData, localAttendance, entryMode])

  return {
    attendanceData,
    localAttendance,
    isLoading,
    isSaving,
    error,
    fetchAttendance,
    initializeAttendance,
    toggleStatus,
    saveAttendance,
    setAttendanceData,
    setError,
  }
}
