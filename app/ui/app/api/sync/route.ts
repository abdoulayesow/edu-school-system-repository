import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

// ============================================================================
// Types
// ============================================================================

interface SyncOperation {
  id: number // Client queue ID
  operation: "CREATE" | "UPDATE" | "DELETE"
  entity: "student" | "attendance" | "user"
  entityId: string
  payload: Record<string, unknown>
  createdAt: number
}

interface SyncRequest {
  lastSyncTimestamp?: string
  operations: SyncOperation[]
}

interface SyncConflict {
  operationId: number
  entity: string
  entityId: string
  localValue: Record<string, unknown>
  serverValue: Record<string, unknown>
}

interface SyncResponse {
  success: boolean
  syncTimestamp: string
  results: Array<{
    id: number
    success: boolean
    serverId?: string
    error?: string
  }>
  conflicts: SyncConflict[]
  remoteChanges: Array<{
    entity: string
    id: string
    data: Record<string, unknown>
    operation: "created" | "updated" | "deleted"
    updatedAt: string
  }>
}

// ============================================================================
// POST /api/sync - Process sync operations
// ============================================================================

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body: SyncRequest = await req.json()
    const { operations, lastSyncTimestamp } = body

    const results: SyncResponse["results"] = []
    const conflicts: SyncConflict[] = []
    const syncTimestamp = new Date().toISOString()

    // Process each operation
    for (const op of operations) {
      try {
        const result = await processOperation(op, session.user.id)
        results.push({
          id: op.id,
          success: true,
          serverId: result.serverId,
        })
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error"

        // Check if it's a conflict
        if (errorMessage.startsWith("CONFLICT:")) {
          const serverValue = JSON.parse(errorMessage.replace("CONFLICT:", ""))
          conflicts.push({
            operationId: op.id,
            entity: op.entity,
            entityId: op.entityId,
            localValue: op.payload,
            serverValue,
          })
          results.push({
            id: op.id,
            success: false,
            error: "Conflict detected",
          })
        } else {
          results.push({
            id: op.id,
            success: false,
            error: errorMessage,
          })
        }
      }
    }

    // Get remote changes since last sync
    const remoteChanges = await getRemoteChanges(
      session.user.id,
      lastSyncTimestamp
    )

    const response: SyncResponse = {
      success: true,
      syncTimestamp,
      results,
      conflicts,
      remoteChanges,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Sync error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// ============================================================================
// Process Individual Operations
// ============================================================================

async function processOperation(
  op: SyncOperation,
  userId: string
): Promise<{ serverId: string }> {
  switch (op.entity) {
    case "student":
      return processStudentOperation(op, userId)
    case "attendance":
      return processAttendanceOperation(op, userId)
    case "user":
      return processUserOperation(op, userId)
    default:
      throw new Error(`Unknown entity: ${op.entity}`)
  }
}

async function processStudentOperation(
  op: SyncOperation,
  _userId: string
): Promise<{ serverId: string }> {
  const { operation, entityId, payload } = op

  // Extract allowed fields for student
  const studentData = {
    firstName: payload.firstName as string,
    lastName: payload.lastName as string,
    email: payload.email as string | undefined,
    dateOfBirth: payload.dateOfBirth ? new Date(payload.dateOfBirth as string) : undefined,
    guardianName: payload.guardianName as string | undefined,
    guardianPhone: payload.guardianPhone as string | undefined,
    guardianEmail: payload.guardianEmail as string | undefined,
    grade: payload.grade as string | undefined,
    classId: payload.classId as string | undefined,
    status: payload.status as "active" | "inactive" | "graduated" | "transferred" | "suspended" | undefined,
    enrollmentDate: payload.enrollmentDate ? new Date(payload.enrollmentDate as string) : undefined,
  }

  switch (operation) {
    case "CREATE": {
      const student = await prisma.student.create({
        data: {
          ...studentData,
          syncVersion: 1,
        },
      })
      return { serverId: student.id }
    }

    case "UPDATE": {
      // Check for conflicts by comparing syncVersion
      const existing = await prisma.student.findUnique({
        where: { id: entityId },
      })

      if (!existing) {
        throw new Error("Student not found")
      }

      // Check for conflict (server has newer version)
      const clientSyncVersion = (payload.syncVersion as number) || 0
      if (existing.syncVersion > clientSyncVersion) {
        throw new Error(`CONFLICT:${JSON.stringify(existing)}`)
      }

      await prisma.student.update({
        where: { id: entityId },
        data: {
          ...studentData,
          syncVersion: existing.syncVersion + 1,
        },
      })

      return { serverId: entityId }
    }

    case "DELETE": {
      await prisma.student.delete({
        where: { id: entityId },
      })
      return { serverId: entityId }
    }

    default:
      throw new Error(`Unknown operation: ${operation}`)
  }
}

async function processAttendanceOperation(
  op: SyncOperation,
  userId: string
): Promise<{ serverId: string }> {
  const { operation, entityId, payload } = op

  // Extract allowed fields for attendance
  const attendanceData = {
    studentId: payload.studentId as string,
    date: new Date(payload.date as string),
    status: payload.status as "present" | "absent" | "late" | "excused",
    notes: payload.notes as string | undefined,
    recordedBy: userId,
  }

  switch (operation) {
    case "CREATE": {
      const attendance = await prisma.attendance.create({
        data: {
          ...attendanceData,
          syncVersion: 1,
        },
      })
      return { serverId: attendance.id }
    }

    case "UPDATE": {
      // Check for conflicts by comparing syncVersion
      const existing = await prisma.attendance.findUnique({
        where: { id: entityId },
      })

      if (!existing) {
        throw new Error("Attendance record not found")
      }

      // Check for conflict (server has newer version)
      const clientSyncVersion = (payload.syncVersion as number) || 0
      if (existing.syncVersion > clientSyncVersion) {
        throw new Error(`CONFLICT:${JSON.stringify(existing)}`)
      }

      await prisma.attendance.update({
        where: { id: entityId },
        data: {
          ...attendanceData,
          syncVersion: existing.syncVersion + 1,
        },
      })

      return { serverId: entityId }
    }

    case "DELETE": {
      await prisma.attendance.delete({
        where: { id: entityId },
      })
      return { serverId: entityId }
    }

    default:
      throw new Error(`Unknown operation: ${operation}`)
  }
}

async function processUserOperation(
  op: SyncOperation,
  userId: string
): Promise<{ serverId: string }> {
  const { operation, entityId, payload } = op

  // Users can only update their own profile
  if (entityId !== userId && operation !== "CREATE") {
    throw new Error("Unauthorized: Can only modify own user record")
  }

  switch (operation) {
    case "UPDATE": {
      // Check for conflicts
      const existing = await prisma.user.findUnique({
        where: { id: entityId },
      })

      if (!existing) {
        throw new Error("User not found")
      }

      // Update user profile
      const updatedFields: Record<string, unknown> = {}
      const allowedFields = ["name", "phone", "dateOfBirth"]

      for (const field of allowedFields) {
        if (field in payload) {
          updatedFields[field] = payload[field]
        }
      }

      await prisma.user.update({
        where: { id: entityId },
        data: updatedFields,
      })

      // Update address if provided
      if (payload.address && typeof payload.address === "object") {
        const addressData = payload.address as Record<string, unknown>
        await prisma.address.upsert({
          where: { userId: entityId },
          update: addressData,
          create: {
            userId: entityId,
            ...addressData,
          },
        })
      }

      return { serverId: entityId }
    }

    default:
      throw new Error(`User ${operation} not supported via sync`)
  }
}

// ============================================================================
// Get Remote Changes
// ============================================================================

async function getRemoteChanges(
  _userId: string,
  lastSyncTimestamp?: string
): Promise<SyncResponse["remoteChanges"]> {
  const changes: SyncResponse["remoteChanges"] = []
  const since = lastSyncTimestamp ? new Date(lastSyncTimestamp) : new Date(0)

  // Get students updated since last sync
  const students = await prisma.student.findMany({
    where: { updatedAt: { gt: since } },
    orderBy: { updatedAt: "asc" },
  })

  for (const student of students) {
    changes.push({
      entity: "student",
      id: student.id,
      data: {
        ...student,
        dateOfBirth: student.dateOfBirth?.toISOString(),
        enrollmentDate: student.enrollmentDate.toISOString(),
        createdAt: student.createdAt.toISOString(),
        updatedAt: student.updatedAt.toISOString(),
      },
      operation: "updated",
      updatedAt: student.updatedAt.toISOString(),
    })
  }

  // Get attendance updated since last sync
  const attendance = await prisma.attendance.findMany({
    where: { updatedAt: { gt: since } },
    orderBy: { updatedAt: "asc" },
  })

  for (const record of attendance) {
    changes.push({
      entity: "attendance",
      id: record.id,
      data: {
        ...record,
        date: record.date.toISOString(),
        createdAt: record.createdAt.toISOString(),
        updatedAt: record.updatedAt.toISOString(),
      },
      operation: "updated",
      updatedAt: record.updatedAt.toISOString(),
    })
  }

  return changes
}

// ============================================================================
// GET /api/sync - Get sync status and pending changes
// ============================================================================

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const lastSyncTimestamp = searchParams.get("since") || undefined

    const remoteChanges = await getRemoteChanges(
      session.user.id,
      lastSyncTimestamp
    )

    return NextResponse.json({
      success: true,
      syncTimestamp: new Date().toISOString(),
      changes: remoteChanges,
    })
  } catch (error) {
    console.error("Sync GET error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
