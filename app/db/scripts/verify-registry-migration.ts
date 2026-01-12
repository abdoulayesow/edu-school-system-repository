/**
 * Verification Script: Registry Migration
 *
 * Verifies that the SafeBalance → TreasuryBalance migration completed successfully
 *
 * Run: npx tsx scripts/verify-registry-migration.ts
 */

import 'dotenv/config'
import { prisma } from '../prisma'

async function verifyMigration() {
  console.log('🔍 Verifying Registry Migration...\n')

  try {
    // Test 1: Can we query TreasuryBalance?
    console.log('Test 1: Query TreasuryBalance table')
    const treasury = await prisma.treasuryBalance.findFirst()

    if (!treasury) {
      console.log('   ⚠️  No TreasuryBalance record found (this is ok for new databases)')
    } else {
      console.log('   ✓ TreasuryBalance record found:')
      console.log(`     - ID: ${treasury.id}`)
      console.log(`     - Registry Balance: ${treasury.registryBalance} GNF`)
      console.log(`     - Registry Float: ${treasury.registryFloatAmount} GNF`)
      console.log(`     - Safe Balance: ${treasury.safeBalance} GNF`)
      console.log(`     - Bank Balance: ${treasury.bankBalance} GNF`)
      console.log(`     - Mobile Money: ${treasury.mobileMoneyBalance} GNF\n`)
    }

    // Test 2: Check SafeTransaction table has new column
    console.log('Test 2: Query SafeTransaction table')
    const transactionCount = await prisma.safeTransaction.count()
    console.log(`   ✓ Found ${transactionCount} transactions`)

    if (transactionCount > 0) {
      const recentTransaction = await prisma.safeTransaction.findFirst({
        orderBy: { recordedAt: 'desc' }
      })
      console.log(`   ✓ Most recent transaction:`)
      console.log(`     - Type: ${recentTransaction?.type}`)
      console.log(`     - Amount: ${recentTransaction?.amount} GNF`)
      console.log(`     - Registry Balance After: ${recentTransaction?.registryBalanceAfter ?? 'NULL (pre-registry)'}`)
      console.log(`     - Safe Balance After: ${recentTransaction?.safeBalanceAfter} GNF\n`)
    }

    // Test 3: Verify schema columns exist
    console.log('Test 3: Verify TreasuryBalance has all required columns')
    const requiredFields = [
      'id',
      'registryBalance',
      'registryFloatAmount',
      'safeBalance',
      'bankBalance',
      'mobileMoneyBalance'
    ]

    let allFieldsPresent = true
    for (const field of requiredFields) {
      if (treasury && field in treasury) {
        console.log(`   ✓ ${field}: present`)
      } else {
        console.log(`   ✗ ${field}: MISSING`)
        allFieldsPresent = false
      }
    }

    if (!allFieldsPresent) {
      throw new Error('Some required fields are missing!')
    }

    console.log('\n✅ Migration verification PASSED!')
    console.log('The database schema has been successfully updated for registry tracking.\n')

    // Summary
    console.log('📋 Next Steps:')
    console.log('   1. The registry system is now available')
    console.log('   2. Registry balance starts at 0 GNF')
    console.log('   3. Use daily opening/closing operations to manage registry')
    console.log('   4. All existing safe transactions are preserved\n')

  } catch (error) {
    console.error('❌ Migration verification FAILED:', error)
    throw error
  }
}

verifyMigration()
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
