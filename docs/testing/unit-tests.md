# Unit Testing with Vitest

This guide covers unit testing for React components and TypeScript functions.

## Overview

We use [Vitest](https://vitest.dev/) for unit testing, which provides:

- Fast test execution with Vite's transform pipeline
- Jest-compatible API
- Built-in coverage with V8
- Happy-DOM for React component testing

## Configuration

### Vitest Config (`app/ui/vitest.config.ts`)

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./vitest.setup.tsx'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 65,
        statements: 70,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
```

### Test Setup (`app/ui/vitest.setup.tsx`)

The setup file provides:

- **Cleanup**: Automatic DOM cleanup after each test
- **Mocks**: Pre-configured mocks for Next.js APIs

#### Pre-configured Mocks

| Module | Mock Behavior |
|--------|---------------|
| `next/navigation` | `useRouter`, `useSearchParams`, `usePathname`, `useParams` |
| `next/image` | Renders as standard `<img>` element |
| `next-auth/react` | `useSession`, `signIn`, `signOut` |

## Running Tests

### Commands

```bash
# Run in watch mode (development)
cd app/ui && npm run test

# Run once (CI mode)
cd app/ui && npm run test:run

# Run with coverage report
cd app/ui && npm run test -- --coverage

# Run specific test file
cd app/ui && npm run test -- calculations.test.ts

# Run tests matching pattern
cd app/ui && npm run test -- -t "payment"
```

### From Root Directory

```bash
# Run all unit tests
npm run test

# Run once
npm run test:run
```

## Writing Tests

### File Naming Convention

```
component-name.test.tsx    # React component tests
utils.test.ts              # Utility function tests
hook-name.test.ts          # Custom hook tests
```

### Basic Test Structure

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MyComponent } from './my-component';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent title="Hello" />);

    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('should handle click events', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<MyComponent onClick={handleClick} />);
    await user.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalledOnce();
  });
});
```

### Testing Async Functions

```typescript
import { describe, it, expect } from 'vitest';
import { fetchData } from './api';

describe('fetchData', () => {
  it('should return data successfully', async () => {
    const result = await fetchData('test-id');

    expect(result).toEqual({
      id: 'test-id',
      name: 'Test',
    });
  });

  it('should throw on invalid input', async () => {
    await expect(fetchData('')).rejects.toThrow('Invalid ID');
  });
});
```

### Mocking Dependencies

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { calculatePayment } from './calculations';

// Mock external module
vi.mock('@/lib/api', () => ({
  fetchRate: vi.fn(() => Promise.resolve(0.05)),
}));

describe('calculatePayment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should calculate payment with fetched rate', async () => {
    const result = await calculatePayment(1000);
    expect(result).toBe(1050);
  });
});
```

### Testing React Hooks

```typescript
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCounter } from './use-counter';

describe('useCounter', () => {
  it('should increment counter', () => {
    const { result } = renderHook(() => useCounter());

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });
});
```

## Coverage Reports

### Viewing Coverage

After running tests with coverage:

```bash
cd app/ui && npm run test -- --coverage
```

Reports are generated in `app/ui/coverage/`:

- `coverage/index.html` - Interactive HTML report
- `coverage/lcov.info` - LCOV format for CI tools
- Terminal output shows summary

### Coverage Thresholds

Tests will fail if coverage drops below:

| Metric | Minimum |
|--------|---------|
| Lines | 70% |
| Functions | 70% |
| Branches | 65% |
| Statements | 70% |

## Best Practices

### 1. Test Behavior, Not Implementation

```typescript
// Good: Tests user-visible behavior
it('should show error message when form is invalid', async () => {
  render(<LoginForm />);
  await userEvent.click(screen.getByRole('button', { name: /submit/i }));
  expect(screen.getByText(/email is required/i)).toBeInTheDocument();
});

// Avoid: Tests implementation details
it('should call setError with "email is required"', () => {
  // This breaks if implementation changes
});
```

### 2. Use Accessible Queries

```typescript
// Preferred order (most to least accessible):
screen.getByRole('button', { name: /submit/i });  // Best
screen.getByLabelText(/email/i);                   // Good
screen.getByPlaceholderText(/enter email/i);       // OK
screen.getByTestId('submit-button');               // Last resort
```

### 3. Avoid Test Interdependence

```typescript
// Good: Each test is independent
describe('Counter', () => {
  it('should start at 0', () => {
    const { result } = renderHook(() => useCounter());
    expect(result.current.count).toBe(0);
  });

  it('should increment', () => {
    const { result } = renderHook(() => useCounter());
    act(() => result.current.increment());
    expect(result.current.count).toBe(1);
  });
});
```

### 4. Use Data-Driven Tests

```typescript
describe('formatCurrency', () => {
  const testCases = [
    { input: 1000, expected: '1,000 GNF' },
    { input: 0, expected: '0 GNF' },
    { input: 1500000, expected: '1,500,000 GNF' },
  ];

  testCases.forEach(({ input, expected }) => {
    it(`should format ${input} as "${expected}"`, () => {
      expect(formatCurrency(input)).toBe(expected);
    });
  });
});
```

## Troubleshooting

### Common Issues

**Tests hang or timeout**
```bash
# Increase timeout in test
it('slow test', async () => {
  // ...
}, 30000); // 30 second timeout
```

**Module not found errors**
```typescript
// Ensure path alias is correct
import { Something } from '@/lib/something'; // Uses @ alias
```

**Mock not working**
```typescript
// Ensure mock is at top of file, before imports
vi.mock('@/lib/api');

// Then import
import { api } from '@/lib/api';
```

## Related Documentation

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Docs](https://testing-library.com/docs/react-testing-library/intro/)
- [E2E Tests](./e2e-tests.md)
