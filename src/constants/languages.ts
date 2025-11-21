// LANG-RUNTIME-SAFE: Central language constants to ensure consistency across app

export type LanguageConfig = {
  code: string;
  label: string;
  flag: string;
};

// LANG-RUNTIME-SAFE: Homepage + Portal languages (NO Polish for clients)
export const PUBLIC_LANGUAGES: LanguageConfig[] = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'pt', label: 'Português', flag: '🇵🇹' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'he', label: 'עברית', flag: '🇮🇱' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'uk', label: 'Українська', flag: '🇺🇦' },
];

// LANG-RUNTIME-SAFE: Admin backend languages (EN/PL only)
export const ADMIN_LANGUAGES: LanguageConfig[] = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'pl', label: 'Polski', flag: '🇵🇱' },
];

// LANG-RUNTIME-SAFE: Extract codes for validation
export const PUBLIC_LANGUAGE_CODES = PUBLIC_LANGUAGES.map(l => l.code);
export const ADMIN_LANGUAGE_CODES = ADMIN_LANGUAGES.map(l => l.code);

// LANG-RUNTIME-SAFE: RTL language detection
export const isRTLLanguage = (code: string): boolean => code === 'he';
