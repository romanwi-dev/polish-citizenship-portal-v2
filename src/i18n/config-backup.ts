// Temporary minimal config to get preview working
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const i18nResources = {
  en: {
    translation: {
      next: 'Next',
      previous: 'Previous',
      submit: 'Submit',
      step: 'Step',
      of: 'of'
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources: i18nResources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
