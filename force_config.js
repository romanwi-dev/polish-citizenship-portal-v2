const fs = require('fs');
const path = require('path');

const configPath = path.join('src', 'i18n', 'config.ts');
const checkPath = path.join('src', 'i18n', 'locales', 'en.ts');

// 1. Safety Check: Ensure we have the new files first
if (!fs.existsSync(checkPath)) {
  console.error("❌ STOP! src/i18n/locales/en.ts not found. I will not delete config.ts.");
  process.exit(1);
}

// 2. The New Clean Content
const newConfig = `import i18n from 'i18next';
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

export const resources = { 
  en, es, pt, fr, de, he, ru, uk 
};

i18n.use(LanguageDetector).use(initReactI18next).init({ resources, fallbackLng: 'en', interpolation: { escapeValue: false } });
export default i18n;
`;

// 3. Nuclear Swap
try {
  if (fs.existsSync(configPath)) {
    fs.unlinkSync(configPath); // DELETE the 6k file
    console.log("🗑️ DELETED old config.ts");
  }
  fs.writeFileSync(configPath, newConfig); // WRITE the 30 line file
  console.log("✅ SUCCESS: New config.ts created.");
} catch (e) {
  console.error("❌ Error:", e);
}
