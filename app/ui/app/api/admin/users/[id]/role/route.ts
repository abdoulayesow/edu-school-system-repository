import { NextRequest, NextResponse } from "next/server"
import { requirePerm } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { StaffRole } from "@prisma/client"

interface RouteParams {
  params: Promise<{ id: string }>
}

const updateRoleSchema = z.object({
  staffRole: z.nativeEnum(StaffRole),
})

/**
 * PUT /api/admin/users/[id]/role
 * Update a user's role
 */
export async function PUT(req: NextRequest, { params }: RouteParams) {
  const { session, error } = await requirePerm("role_assignment", "update")
  if (error) return error

  const { id } = await params

  try {
    const body = await req.json()
    const validated = updateRoleSchema.parse(body)

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    })

    if (!existingUser) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      )
    }

    // Prevent self-demotion from owner role
    if (existingUser.id === session!.user.id &&
        existingUser.staffRole === StaffRole.proprietaire &&
        validated.staffRole !== StaffRole.proprietaire) {
      return NextResponse.json(
        { message: "You cannot remove your own owner role" },
        { status: 403 }
      )
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        staffRole: validated.staffRole,
      },
      select: {
        id: true,
        name: true,
        email: true,
        staffRole: true,
        schoolLevel: true,
        status: true,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: err.errors },
        { status: 400 }
      )
    }
    console.error("Error updating user role:", err)
    return NextResponse.json(
      { message: "Failed to update user role" },
      { status: 500 }
    )
  }
}
