/**
 * Backup Script: Treasury Data Backup
 *
 * This script creates a backup of critical treasury data before
 * performing registry system migration or other treasury changes.
 *
 * Run: npx tsx scripts/backup-before-registry-migration.ts
 */

import 'dotenv/config'
import { prisma } from '../prisma'
import * as fs from 'fs'
import * as path from 'path'

interface BackupData {
  timestamp: string
  treasuryBalance: {
    id: string
    registryBalance: number
    registryFloatAmount: number
    safeBalance: number
    bankBalance: number
    mobileMoneyBalance: number
  } | null
  recentTransactions: unknown[]
  recentPayments: unknown[]
  recentExpenses: unknown[]
  bankTransfers: unknown[]
  dailyVerifications: unknown[]
}

async function createBackup() {
  console.log('🔄 Starting treasury data backup...\n')

  try {
    // Fetch TreasuryBalance
    console.log('📊 Fetching TreasuryBalance...')
    const treasuryBalance = await prisma.treasuryBalance.findFirst()
    console.log(`   ✓ Current Registry Balance: ${treasuryBalance?.registryBalance || 0} GNF`)
    console.log(`   ✓ Current Safe Balance: ${treasuryBalance?.safeBalance || 0} GNF`)
    console.log(`   ✓ Current Bank Balance: ${treasuryBalance?.bankBalance || 0} GNF`)
    console.log(`   ✓ Current Mobile Money: ${treasuryBalance?.mobileMoneyBalance || 0} GNF\n`)

    // Fetch recent transactions (last 100)
    console.log('📋 Fetching recent SafeTransactions...')
    const recentTransactions = await prisma.safeTransaction.findMany({
      take: 100,
      orderBy: { recordedAt: 'desc' },
      include: {
        recorder: { select: { name: true, email: true } },
        student: { select: { studentNumber: true, firstName: true, lastName: true } }
      }
    })
    console.log(`   ✓ Backed up ${recentTransactions.length} transactions\n`)

    // Fetch recent payments (last 50)
    console.log('💰 Fetching recent Payments...')
    const recentPayments = await prisma.payment.findMany({
      take: 50,
      orderBy: { recordedAt: 'desc' },
      where: { method: 'cash' }, // Only cash payments affect safe
      include: {
        enrollment: {
          select: {
            enrollmentNumber: true,
            firstName: true,
            lastName: true
          }
        }
      }
    })
    console.log(`   ✓ Backed up ${recentPayments.length} cash payments\n`)

    // Fetch recent expenses (last 50)
    console.log('💸 Fetching recent Expenses...')
    const recentExpenses = await prisma.expense.findMany({
      take: 50,
      orderBy: { date: 'desc' },
      where: {
        status: 'paid',
        method: 'cash'
      }
    })
    console.log(`   ✓ Backed up ${recentExpenses.length} cash expenses\n`)

    // Fetch bank transfers (last 30)
    console.log('🏦 Fetching BankTransfers...')
    const bankTransfers = await prisma.bankTransfer.findMany({
      take: 30,
      orderBy: { transferDate: 'desc' }
    })
    console.log(`   ✓ Backed up ${bankTransfers.length} bank transfers\n`)

    // Fetch daily verifications (last 30 days)
    console.log('✅ Fetching DailyVerifications...')
    const dailyVerifications = await prisma.dailyVerification.findMany({
      take: 30,
      orderBy: { verificationDate: 'desc' }
    })
    console.log(`   ✓ Backed up ${dailyVerifications.length} daily verifications\n`)

    // Create backup object
    const backup: BackupData = {
      timestamp: new Date().toISOString(),
      treasuryBalance: treasuryBalance ? {
        id: treasuryBalance.id,
        registryBalance: treasuryBalance.registryBalance,
        registryFloatAmount: treasuryBalance.registryFloatAmount,
        safeBalance: treasuryBalance.safeBalance,
        bankBalance: treasuryBalance.bankBalance,
        mobileMoneyBalance: treasuryBalance.mobileMoneyBalance,
      } : null,
      recentTransactions,
      recentPayments,
      recentExpenses,
      bankTransfers,
      dailyVerifications
    }

    // Save to file
    const backupDir = path.join(__dirname, '../backups')
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true })
    }

    const filename = `treasury-backup-${new Date().toISOString().split('T')[0]}.json`
    const filepath = path.join(backupDir, filename)

    fs.writeFileSync(filepath, JSON.stringify(backup, null, 2))

    console.log('✅ Backup completed successfully!')
    console.log(`📁 Backup saved to: ${filepath}`)
    console.log(`📊 Backup size: ${(fs.statSync(filepath).size / 1024).toFixed(2)} KB\n`)

    // Print summary
    console.log('📈 Backup Summary:')
    console.log(`   - TreasuryBalance: 1 record`)
    console.log(`   - SafeTransactions: ${recentTransactions.length} records`)
    console.log(`   - Payments (cash): ${recentPayments.length} records`)
    console.log(`   - Expenses (cash): ${recentExpenses.length} records`)
    console.log(`   - BankTransfers: ${bankTransfers.length} records`)
    console.log(`   - DailyVerifications: ${dailyVerifications.length} records`)
    console.log('\n✅ You can now safely proceed with the migration!')

  } catch (error) {
    console.error('❌ Error creating backup:', error)
    throw error
  }
}

createBackup()
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
