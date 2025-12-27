# Test Plan: Latest Changes Validation

**Date:** 2025-12-25
**Version:** 1.0
**Purpose:** Validate fixes for API errors, performance improvements, and UI enhancements

---

## Prerequisites

- [ ] Local development server running (`cd app/ui && npm run dev`)
- [ ] Database seeded with school year and grades (`npm run db:seed`)
- [ ] Test user account available (director role)
- [ ] Browser DevTools ready (F12)

---

## Test Categories

### A. API & Database Tests

| # | Test | Steps | Expected Result | Pass/Fail |
|---|------|-------|-----------------|-----------|
| A1 | School Years API | 1. Navigate to `/enrollments/new`<br>2. Open grade dropdown | Grades dropdown shows 13 grades (Maternelle to Terminale) | |
| A2 | Auth Session API | 1. Open DevTools > Network tab<br>2. Refresh page<br>3. Look for `/api/auth/session` | Returns JSON with session data (not HTML error page) | |
| A3 | No 500 Errors | 1. Open DevTools > Console<br>2. Navigate through app pages | No 500 errors in console | |
| A4 | Active School Year | 1. Check `/api/school-years/active` in Network tab | Returns JSON with 2025-2026 school year | |

---

### B. Performance Tests

| # | Test | Steps | Expected Result | Pass/Fail |
|---|------|-------|-----------------|-----------|
| B1 | Page Load Speed | 1. Navigate from Dashboard to Enrollments<br>2. Navigate to Users<br>3. Navigate back to Dashboard | Pages load instantly (no visible delay) | |
| B2 | Initial Load | 1. Refresh the dashboard page (Ctrl+R) | Page appears immediately without animation delay | |
| B3 | Navigation Flow | 1. Click Dashboard<br>2. Click Enrollments<br>3. Click Users<br>4. Click Dashboard | Smooth, instant navigation without 0.3s delays | |
| B4 | No Animation Lag | 1. Rapidly click between navigation items | No cumulative delay, each click responds immediately | |

---

### C. UI/UX Tests - Dropdown Menu

| # | Test | Steps | Expected Result | Pass/Fail |
|---|------|-------|-----------------|-----------|
| C1 | User Dropdown - Desktop | 1. On desktop, click user avatar (top-right)<br>2. Observe dropdown appearance | Dropdown appears directly below avatar with fade+zoom animation | |
| C2 | No Flying Effect | 1. Click avatar to open dropdown<br>2. Observe opening animation | Dropdown does NOT fly in from top-center of screen | |
| C3 | Dropdown Animation | 1. Open dropdown<br>2. Close by clicking outside<br>3. Open again | Smooth fade and zoom animation each time | |
| C4 | Dropdown Position | 1. Open dropdown<br>2. Check position relative to avatar | Dropdown positioned 8px below trigger, aligned to right edge | |
| C5 | No Page Shift | 1. Open dropdown<br>2. Check if page content shifts | Page does NOT shift/jump when dropdown opens | |
| C6 | Close on Outside Click | 1. Open dropdown<br>2. Click anywhere outside dropdown | Dropdown closes smoothly | |

---

### D. Mobile Navigation Tests

| # | Test | Steps | Expected Result | Pass/Fail |
|---|------|-------|-----------------|-----------|
| D1 | Mobile Sidebar | 1. Resize browser to mobile (<768px)<br>2. Click hamburger menu icon | Sidebar opens from left | |
| D2 | My Account Dropdown | 1. Open sidebar<br>2. Click "My Account" at bottom | Dropdown opens upward with smooth animation | |
| D3 | Sidebar Links | 1. Open sidebar<br>2. Click "Users" link | Navigates to Users and closes sidebar | |
| D4 | Mobile Dropdown Animation | 1. Open sidebar<br>2. Open "My Account" dropdown<br>3. Observe animation | Dropdown appears with fade+zoom (no flying effect) | |

---

### E. Enrollment Flow Tests

| # | Test | Steps | Expected Result | Pass/Fail |
|---|------|-------|-----------------|-----------|
| E1 | Start Enrollment | 1. Navigate to `/enrollments/new` | Wizard loads with Step 1 (Student Information) | |
| E2 | Grades Populated | 1. In Step 2, open grade dropdown | All 13 grades visible with tuition fees | |
| E3 | Tuition Display | 1. Select "6ème" grade | Shows tuition fee: 850,000 GNF | |
| E4 | Complete Wizard | 1. Fill all 6 steps with valid data<br>2. Submit enrollment | Enrollment created successfully | |
| E5 | View Enrollment | 1. Go to `/enrollments` | New enrollment appears in list | |

---

### F. Language Switching Tests

| # | Test | Steps | Expected Result | Pass/Fail |
|---|------|-------|-----------------|-----------|
| F1 | Switch to French | 1. Click language toggle (EN/FR) | All UI text changes to French | |
| F2 | Switch to English | 1. Click language toggle again | All UI text changes to English | |
| F3 | Persistence | 1. Switch to French<br>2. Reload page | Language stays French after reload | |

---

## Summary

| Category | Total | Passed | Failed |
|----------|-------|--------|--------|
| A. API & Database | 4 | | |
| B. Performance | 4 | | |
| C. UI/UX Dropdown | 6 | | |
| D. Mobile Navigation | 4 | | |
| E. Enrollment Flow | 5 | | |
| F. Language | 3 | | |
| **TOTAL** | **26** | | |

---

## Notes

**Tester:** _________________
**Date Tested:** _________________
**Environment:** Local Development (localhost:8000)
**Browser:** _________________

### Issues Found:
1.
2.
3.

### Comments:


---

**Last Updated:** 2025-12-25
