# Testing Guide

This guide covers the testing infrastructure for the GSPN School Management System.

## Overview

The project uses a comprehensive testing strategy with three layers:

| Layer | Tool | Location | Purpose |
|-------|------|----------|---------|
| **Unit Tests** | Vitest | `app/ui/**/*.test.ts` | Component and function testing |
| **E2E Tests** | Playwright | `tests/e2e/**/*.spec.ts` | Full user flow testing |
| **CI Pipeline** | GitHub Actions | `.github/workflows/ci.yml` | Automated testing on PR/push |

## Quick Start

```bash
# Run unit tests
npm run test

# Run unit tests once (no watch)
npm run test:run

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui
```

## Documentation

- [Unit Tests (Vitest)](./unit-tests.md) - Component and function testing
- [E2E Tests (Playwright)](./e2e-tests.md) - End-to-end user flow testing
- [CI Pipeline](./ci-pipeline.md) - GitHub Actions configuration

## Test Commands Reference

### Unit Tests

```bash
# Interactive watch mode
npm run test

# Run once and exit
npm run test:run

# Run with coverage
cd app/ui && npm run test -- --coverage
```

### E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run with Playwright UI
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# View last test report
npm run test:e2e:report

# Setup test user before first run
npm run test:e2e:setup
```

## Coverage Requirements

Unit test coverage thresholds (enforced in CI):

| Metric | Threshold |
|--------|-----------|
| Lines | 70% |
| Functions | 70% |
| Branches | 65% |
| Statements | 70% |

## File Structure

```
edu-school-system-repository/
├── app/ui/
│   ├── vitest.config.ts      # Vitest configuration
│   ├── vitest.setup.tsx      # Test setup and mocks
│   └── **/*.test.ts          # Unit test files
├── tests/
│   ├── e2e/
│   │   ├── global-setup.ts   # Auth setup for E2E
│   │   ├── auth.spec.ts      # Auth flow tests
│   │   ├── enrollment.spec.ts # Enrollment tests
│   │   └── ...
│   └── helpers/
│       ├── test-utils.ts     # E2E helper functions
│       └── seed-test-user.ts # Create test user
├── playwright.config.ts      # Playwright configuration
└── .github/workflows/ci.yml  # CI pipeline
```

## Related Documentation

- [CI Pipeline Documentation](../ci/)
- [Enrollment Feature](../enrollment/)
