import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/authz";

// GET /api/users - Fetch users/staff members
export async function GET(req: NextRequest) {
  const { session, error } = await requireSession();
  if (error) return error;

  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");

    // Build query - filter by role if specified
    const users = await prisma.user.findMany({
      where: {
        status: "active", // Only active users
        ...(role && { role: role as any }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        staffRole: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({ users });
  } catch (err) {
    console.error("Error fetching users:", err);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
