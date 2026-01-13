import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load .env from UI folder
dotenv.config({ path: path.resolve(__dirname, '../ui/.env.local') })
dotenv.config({ path: path.resolve(__dirname, '../ui/.env') })

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  console.error('DATABASE_URL not found')
  console.log('Checked paths')
  process.exit(1)
}

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const student = await prisma.student.findFirst({
    where: { studentNumber: 'STD-2024-18042016-0046' },
    include: {
      enrollments: {
        include: {
          paymentSchedules: {
            orderBy: { scheduleNumber: 'asc' }
          },
          schoolYear: true,
          grade: true
        }
      }
    }
  })
  
  if (!student) {
    console.log('Student not found')
    return
  }
  
  console.log('\n=== STUDENT INFO ===')
  console.log('ID:', student.id)
  console.log('Student Number:', student.studentNumber)
  console.log('Name:', student.firstName, student.lastName)
  
  for (const enrollment of student.enrollments) {
    console.log('\n=== ENROLLMENT ===')
    console.log('Enrollment ID:', enrollment.id)
    console.log('Status:', enrollment.status)
    console.log('School Year:', enrollment.schoolYear?.name)
    console.log('Grade:', enrollment.grade?.name)
    console.log('Original Tuition:', enrollment.originalTuitionFee)
    console.log('Adjusted Tuition:', enrollment.adjustedTuitionFee)
    
    console.log('\n=== PAYMENT SCHEDULES ===')
    console.log('Total schedules:', enrollment.paymentSchedules.length)
    
    for (const schedule of enrollment.paymentSchedules) {
      console.log(`\nSchedule ${schedule.scheduleNumber}:`)
      console.log('  ID:', schedule.id)
      console.log('  Amount:', schedule.amount)
      console.log('  Due Date:', schedule.dueDate)
      console.log('  Months:', schedule.months)
      console.log('  Is Paid:', schedule.isPaid)
    }
  }
}

main()
  .catch(console.error)
  .finally(() => {
    prisma.$disconnect()
    pool.end()
  })
