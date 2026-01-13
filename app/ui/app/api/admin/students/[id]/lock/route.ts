import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requirePerm } from "@/lib/authz"

// ============================================================================
// PATCH /api/admin/students/[id]/lock
// Toggle student lock status for auto-assignment
// ============================================================================

const lockSchema = z.object({
  isLocked: z.boolean()
})

type RouteParams = {
  params: Promise<{ id: string }>
}

export async function PATCH(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    // Require director or secretary role
    const { error } = await requirePerm("students", "update")
    if (error) return error

    const { id } = await params
    const body = await req.json()

    // Validate request body
    const validationResult = lockSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const { isLocked } = validationResult.data

    // Check if student profile exists
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { id },
      select: { id: true, studentNumber: true }
    })

    if (!studentProfile) {
      return NextResponse.json(
        { error: "Student profile not found" },
        { status: 404 }
      )
    }

    // Update lock status
    await prisma.studentProfile.update({
      where: { id },
      data: { isLockedForAutoAssign: isLocked }
    })

    return NextResponse.json({
      success: true,
      message: isLocked ? "Student locked for auto-assignment" : "Student unlocked for auto-assignment",
      data: {
        studentProfileId: id,
        isLocked
      }
    })

  } catch (error) {
    console.error("[STUDENT LOCK API]", error)
    return NextResponse.json(
      { error: "Failed to update student lock status" },
      { status: 500 }
    )
  }
}
