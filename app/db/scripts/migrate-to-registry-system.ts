/**
 * Migration Script: Initialize Registry System
 *
 * This script migrates the treasury system to use separate registry and safe balances.
 * The schema should already have TreasuryBalance with registryBalance field (Phase 1).
 *
 * What this script does:
 * 1. Verifies TreasuryBalance record exists with registry fields
 * 2. Prompts for current registry balance (if school is operating)
 * 3. Adjusts safe balance accordingly (registry cash came from safe)
 * 4. Creates opening SafeTransaction record for audit trail
 * 5. Verifies all historical transactions have registryBalanceAfter = 0
 *
 * Run: npx tsx scripts/migrate-to-registry-system.ts
 * Dry run: npx tsx scripts/migrate-to-registry-system.ts --dry-run
 */

import "dotenv/config"
import * as readline from "readline"

// Dynamically import prisma after env is loaded
async function main() {
  const { prisma } = await import("../prisma")

  const isDryRun = process.argv.includes("--dry-run")
  const skipPrompt = process.argv.includes("--skip-prompt")
  const initialBalance = process.argv.find((arg) => arg.startsWith("--initial="))
    ? parseInt(process.argv.find((arg) => arg.startsWith("--initial="))!.split("=")[1])
    : null

  console.log("═══════════════════════════════════════════════════════════")
  console.log("   Registry System Migration Script")
  console.log("═══════════════════════════════════════════════════════════")
  if (isDryRun) {
    console.log("   ⚠️  DRY RUN MODE - No changes will be made")
  }
  console.log("")

  try {
    // Step 1: Verify TreasuryBalance exists and has registry fields
    console.log("Step 1: Verifying TreasuryBalance schema...")
    const treasury = await prisma.treasuryBalance.findFirst()

    if (!treasury) {
      console.log("   ⚠️  No TreasuryBalance record found.")
      console.log("   Creating initial TreasuryBalance record...")

      if (!isDryRun) {
        const newTreasury = await prisma.treasuryBalance.create({
          data: {
            registryBalance: 0,
            registryFloatAmount: 2000000,
            safeBalance: 0,
            bankBalance: 0,
            mobileMoneyBalance: 0,
          },
        })
        console.log(`   ✓ Created TreasuryBalance with ID: ${newTreasury.id}`)
      } else {
        console.log("   [DRY RUN] Would create TreasuryBalance record")
      }
    } else {
      console.log("   ✓ TreasuryBalance record found")
      console.log(`     - Registry Balance: ${treasury.registryBalance.toLocaleString()} GNF`)
      console.log(`     - Registry Float: ${treasury.registryFloatAmount.toLocaleString()} GNF`)
      console.log(`     - Safe Balance: ${treasury.safeBalance.toLocaleString()} GNF`)
      console.log(`     - Bank Balance: ${treasury.bankBalance.toLocaleString()} GNF`)
      console.log(`     - Mobile Money: ${treasury.mobileMoneyBalance.toLocaleString()} GNF`)
    }
    console.log("")

    // Step 2: Check if registry already has a balance
    const currentTreasury = await prisma.treasuryBalance.findFirst()
    if (currentTreasury && currentTreasury.registryBalance > 0) {
      console.log("Step 2: Registry balance check...")
      console.log(`   ✓ Registry already has balance: ${currentTreasury.registryBalance.toLocaleString()} GNF`)
      console.log("   Migration appears to have already been completed.")
      console.log("")

      // Still verify historical transactions
      await verifyHistoricalTransactions(prisma, isDryRun)

      console.log("\n✅ Migration verification complete!")
      return
    }

    // Step 3: Get initial registry balance
    console.log("Step 2: Initial registry balance...")
    let registryAmount = 0

    if (initialBalance !== null) {
      registryAmount = initialBalance
      console.log(`   Using provided initial balance: ${registryAmount.toLocaleString()} GNF`)
    } else if (skipPrompt) {
      console.log("   Skipping prompt - starting with registry balance of 0")
    } else {
      registryAmount = await promptForRegistryBalance()
    }
    console.log("")

    // Step 4: Verify safe has enough funds
    if (currentTreasury && registryAmount > currentTreasury.safeBalance) {
      console.error("❌ Error: Registry amount exceeds safe balance!")
      console.error(`   Registry requested: ${registryAmount.toLocaleString()} GNF`)
      console.error(`   Safe available: ${currentTreasury.safeBalance.toLocaleString()} GNF`)
      process.exit(1)
    }

    // Step 5: Perform migration
    if (registryAmount > 0 && currentTreasury) {
      console.log("Step 3: Migrating balances...")
      console.log(`   Transferring ${registryAmount.toLocaleString()} GNF from Safe to Registry`)

      const newSafeBalance = currentTreasury.safeBalance - registryAmount

      if (!isDryRun) {
        // Update TreasuryBalance
        await prisma.treasuryBalance.update({
          where: { id: currentTreasury.id },
          data: {
            registryBalance: registryAmount,
            safeBalance: newSafeBalance,
          },
        })

        // Create migration transaction
        await prisma.safeTransaction.create({
          data: {
            id: `migration-registry-${Date.now()}`,
            type: "safe_to_registry",
            direction: "out",
            amount: registryAmount,
            registryBalanceAfter: registryAmount,
            safeBalanceAfter: newSafeBalance,
            bankBalanceAfter: currentTreasury.bankBalance,
            mobileMoneyBalanceAfter: currentTreasury.mobileMoneyBalance,
            notes: "System migration: Initial registry balance transfer",
            recordedBy: "SYSTEM_MIGRATION",
            recordedAt: new Date(),
          },
        })

        console.log("   ✓ TreasuryBalance updated")
        console.log("   ✓ Migration transaction created")
      } else {
        console.log("   [DRY RUN] Would update TreasuryBalance:")
        console.log(`     - Registry: 0 → ${registryAmount.toLocaleString()} GNF`)
        console.log(`     - Safe: ${currentTreasury.safeBalance.toLocaleString()} → ${newSafeBalance.toLocaleString()} GNF`)
        console.log("   [DRY RUN] Would create migration SafeTransaction")
      }
      console.log("")
    } else if (registryAmount === 0) {
      console.log("Step 3: No balance transfer needed")
      console.log("   Registry will start at 0 GNF")
      console.log("   Use 'Daily Opening' to initialize registry with float amount")
      console.log("")
    }

    // Step 6: Verify historical transactions
    await verifyHistoricalTransactions(prisma, isDryRun)

    // Step 7: Print final state
    console.log("\n═══════════════════════════════════════════════════════════")
    console.log("   Migration Summary")
    console.log("═══════════════════════════════════════════════════════════")

    const finalTreasury = await prisma.treasuryBalance.findFirst()
    if (finalTreasury) {
      console.log(`   Registry Balance: ${finalTreasury.registryBalance.toLocaleString()} GNF`)
      console.log(`   Safe Balance: ${finalTreasury.safeBalance.toLocaleString()} GNF`)
      console.log(`   Bank Balance: ${finalTreasury.bankBalance.toLocaleString()} GNF`)
      console.log(`   Mobile Money: ${finalTreasury.mobileMoneyBalance.toLocaleString()} GNF`)
      console.log(`   ─────────────────────────────────────────────────────────`)
      const total =
        finalTreasury.registryBalance +
        finalTreasury.safeBalance +
        finalTreasury.bankBalance +
        finalTreasury.mobileMoneyBalance
      console.log(`   Total Liquid Assets: ${total.toLocaleString()} GNF`)
    }
    console.log("")

    if (isDryRun) {
      console.log("⚠️  DRY RUN COMPLETE - No changes were made")
      console.log("   Run without --dry-run to apply changes")
    } else {
      console.log("✅ Migration completed successfully!")
    }
    console.log("")
    console.log("Next steps:")
    console.log("1. Verify the treasury page shows correct balances")
    console.log("2. Test daily opening workflow")
    console.log("3. Test payment recording (should go to registry)")
    console.log("4. Test expense payment (should come from registry)")
  } catch (error) {
    console.error("\n❌ Migration failed:", error)
    throw error
  }
}

async function promptForRegistryBalance(): Promise<number> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return new Promise((resolve) => {
    console.log("   If the school is currently operating, enter the current")
    console.log("   cash amount in the registry (cash box).")
    console.log("   Enter 0 to start fresh (recommended for new setups).")
    console.log("")

    rl.question("   Enter current Registry balance (GNF): ", (answer) => {
      rl.close()
      const amount = parseInt(answer.replace(/[,\s]/g, ""), 10)
      if (isNaN(amount) || amount < 0) {
        console.log("   Invalid amount, using 0")
        resolve(0)
      } else {
        resolve(amount)
      }
    })
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function verifyHistoricalTransactions(prisma: any, isDryRun: boolean) {
  console.log("Step 4: Verifying historical transactions...")

  // Count transactions with null registryBalanceAfter
  const nullCount = await prisma.safeTransaction.count({
    where: { registryBalanceAfter: null },
  })

  if (nullCount > 0) {
    console.log(`   ⚠️  Found ${nullCount} transactions with NULL registryBalanceAfter`)

    if (!isDryRun) {
      await prisma.safeTransaction.updateMany({
        where: { registryBalanceAfter: null },
        data: { registryBalanceAfter: 0 },
      })
      console.log(`   ✓ Updated ${nullCount} transactions to registryBalanceAfter = 0`)
    } else {
      console.log(`   [DRY RUN] Would update ${nullCount} transactions`)
    }
  } else {
    console.log("   ✓ All transactions have registryBalanceAfter set")
  }

  // Verify count
  const totalTransactions = await prisma.safeTransaction.count()
  const zeroRegistryCount = await prisma.safeTransaction.count({
    where: { registryBalanceAfter: 0 },
  })

  // Count registry transactions (should have non-zero registryBalanceAfter)
  const registryTransactions = await prisma.safeTransaction.count({
    where: {
      type: { in: ["safe_to_registry", "registry_to_safe", "registry_adjustment"] },
    },
  })

  console.log(`   Total transactions: ${totalTransactions}`)
  console.log(`   Pre-registry transactions (registryBalanceAfter=0): ${zeroRegistryCount}`)
  console.log(`   Registry-related transactions: ${registryTransactions}`)
}

// Execute
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
