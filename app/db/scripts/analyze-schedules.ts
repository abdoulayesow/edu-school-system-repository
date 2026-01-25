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

async function main() {
  // Find all enrollments with fewer than 3 payment schedules
  const enrollments = await prisma.enrollment.findMany({
    where: {
      status: 'completed'
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

  console.log(`\nFound ${enrollments.length} completed enrollments\n`)

  let needsFix = 0
  let hasZero = 0
  let hasOne = 0
  let hasTwo = 0
  let hasThree = 0

  for (const enrollment of enrollments) {
    const count = enrollment.paymentSchedules.length

    if (count === 0) hasZero++
    else if (count === 1) hasOne++
    else if (count === 2) hasTwo++
    else if (count === 3) hasThree++

    if (count < 3 && count > 0) {
      needsFix++
      console.log(`\n--- Enrollment needs fix ---`)
      console.log(`Student: ${enrollment.student?.firstName} ${enrollment.student?.lastName} (${enrollment.student?.studentNumber})`)
      console.log(`School Year: ${enrollment.schoolYear?.name}`)
      console.log(`Grade: ${enrollment.grade?.name}`)
      console.log(`Tuition: ${enrollment.originalTuitionFee}`)
      console.log(`Schedules: ${count}`)

      for (const schedule of enrollment.paymentSchedules) {
        const monthsStr = schedule.months.join(', ')
        console.log(`  Schedule ${schedule.scheduleNumber}: ${schedule.amount} GNF - ${monthsStr}`)
      }
    }
  }

  console.log('\n=== SUMMARY ===')
  console.log(`Enrollments with 0 schedules: ${hasZero}`)
  console.log(`Enrollments with 1 schedule: ${hasOne}`)
  console.log(`Enrollments with 2 schedules: ${hasTwo}`)
  console.log(`Enrollments with 3 schedules: ${hasThree}`)
  console.log(`\nTotal needing fix (1-2 schedules): ${needsFix}`)
}

main()
  .catch(console.error)
  .finally(() => {
    prisma.$disconnect()
    pool.end()
  })
