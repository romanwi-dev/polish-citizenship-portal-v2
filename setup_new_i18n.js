const fs = require('fs');
const path = require('path');

const oldConfig = path.join('src', 'i18n', 'config.ts');
const newConfig = path.join('src', 'i18n', 'init.ts'); // NEW NAME
const localesDir = path.join('src', 'i18n', 'locales');

// 1. Ensure Locales Exist
if (!fs.existsSync(localesDir)) fs.mkdirSync(localesDir, { recursive: true });

// 2. Extract Content from Old Config (Safety)
if (fs.existsSync(oldConfig)) {
  const content = fs.readFileSync(oldConfig, 'utf8');
  ['en', 'es', 'pt', 'fr', 'de', 'he', 'ru', 'uk'].forEach(lang => {
    const start = content.indexOf(`${lang}: {`);
    if (start > -1) {
       let open=0, end=-1, found=false;
       for(let i=start; i<content.length; i++){
         if(content[i]==='{'){ if(!found)found=true; open++; }
         if(content[i]==='}'){ open--; }
         if(found && open===0){ end=i+1; break; }
       }
       if(end!==-1) {
         const body = content.substring(content.indexOf('{', start), end);
         fs.writeFileSync(path.join(localesDir, `${lang}.ts`), `const ${lang} = ${body};\nexport default ${lang};\n`);
         console.log(`✅ Saved: ${lang}.ts`);
       }
    }
  });
}

// 3. Create the NEW Clean Config (init.ts)
const cleanCode = `import i18n from 'i18next';
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
export default i18n;`;

fs.writeFileSync(newConfig, cleanCode);
console.log("🚀 SUCCESS: Created src/i18n/init.ts");
