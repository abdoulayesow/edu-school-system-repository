import { NextResponse } from "next/server"
import { requirePerm } from "@/lib/authz"
import { createUser } from "@api/users/createUser"
import { Role } from "@prisma/client"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/admin/users
 * List all users
 */
export async function GET() {
  const { error } = await requirePerm("user_accounts", "view")
  if (error) return error

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
      },
      orderBy: { name: "asc" },
    })

    return NextResponse.json(users)
  } catch (err) {
    console.error("Error fetching users:", err)
    return NextResponse.json(
      { message: "Failed to fetch users" },
      { status: 500 }
    )
  }
}

// Email validation helper
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length > 3 && email.length < 255
}

// Admin-only endpoint to create users (replacement for /api/register)
// POST body: { email, password?, name?, role? }
export async function POST(req: Request) {
  const { error } = await requirePerm("user_accounts", "create")
  if (error) return error

  const body = await req.json().catch(() => null)
  if (!body || typeof body.email !== "string" || !isValidEmail(body.email)) {
    return NextResponse.json({ message: "Invalid email address" }, { status: 400 })
  }

  // Validate role if provided
  const validRoles = Object.values(Role)
  let validatedRole: Role | undefined
  if (body.role && typeof body.role === "string") {
    if (!validRoles.includes(body.role as Role)) {
      return NextResponse.json(
        { message: `Invalid role. Must be one of: ${validRoles.join(", ")}` },
        { status: 400 }
      )
    }
    validatedRole = body.role as Role
  }

  const result = await createUser({
    email: body.email,
    name: typeof body.name === "string" ? body.name : undefined,
    password: typeof body.password === "string" ? body.password : undefined,
    role: validatedRole,
    // If password is omitted, create as an invited user (invite-only flow).
    status: typeof body.status === "string" ? body.status : undefined,
  })

  if (!result.ok) {
    if (result.error === "USER_EXISTS") {
      return NextResponse.json({ message: "User already exists" }, { status: 409 })
    }
    return NextResponse.json({ message: result.error || "Unable to create user" }, { status: 400 })
  }

  // Include invitation link if token was generated
  const response: any = { ...result.user }
  if (result.invitationToken) {
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
    response.invitationLink = `${baseUrl}/auth/set-password?token=${result.invitationToken}`
  }

  return NextResponse.json(response, { status: 201 })
}
