/**
 * Auto-Assignment Algorithm for Student Room Distribution
 *
 * Balances students across grade rooms based on:
 * - Equal distribution (same number per room)
 * - Gender balance (same boy/girl ratio)
 * - Age balance (similar age distribution)
 * - Enrollment date priority (FIFO)
 */

// ============================================================================
// Types
// ============================================================================

export interface StudentForAssignment {
  id: string
  firstName: string
  lastName: string
  studentNumber?: string
  gender?: 'male' | 'female'
  dateOfBirth?: Date
  enrollmentDate: Date
  isLocked: boolean
}

export interface RoomForAssignment {
  id: string
  name: string
  displayName: string
  capacity: number
  currentCount: number
}

export interface RoomStatistics {
  roomId: string
  maleCount: number
  femaleCount: number
  unknownGenderCount: number
  ageSum: number
  ageCount: number
  studentCount: number
}

export interface AssignmentResult {
  studentProfileId: string
  gradeRoomId: string
}

export interface BalanceReport {
  roomDistributions: Array<{
    roomId: string
    roomName: string
    totalAssigned: number
    maleCount: number
    femaleCount: number
    unknownGenderCount: number
    averageAge: number | null
  }>
  overallGenderRatio: {
    male: number
    female: number
    unknown: number
  }
  balanceScore: number
}

export interface AutoAssignmentOutput {
  assignments: AssignmentResult[]
  unassignedStudents: StudentForAssignment[]
  balanceReport: BalanceReport
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Calculate age in years from date of birth
 */
function calculateAge(dateOfBirth: Date): number {
  const today = new Date()
  const birthDate = new Date(dateOfBirth)
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }

  return age
}

/**
 * Calculate gender imbalance penalty for a room
 * Returns 0-100 (lower is better)
 */
function calculateGenderImbalance(
  roomStats: RoomStatistics,
  studentGender: 'male' | 'female' | undefined,
  overallGenderRatio: { male: number; female: number }
): number {
  if (!studentGender) return 0 // No penalty for unknown gender

  const totalWithGender = roomStats.maleCount + roomStats.femaleCount
  if (totalWithGender === 0) return 0 // Empty room, no imbalance

  // Calculate current ratio
  const currentMaleRatio = roomStats.maleCount / totalWithGender
  const currentFemaleRatio = roomStats.femaleCount / totalWithGender

  // Calculate ratio after adding this student
  const newTotal = totalWithGender + 1
  const newMaleCount = studentGender === 'male' ? roomStats.maleCount + 1 : roomStats.maleCount
  const newFemaleCount = studentGender === 'female' ? roomStats.femaleCount + 1 : roomStats.femaleCount
  const newMaleRatio = newMaleCount / newTotal
  const newFemaleRatio = newFemaleCount / newTotal

  // Calculate deviation from target ratio
  const maleDeviation = Math.abs(newMaleRatio - overallGenderRatio.male)
  const femaleDeviation = Math.abs(newFemaleRatio - overallGenderRatio.female)

  // Return penalty (0-100)
  return (maleDeviation + femaleDeviation) * 50
}

/**
 * Calculate age imbalance penalty for a room
 * Returns 0-100 (lower is better)
 */
function calculateAgeImbalance(
  roomStats: RoomStatistics,
  studentAge: number | null,
  overallAverageAge: number
): number {
  if (studentAge === null) return 0 // No penalty for unknown age
  if (roomStats.ageCount === 0) return 0 // Empty room, no imbalance

  // Calculate current average age
  const currentAverage = roomStats.ageSum / roomStats.ageCount

  // Calculate new average after adding this student
  const newAverageAge = (roomStats.ageSum + studentAge) / (roomStats.ageCount + 1)

  // Calculate deviation from overall average
  const deviation = Math.abs(newAverageAge - overallAverageAge)

  // Normalize to 0-100 scale (assuming max deviation of 2 years = 100 penalty)
  return Math.min(deviation * 50, 100)
}

/**
 * Calculate balance score for a room assignment
 * Lower score = better fit
 */
function calculateRoomScore(
  room: RoomForAssignment,
  roomStats: RoomStatistics,
  student: StudentForAssignment,
  overallGenderRatio: { male: number; female: number },
  overallAverageAge: number
): number {
  let score = 0

  // Gender imbalance penalty (50% weight)
  const genderPenalty = calculateGenderImbalance(roomStats, student.gender, overallGenderRatio)
  score += genderPenalty * 0.5

  // Age imbalance penalty (30% weight)
  const studentAge = student.dateOfBirth ? calculateAge(student.dateOfBirth) : null
  const agePenalty = calculateAgeImbalance(roomStats, studentAge, overallAverageAge)
  score += agePenalty * 0.3

  // Capacity penalty (20% weight) - prefer rooms with more space initially
  const capacityRatio = roomStats.studentCount / room.capacity
  const capacityPenalty = capacityRatio * 100
  score += capacityPenalty * 0.2

  return score
}

/**
 * Update room statistics after assigning a student
 */
function updateRoomStatistics(
  roomStats: RoomStatistics,
  student: StudentForAssignment
): void {
  if (student.gender === 'male') {
    roomStats.maleCount++
  } else if (student.gender === 'female') {
    roomStats.femaleCount++
  } else {
    roomStats.unknownGenderCount++
  }

  if (student.dateOfBirth) {
    const age = calculateAge(student.dateOfBirth)
    roomStats.ageSum += age
    roomStats.ageCount++
  }

  roomStats.studentCount++
}

/**
 * Calculate overall statistics from students
 */
function calculateOverallStatistics(students: StudentForAssignment[]): {
  genderRatio: { male: number; female: number; unknown: number }
  averageAge: number
} {
  let maleCount = 0
  let femaleCount = 0
  let unknownGenderCount = 0
  let ageSum = 0
  let ageCount = 0

  for (const student of students) {
    if (student.gender === 'male') {
      maleCount++
    } else if (student.gender === 'female') {
      femaleCount++
    } else {
      unknownGenderCount++
    }

    if (student.dateOfBirth) {
      ageSum += calculateAge(student.dateOfBirth)
      ageCount++
    }
  }

  const totalWithGender = maleCount + femaleCount
  const genderRatio = {
    male: totalWithGender > 0 ? maleCount / totalWithGender : 0.5,
    female: totalWithGender > 0 ? femaleCount / totalWithGender : 0.5,
    unknown: unknownGenderCount
  }

  const averageAge = ageCount > 0 ? ageSum / ageCount : 0

  return { genderRatio, averageAge }
}

/**
 * Calculate balance score for the final distribution
 * Returns 0-100 (100 = perfect balance)
 */
function calculateBalanceScore(
  roomDistributions: BalanceReport['roomDistributions'],
  overallGenderRatio: { male: number; female: number }
): number {
  if (roomDistributions.length === 0) return 100

  let totalDeviation = 0
  let deviationCount = 0

  for (const room of roomDistributions) {
    const totalWithGender = room.maleCount + room.femaleCount
    if (totalWithGender === 0) continue

    const roomMaleRatio = room.maleCount / totalWithGender
    const roomFemaleRatio = room.femaleCount / totalWithGender

    const maleDeviation = Math.abs(roomMaleRatio - overallGenderRatio.male)
    const femaleDeviation = Math.abs(roomFemaleRatio - overallGenderRatio.female)

    totalDeviation += (maleDeviation + femaleDeviation)
    deviationCount++
  }

  if (deviationCount === 0) return 100

  const averageDeviation = totalDeviation / deviationCount
  const balanceScore = Math.max(0, 100 - (averageDeviation * 200))

  return Math.round(balanceScore)
}

// ============================================================================
// Main Auto-Assignment Function
// ============================================================================

/**
 * Auto-assign students to rooms with balanced distribution
 *
 * @param students - Students to assign (unassigned, unlocked)
 * @param rooms - Rooms to assign students to
 * @returns Assignment results with balance report
 */
export function autoAssignStudents(
  students: StudentForAssignment[],
  rooms: RoomForAssignment[]
): AutoAssignmentOutput {
  // Filter out locked students
  const eligibleStudents = students.filter(s => !s.isLocked)

  // Sort by enrollment date (FIFO priority)
  const sortedStudents = [...eligibleStudents].sort((a, b) => {
    return a.enrollmentDate.getTime() - b.enrollmentDate.getTime()
  })

  // Calculate overall statistics
  const { genderRatio, averageAge } = calculateOverallStatistics(sortedStudents)

  // Initialize room statistics
  const roomStatsMap = new Map<string, RoomStatistics>()
  for (const room of rooms) {
    roomStatsMap.set(room.id, {
      roomId: room.id,
      maleCount: 0,
      femaleCount: 0,
      unknownGenderCount: 0,
      ageSum: 0,
      ageCount: 0,
      studentCount: room.currentCount
    })
  }

  // Track available capacity per room
  const roomCapacity = new Map<string, number>()
  for (const room of rooms) {
    roomCapacity.set(room.id, room.capacity - room.currentCount)
  }

  // Assign students
  const assignments: AssignmentResult[] = []
  const unassignedStudents: StudentForAssignment[] = []

  for (const student of sortedStudents) {
    // Find available rooms
    const availableRooms = rooms.filter(room => {
      const capacity = roomCapacity.get(room.id) || 0
      return capacity > 0
    })

    if (availableRooms.length === 0) {
      // No capacity left
      unassignedStudents.push(student)
      continue
    }

    // Calculate score for each available room
    const roomScores = availableRooms.map(room => {
      const roomStats = roomStatsMap.get(room.id)!
      const score = calculateRoomScore(
        room,
        roomStats,
        student,
        genderRatio,
        averageAge
      )
      return { room, score }
    })

    // Sort by score (lowest = best fit)
    roomScores.sort((a, b) => a.score - b.score)

    // Assign to best room
    const bestRoom = roomScores[0].room
    assignments.push({
      studentProfileId: student.id,
      gradeRoomId: bestRoom.id
    })

    // Update statistics
    const roomStats = roomStatsMap.get(bestRoom.id)!
    updateRoomStatistics(roomStats, student)

    // Update capacity
    const currentCapacity = roomCapacity.get(bestRoom.id)!
    roomCapacity.set(bestRoom.id, currentCapacity - 1)
  }

  // Build balance report
  const roomDistributions = rooms.map(room => {
    const stats = roomStatsMap.get(room.id)!
    return {
      roomId: room.id,
      roomName: room.displayName,
      totalAssigned: stats.studentCount - room.currentCount,
      maleCount: stats.maleCount,
      femaleCount: stats.femaleCount,
      unknownGenderCount: stats.unknownGenderCount,
      averageAge: stats.ageCount > 0 ? Math.round((stats.ageSum / stats.ageCount) * 10) / 10 : null
    }
  })

  const balanceScore = calculateBalanceScore(roomDistributions, genderRatio)

  return {
    assignments,
    unassignedStudents,
    balanceReport: {
      roomDistributions,
      overallGenderRatio: {
        male: Math.round(genderRatio.male * 100),
        female: Math.round(genderRatio.female * 100),
        unknown: genderRatio.unknown
      },
      balanceScore
    }
  }
}
