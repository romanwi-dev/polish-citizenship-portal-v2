import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en';

const resources = {
  en: { translation: en },
  es: { translation: en },
  pt: { translation: en },
  de: { translation: en },
  fr: { translation: en },
  he: { translation: en },
  ru: { translation: en },
  uk: { translation: en }
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false
  }
});

export default i18n;
