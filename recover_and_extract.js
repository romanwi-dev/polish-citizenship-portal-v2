const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔄 Starting recovery and extraction...\n');

// Step 1: Restore original config.ts from git
try {
  console.log('📂 Restoring original config.ts from git history...');
  const originalContent = execSync('git show HEAD~1:src/i18n/config.ts 2>/dev/null || git show HEAD:src/i18n/config.ts', { encoding: 'utf8' });
  
  if (!originalContent || originalContent.length < 1000) {
    throw new Error('Could not find original config with translations');
  }
  
  console.log(`✓ Found original config (${originalContent.length} chars)\n`);
  
  // Step 2: Create locales directory
  const localesDir = path.join('src', 'i18n', 'locales');
  if (!fs.existsSync(localesDir)) {
    fs.mkdirSync(localesDir, { recursive: true });
  }
  
  // Step 3: Extract each language
  function extractLanguage(content, lang) {
    const startMarker = `${lang}: {`;
    const start = content.indexOf(startMarker);
    
    if (start === -1) {
      console.log(`⚠️  ${lang}: not found`);
      return false;
    }
    
    let braceCount = 0;
    let foundStart = false;
    let openBraceIndex = -1;
    
    for (let i = start; i < content.length; i++) {
      if (content[i] === '{') {
        if (!foundStart) openBraceIndex = i;
        braceCount++;
        foundStart = true;
      }
      if (content[i] === '}') {
        braceCount--;
      }
      if (foundStart && braceCount === 0) {
        const objectBody = content.substring(openBraceIndex, i + 1);
        const fileContent = `const ${lang} = ${objectBody};\nexport default ${lang};\n`;
        
        const filePath = path.join(localesDir, `${lang}.ts`);
        fs.writeFileSync(filePath, fileContent);
        console.log(`✅ ${lang}.ts created (${fileContent.length} chars)`);
        return true;
      }
    }
    
    console.log(`❌ ${lang}: extraction failed`);
    return false;
  }
  
  console.log('🌍 Extracting languages:\n');
  const languages = ['en', 'es', 'pt', 'fr', 'de', 'he', 'ru', 'uk'];
  let successCount = 0;
  
  languages.forEach(lang => {
    if (extractLanguage(originalContent, lang)) {
      successCount++;
    }
  });
  
  console.log(`\n✅ Successfully extracted ${successCount}/${languages.length} languages`);
  
  if (successCount === languages.length) {
    console.log('\n🎉 Recovery complete! All locale files created.');
    console.log('The modular i18n architecture is now ready.');
  } else {
    console.log('\n⚠️  Some languages failed to extract. Check the output above.');
  }
  
} catch (error) {
  console.error('\n❌ Recovery failed:', error.message);
  console.error('\nThe original translations may be permanently lost.');
  console.error('Please check if you have a backup or can restore from git history manually.');
  process.exit(1);
}
