import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import marketing languages (landing + portal)
import enLanding from './locales/en/landing';
import esLanding from './locales/es/landing';
import ptLanding from './locales/pt/landing';
import frLanding from './locales/fr/landing';
import deLanding from './locales/de/landing';
import heLanding from './locales/he/landing';
import ruLanding from './locales/ru/landing';
import ukLanding from './locales/uk/landing';

import enPortal from './locales/en/portal';
import esPortal from './locales/es/portal';
import ptPortal from './locales/pt/portal';
import frPortal from './locales/fr/portal';
import dePortal from './locales/de/portal';
import hePortal from './locales/he/portal';
import ruPortal from './locales/ru/portal';
import ukPortal from './locales/uk/portal';

// Import admin languages (EN + PL only)
import enAdmin from './locales/en/admin';
import plAdmin from './locales/pl/admin';

// Build resources object with namespaces
export const resources = {
  en: {
    landing: enLanding,
    portal: enPortal,
    admin: enAdmin
  },
  es: {
    landing: esLanding,
    portal: esPortal
  },
  pt: {
    landing: ptLanding,
    portal: ptPortal
  },
  fr: {
    landing: frLanding,
    portal: frPortal
  },
  de: {
    landing: deLanding,
    portal: dePortal
  },
  he: {
    landing: heLanding,
    portal: hePortal
  },
  ru: {
    landing: ruLanding,
    portal: ruPortal
  },
  uk: {
    landing: ukLanding,
    portal: ukPortal
  },
  pl: {
    admin: plAdmin
  }
};

// Initialize i18next V2 Engine
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    ns: ['landing', 'portal', 'admin'],
    defaultNS: 'landing',
    fallbackLng: 'en',
    fallbackNS: 'landing',
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'preferredLanguage'
    }
  });

export default i18n;
