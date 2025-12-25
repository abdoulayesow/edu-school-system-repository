import { NextResponse } from "next/server"
import { validatePasswordResetToken } from "@/lib/auth/tokens"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get("token")

  if (!token) {
    return NextResponse.json(
      { valid: false, error: "Token is required" },
      { status: 400 }
    )
  }

  const validation = await validatePasswordResetToken(token)

  if (!validation.valid) {
    return NextResponse.json(
      { valid: false, error: validation.error },
      { status: 400 }
    )
  }

  return NextResponse.json({ valid: true })
}
