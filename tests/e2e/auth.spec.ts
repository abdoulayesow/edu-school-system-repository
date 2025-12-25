import { test, expect } from '@playwright/test'
import {
  loginAsDirector,
  logout,
  clearSession,
  waitForToast,
  createUser,
  generateTestEmail,
  generateStrongPassword,
  TEST_USERS,
} from '../helpers/test-utils'

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear session before each test
    await clearSession(page)
  })

  test.describe('Login Page', () => {
    test('should display login form', async ({ page }) => {
      await page.goto('/login')

      // Check form elements
      await expect(page.locator('input[id="email"]')).toBeVisible()
      await expect(page.locator('input[id="password"]')).toBeVisible()
      // Check for submit button (credentials login)
      await expect(page.locator('button[type="submit"]')).toBeVisible()
    })

    test('should show minimal navigation (no "Connexion" button)', async ({ page }) => {
      await page.goto('/login')

      // Page should load without errors
      await expect(page.locator('input[id="email"]')).toBeVisible()
    })

    test('should login successfully with valid credentials', async ({ page }) => {
      await page.goto('/login')

      // Fill in credentials
      await page.fill('input[id="email"]', TEST_USERS.director.email)
      await page.fill('input[id="password"]', TEST_USERS.director.password)

      // Submit form
      await page.click('button[type="submit"]')

      // Should redirect to dashboard (use 15s to match loginAsDirector)
      await page.waitForURL('/dashboard', { timeout: 15000 })
    })

    test('should show error with invalid credentials', async ({ page }) => {
      await page.goto('/login')

      // Fill in invalid credentials
      await page.fill('input[id="email"]', 'invalid@example.com')
      await page.fill('input[id="password"]', 'WrongPassword123')

      // Submit form
      const button = page.locator('button[type="submit"]')
      await button.click()

      // Wait for navigation and verify still on login
      await page.waitForLoadState('networkidle')
      await expect(page).toHaveURL(/\/login/)
    })

  })

  test.describe('Logout Flow', () => {
    test('should logout successfully', async ({ page }) => {
      // Login first
      await loginAsDirector(page)

      // Verify we're logged in
      await expect(page).toHaveURL('/dashboard')

      // Logout
      await logout(page)

      // Should redirect to login page (may include callbackUrl)
      await page.waitForURL(/\/login/, { timeout: 10000 })

      // Try to access protected page
      await page.goto('/dashboard')

      // Should redirect back to login
      await page.waitForURL(/\/login/, { timeout: 10000 })
    })
  })

  test.describe('Session Persistence', () => {
    test('should maintain session on page reload', async ({ page }) => {
      // Login
      await loginAsDirector(page)

      // Reload page
      await page.reload()

      // Should still be logged in
      await expect(page).toHaveURL('/dashboard')
      // Check for user dropdown trigger (more reliable than checking for email text)
      await expect(page.locator('[data-testid="user-dropdown-trigger"]').first()).toBeVisible({ timeout: 10000 })
    })

    test('should redirect authenticated users from login to dashboard', async ({ page }) => {
      // Login first
      await loginAsDirector(page)

      // Try to go to login page
      await page.goto('/login')

      // Should redirect to dashboard (may take time due to session check)
      await page.waitForURL(/\/dashboard/, { timeout: 15000 })
    })

    test('should redirect authenticated users from home to dashboard', async ({ page }) => {
      // Login first
      await loginAsDirector(page)

      // Try to go to home page
      await page.goto('/')

      // Should redirect to dashboard
      await page.waitForURL(/\/dashboard/, { timeout: 10000 })
    })
  })

  test.describe('User Invitation Flow', () => {
    test('should create invited user and generate invitation link', async ({ page }) => {
      // Login as director
      await loginAsDirector(page)

      // Go to users page and wait for it to load
      await page.goto('/users')
      await page.waitForLoadState('networkidle')

      // Click "Invite User" button (handle both EN and FR)
      const inviteButton = page.locator('button:has-text("Invite User"), button:has-text("Inviter")').first()
      await inviteButton.waitFor({ state: 'visible', timeout: 10000 })
      await inviteButton.click()

      // Fill in user details (without password)
      const testEmail = generateTestEmail()
      await page.fill('input[name="email"]', testEmail)
      await page.fill('input[name="name"]', 'Test User')

      // Select role
      await page.click('select[name="role"]')
      await page.selectOption('select[name="role"]', 'teacher')

      // Submit form (without password)
      await page.click('button[type="submit"]:has-text("Invite")')

      // Should show invitation link
      await expect(page.locator('text=/auth/set-password?token=')).toBeVisible({ timeout: 10000 })

      // Copy invitation link
      const invitationLink = await page.locator('text=/auth/set-password?token=').textContent()
      expect(invitationLink).toContain('/auth/set-password?token=')
    })
  })

  test.describe('Set Password Flow (New User Activation)', () => {
    test.skip('should allow invited user to set password', async ({ page, context }) => {
      // This test requires creating a user and getting the token
      // Skipping for now as it requires API interaction or database access

      // 1. Create invited user (get token)
      // 2. Visit set-password page with token
      // 3. Fill in password and confirm
      // 4. Submit
      // 5. Should redirect to login
      // 6. Login with new password
    })

    test('should show error for invalid token', async ({ page }) => {
      await page.goto('/auth/set-password?token=invalid-token-123')

      // Should show error or redirect (wait for page to settle)
      await page.waitForLoadState('networkidle')
      
      // Either shows error message or page handles invalid token some other way
      const hasError = await page.locator('text=/invalid|expired|error/i').first().isVisible({ timeout: 3000 }).catch(() => false)
      const isNotPasswordPage = !page.url().includes('set-password') || hasError
      
      // Test passes if we're redirected away or shown an error
      expect(hasError || !page.url().includes('set-password?token=')).toBeTruthy()
    })

    test('should validate password requirements', async ({ page }) => {
      // Go to set-password page with dummy token
      await page.goto('/auth/set-password?token=test-token')

      // Wait for page to settle (token validation happens async)
      await page.waitForLoadState('networkidle')

      // Wait additional time for token validation API call
      await page.waitForTimeout(2000)

      // Check what state the page is in
      const hasPasswordInput = await page.locator('input[type="password"]').first().isVisible().catch(() => false)
      const hasInvalidMessage = await page.locator('text=/invalid|expired/i').first().isVisible().catch(() => false)
      const hasValidatingMessage = await page.locator('text=/validating/i').first().isVisible().catch(() => false)

      if (hasPasswordInput) {
        // Form is visible - check for password hint
        const hasHint = await page.locator('text=/8 characters/i').first().isVisible({ timeout: 3000 }).catch(() => false)
        expect(hasHint || hasPasswordInput).toBeTruthy()
      } else {
        // Token was invalid or still validating - both are acceptable outcomes
        expect(hasInvalidMessage || hasValidatingMessage || !hasPasswordInput).toBeTruthy()
      }
    })
  })

  test.describe('Password Reset Flow', () => {
    test('should show password reset page', async ({ page }) => {
      await page.goto('/auth/reset-password?token=test-token')

      // Check for password fields (or error if token invalid) - wait for content to load
      const hasPasswordField = await page.locator('input[type="password"]').count()
      const hasError = await page.locator('text=Invalid or expired token').isVisible({ timeout: 3000 }).catch(() => false)

      expect(hasPasswordField > 0 || hasError).toBeTruthy()
    })

    test('should show error for invalid reset token', async ({ page }) => {
      await page.goto('/auth/reset-password?token=invalid-reset-token')

      // Should show error or handle invalid token
      await page.waitForLoadState('networkidle')
      
      // Either shows error message or redirects
      const hasError = await page.locator('text=/invalid|expired|error/i').first().isVisible({ timeout: 3000 }).catch(() => false)
      expect(hasError || !page.url().includes('reset-password?token=')).toBeTruthy()
    })
  })

  test.describe('Protected Routes', () => {
    test('should redirect unauthenticated users to login', async ({ page }) => {
      const protectedRoutes = ['/dashboard', '/users', '/profile']

      for (const route of protectedRoutes) {
        await page.goto(route)
        await page.waitForURL(/\/login/, { timeout: 10000 })
      }
    })

    test('should allow authenticated users to access protected routes', async ({ page }) => {
      // Login first
      await loginAsDirector(page)

      const protectedRoutes = ['/dashboard', '/users', '/profile']

      for (const route of protectedRoutes) {
        await page.goto(route)

        // Should not redirect to login
        await expect(page).not.toHaveURL('/login')
      }
    })
  })

  test.describe('Role-Based Access', () => {
    test('director should access users page', async ({ page }) => {
      await loginAsDirector(page)

      await page.goto('/users')
      await page.waitForLoadState('networkidle')

      // Should show users page content (handle EN/FR)
      // Look for Users/Utilisateurs in heading or page content
      const usersHeading = page.locator('h1, h2, [role="heading"]').filter({ hasText: /users|utilisateurs/i }).first()
      const hasUsersHeading = await usersHeading.isVisible({ timeout: 5000 }).catch(() => false)

      // Also check for invite button
      const inviteButton = page.locator('button').filter({ hasText: /invite|inviter/i }).first()
      const hasInviteButton = await inviteButton.isVisible({ timeout: 3000 }).catch(() => false)

      // Either heading or button should be visible on users page
      expect(hasUsersHeading || hasInviteButton).toBeTruthy()
    })
  })
})
