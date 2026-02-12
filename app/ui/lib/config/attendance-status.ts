// ============================================================================
// ATTENDANCE STATUS CONFIGURATION
// ============================================================================
// Single source of truth for attendance status display configuration.
// Eliminates DRY violations by centralizing icon, label, styling, and badge logic.

import { CheckCircle2, XCircle, Clock, AlertCircle, CircleAlert } from "lucide-react"
import type { LucideIcon } from "lucide-react"

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type AttendanceStatus = "present" | "absent" | "late" | "excused" | null

export interface StatusConfig {
  icon: LucideIcon
  labelKey: string // i18n key path (e.g., "attendance.statusPresent")
  className: string // Badge className
  borderClass: string // Student card border className
  iconClass: string // Icon color className
}

// ============================================================================
// STATUS CONFIGURATION OBJECT
// ============================================================================
// This object replaces 4 separate functions:
// - getStatusIcon() → use config.icon
// - getStatusLabel() → use t[config.labelKey]
// - getStatusBadge() → use config.className
// - getStatusBorder() → use config.borderClass

export const ATTENDANCE_STATUS_CONFIG: Record<Exclude<AttendanceStatus, null>, StatusConfig> = {
  present: {
    icon: CheckCircle2,
    labelKey: "attendance.statusPresent",
    className: "bg-success/10 text-success border-success/30",
    borderClass: "border-success bg-success/5 hover:bg-success/10",
    iconClass: "text-success",
  },
  absent: {
    icon: XCircle,
    labelKey: "attendance.statusAbsent",
    className: "bg-destructive/10 text-destructive border-destructive/30",
    borderClass: "border-destructive bg-destructive/5 hover:bg-destructive/10",
    iconClass: "text-destructive",
  },
  late: {
    icon: Clock,
    labelKey: "attendance.statusLate",
    className: "bg-warning/10 text-warning border-warning/30",
    borderClass: "border-warning bg-warning/5 hover:bg-warning/10",
    iconClass: "text-warning",
  },
  excused: {
    icon: AlertCircle,
    labelKey: "attendance.statusExcused",
    className: "bg-blue-500/10 text-blue-500 border-blue-500/30",
    borderClass: "border-blue-500 bg-blue-500/5 hover:bg-blue-500/10",
    iconClass: "text-blue-500",
  },
} as const

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get status configuration for a given attendance status
 * Returns null for unrecorded attendance (null status)
 */
export function getStatusConfig(status: AttendanceStatus): StatusConfig | null {
  if (status === null) return null
  return ATTENDANCE_STATUS_CONFIG[status]
}

/**
 * Get the default icon/config for unrecorded attendance (null status)
 */
export const UNRECORDED_STATUS_CONFIG = {
  icon: CircleAlert,
  labelKey: "attendance.notRecorded",
  className: "bg-muted/10 text-muted-foreground border-muted/30",
  borderClass: "border-border hover:bg-muted/50",
  iconClass: "text-muted-foreground",
} as const

/**
 * Get status configuration including handling for null (unrecorded) status
 */
export function getStatusConfigOrDefault(status: AttendanceStatus) {
  if (status === null) return UNRECORDED_STATUS_CONFIG
  return ATTENDANCE_STATUS_CONFIG[status]
}

/**
 * Status cycling logic for checklist mode
 * present → absent → late → excused → present
 */
export function getNextStatusChecklist(current: AttendanceStatus): AttendanceStatus {
  if (current === "present") return "absent"
  if (current === "absent") return "late"
  if (current === "late") return "excused"
  return "present" // excused or null → present
}

/**
 * Status cycling logic for absences-only mode
 * null → absent → late → excused → null (back to present/unrecorded)
 */
export function getNextStatusAbsencesOnly(current: AttendanceStatus): AttendanceStatus {
  if (current === null) return "absent"
  if (current === "absent") return "late"
  if (current === "late") return "excused"
  return null // excused → null (present)
}

/**
 * Get the next status based on entry mode
 */
export function getNextStatus(
  current: AttendanceStatus,
  entryMode: "checklist" | "absences_only"
): AttendanceStatus {
  return entryMode === "checklist"
    ? getNextStatusChecklist(current)
    : getNextStatusAbsencesOnly(current)
}
