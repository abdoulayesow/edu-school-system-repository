import { defineConfig, devices } from '@playwright/test'
import path from 'path'

const authFile = path.join(__dirname, 'playwright', '.auth', 'director.json')

/**
 * Playwright configuration for GSPN School Management System
 * Optimized for fast local development (<5 min target)
 * 
 * Key optimizations:
 * - Chromium-only (was 5 browsers)
 * - 4 parallel workers (was 1 on CI)
 * - Auth storage state (eliminates repeated logins)
 * - No video/trace overhead
 */
export default defineConfig({
  testDir: './tests/e2e',

  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 4,

  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],

  // Global setup: logs in once and saves session to storageState file
  globalSetup: require.resolve('./tests/e2e/global-setup'),

  use: {
    baseURL: 'http://localhost:8000',
    trace: 'off',
    screenshot: 'only-on-failure',
    video: 'off',
  },

  projects: [
    // Auth tests: run WITHOUT storage state (need to test login flow)
    {
      name: 'auth',
      testMatch: /auth\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        storageState: undefined, // No pre-auth for auth tests
      },
    },
    // Authenticated tests: use saved session
    {
      name: 'authenticated',
      testIgnore: /auth\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        storageState: authFile,
      },
    },
  ],

  webServer: {
    command: 'cd app/ui && npm run dev',
    url: 'http://localhost:8000',
    reuseExistingServer: true,
    timeout: 120 * 1000,
  },
})
