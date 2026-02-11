import { NextRequest, NextResponse } from "next/server"
import { requirePerm } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

interface RouteParams {
  params: Promise<{ id: string }>
}

const updateHoursSchema = z.object({
  totalHours: z.number().positive().optional(),
  notes: z.string().optional().nullable(),
})

/**
 * GET /api/salary-hours/[id]
 * Get a single hours record with all relations
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  const { error } = await requirePerm("salary_hours", "view")
  if (error) return error

  const { id } = await params

  try {
    const record = await prisma.hoursRecord.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
        submitter: {
          select: { id: true, name: true },
        },
        reviewer: {
          select: { id: true, name: true },
        },
        schoolYear: {
          select: { id: true, name: true },
        },
      },
    })

    if (!record) {
      return NextResponse.json(
        { message: "Hours record not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(record)
  } catch (err) {
    console.error("Error fetching hours record:", err)
    return NextResponse.json(
      { message: "Failed to fetch hours record" },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/salary-hours/[id]
 * Update a hours record (only in draft status)
 */
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const { error } = await requirePerm("salary_hours", "update")
  if (error) return error

  const { id } = await params

  try {
    const existing = await prisma.hoursRecord.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { message: "Hours record not found" },
        { status: 404 }
      )
    }

    if (existing.status !== "draft") {
      return NextResponse.json(
        { message: "Can only edit hours records in draft status" },
        { status: 400 }
      )
    }

    const body = await req.json()
    const validated = updateHoursSchema.parse(body)

    const record = await prisma.hoursRecord.update({
      where: { id },
      data: validated,
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
        schoolYear: {
          select: { id: true, name: true },
        },
      },
    })

    return NextResponse.json(record)
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: err.errors },
        { status: 400 }
      )
    }
    console.error("Error updating hours record:", err)
    return NextResponse.json(
      { message: "Failed to update hours record" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/salary-hours/[id]
 * Delete a hours record (only in draft status)
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const { error } = await requirePerm("salary_hours", "delete")
  if (error) return error

  const { id } = await params

  try {
    const existing = await prisma.hoursRecord.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { message: "Hours record not found" },
        { status: 404 }
      )
    }

    if (existing.status !== "draft") {
      return NextResponse.json(
        { message: "Can only delete hours records in draft status" },
        { status: 400 }
      )
    }

    await prisma.hoursRecord.delete({ where: { id } })

    return NextResponse.json({ message: "Hours record deleted" })
  } catch (err) {
    console.error("Error deleting hours record:", err)
    return NextResponse.json(
      { message: "Failed to delete hours record" },
      { status: 500 }
    )
  }
}
