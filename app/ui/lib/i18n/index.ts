import { fr, TranslationKeys } from './fr';
import { en } from './en';

export type Locale = 'fr' | 'en';

export const translations: Record<Locale, TranslationKeys> = {
  fr,
  en,
};

export const localeNames: Record<Locale, string> = {
  fr: 'Français',
  en: 'English',
};

export const defaultLocale: Locale = 'fr';

export { fr, en };
export type { TranslationKeys };
