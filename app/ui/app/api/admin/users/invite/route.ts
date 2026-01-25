import { NextRequest, NextResponse } from "next/server"
import { requirePerm } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { randomBytes } from "crypto"
import { sendInvitationEmail } from "@/lib/email/resend"

const inviteUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().optional(),
  role: z.enum(["director", "academic_director", "secretary", "accountant", "teacher"]),
  locale: z.enum(["en", "fr"]).optional().default("fr"),
})

/**
 * POST /api/admin/users/invite
 * Send an invitation to a new user
 */
export async function POST(req: NextRequest) {
  const { session, error } = await requirePerm("user_accounts", "create")
  if (error) return error

  try {
    const body = await req.json()
    const validated = inviteUserSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { message: "A user with this email already exists" },
        { status: 400 }
      )
    }

    // Check for existing pending invitation
    const existingInvitation = await prisma.userInvitation.findFirst({
      where: {
        email: validated.email,
        acceptedAt: null,
        expiresAt: { gt: new Date() },
      },
    })

    if (existingInvitation) {
      return NextResponse.json(
        { message: "A pending invitation already exists for this email" },
        { status: 400 }
      )
    }

    // Generate invitation token
    const token = randomBytes(32).toString("hex")
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days expiration

    // Create invitation
    const invitation = await prisma.userInvitation.create({
      data: {
        email: validated.email,
        name: validated.name,
        role: validated.role,
        token,
        expiresAt,
        invitedBy: session!.user.id,
      },
      include: {
        inviter: {
          select: {
            name: true,
          },
        },
      },
    })

    // Send invitation email
    const emailResult = await sendInvitationEmail({
      to: validated.email,
      inviteeName: validated.name,
      inviterName: invitation.inviter.name || "GSPN Admin",
      role: validated.role,
      token,
      expiresAt,
      locale: validated.locale,
    })

    if (!emailResult.success) {
      // Delete invitation if email fails
      await prisma.userInvitation.delete({
        where: { id: invitation.id },
      })

      // Log error for debugging but don't expose details to client
      console.error("Email send failed:", emailResult.error)

      return NextResponse.json(
        { message: "Failed to send invitation email" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: "Invitation sent successfully",
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        expiresAt: invitation.expiresAt,
      },
    }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: err.errors },
        { status: 400 }
      )
    }
    console.error("Error sending invitation:", err)
    return NextResponse.json(
      { message: "Failed to send invitation" },
      { status: 500 }
    )
  }
}

/**
 * GET /api/admin/users/invite
 * List all invitations
 */
export async function GET(req: NextRequest) {
  const { error } = await requirePerm("user_accounts", "view")
  if (error) return error

  try {
    const invitations = await prisma.userInvitation.findMany({
      include: {
        inviter: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    // Add status to each invitation
    const invitationsWithStatus = invitations.map((inv) => ({
      ...inv,
      status: inv.acceptedAt
        ? "accepted"
        : inv.expiresAt < new Date()
        ? "expired"
        : "pending",
    }))

    return NextResponse.json(invitationsWithStatus)
  } catch (err) {
    console.error("Error fetching invitations:", err)
    return NextResponse.json(
      { message: "Failed to fetch invitations" },
      { status: 500 }
    )
  }
}
