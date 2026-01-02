import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createPasswordResetToken } from "@/lib/auth/tokens"
import { sendPasswordResetEmail } from "@/lib/email/resend"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, locale = "fr" } = body

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      )
    }

    const normalizedEmail = email.trim().toLowerCase()

    // Always return success to prevent email enumeration attacks
    const successResponse = NextResponse.json({
      message: "If an account with this email exists, a password reset link has been sent.",
    })

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, name: true, email: true, status: true },
    })

    // If no user found, or user is inactive, return success anyway (security)
    if (!user || user.status === "inactive") {
      console.log(`Password reset requested for unknown/inactive email: ${normalizedEmail}`)
      return successResponse
    }

    // Create password reset token
    const token = await createPasswordResetToken(user.id)

    // Send reset email
    const emailResult = await sendPasswordResetEmail({
      to: user.email!,
      userName: user.name ?? undefined,
      token,
      locale: locale as "en" | "fr",
    })

    if (!emailResult.success) {
      console.error(`Failed to send password reset email to ${normalizedEmail}:`, emailResult.error)
      // Still return success to prevent enumeration
    } else {
      console.log(`Password reset email sent to ${normalizedEmail}`)
    }

    return successResponse
  } catch (error) {
    console.error("Error in forgot password:", error)
    return NextResponse.json(
      { message: "An error occurred. Please try again later." },
      { status: 500 }
    )
  }
}
