# Figma Prompt: Accounting Module UI Improvements

Use this prompt in Figma AI or with a designer to get improvement suggestions for the Accounting module.

---

## Overall Application Structure

### Navigation Pattern
- **Top navbar**: Logo, school name, user menu (profile, settings, logout), dark mode toggle
- **Left sidebar**: Collapsible vertical navigation with icon + text
  - Main sections: Dashboard, Students, Enrollments, Attendance, Accounting, Administration, Reports
  - Each section expands to show sub-items when active
  - Collapsed mode: Icons only with tooltips

### Page Layout Pattern
All pages follow this structure:
```
┌─────────────────────────────────────────────────────────────┐
│  [Page Title]                                                │
│  [Subtitle/description]                                      │
├─────────────────────────────────────────────────────────────┤
│  [Summary Cards Row] - 3-4 cards with key metrics            │
├─────────────────────────────────────────────────────────────┤
│  [Filter Card] - Filters + action buttons                    │
├─────────────────────────────────────────────────────────────┤
│  [Data Table Card] - Main content with pagination            │
└─────────────────────────────────────────────────────────────┘
```

### Design System
- **Component library**: shadcn/ui (Radix primitives + Tailwind CSS)
- **Colors**:
  - Primary: #7C2D12 (maroon/brown)
  - Accent: #D4A574 (gold)
  - Success: Tailwind green-500
  - Warning: Tailwind yellow-500
  - Destructive: Tailwind red-500
- **Typography**: System fonts, Inter fallback
- **Spacing**: 4px base unit (4, 8, 12, 16, 24, 32, 48)
- **Border radius**: 8px default, 4px for small elements
- **Dark mode**: Full support with slate color palette

---

## Current Accounting Module Pages

### 1. Balance Page (`/accounting`)

**Purpose**: Overview of school's financial health

**Current Layout**:
```
┌─────────────────────────────────────────────────────────────┐
│  Accounting                                                  │
│  Manage your school's finances                               │
├─────────────────────────────────────────────────────────────┤
│  [Confirmed Payments] [Pending] [Expenses] [Net Margin]     │
│  ✓ 12,500,000 GNF    ⏳ 3,200,000  ↓ 2,100,000  = 10,400,000│
├─────────────────────────────────────────────────────────────┤
│  [Tabs: Balance | Cash Deposit]                              │
├─────────────────────────────────────────────────────────────┤
│  BALANCE TAB:                                                │
│  ┌─────────────────┐  ┌─────────────────┐                   │
│  │ By Method       │  │ By Status       │                   │
│  │ Cash: 8M        │  │ ● Pending: 10   │                   │
│  │ Orange: 4.5M    │  │ ● Confirmed: 45 │                   │
│  └─────────────────┘  └─────────────────┘                   │
│                                                              │
│  By Grade (Progress Bars):                                   │
│  GS    [████████████░░░░░░░] 75%    2,500,000    45 payments│
│  CP1   [██████████████░░░░] 80%     2,200,000    38 payments│
│  ...                                                         │
│                                                              │
│  [View All Payments →]                                       │
├─────────────────────────────────────────────────────────────┤
│  CASH DEPOSIT TAB:                                           │
│  Table of payments pending deposit with action buttons       │
└─────────────────────────────────────────────────────────────┘
```

**Issues/Observations**:
- Two tabs might be confusing - "Balance" vs "Cash Deposit"
- "By Grade" section uses progress bars but could be more scannable
- Actions for cash deposits are buried in a tab

---

### 2. Payments Page (`/accounting/payments`)

**Purpose**: Full list of payments with filters and Record Payment action

**Current Layout**:
```
┌─────────────────────────────────────────────────────────────┐
│  Payments                                                    │
│  Manage your payments                                        │
├─────────────────────────────────────────────────────────────┤
│  [Today: 5]  [Pending: 12]  [This Week: 23]  [By Method]    │
│   2.5M GNF   8.2M GNF       15.3M GNF        Cash/Orange   │
├─────────────────────────────────────────────────────────────┤
│  Filter payments                    [+ Record Payment]       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ [Status ▼] [Method ▼] [Grade ▼] [Date: __ to __]    │   │
│  └──────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Receipt# │ Student  │ Amount │ Method │ Date │ Status│   │
│  ├──────────────────────────────────────────────────────┤   │
│  │ REC-001  │ John Doe │ 500K   │ Cash   │ Dec  │ ⏳    │   │
│  │ REC-002  │ Jane Doe │ 800K   │ Orange │ Dec  │ ✓     │   │
│  └──────────────────────────────────────────────────────┘   │
│  Page 1 of 5 (89 results)    [< Prev] [Next >]              │
└─────────────────────────────────────────────────────────────┘
```

**Issues/Observations**:
- Summary cards work well
- Filter area is functional but could be more compact
- Record Payment dialog is a large modal (could be a slide-over?)

---

### 3. Expenses Page (`/expenses`)

**Purpose**: Track school expenses by category

**Current Layout**: Similar to Payments page with:
- Summary cards for expense totals
- Filter by category, status, date
- Table of expenses with edit/delete actions

---

## Improvement Request: Accounting Module

Please provide UI/UX improvement suggestions for the Accounting module focusing on:

### 1. Information Architecture
- Should Balance and Payments be separate pages or combined?
- Is the tab structure on Balance page intuitive?
- How should the "Cash Deposit" workflow be presented?

### 2. Balance Page - "By Grade" Section
**Current**: Horizontal progress bars showing confirmation % per grade
```
GS    [████████░░░░] 75% confirmed    2,500,000 GNF    45 payments
```

**Explore alternatives**:
- Compact sortable table with percentage column
- Collapsible accordion grouped by level (Kindergarten, Primary, Middle, High)
- Heat map grid for at-a-glance status
- Stacked bar chart visualization
- Mini donut charts per grade

**Requirements**:
- Support 15-20 grades
- Color-coded: Green (>80%), Yellow (50-80%), Red (<50%)
- Scannable - quickly identify grades needing attention

### 3. Payments Page - Record Payment Flow
**Current**: Large modal dialog with student search, amount, method fields

**Consider**:
- Slide-over panel instead of modal?
- Multi-step wizard for complex payments?
- Quick-add mode for bulk entry?

### 4. Summary Cards
**Current**: 4 cards in a row on both Balance and Payments pages

**Questions**:
- Are we showing the right metrics?
- Should cards be clickable to filter the table?
- Consider sparklines or mini trends?

### 5. Mobile Experience
- How do the tables work on mobile?
- Should we use card-based lists instead of tables on small screens?
- How to handle filter complexity on mobile?

### 6. Visual Hierarchy & Density
- Balance page may have too much information
- How to prioritize what accountants see first?
- When to use tabs vs vertical sections?

---

## Design Deliverables Requested

1. **Wireframes** for improved Accounting pages (Balance, Payments)
2. **"By Grade" section** - 2-3 alternative layouts with pros/cons
3. **Record Payment flow** - Improved dialog/panel design
4. **Mobile mockups** for key screens
5. **Component specifications** if proposing new UI patterns

---

## User Personas

### Primary: School Accountant
- Daily tasks: Record payments, process deposits, reconcile accounts
- Needs: Quick data entry, clear status visibility, batch operations
- Pain points: Too many clicks, information overload

### Secondary: School Director
- Tasks: Review financial health, approve large expenses
- Needs: High-level overview, trends, alerts
- Views: Dashboard summaries, monthly reports

---

## Technical Constraints

- Must work with shadcn/ui components (or compatible)
- Tailwind CSS for styling
- Support dark/light mode
- Responsive: Mobile (< 768px), Tablet (768-1024px), Desktop (> 1024px)
- Bilingual: French primary, English secondary
- Currency: GNF (Guinean Franc) - no decimals
