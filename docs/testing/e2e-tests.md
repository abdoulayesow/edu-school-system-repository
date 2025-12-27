# E2E Testing with Playwright

This guide covers end-to-end testing for the GSPN School Management System.

## Overview

We use [Playwright](https://playwright.dev/) for E2E testing, which provides:

- Cross-browser testing (Chromium, Firefox, WebKit)
- Auto-wait for elements
- Network interception
- Visual regression testing
- Parallel test execution

## Quick Start

### Prerequisites

1. **Database running** with test data
2. **Application running** on `localhost:8000`
3. **Test user created** in the database

### First-Time Setup

```bash
# 1. Install Playwright browsers
npx playwright install

# 2. Create the test user in your database
npm run test:e2e:setup

# 3. Start the application
cd app/ui && npm run dev

# 4. Run E2E tests
npm run test:e2e
```

## Configuration

### Playwright Config (`playwright.config.ts`)

```typescript
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  workers: 4,

  // Global setup authenticates once
  globalSetup: require.resolve('./tests/e2e/global-setup'),

  use: {
    baseURL: 'http://localhost:8000',
    trace: 'off',
    screenshot: 'only-on-failure',
    video: 'off',
  },

  projects: [
    // Auth tests run without pre-authentication
    {
      name: 'auth',
      testMatch: /auth\.spec\.ts/,
      use: { storageState: undefined },
    },
    // All other tests use saved session
    {
      name: 'authenticated',
      testIgnore: /auth\.spec\.ts/,
      use: { storageState: authFile },
    },
  ],

  webServer: {
    command: 'cd app/ui && npm run dev',
    url: 'http://localhost:8000',
    reuseExistingServer: true,
  },
});
```

## Test User Setup

### Creating the Test User

The E2E tests require a user in the database with credentials:

| Field | Value |
|-------|-------|
| Email | `abdoulaye.sow.1989@gmail.com` (or `E2E_TEST_EMAIL` env var) |
| Password | `TestPassword123` (or `E2E_TEST_PASSWORD` env var) |
| Role | `director` |
| Status | `active` |

Run the seed script:

```bash
npm run test:e2e:setup
```

Or manually with custom credentials:

```bash
E2E_TEST_EMAIL=myemail@test.com E2E_TEST_PASSWORD=MyPassword123 npm run test:e2e:setup
```

### Authentication Flow

1. **Global Setup** (`tests/e2e/global-setup.ts`):
   - Logs in once before all tests
   - Saves session to `playwright/.auth/director.json`
   - Session is reused for 1 hour

2. **Authenticated Tests**:
   - Load saved session automatically
   - Skip login process
   - Start directly on protected pages

3. **Auth Tests** (`auth.spec.ts`):
   - Run without saved session
   - Test login/logout flows explicitly

## Running Tests

### Commands

```bash
# Run all E2E tests
npm run test:e2e

# Run with Playwright Test UI (recommended for debugging)
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# Run specific test file
npx playwright test tests/e2e/enrollment.spec.ts

# Run tests matching name
npx playwright test -g "should display enrollment list"

# View HTML report
npm run test:e2e:report
```

### Debugging

```bash
# Debug mode with inspector
npx playwright test --debug

# Debug specific test
npx playwright test tests/e2e/auth.spec.ts --debug

# Generate trace for failed tests
npx playwright test --trace on
```

## Writing Tests

### File Structure

```
tests/
├── e2e/
│   ├── global-setup.ts     # Authentication setup
│   ├── auth.spec.ts        # Login/logout tests
│   ├── enrollment.spec.ts  # Enrollment feature tests
│   ├── navigation.spec.ts  # Navigation tests
│   └── profile.spec.ts     # Profile tests
└── helpers/
    ├── test-utils.ts       # Helper functions
    ├── seed-test-user.ts   # Test user creation
    └── offline-utils.ts    # Offline testing helpers
```

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';
import { loginAsDirector, clearSession } from '../helpers/test-utils';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await clearSession(page);
    await loginAsDirector(page);
  });

  test('should do something', async ({ page }) => {
    await page.goto('/some-page');
    await page.waitForLoadState('networkidle');

    // Check for element
    await expect(page.locator('h1')).toHaveText('Expected Title');

    // Interact with form
    await page.fill('input[name="email"]', 'test@example.com');
    await page.click('button[type="submit"]');

    // Verify result
    await expect(page.locator('.success-message')).toBeVisible();
  });
});
```

### Using Helper Functions

```typescript
import { test, expect } from '@playwright/test';
import {
  loginAsDirector,
  clearSession,
  waitForToast,
  switchToFrench,
  generateTestEmail,
} from '../helpers/test-utils';

test('should create user and show toast', async ({ page }) => {
  await clearSession(page);
  await loginAsDirector(page);

  await page.goto('/admin/users');

  // Fill form
  await page.fill('input[name="email"]', generateTestEmail());
  await page.click('button:has-text("Create User")');

  // Wait for success toast
  await waitForToast(page, 'User created successfully');
});

test('should work in French', async ({ page }) => {
  await clearSession(page);
  await loginAsDirector(page);
  await switchToFrench(page);

  await page.goto('/enrollments');

  // Check for French text
  await expect(page.locator('h1')).toHaveText(/inscription/i);
});
```

### Available Helper Functions

| Function | Description |
|----------|-------------|
| `loginAsDirector(page)` | Login with director credentials |
| `login(page, email, password)` | Login with custom credentials |
| `logout(page)` | Logout current user |
| `clearSession(page)` | Clear cookies and storage |
| `isAuthenticated(page)` | Check if user is logged in |
| `waitForToast(page, text)` | Wait for toast notification |
| `switchToFrench(page)` | Switch UI to French |
| `switchToEnglish(page)` | Switch UI to English |
| `generateTestEmail()` | Generate random test email |
| `generateStrongPassword()` | Generate random password |

## Test Patterns

### Testing Navigation

```typescript
test('should navigate to enrollment detail', async ({ page }) => {
  await page.goto('/enrollments');
  await page.waitForLoadState('networkidle');

  // Click first row's view button
  const viewButton = page.locator('a[href*="/enrollments/"]').first();
  await viewButton.click();

  // Verify URL changed
  await page.waitForURL(/\/enrollments\/[a-zA-Z0-9]+/);

  // Verify page content
  await expect(page.locator('h1')).toContainText(/detail|détail/i);
});
```

### Testing Forms

```typescript
test('should submit enrollment form', async ({ page }) => {
  await page.goto('/enrollments/new');

  // Fill form fields
  await page.fill('input[name="firstName"]', 'John');
  await page.fill('input[name="lastName"]', 'Doe');
  await page.selectOption('select[name="grade"]', 'grade-7');

  // Submit
  await page.click('button:has-text("Submit")');

  // Verify redirect or success message
  await expect(page).toHaveURL(/\/enrollments$/);
});
```

### Testing Bilingual Support

```typescript
test('should display in both languages', async ({ page }) => {
  await page.goto('/enrollments');

  // English
  await expect(page.locator('h1')).toHaveText(/enrollment/i);

  // Switch to French
  await page.click('button:has-text("EN")');
  await page.waitForTimeout(500);

  // French
  await expect(page.locator('h1')).toHaveText(/inscription/i);
});
```

### Testing Error States

```typescript
test('should show validation errors', async ({ page }) => {
  await page.goto('/enrollments/new');

  // Submit without filling required fields
  await page.click('button:has-text("Submit")');

  // Check for error messages
  await expect(page.locator('.error-message')).toBeVisible();
  await expect(page.locator('text=First name is required')).toBeVisible();
});
```

## Best Practices

### 1. Use Resilient Selectors

```typescript
// Good: Semantic selectors
page.getByRole('button', { name: /submit/i });
page.getByLabel('Email');
page.locator('[data-testid="submit-btn"]');

// Avoid: Fragile selectors
page.locator('.btn-primary-large-submit');
page.locator('div > div > button:nth-child(2)');
```

### 2. Wait for Network Idle

```typescript
await page.goto('/dashboard');
await page.waitForLoadState('networkidle');
// Now safe to check content
```

### 3. Handle Dynamic Content

```typescript
// Wait for specific element instead of fixed timeout
await expect(page.locator('.data-loaded')).toBeVisible({ timeout: 10000 });

// Instead of:
await page.waitForTimeout(5000); // Avoid fixed timeouts
```

### 4. Support Both Languages

```typescript
// Use regex to match EN or FR text
await expect(
  page.locator('h1').filter({ hasText: /enrollment|inscription/i })
).toBeVisible();
```

### 5. Clean Up After Tests

```typescript
test.afterEach(async ({ page }) => {
  // Clean up test data if needed
  await page.request.delete('/api/test/cleanup');
});
```

## Troubleshooting

### Login Fails in E2E Tests

```
╔══════════════════════════════════════════════════════════════════════╗
║                      E2E LOGIN FAILED                                 ║
╠══════════════════════════════════════════════════════════════════════╣
║ The test user could not log in.                                       ║
╚══════════════════════════════════════════════════════════════════════╝
```

**Fix:**

```bash
# Re-seed the test user
npm run test:e2e:setup

# Or use custom credentials
E2E_TEST_EMAIL=your@email.com E2E_TEST_PASSWORD=YourPass123 npm run test:e2e:setup
```

### Tests Timeout

```typescript
// Increase timeout for slow tests
test('slow operation', async ({ page }) => {
  test.setTimeout(60000); // 60 seconds
  // ...
});
```

### Element Not Found

```typescript
// Add explicit wait
await page.waitForSelector('button[type="submit"]', {
  state: 'visible',
  timeout: 10000,
});
```

### Session Expired

```bash
# Delete cached auth and re-run
rm -rf playwright/.auth/
npm run test:e2e
```

## Reports

### HTML Report

After test run:

```bash
npm run test:e2e:report
```

Opens interactive HTML report with:

- Test results by file
- Screenshots on failure
- Trace viewer
- Execution timeline

### CI Reports

In GitHub Actions, reports are uploaded as artifacts:

- `playwright-report/` - HTML report
- Available for 5 days

## Related Documentation

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Unit Tests](./unit-tests.md)
- [CI Pipeline](./ci-pipeline.md)
