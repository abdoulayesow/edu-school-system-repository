# CI/CD Pipeline

This guide covers the GitHub Actions CI pipeline configuration and requirements.

## Overview

The CI pipeline runs automatically on:

- **Push** to `main` or `develop` branches
- **Pull requests** targeting `main` or `develop`

## Pipeline Jobs

| Job | Description | Timeout | Critical |
|-----|-------------|---------|----------|
| **lint** | ESLint + Prettier + Prisma format | 10 min | Yes |
| **typecheck** | TypeScript compilation | 10 min | Yes |
| **security** | npm audit + Snyk scan | 15 min | Yes |
| **build** | Next.js production builds | 20 min | Yes |
| **test** | Vitest unit tests + coverage | 20 min | No |
| **database** | Prisma schema validation | 10 min | Yes |
| **documentation** | Markdown lint + link check | 10 min | No |
| **e2e** | Playwright E2E tests | 30 min | No |
| **status-check** | Final gate combining results | 5 min | Gate |

## Job Dependency Graph

```
lint ─────┐
typecheck ─┼──> status-check
security ──┤
build ─────┤
database ──┘

test ─────────> (standalone)
documentation ─> (standalone)
e2e ──────────> (standalone)
```

## GitHub Configuration Required

### 1. Repository Secrets

Navigate to: **Settings** > **Secrets and variables** > **Actions**

| Secret | Required | Description |
|--------|----------|-------------|
| `SNYK_TOKEN` | Optional | Snyk API token for security scanning |

**To get a Snyk token:**

1. Sign up at [snyk.io](https://snyk.io)
2. Go to Account Settings > API Token
3. Copy the token
4. Add as repository secret `SNYK_TOKEN`

> **Note:** If `SNYK_TOKEN` is not set, the Snyk scan step is skipped automatically.

### 2. Repository Variables

Navigate to: **Settings** > **Secrets and variables** > **Actions** > **Variables**

| Variable | Default | Description |
|----------|---------|-------------|
| None required | - | All defaults are in workflow file |

### 3. Branch Protection Rules

Navigate to: **Settings** > **Branches** > **Add rule**

**Recommended settings for `main` branch:**

```yaml
Branch name pattern: main

Protect matching branches:
  ✅ Require a pull request before merging
     ✅ Require approvals: 1
     ✅ Dismiss stale pull request approvals when new commits are pushed

  ✅ Require status checks to pass before merging
     ✅ Require branches to be up to date before merging
     Status checks that are required:
       - lint
       - typecheck
       - build
       - database
       - status-check

  ✅ Require conversation resolution before merging

  ❌ Do not allow bypassing the above settings
```

### 4. Actions Permissions

Navigate to: **Settings** > **Actions** > **General**

```yaml
Actions permissions:
  ✅ Allow all actions and reusable workflows

Workflow permissions:
  ✅ Read and write permissions
  ✅ Allow GitHub Actions to create and approve pull requests
```

### 5. Environment Variables (Optional)

For E2E tests in CI, you may need:

Navigate to: **Settings** > **Secrets and variables** > **Actions**

| Secret | Description |
|--------|-------------|
| `E2E_TEST_EMAIL` | Test user email (optional) |
| `E2E_TEST_PASSWORD` | Test user password (optional) |
| `DATABASE_URL` | Database connection string (if running real DB tests) |

## Workflow File

Located at: `.github/workflows/ci.yml`

### Key Configuration Points

```yaml
name: CI Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

env:
  NODE_VERSION: '20'
```

### Build Job Environment Variables

```yaml
build:
  env:
    NEXTAUTH_SECRET: test-secret-key-for-ci-only
    NEXTAUTH_URL: http://localhost:3000
    NEXT_PUBLIC_ENVIRONMENT: ci
```

### E2E Job Environment Variables

```yaml
e2e:
  env:
    NEXTAUTH_SECRET: test-secret-key-for-ci-only
    NEXTAUTH_URL: http://localhost:8000
```

## Enabling the Workflow

### Step-by-Step Setup

1. **Push the workflow file**

   The workflow is already at `.github/workflows/ci.yml`. Ensure it's committed:

   ```bash
   git add .github/workflows/ci.yml
   git commit -m "Add CI workflow"
   git push origin main
   ```

2. **Verify Actions are enabled**

   Go to **Actions** tab in your repository. If you see "Workflows aren't being run on this repository", click "I understand my workflows, go ahead and enable them".

3. **Add Snyk token (optional)**

   - Go to **Settings** > **Secrets and variables** > **Actions**
   - Click **New repository secret**
   - Name: `SNYK_TOKEN`
   - Value: Your Snyk API token

4. **Configure branch protection**

   - Go to **Settings** > **Branches**
   - Click **Add branch protection rule**
   - Branch name pattern: `main`
   - Enable required status checks (see above)

5. **Test the workflow**

   Create a pull request to trigger the workflow:

   ```bash
   git checkout -b test/ci-workflow
   echo "# Test" >> test.md
   git add test.md
   git commit -m "Test CI workflow"
   git push origin test/ci-workflow
   ```

   Open a PR and watch the Actions tab.

## Monitoring Workflow Runs

### Viewing Results

1. Go to **Actions** tab
2. Click on the workflow run
3. View individual job logs

### Artifacts

The pipeline uploads these artifacts:

| Artifact | Retention | Description |
|----------|-----------|-------------|
| `build-app/ui` | 1 day | Next.js build output |
| `coverage-reports` | 5 days | Unit test coverage |
| `playwright-report` | 5 days | E2E test report |

### Notifications

GitHub sends notifications for:

- Failed workflow runs (if watching repo)
- Required status checks blocking merge

## Customizing the Pipeline

### Adding Required Checks

In branch protection rules, add more jobs to required status checks:

```
Required status checks:
  - lint
  - typecheck
  - security    # Add this
  - build
  - database
  - test        # Add this
  - status-check
```

### Changing Node Version

Update in workflow file:

```yaml
env:
  NODE_VERSION: '22'  # Change from 20 to 22
```

### Adding New Jobs

```yaml
jobs:
  my-new-job:
    name: My New Job
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npm run my-command
```

### Skipping Jobs Conditionally

```yaml
jobs:
  e2e:
    if: github.event_name == 'pull_request'  # Only on PRs
```

## Troubleshooting

### Workflow Not Running

1. Check Actions are enabled in repo settings
2. Verify branch matches trigger (`main`, `develop`)
3. Check for syntax errors in workflow file

### Build Fails with Missing Env Vars

Ensure all required environment variables are set in the job:

```yaml
env:
  NEXTAUTH_SECRET: test-secret-key-for-ci-only
  NEXTAUTH_URL: http://localhost:3000
```

### Tests Timeout

Increase timeout in workflow:

```yaml
timeout-minutes: 30  # Increase from default
```

### Snyk Scan Skipped

The Snyk scan is skipped if `SNYK_TOKEN` secret is not set. This is by design:

```yaml
if: ${{ secrets.SNYK_TOKEN != '' }}
```

### Status Check Not Found

If required status check shows "Waiting for status to be reported":

1. Ensure job name matches exactly
2. Check workflow syntax
3. Verify job ran at least once

## Cost Considerations

GitHub Actions usage for public repos:

- **Public repos**: Unlimited free minutes
- **Private repos**: 2,000 minutes/month (free tier)

Current pipeline uses approximately:

| Job | Minutes |
|-----|---------|
| lint | 2-3 |
| typecheck | 2-3 |
| security | 3-5 |
| build (×2) | 5-8 each |
| test | 3-5 |
| database | 1-2 |
| documentation | 1-2 |
| e2e | 5-15 |
| status-check | <1 |

**Total per run:** ~25-45 minutes of compute time

## Related Documentation

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Unit Tests](./unit-tests.md)
- [E2E Tests](./e2e-tests.md)
- [CI Documentation](../ci/)
