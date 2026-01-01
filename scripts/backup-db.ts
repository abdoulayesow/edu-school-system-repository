import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import pg from 'pg'
import fs from 'fs'
import path from 'path'

// Load env
const envPath = path.join(process.cwd(), 'app', 'ui', '.env')
const envContent = fs.readFileSync(envPath, 'utf-8')
for (const line of envContent.split('\n')) {
  const trimmed = line.trim()
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...valueParts] = trimmed.split('=')
    const value = valueParts.join('=').replace(/^["']|["']$/g, '')
    if (key && !process.env[key]) process.env[key] = value
  }
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

async function exportData() {
  console.log('Exporting data from database...')

  const data: Record<string, any[]> = {}

  // Export each model safely
  const models = [
    'user', 'address', 'account', 'session', 'verificationToken', 'passwordResetToken',
    'schoolYear', 'grade', 'enrollment', 'paymentSchedule', 'payment', 'enrollmentNote',
    'student', 'attendance', 'class', 'person', 'userProfile', 'studentProfile',
    'teacherProfile', 'parentProfile', 'studentParent', 'subject', 'gradeSubject',
    'classAssignment', 'gradeEnrollment', 'attendanceSession', 'attendanceRecord',
    'cashDeposit', 'bankDeposit', 'expense'
  ]

  for (const model of models) {
    try {
      const prismaModel = (prisma as any)[model]
      if (prismaModel) {
        data[model] = await prismaModel.findMany()
      }
    } catch (e) {
      console.log(`  Skipping ${model}: ${(e as Error).message}`)
    }
  }

  console.log('Exported data summary:')
  for (const [key, arr] of Object.entries(data)) {
    console.log(`  ${key}: ${(arr as any[]).length} records`)
  }

  fs.writeFileSync('database-backup.json', JSON.stringify(data, null, 2))
  console.log('\nData saved to database-backup.json')

  await prisma.$disconnect()
  await pool.end()
}

exportData().catch(console.error)
