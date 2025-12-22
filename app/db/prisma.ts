// Shared Prisma client for the whole monorepo.
// Uses Prisma v7 driver adapter (pg + @prisma/adapter-pg).
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error("DATABASE_URL is required to initialize Prisma")
  }

  const pool = new Pool({ connectionString })
  const adapter = new PrismaPg(pool)

  return new PrismaClient({ adapter })
}

const prisma = global.prisma ?? createPrismaClient()
if (process.env.NODE_ENV === "development") global.prisma = prisma

export { prisma }
