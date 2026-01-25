# Treasury System Workflows - Visual Guide

Quick reference guide showing all treasury workflows with database impacts.

---

## 💰 Payment Recording Flow

### Cash Payment

```
┌─────────────────────────────────────────────────────────────┐
│ 1. RECORD PAYMENT                                           │
│    POST /api/payments                                       │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ Database Operations (Transaction)                           │
│                                                              │
│ 1. Create Payment record                                    │
│    - status: "pending_review"                               │
│    - method: "cash"                                         │
│    - amount: 2,500,000 GNF                                  │
│                                                              │
│ 2. Get current SafeBalance                                  │
│    - safeBalance: 10,000,000 GNF                           │
│                                                              │
│ 3. Create SafeTransaction                                   │
│    - type: "student_payment"                                │
│    - direction: "in"                                        │
│    - amount: 2,500,000 GNF                                  │
│    - safeBalanceAfter: 12,500,000 GNF                      │
│    - referenceType: "payment"                               │
│    - referenceId: payment.id                                │
│                                                              │
│ 4. Update SafeBalance                                       │
│    - safeBalance: 12,500,000 GNF (was 10,000,000)          │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ Result: Money IMMEDIATELY in safe                           │
│         Payment awaiting review                             │
└─────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────┐
│ 2. REVIEW PAYMENT (Later that day or next day)             │
│    POST /api/payments/[id]/review                          │
│    { action: "approve" }                                    │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ Database Operations                                          │
│                                                              │
│ 1. Update Payment record                                    │
│    - status: "confirmed"                                    │
│    - confirmedBy: user.id                                   │
│    - confirmedAt: now()                                     │
│                                                              │
│ NO BALANCE CHANGES - money already in safe!                │
└─────────────────────────────────────────────────────────────┘
```

**Key Point:** Safe balance updated when payment is **recorded**, not when **approved**.

---

### Orange Money Payment

```
┌─────────────────────────────────────────────────────────────┐
│ 1. RECORD PAYMENT                                           │
│    POST /api/payments                                       │
│    { method: "orange_money", transactionRef: "OM123456" }  │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ Database Operations (Transaction)                           │
│                                                              │
│ 1. Create Payment record                                    │
│    - status: "pending_review"                               │
│    - method: "orange_money"                                 │
│    - amount: 1,800,000 GNF                                  │
│    - transactionRef: "OM123456"                             │
│                                                              │
│ 2. Get current SafeBalance                                  │
│    - mobileMoneyBalance: 5,000,000 GNF                     │
│                                                              │
│ 3. Create SafeTransaction                                   │
│    - type: "mobile_money_income"                            │
│    - direction: "in"                                        │
│    - amount: 1,800,000 GNF                                  │
│    - mobileMoneyBalanceAfter: 6,800,000 GNF                │
│    - referenceType: "payment"                               │
│                                                              │
│ 4. Update SafeBalance                                       │
│    - mobileMoneyBalance: 6,800,000 GNF (was 5,000,000)     │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ Result: Money IMMEDIATELY in Orange Money account          │
│         Payment awaiting review                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🏦 Bank Transfer Flow (Bulk Operations)

### Deposit to Bank

```
┌─────────────────────────────────────────────────────────────┐
│ DEPOSIT 10,000,000 GNF TO BANK                              │
│ POST /api/treasury/bank-transfers                          │
│ {                                                            │
│   type: "deposit",                                          │
│   amount: 10000000,                                         │
│   bankReference: "DEP-20260111-001",                       │
│   carriedBy: "Jean Traoré"                                 │
│ }                                                            │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ Database Operations (Transaction)                           │
│                                                              │
│ Current State:                                              │
│   - safeBalance: 25,000,000 GNF                            │
│   - bankBalance: 40,000,000 GNF                            │
│                                                              │
│ 1. Validate: safeBalance >= amount? ✅ YES                 │
│                                                              │
│ 2. Create BankTransfer record                               │
│    - type: "deposit"                                        │
│    - amount: 10,000,000 GNF                                 │
│    - safeBalanceBefore: 25,000,000 GNF                     │
│    - safeBalanceAfter: 15,000,000 GNF                      │
│    - bankBalanceBefore: 40,000,000 GNF                     │
│    - bankBalanceAfter: 50,000,000 GNF                      │
│    - carriedBy: "Jean Traoré"                              │
│                                                              │
│ 3. Create SafeTransaction (audit trail)                    │
│    - type: "bank_deposit"                                   │
│    - direction: "out" (from safe perspective)              │
│    - amount: 10,000,000 GNF                                 │
│    - safeBalanceAfter: 15,000,000 GNF                      │
│    - bankBalanceAfter: 50,000,000 GNF                      │
│    - referenceType: "transfer"                              │
│    - referenceId: bankTransfer.id                           │
│                                                              │
│ 4. Update SafeBalance                                       │
│    - safeBalance: 15,000,000 GNF (was 25,000,000)          │
│    - bankBalance: 50,000,000 GNF (was 40,000,000)          │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ Result:                                                      │
│   Safe: -10,000,000 GNF                                     │
│   Bank: +10,000,000 GNF                                     │
│   Total liquid assets: unchanged                            │
└─────────────────────────────────────────────────────────────┘
```

### Withdrawal from Bank

```
┌─────────────────────────────────────────────────────────────┐
│ WITHDRAW 5,000,000 GNF FROM BANK                            │
│ POST /api/treasury/bank-transfers                          │
│ { type: "withdrawal", amount: 5000000 }                    │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ Database Operations (Transaction)                           │
│                                                              │
│ Current State:                                              │
│   - safeBalance: 2,000,000 GNF (low!)                      │
│   - bankBalance: 50,000,000 GNF                            │
│                                                              │
│ 1. Validate: bankBalance >= amount? ✅ YES                 │
│                                                              │
│ 2. Create BankTransfer record                               │
│    - type: "withdrawal"                                     │
│    - amount: 5,000,000 GNF                                  │
│    - safeBalanceBefore: 2,000,000 GNF                      │
│    - safeBalanceAfter: 7,000,000 GNF                       │
│    - bankBalanceBefore: 50,000,000 GNF                     │
│    - bankBalanceAfter: 45,000,000 GNF                      │
│                                                              │
│ 3. Create SafeTransaction                                   │
│    - type: "bank_withdrawal"                                │
│    - direction: "in" (into safe)                           │
│    - amount: 5,000,000 GNF                                  │
│    - safeBalanceAfter: 7,000,000 GNF                       │
│    - bankBalanceAfter: 45,000,000 GNF                      │
│                                                              │
│ 4. Update SafeBalance                                       │
│    - safeBalance: 7,000,000 GNF (was 2,000,000)            │
│    - bankBalance: 45,000,000 GNF (was 50,000,000)          │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ Result:                                                      │
│   Safe: +5,000,000 GNF (replenished)                       │
│   Bank: -5,000,000 GNF                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 💸 Expense Payment Flow

### Creating and Approving Expense

```
┌─────────────────────────────────────────────────────────────┐
│ 1. CREATE EXPENSE REQUEST                                   │
│    POST /api/expenses                                       │
│    {                                                         │
│      category: "supplies",                                  │
│      description: "Classroom chairs",                       │
│      amount: 4500000,                                       │
│      method: "cash",                                        │
│      vendorName: "Mobilier SA"                             │
│    }                                                         │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ Creates Expense with status: "pending"                      │
│ NO TREASURY IMPACT                                          │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. DIRECTOR APPROVES                                        │
│    POST /api/expenses/[id]/approve                         │
│    { action: "approve" }                                    │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ Updates status to: "approved"                               │
│ NO TREASURY IMPACT                                          │
└─────────────────────────────────────────────────────────────┘
```

### Paying the Expense

```
┌─────────────────────────────────────────────────────────────┐
│ 3. PAY EXPENSE                                              │
│    POST /api/expenses/[id]/pay                             │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ Database Operations (Transaction)                           │
│                                                              │
│ Current State:                                              │
│   - safeBalance: 12,000,000 GNF                            │
│   - expense.amount: 4,500,000 GNF                          │
│   - expense.method: "cash"                                  │
│                                                              │
│ 1. Validate: expense.status === "approved"? ✅             │
│ 2. Validate: safeBalance >= amount? ✅ YES                 │
│                                                              │
│ 3. Update Expense                                           │
│    - status: "paid"                                         │
│    - paidAt: now()                                          │
│                                                              │
│ 4. Create SafeTransaction                                   │
│    - type: "expense_payment"                                │
│    - direction: "out"                                       │
│    - amount: 4,500,000 GNF                                  │
│    - safeBalanceAfter: 7,500,000 GNF                       │
│    - beneficiaryName: "Mobilier SA"                        │
│    - category: "supplies"                                   │
│    - referenceType: "expense"                               │
│    - referenceId: expense.id                                │
│                                                              │
│ 5. Update SafeBalance                                       │
│    - safeBalance: 7,500,000 GNF (was 12,000,000)           │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ Result: Money DEDUCTED from safe                            │
└─────────────────────────────────────────────────────────────┘
```

### Insufficient Funds Scenario

```
┌─────────────────────────────────────────────────────────────┐
│ TRY TO PAY EXPENSE                                          │
│ POST /api/expenses/[id]/pay                                │
│                                                              │
│ Current State:                                              │
│   - safeBalance: 3,000,000 GNF (too low!)                 │
│   - expense.amount: 8,000,000 GNF                          │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ ❌ ERROR 400                                                │
│ "Fonds insuffisants dans la caisse"                        │
│ Available: 3,000,000 GNF                                    │
│ Required: 8,000,000 GNF                                     │
│                                                              │
│ Suggestion: Withdraw 5,000,000 GNF from bank first         │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ SOLUTION: Withdraw from bank first                          │
│                                                              │
│ Step 1: POST /api/treasury/bank-transfers                  │
│         { type: "withdrawal", amount: 5000000 }            │
│         → safeBalance now: 8,000,000 GNF                   │
│                                                              │
│ Step 2: POST /api/expenses/[id]/pay                       │
│         → Success! safeBalance now: 0 GNF                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Transaction Reversal Flow

### Correcting an Incorrect Payment Amount

```
┌─────────────────────────────────────────────────────────────┐
│ ORIGINAL TRANSACTION (January 1)                            │
│                                                              │
│ SafeTransaction #001                                        │
│   - type: "student_payment"                                 │
│   - direction: "in"                                         │
│   - amount: 2,500,000 GNF (WRONG - should be 2,000,000)   │
│   - safeBalanceAfter: 15,500,000 GNF                       │
│   - referenceId: "payment-123"                              │
└─────────────────────────────────────────────────────────────┘
                           ↓
           (7 days pass, bank transfer happens, etc...)
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ ERROR DISCOVERED (January 8)                                │
│ POST /api/treasury/transactions/txn-001/reverse            │
│ {                                                            │
│   reason: "Incorrect amount - should be 2,000,000 GNF",    │
│   correctAmount: 2000000                                    │
│ }                                                            │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ Database Operations (Transaction)                           │
│                                                              │
│ Current State (January 8):                                  │
│   - safeBalance: 18,200,000 GNF (after other transactions) │
│                                                              │
│ 1. Create REVERSAL transaction                              │
│                                                              │
│    SafeTransaction #084                                     │
│      - type: "student_payment"                              │
│      - direction: "out" (OPPOSITE of original)             │
│      - amount: 2,500,000 GNF (original amount)             │
│      - safeBalanceAfter: 15,700,000 GNF                    │
│      - description: "REVERSAL: txn-001 - Incorrect amount" │
│      - isReversal: true                                     │
│      - reversalReason: "Incorrect amount..."               │
│      - originalTransactionId: "txn-001"                     │
│      - recordedAt: "2026-01-08" (TODAY)                    │
│                                                              │
│ 2. Create CORRECTION transaction                            │
│                                                              │
│    SafeTransaction #085                                     │
│      - type: "student_payment"                              │
│      - direction: "in"                                      │
│      - amount: 2,000,000 GNF (CORRECT amount)              │
│      - safeBalanceAfter: 17,700,000 GNF                    │
│      - description: "Corrected payment (reversal of txn-001)" │
│      - referenceId: "payment-123"                           │
│      - recordedAt: "2026-01-08" (TODAY)                    │
│                                                              │
│ 3. Update SafeBalance                                       │
│      - safeBalance: 17,700,000 GNF (was 18,200,000)        │
│                                                              │
│ Net Effect: -500,000 GNF (the error amount)                │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ AUDIT TRAIL                                                  │
│                                                              │
│ Jan 1: Payment recorded (+2,500,000) [WRONG]               │
│ Jan 3: Bank deposit (-10,000,000)                          │
│ Jan 5: Other payment (+3,000,000)                          │
│ Jan 7: Expense paid (-2,100,000)                           │
│ Jan 8: REVERSAL of Jan 1 payment (-2,500,000)             │
│ Jan 8: CORRECTION payment (+2,000,000)                     │
│                                                              │
│ All transactions preserved                                   │
│ Complete audit trail                                         │
│ Current balance is now correct                              │
└─────────────────────────────────────────────────────────────┘
```

**Key Points:**
- ❌ NEVER modify the original transaction
- ✅ ALWAYS use current date for reversals
- ✅ Create reversal + correction pair
- ✅ Complete audit trail maintained
- ✅ Historical reports stay accurate

---

## 📊 Daily Reconciliation Flow

```
┌─────────────────────────────────────────────────────────────┐
│ EVERY MORNING (or end of day)                               │
│ Accountant opens accounting page                            │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ System shows:                                                │
│   Expected Safe Balance: 12,450,000 GNF                     │
│   (from SafeBalance.safeBalance)                            │
│                                                              │
│ Accountant counts physical cash                             │
│   Counted: 12,300,000 GNF                                   │
│   Discrepancy: -150,000 GNF                                 │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ POST /api/treasury/daily-verification                       │
│ {                                                            │
│   verificationDate: "2026-01-11",                           │
│   expectedBalance: 12450000,                                │
│   countedBalance: 12300000,                                 │
│   explanation: "Discrepancy of 150,000 GNF - investigating"│
│ }                                                            │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ Creates DailyVerification record                            │
│   - status: "discrepancy"                                   │
│   - discrepancy: -150,000 GNF                              │
│                                                              │
│ Sends alert to Director for review                          │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ Director investigates and confirms shortage is real         │
│                                                              │
│ PUT /api/treasury/balance                                   │
│ {                                                            │
│   safeBalance: 12300000,                                    │
│   reason: "Verified cash shortage - 150,000 GNF missing.   │
│            Investigation report #2026-001 attached."        │
│ }                                                            │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ Creates adjustment SafeTransaction                           │
│   - type: "adjustment"                                      │
│   - direction: "out"                                        │
│   - amount: 150,000 GNF                                     │
│   - description: "Verified cash shortage - Investigation..." │
│                                                              │
│ Updates SafeBalance                                         │
│   - safeBalance: 12,300,000 GNF                            │
│                                                              │
│ Updates DailyVerification                                   │
│   - status: "reviewed"                                      │
│   - reviewedBy: director.id                                 │
│   - reviewNotes: "Adjustment made per investigation report" │
└─────────────────────────────────────────────────────────────┘
```

---

## 📈 Balance Calculation Logic

### How Current Balances Are Calculated

```
SafeBalance (current state):
  safeBalance: 17,500,000 GNF
  bankBalance: 45,000,000 GNF
  mobileMoneyBalance: 8,200,000 GNF

↓ Should equal ↓

Sum of all SafeTransactions:

  CASH (safe):
    + All "student_payment" (direction: in)
    + All "bank_withdrawal" (direction: in)
    + All "adjustment" (direction: in)
    - All "expense_payment" (direction: out)
    - All "bank_deposit" (direction: out)
    - All "adjustment" (direction: out)

  BANK:
    + All "bank_deposit" amounts
    - All "bank_withdrawal" amounts

  ORANGE MONEY:
    + All "mobile_money_income" (direction: in)
    - All "mobile_money_payment" (direction: out)
    - All "mobile_money_fee" (direction: out)
```

### Reconciliation Query

```sql
-- Verify safe balance
SELECT
  SUM(CASE
    WHEN type IN ('student_payment', 'other_income') AND direction = 'in'
    THEN amount
    ELSE 0
  END) as cash_in,

  SUM(CASE
    WHEN type = 'expense_payment' AND direction = 'out'
    THEN amount
    ELSE 0
  END) as cash_out_expenses,

  SUM(CASE
    WHEN type = 'bank_deposit'
    THEN amount
    ELSE 0
  END) as cash_to_bank,

  SUM(CASE
    WHEN type = 'bank_withdrawal'
    THEN amount
    ELSE 0
  END) as cash_from_bank,

  (
    SUM(CASE WHEN type IN ('student_payment', 'other_income') THEN amount ELSE 0 END)
    - SUM(CASE WHEN type = 'expense_payment' THEN amount ELSE 0 END)
    - SUM(CASE WHEN type = 'bank_deposit' THEN amount ELSE 0 END)
    + SUM(CASE WHEN type = 'bank_withdrawal' THEN amount ELSE 0 END)
  ) as calculated_safe_balance

FROM "SafeTransaction"
WHERE "isReversal" = false;

-- Should match SafeBalance.safeBalance
```

---

## 🎯 Key Principles

1. **Immediate Treasury Impact**
   - Payments update balances when RECORDED, not when APPROVED
   - Expenses update balances when PAID, not when APPROVED

2. **Approval is Verification Only**
   - Payment review: Confirms receipt is valid, amount matches
   - Expense approval: Authorizes future payment
   - Neither changes treasury balances

3. **Never Modify, Always Reverse**
   - No updates to historical transactions
   - Create reversal + correction pair
   - Use current date, don't backdate

4. **Single Source of Truth**
   - SafeBalance holds current state
   - SafeTransaction provides audit trail
   - Can always recalculate by replaying transactions

5. **Bulk Bank Operations**
   - Don't link individual payments to bank deposits
   - Deposit "10M GNF" not "Payment #123"
   - Withdraw as needed for expense payments

---

## 📋 Transaction Type Reference

| Type | Direction | Affects | Created When |
|------|-----------|---------|--------------|
| `student_payment` | in | Safe | Cash payment recorded |
| `mobile_money_income` | in | Mobile Money | Orange Money payment recorded |
| `expense_payment` | out | Safe | Cash expense paid |
| `mobile_money_payment` | out | Mobile Money | Orange Money expense paid |
| `bank_deposit` | out | Safe, Bank | Money deposited to bank |
| `bank_withdrawal` | in | Safe, Bank | Money withdrawn from bank |
| `adjustment` | in/out | Safe | Manual balance correction |
| `other_income` | in | Safe | Non-payment income |
| `mobile_money_fee` | out | Mobile Money | Orange Money fees |

---

## 🚦 Status Reference

### Payment Status

| Status | Meaning | Can Edit? | Treasury Impact |
|--------|---------|-----------|-----------------|
| `pending_review` | Recorded, awaiting approval | Yes | ✅ Already impacted |
| `confirmed` | Approved | No | ❌ None (already done) |
| `rejected` | Denied | No | ⚠️ Needs reversal |
| `failed` | Technical error | No | ⚠️ Needs reversal if was recorded |

### Expense Status

| Status | Meaning | Can Edit? | Treasury Impact |
|--------|---------|-----------|-----------------|
| `pending` | Requested | Yes | ❌ None yet |
| `approved` | Authorized for payment | Yes (amount) | ❌ None yet |
| `rejected` | Denied | No | ❌ None |
| `paid` | Money disbursed | No | ✅ Balance deducted |

---

This visual guide should serve as a quick reference for understanding how money flows through the system and impacts the database!
