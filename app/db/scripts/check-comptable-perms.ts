import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"
import pg from "pg"
import fs from "fs"
import path from "path"

const { Pool } = pg

// Load .env if DATABASE_URL not set
if (!process.env.DATABASE_URL) {
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
      console.log(`✅ Loaded environment from ${envPath}\n`)
      break
    }
  }
}

if (!process.env.DATABASE_URL) {
  throw new Error("❌ DATABASE_URL environment variable is not set")
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const perms = await prisma.rolePermission.findMany({
    where: { role: 'comptable' },
    orderBy: [{ resource: 'asc' }, { action: 'asc' }]
  })

  console.log('📋 Comptable Role Permissions')
  console.log('============================')
  console.log(`Total: ${perms.length} permissions\n`)

  console.log('🔍 Safe Expense Permissions:')
  const safeExpense = perms.filter(p => p.resource === 'safe_expense')
  safeExpense.forEach(p => {
    console.log(`   ✓ ${p.action.padEnd(10)} (scope: ${p.scope})`)
  })

  console.log('\n📊 All Permissions by Resource:')
  const grouped = perms.reduce((acc, p) => {
    if (!acc[p.resource]) acc[p.resource] = []
    acc[p.resource].push(p.action)
    return acc
  }, {} as Record<string, string[]>)

  Object.entries(grouped).sort().forEach(([resource, actions]) => {
    console.log(`   ${resource.padEnd(25)}: ${actions.sort().join(', ')}`)
  })
}

main()
  .then(() => {
    prisma.$disconnect()
    pool.end()
  })
  .catch((e) => {
    console.error(e)
    prisma.$disconnect()
    pool.end()
    process.exit(1)
  })
