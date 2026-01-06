# Phase 4 Grading System - Testing Plan

**Date:** 2026-01-03
**Feature Version:** Phase 4 (Feature Toggle Enabled)
**Application:** Student Grading System

---

## Overview

This document provides comprehensive testing procedures for the Phase 4 Grading System features, including the newly implemented feature toggle system. All tests should be performed in both enabled and disabled states of the feature flag.

---

## Test Environment Setup

### Prerequisites
- Active school year configured
- Active trimester configured
- At least one grade/class with students enrolled
- User accounts with appropriate roles (teacher, academic_director, director)
- Development server running on port 8000

### Feature Flag Configuration

**Default State (Features Enabled):**
```bash
# app/ui/.env.local
NEXT_PUBLIC_ENABLE_GRADING_FEATURES=true
# OR omit the variable entirely (enabled by default)
```

**Disabled State:**
```bash
# app/ui/.env.local
NEXT_PUBLIC_ENABLE_GRADING_FEATURES=false
```

**Important:** Restart dev server after any environment variable change.

---

## Test Suite 1: Feature Toggle Functionality

### Test 1.1: Features Enabled (Default Behavior)
**Objective:** Verify all Phase 4 features are visible and accessible when feature flag is enabled

**Steps:**
1. Set `NEXT_PUBLIC_ENABLE_GRADING_FEATURES=true` in `.env.local`
2. Restart dev server
3. Login as director/academic_director/teacher
4. Check navigation sidebar

**Expected Results:**
- [ ] "Grading" section appears in navigation with BookMarked icon
- [ ] 5 sub-items visible under Grading section:
  - Grade Entry (/grades/entry)
  - Bulletins (/grades/bulletin)
  - Class Ranking (/grades/ranking)
  - Teacher Remarks (/grades/remarks)
  - Conduct & Attendance (/grades/conduct)
- [ ] All grading pages accessible via navigation
- [ ] "Trimesters" visible in Administration section

**Priority:** Critical
**Status:** ☐ Not Tested | ☐ Pass | ☐ Fail

---

### Test 1.2: Features Disabled
**Objective:** Verify Phase 4 features are hidden when feature flag is disabled

**Steps:**
1. Set `NEXT_PUBLIC_ENABLE_GRADING_FEATURES=false` in `.env.local`
2. Restart dev server
3. Login as director/academic_director/teacher
4. Check navigation sidebar

**Expected Results:**
- [ ] "Grading" section completely hidden from navigation
- [ ] Other navigation sections remain visible (Dashboard, Students, Accounting, etc.)
- [ ] Application functions normally for non-grading features
- [ ] No JavaScript errors in browser console

**Priority:** Critical
**Status:** ☐ Not Tested | ☐ Pass | ☐ Fail

---

### Test 1.3: Feature Toggle Persistence
**Objective:** Verify feature toggle persists across sessions

**Steps:**
1. Set `NEXT_PUBLIC_ENABLE_GRADING_FEATURES=false`
2. Restart server and login
3. Verify grading section hidden
4. Logout
5. Login again
6. Check navigation

**Expected Results:**
- [ ] Feature toggle state persists after logout/login
- [ ] No unexpected re-appearance of grading section

**Priority:** High
**Status:** ☐ Not Tested | ☐ Pass | ☐ Fail

---

## Test Suite 2: Navigation Integration

### Test 2.1: Role-Based Navigation Access
**Objective:** Verify navigation items display correctly for different user roles

**Test Cases:**

| Role | Should See Grading Section | Notes |
|------|---------------------------|-------|
| Director | ✓ Yes | Full access to all 5 sub-items |
| Academic Director | ✓ Yes | Full access to all 5 sub-items |
| Teacher | ✓ Yes | Access to 4 sub-items (no Class Ranking) |
| Accountant | ✗ No | No access to grading features |
| Secretary | ✗ No | No access to grading features |

**Steps:**
1. Login with each role
2. Check navigation sidebar
3. Verify sub-items visibility

**Priority:** High
**Status:** ☐ Not Tested | ☐ Pass | ☐ Fail

---

### Test 2.2: Navigation Icons and Labels
**Objective:** Verify correct icons and translations for navigation items

**Steps:**
1. Login as director
2. Switch between English and French language
3. Verify translations and icons

**Expected Results:**

| Item | Icon | EN Label | FR Label |
|------|------|----------|----------|
| Grading Section | BookMarked | Grading | Notation |
| Grade Entry | PenLine | Grade Entry | Saisie des notes |
| Bulletins | FileText | Bulletins | Bulletins |
| Class Ranking | Trophy | Class Ranking | Classement |
| Teacher Remarks | MessageSquare | Teacher Remarks | Remarques |
| Conduct & Attendance | ClipboardCheck | Conduct & Attendance | Conduite et assiduité |

**Priority:** Medium
**Status:** ☐ Not Tested | ☐ Pass | ☐ Fail

---

## Test Suite 3: Grade Entry Page (/grades/entry)

### Test 3.1: Page Load and Layout
**Objective:** Verify page loads correctly with all components

**Steps:**
1. Navigate to /grades/entry
2. Check page header and layout
3. Verify active trimester badge displays

**Expected Results:**
- [ ] Page title: "Grade Entry"
- [ ] Active trimester badge visible (e.g., "Trimester 1")
- [ ] School year badge visible (e.g., "2024-2025")
- [ ] Two tabs visible: "Enter Grades" and "Manage Evaluations"
- [ ] No console errors

**Priority:** Critical
**Status:** ☐ Not Tested | ☐ Pass | ☐ Fail

---

### Test 3.2: Grade Entry - Basic Workflow
**Objective:** Test complete grade entry workflow from selection to save

**Steps:**
1. Switch to "Enter Grades" tab
2. Select grade: "6eme"
3. Select subject: "Mathématiques"
4. Select type: "Interrogation"
5. Set max score: 20
6. Enter scores for 5 students (mix of passing/failing)
7. Add remarks for 2 students
8. Click "Save All Grades"

**Expected Results:**
- [ ] Student list populates after grade selection
- [ ] Subject dropdown shows coefficients (e.g., "Mathématiques (×2)")
- [ ] Score inputs validate (0-20 range, 0.5 step)
- [ ] Passing scores (≥10) show green border
- [ ] Failing scores (<10) show red border
- [ ] Grade counter updates (e.g., "5 / 30 grades entered")
- [ ] Success message appears after save
- [ ] Form resets after successful save

**Priority:** Critical
**Status:** ☐ Not Tested | ☐ Pass | ☐ Fail

---

### Test 3.3: Grade Entry - Input Validation
**Objective:** Test score validation and error handling

**Test Cases:**

| Input | Expected Behavior |
|-------|-------------------|
| -5 | Rejected (negative not allowed) |
| 25 | Rejected (exceeds max score of 20) |
| 15.5 | Accepted (0.5 step valid) |
| 15.3 | Accepted (browser rounds to 15.5) |
| Empty | Accepted (student skipped) |
| "abc" | Rejected (non-numeric) |

**Priority:** High
**Status:** ☐ Not Tested | ☐ Pass | ☐ Fail

---

### Test 3.4: Manage Evaluations - View and Filter
**Objective:** Test evaluation listing and filtering functionality

**Steps:**
1. Switch to "Manage Evaluations" tab
2. Select grade with existing evaluations
3. Verify evaluation table displays
4. Select subject filter: "Mathématiques"
5. Select type filter: "Interrogation"
6. Click refresh button

**Expected Results:**
- [ ] Evaluations table displays with all columns:
  - Student name and number
  - Subject name
  - Type badge
  - Score (color-coded: green ≥10, red <10)
  - Date
  - Remarks
  - Actions (Edit/Delete buttons)
- [ ] Filters work correctly
- [ ] Evaluation count updates in card description
- [ ] Refresh button reloads data

**Priority:** High
**Status:** ☐ Not Tested | ☐ Pass | ☐ Fail

---

### Test 3.5: Manage Evaluations - Edit Evaluation
**Objective:** Test editing existing evaluation

**Steps:**
1. Click Edit button on an evaluation
2. Change score from 12 to 15
3. Change date
4. Add/modify notes
5. Click Save

**Expected Results:**
- [ ] Edit dialog opens with pre-filled data
- [ ] All fields editable
- [ ] Max score indicator shows (e.g., "out of 20")
- [ ] Save button disabled during submission
- [ ] Success toast appears
- [ ] Recalculation prompt dialog appears
- [ ] Table updates with new values
- [ ] Dialog closes automatically

**Priority:** Critical
**Status:** ☐ Not Tested | ☐ Pass | ☐ Fail

---

### Test 3.6: Manage Evaluations - Delete Evaluation
**Objective:** Test deleting evaluation with confirmation

**Steps:**
1. Click Delete button on an evaluation
2. Read confirmation dialog
3. Click Cancel
4. Click Delete again
5. Click Confirm

**Expected Results:**
- [ ] Delete confirmation dialog appears
- [ ] Dialog shows evaluation details (student, subject, score)
- [ ] Cancel button closes dialog without deleting
- [ ] Confirm button triggers deletion
- [ ] Success toast appears
- [ ] Recalculation prompt appears
- [ ] Evaluation removed from table
- [ ] Evaluation count decrements

**Priority:** Critical
**Status:** ☐ Not Tested | ☐ Pass | ☐ Fail

---

### Test 3.7: Recalculation Prompt
**Objective:** Test recalculation workflow after edit/delete

**Steps:**
1. Edit or delete an evaluation
2. Wait for recalculation prompt
3. Click "Recalculate Now"

**Expected Results:**
- [ ] Prompt dialog appears after edit/delete
- [ ] Clear message about recalculating averages
- [ ] Two buttons: "Skip" and "Recalculate Now"
- [ ] Recalculate button triggers calculation
- [ ] Loading indicator shows during calculation
- [ ] Success message after completion
- [ ] Dialog closes automatically

**Priority:** High
**Status:** ☐ Not Tested | ☐ Pass | ☐ Fail

---

## Test Suite 4: Teacher Remarks (/grades/remarks)

### Test 4.1: Page Load and Data Display
**Objective:** Verify remarks page loads with subject averages

**Steps:**
1. Navigate to /grades/remarks
2. Select active trimester
3. Select grade with calculated averages
4. Select subject

**Expected Results:**
- [ ] Selection dropdowns populate correctly
- [ ] Student list displays with columns:
  - Student name and number
  - Subject average
  - Current remark
  - Textarea for new remark
- [ ] Existing remarks load in textareas
- [ ] Average scores display correctly

**Priority:** Critical
**Status:** ☐ Not Tested | ☐ Pass | ☐ Fail

---

### Test 4.2: Remarks Entry and Save
**Objective:** Test entering and saving teacher remarks

**Steps:**
1. Enter remarks for 3 students
2. Modify existing remark for 1 student
3. Verify "Unsaved Changes" badge appears
4. Click "Save All Remarks"

**Expected Results:**
- [ ] Unsaved changes badge appears after typing
- [ ] Badge shows count (e.g., "3 unsaved changes")
- [ ] Save button enabled when changes exist
- [ ] Loading indicator during save
- [ ] Success toast notification
- [ ] Unsaved changes badge disappears
- [ ] Remarks persist after page refresh

**Priority:** Critical
**Status:** ☐ Not Tested | ☐ Pass | ☐ Fail

---

### Test 4.3: Unsaved Changes Warning
**Objective:** Test navigation warning with unsaved changes

**Steps:**
1. Enter remarks for students
2. Attempt to navigate away (change grade/subject/trimester)
3. Or attempt to leave page

**Expected Results:**
- [ ] Warning badge visible before navigation
- [ ] Clear indication that changes will be lost
- [ ] User must explicitly save or discard

**Priority:** Medium
**Status:** ☐ Not Tested | ☐ Pass | ☐ Fail

---

## Test Suite 5: Conduct & Attendance (/grades/conduct)

### Test 5.1: Conduct Entry Workflow
**Objective:** Test entering conduct scores and attendance data

**Steps:**
1. Navigate to /grades/conduct
2. Select active trimester and grade
3. Enter conduct scores (0-20) for 5 students
4. Enter absences count for 3 students
5. Enter lates count for 2 students
6. Click "Save All"

**Expected Results:**
- [ ] Student list loads with 3 input columns:
  - Conduct (0-20)
  - Absences
  - Lates
- [ ] Conduct inputs validate 0-20 range
- [ ] Absences/lates accept positive integers
- [ ] Unsaved changes tracked
- [ ] Bulk save processes all entries
- [ ] Success notification appears
- [ ] Data persists after refresh

**Priority:** Critical
**Status:** ☐ Not Tested | ☐ Pass | ☐ Fail

---

### Test 5.2: Input Validation
**Objective:** Test conduct and attendance input validation

**Test Cases:**

| Field | Input | Expected |
|-------|-------|----------|
| Conduct | -5 | Rejected |
| Conduct | 25 | Rejected |
| Conduct | 15.5 | Accepted |
| Absences | -1 | Rejected |
| Absences | 3.5 | Accepted (rounds) |
| Lates | -1 | Rejected |
| Lates | 10 | Accepted |

**Priority:** High
**Status:** ☐ Not Tested | ☐ Pass | ☐ Fail

---

## Test Suite 6: Class Ranking (/grades/ranking)

### Test 6.1: Ranking Display
**Objective:** Verify ranking table displays correctly

**Prerequisites:** Student summaries calculated for selected trimester/grade

**Steps:**
1. Navigate to /grades/ranking
2. Select trimester and grade
3. Verify ranking table

**Expected Results:**
- [ ] Students sorted by rank (1st, 2nd, 3rd, etc.)
- [ ] Table columns display:
  - Rank with medal icons (gold, silver, bronze for top 3)
  - Student name and number
  - General average
  - Decision badge (Admis/Redouble)
  - Conduct score
  - Absences and lates
- [ ] Class statistics card shows:
  - Class average
  - Highest average
  - Lowest average
  - Pass count and rate
  - Total students

**Priority:** Critical
**Status:** ☐ Not Tested | ☐ Pass | ☐ Fail

---

### Test 6.2: Batch Bulletin Download
**Objective:** Test downloading all student bulletins as ZIP

**Prerequisites:** At least 3 students with calculated summaries

**Steps:**
1. Select trimester and grade with rankings
2. Click "Download All Bulletins" button
3. Wait for generation to complete
4. Verify ZIP download
5. Extract ZIP file
6. Open PDFs

**Expected Results:**
- [ ] Download button visible and enabled
- [ ] Progress indicator shows during generation:
  - "Generating bulletin 1/30..."
  - "Generating bulletin 2/30..."
  - etc.
- [ ] ZIP file downloads automatically
- [ ] ZIP filename format: `bulletins-{gradeName}-{trimester}-{date}.zip`
- [ ] ZIP contains PDF for each student
- [ ] PDF filename format: `bulletin-{studentNumber}-{lastName}.pdf`
- [ ] PDFs open without errors
- [ ] PDF content accurate:
  - Student information
  - All subject grades
  - Averages and rank
  - Conduct and attendance
  - Teacher remarks
  - Decision

**Priority:** Critical
**Status:** ☐ Not Tested | ☐ Pass | ☐ Fail

---

### Test 6.3: Download Edge Cases
**Objective:** Test download with various data scenarios

**Test Cases:**

| Scenario | Expected Behavior |
|----------|-------------------|
| 1 student | Single PDF in ZIP |
| 50 students | All 50 PDFs generated |
| Student with no averages | PDF shows "N/A" for missing data |
| Special characters in name | Filename sanitized correctly |
| Interrupt download | Can restart without corruption |

**Priority:** Medium
**Status:** ☐ Not Tested | ☐ Pass | ☐ Fail

---

## Test Suite 7: Bulk Operations - Trimester Admin

### Test 7.1: Calculate Subject Averages
**Objective:** Test bulk calculation of subject averages

**Steps:**
1. Navigate to /admin/trimesters
2. Find active trimester row
3. Click "Calculate" dropdown
4. Select "Calculate Subject Averages"

**Expected Results:**
- [ ] Loading indicator appears
- [ ] Progress/status message displayed
- [ ] Success notification after completion
- [ ] Subject averages updated in database
- [ ] Can verify in teacher remarks page

**Priority:** High
**Status:** ☐ Not Tested | ☐ Pass | ☐ Fail

---

### Test 7.2: Calculate Student Summaries
**Objective:** Test bulk calculation of student summaries

**Steps:**
1. Click "Calculate" dropdown
2. Select "Calculate Student Summaries"

**Expected Results:**
- [ ] Loading indicator appears
- [ ] Success notification after completion
- [ ] Student summaries created/updated
- [ ] Rankings updated
- [ ] Can verify in class ranking page

**Priority:** High
**Status:** ☐ Not Tested | ☐ Pass | ☐ Fail

---

### Test 7.3: Calculate All Now
**Objective:** Test chained calculation of both operations

**Steps:**
1. Click "Calculate" dropdown
2. Select "Calculate All Now"
3. Monitor execution

**Expected Results:**
- [ ] Subject averages calculated first
- [ ] Student summaries calculated second
- [ ] Sequential execution (not parallel)
- [ ] Single success notification
- [ ] Both operations complete successfully
- [ ] Data consistent in all pages

**Priority:** High
**Status:** ☐ Not Tested | ☐ Pass | ☐ Fail

---

## Test Suite 8: Build and TypeScript Validation

### Test 8.1: TypeScript Type Check
**Command:** `npx tsc --noEmit`
**Working Directory:** `app/ui/`

**Expected Results:**
- [ ] No TypeScript errors
- [ ] No type mismatches
- [ ] All imports resolve correctly

**Priority:** Critical
**Status:** ✓ PASSED (2026-01-03)

---

### Test 8.2: Production Build
**Command:** `npm run build`
**Working Directory:** `app/ui/`

**Expected Results:**
- [ ] Build completes successfully
- [ ] All routes built (143 routes expected)
- [ ] All static pages generated (85 pages expected)
- [ ] No build errors or warnings (except known deprecation warnings)
- [ ] Bundle size within reasonable limits

**Priority:** Critical
**Status:** ✓ PASSED (2026-01-03)

---

## Test Suite 9: Internationalization (i18n)

### Test 9.1: French Translations
**Objective:** Verify all Phase 4 UI elements display correctly in French

**Steps:**
1. Switch language to French
2. Navigate through all grading pages
3. Check labels, buttons, messages

**Expected Results:**
- [ ] All UI text translated to French
- [ ] No English fallbacks visible
- [ ] Proper grammar and accents
- [ ] Date formats use French locale

**Priority:** High
**Status:** ☐ Not Tested | ☐ Pass | ☐ Fail

---

### Test 9.2: English Translations
**Objective:** Verify all Phase 4 UI elements display correctly in English

**Steps:**
1. Switch language to English
2. Navigate through all grading pages
3. Check labels, buttons, messages

**Expected Results:**
- [ ] All UI text in English
- [ ] Proper grammar and spelling
- [ ] Consistent terminology

**Priority:** High
**Status:** ☐ Not Tested | ☐ Pass | ☐ Fail

---

## Test Suite 10: Error Handling and Edge Cases

### Test 10.1: No Active Trimester
**Objective:** Test behavior when no active trimester configured

**Steps:**
1. Deactivate all trimesters in admin
2. Navigate to grade entry page

**Expected Results:**
- [ ] Friendly error message displayed
- [ ] Guidance to configure trimesters
- [ ] No JavaScript errors
- [ ] Link to trimester admin (if applicable)

**Priority:** High
**Status:** ☐ Not Tested | ☐ Pass | ☐ Fail

---

### Test 10.2: Empty Data Sets
**Objective:** Test pages with no data

**Test Cases:**
- [ ] Grade with no students
- [ ] Grade with no subjects
- [ ] Student with no evaluations
- [ ] Trimester with no calculations

**Expected Results:**
- [ ] Empty state messages display
- [ ] Helpful icons and text
- [ ] No broken UI
- [ ] Clear instructions on what to do

**Priority:** Medium
**Status:** ☐ Not Tested | ☐ Pass | ☐ Fail

---

### Test 10.3: Network Errors
**Objective:** Test handling of API failures

**Steps:**
1. Use browser dev tools to simulate offline
2. Attempt to save grades
3. Attempt to load data

**Expected Results:**
- [ ] Error toast notifications
- [ ] User-friendly error messages
- [ ] No data loss
- [ ] Graceful degradation

**Priority:** Medium
**Status:** ☐ Not Tested | ☐ Pass | ☐ Fail

---

## Test Suite 11: Performance Testing

### Test 11.1: Large Data Sets
**Objective:** Test performance with realistic data volumes

**Test Scenarios:**
- [ ] Grade with 60 students (2× soft limit)
- [ ] 100+ evaluations to manage
- [ ] Batch download with 50+ students
- [ ] Calculate all with multiple grades

**Expected Results:**
- [ ] Pages load in <3 seconds
- [ ] No UI freezing
- [ ] Smooth scrolling
- [ ] Batch operations complete within reasonable time

**Priority:** Low
**Status:** ☐ Not Tested | ☐ Pass | ☐ Fail

---

## Test Suite 12: Security and Access Control

### Test 12.1: Route Protection
**Objective:** Verify only authorized roles can access grading features

**Test Matrix:**

| Route | Director | Academic Dir | Teacher | Accountant | Secretary |
|-------|----------|--------------|---------|------------|-----------|
| /grades/entry | ✓ | ✓ | ✓ | ✗ | ✗ |
| /grades/bulletin | ✓ | ✓ | ✓ | ✗ | ✗ |
| /grades/ranking | ✓ | ✓ | ✗ | ✗ | ✗ |
| /grades/remarks | ✓ | ✓ | ✓ | ✗ | ✗ |
| /grades/conduct | ✓ | ✓ | ✗ | ✗ | ✗ |

**Priority:** Critical
**Status:** ☐ Not Tested | ☐ Pass | ☐ Fail

---

## Regression Testing

### Critical Existing Features to Verify
After Phase 4 implementation, verify these existing features still work:

- [ ] Student enrollment workflow
- [ ] Accounting/payment processing
- [ ] Attendance tracking (non-grading)
- [ ] User authentication
- [ ] Dashboard statistics
- [ ] Activity management

**Priority:** High
**Status:** ☐ Not Tested | ☐ Pass | ☐ Fail

---

## Browser Compatibility

Test in multiple browsers:

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

**Priority:** Medium
**Status:** ☐ Not Tested | ☐ Pass | ☐ Fail

---

## Mobile Responsiveness

Test on mobile devices:

- [ ] Navigation menu works on mobile
- [ ] Tables scroll horizontally
- [ ] Forms usable on small screens
- [ ] Buttons accessible

**Priority:** Low
**Status:** ☐ Not Tested | ☐ Pass | ☐ Fail

---

## Test Execution Summary

**Total Test Suites:** 12
**Total Test Cases:** 40+

**Critical Tests:** 15
**High Priority:** 15
**Medium Priority:** 8
**Low Priority:** 2

---

## Sign-Off

**Tested By:** ___________________
**Date:** ___________________
**Build Version:** ___________________
**Test Environment:** Development / Staging / Production

**Overall Status:** ☐ Pass | ☐ Fail | ☐ Partial

**Notes:**
