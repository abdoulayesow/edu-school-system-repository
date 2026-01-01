"use client";

import { useI18n } from '@/components/i18n-provider';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Languages } from 'lucide-react';
import type { Locale } from '@/lib/i18n';

interface LanguageSwitcherProps {
  variant?: 'default' | 'compact' | 'nav';
  className?: string;
}

export function LanguageSwitcher({ variant = 'default', className }: LanguageSwitcherProps) {
  const { locale, setLocale, localeNames } = useI18n();

  const locales: Locale[] = ['fr', 'en'];

  if (variant === 'compact') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className={className}>
            <Languages className="h-5 w-5" />
            <span className="sr-only">Switch language</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {locales.map((loc) => (
            <DropdownMenuItem
              key={loc}
              onClick={() => setLocale(loc)}
              className={locale === loc ? 'bg-accent' : ''}
            >
              {localeNames[loc]}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  if (variant === 'nav') {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        {locales.map((loc, index) => (
          <span key={loc} className="flex items-center">
            <button
              onClick={() => setLocale(loc)}
              className={`text-sm transition-colors rounded-lg px-3 py-2 h-9 ${
                locale === loc
                  ? 'font-semibold text-black dark:text-gray-200 bg-gspn-gold-300 hover:bg-gspn-gold-200 dark:bg-gspn-maroon-800 dark:hover:bg-gspn-maroon-700'
                  : 'text-black dark:text-gray-200 hover:bg-gspn-gold-300 dark:hover:bg-gspn-maroon-800'
              }`}
            >
              {loc.toUpperCase()}
            </button>
            {index < locales.length - 1 && (
              <span className="mx-1 text-black dark:text-gray-500">|</span>
            )}
          </span>
        ))}
      </div>
    );
  }

  // Default variant - buttons side by side
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {locales.map((loc) => (
        <Button
          key={loc}
          variant={locale === loc ? 'default' : 'outline'}
          size="sm"
          onClick={() => setLocale(loc)}
          className={locale === loc ? '' : 'bg-transparent'}
        >
          {localeNames[loc]}
        </Button>
      ))}
    </div>
  );
}
