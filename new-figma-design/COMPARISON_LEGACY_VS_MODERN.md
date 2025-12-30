# Legacy vs. Modern Pattern Comparison

## Side-by-Side Code Comparison

This document provides direct comparisons between the legacy and modernized implementations of the Edu-School-System.

---

## 1. Accounting Page - Complete Comparison

### LEGACY IMPLEMENTATION ❌

```tsx
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Upload, CheckCircle2, Clock, AlertCircle, DollarSign } from "lucide-react"

export default function AccountingPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  return (
    <div className="min-h-screen bg-background pt-4 lg:pt-4">
      <main className="container mx-auto px-4 py-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Accounting</h1>
          <p className="text-muted-foreground">Manage payments and invoices</p>
        </div>

        {/* Manual card structure */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Transactions</CardTitle>
            </div>
            <div className="flex gap-2">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Invoice
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="mb-4 flex gap-4">
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Table rows */}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
```

**Problems with Legacy Code:**
1. ❌ Manual `<div>` wrapper with duplicated classes
2. ❌ Hardcoded icon size: `className="h-4 w-4"`
3. ❌ No search icon in input field
4. ❌ Inconsistent spacing and padding
5. ❌ No proper table border wrapper
6. ❌ Default export (not named)
7. ❌ Missing description in card header
8. ❌ No design tokens usage
9. ❌ Manual responsive padding
10. ❌ No ContentCard component

---

### MODERN IMPLEMENTATION ✅

```tsx
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { PageContainer } from "../components/layout"
import { ContentCard } from "../components/layout/ContentCard"
import { Plus, CheckCircle2, Clock, AlertCircle, Search } from "lucide-react"
import { sizing } from "@/lib/design-tokens"
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

export function Accounting() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  return (
    <PageContainer maxWidth="full">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Accounting & Finance
        </h1>
        <p className="text-muted-foreground">
          Manage payments, invoices, and financial records
        </p>
      </div>

      {/* Main Content */}
      <ContentCard
        title="Payment Transactions"
        description="View and manage all student payment transactions"
        headerAction={
          <Button>
            <Plus className={`${sizing.icon.sm} mr-2`} />
            New Invoice
          </Button>
        }
      >
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className={`${sizing.icon.sm} absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground`} />
            <Input
              placeholder="Search by student name or invoice ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table with border wrapper */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice ID</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Table rows */}
            </TableBody>
          </Table>
        </div>
      </ContentCard>
    </PageContainer>
  )
}
```

**Improvements in Modern Code:**
1. ✅ `PageContainer` for consistent layout
2. ✅ Design token for icon: `sizing.icon.sm`
3. ✅ Search icon with proper positioning
4. ✅ `ContentCard` with title, description, and action
5. ✅ Table wrapped in bordered container
6. ✅ Named export
7. ✅ Responsive filter layout
8. ✅ Better placeholder text
9. ✅ Centralized spacing via components
10. ✅ Follows design system patterns

---

## 2. Status Badge Patterns

### LEGACY ❌

```tsx
// Inconsistent badge usage
<Badge className="bg-green-500">Paid</Badge>
<Badge variant="secondary">Pending</Badge>
<Badge className="bg-red-600 text-white">Overdue</Badge>

// Problems:
// - Hardcoded colors
// - No icons
// - Inconsistent variant usage
// - Poor accessibility
```

### MODERN ✅

```tsx
// Standardized badge with icon
{transaction.status === 'paid' && (
  <Badge variant="default" className="bg-green-600">
    <CheckCircle2 className={`${sizing.icon.xs} mr-1`} />
    Paid
  </Badge>
)}
{transaction.status === 'pending' && (
  <Badge variant="secondary">
    <Clock className={`${sizing.icon.xs} mr-1`} />
    Pending
  </Badge>
)}
{transaction.status === 'overdue' && (
  <Badge variant="destructive">
    <AlertCircle className={`${sizing.icon.xs} mr-1`} />
    Overdue
  </Badge>
)}

// Improvements:
// - Consistent color usage
// - Icons for visual clarity
// - Proper semantic variants
// - Design token icon sizes
// - Better accessibility
```

---

## 3. Search Input Pattern

### LEGACY ❌

```tsx
<Input
  placeholder="Search..."
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
/>

// Problems:
// - No search icon
// - Generic placeholder
// - No visual indication it's a search field
```

### MODERN ✅

```tsx
<div className="relative flex-1">
  <Search className={`${sizing.icon.sm} absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground`} />
  <Input
    placeholder="Search by student name or invoice ID..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    className="pl-10"
  />
</div>

// Improvements:
// - Search icon positioned inside input
// - Descriptive placeholder
// - Proper padding for icon
// - Muted icon color
// - Design token icon size
```

---

## 4. Navigation Implementation

### LEGACY ❌

```tsx
// Manual navigation bar
<nav className="bg-orange-500 dark:bg-maroon-950 border-b">
  <div className="container mx-auto px-4">
    <div className="flex items-center justify-between h-16">
      <div>Logo</div>
      <div className="flex gap-2">
        <button
          className="px-4 py-2 rounded text-sm hover:bg-orange-600"
          onClick={() => setPage('dashboard')}
        >
          Dashboard
        </button>
        <button
          className="px-4 py-2 rounded text-sm hover:bg-orange-600"
          onClick={() => setPage('students')}
        >
          Students
        </button>
      </div>
    </div>
  </div>
</nav>

// Problems:
// - Hardcoded colors
// - No active state highlighting
// - No icons
// - Inconsistent sizing
// - No design tokens
// - No component reusability
```

### MODERN ✅

```tsx
import { componentClasses, sizing } from "@/lib/design-tokens"
import { cn } from "@/lib/utils"

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className={sizing.toolbarIcon} /> },
  { id: 'students', label: 'Students', icon: <Users className={sizing.toolbarIcon} /> },
]

<nav className="bg-[#e79908] dark:bg-[#2d0707] border-b border-border/50">
  <div className="container mx-auto px-4">
    <div className="flex items-center justify-between h-16">
      <div className="text-xl font-bold text-black dark:text-white">
        GSPN Edu
      </div>
      <div className="flex items-center gap-2">
        {navItems.map((item) => {
          const isActive = currentPage === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                componentClasses.navMainButtonBase,
                isActive
                  ? componentClasses.navMainButtonActive
                  : componentClasses.navMainButtonInactive
              )}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  </div>
</nav>

// Improvements:
// - GSPN brand colors
// - Clear active state
// - Icons with labels
// - Design token classes
// - Reusable Navigation component
// - Proper dark mode support
// - Accessible button elements
```

---

## 5. Page Structure

### LEGACY ❌

```tsx
export default function LegacyPage() {
  return (
    <div className="min-h-screen bg-background pt-4 lg:pt-4">
      <main className="container mx-auto px-4 py-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Page Title
          </h1>
          <p className="text-muted-foreground">Description</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Section Title</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Content */}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

// Problems:
// - Manual wrapper divs
// - Repeated structure across pages
// - Default export
// - No max-width control
// - Inconsistent padding
// - Hardcoded responsive breakpoints
```

### MODERN ✅

```tsx
export function ModernPage() {
  return (
    <PageContainer maxWidth="full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Page Title
        </h1>
        <p className="text-muted-foreground">
          Detailed description of the page
        </p>
      </div>

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

// Improvements:
// - PageContainer handles layout
// - ContentCard provides structure
// - Named export
// - Controlled max-width
// - Consistent spacing via components
// - Header action slot
// - Better description support
```

---

## 6. Table Implementation

### LEGACY ❌

```tsx
<Card>
  <CardHeader>
    <CardTitle>Data</CardTitle>
  </CardHeader>
  <CardContent>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {/* rows */}
      </TableBody>
    </Table>
  </CardContent>
</Card>

// Problems:
// - No border around table
// - No description
// - No header actions
// - Manual card structure
```

### MODERN ✅

```tsx
<ContentCard
  title="Data Table"
  description="Table description"
  headerAction={<Button>Add Item</Button>}
>
  <div className="rounded-md border">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {/* rows */}
      </TableBody>
    </Table>
  </div>
</ContentCard>

// Improvements:
// - ContentCard provides structure
// - Bordered table wrapper
// - Header action support
// - Description field
// - Consistent pattern
```

---

## 7. Filter Section

### LEGACY ❌

```tsx
<div className="mb-4 flex gap-4">
  <Input placeholder="Search..." />
  <Select>
    <SelectTrigger className="w-[180px]">
      <SelectValue placeholder="Filter" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">All</SelectItem>
    </SelectContent>
  </Select>
</div>

// Problems:
// - Not responsive
// - No search icon
// - Fixed select width
// - Basic placeholder
// - No flex-wrap
```

### MODERN ✅

```tsx
<div className="flex flex-col sm:flex-row gap-4 mb-6">
  <div className="relative flex-1">
    <Search className={`${sizing.icon.sm} absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground`} />
    <Input
      placeholder="Search by name or email..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className="pl-10"
    />
  </div>
  <Select value={filter} onValueChange={setFilter}>
    <SelectTrigger className="w-full sm:w-[180px]">
      <SelectValue placeholder="Filter by status" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">All Status</SelectItem>
    </SelectContent>
  </Select>
</div>

// Improvements:
// - Responsive layout (column on mobile)
// - Search icon
// - Responsive select width
// - Descriptive placeholders
// - Proper spacing token
// - Controlled state
```

---

## 8. Icon Sizing

### LEGACY ❌

```tsx
// Hardcoded, inconsistent icon sizes
<Plus className="h-4 w-4" />
<Search className="w-5 h-5" />
<Download className="h-6 w-6" />
<User className="h-4 w-4" />

// Problems:
// - No consistency
// - Different syntax (h-4 w-4 vs w-5 h-5)
// - Hard to change globally
// - No semantic meaning
```

### MODERN ✅

```tsx
import { sizing } from "@/lib/design-tokens"

// Consistent, semantic icon sizes
<Plus className={sizing.icon.sm} />       // h-4 w-4 (inline)
<Search className={sizing.toolbarIcon} />  // h-5 w-5 (toolbar)
<Download className={sizing.icon.lg} />    // h-6 w-6 (feature)
<User className={sizing.icon.sm} />        // h-4 w-4 (inline)

// Improvements:
// - Centralized tokens
// - Semantic naming
// - Easy global updates
// - Consistent across app
// - Self-documenting code
```

---

## Summary of Key Differences

| Aspect | Legacy ❌ | Modern ✅ |
|--------|-----------|-----------|
| **Layout** | Manual divs | PageContainer component |
| **Cards** | Manual Card structure | ContentCard component |
| **Icons** | Hardcoded sizes | Design tokens |
| **Search** | Plain input | Input with icon |
| **Badges** | No icons | Icons + consistent colors |
| **Exports** | Default export | Named export |
| **Colors** | Hardcoded | Theme-aware |
| **Spacing** | Manual classes | Design tokens |
| **Responsive** | Manual breakpoints | Built-in patterns |
| **Dark Mode** | Inconsistent | Fully supported |
| **Tables** | No wrapper | Bordered wrapper |
| **Filters** | Basic layout | Responsive + icons |

---

## Migration Effort

**Estimated time to migrate one page: 15-30 minutes**

Steps:
1. Replace wrapper with PageContainer (2 min)
2. Replace Card with ContentCard (3 min)
3. Add search icon to inputs (2 min)
4. Update icon sizes to tokens (5 min)
5. Add proper status badges (5 min)
6. Test in both themes (5-10 min)

**Total pages migrated: 6**
- ✅ Dashboard
- ✅ Students
- ✅ Teachers  
- ✅ Accounting
- ✅ Attendance
- ✅ Profile

**Result: 100% of core pages modernized!**
