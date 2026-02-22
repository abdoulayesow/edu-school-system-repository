# Phase 2: Treasury Integration into /accounting - Requirements Document

**Date:** 2026-01-09
**Status:** Ready to Start
**Previous Work:** Treasury feature completed as standalone `/treasury` (see `docs/summaries/2026-01-09_treasury-management-implementation.md`)

---

## Executive Summary

The treasury (cash & safe management) feature was built as a standalone module at `/treasury`. After analysis, it should be **integrated into the existing `/accounting` structure** to align with the current accounting flow and user navigation patterns.

### Current Accounting Structure

**URL:** `/accounting`
**Purpose:** Unified view of financial data (payments, expenses, balances)
**Navigation:** Already in sidebar under "Accounting" section

**Existing Tabs:**
1. **Balance** - Overview cards, breakdowns by method/status/grade
2. **Transactions** - All payments with filters
3. **Review** - Pending deposits and approvals

**Existing Related Pages:**
- `/accounting/payments` - Dedicated payments page
- `/expenses` - Dedicated expenses page (separate route)

---

## Current Payment Flow Analysis

### Payment Lifecycle

```
1. RECORD PAYMENT (Secretary/Accountant)
   ↓
   Status: pending_deposit (cash) OR pending_review (Orange Money)

2. DEPOSIT CASH (Accountant) [ONLY FOR CASH]
   ↓
   CashDeposit record created
   Status: deposited → pending_review

3. REVIEW & APPROVE (Director)
   ↓
   Status: confirmed
   ⚠️ CURRENT GAP: No safe balance update

4. PAY EXPENSE (Accountant)
   ↓
   ⚠️ CURRENT GAP: No fund check or safe deduction
```

### Current Data Models

**Payment:**
- Has `CashDeposit` relation (bank deposit of physical cash)
- Status flow: pending_deposit → deposited → pending_review → confirmed
- Methods: cash, orange_money

**Expense:**
- Status flow: pending → approved → paid
- Methods: cash, orange_money
- No fund validation

**Accounting Balance API:**
- Calculates virtual balances from payment/expense aggregations
- No physical safe tracking
- Formula: `cashAvailable = confirmedPayments - paidExpenses`

---

## The Problem

### Current System (WITHOUT Treasury)
- ❌ No physical safe balance tracking
- ❌ Cash deposits to bank are recorded, but safe balance not tracked
- ❌ Expenses have no fund validation
- ❌ No daily cash verification
- ❌ No audit trail for cash movements
- ❌ Cannot warn when safe is too full or too low

### With Standalone Treasury (CURRENT STATE)
- ✅ Physical safe tracking works
- ✅ Transactions create audit trail
- ✅ Fund validation on expenses
- ❌ **PROBLEM:** Duplicate navigation (`/accounting` AND `/treasury`)
- ❌ **PROBLEM:** Users confused which to use
- ❌ **PROBLEM:** Not integrated with existing payment flow
- ❌ **PROBLEM:** Need to manually reconcile

---

## Solution: Integrate Treasury INTO /accounting

### Proposed URL Structure

```
/accounting                      # Main accounting dashboard
├── /accounting/payments         # Existing - keep as is
├── /accounting/safe             # NEW - Safe/Treasury management (replaces /treasury)
├── /accounting/safe/transactions # NEW - Transaction history
├── /accounting/safe/verifications # NEW - Daily verifications
└── /accounting/safe/reports      # NEW - Treasury reports

/expenses                        # Keep as is (separate)
```

### Proposed Tab Structure for /accounting

**Option A: Add "Safe" Tab (Recommended)**
```
/accounting
├── Balance (existing)
├── Transactions (existing)
├── Review (existing)
└── Safe (NEW) ← Treasury dashboard here
```

**Option B: Merge into Balance Tab**
```
/accounting
├── Balance (modified to include safe stats)
├── Safe Management (NEW separate tab)
├── Transactions (existing)
└── Review (existing)
```

**Recommendation:** Option A - Keep Balance tab focused on analytics, add new Safe tab for operations.

---

## Requirements

### 1. URL Migration

**Goal:** Move treasury from `/treasury` to `/accounting/safe`

**Tasks:**
- [ ] Rename `app/ui/app/treasury` → `app/ui/app/accounting/safe`
- [ ] Update route paths in all pages
- [ ] Update navigation config to point to `/accounting/safe`
- [ ] Add redirect from `/treasury` → `/accounting/safe` for bookmarks
- [ ] Update all internal links

**Files to Modify:**
- `app/ui/app/treasury/page.tsx` → `app/ui/app/accounting/safe/page.tsx`
- `app/ui/app/treasury/transactions/page.tsx` → `app/ui/app/accounting/safe/transactions/page.tsx`
- `app/ui/lib/nav-config.ts` - Update href from `/treasury` to `/accounting/safe`

---

### 2. Navigation Integration

**Current:** Treasury shows as separate item under "Accounting" section

**Goal:** Make Treasury a sub-route of Accounting

**Proposed Nav Structure:**
```
📊 Accounting
  ├── 📈 Balance (/accounting)
  ├── 💰 Payments (/accounting/payments)
  ├── 💳 Expenses (/expenses)
  └── 🔒 Safe/Treasury (/accounting/safe)  ← NEW
```

**Alternative (Expandable):**
```
📊 Accounting
  ├── 📈 Overview (/accounting)
  └── 💰 Safe & Cash
      ├── 🔒 Dashboard (/accounting/safe)
      ├── 📝 Transactions (/accounting/safe/transactions)
      ├── ✓ Verifications (/accounting/safe/verifications)
      └── 📊 Reports (/accounting/safe/reports)
```

**Tasks:**
- [ ] Update `nav-config.ts` to nest Safe under Accounting
- [ ] Update translationKeys
- [ ] Test navigation expansion/collapse
- [ ] Ensure active state highlights correctly

---

### 3. Merge Safe Stats into /accounting Balance Tab

**Goal:** Show safe status prominently on the main accounting page

**Current `/accounting` Balance Tab Shows:**
- Confirmed payments total
- Pending payments total
- Paid expenses total
- Net margin

**Proposed Addition:**
```
┌─────────────────────────────────────────────────────────┐
│  Current 4 cards (payments, expenses, margin)           │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  SAFE & CASH OVERVIEW (NEW SECTION)                     │
│  ┌───────────────┐  ┌───────────────┐  ┌──────────────┐ │
│  │ Safe Balance  │  │ Bank Balance  │  │ Status       │ │
│  │ 15,750,000    │  │ 45,000,000    │  │ 🟢 Optimal  │ │
│  │     GNF       │  │     GNF       │  │              │ │
│  └───────────────┘  └───────────────┘  └──────────────┘ │
│                                                          │
│  [View Safe Management →]                                │
└─────────────────────────────────────────────────────────┘
```

**Tasks:**
- [ ] Fetch SafeBalance data in `/accounting` page
- [ ] Add SafeBalanceSummary component to Balance tab
- [ ] Display current safe balance, bank balance, status indicator
- [ ] Add link to `/accounting/safe` for full management
- [ ] Handle case where SafeBalance not initialized

**API Changes:**
- [ ] Modify `GET /api/accounting/balance` to include SafeBalance data

---

### 4. Integrate Safe Updates into Payment Flow

**Current Flow:**
```
Payment recorded → Deposited → Reviewed → Confirmed
                                            ↓
                                    ⚠️ No safe update
```

**Goal:** Automatically update safe when cash payment confirmed

**Already Implemented:** ✅ `/api/payments/[id]/review` already updates SafeBalance for cash payments

**Tasks:**
- [ ] Verify integration works correctly
- [ ] Test edge cases:
  - Multiple payments confirmed at once
  - Large amounts
  - Concurrent confirmations
- [ ] Add UI feedback showing safe balance change after approval
- [ ] Update PaymentReviewDialog to show "Safe will increase by X GNF"

---

### 5. Integrate Safe Deduction into Expense Flow

**Current Flow:**
```
Expense requested → Approved → Marked as Paid
                                      ↓
                              ⚠️ No fund check
```

**Goal:** Validate funds and deduct from safe when marking expense as paid

**Already Implemented:** ✅ `/api/expenses/[id]/pay` already checks funds and deducts

**Tasks:**
- [ ] Add "Pay" button to `/expenses` page for approved expenses
- [ ] Show safe balance when paying expense
- [ ] Display insufficient funds warning if balance too low
- [ ] Add confirmation dialog: "This will deduct X GNF from safe (new balance: Y GNF)"
- [ ] Update UI after payment to show new safe balance

---

### 6. Enhance CashDeposit Flow

**Current:** Accountant marks cash as "deposited" to bank via CashDepositDialog

**Goal:** Link CashDeposit with BankTransfer (safe → bank)

**Current CashDeposit Model:**
```prisma
model CashDeposit {
  id              String   @id @default(cuid())
  paymentId       String   @unique
  depositDate     DateTime
  depositedBy     String
  bankName        String?
  depositReference String?
  notes           String?
  // ...
}
```

**Proposed Integration:**
- When CashDeposit is created, also create BankTransfer (type: deposit)
- Deduct cash from safe, add to bank balance
- Create SafeTransaction for audit trail

**Tasks:**
- [ ] Modify `/api/payments/[id]/deposit` (CashDeposit creation) to:
  - Create BankTransfer
  - Update SafeBalance (decrease safe, increase bank)
  - Create SafeTransaction
- [ ] Update CashDepositDialog UI to show:
  - Current safe balance
  - Amount being deposited
  - New safe balance after deposit
- [ ] Add validation: Cannot deposit if safe balance insufficient

---

### 7. Daily Verification Integration

**Current:** No verification in existing accounting flow

**Goal:** Add verification reminder/status to `/accounting` page

**Proposed:**
- Add banner at top of `/accounting` if:
  - Today's verification not done yet (after 8 AM)
  - Last verification has discrepancy
- Quick action button: "Verify Cash Now" → opens VerifyCashDialog
- Show last verification status in Safe Overview section

**Tasks:**
- [ ] Add verification status API endpoint: `GET /api/treasury/verifications/status`
- [ ] Display banner component on `/accounting` page
- [ ] Add VerifyCashDialog to `/accounting` page
- [ ] Show verification status in Safe Overview card

---

### 8. Reconciliation Page

**New Feature:** `/accounting/reconciliation`

**Purpose:** Help accountant reconcile:
1. Confirmed payments vs SafeBalance
2. Paid expenses vs SafeBalance
3. CashDeposits vs BankTransfers

**Display:**
- Expected safe balance (calculated from transactions)
- Actual safe balance (from SafeBalance record)
- Discrepancy (if any)
- List of unreconciled items

**Tasks:**
- [ ] Create `/accounting/reconciliation/page.tsx`
- [ ] Create `GET /api/treasury/reconciliation` endpoint
- [ ] Calculate expected vs actual balances
- [ ] Identify discrepancies
- [ ] Provide "Adjust Balance" action (Director only)

---

### 9. Reports Integration

**Current:** `/accounting` has no reports

**Goal:** Add reports section accessible from accounting

**Proposed:**
- `/accounting/reports` - Landing page for all reports
- `/accounting/reports/daily` - Daily treasury report
- `/accounting/reports/payments` - Payment summary report
- `/accounting/reports/expenses` - Expense summary report
- `/accounting/reports/cash-flow` - Cash flow statement

**Tasks:**
- [ ] Create reports landing page
- [ ] Move `/api/treasury/reports/daily` to `/api/accounting/reports/daily`
- [ ] Add payment and expense report endpoints
- [ ] Add export to PDF functionality
- [ ] Add date range filters

---

### 10. Update i18n

**Changes Needed:**
- Update navigation keys (accounting.safe instead of nav.treasury)
- Ensure consistency between accounting and treasury terminology
- Add new keys for integration points

**Tasks:**
- [ ] Review all treasury i18n keys
- [ ] Move relevant keys to accounting section
- [ ] Add new integration keys (e.g., "safeWillIncrease", "insufficientFunds")
- [ ] Update both fr.ts and en.ts

---

### 11. Role-Based Access Control (RBAC)

**Current Treasury Permissions:**
- **View:** director, accountant
- **Record:** director, accountant, secretary
- **Transfer:** director, accountant
- **Verify:** director, accountant
- **Review Discrepancy:** director only

**Changes Needed:**
- Ensure consistency with `/accounting` permissions
- Secretary should see safe balance but cannot make transfers

**Tasks:**
- [ ] Audit all treasury endpoints for correct RBAC
- [ ] Update UI to hide actions based on role
- [ ] Test with each role (director, accountant, secretary)

---

### 12. Testing Requirements

#### Integration Tests

**Payment → Safe Integration:**
- [ ] Record cash payment
- [ ] Deposit cash (creates bank transfer, updates safe)
- [ ] Approve payment
- [ ] Verify safe balance increased
- [ ] Verify SafeTransaction created
- [ ] Verify BankTransfer created

**Expense → Safe Integration:**
- [ ] Create expense
- [ ] Approve expense
- [ ] Attempt to pay with insufficient funds → Should fail
- [ ] Add funds to safe
- [ ] Pay expense successfully
- [ ] Verify safe balance decreased
- [ ] Verify SafeTransaction created

**Daily Verification:**
- [ ] Perform verification with match
- [ ] Perform verification with discrepancy
- [ ] Director reviews discrepancy
- [ ] Verify cannot do duplicate verification same day

#### UI Tests

**Navigation:**
- [ ] Navigate from sidebar to /accounting/safe
- [ ] Navigate from /accounting Balance tab to safe
- [ ] Back button works correctly
- [ ] Breadcrumbs show correct path

**Safe Dashboard:**
- [ ] Safe balance displays correctly
- [ ] Status color matches threshold
- [ ] Quick actions work
- [ ] Recent transactions load

**Dialogs:**
- [ ] RecordPaymentDialog shows student search
- [ ] RecordExpenseDialog shows insufficient funds warning
- [ ] BankTransferDialog updates both balances
- [ ] VerifyCashDialog handles discrepancies

---

## Implementation Plan

### Phase 2.1: URL Migration (1-2 hours)
1. Move `/treasury` to `/accounting/safe`
2. Update navigation config
3. Add redirect from old URL
4. Test all routes work

### Phase 2.2: Navigation Integration (1 hour)
1. Update nav structure
2. Test expansion/collapse
3. Update active states

### Phase 2.3: Balance Tab Integration (2-3 hours)
1. Fetch SafeBalance in /accounting
2. Add Safe Overview section
3. Add verification banner
4. Link to safe management

### Phase 2.4: Payment Flow Integration (2 hours)
1. Test existing integration
2. Add UI feedback for safe updates
3. Update PaymentReviewDialog

### Phase 2.5: Expense Flow Integration (3 hours)
1. Add "Pay" button to expenses page
2. Add fund check UI
3. Add confirmation dialog
4. Test insufficient funds scenario

### Phase 2.6: CashDeposit Integration (2-3 hours)
1. Link CashDeposit with BankTransfer
2. Update safe balance on deposit
3. Test deposit flow end-to-end

### Phase 2.7: Verification Integration (2 hours)
1. Add verification status API
2. Add banner to /accounting
3. Test verification flow

### Phase 2.8: Reconciliation Page (3-4 hours)
1. Create reconciliation page
2. Build reconciliation logic
3. Add adjust balance feature

### Phase 2.9: Reports (4-5 hours)
1. Create reports landing page
2. Build daily report
3. Add export functionality

### Phase 2.10: Testing & Polish (3-4 hours)
1. Run full test suite
2. Fix bugs
3. Update documentation
4. Create user guide

**Total Estimated Time:** 23-31 hours

---

## Success Criteria

### Functional Requirements
- ✅ Treasury accessible via `/accounting/safe`
- ✅ Safe balance visible on main `/accounting` page
- ✅ Cash payments automatically update safe when confirmed
- ✅ Expenses cannot be paid if insufficient funds
- ✅ Cash deposits create bank transfers and update balances
- ✅ Daily verification integrated into accounting workflow
- ✅ Reconciliation page helps identify discrepancies

### User Experience
- ✅ Single entry point for all accounting tasks
- ✅ Clear visual feedback for all safe operations
- ✅ No duplicate or confusing navigation
- ✅ Consistent terminology throughout
- ✅ Role-based access works correctly

### Technical
- ✅ All tests pass
- ✅ No TypeScript errors
- ✅ Build succeeds
- ✅ Database transactions atomic
- ✅ Audit trail complete

---

## Migration Notes

### Data Migration
- SafeBalance already initialized ✅
- No data migration needed
- Existing SafeTransactions preserved

### URL Migration
- Add redirect in middleware:
  ```typescript
  if (pathname === '/treasury') {
    return NextResponse.redirect(new URL('/accounting/safe', request.url))
  }
  ```

### Breaking Changes
- None - only URL changes
- Bookmarks will redirect automatically

---

## Documentation Updates Needed

1. Update README with new URL structure
2. Update user guide with accounting integration
3. Update API documentation
4. Create migration guide for users
5. Update deployment checklist

---

## Resume Prompt for Next Session

```
Continue Phase 2: Treasury Integration into /accounting

CONTEXT:
- Treasury feature is complete and working at /treasury
- Need to integrate into existing /accounting structure
- Goal: Move /treasury → /accounting/safe and integrate with payment/expense flows

COMPLETED:
- Treasury implementation (Phase 1)
- Database models and API endpoints
- Frontend components and pages
- i18n translations
- Documentation

NEXT TASKS:
1. Move /treasury to /accounting/safe
2. Update navigation config
3. Add safe stats to /accounting Balance tab
4. Integrate cash deposit flow with bank transfers
5. Add "Pay" button to expenses with fund check
6. Add verification banner to /accounting
7. Create reconciliation page
8. Add reports section
9. Full integration testing

REFERENCE FILES:
- Requirements: docs/PHASE_2_TREASURY_INTEGRATION_REQUIREMENTS.md
- Phase 1 Summary: docs/summaries/2026-01-09_treasury-management-implementation.md
- Deployment Checklist: docs/TREASURY_DEPLOYMENT_CHECKLIST.md
```

---

## Questions to Resolve

1. **URL Naming:** `/accounting/safe` vs `/accounting/treasury` vs `/accounting/cash`?
   - **Recommendation:** `/accounting/safe` (matches "caisse" concept)

2. **Navigation:** Nested sub-menu or single tab?
   - **Recommendation:** Single "Safe" tab, then sub-pages for transactions/verifications

3. **CashDeposit Integration:** Automatic or manual link to BankTransfer?
   - **Recommendation:** Automatic - create BankTransfer when cash deposited

4. **Verification Reminder:** Email or just UI banner?
   - **Recommendation:** Start with UI banner, add email in Phase 3

5. **Reconciliation:** Automatic adjustment or manual approval?
   - **Recommendation:** Manual approval by Director only

---

**END OF REQUIREMENTS DOCUMENT**

Ready to start Phase 2 implementation. Use this document as the complete specification for the integration work.
