import { NextRequest, NextResponse } from "next/server"
import { requireSession } from "@/lib/authz"
import { prisma } from "@/lib/prisma"

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/attendance/sessions/[id]
 * Get a single attendance session with all records
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  const { error } = await requireSession()
  if (error) return error

  const { id } = await params

  try {
    const session = await prisma.attendanceSession.findUnique({
      where: { id },
      include: {
        grade: {
          select: { id: true, name: true, level: true, order: true },
        },
        recorder: { select: { id: true, name: true, email: true } },
        records: {
          include: {
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
            recorder: { select: { id: true, name: true } },
          },
          orderBy: {
            studentProfile: {
              person: { lastName: "asc" },
            },
          },
        },
      },
    })

    if (!session) {
      return NextResponse.json(
        { message: "Attendance session not found" },
        { status: 404 }
      )
    }

    // Calculate summary
    const summary = {
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
      total: session.records.length,
    }

    for (const record of session.records) {
      const statusKey = record.status as keyof typeof summary
      if (typeof summary[statusKey] === "number") {
        summary[statusKey]++
      }
    }

    return NextResponse.json({
      ...session,
      summary,
    })
  } catch (err) {
    console.error("Error fetching attendance session:", err)
    return NextResponse.json(
      { message: "Failed to fetch attendance session" },
      { status: 500 }
    )
  }
}
