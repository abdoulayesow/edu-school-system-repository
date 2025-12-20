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
            <Languages className="h-4 w-4" />
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
              className={`text-sm transition-colors ${
                locale === loc
                  ? 'font-semibold text-primary-foreground'
                  : 'text-primary-foreground/60 hover:text-primary-foreground'
              }`}
            >
              {loc.toUpperCase()}
            </button>
            {index < locales.length - 1 && (
              <span className="mx-1 text-primary-foreground/40">|</span>
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
