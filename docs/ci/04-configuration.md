# Configuration Files Reference

## .eslintrc.json (Root)

Complete ESLint configuration for the monorepo:

```json
{
  "extends": [
    "next/core-web-vitals",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2024,
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    }
  },
  "env": {
    "browser": true,
    "es2024": true,
    "node": true
  },
  "plugins": [
    "react",
    "react-hooks",
    "@typescript-eslint"
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_"
      }
    ],
    "@typescript-eslint/explicit-function-return-types": [
      "warn",
      {
        "allowExpressions": true,
        "allowTypedFunctionExpressions": true,
        "allowHigherOrderFunctions": true
      }
    ],
    "no-console": [
      "warn",
      {
        "allow": ["warn", "error"]
      }
    ],
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    "import/no-anonymous-default-export": "warn",
    "no-var": "error",
    "prefer-const": "error",
    "eqeqeq": [
      "error",
      "always"
    ]
  },
  "ignorePatterns": [
    ".next",
    "dist",
    "build",
    ".turbo",
    "node_modules",
    "coverage",
    "**/*.generated.ts"
  ],
  "overrides": [
    {
      "files": ["**/*.test.ts", "**/*.test.tsx", "**/*.spec.ts", "**/*.spec.tsx"],
      "env": {
        "jest": true
      },
      "rules": {
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-non-null-assertion": "off"
      }
    },
    {
      "files": ["**/*.config.ts", "**/*.config.js"],
      "rules": {
        "@typescript-eslint/no-require-imports": "off"
      }
    }
  ]
}
```

---

## .prettierrc.json (Root)

Prettier formatting configuration:

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
  "bracketSpacing": true,
  "jsxBracketSameLine": false,
  "jsxSingleQuote": false,
  "proseWrap": "preserve",
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

---

## .prettierignore (Root)

Files to exclude from Prettier formatting:

```
node_modules
.next
dist
build
coverage
.turbo
.git
.gitignore
.eslintignore
pnpm-lock.yaml
package-lock.json
*.generated.ts
*.min.js
*.min.css
.env
.env.local
.env.*.local
vitest.config.ts
playwright.config.ts
next.config.mjs
```

---

## .markdownlint.json (Root)

Markdown linting rules:

```json
{
  "default": true,
  "MD003": {
    "style": "consistent"
  },
  "MD004": {
    "style": "consistent"
  },
  "MD007": {
    "indent": 2,
    "start_indented": false
  },
  "MD013": {
    "line_length": 120,
    "code_block_line_length": 120,
    "code_blocks": true,
    "headers": true,
    "headers_length": 120,
    "tables": true
  },
  "MD024": false,
  "MD025": false,
  "MD033": false,
  "MD035": false,
  "no-hard-tabs": false
}
```

---

## tsconfig.json (app/ui)

TypeScript configuration for main UI workspace:

```json
{
  "compilerOptions": {
    "target": "ES2024",
    "lib": ["ES2024", "DOM", "DOM.Iterable"],
    "jsx": "preserve",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules", ".next"]
}
```

---

## vitest.config.ts (app/ui)

Vitest unit testing configuration:

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
      reporter: ['text', 'json', 'html', 'lcov'],
      reportOnFailure: true,
      lines: 70,
      functions: 70,
      branches: 65,
      statements: 70,
      exclude: [
        'node_modules/',
        '.next/',
        'vitest.setup.ts',
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.spec.ts',
        '**/*.spec.tsx',
      ],
    },
    testTimeout: 10000,
    hookTimeout: 10000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
```

---

## vitest.setup.ts (app/ui)

Vitest setup and global configuration:

```typescript
import { expect, afterEach, vi } from 'vitest'
import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: vi.fn(),
      replace: vi.fn(),
      back: vi.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return ''
  },
}))

// Mock next/image
vi.mock('next/image', () => ({
  default: (props: any) => {
    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...props} />
  },
}))

// Suppress console errors in tests (optional)
const originalError = console.error
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render')
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})
```

---

## playwright.config.ts (app/ui)

Playwright E2E testing configuration:

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['github'],
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:8000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
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
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:8000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },

  timeout: 30000,
  expect: {
    timeout: 5000,
  },
})
```

---

## .env.example (Repository Root)

Example environment variables template:

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/database"

# Authentication
NEXTAUTH_URL="http://localhost:8000"
NEXTAUTH_SECRET="your-secret-key-here-min-32-chars"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Admin emails (comma-separated)
ADMIN_EMAILS="admin@example.com,director@example.com"

# Feature flags
NEXT_PUBLIC_ENVIRONMENT="development"
NEXT_PUBLIC_API_URL="http://localhost:8000/api"
```

---

## .github/dependabot.yml (Optional)

Auto-update dependencies:

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 5
    pull-request-branch-name:
      separator: "/"
    allow:
      - dependency-type: "all"
    ignore:
      - dependency-name: "next"
        # Update Next.js manually
  - package-ecosystem: "npm"
    directory: "/app/ui"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 3
  - package-ecosystem: "npm"
    directory: "/design-ux"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 3
```

---

## GitHub Settings for CI

### Repository Secrets (.github/settings)

```yaml
# GitHub Secrets (navigate to Settings > Secrets and variables > Actions)

SNYK_TOKEN:
  Description: "Snyk security token"
  Type: "Repository secret"
  Source: https://app.snyk.io/account/settings

VERCEL_TOKEN: (Optional)
  Description: "Vercel deployment token"
  Type: "Repository secret"
  Source: https://vercel.com/account/tokens

VERCEL_ORG_ID: (Optional)
  Description: "Vercel organization ID"
  Type: "Repository secret"

VERCEL_PROJECT_ID: (Optional)
  Description: "Vercel project ID"
  Type: "Repository secret"
```

### Branch Protection Rules

**For `main` branch:**
- Require pull request reviews
- Require status checks: lint, typecheck, build, database
- Require branches up to date
- Require conversation resolution
- Include administrators

**For `develop` branch:**
- Require pull request (optional reviews)
- Require status checks: lint, typecheck, build, database
- Require branches up to date

---

**Document Version:** 1.0  
**Created:** 2025-12-22  
**Last Updated:** 2025-12-22
