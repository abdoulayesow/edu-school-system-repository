# Edu-School-System Development Guidelines

## General Guidelines

* Always use design tokens from `/src/lib/design-tokens.ts` - never hardcode sizes, spacing, or typography
* Use the layout components (`PageContainer`, `ContentCard`, `CenteredFormPage`) instead of manual wrappers
* Keep file sizes small and put helper functions and components in their own files
* Prefer responsive layouts using flexbox and grid - avoid absolute positioning unless necessary
* All pages should be named exports (not default exports) except App.tsx
* Test all components in both light and dark modes

## Design System Guidelines

### Base Font Size
* Use a base font-size of 16px (defined in theme.css)
* Rely on theme.css typography defaults - don't override with Tailwind font classes unless specifically needed

### Icon Sizing
* **Toolbar buttons**: Always use `sizing.toolbarIcon` (h-5 w-5 / 20px)
* **Inline in text**: Use `sizing.icon.sm` (h-4 w-4 / 16px)
* **Feature icons**: Use `sizing.icon.lg` (h-6 w-6 / 24px)
* Never hardcode icon sizes

### Navigation Standards
* Navigation bar background: `bg-[#e79908]` (light) / `bg-[#2d0707]` (dark)
* Navigation buttons: Must use `componentClasses.navMainButtonBase`
* Active state: Use `componentClasses.navMainButtonActive`
* Inactive state: Use `componentClasses.navMainButtonInactive`
* Minimum button width: `min-w-[120px]`
* Button height: `h-10` (40px)

### Color Usage
* **Primary action buttons**: Use default variant with GSPN gold/maroon theme colors
* **Success states**: `bg-green-600` for badges and indicators
* **Warning states**: `bg-amber-500` or `bg-amber-600`
* **Error states**: Use `variant="destructive"`
* **Panel backgrounds**: Light mode `#fff5d8`, dark mode uses CSS variable

### Status Badges
* Always include an icon with status badges for visual clarity
* Use consistent patterns:
  * Success: `<Badge variant="default" className="bg-green-600"><CheckCircle2 /> Success</Badge>`
  * Pending: `<Badge variant="secondary"><Clock /> Pending</Badge>`
  * Error: `<Badge variant="destructive"><AlertCircle /> Error</Badge>`

## Component Guidelines

### PageContainer

The PageContainer component is the standard wrapper for all content pages.

#### Usage
```tsx
import { PageContainer } from "@/app/components/layout"

<PageContainer maxWidth="full">
  {/* Page content */}
</PageContainer>
```

#### Props
* `maxWidth`: Controls the maximum width - use `"full"` for dashboards, `"lg"` for forms
* `noPadding`: Remove default padding when you need full control
* `className`: Additional classes for special cases

#### When to Use
* ✅ Use for all main content pages (Dashboard, Students, Accounting, etc.)
* ✅ Use when you need consistent page-level padding and spacing
* ❌ Don't use for centered form pages (use `CenteredFormPage` instead)
* ❌ Don't use for custom landing pages or marketing pages

### ContentCard

The ContentCard component provides a standardized card with title, description, and header actions.

#### Usage
```tsx
import { ContentCard } from "@/app/components/layout"

<ContentCard
  title="Section Title"
  description="Section description"
  headerAction={<Button>Action</Button>}
>
  {/* Card content */}
</ContentCard>
```

#### Props
* `title`: Main heading for the card section
* `description`: Subtitle or description text
* `headerAction`: React node for buttons or actions in the header
* `padding`: Control internal padding - `"sm"`, `"md"`, or `"lg"`

#### When to Use
* ✅ Use for data tables with filters
* ✅ Use for sections that need a title and action button
* ✅ Use for grouping related content
* ❌ Don't nest ContentCards inside other ContentCards
* ❌ Don't use for simple stat cards (use Card component directly)

### CenteredFormPage

Full-screen centered layout for authentication and standalone form pages.

#### Usage
```tsx
import { CenteredFormPage } from "@/app/components/layout"

<CenteredFormPage maxWidth="sm">
  <Card>
    {/* Login form content */}
  </Card>
</CenteredFormPage>
```

#### When to Use
* ✅ Use for login/signup pages
* ✅ Use for password reset flows
* ✅ Use for standalone forms that need centering
* ❌ Don't use for forms within the main application layout
* ❌ Don't use when the navigation bar should be visible

## Page Structure Pattern

All pages should follow this consistent structure:

```tsx
export function PageName() {
  const [filters, setFilters] = useState({})

  return (
    <PageContainer maxWidth="full">
      {/* 1. Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Page Title</h1>
        <p className="text-muted-foreground">Page description</p>
      </div>

      {/* 2. Summary Cards (optional) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {/* Stat cards */}
      </div>

      {/* 3. Main Content */}
      <ContentCard
        title="Content Title"
        description="Content description"
        headerAction={<Button>Add Item</Button>}
      >
        {/* Filters */}
        <div className="flex gap-4 mb-6">
          {/* Filter components */}
        </div>

        {/* Data Table */}
        <div className="rounded-md border">
          <Table>...</Table>
        </div>
      </ContentCard>
    </PageContainer>
  )
}
```

## Table and Filter Pattern

### Standard Filter Layout
```tsx
<div className="flex flex-col sm:flex-row gap-4 mb-6">
  {/* Search input with icon */}
  <div className="relative flex-1">
    <Search className={`${sizing.icon.sm} absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground`} />
    <Input
      placeholder="Search..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className="pl-10"
    />
  </div>

  {/* Filter selects */}
  <Select value={filter} onValueChange={setFilter}>
    <SelectTrigger className="w-full sm:w-[180px]">
      <SelectValue placeholder="Filter by..." />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">All</SelectItem>
    </SelectContent>
  </Select>
</div>
```

### Standard Table Wrapper
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

## Dark Mode Requirements

Every new component must support both light and dark modes:

1. **Text Colors**
   * Use `text-foreground` for primary text
   * Use `text-muted-foreground` for secondary text
   * Avoid hardcoded text colors

2. **Backgrounds**
   * Use `bg-background` for page backgrounds
   * Use `bg-card` for card backgrounds
   * Use explicit dark variants when needed: `bg-white dark:bg-gray-900`

3. **Borders**
   * Use `border-border` for all borders
   * Test border visibility in both modes

4. **Interactive Elements**
   * Hover states must work in both modes
   * Focus rings must be visible in both modes
   * Button variants automatically adapt

## Accessibility Requirements

### Mandatory Accessibility Features

1. **Semantic HTML**
   * Use `<nav>`, `<main>`, `<button>`, `<label>` appropriately
   * Don't use `<div>` for clickable elements

2. **Heading Hierarchy**
   * One `<h1>` per page
   * Don't skip heading levels (h1 → h2 → h3)
   * Use typography tokens for consistency

3. **Icon-Only Buttons**
   * Must include sr-only label:
   ```tsx
   <Button variant="ghost" size="icon">
     <Search className={sizing.icon.sm} />
     <span className="sr-only">Search</span>
   </Button>
   ```

4. **Color Contrast**
   * All text must meet WCAG AA (4.5:1 for normal, 3:1 for large)
   * Test with browser DevTools
   * Don't rely on color alone to convey information

5. **Keyboard Navigation**
   * All interactive elements must be keyboard accessible
   * Tab order should be logical
   * Focus indicators must be visible

## Performance Best Practices

1. **Memoize Filtered Data**
   ```tsx
   const filteredItems = useMemo(() => {
     return items.filter(/* ... */)
   }, [items, searchQuery, filters])
   ```

2. **Debounce Search Input**
   ```tsx
   const debouncedSearch = useMemo(
     () => debounce((value) => setSearchQuery(value), 300),
     []
   )
   ```

3. **Avoid Unnecessary Re-renders**
   * Use React.memo for list items
   * Keep state as local as possible
   * Don't define functions inside render

## Testing Checklist

Before submitting any page or component:

- [ ] Tested in light mode
- [ ] Tested in dark mode
- [ ] Tested on mobile (375px)
- [ ] Tested on tablet (768px)
- [ ] Tested on desktop (1440px)
- [ ] All interactive elements keyboard accessible
- [ ] Focus indicators visible
- [ ] Color contrast passes WCAG AA
- [ ] Screen reader friendly (semantic HTML)
- [ ] Loading states implemented
- [ ] Error states handled
- [ ] Empty states provided

## Common Mistakes to Avoid

❌ **Don't:**
* Hardcode sizes: `className="h-5 w-5"` 
* Skip layout components: `<div className="container mx-auto">`
* Use default exports: `export default function Page()`
* Hardcode colors: `className="bg-orange-500"`
* Ignore dark mode: `className="text-gray-900"`
* Mix inconsistent patterns across pages

✅ **Do:**
* Use design tokens: `className={sizing.icon.md}`
* Use layout components: `<PageContainer>`
* Use named exports: `export function Page()`
* Use theme colors: `className="bg-[#e79908] dark:bg-[#2d0707]"`
* Support both themes: `className="text-foreground"`
* Follow established patterns consistently

## Questions?

Refer to:
* `/UI_GUIDELINES.md` - Detailed UI standards
* `/MODERNIZATION_REVIEW.md` - Before/after comparisons
* `/src/lib/design-tokens.ts` - Available tokens
* Existing pages (Dashboard, Students, Accounting) - Implementation examples
