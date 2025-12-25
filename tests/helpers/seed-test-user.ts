/**
 * Seed script to create or update the E2E test user.
 * Run this before running E2E tests to ensure the test user exists.
 * 
 * Usage: npx tsx tests/helpers/seed-test-user.ts
 */

import bcrypt from 'bcrypt'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import pg from 'pg'
import fs from 'fs'
import path from 'path'

const { Pool } = pg

// Load .env from app/ui if DATABASE_URL not set
if (!process.env.DATABASE_URL) {
  const envPath = path.join(process.cwd(), 'app', 'ui', '.env')
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8')
    for (const line of envContent.split('\n')) {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=')
        const value = valueParts.join('=').replace(/^["']|["']$/g, '')
        if (key && !process.env[key]) {
          process.env[key] = value
        }
      }
    }
  }
}

// Test user credentials - same as in global-setup.ts
const TEST_USER = {
  email: process.env.E2E_TEST_EMAIL || 'abdoulaye.sow.1989@gmail.com',
  password: process.env.E2E_TEST_PASSWORD || 'TestPassword123',
  name: 'E2E Test User',
  role: 'director',
}

async function main() {
  console.log('🌱 Seeding E2E test user...')
  console.log(`   Email: ${TEST_USER.email}`)

  // Create Prisma client with pg adapter
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    console.error('❌ DATABASE_URL environment variable is not set')
    process.exit(1)
  }

  const pool = new Pool({ connectionString })
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })

  try {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: TEST_USER.email },
    })

    const passwordHash = await bcrypt.hash(TEST_USER.password, 12)

    if (existingUser) {
      // Update the user to ensure password and status are correct
      const updatedUser = await prisma.user.update({
        where: { email: TEST_USER.email },
        data: {
          passwordHash,
          status: 'active',
          role: TEST_USER.role,
        },
        select: {
          id: true,
          email: true,
          passwordHash: true,
          status: true,
          role: true,
        }
      })
      console.log('✅ Updated existing test user with fresh password hash')
      console.log(`   User ID: ${updatedUser.id}`)
      console.log(`   Status: ${updatedUser.status}`)
      console.log(`   Role: ${updatedUser.role}`)
      console.log(`   PasswordHash exists: ${!!updatedUser.passwordHash}`)
    } else {
      // Create new user
      await prisma.user.create({
        data: {
          email: TEST_USER.email,
          name: TEST_USER.name,
          passwordHash,
          role: TEST_USER.role,
          status: 'active',
        },
      })
      console.log('✅ Created new test user')
    }

    console.log('')
    console.log('Test user ready! You can now run E2E tests:')
    console.log('  npm run test:e2e')
    console.log('')
  } catch (error) {
    console.error('❌ Failed to seed test user:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
    await pool.end()
  }
}

main()
