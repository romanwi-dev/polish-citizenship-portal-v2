import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import English
import enLanding from './locales/en/landing';
import enApp from './locales/en/app';

// Import Spanish
import esLanding from './locales/es/landing';
import esApp from './locales/es/app';

// Import Portuguese
import ptLanding from './locales/pt/landing';
import ptApp from './locales/pt/app';

// Import French
import frLanding from './locales/fr/landing';
import frApp from './locales/fr/app';

// Import German
import deLanding from './locales/de/landing';
import deApp from './locales/de/app';

// Import Hebrew
import heLanding from './locales/he/landing';
import heApp from './locales/he/app';

// Import Russian
import ruLanding from './locales/ru/landing';
import ruApp from './locales/ru/app';

// Import Ukrainian
import ukLanding from './locales/uk/landing';
import ukApp from './locales/uk/app';

export const resources = {
  en: { landing: enLanding, app: enApp },
  es: { landing: esLanding, app: esApp },
  pt: { landing: ptLanding, app: ptApp },
  fr: { landing: frLanding, app: frApp },
  de: { landing: deLanding, app: deApp },
  he: { landing: heLanding, app: heApp },
  ru: { landing: ruLanding, app: ruApp },
  uk: { landing: ukLanding, app: ukApp }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    ns: ['landing', 'app'],
    defaultNS: 'landing',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

// Handle RTL for Hebrew
i18n.on('languageChanged', (lng) => {
  const dir = lng === 'he' ? 'rtl' : 'ltr';
  document.documentElement.dir = dir;
  document.documentElement.lang = lng;
});

export default i18n;
