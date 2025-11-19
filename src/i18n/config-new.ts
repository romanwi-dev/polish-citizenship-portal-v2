import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const SUPPORTED_LANGUAGES = ['en', 'es', 'pt', 'de', 'fr', 'he', 'ru', 'uk'];

// Lazy load language resources
const loadLanguageResources = async (lng: string) => {
  try {
    const module = await import(`./locales/${lng}.ts`);
    return module.default;
  } catch (error) {
    console.error(`Failed to load language ${lng}:`, error);
    // Fallback to English if language fails to load
    if (lng !== 'en') {
      const fallback = await import('./locales/en.ts');
      return fallback.default;
    }
    throw error;
  }
};

// Initialize i18n with lazy loading
i18n
  .use(initReactI18next)
  .init({
    resources: {}, // Start with empty resources
    lng: 'en',
    fallbackLng: 'en',
    supportedLngs: SUPPORTED_LANGUAGES,
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: true, // Enable Suspense for async language loading
    },
  });

// Load initial language (English)
loadLanguageResources('en').then((resources) => {
  i18n.addResourceBundle('en', 'translation', resources.translation, true, true);
});

// Handle RTL for Hebrew
i18n.on('languageChanged', async (lng) => {
  const dir = lng === 'he' ? 'rtl' : 'ltr';
  document.documentElement.dir = dir;
  document.documentElement.lang = lng;
  
  // Load language resources if not already loaded
  if (!i18n.hasResourceBundle(lng, 'translation')) {
    const resources = await loadLanguageResources(lng);
    i18n.addResourceBundle(lng, 'translation', resources.translation, true, true);
  }
});

export default i18n;
