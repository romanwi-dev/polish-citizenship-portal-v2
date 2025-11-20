const fs = require('fs');
const path = require('path');
const localesDir = path.join('src', 'i18n', 'locales');
const configPath = path.join('src', 'i18n', 'config.ts');

if (!fs.existsSync(localesDir)) fs.mkdirSync(localesDir, { recursive: true });

if (fs.existsSync(configPath)) {
    const content = fs.readFileSync(configPath, 'utf8');
    ['en', 'es', 'pt', 'fr', 'de', 'he', 'ru', 'uk'].forEach(lang => {
        const start = content.indexOf(lang + ': {');
        if (start > -1) {
            let open=0, end=-1, found=false;
            for(let i=start; i<content.length; i++){
                if(content[i]==='{'){ if(!found)found=true; open++; }
                if(content[i]==='}'){ open--; }
                if(found && open===0){ end=i+1; break; }
            }
            if(end!==-1) {
                const body = content.substring(content.indexOf('{', start), end);
                fs.writeFileSync(path.join(localesDir, lang + '.ts'), "const " + lang + " = " + body + ";\nexport default " + lang + ";\n");
                console.log("✅ Restored " + lang + ".ts");
            }
        }
    });
    
    const newConfig = "import i18n from 'i18next';\nimport { initReactI18next } from 'react-i18next';\nimport LanguageDetector from 'i18next-browser-languagedetector';\n\nimport en from './locales/en';\nimport es from './locales/es';\nimport pt from './locales/pt';\nimport fr from './locales/fr';\nimport de from './locales/de';\nimport he from './locales/he';\nimport ru from './locales/ru';\nimport uk from './locales/uk';\n\nexport const resources = { en, es, pt, fr, de, he, ru, uk };\n\ni18n.use(LanguageDetector).use(initReactI18next).init({ resources, fallbackLng: 'en', interpolation: { escapeValue: false } });\nexport default i18n;";
    fs.writeFileSync(configPath, newConfig);
    console.log("🚀 Config replaced.");
}
