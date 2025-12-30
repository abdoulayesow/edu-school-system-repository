# Edu-School-System Quick Reference Guide

## 🚀 Quick Start

### Import Design Tokens
```tsx
import { sizing, spacing, typography, layouts } from "@/lib/design-tokens"
```

### Import Layout Components
```tsx
import { PageContainer, ContentCard, CenteredFormPage } from "@/app/components/layout"
```

### Import Common Icons
```tsx
import { Search, Plus, Download, Eye, Edit, Trash2 } from "lucide-react"
```

---

## 📏 Design Token Cheat Sheet

### Icon Sizes
```tsx
sizing.icon.xs    // h-3 w-3 (12px) - tiny icons in badges
sizing.icon.sm    // h-4 w-4 (16px) - inline in text
sizing.toolbarIcon // h-5 w-5 (20px) - ⭐ STANDARD for toolbar
sizing.icon.lg    // h-6 w-6 (24px) - feature icons
sizing.icon.xl    // h-8 w-8 (32px) - hero/loading
```

### Avatar Sizes
```tsx
sizing.avatar.sm  // h-7 w-7 (28px) - nav dropdown
sizing.avatar.md  // h-8 w-8 (32px) - navigation bar
sizing.avatar.lg  // h-10 w-10 (40px) - profile sections
sizing.avatar.xl  // h-12 w-12 (48px) - hero/feature
```

### Spacing
```tsx
spacing.page.x       // px-4 lg:px-6 - page horizontal
spacing.page.y       // py-4 lg:py-6 - page vertical
spacing.card.sm      // p-4 - small card padding
spacing.card.md      // p-6 - medium card padding
spacing.card.lg      // p-8 - large card padding
spacing.gap.sm       // gap-2 - small gap
spacing.gap.md       // gap-4 - medium gap
spacing.gap.lg       // gap-6 - large gap
```

### Container Max Widths
```tsx
spacing.container.sm   // max-w-md (448px) - forms
spacing.container.md   // max-w-2xl (672px) - cards
spacing.container.lg   // max-w-4xl (896px) - content
spacing.container.xl   // max-w-6xl (1152px) - wide
spacing.container.full // max-w-7xl (1280px) - dashboard
```

---

## 🎨 Color Quick Reference

### GSPN Brand Colors
```css
Light Mode Navigation: #e79908 (gold)
Dark Mode Navigation:  #2d0707 (maroon)
Panel Background (Light): #fff5d8 (cream)
```

### Usage
```tsx
// Navigation background
className="bg-[#e79908] dark:bg-[#2d0707]"

// Hover states
className="hover:bg-[#f0c74a] dark:hover:bg-[#4a0c0c]"
```

### Semantic Colors
```tsx
text-foreground          // Primary text (adapts to theme)
text-muted-foreground    // Secondary text
bg-background           // Page background
bg-card                 // Card background
border-border           // Borders
```

---

## 🏗️ Layout Component Templates

### Standard Page
```tsx
export function PageName() {
  return (
    <PageContainer maxWidth="full">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Page Title
        </h1>
        <p className="text-muted-foreground">
          Page description
        </p>
      </div>

      {/* Main Content */}
      <ContentCard
        title="Section Title"
        description="Section description"
        headerAction={<Button>Action</Button>}
      >
        {/* Content */}
      </ContentCard>
    </PageContainer>
  )
}
```

### Form Page (Centered)
```tsx
export function LoginPage() {
  return (
    <CenteredFormPage maxWidth="sm">
      <Card>
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>Enter your credentials</CardDescription>
        </CardHeader>
        <CardContent>
          <form>{/* Form fields */}</form>
        </CardContent>
      </Card>
    </CenteredFormPage>
  )
}
```

---

## 🔍 Common Patterns

### Search Input with Icon
```tsx
<div className="relative flex-1">
  <Search className={`${sizing.icon.sm} absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground`} />
  <Input
    placeholder="Search by name or email..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    className="pl-10"
  />
</div>
```

### Filter Row
```tsx
<div className="flex flex-col sm:flex-row gap-4 mb-6">
  {/* Search input */}
  <div className="relative flex-1">
    <Search className={`${sizing.icon.sm} absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground`} />
    <Input placeholder="Search..." className="pl-10" />
  </div>
  
  {/* Filter selects */}
  <Select>
    <SelectTrigger className="w-full sm:w-[180px]">
      <SelectValue placeholder="Filter by..." />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">All</SelectItem>
    </SelectContent>
  </Select>
</div>
```

### Table with Border
```tsx
<div className="rounded-md border">
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Column</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {items.map((item) => (
        <TableRow key={item.id}>
          <TableCell>{item.name}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</div>
```

---

## 🏷️ Status Badges

### Success/Active/Paid
```tsx
<Badge variant="default" className="bg-green-600">
  <CheckCircle2 className={`${sizing.icon.xs} mr-1`} />
  Active
</Badge>
```

### Warning/Pending
```tsx
<Badge variant="secondary">
  <Clock className={`${sizing.icon.xs} mr-1`} />
  Pending
</Badge>
```

### Error/Overdue/Absent
```tsx
<Badge variant="destructive">
  <AlertCircle className={`${sizing.icon.xs} mr-1`} />
  Overdue
</Badge>
```

### Info/Outline
```tsx
<Badge variant="outline">
  Grade 10-A
</Badge>
```

---

## 📊 Stat Cards

### Standard Stat Card
```tsx
<Card>
  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
    <CardTitle className="text-sm font-medium">
      Card Title
    </CardTitle>
    <Icon className={sizing.icon.lg} />
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold">1,248</div>
    <p className="text-xs text-green-600 dark:text-green-400">
      +12% from last month
    </p>
  </CardContent>
</Card>
```

### Grid of Stat Cards
```tsx
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
  {stats.map((stat, index) => {
    const Icon = stat.icon
    return <Card key={index}>{/* Card content */}</Card>
  })}
</div>
```

---

## 🎯 Navigation Button Patterns

### Using Component Classes
```tsx
import { componentClasses } from "@/lib/design-tokens"
import { cn } from "@/lib/utils"

const isActive = currentPage === item.id

<button
  className={cn(
    componentClasses.navMainButtonBase,
    isActive
      ? componentClasses.navMainButtonActive
      : componentClasses.navMainButtonInactive
  )}
>
  <Icon className={sizing.toolbarIcon} />
  <span>{item.label}</span>
</button>
```

---

## 🔘 Button Patterns

### Primary Action
```tsx
<Button>
  <Plus className={`${sizing.icon.sm} mr-2`} />
  Add Item
</Button>
```

### Secondary Action
```tsx
<Button variant="outline">
  <Download className={`${sizing.icon.sm} mr-2`} />
  Export
</Button>
```

### Icon Only
```tsx
<Button variant="ghost" size="icon">
  <Eye className={sizing.icon.sm} />
  <span className="sr-only">View details</span>
</Button>
```

### Destructive Action
```tsx
<Button variant="destructive">
  <Trash2 className={`${sizing.icon.sm} mr-2`} />
  Delete
</Button>
```

---

## 👤 Avatar with Fallback

```tsx
<Avatar className={sizing.avatar.md}>
  <AvatarFallback className="bg-primary text-primary-foreground">
    AB
  </AvatarFallback>
</Avatar>
```

---

## 📱 Responsive Patterns

### Mobile: Stack, Desktop: Row
```tsx
<div className="flex flex-col sm:flex-row gap-4">
  {/* Content */}
</div>
```

### Grid Breakpoints
```tsx
// 1 column mobile, 2 tablet, 4 desktop
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
  {/* Cards */}
</div>
```

### Hidden on Mobile
```tsx
<div className="hidden md:flex">
  {/* Desktop-only content */}
</div>
```

### Mobile Only
```tsx
<div className="md:hidden">
  {/* Mobile-only content */}
</div>
```

---

## 🌗 Dark Mode Patterns

### Text Colors
```tsx
text-foreground              // Primary text
text-muted-foreground        // Secondary text
text-green-600 dark:text-green-400  // Custom color with dark variant
```

### Background Colors
```tsx
bg-background               // Page background
bg-card                     // Card background
bg-white dark:bg-gray-900   // Custom with dark variant
```

### Borders
```tsx
border-border               // Standard border
border-border/50            // Semi-transparent border
```

### Custom Theme Colors
```tsx
className="bg-[#e79908] dark:bg-[#2d0707]"
```

---

## ♿ Accessibility Checklist

### ✅ Always Include
- [ ] Semantic HTML (`<nav>`, `<main>`, `<button>`)
- [ ] Proper heading hierarchy (h1 → h2 → h3)
- [ ] `sr-only` labels for icon-only buttons
- [ ] `aria-label` for unclear actions
- [ ] Keyboard navigation support
- [ ] Visible focus indicators
- [ ] Color contrast meets WCAG AA
- [ ] Alt text for images

### ✅ Icon-Only Button Template
```tsx
<Button variant="ghost" size="icon">
  <Search className={sizing.icon.sm} />
  <span className="sr-only">Search</span>
</Button>
```

---

## 🎛️ Common Imports

### Full Import Set
```tsx
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { PageContainer, ContentCard } from "../components/layout"
import { sizing } from "@/lib/design-tokens"
import { Search, Plus, Download, Eye } from "lucide-react"
```

---

## 🐛 Common Mistakes

### ❌ Don't Do This
```tsx
// Hardcoded icon size
<Plus className="h-5 w-5" />

// Default export
export default function Page() {}

// Manual wrapper
<div className="min-h-screen bg-background">
  <main className="container mx-auto px-4">

// No search icon
<Input placeholder="Search..." />

// Hardcoded color
<div className="bg-orange-500">

// No sr-only for icon button
<Button variant="ghost" size="icon">
  <Eye className="h-4 w-4" />
</Button>
```

### ✅ Do This Instead
```tsx
// Design token icon size
<Plus className={sizing.toolbarIcon} />

// Named export
export function Page() {}

// PageContainer
<PageContainer maxWidth="full">

// Search input with icon
<div className="relative flex-1">
  <Search className={`${sizing.icon.sm} absolute left-3 top-1/2 -translate-y-1/2`} />
  <Input className="pl-10" />
</div>

// Theme-aware color
<div className="bg-[#e79908] dark:bg-[#2d0707]">

// Icon button with sr-only
<Button variant="ghost" size="icon">
  <Eye className={sizing.icon.sm} />
  <span className="sr-only">View</span>
</Button>
```

---

## 📚 Documentation References

- **UI Guidelines**: `/UI_GUIDELINES.md`
- **Modernization Review**: `/MODERNIZATION_REVIEW.md`
- **Legacy vs Modern**: `/COMPARISON_LEGACY_VS_MODERN.md`
- **Design Tokens**: `/src/lib/design-tokens.ts`
- **Project Guidelines**: `/guidelines/Guidelines.md`

---

## 🎯 Quick Migration Checklist

Migrating a legacy page? Follow these steps:

1. [ ] Replace page wrapper with `<PageContainer>`
2. [ ] Replace Card with `<ContentCard>`
3. [ ] Update icon sizes to design tokens
4. [ ] Add search icon to filter inputs
5. [ ] Update status badges with icons
6. [ ] Change to named export
7. [ ] Test in light mode
8. [ ] Test in dark mode
9. [ ] Test on mobile (375px)
10. [ ] Test keyboard navigation

**Estimated time: 15-30 minutes per page**

---

## 💡 Pro Tips

1. **Use the cn() utility** for conditional classes:
   ```tsx
   import { cn } from "@/lib/utils"
   className={cn("base-class", condition && "conditional-class")}
   ```

2. **Memoize filtered data** for performance:
   ```tsx
   const filtered = useMemo(() => 
     items.filter(/* ... */), [items, searchQuery]
   )
   ```

3. **Keep state local** to the component:
   ```tsx
   // ✅ Good - local state
   const [search, setSearch] = useState("")
   
   // ❌ Avoid - global state for UI
   const { search } = useGlobalState()
   ```

4. **Use proper TypeScript types**:
   ```tsx
   type Status = 'active' | 'inactive' | 'pending'
   const [status, setStatus] = useState<Status>('active')
   ```

---

## 🚨 Need Help?

- Check existing pages: `Dashboard`, `Students`, `Accounting`
- Review design tokens: `/src/lib/design-tokens.ts`
- Read UI guidelines: `/UI_GUIDELINES.md`
- Compare patterns: `/COMPARISON_LEGACY_VS_MODERN.md`

**Remember: Consistency is key! Follow the established patterns.**
