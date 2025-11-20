const fs = require('fs');
const path = require('path');

const configPath = path.join('src', 'i18n', 'config.ts');
const checkPath = path.join('src', 'i18n', 'locales', 'en.ts');

// 1. Safety Check: Ensure we actually extracted the files first
if (!fs.existsSync(checkPath)) {
  console.error("❌ STOP! Locale files not found. Extraction failed.");
  process.exit(1);
}

// 2. The New Content
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
  if (fs.existsSync(configPath)) fs.unlinkSync(configPath); // Delete the 6k file
  fs.writeFileSync(configPath, newConfig); // Write the 30 line file
  console.log("✅ SUCCESS: config.ts has been replaced.");
} catch (e) {
  console.error("❌ Error:", e);
}
