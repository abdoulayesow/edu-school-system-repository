/**
 * Seed script to create grading data:
 * - Rooms for each grade (2 rooms per grade: A and B)
 * - Student room assignments
 * - 3 trimesters (T1 active)
 * - Sample evaluations (random grades 8-18/20)
 * - Calculated trimester results
 *
 * Usage:
 *   npx tsx app/db/prisma/seeds/seed-grading.ts
 */

import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient, EvaluationType } from "@prisma/client"
import pg from "pg"
import fs from "fs"
import path from "path"

const { Pool } = pg

// Load .env from app/db if DATABASE_URL not set
if (!process.env.DATABASE_URL) {
  const envPath = path.join(process.cwd(), ".env")
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8")
    for (const line of envContent.split("\n")) {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith("#")) {
        const [key, ...valueParts] = trimmed.split("=")
        const value = valueParts.join("=").replace(/^["']|["']$/g, "")
        if (key && !process.env[key]) {
          process.env[key] = value
        }
      }
    }
  }
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const DIRECTOR_EMAIL = "abdoulaye.sow.1989@gmail.com"

// Helper to generate random score between min and max
function randomScore(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 10) / 10
}

// Helper to get random element from array
function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

async function seedGrading() {
  console.log("📊 Starting grading seed...")

  // Get director user
  const director = await prisma.user.findUnique({
    where: { email: DIRECTOR_EMAIL },
  })

  if (!director) {
    console.error("❌ Director user not found. Please run the main seed script first.")
    return
  }

  // Get active school year
  const activeSchoolYear = await prisma.schoolYear.findFirst({
    where: { isActive: true },
  })

  if (!activeSchoolYear) {
    console.error("❌ Active school year not found. Please run the main seed script first.")
    return
  }

  console.log(`📅 Using school year: ${activeSchoolYear.name}`)

  // Get all grades for this school year
  const grades = await prisma.grade.findMany({
    where: { schoolYearId: activeSchoolYear.id },
    include: {
      subjects: {
        include: {
          subject: true,
        },
      },
    },
    orderBy: { order: "asc" },
  })

  if (grades.length === 0) {
    console.error("❌ No grades found. Please run the main seed script first.")
    return
  }

  console.log(`📚 Found ${grades.length} grades`)

  // Get enrolled students via Enrollment → Student → StudentProfile
  const enrollments = await prisma.enrollment.findMany({
    where: {
      schoolYearId: activeSchoolYear.id,
      status: "completed", // Only use approved enrollments
      studentId: { not: null }, // Must have a linked student
    },
    include: {
      student: {
        include: {
          studentProfile: true,
        },
      },
      grade: true,
    },
  })

  // Filter for enrollments where student has a profile
  const validEnrollments = enrollments.filter(
    (e) => e.student?.studentProfile != null
  )

  if (validEnrollments.length === 0) {
    console.error(
      "❌ No enrollments with student profiles found. Please run the main seed script first."
    )
    return
  }

  console.log(`👥 Found ${validEnrollments.length} enrolled students with profiles`)

  // ========================================================================
  // 1. Create Rooms (2 per grade: A and B)
  // ========================================================================
  console.log("\n🏫 Creating rooms...")

  let totalRooms = 0
  const gradeRooms: Map<string, string[]> = new Map() // gradeId -> roomIds

  for (const grade of grades) {
    const existingRooms = await prisma.gradeRoom.findMany({
      where: { gradeId: grade.id },
    })

    if (existingRooms.length > 0) {
      console.log(`   ✓ ${grade.name}: ${existingRooms.length} rooms (existing)`)
      gradeRooms.set(grade.id, existingRooms.map(r => r.id))
      continue
    }

    const roomIds: string[] = []
    for (const suffix of ["A", "B"]) {
      // Extract short name from grade (e.g., "6ème" from "Sixième (6ème)")
      const shortName = grade.name.match(/\(([^)]+)\)/)?.[1] || grade.name.split(" ")[0]
      const roomName = `${shortName} ${suffix}`

      const room = await prisma.gradeRoom.create({
        data: {
          gradeId: grade.id,
          name: suffix,
          displayName: roomName,
          capacity: 35,
          isActive: true,
        },
      })
      roomIds.push(room.id)
      totalRooms++
    }

    gradeRooms.set(grade.id, roomIds)
    console.log(`   ✓ ${grade.name}: 2 rooms created`)
  }

  console.log(`   Total rooms: ${totalRooms} created`)

  // ========================================================================
  // 2. Create Student Room Assignments
  // ========================================================================
  console.log("\n📋 Assigning students to rooms...")

  let totalAssignments = 0
  const studentsByGrade: Map<string, typeof validEnrollments> = new Map()

  // Group enrollments by grade
  for (const enrollment of validEnrollments) {
    const existing = studentsByGrade.get(enrollment.gradeId) || []
    existing.push(enrollment)
    studentsByGrade.set(enrollment.gradeId, existing)
  }

  // Assign students to rooms (split evenly between A and B)
  for (const [gradeId, studentsInGrade] of studentsByGrade) {
    const roomIds = gradeRooms.get(gradeId)
    if (!roomIds || roomIds.length === 0) continue

    // Check for existing assignments
    const existingAssignments = await prisma.studentRoomAssignment.count({
      where: {
        schoolYearId: activeSchoolYear.id,
        studentProfileId: {
          in: studentsInGrade.map((e) => e.student!.studentProfile!.id),
        },
      },
    })

    if (existingAssignments > 0) {
      console.log(
        `   ✓ Grade ${studentsInGrade[0].grade.name}: ${existingAssignments} assignments (existing)`
      )
      continue
    }

    // Shuffle students for random distribution
    const shuffled = [...studentsInGrade].sort(() => Math.random() - 0.5)

    for (let i = 0; i < shuffled.length; i++) {
      const enrollment = shuffled[i]
      const roomId = roomIds[i % roomIds.length] // Alternate between rooms

      await prisma.studentRoomAssignment.create({
        data: {
          studentProfileId: enrollment.student!.studentProfile!.id,
          gradeRoomId: roomId,
          schoolYearId: activeSchoolYear.id,
          assignedBy: director.id,
          isActive: true,
        },
      })
      totalAssignments++
    }

    console.log(`   ✓ ${studentsInGrade[0].grade.name}: ${studentsInGrade.length} students assigned`)
  }

  console.log(`   Total assignments: ${totalAssignments}`)

  // ========================================================================
  // 3. Create Trimesters
  // ========================================================================
  console.log("\n📅 Creating trimesters...")

  const existingTrimesters = await prisma.trimester.findMany({
    where: { schoolYearId: activeSchoolYear.id },
  })

  let trimesters: typeof existingTrimesters

  if (existingTrimesters.length > 0) {
    console.log(`   ✓ ${existingTrimesters.length} trimesters already exist`)
    trimesters = existingTrimesters
  } else {
    const trimesterConfigs = [
      {
        number: 1,
        name: "Premier Trimestre",
        nameFr: "Premier Trimestre",
        nameEn: "First Trimester",
        startDate: new Date("2025-09-01"),
        endDate: new Date("2025-12-15"),
        isActive: true,
      },
      {
        number: 2,
        name: "Deuxième Trimestre",
        nameFr: "Deuxième Trimestre",
        nameEn: "Second Trimester",
        startDate: new Date("2026-01-05"),
        endDate: new Date("2026-03-31"),
        isActive: false,
      },
      {
        number: 3,
        name: "Troisième Trimestre",
        nameFr: "Troisième Trimestre",
        nameEn: "Third Trimester",
        startDate: new Date("2026-04-15"),
        endDate: new Date("2026-06-30"),
        isActive: false,
      },
    ]

    trimesters = []
    for (const config of trimesterConfigs) {
      const trimester = await prisma.trimester.create({
        data: {
          schoolYearId: activeSchoolYear.id,
          ...config,
        },
      })
      trimesters.push(trimester)
      console.log(`   ✓ Created: ${config.name} ${config.isActive ? "(ACTIVE)" : ""}`)
    }
  }

  const activeTrimester = trimesters.find(t => t.isActive) || trimesters[0]
  console.log(`   Active trimester: ${activeTrimester.name}`)

  // ========================================================================
  // 4. Create Evaluations (Sample Grades)
  // ========================================================================
  console.log("\n📝 Creating evaluations...")

  // Check if evaluations already exist
  const existingEvaluations = await prisma.evaluation.count({
    where: { trimesterId: activeTrimester.id },
  })

  if (existingEvaluations > 0) {
    console.log(`   ✓ ${existingEvaluations} evaluations already exist - skipping`)
  } else {
    let totalEvaluations = 0
    const evaluationTypes: EvaluationType[] = ["interrogation", "devoir_surveille", "composition"]

    for (const grade of grades) {
      const studentsInGrade = studentsByGrade.get(grade.id)
      if (!studentsInGrade || studentsInGrade.length === 0) continue

      const gradeSubjects = grade.subjects
      if (gradeSubjects.length === 0) continue

      for (const ge of studentsInGrade) {
        // Create evaluations for each subject (2-3 per subject)
        for (const gradeSubject of gradeSubjects) {
          // Determine number of evaluations per type based on time in trimester
          // Interrogation: 2-3, Devoir surveillé: 1-2, Composition: 1
          const numInterrogations = Math.floor(Math.random() * 2) + 2 // 2-3
          const numDevoirs = Math.floor(Math.random() * 2) + 1 // 1-2

          // Create interrogations
          for (let i = 0; i < numInterrogations; i++) {
            const date = new Date(activeTrimester.startDate)
            date.setDate(date.getDate() + Math.floor(Math.random() * 60) + 7) // Random date in trimester

            await prisma.evaluation.create({
              data: {
                studentProfileId: ge.student!.studentProfile!.id,
                gradeSubjectId: gradeSubject.id,
                trimesterId: activeTrimester.id,
                type: "interrogation",
                score: randomScore(8, 18), // Random score between 8 and 18
                maxScore: 20,
                date,
                recordedBy: director.id,
              },
            })
            totalEvaluations++
          }

          // Create devoirs surveillés
          for (let i = 0; i < numDevoirs; i++) {
            const date = new Date(activeTrimester.startDate)
            date.setDate(date.getDate() + Math.floor(Math.random() * 60) + 14)

            await prisma.evaluation.create({
              data: {
                studentProfileId: ge.student!.studentProfile!.id,
                gradeSubjectId: gradeSubject.id,
                trimesterId: activeTrimester.id,
                type: "devoir_surveille",
                score: randomScore(7, 17),
                maxScore: 20,
                date,
                recordedBy: director.id,
              },
            })
            totalEvaluations++
          }

          // Create composition (1 per subject)
          const compositionDate = new Date(activeTrimester.endDate)
          compositionDate.setDate(compositionDate.getDate() - Math.floor(Math.random() * 14))

          await prisma.evaluation.create({
            data: {
              studentProfileId: ge.student!.studentProfile!.id,
              gradeSubjectId: gradeSubject.id,
              trimesterId: activeTrimester.id,
              type: "composition",
              score: randomScore(8, 19),
              maxScore: 20,
              date: compositionDate,
              recordedBy: director.id,
            },
          })
          totalEvaluations++
        }
      }

      console.log(`   ✓ ${grade.name}: evaluations created for ${studentsInGrade.length} students`)
    }

    console.log(`   Total evaluations: ${totalEvaluations}`)
  }

  // ========================================================================
  // 5. Calculate Subject Averages
  // ========================================================================
  console.log("\n📊 Calculating subject averages...")

  // Check if averages already exist
  const existingAverages = await prisma.subjectTrimesterAverage.count({
    where: { trimesterId: activeTrimester.id },
  })

  if (existingAverages > 0) {
    console.log(`   ✓ ${existingAverages} subject averages already exist - skipping`)
  } else {
    let totalAverages = 0

    for (const grade of grades) {
      const studentsInGrade = studentsByGrade.get(grade.id)
      if (!studentsInGrade || studentsInGrade.length === 0) continue

      for (const ge of studentsInGrade) {
        // Get all evaluations for this student in this trimester
        const studentEvaluations = await prisma.evaluation.findMany({
          where: {
            studentProfileId: ge.student!.studentProfile!.id,
            trimesterId: activeTrimester.id,
          },
          include: {
            gradeSubject: true,
          },
        })

        // Group by subject
        const subjectEvaluations: Map<string, typeof studentEvaluations> = new Map()
        for (const ev of studentEvaluations) {
          const existing = subjectEvaluations.get(ev.gradeSubjectId) || []
          existing.push(ev)
          subjectEvaluations.set(ev.gradeSubjectId, existing)
        }

        // Calculate average for each subject
        for (const [gradeSubjectId, evals] of subjectEvaluations) {
          // Weighted average: interrogations (20%), devoirs (30%), composition (50%)
          let interrogationSum = 0, interrogationCount = 0
          let devoirSum = 0, devoirCount = 0
          let compositionScore = 0, hasComposition = false

          for (const ev of evals) {
            switch (ev.type) {
              case "interrogation":
                interrogationSum += ev.score
                interrogationCount++
                break
              case "devoir_surveille":
                devoirSum += ev.score
                devoirCount++
                break
              case "composition":
                compositionScore = ev.score
                hasComposition = true
                break
            }
          }

          // Calculate weighted average
          let weightedSum = 0
          let totalWeight = 0

          if (interrogationCount > 0) {
            weightedSum += (interrogationSum / interrogationCount) * 0.2
            totalWeight += 0.2
          }
          if (devoirCount > 0) {
            weightedSum += (devoirSum / devoirCount) * 0.3
            totalWeight += 0.3
          }
          if (hasComposition) {
            weightedSum += compositionScore * 0.5
            totalWeight += 0.5
          }

          const average = totalWeight > 0 ? weightedSum / totalWeight : 0
          const coefficient = evals[0].gradeSubject.coefficient

          await prisma.subjectTrimesterAverage.create({
            data: {
              studentProfileId: ge.student!.studentProfile!.id,
              gradeSubjectId,
              trimesterId: activeTrimester.id,
              interrogationAverage: interrogationCount > 0 ? interrogationSum / interrogationCount : null,
              devoirAverage: devoirCount > 0 ? devoirSum / devoirCount : null,
              compositionScore: hasComposition ? compositionScore : null,
              average: Math.round(average * 100) / 100,
              coefficient,
              calculatedAt: new Date(),
            },
          })
          totalAverages++
        }
      }

      console.log(`   ✓ ${grade.name}: subject averages calculated`)
    }

    console.log(`   Total subject averages: ${totalAverages}`)
  }

  // ========================================================================
  // 6. Calculate Student Trimester Results
  // ========================================================================
  console.log("\n🎓 Calculating trimester results...")

  // Check if results already exist
  const existingResults = await prisma.studentTrimester.count({
    where: { trimesterId: activeTrimester.id },
  })

  if (existingResults > 0) {
    console.log(`   ✓ ${existingResults} trimester results already exist - skipping`)
  } else {
    let totalResults = 0

    for (const grade of grades) {
      const studentsInGrade = studentsByGrade.get(grade.id)
      if (!studentsInGrade || studentsInGrade.length === 0) continue

      // Calculate general averages for all students in this grade
      const studentAverages: { studentProfileId: string; average: number }[] = []

      for (const ge of studentsInGrade) {
        // Get subject averages for this student
        const subjectAverages = await prisma.subjectTrimesterAverage.findMany({
          where: {
            studentProfileId: ge.student!.studentProfile!.id,
            trimesterId: activeTrimester.id,
          },
        })

        if (subjectAverages.length === 0) continue

        // Calculate weighted general average
        let totalWeightedScore = 0
        let totalCoefficients = 0

        for (const sa of subjectAverages) {
          totalWeightedScore += sa.average * sa.coefficient
          totalCoefficients += sa.coefficient
        }

        const generalAverage = totalCoefficients > 0 ? totalWeightedScore / totalCoefficients : 0
        studentAverages.push({
          studentProfileId: ge.student!.studentProfile!.id,
          average: Math.round(generalAverage * 100) / 100,
        })
      }

      // Sort by average to determine rank
      studentAverages.sort((a, b) => b.average - a.average)

      // Create trimester results with rank
      for (let i = 0; i < studentAverages.length; i++) {
        const { studentProfileId, average } = studentAverages[i]

        // Determine decision based on average
        let decision: "pending" | "admis" | "rattrapage" | "redouble" = "pending"
        if (average >= 10) decision = "admis"
        else if (average >= 8) decision = "rattrapage"
        else decision = "redouble"

        // Random conduct score (14-20)
        const conduct = randomScore(14, 20)

        // Random absences and lates
        const absences = Math.floor(Math.random() * 8)
        const lates = Math.floor(Math.random() * 5)

        await prisma.studentTrimester.create({
          data: {
            studentProfileId,
            trimesterId: activeTrimester.id,
            generalAverage: average,
            rank: i + 1,
            totalStudents: studentAverages.length,
            conduct,
            decision,
            absences,
            lates,
            calculatedAt: new Date(),
          },
        })
        totalResults++
      }

      console.log(`   ✓ ${grade.name}: ${studentAverages.length} students ranked`)
    }

    console.log(`   Total trimester results: ${totalResults}`)
  }

  console.log("\n✅ Grading seed completed!")
}

seedGrading()
  .catch((e) => {
    console.error("❌ Seed failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
