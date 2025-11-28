import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// MINIMAL SAFE i18n CONFIG
// Goal: avoid crashes like "acc[key2]" or "currentInstance[key] = value".
// We don't care about full translations for now, just stability.

const resources = {
  en: {
    translation: {
      appTitle: 'Polish Citizenship Portal',
      loading: 'Loading...',
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    // Very important: don't treat dots/colons in keys as nesting.
    keySeparator: false,
    nsSeparator: false,
  });

export default i18n;