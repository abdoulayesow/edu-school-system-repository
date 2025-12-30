# Resume Prompt: Students Module Visual Updates & Enrollment Form Improvements

## Context: What We've Completed

### 1. Dashboard Visual Updates (COMPLETED ✅)
- ✅ Removed `ChevronDown` arrows from navigation buttons
- ✅ Updated to use `componentClasses.navMainButtonBase`, `componentClasses.navMainButtonActive`, `componentClasses.navMainButtonInactive` from design-tokens
- ✅ Standardized icon sizing using `sizing.toolbarIcon` from design-tokens
- ✅ Updated font configuration: Removed `Playfair_Display`, using `Inter` consistently
- ✅ Updated stat cards to match Figma design
- ✅ Updated spacing: Changed margins from `mb-4`/`mb-8` to `mb-6` (matching Figma)

### 2. Background Color Fixes (COMPLETED ✅)
- ✅ Removed `bg-background` from `MainContent` in `layout.tsx`
- ✅ Updated `body` element to use `bg-white` instead of `bg-background` in light mode
- ✅ Added `bg-white dark:bg-background` directly to `PageContainer` component
- ✅ Updated CSS rules in `globals.css` to ensure white backgrounds with proper specificity
- ✅ Fixed loading states in detail pages to use white backgrounds
- ✅ All pages now display clean white backgrounds (no pinkish/yellowish tint)

### 3. Tabs/Multi-Tabs Visual Improvements (COMPLETED ✅)
- ✅ Created tab design tokens in `design-tokens.ts`:
  - `tabListBase` - Full-width container with horizontal border line
  - `tabButtonBase` - Base tab button classes
  - `tabButtonActive` - Active tab with light yellow background (`bg-gspn-gold-50`) and bottom border indicator
  - `tabButtonInactive` - Inactive tab styling
- ✅ Updated `tabs.tsx` component to use design tokens
- ✅ Multi-tab style with horizontal line separator spanning full width
- ✅ Active tab has light yellow background in light mode (`bg-gspn-gold-50`)
- ✅ Active tab has bottom border indicator (`border-b-2 border-b-primary`)

### 4. Top Navigation Improvements (COMPLETED ✅)
- ✅ Updated offline indicator button to use `h-9` to match language button height
- ✅ All top navigation elements now have consistent heights

## Current State

### Files Modified (Dashboard & Global)
- `app/ui/app/layout.tsx` - Removed `bg-background` from MainContent and body
- `app/ui/app/globals.css` - Updated CSS rules for white backgrounds
- `app/ui/components/layout/PageContainer.tsx` - Added `bg-white dark:bg-background` classes
- `app/ui/components/ui/tabs.tsx` - Updated to use design tokens with multi-tab style
- `app/ui/lib/design-tokens.ts` - Added tab design tokens
- `app/ui/components/offline-indicator.tsx` - Updated height to `h-9`

### Design Tokens Available
- `sizing.toolbarIcon` - For main navigation icons (h-5 w-5)
- `sizing.icon.sm` - For smaller icons (h-4 w-4)
- `sizing.icon.lg` - For stat card icons (h-6 w-6)
- `componentClasses.navMainButtonBase`, `navMainButtonActive`, `navMainButtonInactive` - Navigation buttons
- `componentClasses.tabListBase`, `tabButtonBase`, `tabButtonActive`, `tabButtonInactive` - Tabs

## Next Tasks: Students Module & Enrollment Form Updates

### Task 1: Update "New Enrollment" Button Background Color
**Location:** `app/ui/app/enrollments/page.tsx` (line 96-101)

**Current Implementation:**
```typescript
<Button asChild className="w-full sm:w-auto">
  <Link href="/enrollments/new">
    <Plus className="h-4 w-4 mr-2" />
    {t.enrollments.newEnrollment}
  </Link>
</Button>
```

**Required Changes:**
1. Change button background color to match top panel color
2. Top panel uses: `bg-[#e79908]` in light mode (see `app/ui/components/navigation/top-nav.tsx` line 78)
3. Update button to use: `bg-[#e79908] hover:bg-[#d68907]` (or similar gold shade) in light mode
4. For dark mode: Use `dark:bg-gspn-maroon-950` or similar dark background
5. Ensure text color is readable (likely `text-black` in light mode, `text-white` in dark mode)

**Files to Modify:**
- `app/ui/app/enrollments/page.tsx` - Update Button className

### Task 2: Update Enrollment Form Visual Design
**Location:** `app/ui/components/enrollment/enrollment-wizard.tsx` and related step components

**Current Structure:**
- Main wizard component: `app/ui/components/enrollment/enrollment-wizard.tsx`
- Step components in: `app/ui/components/enrollment/steps/`
- Page wrapper: `app/ui/app/enrollments/new/page.tsx`

**Required Changes:**
1. **Apply new design visual approach:**
   - Use consistent spacing (mb-6 for sections, matching dashboard)
   - Use design tokens for icon sizing (`sizing.icon.lg` for feature icons, `sizing.toolbarIcon` for buttons)
   - Ensure white backgrounds (should already work with PageContainer)
   - Use Inter font consistently (already applied globally)
   - Match card styling from dashboard (clean borders, proper padding)

2. **Review and update all wizard steps:**
   - `step-grade-selection.tsx`
   - `step-student-info.tsx`
   - `step-payment-breakdown.tsx`
   - `step-payment-transaction.tsx`
   - `step-review.tsx`
   - `step-confirmation.tsx`

3. **Update wizard progress indicator** (`wizard-progress.tsx`) to match new design
4. **Update wizard navigation** (`wizard-navigation.tsx`) to match new design

**Design Consistency:**
- Follow dashboard page patterns for card layouts
- Use consistent spacing tokens
- Ensure proper icon sizing
- Match button styles with navigation buttons where appropriate

### Task 3: Adjust Enrollment Form Size to Fill Container
**Location:** `app/ui/app/enrollments/new/page.tsx` and `app/ui/components/enrollment/enrollment-wizard.tsx`

**Current Implementation:**
- Page uses `PageContainer maxWidth="full"`
- Wizard is rendered inside PageContainer

**Required Changes:**
1. **Make wizard fill available width:**
   - Ensure wizard container uses full width of PageContainer
   - Check if wizard has any max-width constraints that need removal
   - Ensure cards inside wizard use full available width

2. **Make wizard fill available height:**
   - Consider if wizard should expand to fill viewport height
   - May need to add `min-h-[calc(100vh-200px)]` or similar
   - Ensure wizard content area expands properly

3. **Update wizard container classes:**
   - Review `enrollment-wizard.tsx` root container
   - Ensure it uses `w-full` and proper height classes
   - Check if Card components inside need width adjustments

**Files to Modify:**
- `app/ui/app/enrollments/new/page.tsx` - Review PageContainer usage
- `app/ui/components/enrollment/enrollment-wizard.tsx` - Update container classes
- Individual step components - Ensure they use full width

### Task 4: Apply Dashboard Patterns to Students Module (If Needed)
**Location:** `app/ui/app/students/page.tsx` and related files

**Check if Students module needs similar updates:**
1. Review students page for background color issues
2. Check if stat cards need visual updates (like dashboard)
3. Verify icon sizing uses design tokens
4. Check spacing consistency (mb-6 for sections)
5. Ensure white backgrounds are applied

**Files to Review:**
- `app/ui/app/students/page.tsx`
- `app/ui/app/students/[id]/page.tsx` (already updated for loading state)

## Technical Notes

### Background Color System
- `body` element: `bg-white dark:bg-gray-900`
- `PageContainer`: `bg-white dark:bg-background` (via className)
- `.page-container` CSS class: `background-color: #ffffff !important` in light mode
- `main` element: `background-color: transparent !important`

### Top Panel Color Reference
- Light mode: `bg-[#e79908]` (gold/orange color from header)
- Dark mode: `dark:bg-gspn-maroon-950`
- See `app/ui/components/navigation/top-nav.tsx` line 78 for exact color

### Design System Standards
- Font: Inter (no Playfair_Display)
- Icons: Lucide React, sized via design tokens
- Colors: GSPN brand colors (maroon `#8B2332`, gold `#D4AF37`, `#e79908` for top panel)
- Spacing: Consistent margins (mb-6 for sections, matching dashboard)
- Buttons: Use design tokens or match navigation button styles

### Component Structure
```
PageContainer (maxWidth="full", bg-white)
  └─ Header section (mb-6)
  └─ EnrollmentWizard
      └─ WizardProgress
      └─ Step components (Card-based)
      └─ WizardNavigation
```

## Files to Modify

### Priority 1: Enrollment Button & Form
1. `app/ui/app/enrollments/page.tsx` - Update "New Enrollment" button background
2. `app/ui/components/enrollment/enrollment-wizard.tsx` - Update container sizing and design
3. `app/ui/app/enrollments/new/page.tsx` - Review PageContainer and layout
4. `app/ui/components/enrollment/steps/*.tsx` - Update all step components with new design

### Priority 2: Students Module (If Needed)
1. `app/ui/app/students/page.tsx` - Review and apply dashboard patterns
2. Check for any other students-related pages

## Commands to Help
```bash
# Find enrollment-related files
find app/ui -name "*enrollment*" -type f

# Find enrollment wizard steps
find app/ui/components/enrollment/steps -name "*.tsx"

# Check for button usage in enrollments
grep -r "Button" app/ui/app/enrollments
grep -r "Button" app/ui/components/enrollment

# Check current wizard container classes
grep -r "className" app/ui/components/enrollment/enrollment-wizard.tsx
```

## Expected Outcome

1. **"New Enrollment" button:**
   - Background color matches top panel (`bg-[#e79908]` in light mode)
   - Proper hover states
   - Readable text color

2. **Enrollment form:**
   - Updated visual design matching dashboard patterns
   - Consistent spacing and icon sizing
   - White backgrounds throughout
   - Full width and height of container
   - All wizard steps follow new design approach

3. **Students module:**
   - Visual consistency with dashboard
   - Proper background colors
   - Design token usage throughout

## Design Reference

### Top Panel Color
- Light mode: `#e79908` (gold/orange)
- See: `app/ui/components/navigation/top-nav.tsx` line 78

### Dashboard Patterns to Follow
- Card styling: Clean borders, proper padding (`p-6`), `rounded-xl`
- Section spacing: `mb-6` between major sections
- Icon sizing: Use design tokens (`sizing.icon.lg` for cards, `sizing.toolbarIcon` for buttons)
- Typography: Inter font, consistent sizing

### Form Design Approach
- Use Card components for form sections
- Consistent spacing between form fields
- Proper button styling matching navigation
- Full-width form containers
- Responsive design maintained
