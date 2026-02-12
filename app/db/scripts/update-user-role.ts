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

async function updateUserRole() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    console.error("❌ DATABASE_URL environment variable is not set")
    process.exit(1)
  }

  const pool = new Pool({ connectionString })
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })

  try {
    console.log('🔄 Updating user role...')

    const updated = await prisma.user.update({
      where: { email: 'abdoulaye.sow.1989@gmail.com' },
      data: { role: StaffRole.proprietaire },
      select: {
        email: true,
        name: true,
        role: true,
      }
    });

    console.log('✅ Role updated successfully!')
    console.log(`   Email: ${updated.email}`)
    console.log(`   Name: ${updated.name || 'N/A'}`)
    console.log(`   New Role: ${updated.role}`)
    console.log()
    console.log('🎉 You now have OWNER (proprietaire) access!')
    console.log('   Full system access with 115+ permissions')

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

updateUserRole();
