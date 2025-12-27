import { Page, expect } from '@playwright/test'

/**
 * Test user credentials for different roles
 */
export const TEST_USERS = {
  director: {
    email: 'abdoulaye.sow.1989@gmail.com',
    password: 'TestPassword123',
    role: 'director',
  },
  // Add more test users as needed
}

/**
 * Login as a director user
 * @param page - Playwright page object
 */
export async function loginAsDirector(page: Page) {
  await page.goto('/login')

  // Wait for form to be ready
  await page.waitForSelector('input[id="email"]', { state: 'visible', timeout: 5000 })

  await page.fill('input[id="email"]', TEST_USERS.director.email)
  await page.fill('input[id="password"]', TEST_USERS.director.password)
  await page.click('button[type="submit"]')

  // Poll for session establishment (matches global-setup.ts pattern)
  let attempts = 0
  const maxAttempts = 20 // 10 seconds total

  while (attempts < maxAttempts) {
    await page.waitForTimeout(500)
    const currentUrl = page.url()

    if (currentUrl.includes('/dashboard')) {
      return
    }

    // Check session endpoint
    const response = await page.request.get('/api/auth/session')
    const session = await response.json()
    if (session?.user?.email) {
      await page.goto('/dashboard')
      await page.waitForLoadState('networkidle')
      return
    }

    attempts++
  }

  throw new Error('Login timed out - session not established')
}

/**
 * Login with custom credentials
 * @param page - Playwright page object
 * @param email - User email
 * @param password - User password
 * @param expectedRedirect - Expected URL after login (default: /dashboard)
 */
export async function login(
  page: Page,
  email: string,
  password: string,
  expectedRedirect: string = '/dashboard'
) {
  await page.goto('/login')
  await page.fill('input[id="email"]', email)
  await page.fill('input[id="password"]', password)
  await page.click('button[type="submit"]')

  // Wait for redirect
  await page.waitForURL(expectedRedirect, { timeout: 10000 })
}

/**
 * Logout the current user
 * @param page - Playwright page object
 */
export async function logout(page: Page) {
  // Click on user avatar/dropdown trigger
  const dropdownTrigger = page.locator('[data-testid="user-dropdown-trigger"]').first()

  // Wait for the dropdown trigger to be visible and click it
  await dropdownTrigger.waitFor({ state: 'visible', timeout: 10000 })
  await dropdownTrigger.click()

  // Wait for dropdown to be visible
  await expect(page.locator('[role="menu"]').first()).toBeVisible({ timeout: 3000 })

  // Click Sign Out button
  await page.locator('[role="menu"]').first().locator('text=/sign out|déconnexion/i').first().click()

  // Wait for redirect to login
  await page.waitForURL(/\/login/, { timeout: 10000 })
}

/**
 * Check if user is authenticated by looking for user menu
 * @param page - Playwright page object
 * @returns boolean - true if authenticated
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  try {
    // Look for user dropdown trigger or avatar
    const userMenu = page.locator('[data-testid="user-dropdown-trigger"]').first()
    const isVisible = await userMenu.isVisible({ timeout: 2000 })
    return isVisible
  } catch {
    return false
  }
}

/**
 * Wait for toast notification with specific text
 * @param page - Playwright page object
 * @param text - Expected toast text
 */
export async function waitForToast(page: Page, text: string) {
  await expect(page.locator(`text=${text}`)).toBeVisible({ timeout: 5000 })
}

/**
 * Wait for error toast notification
 * @param page - Playwright page object
 */
export async function waitForErrorToast(page: Page) {
  await expect(page.locator('[role="alert"]')).toBeVisible({ timeout: 5000 })
}

/**
 * Clear all cookies and local storage
 * @param page - Playwright page object
 */
export async function clearSession(page: Page) {
  // Clear cookies first (doesn't require a page to be loaded)
  await page.context().clearCookies()

  // Navigate to a page first before trying to clear storage
  // (otherwise we get SecurityError on about:blank)
  try {
    // Use relative URL - Playwright will use the baseURL from config
    await page.goto('/login', { waitUntil: 'commit' })
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })
  } catch {
    // If we can't clear storage, just proceed - cookies are cleared
  }
}

/**
 * Open mobile navigation menu (hamburger menu)
 * @param page - Playwright page object
 */
export async function openMobileMenu(page: Page) {
  // Click hamburger menu button
  await page.click('button[aria-label="Toggle menu"]')

  // Wait for sidebar to be visible (replaced waitForTimeout)
  await expect(page.locator('[role="dialog"], [class*="sidebar"]').first()).toBeVisible({ timeout: 2000 })
}

/**
 * Close mobile navigation menu
 * @param page - Playwright page object
 */
export async function closeMobileMenu(page: Page) {
  // Click outside the sidebar or close button
  await page.click('button[aria-label="Toggle menu"]')

  // Wait for sidebar to be hidden (replaced waitForTimeout)
  await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 2000 })
}

/**
 * Switch language to French
 * @param page - Playwright page object
 */
export async function switchToFrench(page: Page) {
  await page.click('button:has-text("EN")')
  // Wait for language switch (replaced waitForTimeout)
  await expect(page.locator('button:has-text("FR")')).toBeVisible({ timeout: 2000 })
}

/**
 * Switch language to English
 * @param page - Playwright page object
 */
export async function switchToEnglish(page: Page) {
  await page.click('button:has-text("FR")')
  // Wait for language switch (replaced waitForTimeout)
  await expect(page.locator('button:has-text("EN")')).toBeVisible({ timeout: 2000 })
}

/**
 * Create a new user via admin API (requires director auth)
 * @param page - Playwright page object
 * @param userData - User data
 * @returns invitation link if user created without password
 */
export async function createUser(
  page: Page,
  userData: {
    email: string
    name?: string
    role?: string
    password?: string
  }
): Promise<{ user: any; invitationLink?: string }> {
  const response = await page.request.post('/api/admin/users', {
    data: userData,
  })

  expect(response.ok()).toBeTruthy()

  const result = await response.json()
  return result
}

/**
 * Generate a random email for testing
 * @returns random email address
 */
export function generateTestEmail(): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(7)
  return `test-${timestamp}-${random}@example.com`
}

/**
 * Generate a strong password for testing
 * @returns strong password string
 */
export function generateStrongPassword(): string {
  return `Test${Math.random().toString(36).substring(7)}123!`
}
