import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { StaffRole } from "@prisma/client"

const acceptInvitationSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1, "Name is required"),
})

/**
 * Map invitation role (English) to StaffRole (French database enum)
 * This ensures users get the correct staffRole for permission checks
 */
const ROLE_TO_STAFF_ROLE: Record<string, StaffRole> = {
  director: StaffRole.proviseur,
  academic_director: StaffRole.censeur,
  secretary: StaffRole.secretariat,
  accountant: StaffRole.comptable,
  teacher: StaffRole.enseignant,
}

/**
 * GET /api/auth/accept-invitation
 * Validate invitation token
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get("token")

  if (!token) {
    return NextResponse.json(
      { message: "Token is required" },
      { status: 400 }
    )
  }

  try {
    const invitation = await prisma.userInvitation.findUnique({
      where: { token },
    })

    if (!invitation) {
      return NextResponse.json(
        { valid: false, message: "Invalid invitation token" },
        { status: 400 }
      )
    }

    if (invitation.acceptedAt) {
      return NextResponse.json(
        { valid: false, message: "Invitation has already been used" },
        { status: 400 }
      )
    }

    if (invitation.expiresAt < new Date()) {
      return NextResponse.json(
        { valid: false, message: "Invitation has expired" },
        { status: 400 }
      )
    }

    return NextResponse.json({
      valid: true,
      email: invitation.email,
      name: invitation.name,
      role: invitation.role,
    })
  } catch (err) {
    console.error("Error validating invitation:", err)
    return NextResponse.json(
      { valid: false, message: "Failed to validate invitation" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/auth/accept-invitation
 * Accept invitation and create user account
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validated = acceptInvitationSchema.parse(body)

    const invitation = await prisma.userInvitation.findUnique({
      where: { token: validated.token },
    })

    if (!invitation) {
      return NextResponse.json(
        { message: "Invalid invitation token" },
        { status: 400 }
      )
    }

    if (invitation.acceptedAt) {
      return NextResponse.json(
        { message: "Invitation has already been used" },
        { status: 400 }
      )
    }

    if (invitation.expiresAt < new Date()) {
      return NextResponse.json(
        { message: "Invitation has expired" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: invitation.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { message: "A user with this email already exists" },
        { status: 400 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(validated.password, 10)

    // Map invitation role to staffRole for permission system
    const staffRole = ROLE_TO_STAFF_ROLE[invitation.role]
    if (!staffRole) {
      return NextResponse.json(
        { message: `Invalid role: ${invitation.role}` },
        { status: 400 }
      )
    }

    // Create user and mark invitation as accepted in a transaction
    const user = await prisma.$transaction(async (tx) => {
      // Create user with both role (for display) and staffRole (for permissions)
      const newUser = await tx.user.create({
        data: {
          email: invitation.email,
          name: validated.name,
          passwordHash,
          role: invitation.role,
          staffRole, // Required for permission system
          status: "active",
        },
      })

      // Mark invitation as accepted
      await tx.userInvitation.update({
        where: { id: invitation.id },
        data: { acceptedAt: new Date() },
      })

      return newUser
    })

    return NextResponse.json({
      message: "Account created successfully",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: err.errors },
        { status: 400 }
      )
    }
    console.error("Error accepting invitation:", err)
    return NextResponse.json(
      { message: "Failed to create account" },
      { status: 500 }
    )
  }
}
