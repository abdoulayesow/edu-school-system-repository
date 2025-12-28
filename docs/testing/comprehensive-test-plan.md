# Comprehensive Test Plan: GSPN School Management System

**Date:** 2025-12-27
**Version:** 2.0
**Purpose:** Complete testing coverage for all implemented modules

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Module Test Plans](#module-test-plans)
   - [Dashboard](#1-dashboard)
   - [Enrollments](#2-enrollments)
   - [Students](#3-students)
   - [Student Detail Page](#4-student-detail-page)
   - [Grades](#5-grades)
   - [Attendance](#6-attendance)
   - [Accounting](#7-accounting)
   - [Expenses](#8-expenses)
   - [Reports](#9-reports)
3. [API Tests](#api-tests)
4. [Cross-Module Tests](#cross-module-tests)
5. [Performance Tests](#performance-tests)
6. [Summary](#summary)

---

## Prerequisites

- [ ] Local development server running (`cd app/ui && npm run dev`)
- [ ] Database seeded with test data (`npm run db:seed`)
- [ ] Test user account with director role
- [ ] Browser DevTools ready (F12)
- [ ] Network tab open for API monitoring

---

## Module Test Plans

### 1. Dashboard

| # | Test | Steps | Expected Result | Pass/Fail |
|---|------|-------|-----------------|-----------|
| D1 | Dashboard loads | Navigate to `/dashboard` | Page loads with summary cards | |
| D2 | Enrollment count | Check "Total Enrollment" card | Shows real student count from API | |
| D3 | Revenue display | Check "Revenue" card | Shows confirmed revenue with pending amount | |
| D4 | Pending approvals | Check "Pending Approvals" card | Shows count of enrollments + payments needing review | |
| D5 | Reconciliation flags | Check reconciliation section | Shows unreconciled deposits if any | |
| D6 | Enrollment chart | View bar chart | Shows enrollment by grade with real data | |
| D7 | Revenue pie chart | View pie chart | Shows revenue by payment method (Cash vs Orange Money) | |
| D8 | Pending table | View pending approvals table | Lists enrollments needing review and payments pending | |

---

### 2. Enrollments

| # | Test | Steps | Expected Result | Pass/Fail |
|---|------|-------|-----------------|-----------|
| E1 | List page loads | Navigate to `/enrollments` | Shows list of all enrollments | |
| E2 | New enrollment wizard | Click "New Enrollment" | Wizard opens at Step 1 | |
| E3 | Grade selection | In wizard, select a grade | Grade selected, tuition fee displayed | |
| E4 | Student info | Fill student information | Form validates required fields | |
| E5 | Payment schedule | View payment breakdown | Shows 3 schedules with amounts | |
| E6 | Adjustment | Apply tuition adjustment | Shows original and adjusted amounts | |
| E7 | Payment recording | Record initial payment | Payment saved with receipt number | |
| E8 | Review step | View enrollment summary | All information displayed correctly | |
| E9 | Submit enrollment | Submit enrollment | Shows confirmation with enrollment number | |
| E10 | PDF download | Click download PDF | PDF generates and downloads | |
| E11 | View enrollment | Open existing enrollment | Detail page shows all information | |
| E12 | Approve enrollment | Approve pending enrollment | Status changes to approved | |

---

### 3. Students

| # | Test | Steps | Expected Result | Pass/Fail |
|---|------|-------|-----------------|-----------|
| S1 | List loads | Navigate to `/students` | Shows list of all students | |
| S2 | Summary cards | View top cards | Shows total, payment status breakdown, attendance stats | |
| S3 | Search works | Search by student name | Filters students matching query | |
| S4 | Search by number | Search by student number | Finds student by STU-XXXXX | |
| S5 | Grade filter | Filter by grade | Shows only students in selected grade | |
| S6 | Payment filter | Filter by payment status | Shows only students with selected status | |
| S7 | Attendance filter | Filter by attendance status | Shows students with matching attendance | |
| S8 | View button | Click view on a student | Navigates to `/students/[id]` | |
| S9 | Payment badge | Check payment status badge | Shows correct color and percentage | |
| S10 | Attendance badge | Check attendance badge | Shows good/concerning/critical with icon | |

---

### 4. Student Detail Page

| # | Test | Steps | Expected Result | Pass/Fail |
|---|------|-------|-----------------|-----------|
| SD1 | Page loads | Navigate to `/students/[id]` | Page loads with student info | |
| SD2 | Back link | Click back arrow | Returns to `/students` list | |
| SD3 | Header info | Check header section | Shows avatar, name, status, student number, grade | |
| SD4 | Quick stats card | Check payment stats card | Shows payment percentage and status badge | |
| SD5 | Balance card | Check remaining balance | Shows balance with progress bar | |
| SD6 | Total paid card | Check total paid | Shows amount and percentage | |
| SD7 | Attendance card | Check attendance rate | Shows rate with color coding | |
| SD8 | Enrollments card | Check enrollments count | Shows number of school years | |
| SD9 | Overview - Personal | View Overview tab | Shows personal info (name, DOB, email, phone, address) | |
| SD10 | Overview - Attendance | View attendance summary | Shows present/absent/late/excused counts | |
| SD11 | Overview - Payment | View payment summary | Shows tuition, paid, remaining, status | |
| SD12 | Enrollments tab | Click Enrollments tab | Shows table of all enrollments | |
| SD13 | Enrollment row | Check enrollment row | Shows school year, grade, tuition, paid, status | |
| SD14 | Payments tab | Click Payments tab | Shows all payment history | |
| SD15 | Payment row | Check payment row | Shows date, amount, method, receipt, recorder, status | |
| SD16 | Attendance tab | Click Attendance tab | Shows attendance statistics grid | |
| SD17 | Attendance visual | Check attendance progress | Shows color-coded rate with thresholds | |
| SD18 | 404 handling | Visit invalid student ID | Shows error message, back link works | |

---

### 5. Grades

| # | Test | Steps | Expected Result | Pass/Fail |
|---|------|-------|-----------------|-----------|
| G1 | List loads | Navigate to `/grades` | Shows all grades as cards | |
| G2 | Grade card | Check grade card | Shows name, level, student count | |
| G3 | View detail | Click on a grade | Opens `/grades/[id]` | |
| G4 | Detail header | Check header | Shows grade name, level badge, student count | |
| G5 | Grade leader | Check leader section | Shows assigned teacher or "Assign" button | |
| G6 | Stats cards | Check summary cards | Shows students, subjects, attendance %, payment % | |
| G7 | Overview tab | View overview | Shows attendance and payment summaries | |
| G8 | Students tab | Click Students tab | Shows table of enrolled students | |
| G9 | Student link | Click view on student | Navigates to `/students/[id]` | |
| G10 | Subjects tab | Click Subjects tab | Shows subjects with teachers | |

---

### 6. Attendance

| # | Test | Steps | Expected Result | Pass/Fail |
|---|------|-------|-----------------|-----------|
| A1 | Page loads | Navigate to `/attendance` | Shows grade and date selection | |
| A2 | Grade select | Select a grade | Student list loads | |
| A3 | Date select | Select a date | Attendance for that date shown | |
| A4 | Entry mode toggle | Switch entry mode | Changes between checklist and absences-only | |
| A5 | Mark present | Click on student | Status cycles through states | |
| A6 | Mark absent | Set student absent | Student shows red absent status | |
| A7 | Mark late | Set student late | Student shows yellow late status | |
| A8 | Summary counts | Check summary | Shows present/absent/late/excused counts | |
| A9 | Save attendance | Click Save | Attendance saved successfully | |
| A10 | Complete session | Click Complete | Session marked as complete | |

---

### 7. Accounting

| # | Test | Steps | Expected Result | Pass/Fail |
|---|------|-------|-----------------|-----------|
| AC1 | Page loads | Navigate to `/accounting` | Shows balance overview and tabs | |
| AC2 | Balance cards | Check balance section | Shows cash, pending, Orange Money totals | |
| AC3 | Payments tab | View payments tab | Shows list of payments | |
| AC4 | Record payment | Click Record Payment | Dialog opens with form | |
| AC5 | Payment form | Fill payment form | Validates required fields | |
| AC6 | Payment method | Select payment method | Cash/Orange Money options available | |
| AC7 | Save payment | Submit payment | Payment recorded with pending status | |
| AC8 | Review payment | Click Review on payment | Opens review dialog | |
| AC9 | Approve payment | Approve payment | Status changes to confirmed | |
| AC10 | Reject payment | Reject payment with reason | Status changes to rejected | |
| AC11 | Bank deposits tab | View bank deposits | Shows list of deposits | |
| AC12 | Record deposit | Record bank deposit | Deposit recorded | |
| AC13 | Reconcile deposit | Reconcile payment with deposit | Shows reconciled status | |

---

### 8. Expenses

| # | Test | Steps | Expected Result | Pass/Fail |
|---|------|-------|-----------------|-----------|
| EX1 | Page loads | Navigate to `/expenses` | Shows expenses list and summary | |
| EX2 | Summary cards | Check summary cards | Shows total, pending, approved, paid amounts | |
| EX3 | Search | Search by description | Filters expenses | |
| EX4 | Status filter | Filter by status | Shows only matching status | |
| EX5 | Category filter | Filter by category | Shows only matching category | |
| EX6 | New expense dialog | Click "New Expense" | Dialog opens with form | |
| EX7 | Category select | Select category | All 7 categories available | |
| EX8 | Amount input | Enter amount | Validates positive number | |
| EX9 | Save expense | Submit new expense | Expense created with pending status | |
| EX10 | Approve expense | Click approve on pending | Status changes to approved | |
| EX11 | Reject expense | Reject with reason | Status changes to rejected, reason shown | |
| EX12 | Mark paid | Mark approved as paid | Status changes to paid | |
| EX13 | Delete expense | Delete pending expense | Expense removed from list | |
| EX14 | Category icons | Check table | Each category shows correct icon | |
| EX15 | Currency format | Check amounts | Displays in GNF format | |

---

### 9. Reports

| # | Test | Steps | Expected Result | Pass/Fail |
|---|------|-------|-----------------|-----------|
| R1 | Page loads | Navigate to `/reports` | Shows overview and tabs | |
| R2 | Summary cards | Check summary cards | Shows grades, students, attendance, at-risk | |
| R3 | Level filter | Filter by level | Shows grades for selected level | |
| R4 | Grades list | View grades list | Shows all grades with stats | |
| R5 | Attendance colors | Check attendance rates | Color-coded (green/yellow/red) | |
| R6 | Participation tab | Click Participation tab | Shows charts and data | |
| R7 | Grade selector | Select a grade | Shows attendance trend for that grade | |
| R8 | Trend chart | View trend line chart | Shows 14-day attendance trend | |
| R9 | Session summary | Check session cards | Shows sessions, present, absent, late | |
| R10 | Top absences | View absences list | Shows students with most absences | |
| R11 | Comparison chart | View bar chart | Shows attendance across all grades | |

---

## API Tests

### Core APIs

| # | Endpoint | Method | Test | Expected | Pass/Fail |
|---|----------|--------|------|----------|-----------|
| API1 | `/api/grades` | GET | Fetch all grades | Returns grades with stats | |
| API2 | `/api/grades/[id]` | GET | Fetch grade detail | Returns grade with enrollments, subjects | |
| API3 | `/api/students` | GET | Fetch students | Returns paginated student list | |
| API4 | `/api/students/[id]` | GET | Fetch student detail | Returns student with balance, attendance | |
| API5 | `/api/enrollments` | GET | Fetch enrollments | Returns enrollment list | |
| API6 | `/api/enrollments` | POST | Create enrollment | Returns new enrollment | |
| API7 | `/api/payments` | GET | Fetch payments | Returns payment list | |
| API8 | `/api/payments` | POST | Record payment | Returns new payment | |
| API9 | `/api/expenses` | GET | Fetch expenses | Returns expense list | |
| API10 | `/api/expenses` | POST | Create expense | Returns new expense | |
| API11 | `/api/expenses/[id]/approve` | POST | Approve expense | Returns updated expense | |
| API12 | `/api/accounting/balance` | GET | Fetch balance | Returns financial summary | |
| API13 | `/api/bank-deposits` | GET | Fetch deposits | Returns deposit list | |
| API14 | `/api/attendance/stats/grade/[id]` | GET | Attendance stats | Returns daily breakdown | |

### Error Handling

| # | Test | Steps | Expected | Pass/Fail |
|---|------|-------|----------|-----------|
| ERR1 | Invalid student ID | GET `/api/students/invalid-id` | Returns 404 | |
| ERR2 | Missing required field | POST expense without category | Returns 400 | |
| ERR3 | Unauthorized access | Access without auth | Returns 401 | |
| ERR4 | Invalid status transition | Approve already approved | Returns 400 | |

---

## Cross-Module Tests

| # | Test | Steps | Expected | Pass/Fail |
|---|------|-------|----------|-----------|
| CM1 | Student → Grade | View student, check grade badge | Grade matches enrollment | |
| CM2 | Grade → Student | From grade detail, view student | Opens correct student detail | |
| CM3 | Dashboard → Enrollment | Click pending enrollment | Opens enrollment for review | |
| CM4 | Payment → Accounting | Record payment, check accounting | Balance updates correctly | |
| CM5 | Expense → Dashboard | Approve expense, check margin | Dashboard shows updated margin | |
| CM6 | Enrollment → Payment | Complete enrollment with payment | Payment appears in student detail | |

---

## Performance Tests

| # | Test | Steps | Expected | Pass/Fail |
|---|------|-------|----------|-----------|
| P1 | Page load | Navigate to each page | All pages load < 2s | |
| P2 | API response | Check network timing | API calls < 500ms | |
| P3 | Large list | View students with 100+ | Renders smoothly | |
| P4 | Concurrent requests | Dashboard parallel fetches | All complete without error | |
| P5 | Form submission | Submit expense form | Completes < 1s | |

---

## Summary

| Module | Total Tests | Passed | Failed |
|--------|-------------|--------|--------|
| Dashboard | 8 | | |
| Enrollments | 12 | | |
| Students | 10 | | |
| Student Detail | 18 | | |
| Grades | 10 | | |
| Attendance | 10 | | |
| Accounting | 13 | | |
| Expenses | 15 | | |
| Reports | 11 | | |
| API Tests | 18 | | |
| Cross-Module | 6 | | |
| Performance | 5 | | |
| **TOTAL** | **136** | | |

---

## Test Execution Log

**Tester:** _________________
**Date:** _________________
**Environment:** _________________
**Browser:** _________________
**Database State:** _________________

### Issues Found:
1.
2.
3.

### Notes:


---

**Last Updated:** 2025-12-27
