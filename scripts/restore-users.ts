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

async function restoreUsers() {
  console.log('Restoring users from backup...')

  const backup = JSON.parse(fs.readFileSync('database-backup.json', 'utf-8'))

  // Restore users
  for (const user of backup.user) {
    try {
      await prisma.user.create({ data: user })
      console.log(`  Created user: ${user.email}`)
    } catch (e) {
      console.log(`  Skipping user ${user.email}: ${(e as Error).message}`)
    }
  }

  // Restore accounts (for OAuth)
  for (const account of backup.account) {
    try {
      await prisma.account.create({ data: account })
      console.log(`  Created account for user: ${account.userId}`)
    } catch (e) {
      console.log(`  Skipping account: ${(e as Error).message}`)
    }
  }

  console.log('\nUsers restored!')
  await prisma.$disconnect()
  await pool.end()
}

restoreUsers().catch(console.error)
