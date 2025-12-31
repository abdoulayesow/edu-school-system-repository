# Figma Prompt: "Payments by Grade" Dashboard Section

Use this prompt in Figma AI or with a designer to explore alternative layouts for the "By Grade" section on the Accounting Balance page.

---

## Prompt

Design a "Payments by Grade" dashboard section for a school accounting system.

### Current Problem
- 12-16 individual cards in a grid (3-4 columns)
- Each card shows: grade name, total amount, payment count, confirmed amount
- Hard to scan and compare grades at a glance
- No visual hierarchy or indication of which grades need attention
- Cluttered appearance, especially on smaller screens

### Data Points Per Grade
- **Grade name**: e.g., "GS", "CP1", "6eme", "Terminale"
- **Payment count**: Number of payments received
- **Total amount**: Sum of all payments (in GNF currency)
- **Confirmed amount**: Sum of confirmed/validated payments
- **Confirmation percentage**: (confirmed / total) × 100

### Requirements
1. **Scannable** - User should quickly identify which grades need attention (low confirmation rate)
2. **Support 15-20 grades** - Must scale from ~12 (smaller schools) to ~20 grades
3. **Dark and light mode** - Works with both color schemes
4. **Responsive** - Mobile (stacked), tablet (2 columns), desktop (full width)
5. **Semantic colors**:
   - Green (>80% confirmed) - Good status
   - Yellow (50-80% confirmed) - Warning/needs attention
   - Red (<50% confirmed) - Critical/urgent attention
6. **Clear hierarchy** - Most important info (confirmation status) should be most visible

### Current Implementation (For Reference)
We currently implemented horizontal progress bars with this structure:
```
[Grade] [=========== Progress Bar ===========] [Amount]    [Count]
GS      ████████████░░░░░░░ 75% confirmed     2,500,000   45 payments
```

### Design Alternatives to Explore
1. **Horizontal progress bars** (current) - One row per grade, visual progress
2. **Compact sortable table** - Traditional table with % column and sorting
3. **Collapsible accordion by level** - Group by Kindergarten, Primary, College, High School
4. **Stacked bar chart** - Visual comparison across all grades
5. **Heat map grid** - Color-coded grid showing status at a glance
6. **Radial/donut charts** - Mini charts per grade showing completion

### Color Scheme
- **Primary**: #7C2D12 (maroon/brown)
- **Accent**: #D4A574 (gold)
- **Success**: Tailwind green-500
- **Warning**: Tailwind yellow-500
- **Destructive**: Tailwind red-500
- **Background**: white (light) / slate-950 (dark)

### Style Guidelines
- **Component library**: shadcn/ui (Radix primitives + Tailwind CSS)
- **Typography**: System fonts, clear hierarchy
- **Spacing**: Consistent with 4px base unit
- **Borders**: Subtle, 1px, rounded corners (8px default)
- **Shadows**: Minimal, for cards only

---

## Expected Output

Please provide 2-3 alternative layout designs with:
1. Visual mockups for both light and dark mode
2. Responsive breakpoints (mobile, tablet, desktop)
3. Pros and cons for each approach
4. Recommended approach with rationale

---

## Context

This is part of a school management system's accounting module. The target users are:
- **Accountants**: Need quick overview of payment status by grade
- **Directors**: Need high-level view of collection performance
- **Action required**: Identify which grades have low confirmation rates and need follow-up
