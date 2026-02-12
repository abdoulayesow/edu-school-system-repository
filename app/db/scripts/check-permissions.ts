import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"
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

async function checkPermissions() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    console.error("❌ DATABASE_URL environment variable is not set")
    process.exit(1)
  }

  const pool = new Pool({ connectionString })
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })

  try {
    console.log('📊 Checking role permissions...\n')

    // Get all comptable permissions
    const comptablePerms = await prisma.rolePermission.findMany({
      where: { role: 'comptable' },
      orderBy: [
        { resource: 'asc' },
        { action: 'asc' }
      ]
    })

    console.log('='.repeat(70))
    console.log('COMPTABLE ROLE PERMISSIONS (28 total)')
    console.log('='.repeat(70))

    let currentResource = ''
    for (const perm of comptablePerms) {
      if (perm.resource !== currentResource) {
        if (currentResource) console.log()
        console.log(`📂 ${perm.resource}:`)
        currentResource = perm.resource
      }
      console.log(`   - ${perm.action.padEnd(10)} (scope: ${perm.scope})`)
    }

    console.log('\n' + '='.repeat(70))

    // Check for the specific safe_expense permissions
    const safeExpensePerms = comptablePerms.filter(p => p.resource === 'safe_expense')

    console.log('\n🔍 SAFE_EXPENSE PERMISSIONS:')
    console.log('='.repeat(70))

    if (safeExpensePerms.length === 0) {
      console.log('⚠️  NO safe_expense permissions found for comptable')
    } else {
      safeExpensePerms.forEach(p => {
        const icon = (p.action === 'update' || p.action === 'delete') ? '✅' : '  '
        console.log(`${icon} ${p.action.padEnd(10)} (scope: ${p.scope})`)
      })

      const hasUpdate = safeExpensePerms.some(p => p.action === 'update')
      const hasDelete = safeExpensePerms.some(p => p.action === 'delete')

      console.log()
      console.log(`Update permission: ${hasUpdate ? '✅ EXISTS' : '❌ MISSING'}`)
      console.log(`Delete permission: ${hasDelete ? '✅ EXISTS' : '❌ MISSING'}`)
    }

    console.log('='.repeat(70))

    // Get proprietaire permissions count
    const proprietaireCount = await prisma.rolePermission.count({
      where: { role: 'proprietaire' }
    })

    console.log(`\n📊 Your role (proprietaire) has: ${proprietaireCount} permissions`)

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

checkPermissions();
