// Shared Prisma client for the whole monorepo.
// Uses Prisma v7 driver adapter (pg + @prisma/adapter-pg).
// Lazy initialization to improve compilation speed.
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
  // eslint-disable-next-line no-var
  var prismaPool: Pool | undefined
}

// Lazy initialization - only creates pool/client when first accessed
function getPrismaClient(): PrismaClient {
  if (global.prisma) {
    return global.prisma
  }

  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error("DATABASE_URL is required to initialize Prisma")
  }

  // Reuse existing pool if available (hot reload in dev)
  if (!global.prismaPool) {
    global.prismaPool = new Pool({ connectionString })
  }

  const adapter = new PrismaPg(global.prismaPool)
  const client = new PrismaClient({ adapter })

  if (process.env.NODE_ENV === "development") {
    global.prisma = client
  }

  return client
}

// Export a proxy that lazily initializes on first property access
// This prevents pool creation at import time
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrismaClient()
    const value = client[prop as keyof PrismaClient]
    // Bind methods to the client
    if (typeof value === "function") {
      return value.bind(client)
    }
    return value
  },
})
