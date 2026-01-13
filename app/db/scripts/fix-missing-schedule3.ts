/**
 * Migration Script: Add Missing Schedule 3 to Enrollments
 *
 * This script finds all completed enrollments that have exactly 2 payment schedules
 * and adds the missing Schedule 3 (March, April, May-June period).
 *
 * Schedule 3 amount = Total Tuition - (Schedule 1 + Schedule 2)
 *
 * Run with: DATABASE_URL="..." npx tsx ./scripts/fix-missing-schedule3.ts
 */

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  console.error('DATABASE_URL not found')
  process.exit(1)
}

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// Dry run mode - set to false to actually make changes
const DRY_RUN = process.argv.includes('--dry-run') || !process.argv.includes('--execute')

async function main() {
  console.log(`\n${'='.repeat(60)}`)
  console.log(`  FIX MISSING SCHEDULE 3 - ${DRY_RUN ? 'DRY RUN' : 'EXECUTING'}`)
  console.log(`${'='.repeat(60)}\n`)

  if (DRY_RUN) {
    console.log('Running in DRY RUN mode. No changes will be made.')
    console.log('To execute changes, run with: --execute\n')
  }

  // Find all enrollments with exactly 2 payment schedules
  const enrollments = await prisma.enrollment.findMany({
    where: {
      status: 'completed',
      paymentSchedules: {
        // This doesn't work directly - we'll filter in code
      }
    },
    include: {
      paymentSchedules: {
        orderBy: { scheduleNumber: 'asc' }
      },
      schoolYear: true,
      grade: true,
      student: true
    }
  })

  // Filter to only those with exactly 2 schedules
  const needsFix = enrollments.filter(e => e.paymentSchedules.length === 2)

  console.log(`Found ${needsFix.length} enrollments with 2 schedules (missing Schedule 3)\n`)

  let fixed = 0
  let errors = 0

  for (const enrollment of needsFix) {
    const schedule1 = enrollment.paymentSchedules.find(s => s.scheduleNumber === 1)
    const schedule2 = enrollment.paymentSchedules.find(s => s.scheduleNumber === 2)

    if (!schedule1 || !schedule2) {
      console.log(`⚠️  Skipping ${enrollment.id} - missing schedule 1 or 2`)
      continue
    }

    // Calculate Schedule 3 amount (remainder after schedules 1 and 2)
    const tuitionFee = enrollment.adjustedTuitionFee || enrollment.originalTuitionFee
    const schedule3Amount = tuitionFee - schedule1.amount - schedule2.amount

    // Determine due date based on school year
    // Schedule 3 is typically due in February of the following year
    const schoolYearStart = enrollment.schoolYear?.startDate || new Date()
    const year = schoolYearStart.getFullYear()
    const nextYear = year + 1
    const dueDate = new Date(nextYear, 1, 15) // February 15

    const studentName = enrollment.student
      ? `${enrollment.student.firstName} ${enrollment.student.lastName}`
      : `Enrollment ${enrollment.enrollmentNumber || enrollment.id}`

    console.log(`\n--- ${studentName} ---`)
    console.log(`  School Year: ${enrollment.schoolYear?.name}`)
    console.log(`  Grade: ${enrollment.grade?.name}`)
    console.log(`  Tuition: ${tuitionFee.toLocaleString()} GNF`)
    console.log(`  Schedule 1: ${schedule1.amount.toLocaleString()} GNF`)
    console.log(`  Schedule 2: ${schedule2.amount.toLocaleString()} GNF`)
    console.log(`  Schedule 3 (to add): ${schedule3Amount.toLocaleString()} GNF`)
    console.log(`  Due Date: ${dueDate.toISOString().split('T')[0]}`)

    if (schedule3Amount <= 0) {
      console.log(`  ⚠️  Skipping - Schedule 3 amount is ${schedule3Amount} (not positive)`)
      continue
    }

    if (!DRY_RUN) {
      try {
        await prisma.paymentSchedule.create({
          data: {
            enrollmentId: enrollment.id,
            scheduleNumber: 3,
            amount: schedule3Amount,
            months: ['March', 'April', 'May', 'June'],
            dueDate: dueDate,
            isPaid: false
          }
        })
        console.log(`  ✅ Created Schedule 3`)
        fixed++
      } catch (err) {
        console.error(`  ❌ Error creating schedule:`, err)
        errors++
      }
    } else {
      console.log(`  [DRY RUN] Would create Schedule 3`)
      fixed++
    }
  }

  console.log(`\n${'='.repeat(60)}`)
  console.log(`  SUMMARY`)
  console.log(`${'='.repeat(60)}`)
  console.log(`  ${DRY_RUN ? 'Would fix' : 'Fixed'}: ${fixed} enrollments`)
  if (errors > 0) {
    console.log(`  Errors: ${errors}`)
  }
  console.log()

  if (DRY_RUN && fixed > 0) {
    console.log('To apply these changes, run with: --execute\n')
  }
}

main()
  .catch(console.error)
  .finally(() => {
    prisma.$disconnect()
    pool.end()
  })
