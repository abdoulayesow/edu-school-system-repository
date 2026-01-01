# New Features Test Checklist

**Date:** 2025-12-27
**Purpose:** Quick validation of newly implemented features

---

## Quick Start

```bash
# Start the development server
cd app/ui && npm run dev

# Ensure database is seeded
npm run db:seed
```

Open http://localhost:8000 and login with a director account.

---

## 1. Student Detail Page (`/students/[id]`)

### Navigation
- [ ] From `/students` list, click "View" on any student
- [ ] Page loads at `/students/[studentId]`
- [ ] Back arrow returns to `/students` list

### Header Section
- [ ] Student avatar displays (or initials fallback)
- [ ] Full name displayed correctly
- [ ] Status badge shows (Active/Inactive/etc.)
- [ ] Student number (STU-XXXXX) displayed
- [ ] Current grade badge shown

### Summary Cards (4 cards)
- [ ] **Remaining Balance** - Shows amount in GNF with progress bar
- [ ] **Total Paid** - Shows paid amount and tuition
- [ ] **Attendance Rate** - Shows percentage with color coding
- [ ] **Enrollments** - Shows count of school years

### Tabs
#### Overview Tab
- [ ] Personal Info section shows: name, DOB, gender, email, phone, address
- [ ] Attendance summary shows: present, absent, late, excused counts
- [ ] Payment summary shows: tuition, paid, remaining, status

#### Enrollments Tab
- [ ] Table shows all enrollment history
- [ ] Each row: school year, grade, level, tuition, paid, status
- [ ] "Active" badge on current year enrollment
- [ ] Adjusted tuition shows strikethrough original

#### Payments Tab
- [ ] Table shows all payments across all enrollments
- [ ] Each row: date, school year, amount, method, receipt, recorder, status
- [ ] Sorted by most recent first
- [ ] Status badges colored correctly

#### Attendance Tab
- [ ] Stats grid: total, present, absent, late, excused
- [ ] Progress bar with color thresholds (60%, 80%)
- [ ] Status message (good/concerning/critical)
- [ ] Empty state if no attendance records

### Error Handling
- [ ] Invalid student ID shows error message
- [ ] Back link still works from error state

---

## 2. Expenses Page (`/expenses`)

### Navigation
- [ ] "Expenses" link appears in sidebar (for director/accountant)
- [ ] Click navigates to `/expenses`

### Summary Cards (4 cards)
- [ ] **Total Expenses** - Total amount and count
- [ ] **Pending** - Pending amount and count
- [ ] **Approved** - Approved amount and count
- [ ] **Paid** - Paid amount and count

### Filters
- [ ] Search filters by description/vendor
- [ ] Status filter: All/Pending/Approved/Rejected/Paid
- [ ] Category filter: All + 7 categories

### Expenses Table
- [ ] Columns: Date, Category, Description, Vendor, Amount, Method, Status, Requester, Actions
- [ ] Category shows icon (supplies, maintenance, etc.)
- [ ] Amount in GNF format
- [ ] Status badges colored correctly
- [ ] Empty state message when no expenses

### New Expense Dialog
- [ ] "New Expense" button opens dialog
- [ ] Required fields: Category, Description, Amount
- [ ] Category dropdown with 7 options
- [ ] Date picker defaults to today
- [ ] Payment method: Cash/Orange Money
- [ ] Vendor name optional
- [ ] Save disabled until required fields filled
- [ ] Save creates expense with "pending" status

### Actions Menu
#### Pending Expenses
- [ ] Approve option available
- [ ] Reject option available
- [ ] Delete option available (red)

#### Approve Action
- [ ] Confirm dialog shows amount
- [ ] Confirm changes status to "approved"

#### Reject Action
- [ ] Requires rejection reason
- [ ] Confirm disabled without reason
- [ ] Saves reason with expense

#### Mark as Paid (approved expenses only)
- [ ] Option only on approved expenses
- [ ] Confirm changes status to "paid"

#### Delete (pending only)
- [ ] Confirm dialog warns irreversible
- [ ] Removes expense from list

### Validation
- [ ] Cannot approve non-pending
- [ ] Cannot reject non-pending
- [ ] Cannot mark paid unless approved
- [ ] Cannot delete non-pending

---

## 3. Reports Page (Real API)

### Overview Tab
- [ ] Summary cards show real data (grades, students, attendance, at-risk)
- [ ] Level filter works (Primaire/Collège/Lycée)
- [ ] Grades list shows real student counts
- [ ] Attendance rates color-coded

### Participation Tab
- [ ] Grade selector populated with real grades
- [ ] Trend chart shows 14-day data
- [ ] Session summary shows real counts
- [ ] Top absences from API
- [ ] Comparison chart with all grades

---

## 4. Dashboard (Real API)

### Summary Cards
- [ ] Enrollment count from real data
- [ ] Revenue from accounting/balance API
- [ ] Pending approvals count accurate
- [ ] Reconciliation flags show unreconciled deposits

### Pending Approvals Table
- [ ] Lists enrollments needing review
- [ ] Lists payments pending review
- [ ] Approve/Review buttons work

### Charts
- [ ] Enrollment by grade shows real counts
- [ ] Revenue by method shows Cash vs Orange Money

---

## Test Results

| Feature | Tests | Passed | Failed | Notes |
|---------|-------|--------|--------|-------|
| Student Detail | 25 | | | |
| Expenses | 28 | | | |
| Reports API | 8 | | | |
| Dashboard API | 7 | | | |
| **Total** | **68** | | | |

---

## Issues Found

1. **Issue:**
   **Steps to reproduce:**
   **Expected:**
   **Actual:**

2. **Issue:**
   **Steps to reproduce:**
   **Expected:**
   **Actual:**

---

**Tested by:** _________________
**Date:** _________________
**Browser:** _________________
