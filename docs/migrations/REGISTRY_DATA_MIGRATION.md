# Registry-Based Cash Management - Data Migration Strategy

**Document Status**: Phase 0 - Planning
**Last Updated**: 2026-01-11
**Feature**: Registry-Based Cash Management

## Overview

This document outlines the strategy for migrating from the current `SafeBalance` model to the new `TreasuryBalance` model with separate registry and safe tracking. The migration must be executed carefully to preserve data integrity and maintain accurate financial records.

## Current State vs Target State

### Current Database Schema

```prisma
model SafeBalance {
  id                   String    @id @default(cuid())
  safeBalance          Int       @default(0)      // Currently: mixed Registry + Safe
  bankBalance          Int       @default(0)
  mobileMoneyBalance   Int       @default(0)
  safeThresholdMax     Int       @default(20000000)
  safeThresholdWarning Int       @default(15000000)
  createdAt            DateTime  @default(now())
  updatedAt            DateTime  @updatedAt
}

model SafeTransaction {
  id                  String                @id @default(cuid())
  type                SafeTransactionType
  direction           TransactionDirection
  amount              Int
  safeBalanceAfter    Int
  bankBalanceAfter    Int
  mobileBalanceAfter  Int
  // ... other fields
}

enum SafeTransactionType {
  student_payment
  expense_payment
  safe_to_bank
  bank_to_safe
  // ...
}
```

### Target Database Schema

```prisma
model TreasuryBalance {
  id                     String    @id @default(cuid())
  registryBalance        Int       @default(0)      // NEW - Working cash box
  safeBalance            Int       @default(0)      // Secure overnight storage
  bankBalance            Int       @default(0)
  mobileMoneyBalance     Int       @default(0)
  registryFloatAmount    Int       @default(2000000) // NEW - Standard float
  safeThresholdMax       Int       @default(20000000)
  safeThresholdWarning   Int       @default(15000000)
  createdAt              DateTime  @default(now())
  updatedAt              DateTime  @updatedAt
}

model SafeTransaction {
  id                     String                @id @default(cuid())
  type                   SafeTransactionType
  direction              TransactionDirection
  amount                 Int
  registryBalanceAfter   Int                   // NEW
  safeBalanceAfter       Int
  bankBalanceAfter       Int
  mobileBalanceAfter     Int
  // ... other fields
}

enum SafeTransactionType {
  student_payment
  expense_payment
  safe_to_bank
  bank_to_safe
  registry_to_safe       // NEW
  safe_to_registry       // NEW
  registry_adjustment    // NEW
  // ...
}
```

## Migration Challenges

### 1. Historical Data Ambiguity

**Problem**: Existing `safeBalance` represents a mix of registry and safe cash, but we don't have historical data to separate them.

**Solution**: Assume all historical cash is currently in the safe (secure storage). Start fresh with registry operations from migration forward.

**Rationale**:
- Conservative approach (all cash secured)
- Clean starting point for new system
- First daily opening will establish initial registry balance

### 2. Transaction History

**Problem**: Existing `SafeTransaction` records don't have `registryBalanceAfter` field.

**Solution**: Backfill `registryBalanceAfter` with `0` for all historical transactions, since registry tracking starts post-migration.

### 3. Active Registry Balance

**Problem**: Need to determine initial registry balance if school is currently operating.

**Solution**: Provide manual "Registry Opening Balance" input during migration for active schools.

### 4. Payment Flow Changes

**Problem**: Existing payments update `safeBalance`; new payments should update `registryBalance`.

**Solution**:
- Migration runs during off-hours
- Code deployment coordinated with migration
- All post-migration payments use new logic

## Migration Strategy

### Pre-Migration Phase

#### 1. Database Backup

```bash
# Full database backup before any changes
pg_dump -U postgres -d gspn_school -F c -b -v -f "backup_pre_registry_migration_$(date +%Y%m%d_%H%M%S).backup"
```

#### 2. Data Validation

Run validation scripts to ensure data integrity:

```sql
-- Verify SafeBalance record exists and is unique
SELECT COUNT(*) FROM "SafeBalance"; -- Should be 1

-- Check for any negative balances
SELECT * FROM "SafeBalance"
WHERE "safeBalance" < 0
   OR "bankBalance" < 0
   OR "mobileMoneyBalance" < 0;

-- Count total transactions
SELECT COUNT(*) FROM "SafeTransaction";

-- Verify latest balance matches calculated balance
SELECT
  sb."safeBalance" as recorded_balance,
  (
    SELECT st."safeBalanceAfter"
    FROM "SafeTransaction" st
    ORDER BY st."createdAt" DESC
    LIMIT 1
  ) as last_transaction_balance
FROM "SafeBalance" sb;
```

#### 3. Business Process Freeze

- Announce maintenance window (e.g., 11 PM - 1 AM)
- Disable payment recording in UI
- Disable expense payment in UI
- Complete all pending transactions

### Migration Phase

#### Step 1: Schema Migration

Execute Prisma migration to add new fields:

```bash
# app/db/
npx prisma migrate dev --name add_registry_to_treasury
```

**Migration SQL** (generated by Prisma):

```sql
-- Rename SafeBalance to TreasuryBalance
ALTER TABLE "SafeBalance" RENAME TO "TreasuryBalance";

-- Add new columns to TreasuryBalance
ALTER TABLE "TreasuryBalance"
  ADD COLUMN "registryBalance" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "registryFloatAmount" INTEGER NOT NULL DEFAULT 2000000;

-- Add new column to SafeTransaction
ALTER TABLE "SafeTransaction"
  ADD COLUMN "registryBalanceAfter" INTEGER NOT NULL DEFAULT 0;

-- Add new transaction types
ALTER TYPE "SafeTransactionType"
  ADD VALUE 'registry_to_safe',
  ADD VALUE 'safe_to_registry',
  ADD VALUE 'registry_adjustment';
```

#### Step 2: Data Migration Script

Create and execute data migration script:

**File**: `app/db/scripts/migrate-to-registry-system.ts`

```typescript
import prisma from "../lib/client"

async function migrateToRegistrySystem() {
  console.log("Starting Registry System Migration...")

  try {
    // Step 1: Get current treasury balance
    const treasury = await prisma.treasuryBalance.findFirst()
    if (!treasury) {
      throw new Error("No TreasuryBalance record found")
    }

    console.log("Current Treasury State:")
    console.log(`  Safe Balance: ${treasury.safeBalance}`)
    console.log(`  Bank Balance: ${treasury.bankBalance}`)
    console.log(`  Mobile Money Balance: ${treasury.mobileMoneyBalance}`)

    // Step 2: Prompt for initial registry balance (if school is operating)
    const readline = require("readline")
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    })

    const getRegistryBalance = (): Promise<number> => {
      return new Promise((resolve) => {
        rl.question(
          "\nEnter current Registry balance (0 if starting fresh): ",
          (answer: string) => {
            const amount = parseInt(answer, 10)
            if (isNaN(amount) || amount < 0) {
              console.log("Invalid amount, using 0")
              resolve(0)
            } else {
              resolve(amount)
            }
            rl.close()
          }
        )
      })
    }

    const initialRegistryBalance = await getRegistryBalance()

    // Step 3: Update treasury with initial registry balance
    if (initialRegistryBalance > 0) {
      // If registry has cash, it came from safe
      const updatedTreasury = await prisma.treasuryBalance.update({
        where: { id: treasury.id },
        data: {
          registryBalance: initialRegistryBalance,
          safeBalance: treasury.safeBalance - initialRegistryBalance,
        },
      })

      // Create opening transaction
      await prisma.safeTransaction.create({
        data: {
          type: "safe_to_registry",
          direction: "out",
          amount: initialRegistryBalance,
          registryBalanceAfter: initialRegistryBalance,
          safeBalanceAfter: updatedTreasury.safeBalance,
          bankBalanceAfter: updatedTreasury.bankBalance,
          mobileBalanceAfter: updatedTreasury.mobileMoneyBalance,
          notes: "Initial registry balance - migration to registry system",
          createdBy: "SYSTEM_MIGRATION",
        },
      })

      console.log(`\n✓ Set initial registry balance: ${initialRegistryBalance}`)
      console.log(`✓ Adjusted safe balance: ${updatedTreasury.safeBalance}`)
    } else {
      console.log("\n✓ No initial registry balance set (starting fresh)")
    }

    // Step 4: Backfill registryBalanceAfter in historical transactions
    const historicalCount = await prisma.safeTransaction.count({
      where: { registryBalanceAfter: 0 },
    })

    console.log(`\n✓ Backfilling ${historicalCount} historical transactions...`)

    // For historical transactions, registryBalanceAfter = 0 (registry didn't exist)
    // This is already the default, so no update needed
    // But we can verify:
    const verifyCount = await prisma.safeTransaction.count({
      where: { registryBalanceAfter: 0 },
    })
    console.log(`✓ Verified ${verifyCount} transactions with registryBalanceAfter = 0`)

    console.log("\n✅ Migration completed successfully!")
    console.log("\nNext steps:")
    console.log("1. Deploy new application code")
    console.log("2. Test daily opening workflow")
    console.log("3. Test payment recording")
    console.log("4. Monitor registry balance tracking")
  } catch (error) {
    console.error("\n❌ Migration failed:", error)
    throw error
  }
}

// Execute migration
migrateToRegistrySystem()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
```

**Execute**:
```bash
cd app/db
npx ts-node scripts/migrate-to-registry-system.ts
```

#### Step 3: Verification

Run verification queries:

```sql
-- Verify TreasuryBalance structure
SELECT * FROM "TreasuryBalance";

-- Check that registryBalanceAfter is set for all transactions
SELECT COUNT(*) FROM "SafeTransaction" WHERE "registryBalanceAfter" IS NULL;
-- Should be 0

-- Verify new transaction types exist
SELECT enumlabel FROM pg_enum
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'SafeTransactionType');

-- Check migration transaction was created
SELECT * FROM "SafeTransaction"
WHERE type = 'safe_to_registry'
ORDER BY "createdAt" DESC
LIMIT 1;
```

### Post-Migration Phase

#### 1. Code Deployment

Deploy new application code with registry logic:

```bash
# Build and deploy UI
cd app/ui
npm run build
# Deploy to production

# Restart application
pm2 restart gspn-school-ui
```

#### 2. Smoke Testing

Execute critical path tests:

**Test 1: Daily Opening**
```bash
curl -X POST http://localhost:8000/api/treasury/daily-opening \
  -H "Content-Type: application/json" \
  -d '{
    "countedSafeBalance": 15000000,
    "floatAmount": 2000000,
    "notes": "Test opening"
  }'
```

**Test 2: Record Payment**
```bash
curl -X POST http://localhost:8000/api/payments \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "...",
    "type": "tuition",
    "method": "cash",
    "amount": 500000,
    "receiptNumber": "TEST-001"
  }'
```

**Test 3: Record Expense**
```bash
curl -X POST http://localhost:8000/api/expenses/.../pay \
  -H "Content-Type: application/json" \
  -d '{
    "method": "cash"
  }'
```

**Test 4: Daily Closing**
```bash
curl -X POST http://localhost:8000/api/treasury/daily-closing \
  -H "Content-Type: application/json" \
  -d '{
    "countedRegistryBalance": 2450000,
    "notes": "Test closing"
  }'
```

#### 3. Monitoring

Monitor for 48 hours:

```sql
-- Check registry balance changes
SELECT
  DATE(st."createdAt") as date,
  st.type,
  COUNT(*) as transaction_count,
  SUM(st.amount) as total_amount,
  MAX(st."registryBalanceAfter") as ending_balance
FROM "SafeTransaction" st
WHERE st."createdAt" > NOW() - INTERVAL '2 days'
  AND st."registryBalanceAfter" > 0
GROUP BY DATE(st."createdAt"), st.type
ORDER BY date DESC, st.type;

-- Verify no negative balances
SELECT * FROM "TreasuryBalance"
WHERE "registryBalance" < 0
   OR "safeBalance" < 0;

-- Check for balance mismatches
SELECT
  tb."registryBalance" as recorded_registry,
  (
    SELECT st."registryBalanceAfter"
    FROM "SafeTransaction" st
    ORDER BY st."createdAt" DESC
    LIMIT 1
  ) as last_transaction_registry
FROM "TreasuryBalance" tb;
```

## Rollback Strategy

If migration fails or critical issues arise:

### Immediate Rollback (Within 24 hours)

```sql
BEGIN;

-- 1. Restore previous schema
ALTER TABLE "TreasuryBalance" RENAME TO "SafeBalance";

-- 2. Remove new columns
ALTER TABLE "SafeBalance"
  DROP COLUMN "registryBalance",
  DROP COLUMN "registryFloatAmount";

ALTER TABLE "SafeTransaction"
  DROP COLUMN "registryBalanceAfter";

-- 3. Delete migration transactions
DELETE FROM "SafeTransaction"
WHERE type IN ('safe_to_registry', 'registry_to_safe', 'registry_adjustment');

-- 4. Restore previous code version
-- (manual step - redeploy previous version)

COMMIT;
```

### Database Restore (If corruption detected)

```bash
# Stop application
pm2 stop gspn-school-ui

# Restore from backup
pg_restore -U postgres -d gspn_school -c backup_pre_registry_migration_*.backup

# Redeploy previous code version
git checkout <previous-commit>
cd app/ui && npm run build && pm2 restart gspn-school-ui
```

## Data Integrity Checks

### Before Migration

```sql
-- Checkpoint: Record current state
CREATE TABLE migration_checkpoint AS
SELECT
  'pre_migration' as checkpoint_name,
  NOW() as checkpoint_time,
  (SELECT "safeBalance" FROM "SafeBalance" LIMIT 1) as safe_balance,
  (SELECT "bankBalance" FROM "SafeBalance" LIMIT 1) as bank_balance,
  (SELECT "mobileMoneyBalance" FROM "SafeBalance" LIMIT 1) as mobile_balance,
  (SELECT COUNT(*) FROM "SafeTransaction") as transaction_count;
```

### After Migration

```sql
-- Verify balance totals match
SELECT
  mc.safe_balance as pre_migration_safe,
  (tb."registryBalance" + tb."safeBalance") as post_migration_cash_total,
  (mc.safe_balance - (tb."registryBalance" + tb."safeBalance")) as discrepancy
FROM migration_checkpoint mc, "TreasuryBalance" tb
WHERE mc.checkpoint_name = 'pre_migration';

-- Should show discrepancy = 0 (or = initial registry balance if counted separately)

-- Verify transaction count
SELECT
  mc.transaction_count as pre_count,
  (SELECT COUNT(*) FROM "SafeTransaction") as post_count,
  ((SELECT COUNT(*) FROM "SafeTransaction") - mc.transaction_count) as new_transactions
FROM migration_checkpoint mc
WHERE mc.checkpoint_name = 'pre_migration';

-- new_transactions should = 1 (the migration transaction) or 0 if no initial registry balance
```

## Edge Cases and Mitigations

### Edge Case 1: Payments During Migration Window

**Mitigation**:
- Disable payment UI during migration
- Add application-level lock preventing API calls
- Display maintenance message

### Edge Case 2: Negative Balances Post-Migration

**Mitigation**:
- Pre-migration validation ensures no negative balances
- New code includes balance checks before transactions
- Real-time monitoring alerts on negative balances

### Edge Case 3: Concurrent Transactions

**Mitigation**:
- Use database transactions (`BEGIN`/`COMMIT`)
- Implement row-level locking on TreasuryBalance
- Retry logic for transaction conflicts

### Edge Case 4: Missing Migration Transaction

**Problem**: System migration transaction not created

**Mitigation**:
```sql
-- Manually create migration transaction if missing
INSERT INTO "SafeTransaction" (
  id, type, direction, amount,
  "registryBalanceAfter", "safeBalanceAfter", "bankBalanceAfter", "mobileBalanceAfter",
  notes, "createdBy", "createdAt"
)
SELECT
  gen_random_uuid(),
  'safe_to_registry',
  'out',
  tb."registryBalance",
  tb."registryBalance",
  tb."safeBalance",
  tb."bankBalance",
  tb."mobileMoneyBalance",
  'Retroactive migration transaction - created ' || NOW()::TEXT,
  'SYSTEM_MIGRATION',
  NOW()
FROM "TreasuryBalance" tb
WHERE tb."registryBalance" > 0;
```

## Testing Strategy

### Unit Tests (Before Deployment)

```typescript
describe("Registry Migration", () => {
  it("should preserve total cash balance", async () => {
    const preMigration = await getTotalCashBalance()
    await runMigration()
    const postMigration = await getTotalCashBalance()
    expect(postMigration).toBe(preMigration)
  })

  it("should create migration transaction", async () => {
    await runMigration()
    const migrationTx = await prisma.safeTransaction.findFirst({
      where: { type: "safe_to_registry", createdBy: "SYSTEM_MIGRATION" },
    })
    expect(migrationTx).toBeTruthy()
  })

  it("should backfill registryBalanceAfter", async () => {
    await runMigration()
    const nullCount = await prisma.safeTransaction.count({
      where: { registryBalanceAfter: null },
    })
    expect(nullCount).toBe(0)
  })
})
```

### Integration Tests (Post-Deployment)

```typescript
describe("Post-Migration Operations", () => {
  it("should record payment to registry", async () => {
    const initialRegistry = await getRegistryBalance()
    await recordPayment({ amount: 500000, method: "cash" })
    const newRegistry = await getRegistryBalance()
    expect(newRegistry).toBe(initialRegistry + 500000)
  })

  it("should pay expense from registry", async () => {
    const initialRegistry = await getRegistryBalance()
    await payExpense({ amount: 100000, method: "cash" })
    const newRegistry = await getRegistryBalance()
    expect(newRegistry).toBe(initialRegistry - 100000)
  })

  it("should execute daily opening", async () => {
    await dailyOpening({ floatAmount: 2000000 })
    const registry = await getRegistryBalance()
    expect(registry).toBe(2000000)
  })
})
```

## Timeline

### T-7 days: Preparation
- Code complete and tested in staging
- Migration scripts tested
- Documentation finalized
- Staff training scheduled

### T-3 days: Pre-Migration
- Announce maintenance window
- Create database backup
- Run validation scripts
- Freeze non-critical transactions

### T-Day: Migration
- 11:00 PM: Begin maintenance
- 11:05 PM: Final backup
- 11:10 PM: Execute schema migration
- 11:15 PM: Execute data migration
- 11:30 PM: Run verification
- 11:45 PM: Deploy new code
- 12:00 AM: Smoke testing
- 12:30 AM: End maintenance (or rollback if issues)

### T+1 day: Monitoring
- Monitor all transactions
- Check for errors in logs
- Verify balance calculations
- Collect user feedback

### T+7 days: Review
- Analyze migration success
- Document lessons learned
- Archive backups
- Remove rollback infrastructure

## Success Criteria

Migration is considered successful when:

1. ✅ All balance totals match pre-migration values
2. ✅ No data loss or corruption detected
3. ✅ Registry balance tracking functional
4. ✅ Payment recording updates registry correctly
5. ✅ Expense payment deducts from registry correctly
6. ✅ Daily opening/closing workflows operational
7. ✅ No negative balances
8. ✅ Transaction history preserved
9. ✅ User workflows functioning as expected
10. ✅ No rollback required within 48 hours

## Communication Plan

### Before Migration

**Email to Staff (T-7 days)**:
```
Subject: Upcoming Treasury System Upgrade - [Date]

Dear Team,

We will be upgrading our treasury management system on [Date] from 11 PM to 1 AM.

What's changing:
- New registry (cash box) tracking separate from safe
- Improved daily opening/closing workflows
- Better payment and expense management

What you need to know:
- Complete all transactions before 10:45 PM
- System will be unavailable 11 PM - 1 AM
- Training session on [Date] at 2 PM

Questions? Contact IT support.
```

### During Migration

**Status Page**:
```
🔧 Maintenance in Progress

Treasury system upgrade in progress.
Expected completion: 1:00 AM
Current status: [Schema migration complete / Data migration in progress / Testing]
```

### After Migration

**Email to Staff (T+1 day)**:
```
Subject: Treasury System Upgrade Complete

The treasury system upgrade completed successfully last night.

New features available:
- Registry management for daily cash operations
- Enhanced payment wizard
- Improved expense tracking

Training materials: [link]
Report issues: support@gspn.school
```

## Documentation Updates

Post-migration, update:

1. **User Manual**: Add registry management workflows
2. **API Documentation**: Document new endpoints
3. **Database Schema Docs**: Update ERD diagrams
4. **Training Materials**: Create registry operation guides
5. **Troubleshooting Guide**: Add common registry issues

## Appendix

### A. Migration Script (Complete)

See `app/db/scripts/migrate-to-registry-system.ts` (included above)

### B. Verification Queries (Complete)

See SQL queries throughout document

### C. Rollback Scripts (Complete)

See "Rollback Strategy" section

### D. Test Data

For staging/testing:

```sql
-- Create test treasury balance
INSERT INTO "TreasuryBalance" (id, "safeBalance", "bankBalance", "mobileMoneyBalance")
VALUES ('test-treasury-1', 10000000, 5000000, 1000000);

-- Create test transactions
INSERT INTO "SafeTransaction" (
  id, type, direction, amount,
  "safeBalanceAfter", "bankBalanceAfter", "mobileBalanceAfter",
  "createdBy"
) VALUES
('test-tx-1', 'student_payment', 'in', 500000, 10500000, 5000000, 1000000, 'test-user'),
('test-tx-2', 'expense_payment', 'out', 200000, 10300000, 5000000, 1000000, 'test-user');
```

This creates a realistic test scenario for migration validation.
