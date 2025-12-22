import { NextResponse } from "next/server"
import { requireRole } from "@/lib/authz"
import { createUser } from "@api/users/createUser"
import { VALID_ROLES, type AppRole } from "@/lib/rbac"

// Email validation helper
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length > 3 && email.length < 255
}

// Admin-only endpoint to create users (replacement for /api/register)
// POST body: { email, password?, name?, role? }
export async function POST(req: Request) {
  const { error } = await requireRole(["director"])
  if (error) return error

  const body = await req.json().catch(() => null)
  if (!body || typeof body.email !== "string" || !isValidEmail(body.email)) {
    return NextResponse.json({ message: "Invalid email address" }, { status: 400 })
  }

  // Validate role if provided
  let validatedRole: AppRole | undefined
  if (body.role && typeof body.role === "string") {
    if (!VALID_ROLES.includes(body.role as AppRole)) {
      return NextResponse.json(
        { message: `Invalid role. Must be one of: ${VALID_ROLES.join(", ")}` },
        { status: 400 }
      )
    }
    validatedRole = body.role as AppRole
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
    return NextResponse.json({ message: "Unable to create user" }, { status: 400 })
  }

  return NextResponse.json(result.user, { status: 201 })
}
