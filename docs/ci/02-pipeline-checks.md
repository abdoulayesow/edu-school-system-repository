# CI Pipeline Checks - Detailed Reference

## 1. LINT Job

**Purpose:** Enforce code style and quality standards using ESLint and Prettier

**Runs On:** ubuntu-latest

**Key Steps:**
```bash
# 1. Checkout code
# 2. Setup Node 20 + pnpm 9
# 3. Install dependencies
# 4. Run ESLint on app/ui
# 5. Run ESLint on design-ux
# 6. Prettier format check on entire repo
# 7. Prisma format check
```

**Failure Causes:**
- Unused imports or variables
- Missing semicolons or incorrect spacing
- Incorrect indentation
- Unformatted code
- Prisma schema formatting issues

**Fix Command:**
```bash
# Format all files
pnpm exec prettier --write .

# Auto-fix lint issues
cd app/ui && pnpm lint:fix
cd ../.. && cd design-ux && pnpm lint:fix

# Check Prisma formatting
cd ../app/ui && pnpm prisma format
```

**Duration:** ~2 minutes

---

## 2. TYPECHECK Job

**Purpose:** Validate TypeScript compilation without emitting JavaScript

**Runs On:** ubuntu-latest

**Key Steps:**
```bash
# 1. Checkout code
# 2. Setup Node 20 + pnpm 9
# 3. Install dependencies
# 4. TypeScript check on app/ui (tsc --noEmit)
# 5. TypeScript check on design-ux (tsc --noEmit)
```

**Failure Causes:**
- Type mismatches in function arguments
- Missing type annotations on exported functions
- Incorrect generic type parameters
- Accessing undefined properties
- Incompatible return types

**Example Errors:**
```typescript
// ❌ Error: Argument of type 'string' not assignable to parameter of type 'number'
const count: number = "5";

// ❌ Error: Property 'email' does not exist on type 'User'
function getEmail(user: User) {
  return user.emailAddress; // should be 'email'
}

// ✅ Fixed with proper types
const count: number = 5;
function getEmail(user: User): string {
  return user.email;
}
```

**Fix Command:**
```bash
cd app/ui && pnpm typecheck
cd ../../design-ux && pnpm typecheck

# Or fix with VS Code TypeScript extension
# Command: "TypeScript: Fix All" (Ctrl+Shift+P)
```

**Duration:** ~2 minutes

---

## 3. SECURITY Job

**Purpose:** Audit dependencies for known vulnerabilities and security issues

**Runs On:** ubuntu-latest

**Key Steps:**
```bash
# 1. Checkout code
# 2. Setup Node 20 + pnpm 9
# 3. Install dependencies
# 4. pnpm audit (moderate and higher severity)
# 5. Snyk security scan (if SNYK_TOKEN configured)
```

**Failure Causes:**
- High-severity CVEs in direct dependencies
- Moderate-severity CVEs in production dependencies
- Known vulnerabilities in pinned package versions
- Outdated security patches

**Common Vulnerabilities:**
```
Example: next-auth <0.7.5 - Authentication Bypass
  Affected Version: 0.7.2
  Required: >=0.7.5
  Fix: npm update next-auth

Example: axios <1.6.0 - Request Header Injection
  Affected Version: 1.4.0
  Required: >=1.6.0
  Fix: npm update axios
```

**Fix Commands:**
```bash
# View detailed audit report
pnpm audit

# Fix automatically (may update to breaking versions)
pnpm audit --fix

# Update specific package
pnpm update next-auth

# Check without pnpm
cd app/ui && npm audit
```

**Audit Levels:**
- `low` - Informational
- `moderate` - Should address
- `high` - Must address
- `critical` - Block deployment

**Duration:** ~3 minutes

---

## 4. BUILD Job

**Purpose:** Verify both Next.js workspaces compile successfully for production

**Runs On:** ubuntu-latest

**Strategy:** Matrix - runs once for `app/ui` and once for `design-ux`

**Key Steps:**
```bash
# 1. Checkout code
# 2. Setup Node 20 + pnpm 9
# 3. Install dependencies
# 4. Build workspace (next build --webpack)
# 5. Check bundle size metrics
```

**Environment Variables Required:**
```
NEXTAUTH_SECRET=test-secret-key
NEXTAUTH_URL=http://localhost:3000
```

**Failure Causes:**
- Import/require errors
- Build-time TypeScript errors (if tsc runs during build)
- Missing environment variables
- Incompatible Next.js plugins
- Memory exhaustion (very large builds)
- Syntax errors in JSX/TSX files

**Example Build Error:**
```
error - Failed to compile
./app/page.tsx
32:8
32 │ export const metadata = {
   │ ^
Build error occurred

Expected string or number, got "object"
```

**Fix Commands:**
```bash
# Build locally first
cd app/ui && pnpm build

# Check build size
du -sh app/ui/.next/static

# Clean and rebuild
rm -rf app/ui/.next
pnpm install
cd app/ui && pnpm build
```

**Bundle Size Thresholds:**
- Warning: > 500KB
- Critical: > 1MB

**Duration:** ~8 minutes per workspace

---

## 5. TEST Job

**Purpose:** Run unit and integration tests

**Runs On:** ubuntu-latest

**Key Steps:**
```bash
# 1. Checkout code
# 2. Setup Node 20 + pnpm 9
# 3. Install dependencies
# 4. Run Vitest (--run for CI mode, no watch)
# 5. Report coverage (if configured)
```

**Test Frameworks:**
- `vitest` - Unit tests (recommended for performance)
- `@playwright/test` - E2E tests
- `@testing-library/react` - React component tests

**Example Test File:**
```typescript
// app/ui/__tests__/utils/auth.test.ts
import { describe, it, expect } from 'vitest'
import { validateEmail } from '@/lib/auth'

describe('Auth Utils', () => {
  it('validates email format', () => {
    expect(validateEmail('user@example.com')).toBe(true)
    expect(validateEmail('invalid-email')).toBe(false)
  })
})
```

**Failure Causes:**
- Failing test assertions
- Uncaught exceptions in tests
- Timeout (default 10s per test)
- Missing test setup/teardown
- Database connection failures

**Fix Commands:**
```bash
# Run tests locally
pnpm test

# Run specific test file
pnpm test auth.test.ts

# Debug tests
pnpm test --reporter=verbose

# Update snapshots
pnpm test -- -u
```

**Coverage Targets:**
- Statements: 70%
- Branches: 65%
- Lines: 70%
- Functions: 70%

**Duration:** ~10 minutes

---

## 6. DATABASE Job

**Purpose:** Validate Prisma schema and detect migration issues

**Runs On:** ubuntu-latest

**Key Steps:**
```bash
# 1. Checkout code
# 2. Setup Node 20 + pnpm 9
# 3. Install dependencies
# 4. Prisma validate (schema syntax check)
# 5. Prisma format check (formatting validation)
```

**Failure Causes:**
- Invalid Prisma syntax
- Unmatched curly braces
- Invalid field types
- Missing `@id` primary keys
- Circular relation references
- Invalid enum definitions
- Incorrectly formatted schema

**Example Schema Error:**
```prisma
model User {
  id        Int     @id @default(autoincrement())
  email     String  @unique
  role      UserRole // ❌ Error: Invalid field type
  
  // Missing closing brace above
```

**Fix Commands:**
```bash
# Validate schema
cd app/ui && pnpm prisma validate

# Auto-format schema
cd app/ui && pnpm prisma format

# Check pending migrations
cd app/ui && pnpm prisma migrate status

# View schema in Prisma Studio
cd app/ui && pnpm prisma studio
```

**Schema Rules:**
- All models must have `@id` field
- Foreign keys use `@relation`
- Timestamps use `DateTime @default(now())`
- Enums defined at model level
- Proper pluralization in relations

**Duration:** ~1 minute

---

## 7. DOCUMENTATION Job

**Purpose:** Validate markdown files and check for broken links

**Runs On:** ubuntu-latest

**Key Steps:**
```bash
# 1. Checkout code
# 2. Markdown lint (syntax validation)
# 3. Link checker (verify URLs exist)
```

**Markdown Lint Rules:**
- Proper heading hierarchy (h1 → h2 → h3)
- Consistent list formatting
- Code block language specification
- No trailing whitespace
- Consistent emphasis (bold/italic)
- Proper spacing around headings

**Link Check Scope:**
- Internal relative links
- External URLs (HTTP/HTTPS)
- Markdown references
- Excludes localhost URLs

**Example Errors:**
```
docs/architecture.md:10 - MD025 Multiple headings with the same content
docs/auth.md:45 - broken link: [guide](../nonexistent.md)
docs/guide.md:20 - MD033 Inline HTML not allowed
```

**Fix Commands:**
```bash
# Install markdownlint
npm install -g markdownlint-cli

# Check files
markdownlint docs/

# Auto-fix issues
markdownlint --fix docs/

# Check links
npx markdown-link-check docs/**/*.md
```

**Duration:** ~1 minute

---

## 8. STATUS-CHECK Job

**Purpose:** Final gating job that enforces all critical checks passed

**Runs On:** ubuntu-latest

**Key Steps:**
```bash
# 1. Depends on: lint, typecheck, security, build, database
# 2. Evaluates each dependency result
# 3. Fails if ANY critical job failed
# 4. Passes only if ALL jobs passed
```

**Gate Logic:**
```javascript
if (lint === 'success' && 
    typecheck === 'success' && 
    build === 'success' && 
    database === 'success' &&
    security === 'success') {
  return PASS  // Allow merge
} else {
  return FAIL  // Block merge
}
```

**Note:** `test` and `documentation` use `continue-on-error: true`, so they don't block merges but should be reviewed.

**Duration:** ~1 minute

---

## Job Dependencies & Execution Order

```
┌─────────────┐  ┌──────────────┐  ┌─────────────┐  ┌──────────────┐
│   lint      │  │ typecheck    │  │ security    │  │   build      │
│   2 min     │  │   2 min      │  │   3 min     │  │   8 min      │
└──────┬──────┘  └──────┬───────┘  └──────┬──────┘  └──────┬───────┘
       │                │                 │                │
       └────────────────┼─────────────────┼────────────────┘
                        │
       ┌────────────────┼─────────────────┬────────────────┐
       │                │                 │                │
       ▼                ▼                 ▼                ▼
┌─────────────┐  ┌──────────────┐  ┌─────────────┐  ┌──────────────┐
│   test      │  │ database     │  │ documentation
│  10 min     │  │   1 min      │  │   1 min    │
└──────┬──────┘  └──────┬───────┘  └──────┬──────┘
       │                │                 │
       └────────────────┼─────────────────┘
                        │
                        ▼
                ┌──────────────┐
                │ status-check │
                │   1 min      │
                └──────────────┘
```

**Parallel Execution:** All jobs run simultaneously (GitHub provides multiple runners)  
**Total Time:** ~28 minutes wall-clock (due to parallelization)

---

**Document Version:** 1.0  
**Created:** 2025-12-22  
**Last Updated:** 2025-12-22
