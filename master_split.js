const fs = require('fs');
const path = require('path');

// Paths
const configPath = path.join('src', 'i18n', 'config.ts');
const localesDir = path.join('src', 'i18n', 'locales');

// 1. Setup Directory
if (fs.existsSync(localesDir)) {
  fs.rmSync(localesDir, { recursive: true, force: true });
}
fs.mkdirSync(localesDir, { recursive: true });

// 2. Read Monolith
if (!fs.existsSync(configPath)) {
  console.error("❌ Error: config.ts not found!");
  process.exit(1);
}
const content = fs.readFileSync(configPath, 'utf8');

// 3. Extraction Function
let extractedCount = 0;
function extract(lang) {
  const startMarker = `${lang}: {`;
  const start = content.indexOf(startMarker);
  if (start === -1) return;
  
  let open = 0; let end = -1; let foundStart = false;
  for (let i = start; i < content.length; i++) {
    if (content[i] === '{') { if (!foundStart) open = 0; open++; foundStart = true; }
    if (content[i] === '}') { open--; }
    if (foundStart && open === 0) { end = i + 1; break; }
  }

  if (end !== -1) {
    const objectBody = content.substring(content.indexOf('{', start), end); // Start from the first brace
    const fileData = `const ${lang} = ${objectBody};\nexport default ${lang};\n`;
    fs.writeFileSync(path.join(localesDir, `${lang}.ts`), fileData);
    console.log(`✅ Extracted: ${lang}.ts`);
    extractedCount++;
  }
}

// 4. Run Extraction
['en', 'es', 'pt', 'fr', 'de', 'he', 'ru', 'uk'].forEach(extract);

// 5. The Safe Switch
if (extractedCount >= 8) {
  console.log("All files extracted. Overwriting config.ts...");
  
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

export const resources = { en, es, pt, fr, de, he, ru, uk };

i18n.use(LanguageDetector).use(initReactI18next).init({ resources, fallbackLng: 'en', interpolation: { escapeValue: false } });
export default i18n;
`;

  fs.writeFileSync(configPath, newConfig);
  console.log("🚀 SUCCESS: Architecture Updated.");
} else {
  console.error("❌ FAILED: Only extracted " + extractedCount + " files. Aborting switch.");
  process.exit(1);
}
