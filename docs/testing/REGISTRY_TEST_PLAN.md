# Registry-Based Cash Management - Testing Strategy

**Document Status**: Phase 0 - Planning
**Last Updated**: 2026-01-11
**Feature**: Registry-Based Cash Management

## Overview

This document outlines the comprehensive testing strategy for the registry-based cash management system. It covers unit tests, integration tests, end-to-end tests, manual testing procedures, and acceptance criteria.

## Testing Scope

### In Scope

- Registry balance tracking and updates
- Safe balance tracking and updates
- Daily opening workflow
- Daily closing workflow
- Payment recording (cash to registry)
- Expense payment (cash from registry)
- Safe ↔ Registry transfers
- Balance calculations and integrity
- Transaction audit trail
- Payment Wizard UI
- Expense Wizard UI
- Treasury dashboard
- PDF receipt generation
- PDF expense voucher generation
- API endpoints
- Database schema changes
- Data migration
- Error handling and validation
- Permission/authorization
- i18n (English and French)

### Out of Scope

- Bank transfers (existing functionality, not modified)
- Mobile money operations (existing functionality, not modified)
- User authentication (not modified)
- Other unrelated features

## Testing Levels

### 1. Unit Tests

**Objective**: Test individual functions and components in isolation

#### Backend Unit Tests

**Location**: `app/ui/__tests__/unit/`

##### Balance Calculations

```typescript
// __tests__/unit/treasury/balance-calculations.test.ts
describe("Balance Calculations", () => {
  describe("calculateRegistryBalance", () => {
    it("should add payment amounts to registry", () => {
      const initial = 2000000
      const payment = 500000
      const result = calculateRegistryBalance(initial, payment, "in")
      expect(result).toBe(2500000)
    })

    it("should subtract expense amounts from registry", () => {
      const initial = 2000000
      const expense = 300000
      const result = calculateRegistryBalance(initial, expense, "out")
      expect(result).toBe(1700000)
    })

    it("should handle zero amounts", () => {
      const initial = 2000000
      const result = calculateRegistryBalance(initial, 0, "in")
      expect(result).toBe(2000000)
    })
  })

  describe("calculateDailyOpeningBalances", () => {
    it("should transfer float from safe to registry", () => {
      const treasury = { safeBalance: 15000000, registryBalance: 0 }
      const floatAmount = 2000000
      const result = calculateDailyOpeningBalances(treasury, floatAmount)
      expect(result.newSafeBalance).toBe(13000000)
      expect(result.newRegistryBalance).toBe(2000000)
    })

    it("should detect discrepancy in counted safe", () => {
      const treasury = { safeBalance: 15000000 }
      const countedSafe = 14900000
      const floatAmount = 2000000
      const result = calculateDailyOpeningBalances(treasury, floatAmount, countedSafe)
      expect(result.discrepancy).toBe(-100000) // 100k short
    })

    it("should throw if insufficient safe balance", () => {
      const treasury = { safeBalance: 1000000, registryBalance: 0 }
      const floatAmount = 2000000
      expect(() => calculateDailyOpeningBalances(treasury, floatAmount))
        .toThrow("Insufficient safe balance")
    })
  })

  describe("calculateDailyClosingBalances", () => {
    it("should transfer all registry to safe", () => {
      const treasury = { registryBalance: 2500000, safeBalance: 13000000 }
      const countedRegistry = 2500000
      const result = calculateDailyClosingBalances(treasury, countedRegistry)
      expect(result.newRegistryBalance).toBe(0)
      expect(result.newSafeBalance).toBe(15500000)
      expect(result.discrepancy).toBe(0)
    })

    it("should detect discrepancy in counted registry", () => {
      const treasury = { registryBalance: 2500000, safeBalance: 13000000 }
      const countedRegistry = 2450000 // 50k short
      const result = calculateDailyClosingBalances(treasury, countedRegistry)
      expect(result.discrepancy).toBe(-50000)
    })
  })
})
```

##### Payment Processing

```typescript
// __tests__/unit/payments/payment-processing.test.ts
describe("Payment Processing", () => {
  it("should update registry balance for cash payment", async () => {
    const payment = { amount: 500000, method: "cash" }
    const treasury = { registryBalance: 2000000 }
    const result = await processPayment(payment, treasury)
    expect(result.newRegistryBalance).toBe(2500000)
    expect(result.transaction.type).toBe("student_payment")
    expect(result.transaction.direction).toBe("in")
  })

  it("should not update registry for non-cash payment", async () => {
    const payment = { amount: 500000, method: "bank_transfer" }
    const treasury = { registryBalance: 2000000 }
    const result = await processPayment(payment, treasury)
    expect(result.newRegistryBalance).toBe(2000000)
    expect(result.newBankBalance).toBe(treasury.bankBalance + 500000)
  })

  it("should generate unique receipt number", async () => {
    const method = "cash"
    const receipt1 = await generateReceiptNumber(method)
    const receipt2 = await generateReceiptNumber(method)
    expect(receipt1).not.toBe(receipt2)
    expect(receipt1).toMatch(/GSPN-\d{4}-CASH-\d{5}/)
  })
})
```

##### Expense Processing

```typescript
// __tests__/unit/expenses/expense-processing.test.ts
describe("Expense Processing", () => {
  it("should deduct from registry for cash expense", async () => {
    const expense = { amount: 300000, method: "cash" }
    const treasury = { registryBalance: 2000000 }
    const result = await processExpensePayment(expense, treasury)
    expect(result.newRegistryBalance).toBe(1700000)
  })

  it("should throw if insufficient registry balance", async () => {
    const expense = { amount: 3000000, method: "cash" }
    const treasury = { registryBalance: 2000000 }
    await expect(processExpensePayment(expense, treasury))
      .rejects.toThrow("Insufficient registry balance")
  })

  it("should create expense voucher number", () => {
    const voucher1 = generateExpenseVoucherNumber()
    const voucher2 = generateExpenseVoucherNumber()
    expect(voucher1).not.toBe(voucher2)
    expect(voucher1).toMatch(/EXP-\d{4}-\d{5}/)
  })
})
```

#### Frontend Unit Tests

**Location**: `app/ui/__tests__/unit/components/`

##### Payment Wizard State

```typescript
// __tests__/unit/components/payments/wizard-state.test.tsx
describe("Payment Wizard State", () => {
  it("should initialize with empty state", () => {
    const { result } = renderHook(() => usePaymentWizard())
    expect(result.current.state.currentStep).toBe(1)
    expect(result.current.state.data).toEqual({})
  })

  it("should advance to next step", () => {
    const { result } = renderHook(() => usePaymentWizard())
    act(() => result.current.nextStep())
    expect(result.current.state.currentStep).toBe(2)
  })

  it("should update wizard data", () => {
    const { result } = renderHook(() => usePaymentWizard())
    act(() => result.current.updateData({ studentId: "123", amount: 500000 }))
    expect(result.current.state.data.studentId).toBe("123")
    expect(result.current.state.data.amount).toBe(500000)
  })

  it("should validate step 1 (student selection)", () => {
    const { result } = renderHook(() => usePaymentWizard())
    expect(result.current.canProceed(1)).toBe(false)
    act(() => result.current.updateData({ studentId: "123" }))
    expect(result.current.canProceed(1)).toBe(true)
  })

  it("should validate step 2 (payment details)", () => {
    const { result } = renderHook(() => usePaymentWizard())
    act(() => {
      result.current.updateData({
        studentId: "123",
        paymentType: "tuition",
        paymentMethod: "cash",
        amount: 500000,
        receiptNumber: "GSPN-2026-CASH-00001",
      })
    })
    expect(result.current.canProceed(2)).toBe(true)
  })
})
```

##### Tuition Progress Calculation

```typescript
// __tests__/unit/components/payments/tuition-progress.test.tsx
describe("Tuition Progress Calculation", () => {
  it("should calculate percent paid", () => {
    const totalTuition = 5000000
    const totalPaid = 2500000
    const percent = calculatePercentPaid(totalPaid, totalTuition)
    expect(percent).toBe(50)
  })

  it("should calculate covered months", () => {
    const schedules = [
      { months: ["Sep", "Oct"], amount: 1000000 },
      { months: ["Nov", "Dec"], amount: 1000000 },
      { months: ["Jan", "Feb"], amount: 1000000 },
    ]
    const paymentAmount = 1500000
    const covered = calculateCoveredMonths(schedules, paymentAmount)
    expect(covered).toContain("Sep")
    expect(covered).toContain("Oct")
    expect(covered).toContain("Nov")
  })

  it("should calculate remaining balance", () => {
    const totalTuition = 5000000
    const totalPaid = 2500000
    const remaining = calculateRemainingBalance(totalPaid, totalTuition)
    expect(remaining).toBe(2500000)
  })
})
```

### 2. Integration Tests

**Objective**: Test interactions between components and services

**Location**: `app/ui/__tests__/integration/`

#### API Integration Tests

```typescript
// __tests__/integration/api/treasury.test.ts
describe("Treasury API Integration", () => {
  beforeEach(async () => {
    await setupTestDatabase()
  })

  afterEach(async () => {
    await cleanupTestDatabase()
  })

  describe("Daily Opening", () => {
    it("should execute daily opening successfully", async () => {
      const response = await fetch("/api/treasury/daily-opening", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          countedSafeBalance: 15000000,
          floatAmount: 2000000,
          notes: "Test opening",
        }),
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.registryBalance).toBe(2000000)
      expect(data.safeBalance).toBe(13000000)
    })

    it("should prevent multiple openings on same day", async () => {
      // First opening
      await fetch("/api/treasury/daily-opening", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ countedSafeBalance: 15000000, floatAmount: 2000000 }),
      })

      // Second opening (should fail)
      const response = await fetch("/api/treasury/daily-opening", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ countedSafeBalance: 15000000, floatAmount: 2000000 }),
      })

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toContain("already opened")
    })
  })

  describe("Payment Recording", () => {
    it("should record cash payment to registry", async () => {
      // Setup: open registry
      await dailyOpening(2000000)

      const student = await createTestStudent()
      const payment = {
        studentId: student.id,
        type: "tuition",
        method: "cash",
        amount: 500000,
        receiptNumber: "TEST-CASH-001",
      }

      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payment),
      })

      expect(response.status).toBe(201)
      const data = await response.json()
      expect(data.id).toBeDefined()

      // Verify registry balance updated
      const treasury = await getTreasuryBalance()
      expect(treasury.registryBalance).toBe(2500000)
    })
  })

  describe("Expense Payment", () => {
    it("should pay expense from registry", async () => {
      await dailyOpening(2000000)

      const expense = await createTestExpense({ amount: 300000, method: "cash" })
      const response = await fetch(`/api/expenses/${expense.id}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method: "cash" }),
      })

      expect(response.status).toBe(200)

      const treasury = await getTreasuryBalance()
      expect(treasury.registryBalance).toBe(1700000)
    })
  })

  describe("Daily Closing", () => {
    it("should transfer registry to safe", async () => {
      await dailyOpening(2000000)
      await recordPayment({ amount: 500000, method: "cash" })

      const response = await fetch("/api/treasury/daily-closing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          countedRegistryBalance: 2500000,
          notes: "Test closing",
        }),
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.registryBalance).toBe(0)
      expect(data.safeBalance).toBe(15500000)
    })
  })
})
```

#### Wizard Integration Tests

```typescript
// __tests__/integration/wizards/payment-wizard.test.tsx
describe("Payment Wizard Integration", () => {
  it("should complete full payment flow", async () => {
    const student = await createTestStudent()
    render(<PaymentWizard studentId={student.id} />)

    // Step 1: Student selection (pre-filled)
    expect(screen.getByText(student.fullName)).toBeInTheDocument()
    fireEvent.click(screen.getByText("Next"))

    // Step 2: Payment details
    await waitFor(() => expect(screen.getByText("Payment Details")).toBeInTheDocument())

    fireEvent.click(screen.getByLabelText("Tuition Payment"))
    fireEvent.click(screen.getByLabelText("Cash Payment"))
    fireEvent.change(screen.getByLabelText("Amount"), { target: { value: "500000" } })

    await waitFor(() => expect(screen.getByDisplayValue(/GSPN-.*-CASH-.*/)).toBeInTheDocument())

    fireEvent.click(screen.getByText("Next"))

    // Step 3: Review
    await waitFor(() => expect(screen.getByText("Review Payment Details")).toBeInTheDocument())
    expect(screen.getByText("500 000 GNF")).toBeInTheDocument()

    fireEvent.click(screen.getByText("Record Payment"))

    // Step 4: Success
    await waitFor(() => expect(screen.getByText("Payment Recorded Successfully!")).toBeInTheDocument())
    expect(screen.getByText("Download & Print Receipt")).toBeInTheDocument()
  })
})
```

### 3. End-to-End Tests

**Objective**: Test complete user workflows in production-like environment

**Framework**: Playwright
**Location**: `app/ui/__tests__/e2e/`

```typescript
// __tests__/e2e/daily-operations.spec.ts
import { test, expect } from "@playwright/test"

test.describe("Daily Treasury Operations", () => {
  test("complete daily cycle: opening -> payments -> expenses -> closing", async ({ page }) => {
    await page.goto("http://localhost:8000")

    // Login
    await page.fill('[name="email"]', "accountant@gspn.school")
    await page.fill('[name="password"]', "password")
    await page.click('button:has-text("Sign In")')

    // Navigate to Treasury
    await page.click('a:has-text("Treasury")')

    // Daily Opening
    await page.click('button:has-text("Daily Opening")')
    await page.fill('[name="countedSafeBalance"]', "15000000")
    await page.fill('[name="floatAmount"]', "2000000")
    await page.click('button:has-text("Open Registry")')

    await expect(page.locator('text=Registry Opened Successfully')).toBeVisible()
    await expect(page.locator('text=2 000 000 GNF')).toBeVisible() // Registry balance

    // Record Payment
    await page.click('a:has-text("Payments")')
    await page.click('button:has-text("Record Payment")')

    // Search for student
    await page.fill('[placeholder*="Search"]', "John Doe")
    await page.click('text=John Doe')
    await page.click('button:has-text("Next")')

    // Enter payment details
    await page.click('label:has-text("Tuition Payment")')
    await page.click('label:has-text("Cash")')
    await page.fill('[name="amount"]', "500000")
    await page.click('button:has-text("Next")')

    // Review and submit
    await page.click('button:has-text("Record Payment")')
    await expect(page.locator('text=Payment Recorded Successfully')).toBeVisible()

    // Download receipt
    await page.click('button:has-text("Download & Print Receipt")')
    // Verify PDF download

    // Record Expense
    await page.click('a:has-text("Expenses")')
    await page.click('button:has-text("Record Expense")')

    await page.click('label:has-text("Utilities")')
    await page.fill('[name="vendorName"]', "Electric Company")
    await page.click('button:has-text("Next")')

    await page.fill('[name="amount"]', "300000")
    await page.fill('[name="description"]', "Monthly electricity bill")
    await page.click('label:has-text("Cash from Registry")')
    await page.click('button:has-text("Next")')

    await page.click('button:has-text("Skip")') // Skip receipt upload
    await page.click('button:has-text("Next")')

    await page.click('button:has-text("Record Expense")')
    await expect(page.locator('text=Expense Recorded Successfully')).toBeVisible()

    // Daily Closing
    await page.click('a:has-text("Treasury")')
    await page.click('button:has-text("Daily Closing")')

    await page.fill('[name="countedRegistryBalance"]', "2200000") // 2M + 500k - 300k
    await page.click('button:has-text("Close Registry")')

    await expect(page.locator('text=Registry Closed Successfully')).toBeVisible()
    await expect(page.locator('text=0 GNF')).toBeVisible() // Registry balance = 0
  })
})

test.describe("Payment Wizard", () => {
  test("record tuition payment with receipt download", async ({ page }) => {
    await loginAsSecretary(page)

    await page.goto("http://localhost:8000/payments/new")

    // Search student
    await page.fill('[placeholder*="Search"]', "ST-2026-001")
    await page.click('[data-testid="student-result"]')

    // Fill payment
    await page.click('label:has-text("Tuition")')
    await page.click('label:has-text("Cash")')
    await page.fill('[name="amount"]', "1000000")

    // Verify progress preview updates
    await expect(page.locator('text=20%')).toBeVisible() // Percent paid
    await expect(page.locator('[data-covered="Sep"]')).toBeVisible()

    await page.click('button:has-text("Next")')
    await page.click('button:has-text("Record Payment")')

    // Download PDF
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('button:has-text("Download & Print Receipt")')
    ])

    expect(download.suggestedFilename()).toMatch(/receipt-.*\.pdf/)
  })
})
```

### 4. Manual Testing

#### Test Cases

##### TC-001: Daily Opening

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Login as Director/Accountant | Dashboard visible |
| 2 | Navigate to Treasury | Treasury page displays |
| 3 | Click "Daily Opening" | Opening form displays |
| 4 | Enter counted safe balance: 15,000,000 | Field accepts input |
| 5 | Enter float amount: 2,000,000 | Field accepts input |
| 6 | Add notes: "Morning opening" | Notes saved |
| 7 | Click "Open Registry" | Success message appears |
| 8 | Verify registry balance | Shows 2,000,000 GNF |
| 9 | Verify safe balance | Shows 13,000,000 GNF |
| 10 | Attempt second opening | Error: already opened today |

**Pass Criteria**: All steps complete without errors, balances accurate

##### TC-002: Record Cash Payment

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Navigate to Payments | Payments page displays |
| 2 | Click "Record Payment" | Wizard opens |
| 3 | Search for student "John Doe" | Results show matching students |
| 4 | Select student | Student details display |
| 5 | Click "Next" | Payment details step shows |
| 6 | Select "Tuition Payment" | Tuition selected |
| 7 | View progress card | Shows current tuition status |
| 8 | Select "Cash" method | Cash option highlighted |
| 9 | Enter amount: 500,000 | Amount accepted |
| 10 | Verify receipt number auto-generated | Receipt# shows (GSPN-2026-CASH-XXXXX) |
| 11 | Verify progress preview updates | New percent/months show |
| 12 | Click "Next" | Review step shows |
| 13 | Verify all details | Details match inputs |
| 14 | Click "Record Payment" | Processing indicator shows |
| 15 | Wait for success | Success screen appears |
| 16 | Verify updated progress | Progress card shows new status |
| 17 | Click "Download Receipt" | PDF downloads |
| 18 | Open PDF | Receipt contains correct info |

**Pass Criteria**: Payment recorded, registry balance increased by 500,000, PDF valid

##### TC-003: Record Expense

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Navigate to Expenses | Expenses page displays |
| 2 | Click "Record Expense" | Wizard opens |
| 3 | Select "Utilities" category | Utilities selected |
| 4 | Select existing vendor "Electric Co" | Vendor details populate |
| 5 | Click "Next" | Details step shows |
| 6 | Enter amount: 300,000 | Amount accepted |
| 7 | Enter description | Description saved |
| 8 | Select "Cash from Registry" | Cash option highlighted |
| 9 | Verify available balance shown | Shows current registry balance |
| 10 | Click "Next" | Receipt upload step shows |
| 11 | Upload invoice PDF | File uploaded successfully |
| 12 | Click "Next" | Review step shows |
| 13 | Verify balance impact | Shows before/after balances |
| 14 | Click "Record Expense" | Payment processes |
| 15 | Verify success | Success screen appears |
| 16 | Verify updated balance | Registry reduced by 300,000 |
| 17 | Download voucher | PDF downloads |

**Pass Criteria**: Expense paid, registry balance decreased by 300,000, voucher valid

##### TC-004: Daily Closing

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Navigate to Treasury | Treasury page displays |
| 2 | Click "Daily Closing" | Closing form displays |
| 3 | Enter counted registry: 2,200,000 | Field accepts input |
| 4 | Verify expected balance shown | Matches calculated balance |
| 5 | Add notes: "Evening deposit" | Notes saved |
| 6 | Click "Close Registry" | Success message appears |
| 7 | Verify discrepancy | Shows 0 or actual difference |
| 8 | Verify registry balance | Shows 0 GNF |
| 9 | Verify safe balance | Increased by deposited amount |
| 10 | Attempt second closing | Error: already closed today |

**Pass Criteria**: Registry closed, all cash transferred to safe

#### Browser Compatibility Testing

Test on:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile Safari (iOS)
- Mobile Chrome (Android)

#### Accessibility Testing

- Keyboard navigation (Tab, Enter, Escape)
- Screen reader (NVDA, JAWS, VoiceOver)
- Color contrast (WCAG AA compliance)
- Focus indicators visible
- Form labels properly associated

### 5. Performance Testing

#### Load Tests

```typescript
// k6 load test script
import http from "k6/http"
import { check, sleep } from "k6"

export let options = {
  stages: [
    { duration: "1m", target: 10 }, // Ramp up to 10 users
    { duration: "5m", target: 10 }, // Stay at 10 users
    { duration: "1m", target: 0 },  // Ramp down
  ],
}

export default function () {
  // Record payment
  let payload = JSON.stringify({
    studentId: "test-student-123",
    type: "tuition",
    method: "cash",
    amount: 500000,
    receiptNumber: `TEST-${Date.now()}`,
  })

  let res = http.post("http://localhost:8000/api/payments", payload, {
    headers: { "Content-Type": "application/json" },
  })

  check(res, {
    "status is 201": (r) => r.status === 201,
    "response time < 500ms": (r) => r.timings.duration < 500,
  })

  sleep(1)
}
```

**Performance Targets**:
- API response time: < 500ms (p95)
- Page load time: < 2s
- PDF generation: < 3s
- Concurrent users: 20+ without degradation

### 6. Security Testing

#### Authentication Tests

- Verify unauthenticated users cannot access treasury endpoints
- Verify session expiration handled correctly
- Verify CSRF protection on state-changing operations

#### Authorization Tests

- Secretary can record payments (read-only treasury access)
- Accountant can perform daily opening/closing
- Director has full treasury access
- Teachers cannot access treasury features

#### Input Validation Tests

```typescript
describe("Input Validation", () => {
  it("should reject negative payment amounts", async () => {
    const response = await fetch("/api/payments", {
      method: "POST",
      body: JSON.stringify({ amount: -500000, method: "cash" }),
    })
    expect(response.status).toBe(400)
  })

  it("should reject SQL injection attempts", async () => {
    const response = await fetch("/api/payments", {
      method: "POST",
      body: JSON.stringify({
        studentId: "'; DROP TABLE Students; --",
        amount: 500000,
      }),
    })
    expect(response.status).toBe(400)
  })

  it("should sanitize XSS in notes field", async () => {
    const response = await fetch("/api/payments", {
      method: "POST",
      body: JSON.stringify({
        notes: '<script>alert("XSS")</script>',
      }),
    })
    const data = await response.json()
    expect(data.notes).not.toContain("<script>")
  })
})
```

### 7. Data Migration Testing

#### Pre-Migration Validation

```sql
-- Test on copy of production database
-- Verify balances sum correctly
SELECT
  "safeBalance" + "bankBalance" + "mobileMoneyBalance" as total_balance,
  (SELECT SUM(amount) FROM "SafeTransaction" WHERE direction = 'in') as total_in,
  (SELECT SUM(amount) FROM "SafeTransaction" WHERE direction = 'out') as total_out
FROM "SafeBalance";
```

#### Post-Migration Validation

```sql
-- Verify new columns exist
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'TreasuryBalance'
  AND column_name IN ('registryBalance', 'registryFloatAmount');

-- Verify total cash balance preserved
SELECT
  ("registryBalance" + "safeBalance") as new_total_cash
FROM "TreasuryBalance";
-- Should match pre-migration safeBalance

-- Verify all transactions have registryBalanceAfter
SELECT COUNT(*) FROM "SafeTransaction"
WHERE "registryBalanceAfter" IS NULL;
-- Should be 0
```

## Test Data Management

### Test Database Setup

```typescript
// test-helpers/setup-database.ts
export async function setupTestDatabase() {
  await prisma.$executeRaw`TRUNCATE TABLE "Payment", "Expense", "SafeTransaction", "TreasuryBalance" CASCADE`

  // Create test treasury balance
  await prisma.treasuryBalance.create({
    data: {
      registryBalance: 0,
      safeBalance: 15000000,
      bankBalance: 5000000,
      mobileMoneyBalance: 1000000,
      registryFloatAmount: 2000000,
    },
  })

  // Create test students
  await createTestStudents(10)

  // Create test school year and grades
  await createTestSchoolYear()
}
```

### Test Fixtures

```typescript
// fixtures/students.ts
export const testStudents = [
  {
    studentNumber: "ST-2026-001",
    firstName: "John",
    lastName: "Doe",
    gradeName: "CE1",
    tuitionFee: 5000000,
  },
  // ... more test students
]

// fixtures/payments.ts
export const testPayments = [
  {
    amount: 500000,
    method: "cash",
    type: "tuition",
    receiptNumber: "TEST-CASH-001",
  },
  // ... more test payments
]
```

## Regression Testing

### Critical Paths

1. Daily opening → payment → expense → daily closing
2. Payment wizard full flow (tuition)
3. Payment wizard full flow (activity)
4. Expense wizard full flow
5. Balance calculations remain accurate
6. PDF generation works correctly

### Regression Test Suite

Run before each release:
- All unit tests
- All integration tests
- Critical E2E paths
- Manual smoke tests

## Acceptance Criteria

### Functional Acceptance

- [ ] Daily opening creates transaction and updates balances correctly
- [ ] Daily closing transfers registry to safe correctly
- [ ] Cash payments update registry balance (not safe)
- [ ] Cash expenses deduct from registry balance (not safe)
- [ ] Bank/mobile money transactions unchanged
- [ ] Payment wizard completes successfully
- [ ] Expense wizard completes successfully
- [ ] PDF receipts generate correctly
- [ ] PDF vouchers generate correctly
- [ ] Balance integrity maintained across all operations
- [ ] Transaction audit trail complete

### Non-Functional Acceptance

- [ ] All pages load in < 2 seconds
- [ ] API responses in < 500ms (p95)
- [ ] PDF generation in < 3 seconds
- [ ] System handles 20+ concurrent users
- [ ] No console errors in browser
- [ ] No server errors in logs
- [ ] Mobile responsive design works
- [ ] Accessibility WCAG AA compliant
- [ ] i18n works in English and French

### Migration Acceptance

- [ ] Migration script completes without errors
- [ ] Total balance preserved (safe + registry = old safe)
- [ ] All transactions have registryBalanceAfter
- [ ] No data loss
- [ ] Rollback tested and works
- [ ] Production backup created

## Test Execution Schedule

### Phase 1: Unit Tests (Week 1)
- Day 1-2: Backend unit tests
- Day 3-4: Frontend unit tests
- Day 5: Fix failures

### Phase 2: Integration Tests (Week 2)
- Day 1-3: API integration tests
- Day 4-5: Wizard integration tests

### Phase 3: E2E Tests (Week 3)
- Day 1-2: Critical path E2E
- Day 3-4: Full flow E2E
- Day 5: Browser compatibility

### Phase 4: Manual & Performance (Week 4)
- Day 1-2: Manual test cases
- Day 3: Performance testing
- Day 4: Security testing
- Day 5: Regression suite

### Phase 5: Migration Testing (Week 5)
- Day 1-2: Migration on test database
- Day 3-4: Migration validation
- Day 5: Rollback testing

## Bug Tracking

### Severity Levels

- **Critical**: System unusable, data loss, security breach
- **High**: Major feature broken, incorrect calculations
- **Medium**: Feature partially works, workaround available
- **Low**: Cosmetic issues, minor inconvenience

### Bug Report Template

```markdown
**Title**: [Component] Brief description

**Severity**: Critical/High/Medium/Low

**Environment**: Production/Staging/Local

**Steps to Reproduce**:
1. Step one
2. Step two
3. Step three

**Expected Result**: What should happen

**Actual Result**: What actually happens

**Screenshots**: [Attach screenshots]

**Logs**: [Attach relevant logs]

**Browser**: Chrome 120.0.6099.109 (if applicable)
```

## Test Reports

### Daily Test Report Template

```markdown
# Test Report - [Date]

## Summary
- Tests Run: X
- Tests Passed: Y
- Tests Failed: Z
- Pass Rate: Y/X%

## Failed Tests
1. Test Name - Severity - Assigned To
2. ...

## Blockers
- Issue description - Impact

## Notes
- Any additional observations
```

## Sign-Off Criteria

Testing phase complete when:

1. ✅ All unit tests passing (100%)
2. ✅ All integration tests passing (100%)
3. ✅ Critical E2E paths passing (100%)
4. ✅ No Critical or High severity bugs open
5. ✅ Performance targets met
6. ✅ Security tests passing
7. ✅ Migration tested successfully
8. ✅ Manual test cases executed
9. ✅ Regression suite passing
10. ✅ Sign-off from Product Owner

**Test Lead Sign-Off**: _______________
**Date**: _______________

**Product Owner Sign-Off**: _______________
**Date**: _______________
