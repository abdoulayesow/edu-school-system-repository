# GSPN UI Guidelines

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
import { PageContainer } from "@/components/layout"

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
import { CenteredFormPage } from "@/components/layout"

<CenteredFormPage maxWidth="sm">
  <Card>
    {/* Login form */}
  </Card>
</CenteredFormPage>
```

### ContentCard

Standardized card wrapper with title/description/action.

```tsx
import { ContentCard } from "@/components/layout"

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
- Hover: `bg-gspn-gold-300`

### Dark Mode Navigation
- Background: `bg-gspn-maroon-950`
- Hover: `bg-gspn-maroon-800`

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

## Best Practices

1. **Always use design tokens** - Don't hardcode sizes or colors
2. **Use layout components** - Prefer `PageContainer` over manual div wrappers
3. **Consistent icon sizes** - Toolbar = `h-5 w-5`, inline = `h-4 w-4`
4. **Button heights** - Toolbar buttons should be `h-9`
5. **Test both themes** - Verify dark and light mode appearance
