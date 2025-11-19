#!/usr/bin/env node

/**
 * Script to extract language translations from the monolithic config.ts
 * into separate language files in src/i18n/locales/
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CONFIG_PATH = join(__dirname, '../src/i18n/config.ts');
const LOCALES_DIR = join(__dirname, '../src/i18n/locales');

// Ensure locales directory exists
try {
  mkdirSync(LOCALES_DIR, { recursive: true });
} catch (e) {
  // Directory already exists
}

// Read the config file
const configContent = readFileSync(CONFIG_PATH, 'utf-8');

// Language codes to extract
const languages = ['es', 'pt', 'de', 'fr', 'he', 'ru', 'uk'];

// Extract each language
languages.forEach(lang => {
  console.log(`Extracting ${lang}...`);
  
  // Find the start of the language block
  const langRegex = new RegExp(`\\n\\s+${lang}:\\s+\\{\\s*\\n\\s+translation:\\s+\\{`, 'm');
  const match = configContent.match(langRegex);
  
  if (!match) {
    console.error(`Could not find ${lang} in config`);
    return;
  }
  
  const startIndex = match.index;
  
  // Find the end by counting braces
  let braceCount = 2; // Starting with translation: { and lang: {
  let endIndex = startIndex + match[0].length;
  
  while (braceCount > 0 && endIndex < configContent.length) {
    const char = configContent[endIndex];
    if (char === '{') braceCount++;
    if (char === '}') braceCount--;
    endIndex++;
  }
  
  // Extract the translation content
  const translationContent = configContent.substring(
    startIndex + match[0].length - 1, // Include the opening {
    endIndex
  ).trim();
  
  // Create the export default structure
  const fileContent = `export default ${translationContent};\n`;
  
  // Write to file
  const outputPath = join(LOCALES_DIR, `${lang}.ts`);
  writeFileSync(outputPath, fileContent, 'utf-8');
  console.log(`✅ Created ${outputPath}`);
});

console.log('\n✨ All languages extracted successfully!');
console.log('📝 Next steps:');
console.log('1. Delete or rename src/i18n/config.ts');
console.log('2. Rename src/i18n/config-new.ts to config.ts');
console.log('3. Update src/main.tsx to import ./i18n/config');
console.log('4. Test language switching');
