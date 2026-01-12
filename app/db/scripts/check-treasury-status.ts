/**
 * Treasury Status Check Script
 *
 * Displays current treasury balances and transaction summary.
 * Updated to use TreasuryBalance with registry tracking.
 *
 * Run: npx tsx scripts/check-treasury-status.ts
 */

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config({ path: '.env' })

const { Pool } = pg

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  console.error('❌ DATABASE_URL not set in environment')
  process.exit(1)
}

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('═══════════════════════════════════════════════════════════')
  console.log('   Treasury Status Report')
  console.log('═══════════════════════════════════════════════════════════\n')

  // Get current balance
  const balance = await prisma.treasuryBalance.findFirst()

  console.log('Current Balances:')
  console.log('  Registry (Caisse):', (balance?.registryBalance ?? 0).toLocaleString(), 'GNF')
  console.log('  Safe (Coffre):', (balance?.safeBalance ?? 0).toLocaleString(), 'GNF')
  console.log('  Bank:', (balance?.bankBalance ?? 0).toLocaleString(), 'GNF')
  console.log('  Mobile Money:', (balance?.mobileMoneyBalance ?? 0).toLocaleString(), 'GNF')
  console.log('  ─────────────────────────────────────────────────────────')
  const totalCash = (balance?.registryBalance ?? 0) + (balance?.safeBalance ?? 0)
  const totalAssets = totalCash + (balance?.bankBalance ?? 0) + (balance?.mobileMoneyBalance ?? 0)
  console.log('  Total Cash (Registry + Safe):', totalCash.toLocaleString(), 'GNF')
  console.log('  Total Liquid Assets:', totalAssets.toLocaleString(), 'GNF')
  console.log()

  console.log('Registry Configuration:')
  console.log('  Float Amount:', (balance?.registryFloatAmount ?? 2000000).toLocaleString(), 'GNF')
  console.log('  Safe Threshold Min:', (balance?.safeThresholdMin ?? 5000000).toLocaleString(), 'GNF')
  console.log('  Safe Threshold Max:', (balance?.safeThresholdMax ?? 20000000).toLocaleString(), 'GNF')
  console.log()

  // Count transactions
  const txCount = await prisma.safeTransaction.count()
  const bankCount = await prisma.bankTransfer.count()

  // Count registry-specific transactions
  const registryOpenings = await prisma.safeTransaction.count({
    where: { type: 'safe_to_registry' }
  })
  const registryClosings = await prisma.safeTransaction.count({
    where: { type: 'registry_to_safe' }
  })
  const registryAdjustments = await prisma.safeTransaction.count({
    where: { type: 'registry_adjustment' }
  })

  console.log('Transaction Counts:')
  console.log('  Total Safe Transactions:', txCount)
  console.log('  Bank Transfers:', bankCount)
  console.log('  Registry Openings (safe→registry):', registryOpenings)
  console.log('  Registry Closings (registry→safe):', registryClosings)
  console.log('  Registry Adjustments:', registryAdjustments)
  console.log()

  // Get date range of transactions
  const firstTx = await prisma.safeTransaction.findFirst({
    orderBy: { recordedAt: 'asc' },
    select: { recordedAt: true }
  })
  const lastTx = await prisma.safeTransaction.findFirst({
    orderBy: { recordedAt: 'desc' },
    select: { recordedAt: true }
  })

  if (firstTx && lastTx) {
    console.log('Transaction Date Range:')
    console.log('  First:', firstTx.recordedAt.toLocaleDateString())
    console.log('  Last:', lastTx.recordedAt.toLocaleDateString())
    console.log()
  }

  // Get cash flow summary
  const payments = await prisma.safeTransaction.findMany({
    where: {
      type: 'student_payment',
      direction: 'in'
    },
    select: { amount: true }
  })

  const expenses = await prisma.safeTransaction.findMany({
    where: {
      type: 'expense_payment',
      direction: 'out'
    },
    select: { amount: true }
  })

  const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0)
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)

  console.log('Cash Flow Summary:')
  console.log('  Total payments in:', totalPayments.toLocaleString(), 'GNF')
  console.log('  Total expenses out:', totalExpenses.toLocaleString(), 'GNF')
  console.log('  Net cash flow:', (totalPayments - totalExpenses).toLocaleString(), 'GNF')
  console.log()

  // Registry status
  if (balance) {
    console.log('Registry Status:')
    if (balance.registryBalance > 0) {
      console.log('  Status: OPEN (has balance)')
      console.log('  Current registry balance:', balance.registryBalance.toLocaleString(), 'GNF')
    } else {
      console.log('  Status: CLOSED (zero balance)')
      console.log('  Use Daily Opening to transfer float from safe to registry')
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
