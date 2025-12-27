# Payment Calculations

Documentation for payment schedule calculations in the enrollment system.

---

## Overview

The GSPN school uses a **3-schedule payment system** for annual tuition. The school year runs September through June, covering **9 school months**.

---

## Payment Schedules

### Schedule Distribution

Each schedule covers 3 months of tuition:

| Schedule | Months Covered | Due Date | Percentage |
|----------|----------------|----------|------------|
| 1 | September, October, May | October 15 | 33.33% |
| 2 | November, December, January | December 15 | 33.33% |
| 3 | February, March, April | March 15 | 33.34% |

**Note:** May is included in Schedule 1 to balance the payment amounts (3 months each).

### Calculation Formula

```typescript
function calculatePaymentSchedules(totalFee: number): PaymentSchedule[] {
  // Divide by 9 months, then multiply by 3 for each schedule
  const monthlyAmount = totalFee / 9
  const scheduleAmount = monthlyAmount * 3

  // Round to avoid decimal GNF
  const schedule1 = Math.floor(scheduleAmount)
  const schedule2 = Math.floor(scheduleAmount)
  const schedule3 = totalFee - schedule1 - schedule2  // Remainder

  return [
    { scheduleNumber: 1, amount: schedule1 },
    { scheduleNumber: 2, amount: schedule2 },
    { scheduleNumber: 3, amount: schedule3 },
  ]
}
```

### Example Calculation

For a tuition fee of **1,000,000 GNF**:

```
Monthly = 1,000,000 / 9 = 111,111.11 GNF
Schedule = 111,111.11 × 3 = 333,333.33 GNF

Schedule 1: 333,333 GNF
Schedule 2: 333,333 GNF
Schedule 3: 333,334 GNF (includes rounding remainder)
─────────────────────────
Total:    1,000,000 GNF
```

---

## Payment Coverage Calculation

When a payment is made, calculate how many months it covers:

```typescript
function calculatePaymentCoverage(
  paymentAmount: number,
  totalFee: number
): { monthsCovered: number; percentPaid: number } {
  const monthlyAmount = totalFee / 9
  const monthsCovered = Math.floor(paymentAmount / monthlyAmount)
  const percentPaid = (paymentAmount / totalFee) * 100

  return {
    monthsCovered: Math.min(monthsCovered, 9),
    percentPaid: Math.round(percentPaid * 100) / 100,
  }
}
```

### Example

```
Payment: 333,333 GNF
Total Fee: 1,000,000 GNF

Months Covered: floor(333,333 / 111,111) = 3 months
Percent Paid: (333,333 / 1,000,000) × 100 = 33.33%
```

---

## Schedule Due Dates

Due dates are calculated relative to the school year:

```typescript
function calculateDueDates(schoolYearStart: Date): Date[] {
  const year = schoolYearStart.getFullYear()

  return [
    new Date(year, 9, 15),      // Schedule 1: October 15
    new Date(year, 11, 15),     // Schedule 2: December 15
    new Date(year + 1, 2, 15),  // Schedule 3: March 15
  ]
}
```

---

## Fee Adjustments

Tuition can be adjusted for various reasons:

| Reason | Typical Adjustment |
|--------|-------------------|
| Sibling discount | 5-15% off |
| Staff child discount | 25-50% off |
| Scholarship | 50-100% off |
| Financial hardship | Varies |

### Adjustment Workflow

1. Secretary enters adjusted amount + reason
2. Enrollment status changes to `review_required`
3. Director reviews and approves/rejects
4. If approved, new fee becomes effective
5. Payment schedules are calculated on effective fee

```typescript
const effectiveFee = enrollment.adjustedTuitionFee ?? enrollment.originalTuitionFee
```

---

## Code Location

Payment calculation functions are in:

```
app/ui/lib/enrollment/calculations.ts
```

### Exported Functions

```typescript
export function calculatePaymentSchedules(
  totalFee: number,
  schoolYearStart: Date
): PaymentScheduleData[]

export function calculatePaymentCoverage(
  paymentAmount: number,
  totalFee: number
): PaymentCoverageResult

export function formatCurrency(amount: number): string
```

---

## Display Formatting

### Currency Format (Guinea Franc)

```typescript
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-GN', {
    style: 'currency',
    currency: 'GNF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Examples:
// 1000000 → "1 000 000 GNF"
// 333333  → "333 333 GNF"
```

### Month Names (Bilingual)

```typescript
const MONTHS = {
  en: ['September', 'October', 'November', 'December', 'January',
       'February', 'March', 'April', 'May'],
  fr: ['Septembre', 'Octobre', 'Novembre', 'Décembre', 'Janvier',
       'Février', 'Mars', 'Avril', 'Mai'],
}
```

---

## UI Components

### Payment Schedule Display

Location: `app/ui/components/enrollment/steps/step-payment-breakdown.tsx`

Shows:
- 3 schedule cards with amounts and due dates
- Months covered per schedule
- Total breakdown
- Adjustment option (if enabled)

### Payment Progress

Location: `app/ui/components/enrollment/steps/step-confirmation.tsx`

Shows:
- Total paid vs total owed
- Percentage progress bar
- Remaining balance

---

## Testing

### Test Cases

```typescript
describe('calculatePaymentSchedules', () => {
  it('divides fee into 3 equal schedules', () => {
    const schedules = calculatePaymentSchedules(900000, new Date('2025-09-01'))
    expect(schedules[0].amount).toBe(300000)
    expect(schedules[1].amount).toBe(300000)
    expect(schedules[2].amount).toBe(300000)
  })

  it('handles remainders correctly', () => {
    const schedules = calculatePaymentSchedules(1000000, new Date('2025-09-01'))
    const total = schedules.reduce((sum, s) => sum + s.amount, 0)
    expect(total).toBe(1000000)
  })
})
```
