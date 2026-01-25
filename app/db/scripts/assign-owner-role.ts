/**
 * Assign Owner (proprietaire) Role to User
 *
 * This script assigns the owner role to a specific user by email.
 *
 * Usage: npx tsx app/db/scripts/assign-owner-role.ts
 */

import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient, StaffRole } from "@prisma/client"
import pg from "pg"
import fs from "fs"
import path from "path"

const { Pool } = pg

// Load .env from app/ui if DATABASE_URL not set
if (!process.env.DATABASE_URL) {
  const envPath = path.join(process.cwd(), "app", "ui", ".env")
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

// Email to assign owner role
const OWNER_EMAIL = "abdoulaye.sow.1989@gmail.com"

async function main() {
  console.log(`🔐 Assigning Owner Role to ${OWNER_EMAIL}...`)

  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    console.error("❌ DATABASE_URL environment variable is not set")
    process.exit(1)
  }

  const pool = new Pool({ connectionString })
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })

  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: OWNER_EMAIL },
    })

    if (!user) {
      console.error(`❌ User with email ${OWNER_EMAIL} not found`)
      console.log("\n💡 Available users:")
      const allUsers = await prisma.user.findMany({
        select: { id: true, email: true, name: true, staffRole: true },
      })
      allUsers.forEach((u) => {
        console.log(`   - ${u.email} (${u.name}) - Current role: ${u.staffRole || "none"}`)
      })
      process.exit(1)
    }

    console.log(`\n📧 Found user: ${user.name} (${user.email})`)
    console.log(`   Current role: ${user.staffRole || "none"}`)

    // Update user to owner role
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        staffRole: StaffRole.proprietaire,
      },
    })

    console.log(`\n✅ Successfully assigned Owner (proprietaire) role!`)
    console.log(`   User: ${updatedUser.name}`)
    console.log(`   Email: ${updatedUser.email}`)
    console.log(`   New Role: ${updatedUser.staffRole}`)
    console.log(`\n🎉 ${user.name} now has full system access with 115+ permissions!`)
  } catch (error) {
    console.error("❌ Failed to assign owner role:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
    await pool.end()
  }
}

main()
