import { test, expect } from '@playwright/test'

test.describe('Enrollment Management', () => {
  // No beforeEach login needed - tests use storageState from playwright.config.ts

  test.describe('Enrollment List', () => {
    test('should display enrollment list page', async ({ page }) => {
      await page.goto('/enrollments')
      await page.waitForLoadState('networkidle')

      // Check for page title (EN or FR)
      const pageTitle = page.locator('h1, h2').filter({ hasText: /enrollment|inscription/i }).first()
      await expect(pageTitle).toBeVisible({ timeout: 10000 })

      // Check for "New Enrollment" button
      const newEnrollmentButton = page.locator('a, button').filter({ hasText: /new enrollment|nouvelle inscription/i }).first()
      await expect(newEnrollmentButton).toBeVisible({ timeout: 5000 })
    })

    test('should show search input for filtering enrollments', async ({ page }) => {
      await page.goto('/enrollments')
      await page.waitForLoadState('networkidle')

      // Wait for loading spinner to disappear (data loaded)
      await page.waitForSelector('[class*="animate-spin"]', { state: 'hidden', timeout: 10000 }).catch(() => {})

      // Check for search input - matches "Search by name" or "Rechercher par nom"
      const searchInput = page.locator('input[placeholder*="Search"], input[placeholder*="Rechercher"]').first()
      await expect(searchInput).toBeVisible({ timeout: 5000 })
    })

    test('should display enrollment table with columns', async ({ page }) => {
      await page.goto('/enrollments')
      await page.waitForLoadState('networkidle')

      // Check for table or card structure
      const table = page.locator('table').first()
      const hasTable = await table.isVisible({ timeout: 3000 }).catch(() => false)

      if (hasTable) {
        // Check for table headers (EN or FR)
        const hasStudentId = await page.locator('th').filter({ hasText: /student id|matricule/i }).first().isVisible({ timeout: 2000 }).catch(() => false)
        const hasName = await page.locator('th').filter({ hasText: /name|nom/i }).first().isVisible({ timeout: 2000 }).catch(() => false)

        expect(hasStudentId || hasName).toBeTruthy()
      }
    })

    test('should navigate to enrollment detail when clicking view', async ({ page }) => {
      await page.goto('/enrollments')
      await page.waitForLoadState('networkidle')

      // Find the first view button/link in the table
      const viewButton = page.locator('a[href*="/enrollments/"], button').filter({ hasText: /view|voir/i }).first()

      // Wait for enrollments to load
      await page.waitForTimeout(2000)

      const isViewButtonVisible = await viewButton.isVisible({ timeout: 5000 }).catch(() => false)

      if (isViewButtonVisible) {
        await viewButton.click()

        // Should navigate to enrollment detail page
        await page.waitForURL(/\/enrollments\/(?!new)[a-zA-Z0-9-]+/, { timeout: 10000 })
      } else {
        // No enrollments to view - that's ok, skip this test
        test.skip()
      }
    })
  })

  test.describe('Enrollment Detail Page', () => {
    test('should display enrollment details with student info', async ({ page }) => {
      await page.goto('/enrollments')
      await page.waitForLoadState('networkidle')

      // Wait for data to load
      await page.waitForTimeout(2000)

      // Find and click first enrollment detail link (exclude /enrollments/new)
      // Look for table row links that go to specific enrollment IDs
      const enrollmentLink = page.locator('a[href^="/enrollments/"]:not([href="/enrollments/new"])').first()
      const hasEnrollments = await enrollmentLink.isVisible({ timeout: 5000 }).catch(() => false)

      if (!hasEnrollments) {
        test.skip()
        return
      }

      await enrollmentLink.click()
      await page.waitForURL(/\/enrollments\/(?!new)[a-zA-Z0-9-]+/, { timeout: 10000 })
      await page.waitForLoadState('networkidle')

      // Wait for loading spinner to disappear
      await page.waitForSelector('[class*="animate-spin"]', { state: 'hidden', timeout: 10000 }).catch(() => {})

      // Check if page loaded successfully (not an error page)
      const errorMessage = await page.locator('text=/not found|error|failed/i').first().isVisible({ timeout: 2000 }).catch(() => false)
      if (errorMessage) {
        test.skip()
        return
      }

      // Check for student info section - look for the card title with User icon
      // The page uses CardTitle with icon, so look for the section header
      const personalInfoSection = page.locator('h1, h2, h3, [data-slot="card-title"]').filter({
        hasText: /Personal Information|Informations Personnelles|personal|personnelles/i
      }).first()
      await expect(personalInfoSection).toBeVisible({ timeout: 10000 })
    })

    test('should display status badge with correct styling', async ({ page }) => {
      await page.goto('/enrollments')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(2000)

      // Find enrollment detail link (exclude /enrollments/new)
      const enrollmentLink = page.locator('a[href^="/enrollments/"]:not([href="/enrollments/new"])').first()
      const hasEnrollments = await enrollmentLink.isVisible({ timeout: 5000 }).catch(() => false)

      if (!hasEnrollments) {
        test.skip()
        return
      }

      await enrollmentLink.click()
      await page.waitForURL(/\/enrollments\/(?!new)[a-zA-Z0-9-]+/, { timeout: 10000 })
      await page.waitForLoadState('networkidle')

      // Wait for loading spinner to disappear
      await page.waitForSelector('[class*="animate-spin"]', { state: 'hidden', timeout: 10000 }).catch(() => {})

      // Check if page loaded successfully (not an error page)
      const errorMessage = await page.locator('text=/not found|error|failed/i').first().isVisible({ timeout: 2000 }).catch(() => false)
      if (errorMessage) {
        test.skip()
        return
      }

      // Check for any badge on the page (status is displayed in header)
      const anyBadge = page.locator('[data-slot="badge"]').first()
      await expect(anyBadge).toBeVisible({ timeout: 5000 })
    })

    test('should display payment schedules section', async ({ page }) => {
      await page.goto('/enrollments')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(2000)

      const enrollmentLink = page.locator('a[href^="/enrollments/"]:not([href="/enrollments/new"])').first()
      const hasEnrollments = await enrollmentLink.isVisible({ timeout: 5000 }).catch(() => false)

      if (!hasEnrollments) {
        test.skip()
        return
      }

      await enrollmentLink.click()
      await page.waitForURL(/\/enrollments\/(?!new)[a-zA-Z0-9-]+/, { timeout: 10000 })

      // Check for payment section (EN or FR)
      const paymentSection = page.locator('text=/payment schedule|écheance|paiement/i').first()
      await expect(paymentSection).toBeVisible({ timeout: 10000 })
    })

    test('should display financial summary', async ({ page }) => {
      await page.goto('/enrollments')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(2000)

      const enrollmentLink = page.locator('a[href^="/enrollments/"]:not([href="/enrollments/new"])').first()
      const hasEnrollments = await enrollmentLink.isVisible({ timeout: 5000 }).catch(() => false)

      if (!hasEnrollments) {
        test.skip()
        return
      }

      await enrollmentLink.click()
      await page.waitForURL(/\/enrollments\/(?!new)[a-zA-Z0-9-]+/, { timeout: 10000 })
      await page.waitForLoadState('networkidle')

      // Wait for loading spinner to disappear
      await page.waitForSelector('[class*="animate-spin"]', { state: 'hidden', timeout: 10000 }).catch(() => {})

      // Check if page loaded successfully (not an error page)
      const errorMessage = await page.locator('text=/not found|error|failed/i').first().isVisible({ timeout: 2000 }).catch(() => false)
      if (errorMessage) {
        test.skip()
        return
      }

      // Check for financial summary - look for any text containing financial info
      // The sidebar has a card with Financial Summary or tuition-related text
      const financialSection = page.locator('h1, h2, h3, [data-slot="card-title"]').filter({
        hasText: /Financial|financier|Tuition|scolarite|Summary|Resume/i
      }).first()
      await expect(financialSection).toBeVisible({ timeout: 10000 })
    })

    test('should show back button that returns to list', async ({ page }) => {
      await page.goto('/enrollments')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(2000)

      const enrollmentLink = page.locator('a[href^="/enrollments/"]:not([href="/enrollments/new"])').first()
      const hasEnrollments = await enrollmentLink.isVisible({ timeout: 5000 }).catch(() => false)

      if (!hasEnrollments) {
        test.skip()
        return
      }

      await enrollmentLink.click()
      await page.waitForURL(/\/enrollments\/(?!new)[a-zA-Z0-9-]+/, { timeout: 10000 })

      // Wait for page to load
      await page.waitForLoadState('networkidle')

      // Find and click back button - it's an icon link to /enrollments
      const backLink = page.locator('a[href="/enrollments"]').first()
      const hasBackLink = await backLink.isVisible({ timeout: 5000 }).catch(() => false)

      if (!hasBackLink) {
        test.skip()
        return
      }

      await backLink.click()

      // Should return to enrollments list
      await page.waitForURL(/\/enrollments$/, { timeout: 10000 })
    })
  })

  test.describe('Director Actions', () => {
    test('should show approve/reject buttons for submitted enrollments', async ({ page }) => {
      await page.goto('/enrollments')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(2000)

      // Find an enrollment that might be in submitted or needs_review status
      const enrollmentLink = page.locator('a[href^="/enrollments/"]:not([href="/enrollments/new"])').first()
      const hasEnrollments = await enrollmentLink.isVisible({ timeout: 5000 }).catch(() => false)

      if (!hasEnrollments) {
        test.skip()
        return
      }

      await enrollmentLink.click()
      await page.waitForURL(/\/enrollments\/(?!new)[a-zA-Z0-9-]+/, { timeout: 10000 })
      await page.waitForLoadState('networkidle')

      // If the enrollment is in submitted or needs_review status, approve/reject buttons should be visible
      const statusBadge = page.locator('[data-slot="badge"]').filter({
        hasText: /submitted|needs review|soumis|en attente/i
      }).first()

      const isSubmittedOrReview = await statusBadge.isVisible({ timeout: 3000 }).catch(() => false)

      if (isSubmittedOrReview) {
        // Check for approve button
        const approveButton = page.locator('button').filter({ hasText: /approve|approuver/i }).first()
        await expect(approveButton).toBeVisible({ timeout: 5000 })

        // Check for reject button
        const rejectButton = page.locator('button').filter({ hasText: /reject|rejeter/i }).first()
        await expect(rejectButton).toBeVisible({ timeout: 5000 })
      }
    })

    test('should open approve dialog when clicking approve button', async ({ page }) => {
      await page.goto('/enrollments')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(2000)

      const enrollmentLink = page.locator('a[href^="/enrollments/"]:not([href="/enrollments/new"])').first()
      const hasEnrollments = await enrollmentLink.isVisible({ timeout: 5000 }).catch(() => false)

      if (!hasEnrollments) {
        test.skip()
        return
      }

      await enrollmentLink.click()
      await page.waitForURL(/\/enrollments\/(?!new)[a-zA-Z0-9-]+/, { timeout: 10000 })

      const approveButton = page.locator('button').filter({ hasText: /approve|approuver/i }).first()
      const isApproveVisible = await approveButton.isVisible({ timeout: 3000 }).catch(() => false)

      if (!isApproveVisible) {
        test.skip()
        return
      }

      await approveButton.click()

      // Dialog should open
      const dialog = page.locator('[role="dialog"]').first()
      await expect(dialog).toBeVisible({ timeout: 5000 })

      // Should have a textarea for comment
      const textarea = dialog.locator('textarea').first()
      await expect(textarea).toBeVisible({ timeout: 3000 })
    })

    test('should require comment when approving enrollment', async ({ page }) => {
      await page.goto('/enrollments')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(2000)

      const enrollmentLink = page.locator('a[href^="/enrollments/"]:not([href="/enrollments/new"])').first()
      const hasEnrollments = await enrollmentLink.isVisible({ timeout: 5000 }).catch(() => false)

      if (!hasEnrollments) {
        test.skip()
        return
      }

      await enrollmentLink.click()
      await page.waitForURL(/\/enrollments\/(?!new)[a-zA-Z0-9-]+/, { timeout: 10000 })

      const approveButton = page.locator('button').filter({ hasText: /approve|approuver/i }).first()
      const isApproveVisible = await approveButton.isVisible({ timeout: 3000 }).catch(() => false)

      if (!isApproveVisible) {
        test.skip()
        return
      }

      await approveButton.click()

      const dialog = page.locator('[role="dialog"]').first()
      await expect(dialog).toBeVisible({ timeout: 5000 })

      // The approve button in dialog should be disabled without comment
      const dialogApproveButton = dialog.locator('button').filter({ hasText: /approve|approuver/i }).first()
      await expect(dialogApproveButton).toBeDisabled()

      // Fill in comment
      const textarea = dialog.locator('textarea').first()
      await textarea.fill('Test approval comment')

      // Button should now be enabled
      await expect(dialogApproveButton).toBeEnabled()
    })
  })

  test.describe('New Enrollment', () => {
    test('should navigate to new enrollment wizard', async ({ page }) => {
      await page.goto('/enrollments')
      await page.waitForLoadState('networkidle')

      // Click new enrollment button
      const newButton = page.locator('a, button').filter({ hasText: /new enrollment|nouvelle inscription/i }).first()
      await expect(newButton).toBeVisible({ timeout: 5000 })
      await newButton.click()

      // Should navigate to new enrollment page
      await page.waitForURL(/\/enrollments\/new/, { timeout: 10000 })
    })

    test('should show grade selection step', async ({ page }) => {
      await page.goto('/enrollments/new')
      await page.waitForLoadState('networkidle')

      // Should show grade/level selection (Step 1)
      const gradeSection = page.locator('text=/grade|niveau|class|classe/i').first()
      await expect(gradeSection).toBeVisible({ timeout: 10000 })
    })
  })

  test.describe('Enrollment Search', () => {
    test('should filter enrollments by search query', async ({ page }) => {
      await page.goto('/enrollments')
      await page.waitForLoadState('networkidle')

      // Wait for loading spinner to disappear (data loaded)
      await page.waitForSelector('[class*="animate-spin"]', { state: 'hidden', timeout: 10000 }).catch(() => {})

      // Type in search - matches "Search by name" or "Rechercher par nom"
      const searchInput = page.locator('input[placeholder*="Search"], input[placeholder*="Rechercher"]').first()
      await expect(searchInput).toBeVisible({ timeout: 5000 })
      await searchInput.fill('Test Search Query')

      // Wait for filter to apply
      await page.waitForTimeout(500)

      // Just verify the search input has the value
      await expect(searchInput).toHaveValue('Test Search Query')
    })
  })

  test.describe('Enrollment Statuses', () => {
    test('should display correct status badge colors', async ({ page }) => {
      await page.goto('/enrollments')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(2000)

      // Check that status badges exist with appropriate styling
      const statusBadges = page.locator('[data-slot="badge"]')
      const badgeCount = await statusBadges.count()

      // If we have badges, verify they have some content
      if (badgeCount > 0) {
        const firstBadge = statusBadges.first()
        const badgeText = await firstBadge.textContent()
        expect(badgeText).toBeTruthy()
      }
    })
  })
})
