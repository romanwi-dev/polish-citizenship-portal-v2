import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Simplified version for testing
const resources = {
  en: {
    translation: {
      test: 'test'
    }
  }
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
  });

export default i18n;
