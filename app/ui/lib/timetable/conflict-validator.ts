import { prisma } from "@/lib/prisma"
import { DayOfWeek } from "@prisma/client"

export interface ConflictCheck {
  type: "teacher" | "room" | "section"
  dayOfWeek: DayOfWeek
  timePeriodId: string
  details: string
}

export interface ScheduleSlotInput {
  gradeRoomId: string
  timePeriodId: string
  dayOfWeek: DayOfWeek
  teacherProfileId?: string | null
  roomLocation?: string | null
  isBreak?: boolean
}

/**
 * Validates a schedule slot for conflicts
 * Returns array of conflicts found (empty if no conflicts)
 *
 * @param slot - The schedule slot to validate
 * @param excludeSlotId - Optional slot ID to exclude from conflict checks (for updates)
 * @returns Array of conflict details
 */
export async function validateScheduleSlot(
  slot: ScheduleSlotInput,
  excludeSlotId?: string
): Promise<ConflictCheck[]> {
  const conflicts: ConflictCheck[] = []

  // Skip conflict checks for breaks
  if (slot.isBreak) return conflicts

  // 1. Teacher conflict check
  if (slot.teacherProfileId) {
    const teacherSlots = await prisma.scheduleSlot.findMany({
      where: {
        teacherProfileId: slot.teacherProfileId,
        dayOfWeek: slot.dayOfWeek,
        timePeriodId: slot.timePeriodId,
        isBreak: false,
        id: excludeSlotId ? { not: excludeSlotId } : undefined,
      },
      include: {
        gradeRoom: {
          include: {
            grade: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    })

    if (teacherSlots.length > 0) {
      const conflictRoom = teacherSlots[0].gradeRoom.displayName
      conflicts.push({
        type: "teacher",
        dayOfWeek: slot.dayOfWeek,
        timePeriodId: slot.timePeriodId,
        details: `Teacher already assigned to ${conflictRoom} at this time`,
      })
    }
  }

  // 2. Room location conflict check
  if (slot.roomLocation) {
    const roomSlots = await prisma.scheduleSlot.findMany({
      where: {
        roomLocation: slot.roomLocation,
        dayOfWeek: slot.dayOfWeek,
        timePeriodId: slot.timePeriodId,
        isBreak: false,
        id: excludeSlotId ? { not: excludeSlotId } : undefined,
      },
      include: {
        gradeRoom: {
          include: {
            grade: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    })

    if (roomSlots.length > 0) {
      const conflictRoom = roomSlots[0].gradeRoom.displayName
      conflicts.push({
        type: "room",
        dayOfWeek: slot.dayOfWeek,
        timePeriodId: slot.timePeriodId,
        details: `Room ${slot.roomLocation} is occupied by ${conflictRoom} at this time`,
      })
    }
  }

  // 3. Section conflict check (same gradeRoom cannot have multiple classes at same time)
  const sectionSlots = await prisma.scheduleSlot.findMany({
    where: {
      gradeRoomId: slot.gradeRoomId,
      dayOfWeek: slot.dayOfWeek,
      timePeriodId: slot.timePeriodId,
      id: excludeSlotId ? { not: excludeSlotId } : undefined,
    },
  })

  if (sectionSlots.length > 0) {
    conflicts.push({
      type: "section",
      dayOfWeek: slot.dayOfWeek,
      timePeriodId: slot.timePeriodId,
      details: "This section already has a class scheduled at this time",
    })
  }

  return conflicts
}

/**
 * Validates multiple schedule slots at once
 * Useful for bulk operations or schedule copying
 *
 * @param slots - Array of schedule slots to validate
 * @returns Map of slot index to array of conflicts
 */
export async function validateMultipleSlots(
  slots: ScheduleSlotInput[]
): Promise<Map<number, ConflictCheck[]>> {
  const conflictMap = new Map<number, ConflictCheck[]>()

  for (let i = 0; i < slots.length; i++) {
    const conflicts = await validateScheduleSlot(slots[i])
    if (conflicts.length > 0) {
      conflictMap.set(i, conflicts)
    }
  }

  return conflictMap
}
