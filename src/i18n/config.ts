import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// English Imports
import enLanding from './locales/en/landing';
import enApp from './locales/en/app';
import enTimeline from './locales/en/timeline';
import enOnboarding from './locales/en/onboarding';

// Spanish Imports
import esLanding from './locales/es/landing';
import esApp from './locales/es/app';
import esTimeline from './locales/es/timeline';
import esOnboarding from './locales/es/onboarding';

// Portuguese Imports
import ptLanding from './locales/pt/landing';
import ptApp from './locales/pt/app';
import ptTimeline from './locales/pt/timeline';
import ptOnboarding from './locales/pt/onboarding';

// French Imports
import frLanding from './locales/fr/landing';
import frApp from './locales/fr/app';
import frTimeline from './locales/fr/timeline';
import frOnboarding from './locales/fr/onboarding';

// German Imports
import deLanding from './locales/de/landing';
import deApp from './locales/de/app';
import deTimeline from './locales/de/timeline';
import deOnboarding from './locales/de/onboarding';

// Hebrew Imports
import heLanding from './locales/he/landing';
import heApp from './locales/he/app';
import heTimeline from './locales/he/timeline';
import heOnboarding from './locales/he/onboarding';

// Russian Imports
import ruLanding from './locales/ru/landing';
import ruApp from './locales/ru/app';
import ruTimeline from './locales/ru/timeline';
import ruOnboarding from './locales/ru/onboarding';

// Ukrainian Imports
import ukLanding from './locales/uk/landing';
import ukApp from './locales/uk/app';
import ukTimeline from './locales/uk/timeline';
import ukOnboarding from './locales/uk/onboarding';

export const resources = {
  en: { landing: enLanding, app: enApp, timeline: enTimeline, onboarding: enOnboarding },
  es: { landing: esLanding, app: esApp, timeline: esTimeline, onboarding: esOnboarding },
  pt: { landing: ptLanding, app: ptApp, timeline: ptTimeline, onboarding: ptOnboarding },
  fr: { landing: frLanding, app: frApp, timeline: frTimeline, onboarding: frOnboarding },
  de: { landing: deLanding, app: deApp, timeline: deTimeline, onboarding: deOnboarding },
  he: { landing: heLanding, app: heApp, timeline: heTimeline, onboarding: heOnboarding },
  ru: { landing: ruLanding, app: ruApp, timeline: ruTimeline, onboarding: ruOnboarding },
  uk: { landing: ukLanding, app: ukApp, timeline: ukTimeline, onboarding: ukOnboarding }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    ns: ['landing', 'app', 'timeline', 'onboarding'],
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
