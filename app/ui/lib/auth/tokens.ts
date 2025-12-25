import { randomBytes } from "crypto"
import { prisma } from "@/lib/prisma"

const TOKEN_EXPIRY_HOURS = 24

/**
 * Generate a cryptographically secure random token
 */
export function generateSecureToken(): string {
  return randomBytes(32).toString("hex")
}

/**
 * Create a password reset token for a user
 * @param userId - The ID of the user requesting password reset
 * @returns The generated token string
 */
export async function createPasswordResetToken(userId: string): Promise<string> {
  // Delete any existing tokens for this user
  await prisma.passwordResetToken.deleteMany({
    where: { userId },
  })

  // Generate new token
  const token = generateSecureToken()
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000)

  // Store token in database
  await prisma.passwordResetToken.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  })

  return token
}

/**
 * Validate a password reset token
 * @param token - The token to validate
 * @returns Object with validation result and associated userId if valid
 */
export async function validatePasswordResetToken(
  token: string
): Promise<{ valid: boolean; userId?: string; error?: string }> {
  if (!token || token.trim() === "") {
    return { valid: false, error: "TOKEN_REQUIRED" }
  }

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
    include: { user: true },
  })

  if (!resetToken) {
    return { valid: false, error: "TOKEN_NOT_FOUND" }
  }

  // Check if token has expired
  if (resetToken.expiresAt < new Date()) {
    // Delete expired token
    await prisma.passwordResetToken.delete({
      where: { id: resetToken.id },
    })
    return { valid: false, error: "TOKEN_EXPIRED" }
  }

  return { valid: true, userId: resetToken.userId }
}

/**
 * Consume (delete) a password reset token after successful use
 * @param token - The token to consume
 */
export async function consumePasswordResetToken(token: string): Promise<void> {
  await prisma.passwordResetToken.deleteMany({
    where: { token },
  })
}

/**
 * Delete all expired tokens (cleanup utility)
 */
export async function cleanupExpiredTokens(): Promise<number> {
  const result = await prisma.passwordResetToken.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  })
  return result.count
}
