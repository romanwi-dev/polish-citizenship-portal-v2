import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translations
import en from './locales/en';
import pl from './locales/pl';
import es from './locales/es';
import pt from './locales/pt';
import de from './locales/de';
import fr from './locales/fr';
import he from './locales/he';
import ru from './locales/ru';
import uk from './locales/uk';

// Translation resources
const resources = {
  en,
  pl,
  es,
  pt,
  de,
  fr,
  he,
  ru,
  uk
};

// Get stored language or detect browser language
const getInitialLanguage = () => {
  const stored = localStorage.getItem('preferredLanguage');
  if (stored && ['en', 'pl', 'es', 'pt', 'de', 'fr', 'he', 'ru', 'uk'].includes(stored)) {
    return stored;
  }
  
  const browserLang = navigator.language.split('-')[0];
  return ['en', 'pl', 'es', 'pt', 'de', 'fr', 'he', 'ru', 'uk'].includes(browserLang) ? browserLang : 'en';
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getInitialLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes
    },
    react: {
      useSuspense: true,
      bindI18n: 'languageChanged loaded',
      bindI18nStore: 'added removed',
      transEmptyNodeValue: '',
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'i'],
    },
  });

// Handle RTL for Hebrew
i18n.on('languageChanged', (lng) => {
  const dir = lng === 'he' ? 'rtl' : 'ltr';
  document.documentElement.dir = dir;
  document.documentElement.lang = lng;
});

export default i18n;
