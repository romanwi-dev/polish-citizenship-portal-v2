const fs = require('fs');
const path = require('path');

// Ensure dir exists
const localesDir = path.join('src', 'i18n', 'locales');
if (!fs.existsSync(localesDir)) fs.mkdirSync(localesDir, { recursive: true });

const configFile = path.join('src', 'i18n', 'config.ts');
const content = fs.readFileSync(configFile, 'utf8');

function extractLocale(lang) {
  // Find start of object
  const startMarker = `${lang}: {`;
  const startIndex = content.indexOf(startMarker);
  
  if (startIndex === -1) {
    console.log(`Skipping ${lang} (not found)`);
    return;
  }
  
  // Brace counting to find the exact end of the object
  let braceCount = 0;
  let endIndex = -1;
  let foundStart = false;
  let openBraceIndex = -1;
  
  for (let i = startIndex; i < content.length; i++) {
    if (content[i] === '{') {
      if (!foundStart) openBraceIndex = i;
      braceCount++;
      foundStart = true;
    } else if (content[i] === '}') {
      braceCount--;
    }
    
    if (foundStart && braceCount === 0) {
      endIndex = i + 1;
      break;
    }
  }
  
  if (endIndex !== -1) {
    const localeObj = content.substring(openBraceIndex, endIndex);
    // Write file
    const fileContent = `const ${lang} = ${localeObj};\n\nexport default ${lang};\n`;
    fs.writeFileSync(path.join(localesDir, `${lang}.ts`), fileContent);
    console.log(`SUCCESS: Extracted src/i18n/locales/${lang}.ts`);
  } else {
    console.error(`ERROR: Could not parse object for ${lang}`);
  }
}

// Extract EN, ES, PT, FR, DE, HE, RU, UK (Skipping PL)
['en', 'es', 'pt', 'fr', 'de', 'he', 'ru', 'uk'].forEach(extractLocale);
