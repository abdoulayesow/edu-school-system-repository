import { prisma } from '../ui/lib/prisma'

async function check() {
  const accounts = await prisma.account.findMany()
  const users = await prisma.user.findMany()

  console.log('=== ACCOUNTS ===')
  console.log(JSON.stringify(accounts, null, 2))

  console.log('\n=== USERS ===')
  console.log(JSON.stringify(users, null, 2))

  await prisma.$disconnect()
}

check().catch(console.error)
