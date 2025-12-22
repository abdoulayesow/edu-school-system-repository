import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import type { AppRole } from "@/lib/rbac"

export async function requireSession() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { session: null, error: new NextResponse("Unauthorized", { status: 401 }) }
  }
  return { session, error: null }
}

export async function requireRole(roles: AppRole[]) {
  const { session, error } = await requireSession()
  if (error || !session) return { session: null, error }

  if (!roles.includes(session.user.role)) {
    return { session: null, error: new NextResponse("Forbidden", { status: 403 }) }
  }

  return { session, error: null }
}
