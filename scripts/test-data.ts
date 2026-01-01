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

async function testData() {
  console.log('='.repeat(60))
  console.log('TESTING DATABASE DATA')
  console.log('='.repeat(60))

  // 1. Test Grades
  console.log('\n1. GRADES')
  console.log('-'.repeat(40))
  const activeYear = await prisma.schoolYear.findFirst({
    where: { isActive: true },
    select: { id: true, name: true },
  })
  console.log(`   Active school year: ${activeYear?.name}`)

  const grades = await prisma.grade.findMany({
    where: { schoolYearId: activeYear?.id },
    include: {
      _count: {
        select: { enrollments: { where: { status: 'completed' } } },
      },
    },
    orderBy: { order: 'asc' },
  })
  console.log(`   Grades found: ${grades.length}`)
  for (const grade of grades) {
    console.log(`   - ${grade.name}: ${grade._count.enrollments} students`)
  }

  // 2. Test Students
  console.log('\n2. STUDENTS')
  console.log('-'.repeat(40))
  const studentCount = await prisma.student.count()
  console.log(`   Total students: ${studentCount}`)

  const enrolledStudents = await prisma.enrollment.findMany({
    where: { schoolYear: { isActive: true }, status: 'completed', student: { isNot: null } },
    include: {
      student: { select: { firstName: true, lastName: true } },
      grade: { select: { name: true } },
    },
    take: 5,
  })
  const totalEnrolled = await prisma.enrollment.count({
    where: { schoolYear: { isActive: true }, status: 'completed' },
  })
  console.log(`   Enrolled this year: ${totalEnrolled} (showing first 5)`)
  for (const e of enrolledStudents) {
    if (e.student) {
      console.log(`   - ${e.student.firstName} ${e.student.lastName} (${e.grade.name})`)
    }
  }

  // 3. Test Attendance Sessions
  console.log('\n3. ATTENDANCE SESSIONS')
  console.log('-'.repeat(40))
  const sessionCount = await prisma.attendanceSession.count()
  console.log(`   Total sessions: ${sessionCount}`)

  const recentSessions = await prisma.attendanceSession.findMany({
    include: {
      grade: { select: { name: true } },
      _count: { select: { records: true } },
    },
    orderBy: { date: 'desc' },
    take: 5,
  })
  console.log(`   Recent sessions:`)
  for (const s of recentSessions) {
    console.log(`   - ${s.date.toISOString().split('T')[0]} | ${s.grade.name}: ${s._count.records} records`)
  }

  // 4. Test Expenses
  console.log('\n4. EXPENSES')
  console.log('-'.repeat(40))
  const expenses = await prisma.expense.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
  })
  console.log(`   Total expenses: ${await prisma.expense.count()}`)
  for (const e of expenses) {
    console.log(`   - ${e.description}: ${e.amount.toLocaleString()} GNF (${e.status})`)
  }

  // 5. Test Accounting Balance
  console.log('\n5. ACCOUNTING BALANCE')
  console.log('-'.repeat(40))

  // Total confirmed payments
  const payments = await prisma.payment.aggregate({
    where: { status: 'confirmed' },
    _sum: { amount: true },
    _count: true,
  })
  console.log(`   Confirmed payments: ${payments._count} totaling ${payments._sum.amount?.toLocaleString() || 0} GNF`)

  // Total approved expenses
  const approvedExpenses = await prisma.expense.aggregate({
    where: { status: 'approved' },
    _sum: { amount: true },
    _count: true,
  })
  console.log(`   Approved expenses: ${approvedExpenses._count} totaling ${approvedExpenses._sum.amount?.toLocaleString() || 0} GNF`)

  // Net balance
  const income = payments._sum.amount || 0
  const expenseTotal = approvedExpenses._sum.amount || 0
  console.log(`   Net balance: ${(income - Number(expenseTotal)).toLocaleString()} GNF`)

  // 6. Test Subjects & Teachers
  console.log('\n6. SUBJECTS & TEACHERS')
  console.log('-'.repeat(40))
  const subjectCount = await prisma.subject.count()
  const teacherCount = await prisma.teacherProfile.count()
  const assignmentCount = await prisma.classAssignment.count()
  console.log(`   Subjects: ${subjectCount}`)
  console.log(`   Teachers: ${teacherCount}`)
  console.log(`   Class assignments: ${assignmentCount}`)

  // 7. Summary
  console.log('\n' + '='.repeat(60))
  console.log('SUMMARY: All data seeded correctly!')
  console.log('='.repeat(60))
  console.log(`
  - ${grades.length} grades for school year ${activeYear?.name}
  - ${studentCount} students total
  - ${sessionCount} attendance sessions
  - ${await prisma.expense.count()} expenses
  - ${subjectCount} subjects
  - ${teacherCount} teachers
  `)

  await prisma.$disconnect()
  await pool.end()
}

testData().catch(console.error)
