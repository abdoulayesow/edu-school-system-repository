import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import pg from "pg"
import dotenv from "dotenv"

dotenv.config({ path: "../ui/.env" })

const { Pool } = pg
const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  console.error("❌ DATABASE_URL not set")
  process.exit(1)
}

const pool = new Pool({ connectionString, max: 5 })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function checkNegativeBalances() {
  console.log("=== Checking for Negative Payment Balances ===\n")

  // Get all enrollments with their payments
  const enrollments = await prisma.enrollment.findMany({
    where: {
      status: "completed",
    },
    include: {
      student: {
        select: { firstName: true, lastName: true, studentNumber: true },
      },
      grade: { select: { name: true } },
      payments: {
        where: { status: "confirmed" },
        select: { amount: true },
      },
    },
  })

  console.log(`Checking ${enrollments.length} completed enrollments...\n`)

  const negativeBalances: Array<{
    enrollmentNumber: string
    student: string
    studentNumber: string
    grade: string
    tuitionFee: number
    totalPaid: number
    balance: number
  }> = []

  for (const enrollment of enrollments) {
    const tuitionFee = enrollment.adjustedTuitionFee || enrollment.originalTuitionFee
    const totalPaid = enrollment.payments.reduce((sum, p) => sum + p.amount, 0)
    const remainingBalance = tuitionFee - totalPaid

    if (remainingBalance < 0) {
      negativeBalances.push({
        enrollmentNumber: enrollment.enrollmentNumber,
        student: `${enrollment.student?.firstName} ${enrollment.student?.lastName}`,
        studentNumber: enrollment.student?.studentNumber || "N/A",
        grade: enrollment.grade?.name || "N/A",
        tuitionFee,
        totalPaid,
        balance: remainingBalance,
      })
    }
  }

  if (negativeBalances.length === 0) {
    console.log("✅ No negative balances found!")
  } else {
    console.log(`⚠️ Found ${negativeBalances.length} enrollments with negative balances:\n`)
    console.table(negativeBalances)

    // Summary
    const totalOverpayment = negativeBalances.reduce((sum, e) => sum + Math.abs(e.balance), 0)
    console.log(`\nTotal overpayment amount: ${totalOverpayment.toLocaleString()} GNF`)
  }

  // Also check for club enrollments
  console.log("\n=== Checking Club Enrollments ===\n")

  const clubEnrollments = await prisma.clubEnrollment.findMany({
    where: {
      status: { in: ["active", "completed"] },
    },
    include: {
      studentProfile: {
        include: {
          person: { select: { firstName: true, lastName: true } },
        },
      },
      club: { select: { name: true, fee: true } },
      payments: {
        where: { status: "confirmed" },
        select: { amount: true },
      },
    },
  })

  console.log(`Checking ${clubEnrollments.length} active/completed club enrollments...\n`)

  const negativeClubBalances: Array<{
    id: string
    student: string
    club: string
    fee: number
    totalPaid: number
    balance: number
  }> = []

  for (const ce of clubEnrollments) {
    const clubFee = ce.club?.fee || 0
    const totalPaid = ce.payments.reduce((sum, p) => sum + p.amount, 0)
    const remainingBalance = clubFee - totalPaid

    if (remainingBalance < 0) {
      negativeClubBalances.push({
        id: ce.id,
        student: `${ce.studentProfile?.person?.firstName} ${ce.studentProfile?.person?.lastName}`,
        club: ce.club?.name || "N/A",
        fee: clubFee,
        totalPaid,
        balance: remainingBalance,
      })
    }
  }

  if (negativeClubBalances.length === 0) {
    console.log("✅ No negative club balances found!")
  } else {
    console.log(`⚠️ Found ${negativeClubBalances.length} club enrollments with negative balances:\n`)
    console.table(negativeClubBalances)
  }

  await prisma.$disconnect()
}

checkNegativeBalances().catch(console.error)
