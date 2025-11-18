// Minimal i18n config
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n.use(initReactI18next).init({
  resources: {
    en: { 
      translation: { 
        next: 'Next', 
        previous: 'Previous', 
        submit: 'Submit', 
        step: 'Step', 
        of: 'of',
        onboarding: {
          step1: { title: 'Step 1', keyPoints: ['Point 1'] },
          step2: { title: 'Step 2', keyPoints: ['Point 1'] },
          step3: { title: 'Step 3', keyPoints: ['Point 1'] },
          step4: { title: 'Step 4', keyPoints: ['Point 1'] },
          step5: { title: 'Step 5', keyPoints: ['Point 1'] }
        },
        home: {
          testimonials: []
        }
      } 
    }
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false }
});

export default i18n;
