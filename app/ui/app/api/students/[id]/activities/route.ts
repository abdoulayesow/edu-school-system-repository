import { NextRequest, NextResponse } from "next/server"
import { requireSession } from "@/lib/authz"
import { prisma } from "@/lib/prisma"

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/students/[id]/activities
 * Get a student's activity enrollments
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  const { error } = await requireSession()
  if (error) return error

  const { id: studentId } = await params

  try {
    // Get current school year
    const currentSchoolYear = await prisma.schoolYear.findFirst({
      where: { isActive: true },
    })

    if (!currentSchoolYear) {
      return NextResponse.json({ activities: [] })
    }

    // Get student with profile
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        studentProfile: {
          include: {
            activityEnrollments: {
              where: {
                activity: { schoolYearId: currentSchoolYear.id },
              },
              include: {
                activity: {
                  select: {
                    id: true,
                    name: true,
                    description: true,
                    type: true,
                    status: true,
                    fee: true,
                    startDate: true,
                    endDate: true,
                  },
                },
              },
              orderBy: { enrolledAt: "desc" },
            },
          },
        },
      },
    })

    if (!student) {
      return NextResponse.json(
        { message: "Student not found" },
        { status: 404 }
      )
    }

    if (!student.studentProfile) {
      return NextResponse.json({ activities: [] })
    }

    // Transform to simpler structure
    const activities = student.studentProfile.activityEnrollments.map((ae) => ({
      enrollmentId: ae.id,
      status: ae.status,
      enrolledAt: ae.enrolledAt,
      activity: {
        id: ae.activity.id,
        name: ae.activity.name,
        description: ae.activity.description,
        type: ae.activity.type,
        status: ae.activity.status,
        fee: ae.activity.fee,
        startDate: ae.activity.startDate,
        endDate: ae.activity.endDate,
      },
    }))

    return NextResponse.json({ activities })
  } catch (err) {
    console.error("Error fetching student activities:", err)
    return NextResponse.json(
      { message: "Failed to fetch activities" },
      { status: 500 }
    )
  }
}
