# Test Plan: Accounting & Treasury Management System

**Version:** 1.0
**Date:** 2026-01-10
**Project:** GSPN School Management System
**Module:** Accounting & Treasury (Caisse)
**Branch:** feature/ux-redesign-frontend

---

## Table of Contents

1. [Overview](#1-overview)
2. [Test Environment](#2-test-environment)
3. [Test Scenarios](#3-test-scenarios)
   - [3.1 Payment Workflows](#31-payment-workflows)
   - [3.2 Expense Workflows](#32-expense-workflows)
   - [3.3 Treasury (Safe) Management](#33-treasury-safe-management)
   - [3.4 Bank Transfer Operations](#34-bank-transfer-operations)
   - [3.5 Daily Verification](#35-daily-verification)
   - [3.6 Accounting Dashboard](#36-accounting-dashboard)
4. [Role-Based Access Control Tests](#4-role-based-access-control-tests)
5. [Edge Cases & Error Handling](#5-edge-cases--error-handling)
6. [Performance & Concurrency Tests](#6-performance--concurrency-tests)
7. [UI/UX Tests](#7-uiux-tests)
8. [API Integration Tests](#8-api-integration-tests)
9. [Database Integrity Tests](#9-database-integrity-tests)
10. [Regression Tests](#10-regression-tests)

---

## 1. Overview

### Purpose
This test plan covers all features implemented for the Accounting and Treasury management system, including:
- Student payment processing and approval workflows
- Expense management with fund validation
- Safe (caisse) balance tracking with status thresholds
- Bank transfer operations (deposits/withdrawals)
- Daily cash verification with discrepancy handling
- Integrated accounting dashboard

### Features Under Test

| Feature | Location | Priority |
|---------|----------|----------|
| Payment Recording | `/accounting/payments` | Critical |
| Payment Approval | `/api/payments/[id]/review` | Critical |
| Cash Deposit to Bank | `/api/payments/[id]/deposit` | Critical |
| Expense Creation | `/expenses` | High |
| Expense Payment | `/api/expenses/[id]/pay` | Critical |
| Safe Balance Management | `/accounting/safe` | Critical |
| Bank Transfers | `/api/treasury/bank-transfers` | High |
| Daily Verification | `/api/treasury/verifications` | High |
| Accounting Dashboard | `/accounting` | Medium |

### Test Data Requirements

- **Users:** Director, Accountant, Secretary accounts
- **Students:** At least 5 enrolled students with payment schedules
- **Initial Safe Balance:** 15,000,000 GNF (optimal range)
- **Initial Bank Balance:** 50,000,000 GNF

---

## 2. Test Environment

### Prerequisites

```bash
# Start development server
cd app/ui && npm run dev

# Database should have:
- SafeBalance record initialized
- Test users with appropriate roles
- Enrolled students with tuition fees
```

### Browser Requirements
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (responsive testing)

### Test URLs
- Accounting Dashboard: `http://localhost:8000/accounting`
- Payments Page: `http://localhost:8000/accounting/payments`
- Safe Management: `http://localhost:8000/accounting/safe`
- Transactions History: `http://localhost:8000/accounting/safe/transactions`
- Expenses Page: `http://localhost:8000/expenses`

---

## 3. Test Scenarios

### 3.1 Payment Workflows

#### TC-PAY-001: Record Cash Payment
**Priority:** Critical
**Preconditions:** Logged in as Secretary/Accountant, student exists with unpaid fees

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/accounting/payments` | Payments page loads with animation |
| 2 | Click "Nouveau Paiement" button | Payment dialog opens |
| 3 | Search for student by name | Student appears in dropdown with balance info |
| 4 | Select student | Tuition fee, total paid, remaining balance displayed |
| 5 | Enter amount (e.g., 500,000 GNF) | Amount accepted, no validation error |
| 6 | Select "Espèces" (Cash) method | Cash selected |
| 7 | Enter document reference | Reference accepted |
| 8 | Click Submit | Dialog closes, payment appears in table |
| 9 | Verify payment status | Status shows "pending_deposit" (orange badge) |
| 10 | Verify receipt number | Auto-generated receipt number displayed |

**Pass Criteria:** Payment created with `pending_deposit` status, appears in filtered list

---

#### TC-PAY-002: Record Orange Money Payment
**Priority:** Critical
**Preconditions:** Logged in as Secretary/Accountant, student exists

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open payment dialog | Dialog opens |
| 2 | Select student and enter amount | Amount accepted |
| 3 | Select "Orange Money" method | Transaction reference field appears |
| 4 | Enter transaction reference | Reference accepted |
| 5 | Submit payment | Payment created |
| 6 | Verify status | Status shows "pending_review" (yellow badge) |

**Pass Criteria:** Orange Money payment created with `pending_review` status

---

#### TC-PAY-003: Deposit Cash to Bank
**Priority:** Critical
**Preconditions:** Cash payment exists with `pending_deposit` status, safe has sufficient funds

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Note current safe balance | Record starting balance |
| 2 | Note current bank balance | Record starting bank balance |
| 3 | Find payment with "Déposer" button | Orange deposit button visible |
| 4 | Click "Déposer" | Deposit dialog opens |
| 5 | Enter bank name | Bank name accepted |
| 6 | Enter bank reference | Reference accepted |
| 7 | Enter deposited by name | Name accepted |
| 8 | Confirm deposit | Dialog closes |
| 9 | Verify payment status | Changed to "deposited" |
| 10 | Navigate to `/accounting/safe` | Safe page loads |
| 11 | Verify safe balance | Decreased by payment amount |
| 12 | Verify bank balance | Increased by payment amount |
| 13 | Check transactions | BankTransfer and SafeTransaction created |

**Pass Criteria:**
- Safe balance decreases by exact amount
- Bank balance increases by exact amount
- BankTransfer record created
- SafeTransaction created (type: bank_deposit, direction: out)
- Payment status changes to "deposited"

---

#### TC-PAY-004: Approve Cash Payment (Director)
**Priority:** Critical
**Preconditions:** Logged in as Director, payment exists with `deposited` status

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Note current safe balance | Record starting balance |
| 2 | Find payment with "Valider" button | Green validate button visible |
| 3 | Click "Valider" | Confirmation dialog appears |
| 4 | Confirm approval | Payment approved |
| 5 | Verify payment status | Changed to "confirmed" (green badge) |
| 6 | Verify safe balance | Increased by payment amount |
| 7 | Check SafeTransaction | Created with type: student_payment, direction: in |

**Pass Criteria:**
- Payment status changes to "confirmed"
- Safe balance increases by payment amount
- SafeTransaction audit record created

---

#### TC-PAY-005: Reject Payment (Director)
**Priority:** High
**Preconditions:** Logged in as Director, payment exists with `pending_review` status

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Find payment awaiting review | Payment visible in list |
| 2 | Click reject action | Rejection dialog opens |
| 3 | Enter rejection reason | Reason accepted |
| 4 | Confirm rejection | Payment rejected |
| 5 | Verify payment status | Changed to "rejected" (red badge) |
| 6 | Verify safe balance unchanged | No change to safe balance |

**Pass Criteria:** Payment rejected, no financial impact on safe

---

#### TC-PAY-006: Payment Amount Validation
**Priority:** High
**Preconditions:** Student has remaining balance of 500,000 GNF

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open payment dialog | Dialog opens |
| 2 | Select student | Remaining balance shown: 500,000 GNF |
| 3 | Enter amount: 600,000 GNF | Warning: Amount exceeds remaining balance |
| 4 | Verify submit still possible | Can still submit (overpayment allowed) |
| 5 | Enter amount: 0 GNF | Validation error: Amount must be positive |
| 6 | Enter negative amount | Validation error |

**Pass Criteria:** Appropriate warnings/errors for invalid amounts

---

### 3.2 Expense Workflows

#### TC-EXP-001: Create New Expense
**Priority:** High
**Preconditions:** Logged in as Secretary/Accountant

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/expenses` | Expenses page loads |
| 2 | Click "Nouvelle Dépense" | Create expense dialog opens |
| 3 | Select category: "Fournitures" | Category selected |
| 4 | Enter description | Description accepted |
| 5 | Enter amount: 250,000 GNF | Amount accepted |
| 6 | Enter vendor name | Vendor accepted |
| 7 | Select date | Date accepted |
| 8 | Submit expense | Dialog closes |
| 9 | Verify expense in list | Status shows "pending" |

**Pass Criteria:** Expense created with `pending` status

---

#### TC-EXP-002: Approve Expense (Director)
**Priority:** High
**Preconditions:** Logged in as Director, pending expense exists

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Find pending expense | Expense visible with approve button |
| 2 | Click "Approve" | Expense approved |
| 3 | Verify status | Changed to "approved" |
| 4 | Verify safe balance unchanged | No change yet |

**Pass Criteria:** Expense approved, safe balance unchanged until paid

---

#### TC-EXP-003: Pay Expense with Sufficient Funds
**Priority:** Critical
**Preconditions:** Approved expense exists (250,000 GNF), safe balance > 250,000 GNF

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Note current safe balance | Record starting balance (e.g., 15,000,000 GNF) |
| 2 | Find approved expense | "Mark as Paid" button visible |
| 3 | Click "Mark as Paid" | Confirmation dialog opens |
| 4 | Verify dialog shows current safe balance | 15,000,000 GNF displayed |
| 5 | Verify dialog shows deduction | -250,000 GNF shown |
| 6 | Verify dialog shows new balance | 14,750,000 GNF (green text) |
| 7 | Verify Pay button enabled | Button clickable |
| 8 | Click Pay | Payment processed |
| 9 | Verify expense status | Changed to "paid" |
| 10 | Navigate to `/accounting/safe` | Safe page loads |
| 11 | Verify safe balance | Decreased to 14,750,000 GNF |
| 12 | Check SafeTransaction | Created with type: expense_payment, direction: out |

**Pass Criteria:**
- Expense status changes to "paid"
- Safe balance decreases by exact amount
- SafeTransaction audit record created

---

#### TC-EXP-004: Pay Expense with Insufficient Funds
**Priority:** Critical
**Preconditions:** Approved expense exists (100,000,000 GNF), safe balance < 100,000,000 GNF

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Note current safe balance | Record starting balance (e.g., 15,000,000 GNF) |
| 2 | Find approved expense (100M GNF) | "Mark as Paid" button visible |
| 3 | Click "Mark as Paid" | Confirmation dialog opens |
| 4 | Verify dialog shows current safe balance | 15,000,000 GNF displayed |
| 5 | Verify dialog shows deduction | -100,000,000 GNF shown |
| 6 | Verify dialog shows new balance | -85,000,000 GNF (RED text) |
| 7 | Verify RED alert banner | "Fonds insuffisants dans la caisse" displayed |
| 8 | Verify Pay button DISABLED | Button grayed out, not clickable |
| 9 | Close dialog | Dialog closes |
| 10 | Verify expense status unchanged | Still "approved" |
| 11 | Verify safe balance unchanged | Still 15,000,000 GNF |

**Pass Criteria:**
- Payment blocked when insufficient funds
- Clear visual feedback (red alert, disabled button)
- No changes to expense status or safe balance

---

#### TC-EXP-005: Reject Expense (Director)
**Priority:** Medium
**Preconditions:** Logged in as Director, pending expense exists

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Find pending expense | Reject button visible |
| 2 | Click "Reject" | Rejection dialog opens |
| 3 | Enter reason | Reason accepted |
| 4 | Confirm rejection | Expense rejected |
| 5 | Verify status | Changed to "rejected" |

**Pass Criteria:** Expense rejected with reason recorded

---

### 3.3 Treasury (Safe) Management

#### TC-TRS-001: View Safe Dashboard
**Priority:** High
**Preconditions:** SafeBalance initialized, transactions exist

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/accounting/safe` | Safe dashboard loads |
| 2 | Verify safe balance displayed | Large formatted amount (e.g., 15 000 000 GNF) |
| 3 | Verify status indicator | Color matches threshold (green for optimal) |
| 4 | Verify bank balance displayed | Bank amount shown |
| 5 | Verify today's summary | Money in, money out, net change, transaction count |
| 6 | Verify recent transactions | List of latest transactions |

**Pass Criteria:** All dashboard elements display correctly with accurate data

---

#### TC-TRS-002: Safe Balance Status Thresholds
**Priority:** High
**Preconditions:** Ability to adjust safe balance

| Status | Balance | Expected Color | Expected Label |
|--------|---------|----------------|----------------|
| Critical | < 5,000,000 GNF | Red | "Critique" |
| Warning | 5,000,000 - 10,000,000 GNF | Yellow/Orange | "Attention" |
| Optimal | 10,000,000 - 20,000,000 GNF | Green | "Optimal" |
| Excess | > 20,000,000 GNF | Blue | "Excédent" |

**Test Steps:**
1. Set safe balance to 3,000,000 GNF → Verify red/critical
2. Set safe balance to 7,000,000 GNF → Verify yellow/warning
3. Set safe balance to 15,000,000 GNF → Verify green/optimal
4. Set safe balance to 25,000,000 GNF → Verify blue/excess

**Pass Criteria:** Status indicator changes appropriately at each threshold

---

#### TC-TRS-003: Record Direct Payment to Safe
**Priority:** Medium
**Preconditions:** Logged in as Accountant/Director

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click "Record Payment" on safe dashboard | Dialog opens |
| 2 | Search and select student | Student selected |
| 3 | Enter amount | Amount accepted |
| 4 | Select payment type | Type selected |
| 5 | Submit | Payment recorded |
| 6 | Verify safe balance increased | Balance updated immediately |
| 7 | Verify SafeTransaction created | Transaction in list |

**Pass Criteria:** Direct payment increases safe balance with audit trail

---

#### TC-TRS-004: Record Direct Expense from Safe
**Priority:** Medium
**Preconditions:** Safe has sufficient funds

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click "Record Expense" on safe dashboard | Dialog opens |
| 2 | Select category | Category selected |
| 3 | Enter description and amount | Fields accepted |
| 4 | Enter vendor | Vendor accepted |
| 5 | Submit | Expense recorded |
| 6 | Verify safe balance decreased | Balance updated |
| 7 | Verify SafeTransaction created | Transaction in list |

**Pass Criteria:** Direct expense decreases safe balance with audit trail

---

### 3.4 Bank Transfer Operations

#### TC-BNK-001: Deposit to Bank
**Priority:** High
**Preconditions:** Safe balance > transfer amount

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Note safe balance (e.g., 15M) | Record starting |
| 2 | Note bank balance (e.g., 50M) | Record starting |
| 3 | Click "Bank Transfer" on safe dashboard | Dialog opens |
| 4 | Select "Deposit" tab | Deposit form shown |
| 5 | Enter amount: 5,000,000 GNF | Amount accepted |
| 6 | Enter bank name | Bank accepted |
| 7 | Enter bank reference | Reference accepted |
| 8 | Enter deposited by | Name accepted |
| 9 | Submit | Transfer processed |
| 10 | Verify safe balance | Decreased to 10M |
| 11 | Verify bank balance | Increased to 55M |
| 12 | Check BankTransfer record | Created with correct before/after |

**Pass Criteria:**
- Safe decreases, bank increases by exact amount
- BankTransfer and SafeTransaction records created
- Balances match before/after values in records

---

#### TC-BNK-002: Withdraw from Bank
**Priority:** High
**Preconditions:** Bank balance > withdrawal amount

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Note safe balance (e.g., 10M) | Record starting |
| 2 | Note bank balance (e.g., 55M) | Record starting |
| 3 | Click "Bank Transfer" | Dialog opens |
| 4 | Select "Withdrawal" tab | Withdrawal form shown |
| 5 | Enter amount: 10,000,000 GNF | Amount accepted |
| 6 | Enter bank details | Details accepted |
| 7 | Submit | Transfer processed |
| 8 | Verify safe balance | Increased to 20M |
| 9 | Verify bank balance | Decreased to 45M |

**Pass Criteria:** Bank decreases, safe increases with audit trail

---

#### TC-BNK-003: Insufficient Funds for Bank Deposit
**Priority:** High
**Preconditions:** Safe balance = 5M GNF

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open bank transfer dialog | Dialog opens |
| 2 | Select deposit, enter 10M GNF | Amount entered |
| 3 | Attempt submit | Error: Insufficient funds in safe |
| 4 | Verify safe balance unchanged | Still 5M |

**Pass Criteria:** Transfer blocked with clear error message

---

### 3.5 Daily Verification

#### TC-VRF-001: Verify Cash - Matching Count
**Priority:** High
**Preconditions:** Safe balance = 15,000,000 GNF

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click "Verify Cash" on safe dashboard | Dialog opens |
| 2 | Verify expected balance shown | 15,000,000 GNF displayed |
| 3 | Enter counted balance: 15,000,000 GNF | Amount accepted |
| 4 | Submit verification | Verification recorded |
| 5 | Verify status | "matched" |
| 6 | Check SafeBalance.lastVerifiedAt | Updated to current time |

**Pass Criteria:** Verification recorded with "matched" status

---

#### TC-VRF-002: Verify Cash - Discrepancy Found
**Priority:** High
**Preconditions:** Safe balance = 15,000,000 GNF

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open verify dialog | Expected: 15M shown |
| 2 | Enter counted: 14,500,000 GNF | Amount accepted |
| 3 | System calculates discrepancy | Shows -500,000 GNF |
| 4 | Explanation field appears | Required field shown |
| 5 | Enter explanation | Explanation accepted |
| 6 | Submit | Verification recorded |
| 7 | Verify status | "discrepancy" (awaiting review) |

**Pass Criteria:** Discrepancy recorded with explanation, awaiting director review

---

#### TC-VRF-003: Review Discrepancy (Director)
**Priority:** High
**Preconditions:** Verification with discrepancy exists, logged in as Director

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to verifications | Discrepancy visible |
| 2 | Review details | Shows expected, counted, discrepancy |
| 3 | Click "Review" | Review dialog opens |
| 4 | Option to adjust balance | Checkbox or option available |
| 5 | Mark as reviewed | Status changes to "reviewed" |
| 6 | If adjustment made | SafeBalance updated accordingly |

**Pass Criteria:** Director can review and optionally adjust balance

---

### 3.6 Accounting Dashboard

#### TC-ACC-001: View Accounting Dashboard
**Priority:** Medium
**Preconditions:** Payments and expenses exist in system

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/accounting` | Dashboard loads |
| 2 | Verify balance cards | 4 cards: confirmed payments, pending, expenses, margin |
| 3 | Verify safe overview section | Safe/bank balances with status |
| 4 | Click "Balance" tab | Payment breakdown by method, status, grade |
| 5 | Click "Transactions" tab | Filtered transaction list |
| 6 | Click "Review" tab | Pending items for approval |

**Pass Criteria:** All tabs functional with accurate data

---

#### TC-ACC-002: Safe Overview on Dashboard
**Priority:** High
**Preconditions:** SafeBalance exists

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | View accounting dashboard | Safe section visible |
| 2 | Verify safe balance | Matches `/accounting/safe` |
| 3 | Verify bank balance | Matches actual |
| 4 | Verify status color | Matches threshold |
| 5 | Verify today's count | Transaction count accurate |
| 6 | Click "Voir la Caisse" | Navigates to `/accounting/safe` |

**Pass Criteria:** Safe overview accurate and links work

---

## 4. Role-Based Access Control Tests

#### TC-RBAC-001: Director Permissions
**Preconditions:** Logged in as Director

| Action | Expected Result |
|--------|-----------------|
| Approve payment | ✅ Allowed |
| Reject payment | ✅ Allowed |
| Approve expense | ✅ Allowed |
| Pay expense | ✅ Allowed |
| Record bank transfer | ✅ Allowed |
| Review discrepancy | ✅ Allowed |
| Initialize safe balance | ✅ Allowed |

---

#### TC-RBAC-002: Accountant Permissions
**Preconditions:** Logged in as Accountant

| Action | Expected Result |
|--------|-----------------|
| Approve payment | ❌ Not allowed |
| Record cash deposit | ✅ Allowed |
| Pay approved expense | ✅ Allowed |
| Record bank transfer | ✅ Allowed |
| Verify cash | ✅ Allowed |
| Initialize safe balance | ❌ Not allowed |

---

#### TC-RBAC-003: Secretary Permissions
**Preconditions:** Logged in as Secretary

| Action | Expected Result |
|--------|-----------------|
| Create payment | ✅ Allowed |
| Approve payment | ❌ Not allowed |
| Create expense | ✅ Allowed |
| Approve expense | ❌ Not allowed |
| Access safe management | ❌ Limited or not allowed |

---

## 5. Edge Cases & Error Handling

#### TC-EDGE-001: Zero Amount Payment
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Try to submit payment with 0 GNF | Validation error displayed |

---

#### TC-EDGE-002: Negative Amount
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Try to enter -500,000 GNF | Input rejected or validation error |

---

#### TC-EDGE-003: Duplicate Receipt Number
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Create payment | Receipt number generated |
| 2 | Try to create with same receipt | Error: duplicate receipt number |

---

#### TC-EDGE-004: Session Timeout During Transaction
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Start payment process | Dialog open |
| 2 | Wait for session timeout | Session expires |
| 3 | Try to submit | Redirected to login |
| 4 | No partial transaction saved | Data integrity maintained |

---

#### TC-EDGE-005: Network Error During API Call
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Start expense payment | Dialog open |
| 2 | Disconnect network | Connection lost |
| 3 | Click Pay | Error message displayed |
| 4 | Safe balance unchanged | Transaction rolled back |

---

#### TC-EDGE-006: Concurrent Balance Updates
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | User A opens expense payment (safe: 10M) | Shows 10M |
| 2 | User B completes expense (8M) | Safe now 2M |
| 3 | User A tries to pay 5M expense | Blocked: insufficient funds |
| 4 | Error shows current balance | Shows actual 2M, not cached 10M |

**Pass Criteria:** Atomic transactions prevent overdraft

---

## 6. Performance & Concurrency Tests

#### TC-PERF-001: Page Load Performance
| Page | Target Load Time | Measurement |
|------|-----------------|-------------|
| `/accounting` | < 2s | ⬜ |
| `/accounting/payments` | < 2s | ⬜ |
| `/accounting/safe` | < 1.5s | ⬜ |
| `/expenses` | < 2s | ⬜ |

---

#### TC-PERF-002: Animation Performance
| Test | Expected Result |
|------|-----------------|
| Payments page animations | 60fps, no jank |
| Number count-up | Smooth progression |
| Staggered card reveal | Sequential without stutter |
| Hover interactions | Instant response |

---

#### TC-PERF-003: Large Dataset Pagination
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Load payments page with 1000+ records | Page loads < 3s |
| 2 | Verify pagination | Shows 10/20 per page |
| 3 | Navigate pages | Instant page change |
| 4 | Apply filters | Results update < 1s |

---

## 7. UI/UX Tests

#### TC-UI-001: Responsive Design
| Viewport | Page | Expected Result |
|----------|------|-----------------|
| Desktop (1920px) | All | Full layout |
| Tablet (768px) | All | Adapted layout |
| Mobile (375px) | All | Mobile-optimized |

---

#### TC-UI-002: Dark Mode
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Toggle to dark mode | All pages adapt |
| 2 | Verify colors | Readable, appropriate contrast |
| 3 | Verify animations | Work in dark mode |
| 4 | Verify status colors | Still distinguishable |

---

#### TC-UI-003: i18n French/English
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Switch to French | All text in French |
| 2 | Verify accounting terms | Correct translations |
| 3 | Verify number formatting | French format (15 000 000 GNF) |
| 4 | Switch to English | All text in English |

---

#### TC-UI-004: Animation Accessibility
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Enable "Reduce motion" in OS | Setting active |
| 2 | Load payments page | Animations reduced/disabled |
| 3 | Verify functionality intact | All features work |

---

## 8. API Integration Tests

#### TC-API-001: GET /api/treasury/balance
```bash
curl -X GET http://localhost:8000/api/treasury/balance \
  -H "Cookie: session=..."
```

**Expected Response:**
```json
{
  "safeBalance": 15000000,
  "bankBalance": 50000000,
  "status": "optimal",
  "today": {
    "in": 2500000,
    "out": 500000,
    "net": 2000000,
    "count": 5
  },
  "thresholds": {
    "min": 5000000,
    "max": 20000000
  }
}
```

---

#### TC-API-002: POST /api/payments/[id]/deposit
```bash
curl -X POST http://localhost:8000/api/payments/123/deposit \
  -H "Content-Type: application/json" \
  -H "Cookie: session=..." \
  -d '{
    "bankName": "BICIGUI",
    "bankReference": "DEP-2026-001",
    "depositedByName": "Amadou Diallo"
  }'
```

**Expected:**
- Status: 200
- CashDeposit record created
- BankTransfer record created
- SafeTransaction record created
- SafeBalance updated (safe -, bank +)

---

#### TC-API-003: POST /api/expenses/[id]/pay - Insufficient Funds
```bash
curl -X POST http://localhost:8000/api/expenses/456/pay \
  -H "Cookie: session=..."
```

**Expected (when safe < expense amount):**
```json
{
  "error": "Insufficient funds in safe",
  "currentBalance": 5000000,
  "requiredAmount": 100000000
}
```
Status: 400

---

## 9. Database Integrity Tests

#### TC-DB-001: SafeTransaction Audit Trail
| Verification | Query |
|--------------|-------|
| All payments have transactions | Count payments = count student_payment transactions |
| All expenses have transactions | Paid expenses = expense_payment transactions |
| Balance accuracy | Sum of in - out = current SafeBalance |

---

#### TC-DB-002: BankTransfer Balance Tracking
| Verification | Expected |
|--------------|----------|
| safeBalanceBefore + safeBalanceAfter | Match transaction impact |
| bankBalanceBefore + bankBalanceAfter | Match transaction impact |
| Sequential transfers | Before matches previous after |

---

#### TC-DB-003: Atomic Transactions
| Test | Expected |
|------|----------|
| Failed payment mid-transaction | All changes rolled back |
| Failed expense payment | Safe balance unchanged |
| Failed bank transfer | Both safe and bank unchanged |

---

## 10. Regression Tests

### Critical Path Checklist

Run after any code changes to accounting/treasury:

- [ ] Create cash payment → status: pending_deposit
- [ ] Deposit cash to bank → safe decreases, bank increases
- [ ] Approve payment → safe increases, status: confirmed
- [ ] Create expense → status: pending
- [ ] Approve expense → status: approved
- [ ] Pay expense (sufficient funds) → safe decreases
- [ ] Pay expense (insufficient) → blocked with alert
- [ ] Bank deposit → safe decreases, bank increases
- [ ] Bank withdrawal → safe increases, bank decreases
- [ ] Daily verification (match) → status: matched
- [ ] Daily verification (discrepancy) → status: discrepancy
- [ ] Safe balance thresholds → correct colors
- [ ] Navigation: old /treasury URLs redirect

---

## Test Execution Log

| Test ID | Date | Tester | Result | Notes |
|---------|------|--------|--------|-------|
| TC-PAY-001 | | | ⬜ | |
| TC-PAY-002 | | | ⬜ | |
| TC-PAY-003 | | | ⬜ | |
| TC-PAY-004 | | | ⬜ | |
| TC-PAY-005 | | | ⬜ | |
| TC-PAY-006 | | | ⬜ | |
| TC-EXP-001 | | | ⬜ | |
| TC-EXP-002 | | | ⬜ | |
| TC-EXP-003 | | | ⬜ | |
| TC-EXP-004 | | | ⬜ | |
| TC-EXP-005 | | | ⬜ | |
| TC-TRS-001 | | | ⬜ | |
| TC-TRS-002 | | | ⬜ | |
| TC-TRS-003 | | | ⬜ | |
| TC-TRS-004 | | | ⬜ | |
| TC-BNK-001 | | | ⬜ | |
| TC-BNK-002 | | | ⬜ | |
| TC-BNK-003 | | | ⬜ | |
| TC-VRF-001 | | | ⬜ | |
| TC-VRF-002 | | | ⬜ | |
| TC-VRF-003 | | | ⬜ | |
| TC-ACC-001 | | | ⬜ | |
| TC-ACC-002 | | | ⬜ | |

---

## Appendix A: Test Data Setup

### Initialize Safe Balance (API)
```bash
curl -X PUT http://localhost:8000/api/treasury/balance \
  -H "Content-Type: application/json" \
  -H "Cookie: session=..." \
  -d '{
    "safeBalance": 15000000,
    "bankBalance": 50000000
  }'
```

### Create Test Student Payment
```bash
curl -X POST http://localhost:8000/api/payments \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "...",
    "amount": 500000,
    "method": "cash",
    "documentReference": "TEST-001"
  }'
```

---

## Appendix B: Status Reference

### Payment Statuses
| Status | Description | Next Actions |
|--------|-------------|--------------|
| pending_deposit | Cash awaiting bank deposit | Deposit |
| deposited | At bank, awaiting approval | Approve/Reject |
| pending_review | Needs director review | Approve/Reject |
| confirmed | Approved and complete | None |
| rejected | Rejected by director | None |

### Expense Statuses
| Status | Description | Next Actions |
|--------|-------------|--------------|
| pending | Awaiting approval | Approve/Reject |
| approved | Ready to pay | Pay |
| paid | Payment complete | None |
| rejected | Rejected | None |

### Safe Status Thresholds
| Status | Range (GNF) | Color |
|--------|-------------|-------|
| Critical | < 5,000,000 | Red |
| Warning | 5M - 10M | Yellow |
| Optimal | 10M - 20M | Green |
| Excess | > 20M | Blue |

---

**Document Version:** 1.0
**Last Updated:** 2026-01-10
**Author:** Claude Code (Opus 4.5)
