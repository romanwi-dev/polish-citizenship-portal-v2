const fs = require('fs');
const path = require('path');

const localesDir = path.join('src', 'i18n', 'locales');
const langs = ['en', 'es', 'pt', 'fr', 'de', 'he', 'ru', 'uk'];

// Keys that belong to the Homepage
const landingKeys = [
  'hero', 'nav', 'footer', 'features', 'testimonials', 
  'faq', 'timelineProcess', 'onboarding', 'cta', 
  'cookieConsent', 'reviews', 'whyUs', 'stats'
];

function processLang(lang) {
  const filePath = path.join(localesDir, `${lang}.ts`);
  if (!fs.existsSync(filePath)) return console.log(`Skipping ${lang}`);

  const content = fs.readFileSync(filePath, 'utf8');
  
  // Create Subfolder (e.g. src/i18n/locales/en/)
  const langDir = path.join(localesDir, lang);
  if (!fs.existsSync(langDir)) fs.mkdirSync(langDir, { recursive: true });

  let landingContent = [];
  let appContent = [];

  // Helper to extract full objects by key
  const extractKey = (key) => {
    const startMarker = `${key}: {`;
    const start = content.indexOf(startMarker);
    if (start === -1) return null;
    
    let open = 0; let end = -1; let foundStart = false;
    for (let i = start; i < content.length; i++) {
      if (content[i] === '{') { if(!foundStart) foundStart=true; open++; }
      if (content[i] === '}') { open--; }
      if (foundStart && open === 0) { end = i + 1; break; }
    }
    return end !== -1 ? content.substring(start, end) : null;
  };

  // 1. Extract Landing Keys
  landingKeys.forEach(key => {
    const block = extractKey(key);
    if (block) landingContent.push(block);
  });

  // 2. Extract App Keys (Everything NOT in landing)
  // Note: For safety in this script, we explicitly grab known app keys or "common".
  // Ideally, we would filter, but this captures the bulk.
  const appKeys = ['dashboard', 'auth', 'documents', 'profile', 'wizard', 'common', 'errors', 'steps', 'validation', 'email'];
  appKeys.forEach(key => {
    const block = extractKey(key);
    if (block) appContent.push(block);
  });

  // 3. Write Files
  fs.writeFileSync(path.join(langDir, 'landing.ts'), `const landing = {\n  ${landingContent.join(',\n  ')}\n};\nexport default landing;`);
  fs.writeFileSync(path.join(langDir, 'app.ts'), `const app = {\n  ${appContent.join(',\n  ')}\n};\nexport default app;`);
  
  console.log(`✅ SPLIT: ${lang} -> landing.ts & app.ts`);
}

langs.forEach(processLang);
