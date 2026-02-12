import { useMemo } from "react"
import type { AttendanceStatus } from "@/lib/config/attendance-status"
import type { Student, AttendanceSummary, EntryMode } from "./use-attendance-state"

export function useAttendanceSummary(
  students: Student[] | undefined,
  localAttendance: Record<string, AttendanceStatus>,
  entryMode: EntryMode
): AttendanceSummary | null {
  return useMemo(() => {
    if (!students) return null

    const summary: AttendanceSummary = {
      total: students.length,
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
      notRecorded: 0,
    }

    students.forEach(student => {
      const status = localAttendance[student.studentProfileId]
      if (status === "present") summary.present++
      else if (status === "absent") summary.absent++
      else if (status === "late") summary.late++
      else if (status === "excused") summary.excused++
      else summary.notRecorded++
    })

    // In absences_only mode, not recorded = present
    if (entryMode === "absences_only") {
      summary.present = summary.notRecorded
      summary.notRecorded = 0
    }

    return summary
  }, [students, localAttendance, entryMode])
}
