# Grading Feature Analysis — `/students/grading`

**Date**: 2026-02-10
**Branch**: `feature/finalize-accounting-users`
**Scope**: Full analysis of grading module — architecture, workflows, design compliance, and code quality

---

## 1. Architecture Overview

### Route Structure (5 sub-pages under shared layout)

```
/students/grading/                     → Overview dashboard (page.tsx, 602 lines)
/students/grading/entry                → Grade entry + manage evaluations (page.tsx + 11 _components)
/students/grading/bulletin             → Individual student report cards (page.tsx, 700 lines)
/students/grading/ranking              → Class rankings with stats (page.tsx, 469 lines)
/students/grading/conduct              → Conduct, remarks, decisions (page.tsx, 603 lines)
```

### Component Hierarchy

```
layout.tsx (118 lines)
├── CalculationStatusBanner (539 lines — shared component)
├── Tab navigation (Link-based, 5 tabs with icons)
└── {children} — page-specific content

Shared Components (components/grading/):
├── calculation-status-banner.tsx   → Real-time calculation status + history
├── conduct-table.tsx               → Editable conduct scores grid
├── remarks-table.tsx               → Editable general remarks grid
├── decisions-table.tsx             → Decision dropdown grid
├── decision-badge.tsx              → Styled decision type indicator
└── index.ts                        → Barrel export

Entry Page Sub-Components (entry/_components/):
├── grade-entry-tab.tsx (677 lines) → Core grade entry form
├── manage-evaluations-tab.tsx (446 lines) → View/edit/delete evaluations
├── score-entry-table.tsx           → Student score input grid
├── subject-remarks-section.tsx (220 lines) → Per-subject teacher remarks
├── evaluations-table.tsx           → Evaluations data table
├── edit-evaluation-dialog.tsx      → Edit single evaluation
├── delete-evaluation-dialog.tsx    → Delete confirmation
├── recalculate-prompt-dialog.tsx   → Post-edit recalculation prompt
├── success-banner.tsx              → Post-save success message
├── draft-restore-dialog.tsx        → Auto-saved draft prompt
└── keyboard-help-dialog.tsx        → Ctrl+S and shortcuts guide

Custom Hooks:
├── use-grade-entry-preferences.ts  → localStorage persistence for selections
├── use-batch-bulletin-download.tsx → ZIP generation for bulk PDF export
└── use-url-filters (shared)        → URL-synced filter state
```

### Database Models (6 core tables)

| Model | Purpose | Key Relations |
|-------|---------|---------------|
| `Evaluation` | Individual score records | → StudentProfile, GradeSubject, Trimester |
| `SubjectTrimesterAverage` | Calculated subject averages per student/trimester | → StudentProfile, GradeSubject, Trimester |
| `StudentTrimester` | Student summary (rank, GPA, conduct, decision) | → StudentProfile, Trimester |
| `ClassTrimesterStats` | Aggregate class statistics | → Grade, Trimester |
| `CalculationLog` | Audit trail for calculation runs | → Trimester, User |
| `GradeSubject` | Subject-to-grade mapping with coefficient | → Grade, Subject |

### API Routes (10 endpoints)

| Endpoint | Methods | Purpose |
|----------|---------|---------|
| `/api/evaluations` | GET, POST | List/create evaluations |
| `/api/evaluations/[id]` | PUT, DELETE | Update/delete single evaluation |
| `/api/evaluations/bulletin` | GET | Fetch complete bulletin data for a student |
| `/api/evaluations/calculate-averages` | GET, POST | Calculate/fetch subject averages |
| `/api/evaluations/student-summary` | GET, POST | Calculate/fetch student summaries |
| `/api/evaluations/student-summary/[id]` | PUT | Update conduct/remarks/decisions |
| `/api/evaluations/subject-averages/remarks` | PUT | Batch update teacher remarks |
| `/api/evaluations/progress` | GET | Trimester progress dashboard data |
| `/api/evaluations/calculation-status` | GET | Real-time calculation freshness |
| `/api/evaluations/calculation-history` | GET | Past calculation audit log |

---

## 2. User Workflows

### Workflow 1: Grade Entry (Primary — Teacher Daily Task)

```
Teacher Flow:
1. Open /students/grading/entry → "Entry" tab
2. Select Grade → Subject → Evaluation Type (Interrogation/DS/Composition) → Date → Max Score
3. Enter scores for each student in the score grid (Tab/Enter navigation)
4. Save all grades (Ctrl+S shortcut) → API POST /api/evaluations (batch)
5. Success banner with quick re-entry option (next evaluation type)
6. Subject remarks section auto-loads below → enter per-student teacher remarks
7. Save remarks → API PUT /api/evaluations/subject-averages/remarks

Smart Features:
- Auto-saves draft every 30 seconds to localStorage
- Restores last-used grade/subject/type from preferences
- Draft restore dialog on return to unsaved work
- Keyboard shortcut (Ctrl+S) for save
- Score validation (0 to maxScore, numeric only)
```

### Workflow 2: Manage Evaluations (Edit/Delete)

```
Teacher/Admin Flow:
1. Open /students/grading/entry → "Manage" tab
2. Filter by: Grade → Subject → Type → Search by student name
3. View evaluations table with scores, dates, types
4. Edit: Opens dialog with score/date/notes fields → PUT /api/evaluations/[id]
5. Delete: Confirmation dialog → DELETE /api/evaluations/[id]
6. After edit/delete: Recalculate prompt dialog → triggers bulk recalculation
```

### Workflow 3: Conduct, Remarks & Decisions

```
Admin/Teacher Flow:
1. Open /students/grading/conduct
2. Select Grade → loads student summaries
3. Three sub-tabs:
   a. Conduct: Enter conduct score (0-20), absences count, lates count
   b. Remarks: Enter general remark per student (free text)
   c. Decisions: Select admis/rattrapage/redouble per student
4. Save changes → individual PUT /api/evaluations/student-summary/[id] per student
5. Changed count badge shows unsaved modifications
```

### Workflow 4: Bulletin (Report Card)

```
Parent/Admin Flow:
1. Open /students/grading/bulletin
2. Select Trimester → Grade → Student (cascading dropdowns)
3. View full bulletin:
   - Student info header with avatar and general average
   - Summary stats: Rank, Conduct, Absences, Lates, Decision
   - Class comparison: Highest, Class Average, Lowest, Pass Rate
   - Subject results table: I / DS / Composition / Average / Remark per subject
   - General remark section
4. Download individual PDF → client-side @react-pdf/renderer
5. Batch download all class bulletins → ZIP archive (JSZip)
```

### Workflow 5: Class Ranking

```
Admin Flow:
1. Open /students/grading/ranking
2. Select Trimester → Grade
3. View:
   - Class statistics: Total students, Class average, Highest, Lowest, Pass rate
   - Ranking table: Rank (with medals for top 3), Student, Average/20, Progress bar, Conduct, Decision
4. Download all bulletins as ZIP

```

### Workflow 6: Overview Dashboard (Coordinator View)

```
Admin/Coordinator Flow:
1. Open /students/grading (overview)
2. See summary cards: Classes count, Complete, In Progress, Rankings Ready
3. Overall progress bars: Compositions entered, Bulletins ready
4. "Calculate All Now" button → triggers full recalculation
5. Missing compositions alert (up to 10) with direct "Enter Grade" links
6. Quick action links to all sub-pages
7. Progress by class: Expandable rows showing subject-level detail
   - Per subject: Interrogations / DS / Compositions count, Average status
```

### Workflow 7: Calculation Pipeline (Background)

```
System Flow (triggered manually by admin):
1. "Calculate All Now" from overview or CalculationStatusBanner
2. Step 1: POST /api/evaluations/calculate-averages
   → For each student×subject: weighted average of evaluations
   → Upserts SubjectTrimesterAverage records
3. Step 2: POST /api/evaluations/student-summary
   → For each student: general average (weighted sum of subject averages)
   → Rank calculation within grade
   → Auto-decision (>=10 admis, >=8 rattrapage, <8 redouble)
   → Upserts StudentTrimester records
   → Upserts ClassTrimesterStats
4. CalculationLog audit trail records metrics + duration
5. CalculationStatusBanner refreshes every 30s to detect stale data
```

---

## 3. Frontend Design & Brand Compliance Audit

### Compliant Patterns (Good)

| Pattern | Usage | Verdict |
|---------|-------|---------|
| Page header with maroon icon container | All 5 pages + layout | Consistent |
| Card title maroon dot indicator | All cards across pages | Consistent |
| `componentClasses.primaryActionButton` (gold CTA) | Calculate, Save, Download buttons | Consistent |
| `componentClasses.tableHeaderRow` (gold tint) | All data tables | Consistent |
| `componentClasses.tableRowHover` | All table rows | Consistent |
| `componentClasses.tabButtonBase/Active/Inactive` | Layout tabs + conduct sub-tabs | Consistent |
| Maroon accent bar `h-1 bg-gspn-maroon-500` | Layout header | Correct |
| `Loader2` with `text-gspn-maroon-500` | All loading states | Consistent |
| `PageContainer maxWidth="full"` or `"lg"` | All pages | Consistent |
| Design tokens from `@/lib/design-tokens` | Used throughout | Good |
| `font-mono tabular-nums` for score display | Bulletin, ranking tables | Correct |

### Non-Compliant / Inconsistent Patterns

| Issue | Location | Detail |
|-------|----------|--------|
| **Emerald/teal used for success states** | overview `page.tsx:275`, conduct, various | Not in brand palette — should use gold for success or green with dark mode variant |
| **Blue for score 10-14** | `grading-utils.ts:68` | `text-blue-600` — not in brand color system |
| **Amber/yellow for in-progress** | overview `page.tsx:287-298` | Amber is OK for warnings but inconsistent with gold brand color |
| **`text-primary` for averages** | bulletin `page.tsx:404,313` | Uses theme `primary` instead of explicit brand color — acceptable if primary maps to maroon |
| **`text-success`** | ranking `page.tsx:323,347` | Non-standard Tailwind class — may not be defined in theme |
| **Bulletin back link to `/students/grades`** | bulletin `page.tsx:236`, ranking `page.tsx:204` | Wrong route — should be `/students/grading` (the current section root) |
| **Overview page has its own header** | `page.tsx:224-252` | Duplicates layout header (icon + title), since layout already renders the section header |
| **Grade Entry tab has its own header** | `grade-entry-tab.tsx:428-474` | Same — renders a second page header inside the entry tab |
| **Manage Evaluations tab has its own header** | `manage-evaluations-tab.tsx:281-300` | Same pattern — third header duplication |
| **Conduct page has its own header** | `conduct/page.tsx:442-461` | Fourth header duplication |
| **No `<PermissionGuard>` on several action buttons** | overview "Calculate All" (`page.tsx:326`), conduct "Save" has it but not overview calculate | Inconsistent permission protection |

### Score Color System (Non-Brand)

The `getScoreColor()` function in `grading-utils.ts` uses generic semantic colors, not the GSPN brand palette:

```
>= 14 → green-600   (excellent)
>= 10 → blue-600    (good)        ← blue not in brand
>=  8 → yellow-600  (at risk)
<   8 → red-600     (failing)
```

This is a deliberate UX choice (semantic colors for academic scores are universally understood), but blue specifically is not in the brand system.

---

## 4. Clean Code & Refactoring Analysis

### Strengths

1. **Well-organized type system** — `lib/types/grading.ts` (412 lines) is comprehensive with sections for each page, proper JSDoc, and raw API response types
2. **Shared utilities** — `lib/grading-utils.ts` centralizes decision config, score colors, and progress colors
3. **Barrel exports** — `components/grading/index.ts` cleanly exports shared components
4. **Custom hooks** — `useGradeEntryPreferences`, `useBatchBulletinDownload` properly encapsulate complex logic
5. **Proper use of `useMemo`/`useCallback`** — Derived data and stable callbacks throughout
6. **PermissionGuard** — Used on critical actions (bulletin download, conduct save, grade save)
7. **i18n coverage** — Extensive translation keys used throughout; `locale === "fr"` ternaries only for DB data
8. **Error handling** — Toast notifications on all mutation failures, error states for page-level fetches
9. **Design tokens** — `componentClasses`, `typography`, `sizing` used consistently
10. **Separated table components** — `ConductTable`, `DecisionsTable`, `RemarksTable` extracted to shared components

### Issues Found

#### HIGH Priority

| # | Issue | Location | Impact |
|---|-------|----------|--------|
| 1 | **Duplicate page headers** — Layout renders section header, but 4 of 5 content pages render their own header too | overview, entry tabs, conduct | Double header visible to users. Either remove layout header or remove per-page headers |
| 2 | **Wrong back-link routes** — Links point to `/students/grades` which doesn't exist | bulletin:236, ranking:204 | Broken navigation — should be `/students/grading` |
| 3 | **Duplicate `handleCalculateAll` logic** — Identical 2-step calculation (averages → summaries) implemented in 3 places | overview:93-133, calculation-status-banner:113-167, manage-evaluations-tab:247-276 | Violation of DRY — extract to shared hook `useCalculation()` |
| 4 | **Silent error on fetchSummaries** | conduct:187-189 | `console.error` without toast — user sees empty table with no explanation |

#### MEDIUM Priority

| # | Issue | Location | Impact |
|---|-------|----------|--------|
| 5 | **Duplicate filter/selection pattern** — Trimester + Grade dropdowns with identical fetch logic appear in 4 pages | bulletin, ranking, conduct, entry | ~60 lines duplicated per page. Extract to shared `useGradingFilters()` hook |
| 6 | **Duplicate `handleDownloadAllBulletins` callbacks** — Near-identical callbacks in bulletin and ranking pages | bulletin:84-114, ranking:140-170 | Both construct the same options object and call the shared hook — could extract further |
| 7 | **Large page components** — Overview (602 lines), bulletin (700 lines), grade-entry-tab (677 lines) | Multiple files | Each could benefit from extracting sub-sections into components |
| 8 | **`useEffect` dependency warnings suppressed** — Empty deps `[]` on fetch effects | All pages | React will warn about missing deps (t, toast). Consider wrapping in `useCallback` or using a data-fetching pattern |
| 9 | **No loading skeleton** — All pages show a single centered spinner | All pages | Could use skeleton cards/tables for better perceived performance |
| 10 | **Class stats calculated client-side in ranking page** | ranking:106-126 | DB already has `ClassTrimesterStats` model — should fetch from API instead of computing in browser |

#### LOW Priority

| # | Issue | Location | Impact |
|---|-------|----------|--------|
| 11 | **Mixed `Map` and object state** — Conduct page uses `Map<string, ConductEntry>` while grade entry uses the same pattern | conduct, entry | Maps are fine but harder to debug — consider consistent approach |
| 12 | **`formatScore` unused in bulletin** | bulletin:205-208 | Defined but not called — all score formatting is inline |
| 13 | **Save handler fires individual PUTs** | conduct:316-356 | N individual requests for N students — should batch to a single API call |
| 14 | **`PageContainer` wraps some but not all pages** | Some use full layout, some use PageContainer | Bulletin and ranking use `PageContainer maxWidth="lg"` while overview/conduct/entry use `"full"` — intentional but inconsistent |
| 15 | **Hard-coded score thresholds** | `grading-utils.ts` and various inline | Decision thresholds (10, 8), score color thresholds (14, 10, 8) — should be configurable constants |

---

## 5. Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    GRADE ENTRY FLOW                          │
│                                                              │
│  Teacher enters scores → POST /api/evaluations (batch)       │
│                              │                               │
│                              ▼                               │
│                    ┌─────────────────┐                       │
│                    │   Evaluation    │                       │
│                    │   (raw scores)  │                       │
│                    └────────┬────────┘                       │
│                             │                                │
│            "Calculate All" triggers                          │
│                             │                                │
│           ┌─────────────────┼─────────────────┐              │
│           ▼                 ▼                  ▼              │
│  ┌──────────────┐  ┌───────────────┐  ┌──────────────┐      │
│  │ SubjectTrim. │  │ StudentTrim.  │  │ ClassTrim.   │      │
│  │   Average    │  │  (summary)    │  │   Stats      │      │
│  └──────────────┘  └───────────────┘  └──────────────┘      │
│         │                  │                  │              │
│         ▼                  ▼                  ▼              │
│     Bulletin           Rankings          Class Stats         │
│     (per student)      (per class)       (aggregates)        │
│         │                  │                                 │
│         ▼                  ▼                                 │
│    PDF Download       PDF Batch ZIP                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. Summary Statistics

| Metric | Count |
|--------|-------|
| Total files in grading feature | ~30 |
| Total lines of code (approx) | ~5,500 |
| API endpoints | 10 |
| Database models | 6 |
| Custom hooks | 3 |
| Shared components | 6 |
| Page-level components | 5 |
| Entry sub-components | 11 |
| Type definitions | 25+ interfaces |
| i18n keys (grading section) | ~100+ |
| Dialogs | 5 (edit, delete, recalculate, draft restore, keyboard help) |

---

## 7. Top Recommendations (Prioritized)

### Quick Wins (1-2 hours each)

1. **Fix duplicate headers** — Remove per-page headers from overview, entry tabs, conduct; let layout handle it
2. **Fix broken back-links** — `/students/grades` → `/students/grading`
3. **Add toast to `fetchSummaries`** error in conduct page
4. **Remove unused `formatScore`** from bulletin page

### Medium Effort (2-4 hours each)

5. **Extract `useCalculation()` hook** — Consolidate the 3 duplicate calculate-averages-then-summaries flows
6. **Extract `useGradingFilters()` hook** — Shared trimester+grade selection with auto-select active trimester
7. **Batch conduct save API** — Replace N individual PUTs with single batch endpoint
8. **Fetch `ClassTrimesterStats` from DB** in ranking page instead of computing client-side

### Larger Refactors (4+ hours)

9. **Break up large pages** — Extract summary cards, progress sections, filter cards into sub-components
10. **Add skeleton loading states** — Replace spinner with skeleton cards/tables
11. **Standardize score color system** — Document the deliberate departure from brand colors for academic scores, or align with brand

---

## 8. Key Files Reference

| File | Lines | Role |
|------|-------|------|
| `app/students/grading/layout.tsx` | 118 | Shared layout with tab navigation |
| `app/students/grading/page.tsx` | 602 | Overview dashboard |
| `app/students/grading/entry/page.tsx` | 119 | Entry page shell (tabs) |
| `entry/_components/grade-entry-tab.tsx` | 677 | Core grade entry form |
| `entry/_components/manage-evaluations-tab.tsx` | 446 | Evaluation management |
| `entry/_components/subject-remarks-section.tsx` | 220 | Teacher remarks per subject |
| `app/students/grading/bulletin/page.tsx` | 700 | Report card viewer |
| `app/students/grading/ranking/page.tsx` | 469 | Class rankings |
| `app/students/grading/conduct/page.tsx` | 603 | Conduct/remarks/decisions |
| `components/grading/calculation-status-banner.tsx` | 539 | Real-time calculation status |
| `hooks/use-batch-bulletin-download.tsx` | 105 | Batch PDF ZIP export |
| `hooks/use-grade-entry-preferences.ts` | ~100 | localStorage preferences |
| `lib/types/grading.ts` | 412 | All grading type definitions |
| `lib/grading-utils.ts` | 87 | Score colors, decisions, progress |
