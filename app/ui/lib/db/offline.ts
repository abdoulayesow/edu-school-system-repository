import Dexie, { type Table } from "dexie"

// ============================================================================
// Type Definitions - Mirror Prisma models with sync metadata
// ============================================================================

export type SyncStatus = "pending" | "synced" | "conflict" | "error"

export interface SyncMetadata {
  syncStatus: SyncStatus
  localUpdatedAt: number // timestamp
  serverUpdatedAt?: number
  version: number
}

// User record (cache of server data)
export interface LocalUser extends SyncMetadata {
  id: string
  serverId?: string // server ID if synced
  name?: string
  email?: string
  phone?: string
  dateOfBirth?: string
  role: string
  status: string
  image?: string
  address?: {
    street?: string
    city?: string
    state?: string
    zip?: string
    country?: string
  }
}

// Student record (core offline data)
export interface LocalStudent extends SyncMetadata {
  id: string
  serverId?: string
  studentNumber?: string // STU-00001
  firstName: string
  lastName: string
  email?: string
  dateOfBirth?: string
  guardianName?: string
  guardianPhone?: string
  guardianEmail?: string
  enrollmentDate: string
  status: "active" | "inactive" | "graduated" | "transferred" | "suspended"
  grade?: string
  classId?: string
  notes?: string
}

// Attendance record
export interface LocalAttendance extends SyncMetadata {
  id: string
  serverId?: string
  studentId: string
  date: string // ISO date string YYYY-MM-DD
  status: "present" | "absent" | "late" | "excused"
  notes?: string
  recordedBy: string
  recordedAt: number // timestamp
}

// ============================================================================
// Enrollment System Types
// ============================================================================

export type SchoolLevel = "kindergarten" | "elementary" | "college" | "high_school"

export type EnrollmentStatusType =
  | "draft"
  | "submitted"
  | "review_required"
  | "approved"
  | "rejected"
  | "cancelled"

export type PaymentMethodType = "cash" | "orange_money"

export type PaymentStatusType = "pending" | "confirmed" | "failed"

// School Year record (read-only from server)
export interface LocalSchoolYear extends SyncMetadata {
  id: string
  serverId?: string
  name: string // "2025 - 2026"
  startDate: string // ISO date
  endDate: string // ISO date
  enrollmentStart: string // ISO date
  enrollmentEnd: string // ISO date
  isActive: boolean
}

// Grade record (read-only from server)
export interface LocalGrade extends SyncMetadata {
  id: string
  serverId?: string
  schoolYearId: string
  name: string // "7eme Annee"
  level: SchoolLevel
  order: number // 1-13 for sorting
  tuitionFee: number // GNF
}

// Enrollment record (core offline data)
export interface LocalEnrollment extends SyncMetadata {
  id: string
  serverId?: string
  enrollmentNumber?: string // ENR-2025-00001
  studentId?: string // For returning students
  schoolYearId: string
  gradeId: string

  // Student info
  firstName: string
  lastName: string
  dateOfBirth?: string // ISO date
  gender?: "male" | "female"
  phone?: string
  email?: string
  photoUrl?: string
  birthCertificateUrl?: string

  // Parent info
  fatherName?: string
  fatherPhone?: string
  fatherEmail?: string
  motherName?: string
  motherPhone?: string
  motherEmail?: string
  address?: string

  // Financial
  originalTuitionFee: number
  adjustedTuitionFee?: number
  adjustmentReason?: string

  // Status
  status: EnrollmentStatusType
  currentStep: number // 1-6 wizard step
  isReturningStudent: boolean
  draftExpiresAt?: number // timestamp
  submittedAt?: number // timestamp
  approvedAt?: number // timestamp
  approvedBy?: string
  autoApproveAt?: number // timestamp

  // Audit
  createdBy: string
}

// Payment Schedule record
export interface LocalPaymentSchedule extends SyncMetadata {
  id: string
  serverId?: string
  enrollmentId: string
  scheduleNumber: number // 1, 2, or 3
  amount: number // GNF
  months: string[] // ["September", "October", "May"]
  dueDate: string // ISO date
  isPaid: boolean
  paidAt?: number // timestamp
}

// Payment record
export interface LocalPayment extends SyncMetadata {
  id: string
  serverId?: string
  enrollmentId: string
  paymentScheduleId?: string
  amount: number // GNF
  method: PaymentMethodType
  status: PaymentStatusType
  receiptNumber: string
  transactionRef?: string // Orange Money ref
  receiptImageUrl?: string
  receiptImageBlob?: Blob // Store image locally for offline
  recordedBy: string
  recordedAt: number // timestamp
  confirmedBy?: string
  confirmedAt?: number
  notes?: string
}

// Enrollment Note record
export interface LocalEnrollmentNote extends SyncMetadata {
  id: string
  serverId?: string
  enrollmentId: string
  title: string
  content: string
  createdBy: string
}

// ============================================================================
// Sync Queue - Operations waiting to be synced
// ============================================================================

export type SyncOperation = "CREATE" | "UPDATE" | "DELETE"

export type SyncEntity =
  | "user"
  | "student"
  | "attendance"
  | "schoolYear"
  | "grade"
  | "enrollment"
  | "paymentSchedule"
  | "payment"
  | "enrollmentNote"

export interface SyncQueueItem {
  id?: number // auto-increment
  operation: SyncOperation
  entity: SyncEntity
  entityId: string // local ID
  payload: Record<string, unknown>
  createdAt: number // timestamp when queued
  attempts: number
  lastAttemptAt?: number
  lastError?: string
  status: "pending" | "processing" | "failed"
}

// ============================================================================
// Sync Conflicts - For logging/debugging (auto-resolved)
// ============================================================================

export interface SyncConflict {
  id?: number
  entity: string
  entityId: string
  localValue: Record<string, unknown>
  serverValue: Record<string, unknown>
  resolvedAt: number
  resolution: "server_wins" | "local_wins" | "merged"
}

// ============================================================================
// Sync Metadata - Track last sync timestamps
// ============================================================================

export interface SyncMetadataRecord {
  id: string // entity name
  lastSyncAt: number
  lastServerTimestamp?: string
}

// ============================================================================
// Offline Database Class
// ============================================================================

export class OfflineDatabase extends Dexie {
  // Core tables
  users!: Table<LocalUser, string>
  students!: Table<LocalStudent, string>
  attendance!: Table<LocalAttendance, string>

  // Enrollment tables
  schoolYears!: Table<LocalSchoolYear, string>
  grades!: Table<LocalGrade, string>
  enrollments!: Table<LocalEnrollment, string>
  paymentSchedules!: Table<LocalPaymentSchedule, string>
  payments!: Table<LocalPayment, string>
  enrollmentNotes!: Table<LocalEnrollmentNote, string>

  // Sync tables
  syncQueue!: Table<SyncQueueItem, number>
  syncConflicts!: Table<SyncConflict, number>
  syncMetadata!: Table<SyncMetadataRecord, string>

  constructor() {
    super("GSPNOfflineDB")

    // Version 1: Original schema
    this.version(1).stores({
      // User cache
      users: "id, serverId, email, role, status, syncStatus",

      // Student records - core offline data
      students:
        "id, serverId, email, status, grade, classId, syncStatus, [status+grade]",

      // Attendance records
      attendance:
        "id, serverId, studentId, date, status, recordedBy, syncStatus, [studentId+date]",

      // Sync queue for pending operations
      syncQueue: "++id, entity, entityId, status, createdAt, attempts",

      // Conflict log
      syncConflicts: "++id, entity, entityId, resolvedAt",

      // Sync metadata per entity
      syncMetadata: "id, lastSyncAt",
    })

    // Version 2: Add enrollment system tables
    this.version(2).stores({
      // Keep existing tables
      users: "id, serverId, email, role, status, syncStatus",
      students:
        "id, serverId, studentNumber, email, status, grade, classId, syncStatus, [status+grade], [firstName+lastName]",
      attendance:
        "id, serverId, studentId, date, status, recordedBy, syncStatus, [studentId+date]",

      // Enrollment system tables
      schoolYears: "id, serverId, isActive, syncStatus",
      grades: "id, serverId, schoolYearId, level, order, syncStatus, [schoolYearId+order]",
      enrollments:
        "id, serverId, enrollmentNumber, studentId, schoolYearId, gradeId, status, currentStep, createdBy, draftExpiresAt, syncStatus, [status+schoolYearId], [firstName+lastName]",
      paymentSchedules:
        "id, serverId, enrollmentId, scheduleNumber, isPaid, syncStatus, [enrollmentId+scheduleNumber]",
      payments:
        "id, serverId, enrollmentId, paymentScheduleId, status, recordedBy, recordedAt, syncStatus",
      enrollmentNotes: "id, serverId, enrollmentId, createdBy, syncStatus",

      // Sync tables (unchanged)
      syncQueue: "++id, entity, entityId, status, createdAt, attempts",
      syncConflicts: "++id, entity, entityId, resolvedAt",
      syncMetadata: "id, lastSyncAt",
    })
  }
}

// ============================================================================
// Database Instance (Singleton)
// ============================================================================

export const offlineDb = new OfflineDatabase()

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generate a temporary local ID for new records
 */
export function generateLocalId(): string {
  return `local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

/**
 * Check if an ID is a local (unsynced) ID
 */
export function isLocalId(id: string): boolean {
  return id.startsWith("local_")
}

/**
 * Create sync metadata for a new local record
 */
export function createSyncMetadata(): SyncMetadata {
  return {
    syncStatus: "pending",
    localUpdatedAt: Date.now(),
    version: 1,
  }
}

/**
 * Update sync metadata for an edited record
 */
export function updateSyncMetadata(existing: SyncMetadata): SyncMetadata {
  return {
    ...existing,
    syncStatus: "pending",
    localUpdatedAt: Date.now(),
    version: existing.version + 1,
  }
}

// ============================================================================
// CRUD Operations with Sync Queue Integration
// ============================================================================

/**
 * Add a student record locally and queue for sync
 */
export async function addStudent(
  data: Omit<LocalStudent, "id" | keyof SyncMetadata>
): Promise<LocalStudent> {
  const id = generateLocalId()
  const student: LocalStudent = {
    ...data,
    id,
    ...createSyncMetadata(),
  }

  await offlineDb.transaction("rw", [offlineDb.students, offlineDb.syncQueue], async () => {
    await offlineDb.students.add(student)
    await offlineDb.syncQueue.add({
      operation: "CREATE",
      entity: "student",
      entityId: id,
      payload: data,
      createdAt: Date.now(),
      attempts: 0,
      status: "pending",
    })
  })

  return student
}

/**
 * Update a student record locally and queue for sync
 */
export async function updateStudent(
  id: string,
  data: Partial<Omit<LocalStudent, "id" | keyof SyncMetadata>>
): Promise<void> {
  await offlineDb.transaction("rw", [offlineDb.students, offlineDb.syncQueue], async () => {
    const existing = await offlineDb.students.get(id)
    if (!existing) throw new Error(`Student ${id} not found`)

    const updated: LocalStudent = {
      ...existing,
      ...data,
      ...updateSyncMetadata(existing),
    }

    await offlineDb.students.put(updated)
    await offlineDb.syncQueue.add({
      operation: "UPDATE",
      entity: "student",
      entityId: id,
      payload: data,
      createdAt: Date.now(),
      attempts: 0,
      status: "pending",
    })
  })
}

/**
 * Delete a student record locally and queue for sync
 */
export async function deleteStudent(id: string): Promise<void> {
  await offlineDb.transaction("rw", [offlineDb.students, offlineDb.syncQueue], async () => {
    const existing = await offlineDb.students.get(id)
    if (!existing) return

    // If local-only, just delete
    if (isLocalId(id) && !existing.serverId) {
      await offlineDb.students.delete(id)
      // Remove any pending sync operations for this record
      await offlineDb.syncQueue
        .where({ entity: "student", entityId: id })
        .delete()
    } else {
      // Queue deletion for server
      await offlineDb.students.update(id, {
        syncStatus: "pending",
        localUpdatedAt: Date.now(),
      })
      await offlineDb.syncQueue.add({
        operation: "DELETE",
        entity: "student",
        entityId: id,
        payload: { id: existing.serverId || id },
        createdAt: Date.now(),
        attempts: 0,
        status: "pending",
      })
    }
  })
}

/**
 * Add attendance record locally and queue for sync
 */
export async function addAttendance(
  data: Omit<LocalAttendance, "id" | keyof SyncMetadata>
): Promise<LocalAttendance> {
  const id = generateLocalId()
  const attendance: LocalAttendance = {
    ...data,
    id,
    ...createSyncMetadata(),
  }

  await offlineDb.transaction("rw", [offlineDb.attendance, offlineDb.syncQueue], async () => {
    await offlineDb.attendance.add(attendance)
    await offlineDb.syncQueue.add({
      operation: "CREATE",
      entity: "attendance",
      entityId: id,
      payload: data,
      createdAt: Date.now(),
      attempts: 0,
      status: "pending",
    })
  })

  return attendance
}

/**
 * Update attendance record locally and queue for sync
 */
export async function updateAttendance(
  id: string,
  data: Partial<Omit<LocalAttendance, "id" | keyof SyncMetadata>>
): Promise<void> {
  await offlineDb.transaction("rw", [offlineDb.attendance, offlineDb.syncQueue], async () => {
    const existing = await offlineDb.attendance.get(id)
    if (!existing) throw new Error(`Attendance ${id} not found`)

    const updated: LocalAttendance = {
      ...existing,
      ...data,
      ...updateSyncMetadata(existing),
    }

    await offlineDb.attendance.put(updated)
    await offlineDb.syncQueue.add({
      operation: "UPDATE",
      entity: "attendance",
      entityId: id,
      payload: data,
      createdAt: Date.now(),
      attempts: 0,
      status: "pending",
    })
  })
}

// ============================================================================
// Query Helpers
// ============================================================================

/**
 * Get all students with optional filters
 */
export async function getStudents(filters?: {
  status?: LocalStudent["status"]
  grade?: string
  classId?: string
}): Promise<LocalStudent[]> {
  let query = offlineDb.students.toCollection()

  if (filters?.status) {
    query = offlineDb.students.where("status").equals(filters.status)
  }

  const students = await query.toArray()

  // Apply additional filters
  return students.filter((s) => {
    if (filters?.grade && s.grade !== filters.grade) return false
    if (filters?.classId && s.classId !== filters.classId) return false
    return true
  })
}

/**
 * Get attendance for a student on a specific date
 */
export async function getAttendance(
  studentId: string,
  date: string
): Promise<LocalAttendance | undefined> {
  return offlineDb.attendance
    .where("[studentId+date]")
    .equals([studentId, date])
    .first()
}

/**
 * Get all attendance for a date
 */
export async function getAttendanceByDate(
  date: string
): Promise<LocalAttendance[]> {
  return offlineDb.attendance.where("date").equals(date).toArray()
}

/**
 * Get pending sync queue items
 */
export async function getPendingSyncItems(): Promise<SyncQueueItem[]> {
  return offlineDb.syncQueue.where("status").equals("pending").toArray()
}

/**
 * Get count of pending sync items
 */
export async function getPendingSyncCount(): Promise<number> {
  return offlineDb.syncQueue.where("status").equals("pending").count()
}

// ============================================================================
// Enrollment System CRUD Operations
// ============================================================================

/**
 * Get active school year with grades
 */
export async function getActiveSchoolYear(): Promise<LocalSchoolYear | undefined> {
  return offlineDb.schoolYears.where("isActive").equals(1).first()
}

/**
 * Get all school years
 */
export async function getSchoolYears(): Promise<LocalSchoolYear[]> {
  return offlineDb.schoolYears.toArray()
}

/**
 * Get grades for a school year
 */
export async function getGrades(schoolYearId: string): Promise<LocalGrade[]> {
  return offlineDb.grades
    .where("schoolYearId")
    .equals(schoolYearId)
    .sortBy("order")
}

/**
 * Get grades by level
 */
export async function getGradesByLevel(
  schoolYearId: string,
  level: SchoolLevel
): Promise<LocalGrade[]> {
  const grades = await offlineDb.grades
    .where("schoolYearId")
    .equals(schoolYearId)
    .toArray()

  return grades
    .filter((g) => g.level === level)
    .sort((a, b) => a.order - b.order)
}

/**
 * Add enrollment locally and queue for sync
 */
export async function addEnrollment(
  data: Omit<LocalEnrollment, "id" | keyof SyncMetadata>
): Promise<LocalEnrollment> {
  const id = generateLocalId()
  const enrollment: LocalEnrollment = {
    ...data,
    id,
    ...createSyncMetadata(),
  }

  await offlineDb.transaction(
    "rw",
    [offlineDb.enrollments, offlineDb.syncQueue],
    async () => {
      await offlineDb.enrollments.add(enrollment)
      await offlineDb.syncQueue.add({
        operation: "CREATE",
        entity: "enrollment",
        entityId: id,
        payload: data,
        createdAt: Date.now(),
        attempts: 0,
        status: "pending",
      })
    }
  )

  return enrollment
}

/**
 * Update enrollment locally and queue for sync
 */
export async function updateEnrollment(
  id: string,
  data: Partial<Omit<LocalEnrollment, "id" | keyof SyncMetadata>>
): Promise<LocalEnrollment> {
  let updated: LocalEnrollment

  await offlineDb.transaction(
    "rw",
    [offlineDb.enrollments, offlineDb.syncQueue],
    async () => {
      const existing = await offlineDb.enrollments.get(id)
      if (!existing) throw new Error(`Enrollment ${id} not found`)

      updated = {
        ...existing,
        ...data,
        ...updateSyncMetadata(existing),
      }

      await offlineDb.enrollments.put(updated)
      await offlineDb.syncQueue.add({
        operation: "UPDATE",
        entity: "enrollment",
        entityId: id,
        payload: data,
        createdAt: Date.now(),
        attempts: 0,
        status: "pending",
      })
    }
  )

  return updated!
}

/**
 * Get enrollment by ID
 */
export async function getEnrollment(id: string): Promise<LocalEnrollment | undefined> {
  return offlineDb.enrollments.get(id)
}

/**
 * Get all enrollments with optional filters
 */
export async function getEnrollments(filters?: {
  status?: EnrollmentStatusType
  schoolYearId?: string
  createdBy?: string
}): Promise<LocalEnrollment[]> {
  let enrollments: LocalEnrollment[]

  if (filters?.status && filters?.schoolYearId) {
    enrollments = await offlineDb.enrollments
      .where("[status+schoolYearId]")
      .equals([filters.status, filters.schoolYearId])
      .toArray()
  } else if (filters?.status) {
    enrollments = await offlineDb.enrollments
      .where("status")
      .equals(filters.status)
      .toArray()
  } else if (filters?.schoolYearId) {
    enrollments = await offlineDb.enrollments
      .where("schoolYearId")
      .equals(filters.schoolYearId)
      .toArray()
  } else {
    enrollments = await offlineDb.enrollments.toArray()
  }

  // Apply createdBy filter if needed
  if (filters?.createdBy) {
    enrollments = enrollments.filter((e) => e.createdBy === filters.createdBy)
  }

  return enrollments
}

/**
 * Get draft enrollments for a user (for recovery)
 */
export async function getDraftEnrollments(createdBy: string): Promise<LocalEnrollment[]> {
  const drafts = await offlineDb.enrollments
    .where("status")
    .equals("draft")
    .toArray()

  return drafts.filter(
    (d) =>
      d.createdBy === createdBy &&
      (!d.draftExpiresAt || d.draftExpiresAt > Date.now())
  )
}

/**
 * Search students for returning student lookup
 */
export async function searchStudents(query: string): Promise<LocalStudent[]> {
  const lowerQuery = query.toLowerCase()

  // Get all students and filter (Dexie doesn't support full-text search)
  const students = await offlineDb.students.toArray()

  return students.filter((s) => {
    // Search by student number
    if (s.studentNumber?.toLowerCase().includes(lowerQuery)) return true
    // Search by name
    if (s.firstName.toLowerCase().includes(lowerQuery)) return true
    if (s.lastName.toLowerCase().includes(lowerQuery)) return true
    // Search by full name
    if (`${s.firstName} ${s.lastName}`.toLowerCase().includes(lowerQuery)) return true
    // Search by DOB
    if (s.dateOfBirth?.includes(query)) return true
    return false
  })
}

/**
 * Add payment schedule locally
 */
export async function addPaymentSchedule(
  data: Omit<LocalPaymentSchedule, "id" | keyof SyncMetadata>
): Promise<LocalPaymentSchedule> {
  const id = generateLocalId()
  const schedule: LocalPaymentSchedule = {
    ...data,
    id,
    ...createSyncMetadata(),
  }

  await offlineDb.transaction(
    "rw",
    [offlineDb.paymentSchedules, offlineDb.syncQueue],
    async () => {
      await offlineDb.paymentSchedules.add(schedule)
      await offlineDb.syncQueue.add({
        operation: "CREATE",
        entity: "paymentSchedule",
        entityId: id,
        payload: data,
        createdAt: Date.now(),
        attempts: 0,
        status: "pending",
      })
    }
  )

  return schedule
}

/**
 * Get payment schedules for an enrollment
 */
export async function getPaymentSchedules(
  enrollmentId: string
): Promise<LocalPaymentSchedule[]> {
  return offlineDb.paymentSchedules
    .where("enrollmentId")
    .equals(enrollmentId)
    .sortBy("scheduleNumber")
}

/**
 * Add payment locally and queue for sync
 */
export async function addPayment(
  data: Omit<LocalPayment, "id" | keyof SyncMetadata>
): Promise<LocalPayment> {
  const id = generateLocalId()
  const payment: LocalPayment = {
    ...data,
    id,
    ...createSyncMetadata(),
  }

  await offlineDb.transaction(
    "rw",
    [offlineDb.payments, offlineDb.syncQueue],
    async () => {
      await offlineDb.payments.add(payment)
      await offlineDb.syncQueue.add({
        operation: "CREATE",
        entity: "payment",
        entityId: id,
        payload: { ...data, receiptImageBlob: undefined }, // Don't sync blob
        createdAt: Date.now(),
        attempts: 0,
        status: "pending",
      })
    }
  )

  return payment
}

/**
 * Get payments for an enrollment
 */
export async function getPayments(enrollmentId: string): Promise<LocalPayment[]> {
  return offlineDb.payments
    .where("enrollmentId")
    .equals(enrollmentId)
    .sortBy("recordedAt")
}

/**
 * Add enrollment note locally and queue for sync
 */
export async function addEnrollmentNote(
  data: Omit<LocalEnrollmentNote, "id" | keyof SyncMetadata>
): Promise<LocalEnrollmentNote> {
  const id = generateLocalId()
  const note: LocalEnrollmentNote = {
    ...data,
    id,
    ...createSyncMetadata(),
  }

  await offlineDb.transaction(
    "rw",
    [offlineDb.enrollmentNotes, offlineDb.syncQueue],
    async () => {
      await offlineDb.enrollmentNotes.add(note)
      await offlineDb.syncQueue.add({
        operation: "CREATE",
        entity: "enrollmentNote",
        entityId: id,
        payload: data,
        createdAt: Date.now(),
        attempts: 0,
        status: "pending",
      })
    }
  )

  return note
}

/**
 * Get enrollment notes
 */
export async function getEnrollmentNotes(
  enrollmentId: string
): Promise<LocalEnrollmentNote[]> {
  return offlineDb.enrollmentNotes
    .where("enrollmentId")
    .equals(enrollmentId)
    .toArray()
}

/**
 * Get enrollment count for a grade (for display in UI)
 */
export async function getEnrollmentCountByGrade(gradeId: string): Promise<number> {
  return offlineDb.enrollments
    .where("gradeId")
    .equals(gradeId)
    .filter((e) => e.status === "approved" || e.status === "submitted")
    .count()
}
