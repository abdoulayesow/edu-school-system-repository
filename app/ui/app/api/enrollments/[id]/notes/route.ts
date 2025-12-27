import { NextRequest, NextResponse } from "next/server"
import { requireSession } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Schema for creating a note
const createNoteSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
})

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/enrollments/[id]/notes
 * Get all notes for an enrollment
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  const { error } = await requireSession()
  if (error) return error

  const { id } = await params

  try {
    const notes = await prisma.enrollmentNote.findMany({
      where: { enrollmentId: id },
      include: {
        author: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(notes)
  } catch (err) {
    console.error("Error fetching notes:", err)
    return NextResponse.json(
      { message: "Failed to fetch notes" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/enrollments/[id]/notes
 * Add a note to an enrollment
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  const { session, error } = await requireSession()
  if (error) return error

  const { id } = await params

  try {
    // Verify enrollment exists
    const enrollment = await prisma.enrollment.findUnique({
      where: { id },
    })

    if (!enrollment) {
      return NextResponse.json(
        { message: "Enrollment not found" },
        { status: 404 }
      )
    }

    const body = await req.json()
    const validated = createNoteSchema.parse(body)

    const note = await prisma.enrollmentNote.create({
      data: {
        enrollmentId: id,
        title: validated.title,
        content: validated.content,
        createdBy: session.user.id,
      },
      include: {
        author: { select: { name: true, email: true } },
      },
    })

    return NextResponse.json(note, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: err.errors },
        { status: 400 }
      )
    }
    console.error("Error creating note:", err)
    return NextResponse.json(
      { message: "Failed to create note" },
      { status: 500 }
    )
  }
}
