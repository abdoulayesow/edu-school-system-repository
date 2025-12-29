# Testing Guide: Enrollment Improvements (2025-12-29)

This document provides testing instructions for the enrollment improvements implemented in this session.

---

## Prerequisites

1. Start the development server:
   ```bash
   cd app/ui
   npm run dev
   ```

2. Ensure the database has been seeded with grade capacity values:
   ```bash
   cd app/db
   npx prisma db push
   npx prisma db seed
   ```

---

## Test Cases

### 1. Grade Capacity Indicator

**Location:** Enrollment Wizard > Step 1 (Grade Selection)

**Steps:**
1. Navigate to `/enrollment` or open the enrollment wizard
2. Observe the grade cards in the grade selection step

**Expected Results:**
- [ ] Each grade card displays a capacity indicator below the tuition fee
- [ ] Progress bar shows current enrollment as percentage of capacity
- [ ] Color coding:
  - **Green** progress bar: ≤55% capacity
  - **Orange** progress bar: 56-65% capacity
  - **Red** progress bar: >65% capacity
- [ ] Label shows format: "X/Y (Z%)" where X=enrolled, Y=capacity, Z=percentage
- [ ] Capacity values match expected defaults:
  - Kindergarten (PS, MS): 25 students
  - Kindergarten (GS): 30 students
  - Elementary (1-6): 35 students
  - College (7-10): 40 students
  - High School (11-12): 35 students
  - Terminale: 30 students

---

### 2. Selected Grade Header (Steps 2-6)

**Location:** Enrollment Wizard > Steps 2 through 6

**Steps:**
1. Select a grade in Step 1 and proceed to Step 2
2. Navigate through each step (2, 3, 4, 5, 6)

**Expected Results:**
- [ ] Header appears at the top of steps 2-6 showing selected grade
- [ ] Header displays:
  - Grade name (e.g., "6ème Année")
  - Level badge (e.g., "Primaire" / "Elementary")
  - Tuition fee (e.g., "1,500,000 GNF")
- [ ] Header updates if user returns to Step 1 and selects a different grade
- [ ] Header is hidden when on Step 1 (grade selection)

---

### 3. Auto-Generated Receipt Numbers

**Location:** Enrollment Wizard > Step 5 (Payment Transaction)

**Steps:**
1. Complete steps 1-4 of the enrollment wizard
2. Navigate to Step 5 (Payment Transaction)
3. Select "Cash" as payment method
4. Observe the receipt number field

**Expected Results:**
- [ ] Receipt number is auto-populated when payment method is selected
- [ ] Format for Cash: `GSPN-2025-CASH-XXXXX` (5-digit sequence)
- [ ] Format for Orange Money: `GSPN-2025-OM-XXXXX`
- [ ] Receipt number field is read-only (shows "Auto-generated" label)
- [ ] Switching payment methods generates a new receipt number
- [ ] Sequential numbers increment correctly per method type

**API Test:**
```bash
# Test the receipt number API directly
curl http://localhost:3000/api/payments/next-receipt-number?method=cash
curl http://localhost:3000/api/payments/next-receipt-number?method=orange_money
```

---

### 4. Enrollment PDF Single-Page Layout

**Location:** Enrollment Details > Print/Download PDF

**Steps:**
1. Complete an enrollment or view an existing enrollment
2. Click the "Print" or "Download PDF" button
3. View the generated PDF

**Expected Results:**
- [ ] PDF fits on a single A4 page
- [ ] Compact letterhead with:
  - Small GSPN logo (40x40)
  - School name and contact on one line
  - School year badge on the right
- [ ] Document title with enrollment number on same row
- [ ] Student and academic info in 3-column layout
- [ ] Parent info shows Father, Mother, Address in 3 columns
- [ ] Payment schedule table with compact cells
- [ ] Payment history (if any) and summary side by side
- [ ] Signature section with reduced spacing
- [ ] Footer with print date and page number

**Visual Checklist:**
- [ ] All text is readable (no overlapping or cut-off text)
- [ ] Tables fit within page margins
- [ ] Consistent spacing throughout
- [ ] Professional appearance maintained despite compact layout

---

## Regression Testing

Verify these existing features still work correctly:

### Enrollment Wizard Flow
- [ ] Can complete full enrollment from Step 1 to Step 6
- [ ] All form validations work correctly
- [ ] Can navigate back and forth between steps
- [ ] Data persists when navigating between steps

### Payment Processing
- [ ] Can record cash payments
- [ ] Can record Orange Money payments
- [ ] Payment amounts validate correctly
- [ ] Payment schedules update when payments are made

### PDF Generation
- [ ] PDF can be opened/downloaded without errors
- [ ] PDF displays correct student information
- [ ] PDF displays correct payment information
- [ ] PDF can be printed from browser

---

## Known Issues

1. **Pre-existing TypeScript errors** in API routes (not related to this session's changes)
2. **Next.js Turbopack config warning** during build (config issue, not functional)

---

## Browser Compatibility

Test in:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Edge (latest)
- [ ] Safari (if available)

---

## Sign-off

| Tester | Date | Result |
|--------|------|--------|
| | | |
| | | |

---

## Notes

- Report any issues found to the development team
- Screenshots of failures are helpful for debugging
- Include browser version and OS in bug reports
