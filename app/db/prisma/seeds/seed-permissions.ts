/**
 * Permission Seeder
 *
 * Syncs the code-based role-to-permissions mapping (permissions-v2.ts) to the
 * RolePermission table for audit/display purposes.
 *
 * The actual permission checking uses the code-based mapping directly.
 * This seed keeps the DB in sync for admin UI display.
 *
 * Usage (run from repo root): npx tsx app/db/prisma/seeds/seed-permissions.ts
 */

import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient, StaffRole } from "@prisma/client"
import pg from "pg"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const { Pool } = pg

// Load .env from app/ui if DATABASE_URL not set
if (!process.env.DATABASE_URL) {
  // Try app/ui/.env first (running from repo root)
  const candidates = [
    path.join(process.cwd(), "app", "ui", ".env"),
    path.join(process.cwd(), "app", "ui", ".env.local"),
    path.join(process.cwd(), ".env"),
  ]
  for (const envPath of candidates) {
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

async function main() {
  console.log("🔐 Syncing role permissions from code-based mapping...")

  // Dynamic import of permissions-v2 to avoid cross-package module resolution issues
  // Must use pathToFileURL on Windows for ESM dynamic imports
  const { pathToFileURL } = await import("url")
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = path.dirname(__filename)
  const permissionsPath = path.resolve(__dirname, "../../../ui/lib/permissions-v2.ts")
  const { ROLE_PERMISSIONS } = await import(pathToFileURL(permissionsPath).href)

  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    console.error("❌ DATABASE_URL environment variable is not set")
    process.exit(1)
  }

  const pool = new Pool({ connectionString })
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })

  try {
    // Clear existing permissions and re-sync from code
    const deleted = await prisma.rolePermission.deleteMany({})
    console.log(`   Cleared ${deleted.count} existing permissions`)

    let created = 0

    for (const [roleKey, config] of Object.entries(ROLE_PERMISSIONS)) {
      const role = roleKey as StaffRole

      // Skip wildcard roles (proprietaire, admin_systeme) — they have all permissions
      if (config.permissions === "*") {
        console.log(`   ${role}: wildcard (all permissions) — skipped`)
        continue
      }

      // Insert each explicit permission
      for (const perm of config.permissions) {
        await prisma.rolePermission.create({
          data: {
            role,
            resource: perm.resource,
            action: perm.action,
            scope: perm.scope,
          },
        })
        created++
      }
      console.log(`   ${role}: ${config.permissions.length} permissions`)
    }

    console.log("\n" + "=".repeat(60))
    console.log("✅ Permission sync completed!")
    console.log("=".repeat(60))
    console.log(`   Created: ${created}`)
    console.log("\n📊 Permissions by role:")

    const roles = Object.values(StaffRole)
    for (const role of roles) {
      const count = await prisma.rolePermission.count({ where: { role } })
      const config = ROLE_PERMISSIONS[role]
      const note = config.permissions === "*" ? " (wildcard — checked in code)" : ""
      console.log(`   ${role}: ${count} permissions${note}`)
    }

    console.log("=".repeat(60))
  } catch (error) {
    console.error("❌ Failed to sync permissions:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
    await pool.end()
  }
}

main()
