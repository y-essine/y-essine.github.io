export type Locale = 'fr' | 'en';

export const defaultLocale: Locale = 'fr';
export const locales: Locale[] = ['fr', 'en'];

export const localeNames: Record<Locale, string> = {
  fr: 'Français',
  en: 'English',
};
