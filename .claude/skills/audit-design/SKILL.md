---
name: audit-design
description: Audit the codebase for design inconsistencies. Scans for hardcoded colors, incorrect font usage, missing design tokens, and generates a report with fixes. Use when UI looks inconsistent or before major releases.
model: sonnet
allowed-tools: Read, Glob, Grep, Bash(wc:*), Write
---

# Design Audit Skill

Scan the codebase for visual inconsistencies and design token violations. Generates a comprehensive report with specific file locations and recommended fixes.

## When to Use

- Before major releases to ensure visual consistency
- When the UI "feels off" with inconsistent colors/fonts
- After onboarding new developers to check their work
- Periodically to prevent design debt accumulation

## Usage

```
/audit-design                    # Full audit
/audit-design colors             # Only check color usage
/audit-design typography         # Only check font/text usage
/audit-design spacing            # Only check spacing consistency
```

## What It Checks

### 1. Hardcoded Colors (Critical)

Scans for hex colors that should use design tokens:

**Violations:**
- `#8B2332` → Should use `bg-gspn-maroon-500` or `bg-primary`
- `#D4AF37` → Should use `bg-gspn-gold-500` or `bg-accent`
- `#ff0000`, `#f00` → Should use `bg-destructive`
- `rgb(...)`, `rgba(...)` → Should use CSS variables or Tailwind

**Exceptions (Allowed):**
- Inside `globals.css` (token definitions)
- Inside `design-tokens.ts`
- SVG fill/stroke for brand logos
- Comments and documentation

### 2. Non-Semantic Tailwind Colors (High)

Scans for direct Tailwind color classes instead of semantic tokens:

**Violations:**
- `bg-red-500` → Should use `bg-destructive`
- `text-green-600` → Should use `text-success`
- `border-blue-400` → Should use `border-primary` or `border-accent`
- `bg-gray-100` → Should use `bg-muted` or `bg-card`

**Exceptions:**
- Chart/visualization components (need distinct colors)
- Status indicators using `gradients` tokens

### 3. Typography Inconsistencies (High)

Scans for font usage that bypasses design tokens:

**Violations:**
- Raw `text-3xl font-bold` → Should use `typography.heading.page`
- `font-sans` without semantic meaning → Should use `font-display` for headings
- Inconsistent heading levels (h1 styled like h3)

**Check for:**
- Headings not using `font-display` or `font-heading`
- Stats/numbers not using `font-mono` or `typography.stat`
- Currency not using `typography.currency`

### 4. Spacing Inconsistencies (Medium)

Scans for spacing that doesn't match tokens:

**Violations:**
- `p-7` or `p-9` → Should use `spacing.card.sm/md/lg`
- `gap-3` mixed with `gap-4` in similar contexts
- Inconsistent container max-widths

### 5. Shadow Usage (Low)

Scans for shadow inconsistencies:

**Violations:**
- Custom `shadow-[...]` → Should use `shadows` tokens
- Mixing shadow levels inconsistently

## Audit Process

### Step 1: Scan for Hardcoded Colors

```bash
# Find hex colors in TSX files (excluding token files)
grep -rn "#[0-9a-fA-F]\{3,6\}" app/ui --include="*.tsx" | grep -v "globals.css\|design-tokens"
```

Look for patterns:
- `className="... #xxxxxx ..."` (inline styles)
- `style={{ color: '#...' }}`
- `fill="#..."` or `stroke="#..."` in SVGs

### Step 2: Scan for Non-Semantic Colors

```bash
# Find direct Tailwind colors
grep -rn "bg-\(red\|green\|blue\|yellow\|gray\|slate\|zinc\)-" app/ui --include="*.tsx"
grep -rn "text-\(red\|green\|blue\|yellow\|gray\|slate\|zinc\)-" app/ui --include="*.tsx"
grep -rn "border-\(red\|green\|blue\|yellow\|gray\|slate\|zinc\)-" app/ui --include="*.tsx"
```

### Step 3: Scan for Typography Issues

```bash
# Find font classes that might bypass tokens
grep -rn "font-bold\|font-semibold\|font-extrabold" app/ui --include="*.tsx" | grep -v "design-tokens"
grep -rn "text-\(xs\|sm\|base\|lg\|xl\|2xl\|3xl\|4xl\|5xl\)" app/ui --include="*.tsx"
```

### Step 4: Check Component Consistency

Review these key files for pattern adherence:
- `app/ui/components/ui/button.tsx`
- `app/ui/components/ui/card.tsx`
- Form components for consistent styling

## Output Format

Generate a markdown report with this structure:

```markdown
# Design Audit Report

**Date:** YYYY-MM-DD
**Files Scanned:** X
**Issues Found:** Y

## Summary

| Severity | Category | Count |
|----------|----------|-------|
| Critical | Hardcoded Colors | X |
| High | Non-Semantic Colors | X |
| High | Typography | X |
| Medium | Spacing | X |
| Low | Shadows | X |

## Critical Issues

### Hardcoded Colors

| File | Line | Current | Recommended |
|------|------|---------|-------------|
| `path/file.tsx` | 42 | `#ff0000` | `text-destructive` |

### Non-Semantic Colors

| File | Line | Current | Recommended |
|------|------|---------|-------------|
| `path/file.tsx` | 15 | `bg-red-500` | `bg-destructive` |

## Recommendations

1. **Immediate:** Fix all Critical issues before next release
2. **Short-term:** Address High severity typography issues
3. **Ongoing:** Add ESLint rule to catch new violations

## Files Modified Checklist

- [ ] `path/to/file1.tsx` - 3 issues
- [ ] `path/to/file2.tsx` - 1 issue
```

## Design Token Reference

See [design-tokens-reference.md](design-tokens-reference.md) for the complete list of approved tokens and their usage.

### Quick Reference

#### Colors (Use These)
| Purpose | Light Mode | Dark Mode | Token |
|---------|------------|-----------|-------|
| Primary action | Maroon | Maroon | `bg-primary`, `text-primary` |
| Accent/highlight | Gold | Gold | `bg-accent`, `text-accent` |
| Success | Green | Green | `bg-success`, `text-success` |
| Warning | Amber | Amber | `bg-warning`, `text-warning` |
| Error | Red | Red | `bg-destructive`, `text-destructive` |
| Background | White | Black | `bg-background` |
| Card | White | Black | `bg-card` |
| Muted | Gray | Dark gray | `bg-muted`, `text-muted-foreground` |

#### Brand Colors
| Token | Usage |
|-------|-------|
| `bg-gspn-maroon-*` | Brand maroon shades (50-950) |
| `bg-gspn-gold-*` | Brand gold shades (50-900) |
| `bg-nav-highlight` | Navigation active state |

#### Modern & Professional Color Guidelines

**Goal:** Keep the design modern and professional by avoiding "cheap" looking colors for non-semantic purposes.

**Decorative/Non-Status Colors:**
- ❌ **Avoid yellow in dark mode** for decorative elements (indicator dots, backgrounds, highlights)
  - Use brand gold (`bg-gspn-gold-*`) instead
- ❌ **Avoid red in light mode** for decorative elements (non-status backgrounds, highlights)
  - Use destructive/status colors only for semantic purposes

**Allowed (Semantic/Status) Colors:**
- ✅ **Red colors** for status indicators: destructive actions, errors, failed payments, expenses
- ✅ **Yellow colors** for warning states: partial payments, needs review, pending items
- ✅ **Green colors** for success states: completed, paid, active
- ✅ **Blue colors** for info states: submitted, excused, in progress

**Best Practices:**
- Prefer brand colors (`gspn-maroon-*`, `gspn-gold-*`) for decorative UI elements
- Reserve bright colors (yellow, red, green) for semantic/status meanings only
- Use muted/neutral tones for backgrounds and non-critical UI elements

#### Typography (Use These)
| Purpose | Token |
|---------|-------|
| Page titles | `typography.heading.page` or `font-display text-3xl font-extrabold` |
| Section headers | `typography.heading.section` or `font-display text-2xl font-bold` |
| Card titles | `typography.heading.card` or `font-display text-xl font-semibold` |
| Stats/Numbers | `typography.stat.*` or `font-mono text-* font-bold tabular-nums` |
| Currency | `typography.currency.*` |

## Common Fixes

### Hardcoded Color → Token

```tsx
// ❌ Before
<div className="bg-[#8B2332]">

// ✅ After
<div className="bg-primary">
// or
<div className="bg-gspn-maroon-500">
```

### Non-Semantic → Semantic

```tsx
// ❌ Before
<span className="text-red-500">Error!</span>

// ✅ After
<span className="text-destructive">Error!</span>
```

### Typography Fix

```tsx
// ❌ Before
<h1 className="text-3xl font-bold">Title</h1>

// ✅ After
<h1 className={typography.heading.page}>Title</h1>
// or
<h1 className="font-display text-3xl font-extrabold tracking-tight">Title</h1>
```

## Prevention

After fixing issues, consider:

1. **Add ESLint plugin** for Tailwind to warn on non-semantic colors
2. **Create PR checklist** including design token verification
3. **Schedule regular audits** (monthly or before releases)
4. **Document in onboarding** the design token system

## Related Files

- `app/ui/lib/design-tokens.ts` - TypeScript design tokens
- `app/ui/app/globals.css` - CSS custom properties
- `app/ui/components/ui/` - shadcn component overrides

## Visual Reference Pages

Use these pages to understand the design system visually:

### `/style-guide` - Design System Reference
Technical documentation of all design tokens with interactive previews:
- Color palettes (semantic, brand, status)
- Typography scale and font families
- Spacing and sizing tokens
- Shadow and animation tokens
- Search functionality to quickly find tokens

### `/brand` - Component Showcase
Interactive component gallery with side-by-side light/dark mode comparison:
- All UI components (buttons, badges, avatars, progress)
- Card variations (basic, stat, student, action)
- Form inputs and selects
- Navigation patterns (nav buttons, tabs, toolbar, breadcrumbs)
- Status indicators (enrollment, payment, attendance)
- Treasury-specific components (fund cards, transactions, glows)
- Loading states (spinners, skeletons, progress)

**Tip:** Use the view mode toggle to preview components in light-only, dark-only, or side-by-side mode.
