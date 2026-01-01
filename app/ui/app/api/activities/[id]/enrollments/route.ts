import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const enrollStudentSchema = z.object({
  studentProfileId: z.string().min(1, "Student profile ID is required"),
})

type RouteParams = { params: Promise<{ id: string }> }

/**
 * POST /api/activities/[id]/enrollments
 * Enroll a student in an activity (from the activities page)
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  const { session, error } = await requireRole(["director", "academic_director", "accountant", "secretary"])
  if (error) return error

  try {
    const { id } = await params
    const body = await req.json()
    const validated = enrollStudentSchema.parse(body)

    // Check activity exists and is active
    const activity = await prisma.activity.findUnique({
      where: { id },
      include: {
        _count: { select: { enrollments: { where: { status: "active" } } } },
      },
    })

    if (!activity) {
      return NextResponse.json(
        { message: "Activity not found" },
        { status: 404 }
      )
    }

    if (activity.status !== "active") {
      return NextResponse.json(
        { message: "Activity is not open for enrollment" },
        { status: 400 }
      )
    }

    if (activity._count.enrollments >= activity.capacity) {
      return NextResponse.json(
        { message: "Activity is at full capacity" },
        { status: 400 }
      )
    }

    // Check student profile exists
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { id: validated.studentProfileId },
    })

    if (!studentProfile) {
      return NextResponse.json(
        { message: "Student not found" },
        { status: 404 }
      )
    }

    // Check if student has completed enrollment
    const hasCompletedEnrollment = await prisma.enrollment.findFirst({
      where: {
        studentId: studentProfile.studentId || undefined,
        schoolYear: { isActive: true },
        status: "completed",
      },
    })

    if (!hasCompletedEnrollment) {
      return NextResponse.json(
        { message: "Student must have a completed enrollment to join activities" },
        { status: 400 }
      )
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.activityEnrollment.findUnique({
      where: {
        activityId_studentProfileId: {
          activityId: id,
          studentProfileId: validated.studentProfileId,
        },
      },
    })

    if (existingEnrollment) {
      if (existingEnrollment.status === "withdrawn") {
        // Re-activate withdrawn enrollment
        const updated = await prisma.activityEnrollment.update({
          where: { id: existingEnrollment.id },
          data: { status: "active" },
        })
        return NextResponse.json(updated)
      }
      return NextResponse.json(
        { message: "Student is already enrolled in this activity" },
        { status: 400 }
      )
    }

    const enrollment = await prisma.activityEnrollment.create({
      data: {
        activityId: id,
        studentProfileId: validated.studentProfileId,
        enrolledBy: session!.user.id,
        status: "active",
      },
      include: {
        activity: {
          select: { id: true, name: true, type: true },
        },
      },
    })

    return NextResponse.json(enrollment, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: err.errors },
        { status: 400 }
      )
    }
    console.error("Error enrolling student:", err)
    return NextResponse.json(
      { message: "Failed to enroll student" },
      { status: 500 }
    )
  }
}
