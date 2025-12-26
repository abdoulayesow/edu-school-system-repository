# CI Implementation Guide - Step by Step

## Phase 1: Setup Configuration Files (Week 1)

### Step 1.1: Create ESLint Configuration

Create `.eslintrc.json` in repository root:

```json
{
  "extends": [
    "next/core-web-vitals",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": ["error", {
      "argsIgnorePattern": "^_",
      "varsIgnorePattern": "^_"
    }],
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "import/no-anonymous-default-export": "warn"
  },
  "ignorePatterns": [
    ".next",
    "dist",
    "build",
    "node_modules",
    ".turbo",
    "coverage"
  ],
  "overrides": [
    {
      "files": ["**/*.test.ts", "**/*.test.tsx", "**/*.spec.ts"],
      "rules": {
        "@typescript-eslint/no-explicit-any": "off"
      }
    }
  ]
}
```

**Dependencies to Add:**
```bash
cd app/ui
npm install -D eslint @eslint/js typescript-eslint eslint-config-next eslint-config-prettier
npm install -D eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-import

cd ../..
cd design-ux
npm install -D eslint @eslint/js typescript-eslint eslint-config-next eslint-config-prettier
npm install -D eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-import
```

---

### Step 1.2: Create Prettier Configuration

Create `.prettierrc.json` in repository root:

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf",
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

Create `.prettierignore`:

```
node_modules
.next
dist
build
coverage
.turbo
pnpm-lock.yaml
package-lock.json
*.generated.ts
```

**Dependencies to Add:**
```bash
cd app/ui
npm install -D prettier prettier-plugin-tailwindcss

cd ../..
cd design-ux
npm install -D prettier prettier-plugin-tailwindcss
```

---

### Step 1.3: Create Markdownlint Configuration

Create `.markdownlint.json` in repository root:

```json
{
  "default": true,
  "MD003": { "style": "consistent" },
  "MD004": { "style": "consistent" },
  "MD007": { "indent": 2 },
  "MD013": { "line_length": 120, "code_block_line_length": 120 },
  "MD024": false,
  "MD025": false,
  "MD033": false,
  "no-hard-tabs": false
}
```

---

### Step 1.4: Update package.json Scripts

**For `app/ui/package.json`:**

```json
{
  "scripts": {
    "dev": "next dev --webpack --port 8000",
    "build": "next build --webpack",
    "start": "next start",
    "lint": "eslint . --max-warnings 0",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "typecheck": "tsc --noEmit",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "test:run": "vitest --run",
    "test:ui": "vitest --ui",
    "test:e2e": "playwright test",
    "db:validate": "prisma validate",
    "db:format": "prisma format",
    "db:studio": "prisma studio"
  }
}
```

**For `design-ux/package.json`:**

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint . --max-warnings 0",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "typecheck": "tsc --noEmit",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "test:run": "vitest --run",
    "test:ui": "vitest --ui",
    "test:e2e": "playwright test"
  }
}
```

---

## Phase 2: Create GitHub Actions Workflow (Week 2)

### Step 2.1: Create Workflow Directory

```bash
mkdir -p .github/workflows
```

### Step 2.2: Create Main CI Workflow

Create `.github/workflows/ci.yml` - See [05-github-workflow.yml](05-github-workflow.yml)

### Step 2.3: Test Workflow Locally (Optional)

Install `act` to test GitHub Actions locally:

```bash
# Windows with Scoop
scoop install act

# Or download from https://github.com/nektos/act
```

Test a workflow:

```bash
# Simulate push to main
act push --branch main

# Simulate pull request
act pull_request

# Run specific job
act -j lint
```

---

## Phase 3: Setup Testing Framework (Week 3)

### Step 3.1: Install Vitest

```bash
cd app/ui
npm install -D vitest @vitest/ui @vitest/coverage-v8 happy-dom @testing-library/react @testing-library/jest-dom @vitejs/plugin-react

cd ../..
cd design-ux
npm install -D vitest @vitest/ui @vitest/coverage-v8 happy-dom
```

### Step 3.2: Create Vitest Configuration

**For `app/ui/vitest.config.ts`:**

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'vitest.setup.ts',
        '**/*.test.ts',
        '**/*.test.tsx',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
```

**For `app/ui/vitest.setup.ts`:**

```typescript
import '@testing-library/jest-dom'
import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => {
  cleanup()
})
```

### Step 3.3: Create Sample Test

**Create `app/ui/__tests__/lib/auth.test.ts`:**

```typescript
import { describe, it, expect } from 'vitest'
import { validateEmail } from '@/lib/auth'

describe('Auth Utils', () => {
  describe('validateEmail', () => {
    it('validates correct email format', () => {
      expect(validateEmail('user@example.com')).toBe(true)
      expect(validateEmail('test.user+tag@example.co.uk')).toBe(true)
    })

    it('rejects invalid email formats', () => {
      expect(validateEmail('invalid-email')).toBe(false)
      expect(validateEmail('user@')).toBe(false)
      expect(validateEmail('@example.com')).toBe(false)
      expect(validateEmail('')).toBe(false)
    })
  })
})
```

---

## Phase 4: Setup E2E Testing with Playwright (Week 4)

### Step 4.1: Install Playwright

```bash
# At root level (already installed)
npm install -D @playwright/test
npx playwright install
```

### Step 4.2: Create Playwright Configuration

**For `app/ui/playwright.config.ts`:**

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:8000',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:8000',
    reuseExistingServer: !process.env.CI,
  },
})
```

### Step 4.3: Create Sample E2E Test

**Create `app/ui/e2e/login.spec.ts`:**

```typescript
import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/login')
    await expect(page).toHaveTitle(/Login/)
    await expect(page.locator('text=Sign in')).toBeVisible()
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login')
    
    // Fill credentials form
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'wrong-password')
    
    // Submit form
    await page.click('button[type="submit"]')
    
    // Check for error message
    await expect(page.locator('text=Invalid credentials')).toBeVisible()
  })
})
```

---

## Phase 5: Configure GitHub Secrets (Week 2)

### Step 5.1: Add Repository Secrets

Go to **GitHub Repository Settings → Secrets and variables → Actions**

Add these secrets:

```
SNYK_TOKEN
  Type: Repository secret
  Value: (Get from https://app.snyk.io/account/settings)

VERCEL_TOKEN (Optional - for deployments)
  Type: Repository secret
  Value: (Get from Vercel account)

VERCEL_ORG_ID (Optional)
  Type: Repository secret
  Value: (Your Vercel org ID)

VERCEL_PROJECT_ID (Optional)
  Type: Repository secret
  Value: (Your Vercel project ID)
```

---

## Phase 6: Enable Branch Protection (Week 5)

### Step 6.1: Configure Main Branch Protection

Go to **GitHub Settings → Branches → Branch protection rules → Add rule**

**For `main` branch:**

```
Pattern name: main

☑ Require a pull request before merging
  ☑ Require approvals (1 reviewer)
  ☑ Dismiss stale pull request approvals
  ☑ Require status checks to pass before merging
    ☑ Select status checks:
      ✓ lint
      ✓ typecheck
      ✓ security
      ✓ build
      ✓ database
      ✓ status-check
  ☑ Require branches to be up to date before merging
  ☑ Require conversation resolution before merging
  ☑ Include administrators (enforce restrictions for admins)
```

**For `develop` branch:**

```
Pattern name: develop

☑ Require a pull request before merging
  ☑ Require approvals (optional, team's decision)
  ☑ Require status checks to pass before merging
    ☑ Select status checks:
      ✓ lint
      ✓ typecheck
      ✓ security
      ✓ build
      ✓ database
      ✓ status-check
```

---

## Verification Checklist

### After Configuration

- [ ] All config files created (ESLint, Prettier, Markdownlint)
- [ ] `package.json` scripts updated with linting/testing
- [ ] Workflow file created at `.github/workflows/ci.yml`
- [ ] Vitest configured with sample test passing
- [ ] Playwright configured with sample E2E test passing
- [ ] Snyk account created and SNYK_TOKEN added to secrets
- [ ] All required environment variables in `.env.example`
- [ ] Branch protection rules enabled on main and develop

### Before First PR

Run locally to verify everything passes:

```bash
# Install dependencies
npm install

# Lint
npm run lint

# Format check
npm run format:check

# Type check
npm run typecheck

# Build
npm run build

# Run tests
npm run test:run

# Database validate
npm run db:validate
```

All commands should succeed before pushing.

---

## Troubleshooting

### Common Issues

**Issue:** "Module not found" errors after config changes
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Issue:** Prettier and ESLint conflicts
```bash
# Ensure prettier-config is last in extends
# .eslintrc.json should have: "prettier" as LAST item in extends
```

**Issue:** Build fails with "out of memory"
```bash
# Increase Node heap size
NODE_OPTIONS=--max-old-space-size=4096 npm run build
```

**Issue:** Tests timeout
```bash
# Increase timeout in vitest.config.ts
test: {
  testTimeout: 30000, // 30 seconds
}
```

---

## Success Criteria

The CI pipeline is successfully implemented when:

1. ✅ All config files pass syntax validation
2. ✅ `npm run lint` passes with zero warnings
3. ✅ `npm run typecheck` shows zero errors
4. ✅ `npm run build` completes successfully for both workspaces
5. ✅ At least 5 passing unit tests
6. ✅ At least 2 passing E2E tests
7. ✅ `npm audit` shows no high/critical vulnerabilities
8. ✅ GitHub Actions workflow runs successfully on PR
9. ✅ Branch protection rules block merge if checks fail
10. ✅ Team members follow CI feedback and fix failures

---

**Document Version:** 1.0  
**Created:** 2025-12-22  
**Last Updated:** 2025-12-22  
**Estimated Completion:** 4-5 weeks
