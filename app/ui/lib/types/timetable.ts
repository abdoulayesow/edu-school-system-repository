/**
 * Timetable Type Definitions
 *
 * Centralized type definitions for the timetable feature.
 * This file contains all types used across timetable components,
 * including database models, API payloads, and UI component props.
 */

import { DayOfWeek } from '@prisma/client'

// ============================================================================
// Prisma Enums (re-exported for convenience)
// ============================================================================

export { DayOfWeek }

// ============================================================================
// Database Model Types
// ============================================================================

/**
 * Time Period - Represents a scheduling period in the school day
 * (e.g., "Period 1: 8:00-9:00", "Lunch: 12:00-13:00")
 */
export interface TimePeriod {
  id: string
  name: string
  nameFr: string | null
  startTime: string
  endTime: string
  order: number
}

/**
 * Schedule Slot - A single scheduled class or break
 */
export interface ScheduleSlot {
  id: string
  subject: {
    id: string
    name: string
    code: string
  } | null
  teacher: {
    id: string
    name: string
  } | null
  roomLocation: string | null
  isBreak: boolean
  notes: string | null
}

/**
 * Schedule Slot (Full) - Extended version with additional fields for editor
 */
export interface ScheduleSlotFull extends ScheduleSlot {
  gradeSubjectId: string | null
  teacherProfileId: string | null
}

/**
 * Grade Room - A specific section/class (e.g., "6ème A", "CM2 Rouge")
 */
export interface GradeRoom {
  id: string
  displayName: string
  grade: {
    id: string
    name: string
  }
}

/**
 * Grade Subject - A subject assigned to a specific grade
 */
export interface GradeSubject {
  id: string
  subject: {
    id: string
    name: string
    nameFr: string
    code: string
  }
}

/**
 * Teacher Profile - Basic teacher information for slot assignment
 */
export interface TeacherProfile {
  id: string
  person: {
    id: string
    firstName: string
    lastName: string
  }
}

// ============================================================================
// Page/Display Types
// ============================================================================

/**
 * Grade - Summary information for grade selection sidebar
 */
export interface Grade {
  id: string
  name: string
  level: string
  studentCount: number
  subjectCount: number
}

/**
 * Grade Detail - Extended grade information with leader
 */
export interface GradeDetail {
  id: string
  name: string
  level: string
  studentCount: number
  leader: string | null
}

/**
 * Subject - Subject information with teacher and hours
 */
export interface Subject {
  id: string
  subjectId: string
  name: string
  code: string | null
  coefficient: number
  hoursPerWeek: number
  teacher: {
    id: string
    name: string
  } | null
}

/**
 * Day Schedule - All periods for a single day of the week
 */
export interface DaySchedule {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday'
  periods: {
    timePeriodId: string
    timePeriod: TimePeriod
    slot: ScheduleSlot | null
  }[]
}

// ============================================================================
// API Request/Response Types
// ============================================================================

/**
 * Create Slot Payload - Data sent when creating a new schedule slot
 */
export interface CreateSlotPayload {
  gradeRoomId: string
  timePeriodId: string
  dayOfWeek: string
  isBreak: boolean
  gradeSubjectId: string | null
  teacherProfileId: string | null
  roomLocation: string | null
  notes: string | null
}

/**
 * Update Slot Payload - Data sent when updating an existing slot
 */
export interface UpdateSlotPayload extends CreateSlotPayload {}

/**
 * Weekly Schedule Response - Full weekly schedule data from API
 */
export interface WeeklyScheduleResponse {
  weeklySchedule: DaySchedule[]
  timePeriods: TimePeriod[]
}

/**
 * Grade Subjects Response - Grade with subjects list
 */
export interface GradeSubjectsResponse {
  grade: GradeDetail
  subjects: Subject[]
  totalHours: number
}

/**
 * Grades List Response - All grades with student/subject counts
 */
export interface GradesListResponse {
  grades: Grade[]
}

// ============================================================================
// Validation & Conflict Types
// ============================================================================

/**
 * Conflict Check - Describes a scheduling conflict
 */
export interface ConflictCheck {
  type: 'teacher' | 'room' | 'section'
  dayOfWeek: string
  timePeriodId: string
  details: string
}

/**
 * Conflict Response - API response when conflicts are detected
 */
export interface ConflictResponse {
  message: string
  conflicts: ConflictCheck[]
}

// ============================================================================
// Component Prop Types
// ============================================================================

/**
 * Timetable Grid Props - Props for the weekly schedule grid component
 */
export interface TimetableGridProps {
  weeklySchedule: DaySchedule[]
  timePeriods: TimePeriod[]
  onSlotClick?: (day: string, timePeriodId: string, slot: ScheduleSlot | null) => void
  onAddSlot?: (day: string, timePeriodId: string) => void
  className?: string
  locale?: 'en' | 'fr'
  canEdit?: boolean // Permission-based flag for showing add/edit controls
}

/**
 * Section Selector Props - Props for grade room selector component
 */
export interface SectionSelectorProps {
  gradeRooms: GradeRoom[]
  value: string
  onValueChange: (gradeRoomId: string) => void
  label?: string
  placeholder?: string
  className?: string
  disabled?: boolean
}

/**
 * Slot Editor Dialog Props - Props for the slot create/edit/delete dialog
 */
export interface SlotEditorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  gradeRoomId: string
  timePeriodId: string
  dayOfWeek: string
  slot: ScheduleSlotFull | null
  gradeSubjects: GradeSubject[]
  teachers: TeacherProfile[]
  onSuccess: () => void
}

// ============================================================================
// Shared Constants
// ============================================================================

/**
 * Day Labels - Full day names in English and French
 */
export const DAY_LABELS = {
  en: {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
  },
  fr: {
    monday: 'Lundi',
    tuesday: 'Mardi',
    wednesday: 'Mercredi',
    thursday: 'Jeudi',
    friday: 'Vendredi',
    saturday: 'Samedi',
  },
} as const

/**
 * Day Labels (Short) - Abbreviated day names in English and French
 */
export const DAY_LABELS_SHORT = {
  en: {
    monday: 'Mon',
    tuesday: 'Tue',
    wednesday: 'Wed',
    thursday: 'Thu',
    friday: 'Fri',
    saturday: 'Sat',
  },
  fr: {
    monday: 'Lun',
    tuesday: 'Mar',
    wednesday: 'Mer',
    thursday: 'Jeu',
    friday: 'Ven',
    saturday: 'Sam',
  },
} as const

/**
 * Type for day keys
 */
export type DayKey = keyof typeof DAY_LABELS.en
