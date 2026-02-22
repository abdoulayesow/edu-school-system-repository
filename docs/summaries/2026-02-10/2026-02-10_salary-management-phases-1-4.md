# Session Summary: Salary Management Feature (Phases 1-4 Progress)

**Date:** 2026-02-10
**Branch:** `feature/finalize-accounting-users`
**Plan:** `C:\Users\cps_c\.claude\plans\kind-munching-kahn.md`

---

## Overview

Implementing a comprehensive salary management system across 5 phases. This session completed Phases 1E through Phase 3, and started Phase 4. The system handles hours tracking (wall-crossing), salary payments with treasury integration, advances with recoupment, and rate management.

## Completed Work

### Phase 1E: Shared Types & API Hooks (COMPLETE)
- Created `lib/types/salary.ts` — 324-line shared types file with all salary interfaces
- Added 16 React Query hooks to `lib/hooks/use-api.ts` (rates, hours, payments, advances)
- Added 4 query key factories and 4 invalidation methods

### Phase 2: Rate Management Admin Page (COMPLETE)
- Created `app/api/salary-rates/route.ts` — GET (list/filter) + POST (create with auto-close)
- Created `app/api/salary-rates/[id]/route.ts` — GET + PATCH + DELETE (payment-protected)
- Created `app/admin/salary-rates/page.tsx` — Full admin page with:
  - GSPN brand header (maroon accent bar + Calculator icon)
  - Staff table with gold-tinted headers, grouped by user
  - Expandable rate history per staff member
  - FormDialog (maroon accent) for create/update rates
  - AlertDialog for delete confirmation
  - PermissionGuard on all action buttons
  - useToast for mutation feedback
  - Search + type filter

### Phase 3: Hours Tracking API & UI (COMPLETE)
- Created 5 API routes:
  - `app/api/salary-hours/route.ts` — GET (list/filter) + POST (create draft)
  - `app/api/salary-hours/[id]/route.ts` — GET + PATCH + DELETE (draft only)
  - `app/api/salary-hours/[id]/submit/route.ts` — POST: draft → submitted
  - `app/api/salary-hours/[id]/review/route.ts` — POST: submitted → approved/rejected
  - `app/api/salary-hours/bulk/route.ts` — POST: bulk create drafts
- Created `app/accounting/salaries/page.tsx` — Main salaries page shell with:
  - 3 tabs (Hours, Payments, Advances) controlled by permissions
  - `usePermissions()` batch check for tab visibility
  - Month/year/school-year selectors
  - GSPN brand header with school year badge
- Created `app/accounting/salaries/_components/hours-tab.tsx` — Hours tab with:
  - 5 stat cards (Total Hours, Draft, Submitted, Approved, Rejected)
  - Hours records table with status badges and action buttons
  - Submit flow (draft → submitted) with AlertDialog confirmation
  - Review flow (submitted → approved/rejected) with FormDialog
  - PermissionGuard: `salary_hours.create` for submit, `salary_hours.approve` for review

### Phase 4: Salary Payments API (STARTED — NOT COMPLETE)
- Task #8 was set to in_progress
- Explored the expense pay route pattern for treasury integration reference
- **NOT YET CREATED**: salaries API routes, payments-tab component, generate/approve/pay endpoints

## Key Files Modified

| File | Change |
|------|--------|
| `app/ui/lib/types/salary.ts` | **NEW** — All shared salary types (324 lines) |
| `app/ui/lib/hooks/use-api.ts` | +446 lines — 16 hooks, query keys, invalidation methods |
| `app/ui/app/api/salary-rates/route.ts` | **NEW** — GET + POST |
| `app/ui/app/api/salary-rates/[id]/route.ts` | **NEW** — GET + PATCH + DELETE |
| `app/ui/app/admin/salary-rates/page.tsx` | **NEW** — Admin rate management page |
| `app/ui/app/api/salary-hours/route.ts` | **NEW** — GET + POST |
| `app/ui/app/api/salary-hours/[id]/route.ts` | **NEW** — GET + PATCH + DELETE |
| `app/ui/app/api/salary-hours/[id]/submit/route.ts` | **NEW** — Submit hours |
| `app/ui/app/api/salary-hours/[id]/review/route.ts` | **NEW** — Approve/reject hours |
| `app/ui/app/api/salary-hours/bulk/route.ts` | **NEW** — Bulk create drafts |
| `app/ui/app/accounting/salaries/page.tsx` | **NEW** — Main salaries page with tabs |
| `app/ui/app/accounting/salaries/_components/hours-tab.tsx` | **NEW** — Hours tracking tab |
| `app/ui/lib/permissions-v2.ts` | +42 lines — Salary permission groups (done in prior session) |
| `app/ui/lib/nav-config.ts` | +20 lines — Salaries + salary-rates nav items (done in prior session) |
| `app/ui/lib/i18n/en.ts` | +207 lines — Salary i18n keys (done in prior session) |
| `app/ui/lib/i18n/fr.ts` | +207 lines — French translations (done in prior session) |

## Type Check Status

- **8 pre-existing errors** (grading pages, payment-review-dialog, permissions-v2)
- **0 errors** in any salary code
- Previously had 2 salary-rates errors (`staffRole` missing from interface) — FIXED

## Remaining Tasks

### Phase 4: Salary Payments API & UI (IN PROGRESS)
Files to create:
- `app/api/salaries/route.ts` — GET (list) + POST (calculate single salary)
- `app/api/salaries/[id]/route.ts` — GET (detail)
- `app/api/salaries/[id]/approve/route.ts` — POST: pending → approved/cancelled
- `app/api/salaries/[id]/pay/route.ts` — POST: approved → paid (SafeTransaction + TreasuryBalance)
- `app/api/salaries/generate/route.ts` — POST: bulk generate for all staff
- `app/accounting/salaries/_components/payments-tab.tsx` — Payments table, stats, actions
- `app/accounting/salaries/_components/salary-stats.tsx` — Stats cards

**Key reference:** Follow `app/api/expenses/[id]/pay/route.ts` pattern for treasury integration.

**Calculation logic:**
1. Find active SalaryRate for user
2. If hourly: grossAmount = totalHours × hourlyRate (from approved HoursRecord)
3. If fixed: grossAmount = fixedMonthly
4. Calculate advance deductions from active SalaryAdvances
5. netAmount = gross - advanceDeduction - otherDeductions
6. Create SalaryPayment + AdvanceRecoupment records in transaction

### Phase 5: Advances & Recoupment (PENDING)
Files to create:
- `app/api/salary-advances/route.ts` — GET + POST (with SafeTransaction for disbursement)
- `app/api/salary-advances/[id]/route.ts` — GET + PATCH (change strategy, cancel)
- `app/accounting/salaries/_components/advances-tab.tsx` — Advances table, new advance dialog

**Recoupment strategies:** full, spread, custom

## Design Patterns Used

- **GSPN Brand**: Maroon accent bars, gold CTAs, design tokens from `lib/design-tokens.ts`
- **FormDialog**: Maroon accent for admin, blue for hours entry, emerald/red for review
- **PermissionGuard**: On every action button (create, update, delete, submit, approve)
- **useToast**: For all mutation feedback
- **AlertDialog**: For destructive/irreversible actions (delete, submit)
- **usePermissions batch check**: For tab visibility in salaries page
- **Auto-close pattern**: Creating new rate auto-closes previous active rate (transaction)
- **Status guards**: API routes enforce status transitions (draft→submitted→approved/rejected)

## Important Notes

- **THE WALL crossing**: Academic directors (proviseur, censeur, directeur) can access `/accounting/salaries` via middleware exception
- **SafeTransactionType** enum already has `salary_payment` and `salary_advance` values
- **PaymentMethod** enum from Prisma is used for salary payments (cash, orange_money)
- Treasury integration pattern: Use `prisma.$transaction` with TreasuryBalance check before deducting
- The salaries Payments and Advances tab placeholders exist — replace with real components in Phase 4/5
- `usePermissions([...])` returns `{ can, loading }` — NOT `checkPermission`

---

## Resume Prompt

```
Resume salary management implementation (Phases 4-5).

IMPORTANT: Follow token optimization patterns from `.claude/skills/summary-generator/guidelines/token-optimization.md`:
- Use Grep before Read for searches
- Use Explore agent for multi-file exploration
- Reference this summary instead of re-reading files
- Keep responses concise

## Context
Session summary: docs/summaries/2026-02-10_salary-management-phases-1-4.md
Plan: C:\Users\cps_c\.claude\plans\kind-munching-kahn.md
Branch: feature/finalize-accounting-users

## Current Status
- Phases 1-3: COMPLETE (schema, permissions, nav, i18n, types, hooks, rate admin, hours API/UI)
- Phase 4: IN PROGRESS — task #8. Need to create salary payments API routes and payments-tab UI
- Phase 5: PENDING — task #9. Advances & recoupment API and UI

## What to Build Next (Phase 4)
1. Create salary payment API routes:
   - `app/ui/app/api/salaries/route.ts` — GET + POST
   - `app/ui/app/api/salaries/[id]/route.ts` — GET detail
   - `app/ui/app/api/salaries/[id]/approve/route.ts` — approve/cancel
   - `app/ui/app/api/salaries/[id]/pay/route.ts` — pay with treasury integration
   - `app/ui/app/api/salaries/generate/route.ts` — bulk generate
2. Create payments-tab.tsx to replace placeholder in salaries/page.tsx
3. Follow expense pay route pattern: `app/ui/app/api/expenses/[id]/pay/route.ts`

## Key References
- Expense pay route (treasury pattern): `app/ui/app/api/expenses/[id]/pay/route.ts`
- Shared types: `app/ui/lib/types/salary.ts`
- API hooks (already created): `app/ui/lib/hooks/use-api.ts` (lines 1637-1920+)
- i18n keys: `t.salaries.payments.*` and `t.salaries.stats.*`
- Design tokens: `app/ui/lib/design-tokens.ts`

## User Preferences
- Use `frontend-design` skill for UI pages
- Follow GSPN brand guide (maroon + gold)
- Follow clean code patterns (useToast, PermissionGuard, AlertDialog, i18n)
```
