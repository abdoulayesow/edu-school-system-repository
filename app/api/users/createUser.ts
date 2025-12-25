import bcrypt from "bcrypt"

import { prisma } from "@db/prisma"
import { normalizeRole, type AppRole } from "@/lib/rbac"
import { createPasswordResetToken } from "@/lib/auth/tokens"

// Password strength validation
function validatePassword(password: string): { valid: boolean; error?: string } {
  if (password.length < 8) {
    return { valid: false, error: "Password must be at least 8 characters" }
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, error: "Password must contain a lowercase letter" }
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: "Password must contain an uppercase letter" }
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, error: "Password must contain a number" }
  }
  return { valid: true }
}

export type CreateUserInput = {
  email: string
  name?: string
  password?: string
  role?: AppRole | string
  status?: "invited" | "active" | "inactive"
}

export async function createUser(input: CreateUserInput) {
  const email = input.email.trim().toLowerCase()
  const name = input.name
  const role = normalizeRole(typeof input.role === "string" ? input.role : (input.role ?? "user"))
  const status = input.status ?? (input.password ? "active" : "invited")

  // Validate password strength if password is provided
  if (input.password) {
    const validation = validatePassword(input.password)
    if (!validation.valid) {
      return { ok: false as const, error: validation.error! }
    }
  }

  const passwordHash = input.password ? await bcrypt.hash(input.password, 12) : undefined

  const exists = await prisma.user.findUnique({ where: { email } })
  if (exists) {
    return { ok: false as const, error: "USER_EXISTS" as const }
  }

  const user = await prisma.user.create({
    data: {
      email,
      name,
      role,
      status,
      ...(passwordHash ? { passwordHash } : {}),
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      image: true,
      emailVerified: true,
    },
  })

  // Generate invitation token if user was created without password
  let invitationToken: string | undefined
  if (!input.password && status === "invited") {
    invitationToken = await createPasswordResetToken(user.id)
  }

  return { ok: true as const, user, invitationToken }
}
