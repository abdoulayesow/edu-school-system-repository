import { NextRequest, NextResponse } from "next/server"
import { requireSession } from "@/lib/authz"
import { prisma } from "@/lib/prisma"

type RouteParams = { params: Promise<{ id: string }> }

/**
 * GET /api/students/[id]/activities
 * Get student's club enrollments (activities)
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  const { session, error } = await requireSession()
  if (error) return error

  try {
    const { id } = await params

    // Fetch club enrollments for the student
    const clubEnrollments = await prisma.clubEnrollment.findMany({
      where: {
        studentProfileId: id,
      },
      include: {
        club: {
          select: {
            id: true,
            name: true,
            nameFr: true,
            category: {
              select: {
                name: true,
                nameFr: true,
              },
            },
          },
        },
      },
      orderBy: {
        enrolledAt: "desc",
      },
    })

    // Transform to activities format
    const activities = clubEnrollments.map((enrollment) => ({
      id: enrollment.id,
      type: "club",
      name: enrollment.club.name,
      nameFr: enrollment.club.nameFr,
      category: enrollment.club.category?.name || null,
      categoryFr: enrollment.club.category?.nameFr || null,
      status: enrollment.status,
      enrolledAt: enrollment.enrolledAt.toISOString(),
      enrollmentNumber: enrollment.enrollmentNumber,
    }))

    return NextResponse.json({ activities })
  } catch (err) {
    console.error("Error fetching student activities:", err)
    return NextResponse.json(
      { message: "Failed to fetch student activities" },
      { status: 500 }
    )
  }
}
