import { NextRequest, NextResponse } from "next/server"
import { requireSession } from "@/lib/authz"
import { prisma } from "@/lib/prisma"

type RouteParams = { params: Promise<{ id: string }> }

/**
 * GET /api/club-enrollments/[id]
 * Get a single club enrollment by ID
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  const { error } = await requireSession()
  if (error) return error

  try {
    const { id } = await params

    const enrollment = await prisma.clubEnrollment.findUnique({
      where: { id },
      include: {
        club: {
          select: {
            id: true,
            name: true,
            nameFr: true,
            fee: true,
            monthlyFee: true,
          },
        },
        studentProfile: {
          include: {
            person: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                photoUrl: true,
              },
            },
          },
        },
        payments: true,
      },
    })

    if (!enrollment) {
      return NextResponse.json(
        { message: "Enrollment not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(enrollment)
  } catch (err) {
    console.error("Error fetching enrollment:", err)
    return NextResponse.json(
      { message: "Failed to fetch enrollment" },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/club-enrollments/[id]
 * Update a club enrollment
 */
export async function PUT(req: NextRequest, { params }: RouteParams) {
  const { session, error } = await requireSession()
  if (error) return error

  try {
    const { id } = await params
    const body = await req.json()
    const { status, notes } = body

    const enrollment = await prisma.clubEnrollment.findUnique({
      where: { id },
    })

    if (!enrollment) {
      return NextResponse.json(
        { message: "Enrollment not found" },
        { status: 404 }
      )
    }

    const updated = await prisma.clubEnrollment.update({
      where: { id },
      data: {
        ...(status && { status }),
        syncVersion: { increment: 1 },
      },
      include: {
        club: {
          select: { id: true, name: true },
        },
        studentProfile: {
          include: {
            person: {
              select: { firstName: true, lastName: true },
            },
          },
        },
      },
    })

    return NextResponse.json({
      id: updated.id,
      status: updated.status,
      club: updated.club,
      student: {
        id: updated.studentProfile.id,
        name: `${updated.studentProfile.person.firstName} ${updated.studentProfile.person.lastName}`,
      },
    })
  } catch (err) {
    console.error("Error updating enrollment:", err)
    return NextResponse.json(
      { message: "Failed to update enrollment" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/club-enrollments/[id]
 * Delete a club enrollment
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const { error } = await requireSession()
  if (error) return error

  try {
    const { id } = await params

    await prisma.clubEnrollment.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Error deleting enrollment:", err)
    return NextResponse.json(
      { message: "Failed to delete enrollment" },
      { status: 500 }
    )
  }
}
