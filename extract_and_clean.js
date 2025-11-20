const fs = require('fs');
const path = require('path');

// Read the backup or find the original monolithic config
const configPath = path.join('src', 'i18n', 'config.ts');
let content = '';

// Try to find a backup or the original content
try {
  // Check if there's a .git directory to restore from
  const { execSync } = require('child_process');
  content = execSync('git show HEAD:src/i18n/config.ts', { encoding: 'utf8' });
  console.log('✓ Found original config in git history');
} catch (e) {
  console.error('❌ Cannot find original config.ts content');
  console.error('The monolithic file has already been replaced.');
  console.error('Please restore from backup or provide the original file.');
  process.exit(1);
}

const localesDir = path.join('src', 'i18n', 'locales');
if (!fs.existsSync(localesDir)) {
  fs.mkdirSync(localesDir, { recursive: true });
}

function extract(lang) {
  const startMarker = `${lang}: {`;
  const start = content.indexOf(startMarker);
  if (start === -1) {
    console.log(`⚠ Skipped ${lang} (not found)`);
    return;
  }
  
  let open = 0;
  let end = -1;
  let foundStart = false;
  let openBraceIndex = -1;
  
  for (let i = start; i < content.length; i++) {
    if (content[i] === '{') {
      if (!foundStart) openBraceIndex = i;
      open++;
      foundStart = true;
    }
    if (content[i] === '}') {
      open--;
    }
    if (foundStart && open === 0) {
      end = i + 1;
      break;
    }
  }

  if (end !== -1) {
    const objectBody = content.substring(openBraceIndex, end);
    const fileData = `const ${lang} = ${objectBody};\nexport default ${lang};\n`;
    fs.writeFileSync(path.join(localesDir, `${lang}.ts`), fileData);
    console.log(`✓ Created ${lang}.ts`);
  }
}

['en', 'es', 'pt', 'fr', 'de', 'he', 'ru', 'uk'].forEach(extract);
console.log('\n✅ Extraction complete!');
