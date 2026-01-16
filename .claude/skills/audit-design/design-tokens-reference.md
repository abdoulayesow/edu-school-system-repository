# Design Tokens Reference

Complete reference for GSPN N'Diolou design system tokens. Use these instead of hardcoded values.

## Brand Identity

The design system is based on the GSPN N'Diolou school logo:
- **Primary:** Rich Maroon/Burgundy (#8B2332)
- **Accent:** Champagne Gold (#D4AF37)
- **Secondary:** Deep Black (#1a1a1a)

---

## Color Tokens

### Semantic Colors (Preferred)

Use these for most UI elements:

| Token | CSS Variable | Usage |
|-------|--------------|-------|
| `bg-background` | `--background` | Page backgrounds |
| `bg-foreground` | `--foreground` | Primary text |
| `bg-card` | `--card` | Card backgrounds |
| `bg-card-foreground` | `--card-foreground` | Card text |
| `bg-primary` | `--primary` | Primary buttons, links |
| `bg-primary-foreground` | `--primary-foreground` | Text on primary bg |
| `bg-secondary` | `--secondary` | Secondary elements |
| `bg-muted` | `--muted` | Subtle backgrounds |
| `text-muted-foreground` | `--muted-foreground` | Secondary text |
| `bg-accent` | `--accent` | Highlights, accents |
| `bg-destructive` | `--destructive` | Errors, delete actions |
| `bg-success` | `--success` | Success states |
| `bg-warning` | `--warning` | Warning states |

### Brand Colors (GSPN Palette)

For brand-specific needs:

#### Maroon Scale
| Token | Hex | Usage |
|-------|-----|-------|
| `bg-gspn-maroon-50` | #fdf2f4 | Lightest tint |
| `bg-gspn-maroon-100` | #fce4e8 | Very light |
| `bg-gspn-maroon-200` | #faccd4 | Light |
| `bg-gspn-maroon-300` | #f5a3b3 | Light accent |
| `bg-gspn-maroon-400` | #ed6b86 | Medium light |
| `bg-gspn-maroon-500` | #8B2332 | **Primary brand** |
| `bg-gspn-maroon-600` | #7a1f2c | Darker |
| `bg-gspn-maroon-700` | #661a25 | Dark |
| `bg-gspn-maroon-800` | #551620 | Very dark |
| `bg-gspn-maroon-900` | #47131b | Darkest |
| `bg-gspn-maroon-950` | #050404 | Near black |

#### Gold Scale
| Token | Hex | Usage |
|-------|-----|-------|
| `bg-gspn-gold-50` | #fdfaf3 | Lightest tint |
| `bg-gspn-gold-100` | #faf5e6 | Very light |
| `bg-gspn-gold-200` | #f3e6c0 | Light |
| `bg-gspn-gold-300` | #ecd799 | Light accent |
| `bg-gspn-gold-400` | #e5c873 | Medium |
| `bg-gspn-gold-500` | #D4AF37 | **Primary gold** |
| `bg-gspn-gold-600` | #c09a2f | Darker |
| `bg-gspn-gold-700` | #a08527 | Dark |
| `bg-gspn-gold-800` | #80701f | Very dark |
| `bg-gspn-gold-900` | #605b17 | Darkest |

### Navigation Colors

| Token | Usage |
|-------|-------|
| `bg-nav-highlight` | Active nav item background |
| `text-nav-dark-text` | Text on gold backgrounds |
| `bg-nav-dark-hover` | Hover state on dark nav |

### Chart Colors

For data visualizations:

| Token | Color | Usage |
|-------|-------|-------|
| `chart-1` | Maroon | Primary data |
| `chart-2` | Gold | Secondary data |
| `chart-3` | Black | Tertiary |
| `chart-4` | Green | Success metrics |
| `chart-5` | Amber | Warning metrics |
| `chart-6` | Purple | Category 6 |
| `chart-7` | Blue | Category 7 |
| `chart-8` | Brown | Category 8 |

---

## Typography Tokens

Import from `@/lib/design-tokens`:

```tsx
import { typography } from "@/lib/design-tokens"
```

### Headings

| Token | Classes | Usage |
|-------|---------|-------|
| `typography.heading.page` | `font-display text-3xl font-extrabold tracking-tight` | Page titles |
| `typography.heading.section` | `font-display text-2xl font-bold tracking-tight` | Section headers |
| `typography.heading.card` | `font-display text-xl font-semibold` | Card titles |
| `typography.heading.label` | `font-display text-lg font-semibold` | Form labels, subheads |

### Body Text

| Token | Classes | Usage |
|-------|---------|-------|
| `typography.body.lg` | `text-lg` | Large body text |
| `typography.body.md` | `text-base` | Default body |
| `typography.body.sm` | `text-sm` | Small text |
| `typography.body.xs` | `text-xs` | Fine print |

### Stats & Numbers

| Token | Classes | Usage |
|-------|---------|-------|
| `typography.stat.hero` | `font-mono text-5xl md:text-6xl lg:text-7xl font-bold tabular-nums tracking-tight` | Hero statistics |
| `typography.stat.lg` | `font-mono text-4xl font-bold tabular-nums tracking-tight` | Large stats |
| `typography.stat.md` | `font-mono text-2xl font-bold tabular-nums` | Medium stats |
| `typography.stat.sm` | `font-mono text-xl font-semibold tabular-nums` | Small stats |
| `typography.stat.xs` | `font-mono text-lg font-medium tabular-nums` | Tiny stats |

### Currency

| Token | Classes | Usage |
|-------|---------|-------|
| `typography.currency.hero` | `font-mono text-5xl md:text-6xl font-extrabold tabular-nums tracking-tighter` | Hero amounts |
| `typography.currency.lg` | `font-mono text-3xl font-bold tabular-nums` | Large amounts |
| `typography.currency.md` | `font-mono text-xl font-semibold tabular-nums` | Medium amounts |
| `typography.currency.sm` | `font-mono text-base font-medium tabular-nums` | Small amounts |

### Font Families

| Class | Variable | Usage |
|-------|----------|-------|
| `font-sans` | `--font-sans` | Body text (Inter) |
| `font-display` | `--font-display` | Headings (Plus Jakarta Sans) |
| `font-mono` | `--font-mono` | Code, numbers (Geist Mono) |
| `font-accent` | `--font-accent` | Stats accent (DM Sans) |

---

## Spacing Tokens

Import from `@/lib/design-tokens`:

```tsx
import { spacing } from "@/lib/design-tokens"
```

### Page Spacing

| Token | Classes | Usage |
|-------|---------|-------|
| `spacing.page.x` | `px-4 lg:px-6` | Horizontal page padding |
| `spacing.page.y` | `py-4 lg:py-6` | Vertical page padding |

### Container Widths

| Token | Classes | Usage |
|-------|---------|-------|
| `spacing.container.sm` | `max-w-md` | Forms (448px) |
| `spacing.container.md` | `max-w-2xl` | Cards (672px) |
| `spacing.container.lg` | `max-w-4xl` | Content (896px) |
| `spacing.container.xl` | `max-w-6xl` | Wide (1152px) |
| `spacing.container.full` | `max-w-7xl` | Dashboard (1280px) |

### Card Padding

| Token | Classes | Usage |
|-------|---------|-------|
| `spacing.card.sm` | `p-4` | Compact cards |
| `spacing.card.md` | `p-6` | Standard cards |
| `spacing.card.lg` | `p-8` | Hero cards |

### Gaps

| Token | Classes | Usage |
|-------|---------|-------|
| `spacing.gap.xs` | `gap-1` | Tight spacing |
| `spacing.gap.sm` | `gap-2` | Small spacing |
| `spacing.gap.md` | `gap-4` | Standard spacing |
| `spacing.gap.lg` | `gap-6` | Large spacing |
| `spacing.gap.xl` | `gap-8` | Extra large |

---

## Sizing Tokens

Import from `@/lib/design-tokens`:

```tsx
import { sizing } from "@/lib/design-tokens"
```

### Icon Sizes

| Token | Classes | Usage |
|-------|---------|-------|
| `sizing.icon.xs` | `h-3 w-3` | Dropdown chevrons |
| `sizing.icon.sm` | `h-4 w-4` | Inline icons |
| `sizing.icon.md` | `h-5 w-5` | **Standard toolbar** |
| `sizing.icon.lg` | `h-6 w-6` | Feature icons |
| `sizing.icon.xl` | `h-8 w-8` | Hero/loading |

### Avatar Sizes

| Token | Classes | Usage |
|-------|---------|-------|
| `sizing.avatar.sm` | `h-7 w-7` | Compact (nav trigger) |
| `sizing.avatar.md` | `h-8 w-8` | Navigation bar |
| `sizing.avatar.lg` | `h-10 w-10` | Profile sections |
| `sizing.avatar.xl` | `h-12 w-12` | Hero/feature |

---

## Shadow Tokens

Import from `@/lib/design-tokens`:

```tsx
import { shadows } from "@/lib/design-tokens"
```

| Token | Usage |
|-------|-------|
| `shadows.xs` | Subtle elevation |
| `shadows.sm` | Small cards |
| `shadows.md` | Standard cards |
| `shadows.lg` | Modals, dropdowns |
| `shadows.xl` | Prominent elements |
| `shadows.lift` | Hover lift effect |
| `shadows.glowPrimary` | Maroon glow |
| `shadows.glowGold` | Gold glow |

---

## Gradient Tokens

Import from `@/lib/design-tokens`:

```tsx
import { gradients } from "@/lib/design-tokens"
```

For financial/treasury cards:

| Token | Usage |
|-------|-------|
| `gradients.registry` | Registry fund cards (emerald) |
| `gradients.safe` | Safe/cash cards (amber) |
| `gradients.bank` | Bank cards (blue) |
| `gradients.mobileMoney` | Mobile money cards (orange) |

Each gradient includes: `light`, `dark`, `border`, `text`, `glow` variants.

---

## Animation Tokens

Import from `@/lib/design-tokens`:

```tsx
import { animation } from "@/lib/design-tokens"
```

### Easing Functions

| Token | Value | Usage |
|-------|-------|-------|
| `animation.ease.spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Bouncy |
| `animation.ease.smooth` | `cubic-bezier(0.4, 0, 0.2, 1)` | Standard |
| `animation.ease.outExpo` | `cubic-bezier(0.16, 1, 0.3, 1)` | Exit |

### Durations

| Token | Value | Usage |
|-------|-------|-------|
| `animation.duration.fast` | `150ms` | Micro-interactions |
| `animation.duration.normal` | `250ms` | Standard |
| `animation.duration.slow` | `400ms` | Emphasis |
| `animation.duration.slower` | `600ms` | Page transitions |

### Animation Classes

| Token | Class | Usage |
|-------|-------|-------|
| `animation.classes.fadeIn` | `animate-fade-in` | Fade in |
| `animation.classes.fadeInUp` | `animate-fade-in-up` | Fade + slide up |
| `animation.classes.scaleIn` | `animate-scale-in` | Scale entrance |
| `animation.classes.slideInRight` | `animate-slide-in-right` | Slide from right |

---

## Component Presets

Import from `@/lib/design-tokens`:

```tsx
import { componentClasses } from "@/lib/design-tokens"
```

| Token | Usage |
|-------|-------|
| `componentClasses.toolbarIconButton` | Toolbar icon buttons |
| `componentClasses.navMainButtonBase` | Nav button base |
| `componentClasses.navMainButtonActive` | Active nav state |
| `componentClasses.navMainButtonInactive` | Inactive nav state |
| `componentClasses.tabListBase` | Tab container |
| `componentClasses.tabButtonBase` | Tab button base |
| `componentClasses.tabButtonActive` | Active tab |
| `componentClasses.tabButtonInactive` | Inactive tab |
| `componentClasses.primaryActionButton` | Yellow action buttons |

---

## Anti-Patterns (Don't Use)

### Colors to Avoid

| Don't Use | Use Instead |
|-----------|-------------|
| `#ff0000`, `#f00` | `bg-destructive` |
| `#00ff00`, `#0f0` | `bg-success` |
| `#0000ff`, `#00f` | `bg-primary` |
| `#808080`, `gray` | `bg-muted` |
| `bg-red-500` | `bg-destructive` |
| `bg-green-500` | `bg-success` |
| `bg-blue-500` | `bg-primary` |
| `bg-gray-100` | `bg-muted` |
| `text-gray-500` | `text-muted-foreground` |

### Typography to Avoid

| Don't Use | Use Instead |
|-----------|-------------|
| Raw `text-3xl font-bold` | `typography.heading.page` |
| `font-sans` for headings | `font-display` |
| Raw numeric classes for stats | `typography.stat.*` |

### Spacing to Avoid

| Don't Use | Use Instead |
|-----------|-------------|
| `p-7`, `p-9`, `p-11` | `spacing.card.sm/md/lg` |
| `max-w-[500px]` | `spacing.container.*` |
| Custom gap values | `spacing.gap.*` |
