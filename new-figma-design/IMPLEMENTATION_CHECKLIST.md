# Implementation Checklist

Use this checklist when creating new pages or components for the Edu-School-System.

---

## ✅ New Page Checklist

### 1. File Setup
- [ ] Create file in `/src/app/pages/` directory
- [ ] Use PascalCase filename (e.g., `NewPage.tsx`)
- [ ] Use named export: `export function NewPage() {}`
- [ ] Add TypeScript types for all props and state
- [ ] Add page to `/src/app/pages/index.ts` export file

### 2. Imports
- [ ] Import design tokens: `import { sizing, spacing } from "@/lib/design-tokens"`
- [ ] Import layout components: `import { PageContainer, ContentCard } from "../components/layout"`
- [ ] Import UI components from `@/components/ui/`
- [ ] Import icons from `lucide-react`
- [ ] Use proper icon sizes from design tokens

### 3. Page Structure
- [ ] Wrap content in `<PageContainer maxWidth="full">`
- [ ] Add page header with title and description
- [ ] Use `<ContentCard>` for main sections
- [ ] Include header actions in ContentCard when needed
- [ ] Follow the standard page structure pattern

### 4. State Management
- [ ] Keep state as local as possible
- [ ] Use `useState` for component-level state
- [ ] Use `useMemo` for expensive computations
- [ ] Use proper TypeScript types for state

### 5. Filters and Search
- [ ] Use the standard filter row pattern
- [ ] Include search icon in input fields
- [ ] Make filters responsive (column on mobile)
- [ ] Add proper placeholder text
- [ ] Implement controlled components

### 6. Tables
- [ ] Wrap tables in `<div className="rounded-md border">`
- [ ] Include proper table headers
- [ ] Use consistent column structure
- [ ] Add loading states
- [ ] Handle empty states

### 7. Status Indicators
- [ ] Use standardized badge patterns
- [ ] Include icons with badges
- [ ] Use proper semantic variants
- [ ] Match status colors across pages

### 8. Responsiveness
- [ ] Test on mobile (375px width)
- [ ] Test on tablet (768px width)
- [ ] Test on desktop (1440px width)
- [ ] Use responsive grid layouts
- [ ] Make filter rows stack on mobile

### 9. Accessibility
- [ ] Use semantic HTML elements
- [ ] Add `sr-only` labels for icon-only buttons
- [ ] Ensure proper heading hierarchy (h1 → h2 → h3)
- [ ] Test keyboard navigation
- [ ] Verify color contrast in both themes

### 10. Dark Mode
- [ ] Test page in light mode
- [ ] Test page in dark mode
- [ ] Use theme-aware text colors
- [ ] Use theme-aware background colors
- [ ] Verify all interactive states work in both modes

### 11. Navigation
- [ ] Add page to Navigation component if needed
- [ ] Add page to App.tsx routing
- [ ] Add proper icon from lucide-react
- [ ] Test navigation to and from the page

### 12. Documentation
- [ ] Add comments for complex logic
- [ ] Update README if adding new features
- [ ] Document any new patterns used

---

## ✅ New Component Checklist

### 1. Component Setup
- [ ] Create in appropriate directory
- [ ] Use PascalCase for component name
- [ ] Use named export
- [ ] Define TypeScript interface for props
- [ ] Add JSDoc comments

### 2. Props
- [ ] Define all props with TypeScript types
- [ ] Provide default values where appropriate
- [ ] Use proper prop validation
- [ ] Document props in comments

### 3. Styling
- [ ] Use design tokens for sizes
- [ ] Use theme colors for styling
- [ ] Support `className` prop for overrides
- [ ] Use `cn()` utility for conditional classes

### 4. Accessibility
- [ ] Use semantic HTML
- [ ] Add ARIA labels where needed
- [ ] Support keyboard interaction
- [ ] Test with screen reader

### 5. Testing
- [ ] Test in isolation
- [ ] Test with different props
- [ ] Test in light and dark modes
- [ ] Test on mobile and desktop

---

## ✅ Migration Checklist (Legacy to Modern)

### 1. Analyze Current Page
- [ ] Identify page wrapper structure
- [ ] Note all hardcoded sizes
- [ ] List all manual card structures
- [ ] Document filter patterns

### 2. Update Page Wrapper
- [ ] Replace `<div className="min-h-screen...">` with `<PageContainer>`
- [ ] Remove manual `<main className="container...">` wrapper
- [ ] Set appropriate `maxWidth` prop

### 3. Update Card Structures
- [ ] Replace manual `<Card>` usage with `<ContentCard>`
- [ ] Move card titles to `title` prop
- [ ] Move descriptions to `description` prop
- [ ] Move header buttons to `headerAction` prop

### 4. Update Icons
- [ ] Replace all hardcoded icon sizes
- [ ] Use `sizing.icon.sm` for inline icons (h-4 w-4)
- [ ] Use `sizing.toolbarIcon` for toolbar icons (h-5 w-5)
- [ ] Use `sizing.icon.lg` for feature icons (h-6 w-6)

### 5. Update Filters
- [ ] Add search icon to input fields
- [ ] Make filter row responsive
- [ ] Use proper placeholder text
- [ ] Ensure controlled components

### 6. Update Status Badges
- [ ] Add icons to status badges
- [ ] Use standardized colors
- [ ] Use proper variants
- [ ] Add icon size tokens

### 7. Update Export
- [ ] Change from `export default` to `export function`
- [ ] Update import in App.tsx
- [ ] Add to pages index.ts

### 8. Test Everything
- [ ] Light mode
- [ ] Dark mode
- [ ] Mobile (375px)
- [ ] Tablet (768px)
- [ ] Desktop (1440px)
- [ ] Keyboard navigation
- [ ] Screen reader

---

## ✅ Code Review Checklist

### Before Submitting PR
- [ ] No hardcoded sizes (use design tokens)
- [ ] No hardcoded colors (use theme colors or GSPN palette)
- [ ] Uses layout components (PageContainer, ContentCard)
- [ ] Named exports (not default)
- [ ] TypeScript types for all props and state
- [ ] No console.log statements
- [ ] Proper error handling
- [ ] Loading states implemented
- [ ] Empty states handled

### Accessibility Review
- [ ] Semantic HTML used
- [ ] Heading hierarchy correct
- [ ] Icon-only buttons have sr-only labels
- [ ] Color contrast meets WCAG AA
- [ ] Keyboard accessible
- [ ] Focus indicators visible

### Design System Review
- [ ] Uses design tokens for all sizes
- [ ] Uses spacing tokens for gaps/padding
- [ ] Uses typography tokens where applicable
- [ ] Follows established patterns
- [ ] Consistent with existing pages

### Performance Review
- [ ] No unnecessary re-renders
- [ ] Expensive operations memoized
- [ ] State kept as local as possible
- [ ] No functions defined in render

---

## 📋 Common Mistakes to Avoid

### ❌ Don't Do
```tsx
// Hardcoded icon size
<Plus className="h-5 w-5" />

// Default export
export default function Page() {}

// Manual page wrapper
<div className="min-h-screen bg-background">
  <main className="container mx-auto px-4 py-4">

// No search icon
<Input placeholder="Search..." />

// Manual card structure
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>

// Hardcoded color
className="bg-orange-500"

// No table wrapper
<Table>...</Table>

// No icon in badge
<Badge variant="default">Paid</Badge>
```

### ✅ Do This
```tsx
// Design token icon size
<Plus className={sizing.toolbarIcon} />

// Named export
export function Page() {}

// PageContainer
<PageContainer maxWidth="full">

// Search icon
<div className="relative flex-1">
  <Search className={`${sizing.icon.sm} absolute...`} />
  <Input className="pl-10" />
</div>

// ContentCard
<ContentCard
  title="Title"
  description="Description"
  headerAction={<Button>Action</Button>}
>

// Theme-aware color
className="bg-[#e79908] dark:bg-[#2d0707]"

// Wrapped table
<div className="rounded-md border">
  <Table>...</Table>
</div>

// Badge with icon
<Badge variant="default" className="bg-green-600">
  <CheckCircle2 className={`${sizing.icon.xs} mr-1`} />
  Paid
</Badge>
```

---

## 🎯 Quick Reference

### Page Template
```tsx
export function PageName() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState("all")

  return (
    <PageContainer maxWidth="full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Page Title
        </h1>
        <p className="text-muted-foreground">Page description</p>
      </div>

      <ContentCard
        title="Section Title"
        description="Section description"
        headerAction={<Button>Action</Button>}
      >
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className={`${sizing.icon.sm} absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground`} />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>{/* ... */}</Table>
        </div>
      </ContentCard>
    </PageContainer>
  )
}
```

---

## 📚 Resources

- **Quick Reference**: `/QUICK_REFERENCE.md`
- **UI Guidelines**: `/UI_GUIDELINES.md`
- **Comparison Examples**: `/COMPARISON_LEGACY_VS_MODERN.md`
- **Design Tokens**: `/src/lib/design-tokens.ts`
- **Existing Pages**: `/src/app/pages/`

---

## ⏱️ Estimated Times

- **New simple page**: 30-45 minutes
- **New complex page**: 1-2 hours
- **Migrate legacy page**: 15-30 minutes
- **New reusable component**: 30-60 minutes

---

## 🎓 Learning Path for New Developers

1. **Day 1**: Read all documentation
   - [ ] QUICK_REFERENCE.md
   - [ ] UI_GUIDELINES.md
   - [ ] COMPARISON_LEGACY_VS_MODERN.md

2. **Day 2**: Study existing implementations
   - [ ] Review Dashboard page
   - [ ] Review Students page
   - [ ] Review Accounting page
   - [ ] Understand design tokens

3. **Day 3**: Practice with small changes
   - [ ] Add a new stat card to Dashboard
   - [ ] Add a new column to a table
   - [ ] Change some styling using design tokens

4. **Day 4**: Build something new
   - [ ] Create a simple new page
   - [ ] Follow the checklist
   - [ ] Get code review

5. **Day 5**: Advanced features
   - [ ] Add complex filtering
   - [ ] Implement advanced layouts
   - [ ] Create reusable components

---

**Remember**: Consistency is more important than perfection. Follow the established patterns!
