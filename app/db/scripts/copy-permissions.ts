import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"
import pg from "pg"
import fs from "fs"
import path from "path"

const { Pool } = pg

// Load .env if DATABASE_URL not set
if (!process.env.DATABASE_URL) {
  // Try multiple possible locations for .env
  const possiblePaths = [
    path.join(process.cwd(), ".env"),
    path.join(process.cwd(), "..", "ui", ".env"),
    path.join(process.cwd(), "app", "ui", ".env"),
  ]

  for (const envPath of possiblePaths) {
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
      break
    }
  }
}

async function copyPermissions() {
  const sourceEmail = 'abdoulaye.sow.1989@gmail.com'
  const targetEmail = 'diallomusto@gmail.com'

  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    console.error("❌ DATABASE_URL environment variable is not set")
    process.exit(1)
  }

  const pool = new Pool({ connectionString })
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })

  try {
    // 1. Find both users
    const sourceUser = await prisma.user.findUnique({
      where: { email: sourceEmail },
      include: {
        permissionOverrides: true,
      },
    })

    const targetUser = await prisma.user.findUnique({
      where: { email: targetEmail },
    })

    if (!sourceUser) {
      console.error(`❌ Source user not found: ${sourceEmail}`)
      process.exit(1)
    }

    if (!targetUser) {
      console.error(`❌ Target user not found: ${targetEmail}`)
      process.exit(1)
    }

    console.log('\n📋 Current State:')
    console.log('─'.repeat(60))
    console.log(`Source: ${sourceUser.email}`)
    console.log(`  Role: ${sourceUser.staffRole || 'none'}`)
    console.log(`  Permission Overrides: ${sourceUser.permissionOverrides.length}`)

    console.log(`\nTarget: ${targetUser.email}`)
    console.log(`  Role: ${targetUser.staffRole || 'none'}`)

    // 2. Update target user's role
    console.log('\n🔄 Updating target user role...')
    await prisma.user.update({
      where: { id: targetUser.id },
      data: {
        staffRole: sourceUser.staffRole,
        schoolLevel: sourceUser.schoolLevel,
      },
    })
    console.log(`✅ Updated role to: ${sourceUser.staffRole}`)
    if (sourceUser.schoolLevel) {
      console.log(`✅ Updated school level to: ${sourceUser.schoolLevel}`)
    }

    // 3. Copy permission overrides
    if (sourceUser.permissionOverrides.length > 0) {
      console.log(`\n🔄 Copying ${sourceUser.permissionOverrides.length} permission overrides...`)

      // First, delete existing overrides for target user to avoid conflicts
      const deleted = await prisma.permissionOverride.deleteMany({
        where: { userId: targetUser.id },
      })
      if (deleted.count > 0) {
        console.log(`  Removed ${deleted.count} existing overrides`)
      }

      // Create new overrides
      for (const override of sourceUser.permissionOverrides) {
        await prisma.permissionOverride.create({
          data: {
            userId: targetUser.id,
            resource: override.resource,
            action: override.action,
            scope: override.scope,
            granted: override.granted,
            reason: `Copied from ${sourceEmail}`,
            grantedBy: targetUser.id, // Self-granted in this case
          },
        })
      }
      console.log(`✅ Copied ${sourceUser.permissionOverrides.length} permission overrides`)

      // Show details
      console.log('\n📝 Permission Overrides:')
      for (const override of sourceUser.permissionOverrides) {
        const type = override.granted ? 'GRANT' : 'DENY'
        console.log(`  ${type}: ${override.resource}.${override.action} (${override.scope})`)
      }
    } else {
      console.log('\n📝 No permission overrides to copy')
    }

    console.log('\n✅ Permission copy complete!')
    console.log('─'.repeat(60))

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
    await pool.end()
  }
}

copyPermissions()
