# Dark Mode Colors Update Prompt: Top Panel & Left Sidebar

## Context

This task is part of updating dark mode colors throughout the GSPN School Management System to match the Figma design. The focus is on the top navigation panel and left sidebar navigation panel.

## Current Implementation

### Top Panel (`app/ui/components/navigation/top-nav.tsx`)
- **Light mode background:** `bg-[#e79908]` (gold/orange)
- **Dark mode background (current):** `dark:bg-gspn-maroon-950`
- **Height:** `h-[91px]` (recently increased by 1/5 from 76px)
- **Location:** Line 78 in `top-nav.tsx`

### Left Sidebar (`app/ui/components/navigation/nav-sidebar.tsx`)
- **Light mode background (current):** `bg-[#eaa428]` (slightly lighter gold, recently updated)
- **Dark mode background (current):** `dark:bg-gspn-maroon-950`
- **Position:** `top-[91px]` (matches top panel height)
- **Location:** Line 70-71 in `nav-sidebar.tsx`

## Figma Design Reference (Dark Mode)

From the provided HTML export of the dashboard in dark mode, extract the following color values:

### Top Panel (Navigation Bar)
- **Dark mode background:** `#2d0707` (dark maroon/burgundy)
- **Current implementation uses:** `gspn-maroon-950` which may need to be updated to `#2d0707`

### Left Sidebar & Navigation Elements
From the HTML analysis:
- **Active navigation button (dark mode):** `dark:bg-[#e79908] dark:text-[#2d0707]` - Uses gold background with dark text
- **Inactive button hover (dark mode):** `dark:hover:bg-[#4a0c0c]` - Darker maroon hover state
- **Mobile nav active button:** `dark:bg-[#e79908] dark:text-[#2d0707]`
- **Mobile nav inactive hover:** `dark:hover:bg-[#4a0c0c]`

### Color Values to Use
1. **Top panel dark background:** `#2d0707`
2. **Sidebar dark background:** `#2d0707` (should match top panel)
3. **Hover states (dark mode):** `#4a0c0c`
4. **Active button (dark mode):** `#e79908` background with `#2d0707` text

## Files to Update

### Priority 1: Top Panel
**File:** `app/ui/components/navigation/top-nav.tsx`
- **Line ~78:** Update header className from `dark:bg-gspn-maroon-950` to `dark:bg-[#2d0707]`

### Priority 2: Left Sidebar
**File:** `app/ui/components/navigation/nav-sidebar.tsx`
- **Line ~70-71:** Update sidebar background from `dark:bg-gspn-maroon-950` to `dark:bg-[#2d0707]`
- **Review hover states:** Update any `dark:hover:bg-gspn-maroon-800` to `dark:hover:bg-[#4a0c0c]`
- **Review active states:** Ensure active sidebar items use appropriate colors

### Priority 3: Mobile Navigation (if needed)
**File:** `app/ui/components/navigation/mobile-nav.tsx`
- Check if mobile nav uses the same dark mode colors
- Update to match the design if different

## Design Tokens Reference

Current dark mode maroon colors in `app/ui/app/globals.css`:
- `--color-gspn-maroon-950: #050404` (very dark, almost black)

The Figma design uses `#2d0707` which is slightly lighter than the current maroon-950.

## Implementation Notes

1. **Consistency:** Ensure both top panel and left sidebar use the same dark background color (`#2d0707`)
2. **Hover States:** Update hover states to use `#4a0c0c` for better visibility
3. **Active States:** Active navigation items should use gold background (`#e79908`) with dark text (`#2d0707`) in dark mode
4. **Text Colors:** Ensure text remains readable with the new background colors
5. **Borders:** Check if border colors need adjustment for the new backgrounds

## Testing Checklist

- [ ] Top panel background color matches Figma in dark mode (`#2d0707`)
- [ ] Left sidebar background color matches Figma in dark mode (`#2d0707`)
- [ ] Hover states use `#4a0c0c` and are visible
- [ ] Active navigation items use `#e79908` background with `#2d0707` text
- [ ] Text remains readable on new backgrounds
- [ ] Borders are visible and appropriate
- [ ] Light mode remains unchanged
- [ ] Mobile navigation matches desktop navigation colors

## Related Files

- `app/ui/components/navigation/top-nav.tsx` - Top navigation bar
- `app/ui/components/navigation/nav-sidebar.tsx` - Left sidebar navigation
- `app/ui/components/navigation/mobile-nav.tsx` - Mobile navigation
- `app/ui/app/globals.css` - Global color definitions
- `app/ui/lib/design-tokens.ts` - Design token definitions (if colors are tokenized)

## Next Steps

1. Update top panel dark mode background to `#2d0707`
2. Update left sidebar dark mode background to `#2d0707`
3. Update hover states to use `#4a0c0c`
4. Verify active states use appropriate colors
5. Test in both light and dark modes
6. Check mobile navigation consistency

