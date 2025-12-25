import { NextResponse } from "next/server"
import bcrypt from "bcrypt"
import { prisma } from "@/lib/prisma"
import { validatePasswordResetToken, consumePasswordResetToken } from "@/lib/auth/tokens"

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

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { token, password } = body

    if (!token || !password) {
      return NextResponse.json(
        { message: "Token and password are required" },
        { status: 400 }
      )
    }

    // Validate password strength
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { message: passwordValidation.error },
        { status: 400 }
      )
    }

    // Validate token
    const tokenValidation = await validatePasswordResetToken(token)
    if (!tokenValidation.valid || !tokenValidation.userId) {
      return NextResponse.json(
        { message: "Invalid or expired token" },
        { status: 400 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Update user password and activate account
    await prisma.user.update({
      where: { id: tokenValidation.userId },
      data: {
        passwordHash,
        status: "active", // Activate the account
      },
    })

    // Consume token (delete it)
    await consumePasswordResetToken(token)

    return NextResponse.json({
      message: "Password set successfully",
    })
  } catch (error) {
    console.error("Error setting password:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
