# Accounting System Redesign Proposal

**Date:** 2026-01-10
**Branch:** feature/ux-redesign-frontend
**Status:** Proposal for Review

---

## Executive Summary

This document proposes a consolidated accounting system that:
1. **Merges the Safe/Treasury page into `/accounting`** - eliminating the separate `/accounting/safe` page
2. **Fixes the payment → safe flow** - cash goes to safe immediately when received
3. **Provides full bank visibility** - track bank balance and transfers from the main page
4. **Simplifies the API structure** - remove redundant endpoints

---

## 1. Current Problems Identified

### 1.1 Fragmented User Experience

| Problem | Current State | Impact |
|---------|---------------|--------|
| **Two separate pages** | `/accounting` (dashboard) + `/accounting/safe` (treasury) | Users must navigate between pages for related tasks |
| **Redundant payment recording** | Can record payments from both Payments page AND Safe page | Confusion about which flow to use |
| **Hidden bank balance** | Only visible on Safe page | Incomplete financial picture on main dashboard |
| **Too many tabs** | Balance, Transactions, Review tabs with overlapping data | Cognitive overload |

### 1.2 Incorrect Payment → Safe Flow

**Current Logic (WRONG):**
```
1. Record Cash Payment → status: pending_deposit (safe unchanged)
2. Deposit to Bank → safe DECREASES, bank INCREASES
3. Director Approves → safe INCREASES (adds money back!)
```

**Problem:** Step 2 decreases safe (simulating bank deposit), but Step 3 adds money to safe again. This is double-counting.

**Reality:** When a parent pays cash:
1. Money physically enters the safe immediately
2. Later, accountant takes cash to bank (safe decreases, bank increases)
3. Director's approval is just status confirmation, not a money movement

### 1.3 API Redundancies

| Endpoint | Purpose | Overlap |
|----------|---------|---------|
| `POST /api/payments` | Create enrollment payment | Creates Payment record only |
| `POST /api/treasury/transactions` | Create safe transaction | Creates SafeTransaction, bypasses Payment |
| `POST /api/expenses/[id]/pay` | Pay expense from safe | Updates safe balance |
| `POST /api/treasury/bank-transfers` | Transfer safe ↔ bank | Duplicates deposit logic |

**Issue:** Two ways to record a student payment (via `/payments` or `/treasury/transactions`), creating inconsistent audit trails.

---

## 2. Proposed Architecture

### 2.1 Unified `/accounting` Page

**One page to rule them all:**

```
/accounting                    → Main accounting dashboard (NEW consolidated design)
/accounting/payments           → Detailed payments management (keep existing)
/accounting/transactions       → Full transaction history (move from /safe/transactions)
```

**Remove:**
- `/accounting/safe/page.tsx` (merge into `/accounting`)
- `/accounting/safe/transactions/page.tsx` (move to `/accounting/transactions`)
- `/treasury/` redirects (no longer needed)

### 2.2 New Page Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ACCOUNTING DASHBOARD                                        [Refresh] btn  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────────────────┐ ┌──────────────────────────────┐         │
│  │     💰 SOLDE CAISSE          │ │     🏦 SOLDE BANQUE          │         │
│  │     15,000,000 GNF           │ │     50,000,000 GNF           │         │
│  │     ✓ Optimal                │ │                              │         │
│  │     [Vérifier]  [Transfert]  │ │     [Voir historique]        │         │
│  └──────────────────────────────┘ └──────────────────────────────┘         │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────────┐
│  │  📊 AUJOURD'HUI                                                         │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  │ Entrées     │  │ Sorties     │  │ Net         │  │ À valider   │    │
│  │  │ +2,500,000  │  │ -500,000    │  │ +2,000,000  │  │ 5 paiements │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │
│  └─────────────────────────────────────────────────────────────────────────┘
│                                                                             │
│  ┌────────────┬────────────┬────────────┬────────────┐                     │
│  │  Paiements │  Dépenses  │  Banque    │  Revue     │  ← Tabs             │
│  └────────────┴────────────┴────────────┴────────────┘                     │
│                                                                             │
│  [Tab Content Area]                                                         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.3 Tab Structure

| Tab | Content |
|-----|---------|
| **Paiements** | Payment stats by method/status/grade, quick actions, link to full list |
| **Dépenses** | Expense summary, pending approvals, pay buttons |
| **Banque** | Bank transfer history, deposit/withdraw buttons |
| **Revue** | Items needing Director approval (payments + expenses) |

---

## 3. Corrected Payment Flow

### 3.1 New Flow (Correct)

```
CASH PAYMENT:
1. Record Payment → status: pending_confirmation
   └─ SafeTransaction created (student_payment, direction: IN)
   └─ Safe balance INCREASES immediately

2. Director Confirms → status: confirmed
   └─ No balance change (money already counted)
   └─ Payment schedule marked as paid

3. Bank Deposit (separate action) →
   └─ SafeTransaction (bank_deposit, direction: OUT)
   └─ Safe balance DECREASES
   └─ Bank balance INCREASES
   └─ BankTransfer record created

ORANGE MONEY PAYMENT:
1. Record Payment → status: pending_confirmation
   └─ No SafeTransaction yet (money not in physical safe)

2. Director Confirms → status: confirmed
   └─ SafeTransaction created (student_payment, direction: IN)
   └─ Safe balance INCREASES (virtual acknowledgment)
   └─ Payment schedule marked as paid
```

### 3.2 Key Changes

| Current | Proposed | Reason |
|---------|----------|--------|
| Cash goes to safe on APPROVAL | Cash goes to safe on RECORD | Money physically enters safe when received |
| Bank deposit requires prior approval | Bank deposit is independent action | Can deposit any cash, regardless of payment status |
| Orange Money adds to safe on confirmation | Same (correct) | OM is already recorded in mobile money system |

---

## 4. UI Design Specifications

### 4.1 Hero Section: Dual Balance Cards

**Design Requirements:**
- Two large cards side-by-side (responsive: stack on mobile)
- Safe balance with status indicator (critical/warning/optimal/excess)
- Bank balance with total available
- Quick action buttons below each

```tsx
// Safe Balance Card
<Card className={cn(
  "border-2",
  status === "critical" && "border-red-500 bg-red-50 dark:bg-red-950/20",
  status === "warning" && "border-orange-500 bg-orange-50 dark:bg-orange-950/20",
  status === "optimal" && "border-green-500 bg-green-50 dark:bg-green-950/20",
  status === "excess" && "border-blue-500 bg-blue-50 dark:bg-blue-950/20",
)}>
  <CardContent className="pt-6">
    <div className="flex items-center gap-2 mb-2">
      <Wallet className="h-5 w-5" />
      <span className="text-sm font-medium text-muted-foreground">
        Solde Caisse
      </span>
      <Badge variant={statusVariant}>{statusLabel}</Badge>
    </div>
    <p className="text-4xl font-bold tabular-nums">
      {formatCurrency(safeBalance)} <span className="text-lg">GNF</span>
    </p>
    <div className="flex gap-2 mt-4">
      <Button size="sm" onClick={() => setShowVerifyDialog(true)}>
        <ClipboardCheck className="h-4 w-4 mr-1" />
        Vérifier
      </Button>
      <Button size="sm" variant="outline" onClick={() => setShowTransferDialog(true)}>
        <ArrowRightLeft className="h-4 w-4 mr-1" />
        Transfert
      </Button>
    </div>
  </CardContent>
</Card>
```

### 4.2 Today's Summary Row

**Four stat cards in a row:**

| Card | Icon | Color | Data |
|------|------|-------|------|
| Entrées | ArrowDownToLine | Green | Sum of today's incoming transactions |
| Sorties | ArrowUpFromLine | Red | Sum of today's outgoing transactions |
| Net | TrendingUp/Down | Green/Red | Net change (in - out) |
| À valider | Clock | Orange | Count of pending review items |

### 4.3 Tabs Design

**Use existing Tabs component with GSPN styling:**

```tsx
<Tabs defaultValue="payments" className="space-y-6">
  <TabsList className="grid w-full grid-cols-4">
    <TabsTrigger value="payments">
      <BanknoteIcon className="h-4 w-4 mr-2" />
      Paiements
    </TabsTrigger>
    <TabsTrigger value="expenses">
      <Receipt className="h-4 w-4 mr-2" />
      Dépenses
    </TabsTrigger>
    <TabsTrigger value="bank">
      <Building2 className="h-4 w-4 mr-2" />
      Banque
    </TabsTrigger>
    <TabsTrigger value="review" className="relative">
      <CheckCircle2 className="h-4 w-4 mr-2" />
      Revue
      {pendingCount > 0 && (
        <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 justify-center">
          {pendingCount}
        </Badge>
      )}
    </TabsTrigger>
  </TabsList>

  {/* Tab content... */}
</Tabs>
```

### 4.4 Payments Tab Content

```
┌─────────────────────────────────────────────────────────────────┐
│  Par Méthode                    │  Par Statut                  │
│  ┌─────────────────────────┐    │  ┌─────────────────────────┐ │
│  │ 💵 Espèces              │    │  │ ● Confirmé    8,500,000 │ │
│  │    12 trans. | 5,000,000│    │  │ ● En attente  1,500,000 │ │
│  │    ✓ 4,500,000 confirmé │    │  │ ● Déposé        500,000 │ │
│  ├─────────────────────────┤    │  │ ● Rejeté        100,000 │ │
│  │ 📱 Orange Money         │    │  └─────────────────────────┘ │
│  │    8 trans.  | 3,000,000│    │                              │
│  │    ✓ 2,800,000 confirmé │    │                              │
│  └─────────────────────────┘    │                              │
├─────────────────────────────────────────────────────────────────┤
│  Par Classe (Progress Bars)                                     │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ CP1   ████████████████░░░░  75%   1,200,000 GNF  (15 pmt)  │ │
│  │ CP2   ███████████░░░░░░░░░  55%     900,000 GNF  (12 pmt)  │ │
│  │ CE1   ██████████████████░░  85%   1,500,000 GNF  (18 pmt)  │ │
│  └────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│  [+ Nouveau Paiement]              [Voir tous les paiements →] │
└─────────────────────────────────────────────────────────────────┘
```

### 4.5 Bank Tab Content (NEW)

```
┌─────────────────────────────────────────────────────────────────┐
│  Solde Actuel: 50,000,000 GNF                                   │
│                                                                 │
│  [Déposer en banque]  [Retrait de banque]                      │
├─────────────────────────────────────────────────────────────────┤
│  Transferts Récents                                             │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ 2026-01-10  DEPOT    +2,000,000   Réf: DEP-20260110-0001  │ │
│  │ 2026-01-09  RETRAIT  -5,000,000   Réf: RET-20260109-0002  │ │
│  │ 2026-01-08  DEPOT    +3,500,000   Réf: DEP-20260108-0001  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  [Voir tout l'historique →]                                    │
└─────────────────────────────────────────────────────────────────┘
```

### 4.6 Animation Specifications

Apply same animation patterns from payments page:

| Element | Animation | Duration | Delay |
|---------|-----------|----------|-------|
| Safe/Bank cards | Fade in + slide up | 700ms | 0ms |
| Today's stats | Fade in + slide up | 700ms | 150ms |
| Tabs | Fade in | 500ms | 300ms |
| Balance numbers | Count up | 1200ms | After visible |
| Status indicators | Scale in | 300ms | 200ms |

---

## 5. API Consolidation

### 5.1 Remove Redundant Endpoints

| Remove | Reason | Replacement |
|--------|--------|-------------|
| `POST /api/treasury/transactions` (for student payments) | Bypasses enrollment system | Use `/api/payments` |
| RecordPaymentDialog from Safe page | Duplicate of Payments page | Remove component |

### 5.2 Fix `/api/payments/[id]/review`

**Current (lines 104-131):**
```typescript
// If approved cash payment, update safe balance
if (validated.action === "approve" && existingPayment.method === "cash") {
  const newSafeBalance = currentBalance.safeBalance + existingPayment.amount
  // Creates SafeTransaction...
}
```

**Proposed:**
```typescript
// For CASH: Safe already updated on payment recording
// For ORANGE_MONEY: Update safe on approval
if (validated.action === "approve" && existingPayment.method === "orange_money") {
  const newSafeBalance = currentBalance.safeBalance + existingPayment.amount
  // Creates SafeTransaction...
}
// Cash payments: no safe update here (already counted)
```

### 5.3 Fix `/api/payments` POST

**Add safe balance update for cash payments:**

```typescript
// When creating a CASH payment, immediately add to safe
if (method === "cash") {
  const currentBalance = await tx.safeBalance.findFirst()
  const newSafeBalance = currentBalance.safeBalance + amount

  await tx.safeTransaction.create({
    data: {
      type: "student_payment",
      direction: "in",
      amount,
      safeBalanceAfter: newSafeBalance,
      description: `Paiement scolarité - ${receiptNumber}`,
      referenceType: "payment",
      referenceId: payment.id,
      studentId: enrollment.studentId,
      recordedBy: session.user.id,
    },
  })

  await tx.safeBalance.update({
    where: { id: currentBalance.id },
    data: { safeBalance: newSafeBalance },
  })
}
```

### 5.4 Fix `/api/payments/[id]/deposit`

**Remove the safe balance decrease logic:**

The deposit action should ONLY:
1. Create BankTransfer record
2. Update SafeBalance (safe -, bank +)
3. Update payment status to "deposited"

**Remove:** The check for "safe balance already increased" since it won't happen on recording anymore for cash.

---

## 6. Component Changes

### 6.1 Remove

| Component | Path | Reason |
|-----------|------|--------|
| RecordPaymentDialog | `/components/treasury/record-payment-dialog.tsx` | Duplicate functionality |
| TreasuryPage | `/app/accounting/safe/page.tsx` | Merged into main accounting |

### 6.2 Keep & Reuse

| Component | Path | Usage |
|-----------|------|-------|
| BankTransferDialog | `/components/treasury/bank-transfer-dialog.tsx` | Use in Bank tab |
| VerifyCashDialog | `/components/treasury/verify-cash-dialog.tsx` | Use in Safe card |
| RecordExpenseDialog | `/components/treasury/record-expense-dialog.tsx` | Use in Expenses tab |

### 6.3 Create New

| Component | Purpose |
|-----------|---------|
| `SafeBankHero` | Dual balance cards with quick actions |
| `TodaySummaryRow` | Four stat cards for today's activity |
| `BankTabContent` | Bank transfer history and actions |

---

## 7. Database Changes

### 7.1 No Schema Changes Required

The current schema supports the proposed flow. Changes are only in the API logic.

### 7.2 Data Migration

If there are existing cash payments that were recorded under the old flow:
- Run a one-time script to reconcile SafeBalance
- Verify sum of SafeTransactions matches current balance

---

## 8. i18n Additions

Add to `en.ts` and `fr.ts`:

```typescript
accounting: {
  // Existing...

  // New
  safeBalance: "Safe Balance",
  bankBalance: "Bank Balance",
  todayIn: "Today's Income",
  todayOut: "Today's Expenses",
  todayNet: "Net Change",
  pendingReview: "Pending Review",
  verifyCash: "Verify Cash",
  bankTransfer: "Bank Transfer",
  depositToBank: "Deposit to Bank",
  withdrawFromBank: "Withdraw from Bank",
  recentTransfers: "Recent Transfers",
  viewAllHistory: "View All History",

  // Status
  statusCritical: "Critical",
  statusWarning: "Warning",
  statusOptimal: "Optimal",
  statusExcess: "Excess",
}
```

---

## 9. Implementation Plan

### Phase 1: Fix Payment Flow (Critical)

1. **Update `/api/payments` POST** - Add safe balance update for cash
2. **Update `/api/payments/[id]/review`** - Remove cash safe update (keep for OM only)
3. **Test thoroughly** - Ensure correct balance changes

### Phase 2: Consolidate UI

1. **Create new `/accounting/page.tsx`** - Implement unified design
2. **Move bank tab content** - From safe page to new tab
3. **Add animations** - Apply payment page animation patterns
4. **Test all tabs** - Verify functionality

### Phase 3: Cleanup

1. **Remove `/accounting/safe/page.tsx`** - After confirming new page works
2. **Remove `/treasury/` redirects** - No longer needed
3. **Remove RecordPaymentDialog** - Duplicate
4. **Update navigation** - Remove "Caisse" link, keep single "Comptabilité"

### Phase 4: Documentation

1. **Update TEST_PLAN** - Reflect new flows
2. **Update CLAUDE.md** - Add accounting section
3. **Create user guide** - How to use new accounting page

---

## 10. Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Data inconsistency during migration | High | Run reconciliation script before deploying |
| User confusion with new flow | Medium | Add tooltips explaining when money enters safe |
| Regression in payment processing | High | Comprehensive test plan execution |
| Missing functionality from removed pages | Medium | Careful audit of all features before removal |

---

## 11. Success Criteria

- [ ] Single `/accounting` page handles all treasury operations
- [ ] Cash payments immediately reflect in safe balance
- [ ] Bank balance visible on main dashboard
- [ ] No redundant payment recording flows
- [ ] All tests in TEST_PLAN pass
- [ ] TypeScript compiles without errors
- [ ] Production build succeeds
- [ ] French and English translations complete

---

## 12. Appendix: Mockup Wireframes

### Mobile View

```
┌─────────────────────┐
│  COMPTABILITÉ       │
├─────────────────────┤
│  ┌───────────────┐  │
│  │ 💰 CAISSE     │  │
│  │ 15,000,000    │  │
│  │ ✓ Optimal     │  │
│  │ [Vérifier]    │  │
│  └───────────────┘  │
│  ┌───────────────┐  │
│  │ 🏦 BANQUE     │  │
│  │ 50,000,000    │  │
│  │ [Transfert]   │  │
│  └───────────────┘  │
│                     │
│  Aujourd'hui        │
│  +2.5M | -500K | 5  │
│                     │
│  [Paiements|Dépenses│
│   |Banque|Revue]    │
│                     │
│  [Content...]       │
└─────────────────────┘
```

---

**Document End**

*Ready for review and approval before implementation.*
