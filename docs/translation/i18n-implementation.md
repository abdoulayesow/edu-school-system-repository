# Internationalization (i18n) Implementation

## Overview

This document describes the internationalization setup for the School Management System. The application supports **French (default)** and **English** languages, designed specifically for the Groupe Scolaire GSPN N'Diolou school in Guinea.

## Architecture

### File Structure

```
app/ui/
├── lib/
│   └── i18n/
│       ├── index.ts      # Main exports and configuration
│       ├── fr.ts         # French translations (default)
│       └── en.ts         # English translations
├── components/
│   ├── i18n-provider.tsx     # React context provider
│   └── language-switcher.tsx # Language toggle component
```

## Implementation Details

### 1. Translation Files

#### French (`lib/i18n/fr.ts`)
- Default language for the application
- Contains all UI text organized by feature/section
- Exports type definitions for TypeScript support

#### English (`lib/i18n/en.ts`)
- Secondary language option
- Mirrors the French structure exactly

### 2. Translation Categories

The translations are organized into the following sections:

| Category | Description |
|----------|-------------|
| `common` | Shared UI elements (buttons, labels, status) |
| `nav` | Navigation menu items |
| `home` | Homepage content |
| `dashboard` | Director's dashboard |
| `enrollments` | Student enrollment management |
| `activities` | Activity management |
| `accounting` | Financial control center |
| `attendance` | Attendance tracking |
| `reports` | Academic reports |
| `login` | Authentication page |
| `users` | User management |
| `levels` | Grade/class levels |

### 3. I18n Provider (`components/i18n-provider.tsx`)

The provider handles:
- **State Management**: Stores current locale in React state
- **Persistence**: Saves language preference to `localStorage`
- **HTML Lang Attribute**: Updates `<html lang="">` dynamically
- **Hydration Safety**: Prevents SSR/client mismatch

#### Usage

```tsx
import { useI18n } from '@/components/i18n-provider';

function MyComponent() {
  const { t, locale, setLocale } = useI18n();
  
  return (
    <div>
      <h1>{t.dashboard.title}</h1>
      <p>{t.common.loading}</p>
    </div>
  );
}
```

### 4. Language Switcher (`components/language-switcher.tsx`)

Three display variants:
- `default`: Side-by-side buttons
- `compact`: Icon-only dropdown
- `nav`: Inline text links (FR | EN)

```tsx
<LanguageSwitcher variant="nav" />
<LanguageSwitcher variant="compact" />
<LanguageSwitcher variant="default" />
```

### 5. String Interpolation

For dynamic values in translations:

```tsx
import { interpolate } from '@/components/i18n-provider';

// In translation file:
// studentsEnrolled: "{count} étudiants inscrits"

// Usage:
interpolate(t.enrollments.studentsEnrolled, { count: 615 })
// Output: "615 étudiants inscrits"
```

## Configuration

### Default Locale

Set in `lib/i18n/index.ts`:

```typescript
export const defaultLocale: Locale = 'fr';
```

### Adding New Languages

1. Create a new translation file (e.g., `lib/i18n/pt.ts`)
2. Copy the structure from `fr.ts`
3. Translate all strings
4. Add to `lib/i18n/index.ts`:

```typescript
import { pt } from './pt';

export type Locale = 'fr' | 'en' | 'pt';

export const translations: Record<Locale, TranslationKeys> = {
  fr,
  en,
  pt,
};

export const localeNames: Record<Locale, string> = {
  fr: 'Français',
  en: 'English',
  pt: 'Português',
};
```

## Integration Points

### Layout (`app/layout.tsx`)

The `I18nProvider` wraps the entire application:

```tsx
<I18nProvider>
  <Navigation />
  <main>{children}</main>
</I18nProvider>
```

### Navigation (`components/navigation.tsx`)

- Uses translation hook for menu items
- Includes language switcher in header (desktop) and sidebar (mobile)
- Maps navigation link names to translation keys

## Best Practices

1. **Always use translation keys** - Never hardcode user-facing text
2. **Organize by feature** - Group related translations together
3. **Use TypeScript** - Leverage type safety for translation keys
4. **Test both languages** - Verify UI with FR and EN selected
5. **Handle long text** - French text is often longer than English

## UI Changes Summary

### Spacing Improvements

As part of this UX update, excessive padding was reduced across all pages:

| Property | Before | After |
|----------|--------|-------|
| `pt-20` (top padding) | 80px | 16px (`pt-4`) |
| `py-8` (vertical padding) | 32px | 16px (`py-4`) |
| `mb-8` (bottom margin) | 32px | 16px (`mb-4`) |

### Pages Updated

- ✅ Main page (`app/page.tsx`)
- ✅ Dashboard (`app/dashboard/page.tsx`)
- ✅ Enrollments (`app/enrollments/page.tsx`)
- ✅ Activities (`app/activities/page.tsx`)
- ✅ Accounting (`app/accounting/page.tsx`)
- ✅ Attendance (`app/attendance/page.tsx`)
- ✅ Reports (`app/reports/page.tsx`)

## Development Server

The development server is configured to run on port 8000:

```bash
pnpm dev  # Starts on http://localhost:8000
```

---

*Last updated: December 20, 2025*
