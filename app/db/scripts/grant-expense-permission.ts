/**
 * Grant safe_expense:create permission to Director
 *
 * This script grants the permission to create expenses to the director user
 * (abdoulaye.sow.1989@gmail.com)
 *
 * Run with: npx tsx scripts/grant-expense-permission.ts
 */

import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient, PermissionResource, PermissionAction, PermissionScope } from "@prisma/client"
import pg from "pg"
import fs from "fs"
import path from "path"

const { Pool } = pg

// Load .env from app/ui if DATABASE_URL not set
if (!process.env.DATABASE_URL) {
  const envPath = path.join(process.cwd(), "..", "ui", ".env")
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

async function main() {
  const DIRECTOR_EMAIL = "abdoulaye.sow.1989@gmail.com"

  console.log("🔍 Looking for director user...")

  // Find the director user
  const director = await prisma.user.findUnique({
    where: { email: DIRECTOR_EMAIL },
    select: {
      id: true,
      name: true,
      email: true,
      staffRole: true,
    },
  })

  if (!director) {
    console.error(`❌ User with email ${DIRECTOR_EMAIL} not found`)
    process.exit(1)
  }

  if (!director.staffRole) {
    console.error(`❌ User ${DIRECTOR_EMAIL} does not have a staff role`)
    process.exit(1)
  }

  console.log(`✅ Found user: ${director.name} (${director.email})`)
  console.log(`   Role: ${director.staffRole}`)

  // Check if permission already exists for this role
  const existingPermission = await prisma.rolePermission.findFirst({
    where: {
      role: director.staffRole,
      resource: PermissionResource.safe_expense,
      action: PermissionAction.create,
    },
  })

  if (existingPermission) {
    console.log(`✅ Permission safe_expense:create already granted to role ${director.staffRole}`)
    return
  }

  console.log(`📝 Granting permission: safe_expense:create to role ${director.staffRole}...`)

  // Grant the permission to the role
  await prisma.rolePermission.create({
    data: {
      role: director.staffRole,
      resource: PermissionResource.safe_expense,
      action: PermissionAction.create,
      scope: PermissionScope.all,
    },
  })

  console.log(`✅ Permission granted successfully!`)
  console.log(`   Role: ${director.staffRole}`)
  console.log(`   Resource: safe_expense`)
  console.log(`   Action: create`)
  console.log(`   Scope: all`)
  console.log(`\n💡 All users with role "${director.staffRole}" can now create expenses`)
  console.log(`   The "Add Expense" button should now be visible on the expenses page`)
}

main()
  .catch((error) => {
    console.error("❌ Error:", error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
