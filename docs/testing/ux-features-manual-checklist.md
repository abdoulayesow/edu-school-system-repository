# UX Features Manual Testing Checklist

## Test Environment Setup
- [ ] Local development server running (`npm run dev`)
- [ ] Test user account created (director role)
- [ ] Google OAuth configured
- [ ] Browser: Chrome/Firefox/Safari
- [ ] Database accessible and seeded

## 1. Desktop Navigation Tests

### Authenticated User
- [ ] Logo and school name visible in nav bar
- [ ] All navigation links visible based on role
- [ ] Language switcher functional (EN/FR)
- [ ] Online/Offline indicator present
- [ ] User avatar + name visible in top right

### User Dropdown Menu
- [ ] Clicking avatar opens dropdown
- [ ] Dropdown shows user name and role
- [ ] "Profile" link navigates to `/profile`
- [ ] "Sign Out" button present (red/destructive style)
- [ ] Clicking outside closes dropdown
- [ ] No page shift when dropdown opens (scrollbar fix)
- [ ] Dropdown positioned correctly (8px offset from avatar)

### Unauthenticated User
- [ ] "Connexion" button visible instead of avatar
- [ ] Clicking "Connexion" redirects to `/login`
- [ ] No protected navigation links visible

## 2. Mobile Navigation Tests

### Hamburger Menu
- [ ] Menu icon visible on mobile (<768px width)
- [ ] Clicking opens sidebar from left
- [ ] Avatar + name shown in sidebar header
- [ ] Language switcher present
- [ ] Online/Offline toggle present
- [ ] Navigation links present

### Mobile User Dropdown
- [ ] "My Account" button visible in sidebar footer
- [ ] Clicking opens dropdown (upward)
- [ ] "Profile" link navigates to `/profile`
- [ ] "Sign Out" button present
- [ ] Clicking link closes sidebar automatically
- [ ] No visual glitches on open/close

## 3. Login Page Tests

### Branding
- [ ] GSPN logo visible
- [ ] School name displayed
- [ ] Language switcher visible
- [ ] No navigation links shown (minimal header)
- [ ] No "Connexion" button shown (redundant)
- [ ] Clean, minimal header design

### Login Form
- [ ] Email input field present
- [ ] Password input field present
- [ ] "Sign in with Credentials" button works
- [ ] "Sign in with Google" button works
- [ ] Error messages display correctly for invalid credentials
- [ ] Redirect to `/dashboard` after successful login
- [ ] "Forgot Password?" link present (if implemented)

## 4. Home Page Redirect Tests

### Authenticated User
- [ ] Visiting "/" shows loading spinner
- [ ] Automatic redirect to `/dashboard`
- [ ] No flash of login form

### Unauthenticated User
- [ ] Visiting "/" shows login form
- [ ] No redirect loop

## 5. Authentication Flow Tests

### User Invitation Flow
- [ ] Director can access `/users` page
- [ ] "Invite User" button/dialog present
- [ ] Can create user without password
- [ ] Invitation link displayed after creation
- [ ] Invitation link includes token parameter
- [ ] Token format: `/auth/set-password?token=...`

### Set Password Flow (New User Activation)
- [ ] Visiting invitation link loads set-password page
- [ ] Token validation happens automatically
- [ ] Invalid/expired token shows error message
- [ ] Password input field present
- [ ] Confirm password input field present
- [ ] Password requirements displayed:
  - [ ] Min 8 characters
  - [ ] Uppercase letter
  - [ ] Lowercase letter
  - [ ] Number
- [ ] Passwords must match (validation)
- [ ] "Set Password" button submits form
- [ ] Success redirects to `/login`
- [ ] User can log in with new password
- [ ] User status changed from "invited" to "active"

### Password Reset Flow (Existing User)
- [ ] "Forgot Password?" link on login page
- [ ] Request reset page asks for email
- [ ] Reset link generated (displayed to admin for now)
- [ ] Visiting reset link loads reset-password page
- [ ] Similar validation to set-password page
- [ ] Password successfully changed
- [ ] Can log in with new password
- [ ] User status remains unchanged

### Login with Credentials
- [ ] Can log in with email + password
- [ ] Active users can log in
- [ ] Invited users (no password) cannot log in
- [ ] Inactive users cannot log in
- [ ] Error messages appropriate for each case

### Login with Google OAuth
- [ ] "Sign in with Google" button works
- [ ] Google OAuth consent screen appears
- [ ] Successful OAuth redirects to dashboard
- [ ] Admin emails auto-create on first login
- [ ] Non-admin emails must be pre-invited
- [ ] OAuth links to existing account if email matches

## 6. Profile Page Tests (`/profile`)

### Access Control
- [ ] Unauthenticated users redirected to `/login`
- [ ] Authenticated users can access
- [ ] No role restrictions (all users can see own profile)

### Display - Account Information Card
- [ ] Card title "Account Information" shown
- [ ] User avatar displayed (or initials placeholder)
- [ ] Email field populated and displayed
- [ ] Role badge displayed with correct formatting
- [ ] Status badge displayed with correct color:
  - [ ] Active = default (blue)
  - [ ] Invited = secondary (gray)
  - [ ] Inactive = destructive (red)

### Display - Personal Information Card
- [ ] Card title "Personal Information" shown
- [ ] Name field populated
- [ ] Date of birth field populated (formatted as date input)
- [ ] Phone field populated

### Display - Address Information Section
- [ ] Section title "Address Information" shown
- [ ] Street address field populated
- [ ] City field populated
- [ ] State/Province field populated
- [ ] Postal code field populated
- [ ] Country field populated

### Editing Functionality
- [ ] Can edit name field
- [ ] Can edit date of birth (date picker works)
- [ ] Can edit phone number
- [ ] Can edit all address fields
- [ ] Cannot edit email (read-only/disabled)
- [ ] Cannot edit role (display-only badge)
- [ ] Cannot edit status (display-only badge)

### Form Submission
- [ ] "Save Changes" button present
- [ ] Button shows "Saving..." during request
- [ ] Success toast displayed on save
- [ ] Error toast displayed on failure
- [ ] Page refreshes to show updated data
- [ ] Form disabled during submission
- [ ] Can submit with partial data (optional fields)
- [ ] Validation prevents invalid data

### Responsive Design
- [ ] Desktop: 2-column grid layout
- [ ] Mobile: 1-column stacked layout
- [ ] All fields accessible on mobile
- [ ] Form remains usable on small screens

## 7. Visual Polish Tests

### Scrollbar Fix
- [ ] Scrollbar always visible on desktop (overflow-y-scroll)
- [ ] No layout shift when dropdown opens
- [ ] No page jump when modal opens
- [ ] Consistent scrollbar appearance

### Dropdown Spacing
- [ ] Desktop dropdown has natural spacing (8px from trigger)
- [ ] Mobile dropdown has natural spacing (8px from trigger)
- [ ] Dropdowns don't feel cramped
- [ ] Smooth open/close animations
- [ ] Proper z-index (above other content)

### Typography and Colors
- [ ] Consistent font sizes across pages
- [ ] Readable text contrast ratios
- [ ] Proper color usage for badges
- [ ] Icons align with text

## 8. Translation Tests

### Language Switching
- [ ] Language switcher accessible on all pages
- [ ] Switching to French translates all UI text
- [ ] Switching back to English works
- [ ] Navigation labels translate (EN/FR)
- [ ] Profile page translates correctly
- [ ] Dropdown menu items translate
- [ ] Login page translates
- [ ] Toast messages translate
- [ ] Form labels and buttons translate
- [ ] Language preference persists across pages

### Translation Coverage
- [ ] All user-facing text has translations
- [ ] No "undefined" or missing translation keys
- [ ] Proper French grammar and capitalization

## 9. User Management Tests (Director Role)

### Users Page
- [ ] Director can access `/users` page
- [ ] List of users displayed
- [ ] User information shown (name, email, role, status)
- [ ] "Invite User" button present

### Invite User Dialog
- [ ] Dialog opens when clicking "Invite User"
- [ ] Email field present
- [ ] Name field present (optional)
- [ ] Role dropdown present
- [ ] Password field present (optional)
- [ ] Can create user with password (status: active)
- [ ] Can create user without password (status: invited)
- [ ] Invitation link displayed after creation
- [ ] Link is copyable
- [ ] User appears in users list immediately

### User Status Management
- [ ] Invited users show "invited" badge
- [ ] Active users show "active" badge
- [ ] Inactive users show "inactive" badge
- [ ] Can view user details
- [ ] Can edit user information (if implemented)

## 10. Cross-Browser Tests

Run all above tests on:
- [ ] Chrome (latest stable)
- [ ] Firefox (latest stable)
- [ ] Safari (latest stable)
- [ ] Edge (latest stable)

## 11. Responsive Design Tests

Test all features at:
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet Portrait (768x1024)
- [ ] Tablet Landscape (1024x768)
- [ ] Mobile Large (414x896 - iPhone XR)
- [ ] Mobile Medium (375x667 - iPhone SE)
- [ ] Mobile Small (320x568 - iPhone 5)

## 12. Performance Tests

- [ ] Page load times acceptable (<3s)
- [ ] No console errors on any page
- [ ] No console warnings (except expected)
- [ ] Images load properly
- [ ] Fonts load without FOUT/FOIT

## 13. Accessibility Tests

- [ ] Can navigate entire site with keyboard only
- [ ] Tab order is logical
- [ ] Focus indicators visible
- [ ] Forms have proper labels
- [ ] Error messages associated with inputs
- [ ] Color contrast meets WCAG AA standards
- [ ] Screen reader can read all content

## Pass Criteria

✅ **Testing Complete When:**
- All checkboxes marked as passing
- No visual glitches or layout issues
- No console errors during testing
- All features functional across browsers and devices
- All authentication flows work end-to-end
- All translations working properly

## Notes

**Test Users:**
- Director: abdoulaye.sow.1989@gmail.com
- Create additional test users with different roles for comprehensive testing

**Known Limitations:**
- Email sending not implemented (invitation links must be manually shared)
- Password reset requires manual link sharing
- No automated email notifications

**Testing Environment:**
- Local: http://localhost:3000
- Database: Neon PostgreSQL (development instance)
- OAuth: Google OAuth configured for localhost

---

**Last Updated:** 2025-12-23
**Tester:** _________________
**Date Tested:** _________________
**Pass/Fail:** _________________
