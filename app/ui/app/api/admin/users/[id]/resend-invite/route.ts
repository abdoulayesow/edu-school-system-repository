import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { randomBytes } from "crypto"
import { sendInvitationEmail } from "@/lib/email/resend"

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * POST /api/admin/users/[id]/resend-invite
 * Resend an invitation email
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  const { session, error } = await requireRole(["director"])
  if (error) return error
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  try {
    const invitation = await prisma.userInvitation.findUnique({
      where: { id },
      include: {
        inviter: {
          select: {
            name: true,
          },
        },
      },
    })

    if (!invitation) {
      return NextResponse.json(
        { message: "Invitation not found" },
        { status: 404 }
      )
    }

    if (invitation.acceptedAt) {
      return NextResponse.json(
        { message: "Invitation has already been accepted" },
        { status: 400 }
      )
    }

    // Generate new token and extend expiration
    const token = randomBytes(32).toString("hex")
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    // Update invitation
    await prisma.userInvitation.update({
      where: { id },
      data: {
        token,
        expiresAt,
        invitedBy: session.user.id, // Update to current user
      },
    })

    // Get the current user's name for the email
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true },
    })

    // Detect locale from Accept-Language header (default to French)
    const acceptLanguage = req.headers.get("accept-language") || ""
    const locale = acceptLanguage.toLowerCase().startsWith("en") ? "en" : "fr"

    // Send invitation email
    const emailResult = await sendInvitationEmail({
      to: invitation.email,
      inviteeName: invitation.name || undefined,
      inviterName: currentUser?.name || "GSPN Admin",
      role: invitation.role,
      token,
      expiresAt,
      locale,
    })

    if (!emailResult.success) {
      return NextResponse.json(
        { message: `Failed to send invitation email: ${emailResult.error}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: "Invitation resent successfully",
      expiresAt,
    })
  } catch (err) {
    console.error("Error resending invitation:", err)
    return NextResponse.json(
      { message: "Failed to resend invitation" },
      { status: 500 }
    )
  }
}
