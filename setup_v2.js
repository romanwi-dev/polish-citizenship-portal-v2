const fs = require('fs');
const path = require('path');

// Language configurations per CORE_POLICIES.md v3
const marketingLangs = ['en', 'es', 'pt', 'fr', 'de', 'he', 'ru', 'uk'];
const adminLangs = ['en', 'pl'];

// Directory structure
const v2Root = path.join('src', 'i18n', 'v2');
const localesRoot = path.join(v2Root, 'locales');

console.log('🚀 Starting i18n V2 Engine Setup...\n');

// Step 1: Create directory structure
function createDirectories() {
  [v2Root, localesRoot].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ Created: ${dir}`);
    } else {
      console.log(`⏭️  Exists: ${dir}`);
    }
  });
}

// Step 2: Generate placeholder content
function generateLandingContent(lang) {
  return `const landing = {
  hero: {
    title: "TODO: landing hero title (${lang})",
    subtitle: "TODO: landing hero subtitle (${lang})"
  },
  timeline: {
    title: "TODO: timeline title (${lang})",
    subtitle: "TODO: timeline subtitle (${lang})"
  },
  onboarding: {},
  pricing: {},
  testimonials: {},
  faq: {},
  contact: {}
};

export default landing;
`;
}

function generatePortalContent(lang) {
  return `const portal = {
  dashboard: {
    title: "TODO: portal dashboard title (${lang})",
    subtitle: "TODO: portal dashboard subtitle (${lang})"
  },
  onboarding: {},
  forms: {},
  documents: {},
  messages: {}
};

export default portal;
`;
}

function generateAdminContent(lang) {
  const isPL = lang === 'pl';
  return `const admin = {
  menu: {
    dashboard: "${isPL ? 'TODO (PL): Dashboard' : 'Dashboard'}",
    cases: "${isPL ? 'TODO (PL): Cases' : 'Cases'}",
    settings: "${isPL ? 'TODO (PL): Settings' : 'Settings'}",
    users: "${isPL ? 'TODO (PL): Users' : 'Users'}",
    reports: "${isPL ? 'TODO (PL): Reports' : 'Reports'}"
  },
  labels: {
    search: "${isPL ? 'TODO (PL): Search' : 'Search'}",
    filter: "${isPL ? 'TODO (PL): Filter' : 'Filter'}",
    export: "${isPL ? 'TODO (PL): Export' : 'Export'}",
    save: "${isPL ? 'TODO (PL): Save' : 'Save'}",
    cancel: "${isPL ? 'TODO (PL): Cancel' : 'Cancel'}"
  },
  notices: {}
};

export default admin;
`;
}

// Step 3: Create marketing language files
function createMarketingFiles() {
  console.log('\n📦 Creating marketing language files...');
  marketingLangs.forEach(lang => {
    const langDir = path.join(localesRoot, lang);
    if (!fs.existsSync(langDir)) {
      fs.mkdirSync(langDir, { recursive: true });
    }
    
    // landing.ts
    const landingPath = path.join(langDir, 'landing.ts');
    fs.writeFileSync(landingPath, generateLandingContent(lang));
    console.log(`  ✅ ${lang}/landing.ts`);
    
    // portal.ts
    const portalPath = path.join(langDir, 'portal.ts');
    fs.writeFileSync(portalPath, generatePortalContent(lang));
    console.log(`  ✅ ${lang}/portal.ts`);
  });
}

// Step 4: Create admin language files
function createAdminFiles() {
  console.log('\n🔐 Creating admin language files...');
  adminLangs.forEach(lang => {
    const langDir = path.join(localesRoot, lang);
    if (!fs.existsSync(langDir)) {
      fs.mkdirSync(langDir, { recursive: true });
    }
    
    // admin.ts
    const adminPath = path.join(langDir, 'admin.ts');
    fs.writeFileSync(adminPath, generateAdminContent(lang));
    console.log(`  ✅ ${lang}/admin.ts`);
  });
}

// Step 5: Generate V2 engine setup file
function generateEngineSetup() {
  console.log('\n⚙️  Generating V2 engine setup...');
  
  const setupContent = `import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import marketing languages (landing + portal)
import enLanding from './locales/en/landing';
import esLanding from './locales/es/landing';
import ptLanding from './locales/pt/landing';
import frLanding from './locales/fr/landing';
import deLanding from './locales/de/landing';
import heLanding from './locales/he/landing';
import ruLanding from './locales/ru/landing';
import ukLanding from './locales/uk/landing';

import enPortal from './locales/en/portal';
import esPortal from './locales/es/portal';
import ptPortal from './locales/pt/portal';
import frPortal from './locales/fr/portal';
import dePortal from './locales/de/portal';
import hePortal from './locales/he/portal';
import ruPortal from './locales/ru/portal';
import ukPortal from './locales/uk/portal';

// Import admin languages (EN + PL only)
import enAdmin from './locales/en/admin';
import plAdmin from './locales/pl/admin';

// Build resources object with namespaces
export const resources = {
  en: {
    landing: enLanding,
    portal: enPortal,
    admin: enAdmin
  },
  es: {
    landing: esLanding,
    portal: esPortal
  },
  pt: {
    landing: ptLanding,
    portal: ptPortal
  },
  fr: {
    landing: frLanding,
    portal: frPortal
  },
  de: {
    landing: deLanding,
    portal: dePortal
  },
  he: {
    landing: heLanding,
    portal: hePortal
  },
  ru: {
    landing: ruLanding,
    portal: ruPortal
  },
  uk: {
    landing: ukLanding,
    portal: ukPortal
  },
  pl: {
    admin: plAdmin
  }
};

// Initialize i18next V2 Engine
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    ns: ['landing', 'portal', 'admin'],
    defaultNS: 'landing',
    fallbackLng: 'en',
    fallbackNS: 'landing',
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'preferredLanguage'
    }
  });

export default i18n;
`;
  
  const setupPath = path.join(v2Root, 'setup.ts');
  fs.writeFileSync(setupPath, setupContent);
  console.log(`  ✅ src/i18n/v2/setup.ts created`);
}

// Step 6: Run all steps
function run() {
  try {
    createDirectories();
    createMarketingFiles();
    createAdminFiles();
    generateEngineSetup();
    
    console.log('\n✅ SUCCESS: i18n V2 Engine structure created!');
    console.log('\n📁 Structure:');
    console.log('   src/i18n/v2/');
    console.log('   ├── setup.ts          (V2 engine entry point)');
    console.log('   └── locales/');
    console.log('       ├── en/           (landing.ts, portal.ts, admin.ts)');
    console.log('       ├── es/           (landing.ts, portal.ts)');
    console.log('       ├── pt/           (landing.ts, portal.ts)');
    console.log('       ├── fr/           (landing.ts, portal.ts)');
    console.log('       ├── de/           (landing.ts, portal.ts)');
    console.log('       ├── he/           (landing.ts, portal.ts)');
    console.log('       ├── ru/           (landing.ts, portal.ts)');
    console.log('       ├── uk/           (landing.ts, portal.ts)');
    console.log('       └── pl/           (admin.ts)');
    console.log('\n🎯 Next: Run migration scripts to populate real content');
    console.log('⚠️  Old src/i18n/config.ts remains UNTOUCHED');
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    process.exit(1);
  }
}

run();
