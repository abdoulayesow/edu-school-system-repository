# Treasury Reconciliation & Migration Guide

**Date:** 2026-01-10
**Purpose:** Reconcile existing payments with treasury system and establish correct accounting flow

---

## 🎯 Overview

This guide explains:
1. How the treasury system **currently** works
2. The **issues** with the current flow
3. The **recommended** simplified flow
4. How to **migrate** existing data

---

## 📊 Current Treasury System Architecture

### Three Balance Types

The system tracks three separate balances in the `SafeBalance` table:

1. **`safeBalance`** - Physical cash in the safe
2. **`bankBalance`** - Money deposited in the bank
3. **`mobileMoneyBalance`** - Orange Money balance

All monetary transactions are recorded in `SafeTransaction` for audit trail.

---

## ❌ Current Payment Flow Issues

### **Problem 1: Overly Complex Cash Payment Flow**

**Current:**
```
Record Cash Payment → pending_deposit
  ↓ (adds to safe)
Deposit to Bank → deposited
  ↓ (moves from safe to bank, linked to specific payment)
Review → confirmed
  ↓ (no balance change)
```

**Why it's problematic:**
- In reality, **you don't deposit specific payments to the bank**
- You take **bulk cash from the safe** and deposit it
- The linkage between individual payments and bank deposits is artificial

### **Problem 2: Status Confusion**

- `pending_deposit` suggests cash isn't in safe yet (but it is!)
- `deposited` suggests a specific payment was deposited (but deposits are bulk)
- Two-step approval process adds unnecessary complexity

---

## ✅ Recommended Simplified Flow

### **Revised Payment Statuses**

**Remove:**
- ❌ `pending_deposit` (confusing, unnecessary)
- ❌ `deposited` (payments aren't deposited individually)

**Keep:**
- ✅ `pending_review` - Payment recorded, awaiting approval
- ✅ `confirmed` - Payment approved
- ✅ `rejected` - Payment rejected
- ✅ `failed` - Technical failure

### **New Cash Payment Flow**

```
1. RECORD PAYMENT
   Status: pending_review
   Treasury Impact: ✅ Add to safeBalance
   Creates: SafeTransaction (student_payment, direction: in)

2. REVIEW & APPROVE
   Status: pending_review → confirmed
   Treasury Impact: ❌ None (already in safe)
```

### **Orange Money Payment Flow**

```
1. RECORD PAYMENT
   Status: pending_review
   Treasury Impact: ✅ Add to mobileMoneyBalance
   Creates: SafeTransaction (mobile_money_income, direction: in)

2. REVIEW & APPROVE
   Status: pending_review → confirmed
   Treasury Impact: ❌ None (already in mobile money)
```

### **Bank Transfers (Decoupled from Payments)**

Bank transfers are **bulk operations**, not tied to individual payments:

```
DEPOSIT TO BANK (Manual operation)
  Purpose: Move excess cash from safe to bank
  Process:
    1. Take X amount from safe
    2. Physically deposit to bank
    3. Record in system:
       - Deduct from safeBalance
       - Add to bankBalance
       - Create BankTransfer record
       - Create SafeTransaction (bank_deposit, out)

WITHDRAW FROM BANK (Manual operation)
  Purpose: Get cash for expenses or safe replenishment
  Process:
    1. Withdraw X amount from bank
    2. Add to safe
    3. Record in system:
       - Deduct from bankBalance
       - Add to safeBalance
       - Create BankTransfer record
       - Create SafeTransaction (bank_withdrawal, in)
```

### **Expense Flow**

```
1. CREATE EXPENSE
   Status: pending
   Treasury Impact: ❌ None (just a request)

2. APPROVE
   Status: pending → approved
   Treasury Impact: ❌ None (approval only)

3. PAY EXPENSE
   Status: approved → paid
   Treasury Impact:
     - Cash: ✅ Deduct from safeBalance
     - Orange Money: ✅ Deduct from mobileMoneyBalance (rare)
   Creates: SafeTransaction (expense_payment, out)
```

**Important:** Expenses are primarily paid in **cash from the safe**. If safe balance is low:
1. Withdraw cash from bank to safe first
2. Then pay the expense from safe

---

## 🔧 Migration Strategy for Existing Data

### Current Database State

Your database has:
- ✅ Payment records (possibly with various statuses)
- ❓ SafeBalance record (might not exist or be incorrect)
- ❓ SafeTransaction records (might be missing for old payments)
- ❓ BankTransfer records (might exist from recent activity)

### Migration Goals

1. ✅ Create `SafeTransaction` for every confirmed payment
2. ✅ Create `SafeTransaction` for every paid expense
3. ✅ Account for all existing `BankTransfer` records
4. ✅ Calculate correct current balances chronologically
5. ✅ Update `SafeBalance` with accurate amounts

### Migration Script

We've created: `app/db/scripts/migrate-payments-to-treasury.ts`

**What it does:**
1. Analyzes current database state
2. Creates missing `SafeTransaction` records for:
   - All confirmed payments (tagged with `[MIGRATED]`)
   - All paid expenses (tagged with `[MIGRATED]`)
3. Processes all transactions chronologically
4. Recalculates running balances
5. Updates `SafeBalance` with final amounts

**How to run:**

```bash
cd app/db
npx tsx scripts/migrate-payments-to-treasury.ts
```

**Expected output:**
```
📊 ANALYZING DATABASE STATE...

✅ Confirmed Payments:
   - Cash: 45 payments, 125,000,000 GNF
   - Orange Money: 12 payments, 32,500,000 GNF

💰 Paid Expenses:
   - Cash: 8 expenses, 15,200,000 GNF

📝 Existing SafeTransactions: 23

🏦 Current SafeBalance:
   - Safe: 85,000,000 GNF
   - Bank: 50,000,000 GNF
   - Orange Money: 32,500,000 GNF

🏦 Bank Transfers:
   - Deposits: 3 transfers, 60,000,000 GNF
   - Withdrawals: 1 transfer, 10,000,000 GNF

🔧 CREATING MISSING SAFE TRANSACTIONS...

   ✨ Creating transaction for REC-001 (cash, 2,500,000 GNF)
   ⏭️  Skipping REC-002 (transaction exists)
   ...

✅ Created 34 SafeTransaction records

🧮 RECALCULATING BALANCES...

Processing 57 transactions...

📊 Calculated Final Balances:
   - Safe: 87,300,000 GNF
   - Bank: 52,000,000 GNF
   - Orange Money: 32,500,000 GNF
   - Total: 171,800,000 GNF

✅ SafeBalance updated

✅ MIGRATION COMPLETED SUCCESSFULLY
```

### Post-Migration Verification

After running the migration:

1. **Check the accounting page** (`/accounting`)
   - Verify Safe, Bank, and Orange Money balances
   - Compare with your physical counts

2. **Verify against physical reality:**
   ```
   Expected Safe Balance = All cash payments - bank deposits + bank withdrawals - cash expenses
   Expected Bank Balance = All bank deposits - bank withdrawals
   Expected Orange Money = All OM payments - OM expenses (if any)
   ```

3. **Make adjustments if needed:**
   - Use PUT `/api/treasury/balance` endpoint
   - Provide a clear reason for the adjustment
   - This creates an adjustment transaction in the audit trail

---

## 🎯 Going Forward: Best Practices

### Daily Operations

**Recording a Payment:**
```typescript
POST /api/payments
{
  enrollmentId: "...",
  amount: 2500000,
  method: "cash", // or "orange_money"
  receiptNumber: "REC-20260110-001"
}

// Result:
// - Status: pending_review
// - SafeBalance updated immediately
// - SafeTransaction created
```

**Approving a Payment:**
```typescript
POST /api/payments/{id}/review
{
  action: "approve"
}

// Result:
// - Status: confirmed
// - No balance change (already recorded)
// - PaymentSchedule marked as paid
```

**Bank Deposit (Bulk):**
```typescript
// Use the Bank Transfer dialog on accounting page
// Or POST /api/treasury/bank-transfers
{
  type: "deposit",
  amount: 10000000,
  bankReference: "DEPOSIT-2026-01-10"
}

// Result:
// - SafeBalance: -10,000,000 GNF
// - BankBalance: +10,000,000 GNF
// - BankTransfer record created
// - SafeTransaction created
```

**Paying an Expense:**
```typescript
POST /api/expenses/{id}/pay

// Result:
// - Status: paid
// - SafeBalance: -amount (for cash)
// - SafeTransaction created
```

### Weekly/Monthly Reconciliation

1. **Verify Safe Balance:**
   - Count physical cash in safe
   - Compare with `safeBalance` in system
   - Use Daily Verification feature

2. **Verify Bank Balance:**
   - Check bank statement
   - Compare with `bankBalance` in system
   - Reconcile any differences

3. **Review Orange Money:**
   - Check Orange Money account
   - Compare with `mobileMoneyBalance`
   - Record any fees paid

---

## 📋 Database Schema Summary

### Key Tables

**`SafeBalance`** (Singleton)
```typescript
{
  safeBalance: number           // Cash in safe
  bankBalance: number           // Cash in bank
  mobileMoneyBalance: number    // Orange Money
  safeThresholdMin: number      // Alert when below (5M GNF)
  safeThresholdMax: number      // Alert when above (20M GNF)
  lastVerifiedAt: Date?
  lastVerifiedBy: string?
}
```

**`SafeTransaction`** (Audit Trail)
```typescript
{
  type: SafeTransactionType     // student_payment, expense_payment, bank_deposit, etc.
  direction: "in" | "out"       // Money in or out
  amount: number
  safeBalanceAfter: number      // Snapshot after this transaction
  bankBalanceAfter: number      // Snapshot after this transaction
  description: string
  referenceType: string?        // "payment", "expense", etc.
  referenceId: string?          // ID of payment/expense
  studentId: string?
  recordedBy: string
  recordedAt: Date
}
```

**`BankTransfer`**
```typescript
{
  type: "deposit" | "withdrawal"
  amount: number
  safeBalanceBefore: number
  safeBalanceAfter: number
  bankBalanceBefore: number
  bankBalanceAfter: number
  bankReference: string?
  carriedBy: string?            // Who physically carried the money
  recordedBy: string
  notes: string?
}
```

**`Payment`**
```typescript
{
  method: "cash" | "orange_money"
  status: "pending_review" | "confirmed" | "rejected" | "failed"
  amount: number
  receiptNumber: string
  transactionRef: string?       // For Orange Money
  recordedBy: string
  confirmedBy: string?
  confirmedAt: Date?
}
```

**`Expense`**
```typescript
{
  category: ExpenseCategory
  description: string
  amount: number
  method: "cash" | "orange_money"
  status: "pending" | "approved" | "rejected" | "paid"
  requestedBy: string
  approvedBy: string?
  paidAt: Date?
}
```

---

## 🔍 Troubleshooting

### "Safe balance is negative"
**Cause:** More expenses than income, or incorrect migration
**Fix:**
1. Review SafeTransaction history
2. Check if bank withdrawals were recorded
3. Use adjustment endpoint if needed

### "Balance doesn't match physical count"
**Cause:** Missing transactions or manual adjustments
**Fix:**
1. Count physical cash
2. Review recent transactions
3. Use PUT `/api/treasury/balance` with adjustment reason

### "Old payments not showing in treasury"
**Cause:** Payments created before treasury integration
**Fix:** Run migration script

### "Can't pay expense - insufficient funds"
**Cause:** Safe balance too low
**Fix:**
1. Record bank withdrawal first
2. Then pay expense from safe

---

## 📞 Support

For questions or issues:
1. Check the audit trail: `/api/treasury/transactions`
2. Review SafeBalance: `/api/treasury/balance`
3. Check migration script logs
4. Contact system administrator

---

## 📚 Related Documentation

- [Accounting Redesign Proposal](./ACCOUNTING_REDESIGN_PROPOSAL.md)
- [Treasury Integration Requirements](./PHASE_2_TREASURY_INTEGRATION_REQUIREMENTS.md)
- [Treasury Deployment Checklist](./TREASURY_DEPLOYMENT_CHECKLIST.md)
- [Session Summaries](./summaries/)
