import { chromium, FullConfig } from '@playwright/test'
import path from 'path'
import fs from 'fs'

/**
 * Test user credentials - can be overridden via environment variables:
 * - E2E_TEST_EMAIL: email of the test user
 * - E2E_TEST_PASSWORD: password of the test user
 * 
 * The test user must exist in the database with:
 * 1. A matching email
 * 2. A passwordHash (bcrypt hashed version of the password)
 * 3. status != 'inactive'
 */
const TEST_USER = {
  email: process.env.E2E_TEST_EMAIL || 'abdoulaye.sow.1989@gmail.com',
  password: process.env.E2E_TEST_PASSWORD || 'TestPassword123',
}

/**
 * Global setup for Playwright tests.
 * Logs in once and saves the session to a storage state file.
 * All authenticated tests reuse this session, eliminating repeated logins.
 */
async function globalSetup(config: FullConfig) {
  const authDir = path.join(process.cwd(), 'playwright', '.auth')
  const authFile = path.join(authDir, 'director.json')

  // Create auth directory if it doesn't exist
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true })
  }

  // Skip if auth file already exists and is fresh (less than 1 hour old)
  if (fs.existsSync(authFile)) {
    const stats = fs.statSync(authFile)
    const ageMs = Date.now() - stats.mtimeMs
    if (ageMs < 60 * 60 * 1000) {
      console.log('✓ Using existing auth state (less than 1 hour old)')
      return
    }
  }

  console.log('Creating fresh auth state...')
  console.log(`  Using test user: ${TEST_USER.email}`)

  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()

  try {
    // Navigate to login
    await page.goto('http://localhost:8000/login')
    
    // Wait for the page to be fully loaded and hydrated
    await page.waitForLoadState('networkidle')

    // Fill credentials
    console.log('  Filling credentials...')
    await page.fill('input[id="email"]', TEST_USER.email)
    await page.fill('input[id="password"]', TEST_USER.password)

    // Click the submit button (type="submit" distinguishes it from Google button)
    const button = page.locator('button[type="submit"]')
    await button.waitFor({ state: 'visible' })
    
    console.log('  Clicking sign in button...')
    await button.click()
    
    // Wait for any of: dashboard URL, session change, or error
    let attempts = 0
    const maxAttempts = 20 // 10 seconds total
    let currentUrl = page.url()
    
    while (attempts < maxAttempts && currentUrl.includes('/login') && !currentUrl.includes('error=')) {
      await page.waitForTimeout(500)
      currentUrl = page.url()
      attempts++
      
      // Check session endpoint
      const sessionResponse = await page.request.get('http://localhost:8000/api/auth/session')
      const session = await sessionResponse.json()
      if (session?.user?.email) {
        console.log(`  Session found: ${session.user.email}`)
        // Navigate to dashboard manually since session exists
        await page.goto('http://localhost:8000/dashboard')
        currentUrl = page.url()
        break
      }
    }
    
    console.log(`  Final URL: ${currentUrl}`)

    // Check if login failed
    if (currentUrl.includes('error=') || currentUrl.includes('/signin') || currentUrl.includes('/login')) {
      console.error('')
      console.error('╔══════════════════════════════════════════════════════════════════════╗')
      console.error('║                      E2E LOGIN FAILED                                 ║')
      console.error('╠══════════════════════════════════════════════════════════════════════╣')
      console.error('║ The test user could not log in. This usually means:                  ║')
      console.error('║                                                                      ║')
      console.error('║ 1. The test user does not exist in the database                      ║')
      console.error('║ 2. The password hash does not match                                  ║')
      console.error('║ 3. The user status is "inactive"                                     ║')
      console.error('║                                                                      ║')
      console.error('║ To fix, ensure the test user exists in your database:                ║')
      console.error('║                                                                      ║')
      console.error(`║   Email: ${TEST_USER.email.padEnd(50)}     ║`)
      console.error('║   Password: <hashed with bcrypt>                                     ║')
      console.error('║   Status: active                                                     ║')
      console.error('║   Role: director (or any valid role)                                 ║')
      console.error('║                                                                      ║')
      console.error('║ Or set environment variables:                                        ║')
      console.error('║   E2E_TEST_EMAIL=your-test-user@example.com                          ║')
      console.error('║   E2E_TEST_PASSWORD=your-password                                    ║')
      console.error('╚══════════════════════════════════════════════════════════════════════╝')
      console.error('')
      throw new Error(`Login failed. Redirected to: ${currentUrl}`)
    }

    // Verify we landed on dashboard
    if (!currentUrl.includes('/dashboard')) {
      throw new Error(`Unexpected redirect after login: ${currentUrl}`)
    }

    // Save storage state
    await context.storageState({ path: authFile })
    console.log('✓ Auth state saved to', authFile)
  } catch (error) {
    console.error('✗ Global setup failed:', error)
    throw error
  } finally {
    await browser.close()
  }
}

export default globalSetup
