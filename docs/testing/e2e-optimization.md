# E2E Test Optimization Guide

## Overview

This document describes the optimizations made to reduce E2E test runtime from **30+ minutes** to **under 5 minutes**.

## Key Optimizations

### 1. Single Browser (Chromium Only)

**Before:** Tests ran on 5 browsers (Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari)
**After:** Tests run on Chromium only for CI, with authenticated and unauthenticated projects

**Impact:** ~5x reduction in test count

### 2. Increased Parallelism

**Before:** 1 worker on CI
**After:** 4 workers on CI

**Impact:** ~4x speedup through parallel execution

### 3. Auth Storage State (Global Setup)

**Before:** Each test that needed authentication would log in via the UI (~40+ login flows)
**After:** Single login in `global-setup.ts` saves session to `playwright/.auth/director.json`, reused by all authenticated tests

**Impact:** Eliminates ~40 login flows, saves ~20+ seconds per test

### 4. Removed `waitForTimeout` Calls

**Before:** Tests used arbitrary `waitForTimeout(500)` calls (~15 instances)
**After:** Replaced with proper assertions like `expect(locator).toBeVisible()`

**Impact:** Eliminates unnecessary delays, tests fail faster on real issues

## Test Projects

The `playwright.config.ts` defines two projects:

1. **`auth`**: Tests that need a clean session (no prior auth)
   - Storage state: `undefined` (fresh context)
   - Used for: login tests, logout tests, unauthenticated access tests

2. **`authenticated`**: Tests that require an authenticated user
   - Storage state: `playwright/.auth/director.json`
   - Used for: navigation tests, profile tests, feature tests

## Setting Up Test User

Before running tests, ensure the test user exists in the database:

```bash
# Option 1: Use the seed script
npm run test:e2e:setup

# Option 2: Set custom test user via environment variables
E2E_TEST_EMAIL=your-email@example.com
E2E_TEST_PASSWORD=your-password
```

The seed script creates/updates the test user with:
- Email: `abdoulaye.sow.1989@gmail.com` (configurable via `E2E_TEST_EMAIL`)
- Password: `TestPassword123` (configurable via `E2E_TEST_PASSWORD`)
- Role: `director`
- Status: `active`

## Running Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI mode
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# View last report
npm run test:e2e:report
```

## File Structure

```
tests/
├── e2e/
│   ├── global-setup.ts      # Creates auth storage state
│   ├── auth.spec.ts         # Authentication flow tests
│   ├── navigation.spec.ts   # Navigation and menu tests
│   ├── profile.spec.ts      # Profile page tests
│   └── offline-sync.spec.ts # Offline/IndexedDB tests
├── helpers/
│   ├── test-utils.ts        # Shared test utilities
│   ├── offline-utils.ts     # Offline testing utilities
│   └── seed-test-user.ts    # Test user seeding script
playwright/
└── .auth/
    └── director.json        # Saved auth state (gitignored)
```

## Troubleshooting

### "E2E LOGIN FAILED" Error

This means the test user couldn't authenticate. Check:

1. Database connection (`DATABASE_URL` in `app/ui/.env`)
2. User exists in database with correct `passwordHash`
3. User status is `active`

Run `npm run test:e2e:setup` to create/update the test user.

### Tests Timing Out

If tests timeout waiting for elements:

1. Ensure the dev server is running: `npm --prefix app/ui run dev`
2. Check the server is on port 8000
3. Look at screenshot in `test-results/` folder

### Strict Mode Violations

If you see "strict mode violation: locator resolved to N elements":

- Use `.first()` or more specific selectors
- Check if the element appears in multiple places (e.g., mobile and desktop)

## CI Configuration

For GitHub Actions, ensure:

1. Database is seeded with test user before tests
2. Dev server is started before tests
3. `playwright/.auth/` directory exists

Example workflow step:
```yaml
- name: Setup test user
  run: npm run test:e2e:setup

- name: Run E2E tests
  run: npm run test:e2e
```
