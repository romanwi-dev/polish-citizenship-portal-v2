const fs = require('fs');
const path = require('path');
const localesDir = path.join('src', 'i18n', 'locales');
if (!fs.existsSync(localesDir)) fs.mkdirSync(localesDir, { recursive: true });
const content = fs.readFileSync(path.join('src', 'i18n', 'config.ts'), 'utf8');

function extract(lang) {
  const startMarker = `${lang}: {`;
  const start = content.indexOf(startMarker);
  if (start === -1) return console.log(`Skipped ${lang}`);
  
  let open = 0; let end = -1; let foundStart = false; let openBraceIndex = -1;
  for (let i = start; i < content.length; i++) {
    if (content[i] === '{') { 
      if (!foundStart) openBraceIndex = i;
      open++; foundStart = true; 
    }
    if (content[i] === '}') { open--; }
    if (foundStart && open === 0) { end = i + 1; break; }
  }

  if (end !== -1) {
    const objectBody = content.substring(openBraceIndex, end);
    const fileData = `const ${lang} = ${objectBody};\nexport default ${lang};\n`;
    fs.writeFileSync(path.join(localesDir, `${lang}.ts`), fileData);
    console.log(`SAVED: ${lang}.ts`);
  }
}
['en', 'es', 'pt', 'fr', 'de', 'he', 'ru', 'uk'].forEach(extract);
