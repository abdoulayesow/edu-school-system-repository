# GSPN Edu-School-System UI Guidelines

This document outlines the UI standards and patterns used across the GSPN education school system application.

## Design Tokens

All design constants are centralized in `lib/design-tokens.ts`. Import from there for consistency.

```typescript
import { sizing, spacing, typography, layouts } from "@/lib/design-tokens"
```

## Icon Sizing

| Context | Size | Token |
|---------|------|-------|
| Inline in text | `h-4 w-4` | `sizing.icon.sm` |
| Toolbar buttons | `h-5 w-5` | `sizing.icon.md` / `sizing.toolbarIcon` |
| Feature icons | `h-6 w-6` | `sizing.icon.lg` |
| Hero/loading | `h-8 w-8` | `sizing.icon.xl` |
| Dropdown chevrons | `h-4 w-4` | `sizing.icon.sm` |

## Avatar Sizing

| Context | Size | Token |
|---------|------|-------|
| Nav dropdown trigger | `h-7 w-7` | `sizing.avatar.sm` |
| Navigation bar | `h-8 w-8` | `sizing.avatar.md` |
| Profile sections | `h-10 w-10` | `sizing.avatar.lg` |

## Navigation Buttons

Main navigation buttons should use:
- Height: `h-10` (40px)
- Min-width: `min-w-[120px]`
- Padding: `px-4 py-2`

## Layout Components

### PageContainer

Standard wrapper for content pages. Use for all main content areas.

```tsx
import { PageContainer } from "@/app/components/layout"

<PageContainer maxWidth="lg">
  <h1>Page Title</h1>
  {/* Content */}
</PageContainer>
```

**Props:**
- `maxWidth`: `"sm"` | `"md"` | `"lg"` | `"xl"` | `"full"` (default: `"full"`)
- `noPadding`: Remove default padding

### CenteredFormPage

Full-screen centered layout for authentication and form pages.

```tsx
import { CenteredFormPage } from "@/app/components/layout"

<CenteredFormPage maxWidth="sm">
  <Card>
    {/* Login form */}
  </Card>
</CenteredFormPage>
```

### ContentCard

Standardized card wrapper with title/description/action.

```tsx
import { ContentCard } from "@/app/components/layout"

<ContentCard
  title="Users"
  description="Manage all users"
  headerAction={<Button>Add User</Button>}
>
  <Table>...</Table>
</ContentCard>
```

## Color Tokens

### Light Mode Navigation
- Background: `#e79908` (orange-gold)
- Hover: `#f0c74a`

### Dark Mode Navigation
- Background: `#2d0707` (maroon)
- Hover: `#4a0c0c`

### Panel Background
- Light: `#fff5d8` (cream)
- Dark: Uses `--background` CSS variable

## Spacing

| Purpose | Token | Value |
|---------|-------|-------|
| Page horizontal | `spacing.page.x` | `px-4 lg:px-6` |
| Page vertical | `spacing.page.y` | `py-4 lg:py-6` |
| Card small | `spacing.card.sm` | `p-4` |
| Card medium | `spacing.card.md` | `p-6` |
| Card large | `spacing.card.lg` | `p-8` |

## Container Widths

| Size | Token | Max Width |
|------|-------|-----------|
| Small | `spacing.container.sm` | 448px |
| Medium | `spacing.container.md` | 672px |
| Large | `spacing.container.lg` | 896px |
| XL | `spacing.container.xl` | 1152px |
| Full | `spacing.container.full` | 1280px |

## Dark Mode Checklist

When adding new components, ensure:

1. Text uses `text-foreground` or `dark:text-gray-200`
2. Backgrounds use `bg-background` or explicit `dark:bg-*` variants
3. Borders use `border-border` or explicit dark variants
4. Icons and accents adapt to theme

## Status Badge Patterns

### Standard Status Indicators

```tsx
// Success/Approved/Active/Paid
<Badge variant="default" className="bg-green-600">
  <CheckCircle2 className={`${sizing.icon.xs} mr-1`} />
  Active
</Badge>

// Warning/Pending
<Badge variant="secondary">
  <Clock className={`${sizing.icon.xs} mr-1`} />
  Pending
</Badge>

// Error/Overdue/Absent
<Badge variant="destructive">
  <AlertCircle className={`${sizing.icon.xs} mr-1`} />
  Overdue
</Badge>
```

## Table Patterns

### Standard Data Table

```tsx
<ContentCard
  title="Data Table"
  description="Table description"
  headerAction={<Button>Add Item</Button>}
>
  {/* Filters section */}
  <div className="flex gap-4 mb-6">
    <div className="relative flex-1">
      <Search className={`${sizing.icon.sm} absolute left-3 top-1/2 -translate-y-1/2`} />
      <Input placeholder="Search..." className="pl-10" />
    </div>
    <Select>...</Select>
  </div>

  {/* Table */}
  <div className="rounded-md border">
    <Table>...</Table>
  </div>
</ContentCard>
```

## Page Structure Pattern

### Standard Page Layout

```tsx
export function PageName() {
  return (
    <PageContainer maxWidth="full">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Page Title</h1>
        <p className="text-muted-foreground">Page description</p>
      </div>

      {/* Stats/Summary Cards (if applicable) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {/* Stat cards */}
      </div>

      {/* Main Content */}
      <ContentCard title="Section Title">
        {/* Content */}
      </ContentCard>
    </PageContainer>
  )
}
```

## Accessibility Guidelines

### Color Contrast
- All text must meet WCAG AA standards (4.5:1 for normal text, 3:1 for large text)
- Test both light and dark modes
- Use `text-muted-foreground` for secondary text

### Focus States
- All interactive elements must have visible focus indicators
- Focus rings are automatically applied via `outline-ring/50`

### Keyboard Navigation
- Ensure all actions are keyboard accessible
- Use semantic HTML elements (button, nav, main, etc.)

### Screen Reader Support
- Add `sr-only` labels for icon-only buttons
- Use proper ARIA labels where needed
- Ensure proper heading hierarchy (h1 → h2 → h3)

## Best Practices

1. **Always use design tokens** - Don't hardcode sizes or colors
2. **Use layout components** - Prefer `PageContainer` over manual div wrappers
3. **Consistent icon sizes** - Toolbar = `h-5 w-5`, inline = `h-4 w-4`
4. **Button heights** - Toolbar buttons should be `h-9`
5. **Test both themes** - Verify dark and light mode appearance
6. **Mobile-first** - Design for mobile, enhance for desktop
7. **Loading states** - Show loading indicators for async operations
8. **Empty states** - Provide helpful messages when tables/lists are empty
9. **Error handling** - Display user-friendly error messages

## Migration from Legacy to Updated Pattern

### Before (Legacy Pattern):
```tsx
export default function LegacyPage() {
  return (
    <div className="min-h-screen bg-background pt-4 lg:pt-4">
      <main className="container mx-auto px-4 py-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Title</h1>
          <p className="text-muted-foreground">Description</p>
        </div>
        {/* Content */}
      </main>
    </div>
  )
}
```

### After (Updated Pattern):
```tsx
export function ModernPage() {
  return (
    <PageContainer maxWidth="full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Title</h1>
        <p className="text-muted-foreground">Description</p>
      </div>
      <ContentCard title="Section">
        {/* Content */}
      </ContentCard>
    </PageContainer>
  )
}
```

## Component Naming Conventions

- Use PascalCase for components
- Use descriptive names that indicate purpose
- Prefix layout components with their type (e.g., `PageContainer`, `ContentCard`)
- Export as named exports, not default exports (except App.tsx)
