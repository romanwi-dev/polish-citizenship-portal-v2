import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from './locales/en';

const SUPPORTED_LANGUAGES = ['en', 'es', 'pt', 'de', 'fr', 'he', 'ru', 'uk'];

// Lazy load language resources (for non-English languages)
const loadLanguageResources = async (lng: string) => {
  try {
    const module = await import(`./locales/${lng}.ts`);
    return module.default;
  } catch (error) {
    console.error(`Failed to load language ${lng}:`, error);
    return enTranslations; // Fallback to English
  }
};

// Initialize i18n with English translations loaded synchronously
i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: enTranslations
    },
    lng: 'en',
    fallbackLng: 'en',
    supportedLngs: SUPPORTED_LANGUAGES,
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false, // Disable Suspense since we're loading synchronously
    },
  });

// Handle RTL for Hebrew and load other languages on demand
i18n.on('languageChanged', async (lng) => {
  const dir = lng === 'he' ? 'rtl' : 'ltr';
  document.documentElement.dir = dir;
  document.documentElement.lang = lng;
  
  // Load language resources if not already loaded
  if (lng !== 'en' && !i18n.hasResourceBundle(lng, 'translation')) {
    const resources = await loadLanguageResources(lng);
    i18n.addResourceBundle(lng, 'translation', resources.translation, true, true);
  }
});

export default i18n;
