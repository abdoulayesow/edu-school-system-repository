// Helper functions for club-related operations
import { prisma } from "@/lib/prisma"
import { ClubLeaderType } from "@prisma/client"

export interface ResolvedLeader {
  id: string
  name: string
  type: ClubLeaderType
  photoUrl?: string | null
  email?: string | null
  role?: string | null
  grade?: string | null
}

/**
 * Resolves a polymorphic club leader based on leaderId and leaderType
 * Returns null if no leader is assigned or leader not found
 */
export async function resolveClubLeader(
  leaderId: string | null,
  leaderType: ClubLeaderType | null
): Promise<ResolvedLeader | null> {
  if (!leaderId || !leaderType) return null

  try {
    switch (leaderType) {
      case "teacher": {
        const teacher = await prisma.teacherProfile.findUnique({
          where: { id: leaderId },
          include: {
            person: {
              select: {
                firstName: true,
                lastName: true,
                photoUrl: true,
              },
            },
          },
        })

        if (!teacher) return null

        return {
          id: teacher.id,
          name: `${teacher.person.firstName} ${teacher.person.lastName}`,
          type: "teacher",
          photoUrl: teacher.person.photoUrl,
        }
      }

      case "staff": {
        const staff = await prisma.user.findFirst({
          where: {
            id: leaderId,
            staffRole: { not: null },
          },
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            staffRole: true,
          },
        })

        if (!staff) return null

        return {
          id: staff.id,
          name: staff.name || "Unknown",
          type: "staff",
          photoUrl: staff.image,
          email: staff.email,
          role: staff.staffRole,
        }
      }

      case "student": {
        const student = await prisma.studentProfile.findUnique({
          where: { id: leaderId },
          include: {
            person: {
              select: {
                firstName: true,
                lastName: true,
                photoUrl: true,
              },
            },
            currentGrade: {
              select: {
                name: true,
              },
            },
          },
        })

        if (!student) return null

        return {
          id: student.id,
          name: `${student.person.firstName} ${student.person.lastName}`,
          type: "student",
          photoUrl: student.person.photoUrl,
          grade: student.currentGrade?.name || undefined,
        }
      }

      default:
        return null
    }
  } catch (error) {
    console.error("Error resolving club leader:", error)
    return null
  }
}

/**
 * Resolves leaders for multiple clubs in parallel
 */
export async function resolveClubLeaders(
  clubs: Array<{ leaderId: string | null; leaderType: ClubLeaderType | null }>
): Promise<Map<string, ResolvedLeader | null>> {
  const leaderMap = new Map<string, ResolvedLeader | null>()

  // Create unique key for each club's leader
  const uniqueLeaders = new Map<string, { leaderId: string; leaderType: ClubLeaderType }>()

  for (const club of clubs) {
    if (club.leaderId && club.leaderType) {
      const key = `${club.leaderType}:${club.leaderId}`
      uniqueLeaders.set(key, { leaderId: club.leaderId, leaderType: club.leaderType })
    }
  }

  // Resolve all unique leaders in parallel
  const resolutions = await Promise.all(
    Array.from(uniqueLeaders.entries()).map(async ([key, { leaderId, leaderType }]) => ({
      key,
      leader: await resolveClubLeader(leaderId, leaderType),
    }))
  )

  // Build map
  for (const { key, leader } of resolutions) {
    leaderMap.set(key, leader)
  }

  return leaderMap
}

/**
 * Gets the leader key for looking up in the resolved leaders map
 */
export function getLeaderKey(leaderId: string | null, leaderType: ClubLeaderType | null): string | null {
  if (!leaderId || !leaderType) return null
  return `${leaderType}:${leaderId}`
}

/**
 * Generates a human-readable club enrollment number
 * Format: CE-YYYY-####
 * Example: CE-2026-0001
 */
export async function generateClubEnrollmentNumber(): Promise<string> {
  const year = new Date().getFullYear()
  const prefix = `CE-${year}-`

  // Find the latest enrollment number for this year
  const latestEnrollment = await prisma.clubEnrollment.findFirst({
    where: {
      enrollmentNumber: {
        startsWith: prefix,
      },
    },
    orderBy: {
      enrollmentNumber: "desc",
    },
    select: {
      enrollmentNumber: true,
    },
  })

  let nextNumber = 1

  if (latestEnrollment?.enrollmentNumber) {
    // Extract the numeric part (e.g., "0042" from "CE-2026-0042")
    const parts = latestEnrollment.enrollmentNumber.split("-")
    if (parts.length === 3) {
      const currentNumber = parseInt(parts[2], 10)
      if (!isNaN(currentNumber)) {
        nextNumber = currentNumber + 1
      }
    }
  }

  // Pad with zeros to 4 digits
  const paddedNumber = nextNumber.toString().padStart(4, "0")

  return `${prefix}${paddedNumber}`
}
