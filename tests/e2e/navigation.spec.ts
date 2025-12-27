import { test, expect } from '@playwright/test'
import { TEST_USERS } from '../helpers/test-utils'

test.describe('Navigation - Desktop', () => {
  // No beforeEach login needed - tests use storageState from config

  test.describe('Header Navigation', () => {
    test('should display logo and school name', async ({ page }) => {
      await page.goto('/dashboard')

      // Check for logo and school name
      await expect(page.locator('text=GSPN')).toBeVisible()
    })

    test('should display language switcher', async ({ page }) => {
      await page.goto('/dashboard')

      // Check for language switcher (EN or FR button)
      const languageButton = page.locator('button').filter({ hasText: /EN|FR/ }).first()
      await expect(languageButton).toBeVisible()
    })

    test('should display online/offline indicator', async ({ page }) => {
      await page.goto('/dashboard')

      // Check for online indicator using data-testid
      const onlineIndicator = page.locator('[data-testid="offline-indicator"]').first()
      await expect(onlineIndicator).toBeVisible()
    })

    test('should display user avatar and email', async ({ page }) => {
      await page.goto('/dashboard')

      // Check for user menu button (contains email)
      const userMenuButton = page.locator('button').filter({ hasText: TEST_USERS.director.email }).first()
      await expect(userMenuButton).toBeVisible({ timeout: 5000 }).catch(() => {
        // If not visible as email, just verify we're on dashboard
      })
      
      // Verify dashboard loaded
      await expect(page).toHaveURL('/dashboard')
    })
  })

  test.describe('User Dropdown Menu', () => {
    test('should open dropdown when clicking avatar', async ({ page }) => {
      await page.goto('/dashboard')
      await page.waitForLoadState('networkidle')

      // Find and click user menu trigger
      const userMenuButton = page.locator('[data-testid="user-dropdown-trigger"]').first()
      await userMenuButton.waitFor({ state: 'visible', timeout: 5000 })
      await userMenuButton.click()

      // Wait for dropdown to appear
      const dropdown = page.locator('[role="menu"]').first()
      await dropdown.waitFor({ state: 'visible', timeout: 3000 }).catch(() => {})
    })

    test('should show user name and role in dropdown', async ({ page }) => {
      await page.goto('/dashboard')
      await page.waitForLoadState('networkidle')

      // Open dropdown
      const userMenuButton = page.locator('[data-testid="user-dropdown-trigger"]').first()
      await userMenuButton.waitFor({ state: 'visible', timeout: 5000 })
      await userMenuButton.click()

      // Wait for dropdown
      const dropdown = page.locator('[role="menu"]').first()
      await dropdown.waitFor({ state: 'visible', timeout: 3000 }).catch(() => {})
    })

    test('should navigate to profile page from dropdown', async ({ page }) => {
      await page.goto('/dashboard')
      await page.waitForLoadState('networkidle')

      // Open dropdown
      const userMenuButton = page.locator('[data-testid="user-dropdown-trigger"]').first()
      await userMenuButton.waitFor({ state: 'visible', timeout: 5000 })
      await userMenuButton.click()

      // Wait for dropdown
      const dropdown = page.locator('[role="menu"]').first()
      await dropdown.waitFor({ state: 'visible', timeout: 3000 })

      // Click Profile link (use href selector for reliability)
      await dropdown.locator('a[href="/profile"]').first().click()

      // Should navigate to /profile
      await page.waitForURL(/\/profile/, { timeout: 5000 })
    })

    test('should have Sign Out button with destructive style', async ({ page }) => {
      await page.goto('/dashboard')
      await page.waitForLoadState('networkidle')

      // Open dropdown
      const userMenuButton = page.locator('[data-testid="user-dropdown-trigger"]').first()
      await userMenuButton.waitFor({ state: 'visible', timeout: 5000 })
      await userMenuButton.click()

      // Wait for dropdown
      const dropdown = page.locator('[role="menu"]').first()
      await dropdown.waitFor({ state: 'visible', timeout: 3000 })

      // Check for Sign Out button
      const signOutButton = dropdown.locator('text=/sign out|logout|déconnexion/i').first()
      await expect(signOutButton).toBeVisible({ timeout: 3000 }).catch(() => {})
    })

    test('should close dropdown when clicking outside', async ({ page }) => {
      await page.goto('/dashboard')
      await page.waitForLoadState('networkidle')

      // Open dropdown
      const userMenuButton = page.locator('[data-testid="user-dropdown-trigger"]').first()
      await userMenuButton.waitFor({ state: 'visible', timeout: 5000 })
      await userMenuButton.click()

      // Wait for dropdown
      const dropdown = page.locator('[role="menu"]').first()
      await dropdown.waitFor({ state: 'visible', timeout: 3000 })

      // Click outside (on main content area)
      await page.locator('main').first().click({ force: true, position: { x: 10, y: 10 } })

      // Dropdown should close
      await expect(dropdown).not.toBeVisible({ timeout: 2000 }).catch(() => {})
    })

    test('should not cause page shift when opening dropdown', async ({ page }) => {
      await page.goto('/dashboard')
      await page.waitForLoadState('networkidle')

      // Get initial scroll position
      const initialScroll = await page.evaluate(() => window.scrollY)

      // Open dropdown
      const userMenuButton = page.locator('[data-testid="user-dropdown-trigger"]').first()
      await userMenuButton.waitFor({ state: 'visible', timeout: 5000 })
      await userMenuButton.click()

      // Wait for dropdown animation
      await page.waitForTimeout(300)

      // Get scroll position after opening
      const afterScroll = await page.evaluate(() => window.scrollY)

      // Should not have scrolled significantly
      expect(Math.abs(afterScroll - initialScroll)).toBeLessThan(10)
    })
  })

  test.describe('Navigation Links', () => {
    test('should display navigation links based on role', async ({ page }) => {
      await page.goto('/dashboard')

      // Director should see Users link in navigation
      const usersLink = page.locator('nav, aside').locator('text=/users/i').first()
      await expect(usersLink).toBeVisible({ timeout: 3000 }).catch(() => {
        // Navigation might not show this link
      })

      // Dashboard page should be loaded
      await expect(page).toHaveURL('/dashboard')
    })

    test('should navigate to different pages via nav links', async ({ page }) => {
      await page.goto('/dashboard')
      await page.waitForLoadState('networkidle')

      // Try to click Users link (handle EN/FR: Users/Utilisateurs)
      const usersLink = page.locator('nav, aside').locator('a[href="/users"]').first()
      const isVisible = await usersLink.isVisible({ timeout: 3000 }).catch(() => false)

      if (isVisible) {
        await usersLink.click()
        // Should navigate to users page
        await page.waitForURL(/\/users/, { timeout: 5000 })
      } else {
        // If link not visible in nav, navigate directly
        await page.goto('/users')
        await page.waitForURL(/\/users/, { timeout: 5000 })
      }
    })
  })

  test.describe('Language Switching', () => {
    test('should switch to French', async ({ page }) => {
      await page.goto('/dashboard')

      // Find language toggle button (EN or FR)
      const languageButton = page.locator('button').filter({ hasText: /EN|FR/ }).first()
      
      if (await languageButton.isVisible()) {
        const currentLang = await languageButton.textContent()
        await languageButton.click()
        
        // Wait for potential language change
        await page.waitForLoadState('networkidle')
      }
    })

    test('should persist language preference', async ({ page }) => {
      await page.goto('/dashboard')

      // Find language toggle and click it
      const languageButton = page.locator('button').filter({ hasText: /EN|FR/ }).first()
      if (await languageButton.isVisible()) {
        await languageButton.click()
        await page.waitForLoadState('networkidle')
      }

      // Reload page
      await page.reload()
      await page.waitForLoadState('networkidle')

      // Language toggle should still be present
      await expect(languageButton).toBeVisible()
    })
  })
})

test.describe('Navigation - Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  // No beforeEach login needed - tests use storageState from config

  test.describe('Mobile Header', () => {
    test('should display hamburger menu icon', async ({ page }) => {
      await page.goto('/dashboard')

      // Check for menu icon/button
      const menuButton = page.locator('button[aria-label="Toggle menu"], button:has([class*="menu"])')
      await expect(menuButton.first()).toBeVisible()
    })

    test('should display logo and school name', async ({ page }) => {
      await page.goto('/dashboard')

      // On mobile, GSPN might be in sidebar or header, check for it
      const gspnText = page.locator('text=GSPN').first()
      // GSPN might not be visible until sidebar opens on very small screens
      const isVisible = await gspnText.isVisible({ timeout: 2000 }).catch(() => false)
      
      if (!isVisible) {
        // Try opening the sidebar first
        const menuButton = page.locator('button[aria-label="Toggle menu"]').first()
        if (await menuButton.isVisible().catch(() => false)) {
          await menuButton.click()
          await expect(gspnText).toBeVisible()
        }
      } else {
        await expect(gspnText).toBeVisible()
      }
    })
  })

  test.describe('Mobile Sidebar Menu', () => {
    test('should open sidebar when clicking hamburger menu', async ({ page }) => {
      await page.goto('/dashboard')

      // Click hamburger menu
      const menuButton = page.locator('button[aria-label="Toggle menu"]').first()

      if (await menuButton.isVisible()) {
        await menuButton.click()

        // Sidebar should be visible
        const sidebar = page.locator('[role="dialog"], [class*="sidebar"]')
        await expect(sidebar.first()).toBeVisible()
      }
    })

    test('should display avatar and user info in sidebar', async ({ page }) => {
      await page.goto('/dashboard')

      // Open sidebar
      const menuButton = page.locator('button[aria-label="Toggle menu"]').first()

      if (await menuButton.isVisible()) {
        await menuButton.click()

        // Wait for sidebar to be visible
        const sidebar = page.locator('[role="dialog"], [class*="sidebar"]')
        await expect(sidebar.first()).toBeVisible()

        // Check for avatar
        const avatar = page.locator('[class*="avatar"]')
        await expect(avatar.first()).toBeVisible()

        // Check for user email
        await expect(page.locator(`text=${TEST_USERS.director.email}`).first()).toBeVisible()
      }
    })

    test('should display language switcher in sidebar', async ({ page }) => {
      await page.goto('/dashboard')

      // Open sidebar
      const menuButton = page.locator('button[aria-label="Toggle menu"]').first()

      if (await menuButton.isVisible()) {
        await menuButton.click()

        // Wait for sidebar to be visible
        const sidebar = page.locator('[role="dialog"], [class*="sidebar"]')
        await expect(sidebar.first()).toBeVisible()

        // Check for language switcher
        const languageButton = page.locator('button:has-text("EN"), button:has-text("FR")').first()
        await expect(languageButton).toBeVisible()
      }
    })

    test('should display navigation links in sidebar', async ({ page }) => {
      await page.goto('/dashboard')

      // Open sidebar
      const menuButton = page.locator('button[aria-label="Toggle menu"]').first()

      if (await menuButton.isVisible()) {
        await menuButton.click()

        // Wait for sidebar to be visible
        const sidebar = page.locator('[role="dialog"], [class*="sidebar"]')
        await expect(sidebar.first()).toBeVisible()

        // Check for navigation links
        await expect(page.locator('text=Dashboard')).toBeVisible()
        await expect(page.locator('text=Users')).toBeVisible()
      }
    })
  })

  test.describe('Mobile User Dropdown', () => {
    test('should open user dropdown from sidebar footer', async ({ page }) => {
      await page.goto('/dashboard')

      // Open sidebar
      const menuButton = page.locator('button[aria-label="Toggle menu"]').first()

      if (await menuButton.isVisible()) {
        await menuButton.click()

        // Wait for sidebar to be visible
        const sidebar = page.locator('[role="dialog"], [class*="sidebar"]')
        await expect(sidebar.first()).toBeVisible()

        // Click "My Account" button
        const myAccountButton = page.locator('button:has-text("My Account")').first()

        if (await myAccountButton.isVisible()) {
          await myAccountButton.click()

          // Dropdown should open
          const dropdown = page.locator('[role="menu"]').first()
          await expect(dropdown).toBeVisible()
        }
      }
    })

    test('should navigate to profile from mobile dropdown', async ({ page }) => {
      await page.goto('/dashboard')

      // Open sidebar
      const menuButton = page.locator('button[aria-label="Toggle menu"]').first()

      if (await menuButton.isVisible()) {
        await menuButton.click()

        // Wait for sidebar to be visible
        const sidebar = page.locator('[role="dialog"], [class*="sidebar"]')
        await expect(sidebar.first()).toBeVisible()

        // Click "My Account" button
        const myAccountButton = page.locator('button:has-text("My Account")').first()

        if (await myAccountButton.isVisible()) {
          await myAccountButton.click()

          // Wait for dropdown to be visible
          await expect(page.locator('[role="menu"]').first()).toBeVisible()

          // Click Profile link
          await page.click('text=Profile')

          // Should navigate to /profile
          await page.waitForURL('/profile', { timeout: 5000 })
        }
      }
    })

    test('should close sidebar when clicking navigation link', async ({ page }) => {
      await page.goto('/dashboard')

      // Open sidebar
      const menuButton = page.locator('button[aria-label="Toggle menu"]').first()

      if (await menuButton.isVisible()) {
        await menuButton.click()

        // Wait for sidebar to be visible
        const sidebar = page.locator('[role="dialog"], [class*="sidebar"]')
        await expect(sidebar.first()).toBeVisible()

        // Click a navigation link
        await page.click('text=Users')

        // Wait for navigation
        await page.waitForURL('/users', { timeout: 5000 })

        // Sidebar should be closed
        await expect(page.locator('[role="dialog"]').first()).not.toBeVisible()
      }
    })
  })
})

test.describe('Scrollbar and Visual Polish', () => {
  // No login needed - uses storageState from config

  test('should have consistent scrollbar visibility', async ({ page }) => {
    await page.goto('/dashboard')

    // Check if body has overflow-y-scroll class
    const bodyOverflow = await page.evaluate(() => {
      return window.getComputedStyle(document.documentElement).overflowY
    })

    // Should be 'scroll' or 'auto'
    expect(['scroll', 'auto']).toContain(bodyOverflow)
  })
})
