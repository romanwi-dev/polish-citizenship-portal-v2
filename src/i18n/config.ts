import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en';
import es from './locales/es';
import pt from './locales/pt';
import fr from './locales/fr';
import de from './locales/de';
import he from './locales/he';
import ru from './locales/ru';
import uk from './locales/uk';

// Maps imports to the resource structure
export const resources = { 
  en: { translation: en }, 
  es: { translation: es }, 
  pt: { translation: pt }, 
  fr: { translation: fr }, 
  de: { translation: de }, 
  he: { translation: he }, 
  ru: { translation: ru }, 
  uk: { translation: uk } 
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: { escapeValue: false }
  });

export default i18n;
