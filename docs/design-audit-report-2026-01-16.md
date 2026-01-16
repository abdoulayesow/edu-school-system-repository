# Design Audit Report

**Date:** 2026-01-16
**Scope:** Accounting (Treasury), Students, Admin pages and components
**Files Scanned:** 20+
**Issues Found:** 68

## Summary

| Severity | Category | Count |
|----------|----------|-------|
| High | Non-Semantic Colors (bg-*) | 32 |
| High | Non-Semantic Colors (text-*) | 28 |
| High | Non-Semantic Colors (border-*) | 8 |

## Critical Issues by Area

---

### 1. Treasury Components (`app/ui/components/treasury/`)

#### `bank-transfer-dialog.tsx`

| Line | Current | Issue | Recommended |
|------|---------|-------|-------------|
| 140 | `bg-blue-100 dark:bg-blue-900/30` | Non-semantic decorative blue | `bg-nav-highlight/10 dark:bg-gspn-gold-900/30` |
| 141 | `text-blue-600` | Non-semantic icon color | `text-nav-highlight dark:text-gspn-gold-200` |
| 167 | `bg-blue-50 dark:bg-blue-900/20 border border-blue-200` | Non-semantic highlight | `bg-nav-highlight/10 dark:bg-gspn-gold-900/20 border-nav-highlight/30` |
| 196 | `border-red-500` | Error state | ✅ Semantic (destructive context) |
| 205 | `text-red-600` | Error state | ✅ Semantic (insufficient funds) |
| 275 | `text-red-600 bg-red-50 dark:bg-red-900/20` | Error message | ✅ Semantic (error display) |

#### `daily-opening-dialog.tsx`

| Line | Current | Issue | Recommended |
|------|---------|-------|-------------|
| 186 | `bg-green-50 dark:bg-green-950/20 ... border-green-200 dark:border-green-800` | Success/positive context | Consider `bg-emerald-50/50 dark:bg-emerald-950/20` for consistency |
| 188 | `text-green-600` | Positive value | `text-emerald-600 dark:text-emerald-400` |
| 190 | `text-orange-600` | Warning context | ✅ Semantic (warning) |
| 218 | `text-green-600` | Positive value | `text-emerald-600 dark:text-emerald-400` |

#### `record-expense-dialog.tsx`

| Line | Current | Issue | Recommended |
|------|---------|-------|-------------|
| 149 | `bg-red-100 dark:bg-red-900/30` | Expense indicator | ✅ Semantic (expense = outflow) |
| 150 | `text-red-600` | Expense icon | ✅ Semantic |
| 202 | `text-red-600` | Insufficient funds | ✅ Semantic |
| 252 | `text-red-600 bg-red-50` | Error | ✅ Semantic |

#### `record-payment-dialog.tsx`

| Line | Current | Issue | Recommended |
|------|---------|-------|-------------|
| 170 | `bg-green-100 dark:bg-green-900/30` | Income indicator | ✅ Semantic (payment = inflow) |
| 171 | `text-green-600` | Income icon | ✅ Semantic |
| 244 | `text-green-600` | Positive message | ✅ Semantic |
| 306 | `text-red-600 bg-red-50` | Error | ✅ Semantic |
| 319 | `bg-green-600 hover:bg-green-700` | Submit button | Should use brand: `bg-nav-highlight hover:bg-nav-highlight/90 text-black` |

#### `reverse-transaction-dialog.tsx`

| Line | Current | Issue | Recommended |
|------|---------|-------|-------------|
| 223 | `bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400` | Info callout | ✅ Semantic (info context) |

#### `safe-transfer-dialog.tsx`

| Line | Current | Issue | Recommended |
|------|---------|-------|-------------|
| 135 | `bg-blue-50 dark:bg-blue-950/20 ... border-blue-200 dark:border-blue-800` | Safe balance display | Consider brand: `bg-nav-highlight/10 dark:bg-gspn-gold-900/20` |
| 137 | `text-blue-600` | Safe balance | `text-nav-highlight dark:text-gspn-gold-200` |
| 139 | `bg-green-50 dark:bg-green-950/20 ... border-green-200 dark:border-green-800` | Registry balance | `bg-emerald-50/50 dark:bg-emerald-950/20` |
| 141 | `text-green-600` | Registry balance | `text-emerald-600 dark:text-emerald-400` |
| 195-204 | `text-red-600`, `text-green-600` | +/- indicators | ✅ Semantic (gain/loss) |

#### `verify-cash-dialog.tsx`

| Line | Current | Issue | Recommended |
|------|---------|-------|-------------|
| 115 | `bg-purple-100 dark:bg-purple-900/30` | Decorative | `bg-nav-highlight/10 dark:bg-gspn-gold-900/30` |
| 116 | `text-purple-600` | Icon color | `text-nav-highlight dark:text-gspn-gold-200` |
| 159-160 | `bg-green-50` / `bg-red-50` | Match/mismatch status | ✅ Semantic (success/error) |
| 166-174 | `text-green-600` / `text-red-600` | Match/mismatch | ✅ Semantic |
| 181 | `text-green-600` / `text-red-600` | Discrepancy | ✅ Semantic |
| 200 | `text-red-600` | Required field | ✅ Semantic |
| 208 | `border-red-200 focus:border-red-500` | Error state | ✅ Semantic |
| 225 | `text-red-600 bg-red-50` | Error | ✅ Semantic |
| 238 | `bg-green-600 hover:bg-green-700` | Submit button | Should use brand colors |

#### `daily-closing-dialog.tsx`

| Line | Current | Issue | Recommended |
|------|---------|-------|-------------|
| 180 | `text-green-600` | No discrepancy status | ✅ Semantic |
| 182 | `text-green-600` | No discrepancy text | ✅ Semantic |

---

### 2. Students Pages (`app/ui/app/students/`)

#### `page.tsx` (Students List)

| Line | Current | Issue | Recommended |
|------|---------|-------|-------------|
| 200 | `bg-gray-100 text-gray-600 border-gray-300 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600` | Non-semantic gray for "No Grade" badge | `bg-muted text-muted-foreground border-muted-foreground/30` |

#### `grades/page.tsx` (Grades Overview)

| Line | Current | Issue | Recommended |
|------|---------|-------|-------------|
| 166-169 | `bg-pink-500`, `bg-blue-500`, `bg-green-500`, `bg-purple-500` | Level category colors (chart/distinct) | ⚠️ Acceptable for chart legend distinction |
| 321 | `bg-yellow-100 dark:bg-yellow-900/30` | Warning indicator | ✅ Semantic (warning) |
| 322 | `text-yellow-600 dark:text-yellow-400` | Warning text | ✅ Semantic |

#### `grades/[gradeId]/view/page.tsx`

| Line | Current | Issue | Recommended |
|------|---------|-------|-------------|
| 357 | `text-green-600` | Assigned count | ✅ Semantic (positive stat) |
| 363 | `text-orange-600` | Unassigned count | ✅ Semantic (warning stat) |

#### `[id]/page.tsx` (Student Detail)

| Line | Current | Issue | Recommended |
|------|---------|-------|-------------|
| 193-197 | Activity type colors (`bg-blue-100`, `bg-green-100`, `bg-purple-100`, `bg-gray-100`) | Category distinction | ⚠️ Consider semantic alternatives or brand colors |
| 1074-1077 | `bg-blue-500/10`, `text-blue-500` | "Excused" attendance stat | ✅ Semantic (info/neutral status) |

#### `[id]/payments/page.tsx` (Student Payments)

| Line | Current | Issue | Recommended |
|------|---------|-------|-------------|
| 216 | `text-orange-500 border-orange-500` | "Orange Money" badge | ✅ Brand-specific (Orange Money brand color) |
| 236 | `text-green-600 border-green-600` | "Paid" status | Should use `text-emerald-600 border-emerald-600` for consistency |
| 243 | `text-orange-500 border-orange-500` | "Pending" status | ✅ Semantic (warning) |

---

### 3. Admin Pages (`app/ui/app/admin/`)

#### `school-years/page.tsx`

| Line | Current | Issue | Recommended |
|------|---------|-------|-------------|
| 145 | `bg-green-500` | "Active" badge | `bg-emerald-500` or semantic `bg-success` |
| 147 | `bg-blue-500` | "New" badge | Should use brand: `bg-nav-highlight text-black` |
| 395 | `text-green-500` | Active icon | `text-emerald-500` |
| 412 | `text-blue-500` | New icon | `text-nav-highlight dark:text-gspn-gold-200` |

#### `grades/page.tsx` (Admin Grades)

| Line | Current | Issue | Recommended |
|------|---------|-------|-------------|
| 256-259 | Level colors (`bg-pink-500`, `bg-blue-500`, etc.) | Chart/legend | ⚠️ Acceptable for distinct categories |
| 696 | `text-green-500` | Active indicator | `text-emerald-500` |
| 772 | `text-green-600` | Capacity status | ✅ Semantic (positive) |

#### `activities/page.tsx`

| Line | Current | Issue | Recommended |
|------|---------|-------|-------------|
| 238 | `bg-gray-100 text-gray-800` | "Draft" status | `bg-muted text-muted-foreground` |
| 239 | `bg-green-100 text-green-800` | "Active" status | `bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400` |
| 240 | `bg-yellow-100 text-yellow-800` | "Closed" status | ✅ Semantic (warning/attention) |
| 241 | `bg-blue-100 text-blue-800` | "Completed" status | ✅ Semantic (info/done) |
| 242 | `bg-red-100 text-red-800` | "Cancelled" status | ✅ Semantic (destructive) |

#### `trimesters/page.tsx`

| Line | Current | Issue | Recommended |
|------|---------|-------|-------------|
| 587 | `text-green-500` | Active icon | `text-emerald-500` |
| 677 | `bg-green-500` | "Active" badge | `bg-emerald-500` |

#### `users/page.tsx`

| Line | Current | Issue | Recommended |
|------|---------|-------|-------------|
| 179 | `bg-green-500` | "Active" badge | `bg-emerald-500` |
| 205-212 | Role colors (`bg-purple-500`, `bg-blue-500`, `bg-green-500`, `bg-cyan-500`, `bg-gray-500`) | Role distinction | ⚠️ Consider using brand shades or a unified palette |
| 263 | `text-orange-500` | Pending icon | ✅ Semantic (warning) |
| 275 | `text-green-500` | Active icon | `text-emerald-500` |
| 287 | `text-red-500` | Blocked icon | ✅ Semantic (destructive) |

#### `teachers/page.tsx`

| Line | Current | Issue | Recommended |
|------|---------|-------|-------------|
| 413 | `text-orange-500` | Warning icon | ✅ Semantic |
| 493 | `text-orange-500 border-orange-500` | Warning badge | ✅ Semantic |

---

## Recommendations

### Immediate Fixes (High Priority)

1. **Treasury Components** - Replace decorative blues/purples with brand colors:
   - `bank-transfer-dialog.tsx`: Lines 140-141, 167
   - `safe-transfer-dialog.tsx`: Lines 135-137
   - `verify-cash-dialog.tsx`: Lines 115-116
   - `record-payment-dialog.tsx`: Line 319 (submit button)
   - `verify-cash-dialog.tsx`: Line 238 (submit button)

2. **Students Pages**:
   - `page.tsx`: Line 200 - Replace gray with muted tokens
   - `[id]/page.tsx`: Lines 193-197 - Consider brand-based category colors

3. **Admin Pages**:
   - `school-years/page.tsx`: Lines 145, 147, 395, 412 - Use emerald/brand
   - `activities/page.tsx`: Lines 238-239 - Use muted/emerald
   - `trimesters/page.tsx`: Lines 587, 677 - Use emerald
   - `users/page.tsx`: Lines 179, 275 - Use emerald

### Acceptable Patterns (No Change Needed)

- **Semantic status colors**: red for errors/destructive, yellow/amber for warnings, green/emerald for success
- **Chart/legend distinctions**: Different colors needed for visual differentiation in charts
- **Brand-specific colors**: Orange for "Orange Money" (brand recognition)

### Design Token Replacements

| Non-Semantic | Semantic Replacement |
|--------------|---------------------|
| `bg-blue-*` (decorative) | `bg-nav-highlight/*` / `bg-gspn-gold-*` |
| `bg-gray-*` | `bg-muted` |
| `bg-green-*` (success) | `bg-emerald-*` |
| `text-blue-*` (decorative) | `text-nav-highlight` / `text-gspn-gold-*` |
| `text-gray-*` | `text-muted-foreground` |
| `text-green-*` (success) | `text-emerald-*` |
| `border-gray-*` | `border-muted` / `border-muted-foreground/*` |

---

## Files Modified Checklist

### Treasury Components
- [ ] `bank-transfer-dialog.tsx` - 3 decorative issues
- [ ] `daily-opening-dialog.tsx` - 2 consistency issues
- [ ] `record-payment-dialog.tsx` - 1 button issue
- [ ] `safe-transfer-dialog.tsx` - 4 decorative issues
- [ ] `verify-cash-dialog.tsx` - 3 decorative issues + 1 button

### Students Pages
- [ ] `app/students/page.tsx` - 1 issue
- [ ] `app/students/[id]/page.tsx` - 4 category color issues
- [ ] `app/students/[id]/payments/page.tsx` - 1 consistency issue

### Admin Pages
- [ ] `app/admin/school-years/page.tsx` - 4 issues
- [ ] `app/admin/activities/page.tsx` - 2 issues
- [ ] `app/admin/trimesters/page.tsx` - 2 issues
- [ ] `app/admin/users/page.tsx` - 3 issues + role colors discussion

---

## Prevention

1. **ESLint Rule**: Consider adding a custom ESLint rule to warn on non-semantic Tailwind color classes
2. **PR Checklist**: Add design token verification to PR review process
3. **Reference Pages**: Use `/style-guide` and `/brand` pages to verify correct token usage
