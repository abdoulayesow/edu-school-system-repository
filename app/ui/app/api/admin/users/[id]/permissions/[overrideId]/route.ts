import { NextRequest, NextResponse } from "next/server"
import { requirePerm } from "@/lib/authz"
import { prisma } from "@/lib/prisma"

interface RouteParams {
  params: Promise<{ id: string; overrideId: string }>
}

/**
 * DELETE /api/admin/users/[id]/permissions/[overrideId]
 * Remove a permission override
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const { session, error } = await requirePerm("permission_overrides", "delete")
  if (error) return error

  const { id, overrideId } = await params

  try {
    // Verify override exists and belongs to this user
    const override = await prisma.permissionOverride.findUnique({
      where: { id: overrideId },
    })

    if (!override) {
      return NextResponse.json(
        { message: "Override not found" },
        { status: 404 }
      )
    }

    if (override.userId !== id) {
      return NextResponse.json(
        { message: "Override does not belong to this user" },
        { status: 400 }
      )
    }

    await prisma.permissionOverride.delete({
      where: { id: overrideId },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Error deleting permission override:", err)
    return NextResponse.json(
      { message: "Failed to delete override" },
      { status: 500 }
    )
  }
}
