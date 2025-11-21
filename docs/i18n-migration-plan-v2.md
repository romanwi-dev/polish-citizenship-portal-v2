# i18n V2 Migration Plan

**Document Version:** 1.0  
**Created:** 2025-01-21  
**Status:** ANALYSIS COMPLETE - AWAITING MANUAL IMPLEMENTATION

---

## ⚠️ CRITICAL WARNINGS

### Past Incident
**Previous i18n V2 switch broke the application.** Automated changes to the i18n system without proper testing caused runtime failures. This plan MUST be executed manually with careful testing at each step.

### Safety Rules for Future Implementation
1. ❌ **NEVER** edit `src/i18n/**` without a backup and revert plan
2. ❌ **NEVER** change i18n imports in `src/main.tsx` until all content is migrated AND tested
3. ❌ **NEVER** automate bulk file operations on translation files
4. ✅ **ALWAYS** test in local environment (Cursor/VSCode) before deploying
5. ✅ **ALWAYS** maintain parallel systems during migration (V1 and V2 running side-by-side)
6. ✅ **ALWAYS** verify all features work after each migration step

---

## 📊 CURRENT STATE ANALYSIS

### Existing i18n Setup

**Main Configuration:**
- **Primary config:** `src/i18n/config.ts` (6004 lines - monolithic)
- **Alternative config:** `src/i18n/config-new.ts` (modular imports, 37 lines)
- **Current runtime:** Uses `src/i18n/config.ts` (imported in `src/main.tsx`)

**Configured Languages:**
- English (EN) ✅
- Spanish (ES) ✅
- Portuguese (PT) ✅
- French (FR) ✅
- German (DE) ✅
- Hebrew (HE) ✅
- Russian (RU) ✅
- Ukrainian (UK) ✅
- Polish (PL) - **partial/placeholder only** ⚠️

**Current Structure:**
```
src/i18n/
├── config.ts                    (6004 lines - ALL translations)
├── config-new.ts                (modular alternative)
├── locales/
│   ├── en.ts                    (simple nav/button translations)
│   ├── es.ts                    (simple nav/button translations)
│   ├── pt.ts                    (simple nav/button translations)
│   ├── fr.ts                    (simple nav/button translations)
│   ├── de.ts                    (simple nav/button translations)
│   ├── he.ts                    (simple nav/button translations)
│   ├── ru.ts                    (simple nav/button translations)
│   └── uk.ts                    (simple nav/button translations)
└── [helper scripts]             (master_split.js, force_switch.js, etc.)
```

**V2 Structure (Already Created):**
```
src/i18n/v2/
├── setup.ts                     (V2 engine - NOT ACTIVE)
└── locales/
    ├── en/
    │   ├── landing.ts           (placeholder)
    │   ├── portal.ts            (placeholder)
    │   └── admin.ts             (placeholder)
    ├── es/
    │   ├── landing.ts           (placeholder)
    │   └── portal.ts            (placeholder)
    ├── pt/
    │   ├── landing.ts           (placeholder)
    │   └── portal.ts            (placeholder)
    ├── fr/
    │   ├── landing.ts           (placeholder)
    │   └── portal.ts            (placeholder)
    ├── de/
    │   ├── landing.ts           (placeholder)
    │   └── portal.ts            (placeholder)
    ├── he/
    │   ├── landing.ts           (placeholder)
    │   └── portal.ts            (placeholder)
    ├── ru/
    │   ├── landing.ts           (placeholder)
    │   └── portal.ts            (placeholder)
    ├── uk/
    │   ├── landing.ts           (placeholder)
    │   └── portal.ts            (placeholder)
    └── pl/
        └── admin.ts             (placeholder - TODO translations)
```

### Key Namespaces in Current Config

**From `config.ts` (sample keys at lines 1-100):**
- `nav` - Navigation menu items
- `hero` - Homepage hero section
- `steps` - Form/wizard steps
- Common fields (firstName, lastName, etc.)
- Passport fields
- Family fields
- Polish connection fields

**Identified Content Areas:**

1. **HOMEPAGE (`/`)** - Uses:
   - `hero.*` (lines 93-100+)
   - `nav.*` (lines 77-90)
   - Timeline section keys (likely present in config.ts beyond line 100)
   - Onboarding section keys (likely present in config.ts beyond line 100)
   - Pricing, testimonials, FAQ, contact keys

2. **CLIENT PORTAL (`/portal`)** - Based on component analysis:
   - Dashboard components
   - Case status/progress
   - Document upload/management
   - Messaging system
   - Form submissions
   - **Currently using main config keys**

3. **ADMIN BACKEND** - Based on component analysis:
   - Admin dashboard (`src/pages/admin/Dashboard.tsx`)
   - Case management (`src/pages/admin/CasesManagement.tsx`)
   - Document management
   - AI agent tools
   - System health/monitoring
   - **Currently using main config keys**

### Current Usage in Components

**Homepage (`src/pages/Index.tsx`):**
- Lazy loads sections: Services, Timeline, Onboarding, Pricing, Testimonials, FAQ, Contact
- All sections import and use `useTranslation()` hook
- **No explicit namespace specified** - uses default translation namespace

**Client Portal Pages:**
- `src/pages/ClientDashboard.tsx` - Portal dashboard
- `src/pages/ClientLogin.tsx` - Portal login
- `src/pages/RequestAccess.tsx` - Portal access request
- **Currently no dedicated portal namespace**

**Admin Pages (59 files detected):**
- `src/pages/admin/Dashboard.tsx`
- `src/pages/admin/CasesManagement.tsx`
- `src/pages/admin/CaseDetail.tsx`
- `src/pages/admin/[many others]`
- **Currently no dedicated admin namespace**

---

## 🎯 TARGET ARCHITECTURE (V2)

### Namespace-Based Language Matrix

| Area | Namespace | EN | ES | PT | FR | DE | HE | RU | UK | PL |
|------|-----------|----|----|----|----|----|----|----|----|-----|
| **Homepage** | `landing` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Client Portal** | `portal` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Admin Backend** | `admin` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

**Legend:**
- ✅ = Language must be fully supported
- ❌ = Language excluded from this namespace

### File Structure Design

```
src/i18n/v2/
├── setup.ts                     ← V2 engine initialization
├── locales/
│   ├── en/
│   │   ├── landing.ts           ← Homepage translations (hero, timeline, pricing, etc.)
│   │   ├── portal.ts            ← Portal translations (dashboard, documents, messages)
│   │   └── admin.ts             ← Admin translations (cases, system, tools)
│   ├── es/
│   │   ├── landing.ts
│   │   └── portal.ts
│   ├── pt/
│   │   ├── landing.ts
│   │   └── portal.ts
│   ├── fr/
│   │   ├── landing.ts
│   │   └── portal.ts
│   ├── de/
│   │   ├── landing.ts
│   │   └── portal.ts
│   ├── he/
│   │   ├── landing.ts
│   │   └── portal.ts
│   ├── ru/
│   │   ├── landing.ts
│   │   └── portal.ts
│   ├── uk/
│   │   ├── landing.ts
│   │   └── portal.ts
│   └── pl/
│       └── admin.ts             ← Polish admin translations (NEEDS TRANSLATION)
```

### Namespace Content Mapping

#### `landing` Namespace (Homepage)
**Contains:**
- `hero.*` - Hero section (title, subtitle, CTA)
- `nav.*` - Navigation menu
- `timeline.*` - Process timeline section
- `onboarding.*` - Client onboarding section
- `services.*` - Services section
- `pricing.*` - Pricing plans
- `testimonials.*` - Client testimonials
- `faq.*` - Frequently asked questions
- `contact.*` - Contact form

#### `portal` Namespace (Client Portal)
**Contains:**
- `dashboard.*` - Portal dashboard
- `documents.*` - Document management
- `messages.*` - Messaging system
- `forms.*` - Form submissions
- `profile.*` - Client profile
- `status.*` - Case status/progress
- `upload.*` - File upload interface
- `auth.*` - Login/authentication

#### `admin` Namespace (Admin Backend)
**Contains (EN + PL only):**
- `menu.*` - Admin navigation menu
- `cases.*` - Case management
- `documents.*` - Document management
- `agents.*` - AI agent tools
- `system.*` - System health/monitoring
- `users.*` - User management
- `reports.*` - Reporting tools
- `settings.*` - System settings

### Required UI Features

#### Client Portal Language Toggle
**Location:** Client portal layout (`/portal/**` routes)
**Component:** Language switcher dropdown/icon in portal header
**Behavior:**
- Shows 8 language options (EN, ES, PT, FR, DE, HE, RU, UK)
- Persists selection in localStorage
- Dynamically loads correct `portal` namespace translation

**Implementation Notes:**
- Add to portal layout component (needs to be created or identified)
- Use i18next's `changeLanguage()` method
- Update all portal pages to use `portal` namespace explicitly

#### Admin Language Toggle
**Location:** Admin layout (`/admin/**` routes)
**Component:** Simple EN/PL toggle (flag icons or dropdown)
**Behavior:**
- Shows only 2 options: EN 🇬🇧 / PL 🇵🇱
- Persists selection in localStorage
- Loads `admin` namespace translation

**Implementation Notes:**
- Add to AdminLayout component
- Polish translations MUST be professionally translated (not auto-generated)
- All admin features must work identically in both languages

---

## 🔄 MIGRATION STEPS (FOR MANUAL EXECUTION)

### ⚠️ PRE-MIGRATION REQUIREMENTS
- [ ] Full project backup created
- [ ] Git commit with clean working tree
- [ ] Local development environment ready (Cursor/VSCode)
- [ ] All team members notified of migration
- [ ] Rollback plan documented

---

### STEP 1: Extract Homepage Keys to `landing` Namespace
**Complexity:** HIGH  
**Estimated Time:** 4-6 hours  
**Risk Level:** MEDIUM

**Tasks:**
1. Open `src/i18n/config.ts` and identify all keys used by homepage components
2. Create extraction script or manually copy:
   - `hero.*` → `landing.hero`
   - `nav.*` → `landing.nav`
   - Timeline keys → `landing.timeline`
   - Onboarding keys → `landing.onboarding`
   - Services keys → `landing.services`
   - Pricing keys → `landing.pricing`
   - Testimonials keys → `landing.testimonials`
   - FAQ keys → `landing.faq`
   - Contact keys → `landing.contact`
3. For each language (EN, ES, PT, FR, DE, HE, RU, UK):
   - Update `src/i18n/v2/locales/[lang]/landing.ts`
   - Replace TODO placeholders with actual content
   - Maintain exact same text/formatting as V1
4. Verify structure matches across all 8 languages
5. **DO NOT** change imports yet

**Verification:**
- Compare V1 vs V2 side-by-side for each language
- Ensure no keys are missing
- Ensure no keys are duplicated

---

### STEP 2: Extract Client Portal Keys to `portal` Namespace
**Complexity:** HIGH  
**Estimated Time:** 6-8 hours  
**Risk Level:** MEDIUM

**Tasks:**
1. Audit all portal-related components in `src/pages/` and `src/components/`
2. Identify ALL keys used by:
   - `ClientDashboard.tsx`
   - `ClientLogin.tsx`
   - `RequestAccess.tsx`
   - Portal-related components
3. Create `portal` namespace structure:
   - `portal.dashboard.*`
   - `portal.documents.*`
   - `portal.messages.*`
   - `portal.forms.*`
   - `portal.auth.*`
   - `portal.status.*`
4. For each language (EN, ES, PT, FR, DE, HE, RU, UK):
   - Update `src/i18n/v2/locales/[lang]/portal.ts`
   - Extract and organize keys
   - Maintain consistency with homepage translations
5. **DO NOT** change imports yet

**Verification:**
- Test each portal page still renders correctly with V1
- Document all extracted keys
- Cross-reference with component usage

---

### STEP 3: Extract Admin Keys to `admin` Namespace
**Complexity:** VERY HIGH  
**Estimated Time:** 8-10 hours  
**Risk Level:** HIGH

**Tasks:**
1. Audit all 59 admin pages in `src/pages/admin/`
2. Identify ALL admin-specific keys:
   - Menu/navigation
   - Case management
   - Document management
   - AI agent interfaces
   - System tools
   - Forms and tables
3. Create `admin` namespace structure for **ENGLISH ONLY** first:
   - `admin.menu.*`
   - `admin.cases.*`
   - `admin.documents.*`
   - `admin.agents.*`
   - `admin.system.*`
   - `admin.forms.*`
   - `admin.tables.*`
4. Update `src/i18n/v2/locales/en/admin.ts` with all keys
5. **CRITICAL:** Do NOT auto-translate to Polish
   - Leave `src/i18n/v2/locales/pl/admin.ts` with TODO markers
   - Mark for professional translation (STEP 8)
6. **DO NOT** change imports yet

**Verification:**
- Document all admin keys in spreadsheet
- Ensure no overlap with `portal` or `landing` namespaces
- Test admin still works with V1

---

### STEP 4: Add Polish Admin Translations (Professional)
**Complexity:** MEDIUM  
**Estimated Time:** 4-6 hours (translation) + 2 hours (review)  
**Risk Level:** LOW

**Tasks:**
1. Extract all English admin keys from `en/admin.ts`
2. Send to professional Polish translator
3. Review returned translations for:
   - Technical accuracy
   - UI/UX appropriateness
   - Consistency with legal terminology
4. Update `src/i18n/v2/locales/pl/admin.ts`
5. Have native Polish speaker verify in context

**Verification:**
- Side-by-side comparison: EN vs PL
- Test all admin features with PL language selected
- Ensure no missing keys

---

### STEP 5: Create Portal Language Toggle Component
**Complexity:** MEDIUM  
**Estimated Time:** 2-3 hours  
**Risk Level:** LOW

**Tasks:**
1. Create new component: `src/components/portal/LanguageToggle.tsx`
2. Implement dropdown/icon switcher with 8 languages:
   - EN 🇬🇧, ES 🇪🇸, PT 🇵🇹, FR 🇫🇷, DE 🇩🇪, HE 🇮🇱, RU 🇷🇺, UK 🇺🇦
3. Use i18next's `changeLanguage()` method
4. Persist selection in `localStorage`
5. Add to portal layout (identify or create layout component)
6. Style to match portal theme

**Verification:**
- Test language switching works
- Test localStorage persistence
- Test all 8 languages load correctly
- Verify RTL support for Hebrew

---

### STEP 6: Create Admin Language Toggle Component
**Complexity:** LOW  
**Estimated Time:** 1-2 hours  
**Risk Level:** LOW

**Tasks:**
1. Create toggle in `src/components/AdminLayout.tsx` (or admin header)
2. Simple EN 🇬🇧 / PL 🇵🇱 toggle
3. Use i18next's `changeLanguage()` method
4. Persist selection in `localStorage`
5. Default to EN for non-Polish users

**Verification:**
- Test toggle switches correctly
- Test all admin pages render in both languages
- Verify localStorage persistence

---

### STEP 7: Gradual Component Migration to V2
**Complexity:** VERY HIGH  
**Estimated Time:** 12-16 hours  
**Risk Level:** HIGH

**⚠️ CRITICAL:** This step must be done incrementally, NOT all at once

**Phase 7A: Homepage Migration**
1. Update `src/pages/Index.tsx`:
   ```typescript
   import { useTranslation } from 'react-i18next';
   
   // Change from:
   const { t } = useTranslation();
   
   // To:
   const { t } = useTranslation('landing');
   ```
2. Update all homepage child components to use `'landing'` namespace
3. Test THOROUGHLY before proceeding
4. If issues occur: ROLLBACK and debug

**Phase 7B: Portal Migration**
1. Identify portal layout component (or create one)
2. Update all portal pages to use `'portal'` namespace
3. Test each portal page individually
4. Verify language toggle works
5. If issues occur: ROLLBACK and debug

**Phase 7C: Admin Migration**
1. Update `AdminLayout.tsx` to use `'admin'` namespace
2. Update all 59 admin pages (one by one or in batches)
3. Test extensively in both EN and PL
4. Verify all admin functions work
5. If issues occur: ROLLBACK and debug

**Verification:**
- All pages render correctly
- All translations appear
- Language switching works
- No console errors
- No missing keys

---

### STEP 8: Switch Main i18n Engine from V1 to V2
**Complexity:** MEDIUM  
**Estimated Time:** 1-2 hours  
**Risk Level:** VERY HIGH

**⚠️ DANGER ZONE:** This is where the previous migration failed

**Tasks:**
1. **Before proceeding:**
   - Ensure ALL previous steps are complete
   - Ensure ALL components use namespace-specific `useTranslation('namespace')`
   - Create backup/snapshot
   - Have rollback ready
2. Update `src/main.tsx`:
   ```typescript
   // Change from:
   import './i18n/config';
   
   // To:
   import './i18n/v2/setup';
   ```
3. Deploy to staging (NOT production)
4. Test EVERYTHING:
   - Homepage (all 8 languages)
   - Portal (all 8 languages)
   - Admin (EN + PL)
   - Language toggles
   - All user flows
5. Load test and monitor errors
6. **ONLY AFTER** 48 hours of successful staging: Deploy to production

**Rollback Plan:**
```typescript
// If anything breaks:
import './i18n/config'; // Revert to V1 immediately
```

**Verification:**
- All pages load correctly
- All languages work
- No 404s or broken translations
- No console errors
- User sessions persist correctly

---

### STEP 9: Deprecate V1 Config (After 2 Weeks Success)
**Complexity:** LOW  
**Estimated Time:** 1 hour  
**Risk Level:** LOW

**Tasks:**
1. After V2 runs successfully for 2 weeks in production
2. Rename old config:
   - `src/i18n/config.ts` → `src/i18n/config.DEPRECATED.ts`
   - `src/i18n/config-new.ts` → `src/i18n/config-new.DEPRECATED.ts`
3. Move old `locales/` folder:
   - `src/i18n/locales/` → `src/i18n/locales.OLD/`
4. Delete legacy helper scripts:
   - `master_split.js`
   - `force_switch.js`
   - `force_config.js`
5. Update documentation
6. Keep deprecated files for 1 month, then delete

---

### STEP 10: Final Cleanup
**Complexity:** LOW  
**Estimated Time:** 1 hour  
**Risk Level:** VERY LOW

**Tasks:**
1. Remove `.DEPRECATED` and `.OLD` files after 1 month
2. Update `README.md` with V2 documentation
3. Document namespace usage for future developers
4. Archive migration plan for reference

---

## 📋 VALIDATION CHECKLIST

### Pre-Migration
- [ ] Full backup created
- [ ] Git working tree clean
- [ ] Team notified
- [ ] Rollback plan ready

### Post-Migration (Each Step)
- [ ] No console errors
- [ ] All features working
- [ ] All languages tested
- [ ] Language switching works
- [ ] No missing translations
- [ ] Performance unchanged
- [ ] User sessions preserved

### Final Validation (After Step 8)
- [ ] Homepage works in all 8 languages
- [ ] Portal works in all 8 languages
- [ ] Portal language toggle functional
- [ ] Admin works in EN + PL
- [ ] Admin language toggle functional
- [ ] No broken links or 404s
- [ ] No console warnings
- [ ] Load times acceptable
- [ ] Mobile responsive
- [ ] Staging tested 48+ hours
- [ ] Production deployment successful

---

## 🚨 RISK MITIGATION

### High-Risk Areas
1. **Step 8** (Engine switch) - Previous failure point
2. **Step 7** (Component migration) - Many files to update
3. **Step 3** (Admin extraction) - 59 complex pages

### Safety Measures
- Work in local environment (Cursor/VSCode)
- Commit after each step
- Test extensively before proceeding
- Never skip verification
- Keep V1 and V2 parallel until 100% confident
- Use feature flags if possible
- Deploy to staging first
- Monitor error logs closely

### Rollback Triggers
If ANY of these occur, STOP and ROLLBACK:
- ❌ Console errors appear
- ❌ Pages fail to load
- ❌ Translations missing
- ❌ Language switching broken
- ❌ User sessions lost
- ❌ Performance degraded
- ❌ Mobile layout broken

---

## 📈 SUCCESS CRITERIA

Migration is COMPLETE when:
- ✅ All 8 languages work on homepage
- ✅ All 8 languages work on portal
- ✅ Portal has visible language toggle
- ✅ Admin works in EN + PL with professional translations
- ✅ Admin has visible EN/PL toggle
- ✅ No console errors
- ✅ V2 engine active in `src/main.tsx`
- ✅ V1 config deprecated/removed
- ✅ Documentation updated
- ✅ Zero user complaints
- ✅ Running in production for 2+ weeks with no issues

---

## 👥 IMPLEMENTATION TEAM ROLES

**Lead Developer:**
- Executes migration steps
- Reviews code changes
- Coordinates testing

**QA Tester:**
- Tests each language
- Verifies all features
- Documents issues

**Native Speakers:**
- Polish speaker for admin translations review
- Other language speakers for verification (optional)

**Project Manager:**
- Approves each step
- Manages timeline
- Coordinates rollback if needed

---

## 📅 ESTIMATED TIMELINE

| Phase | Duration | Notes |
|-------|----------|-------|
| Preparation | 1-2 days | Backup, setup, team coordination |
| Steps 1-3 (Extraction) | 3-5 days | Key extraction and organization |
| Step 4 (Polish translation) | 1-2 days | Professional translation |
| Steps 5-6 (Toggles) | 1 day | UI components |
| Step 7 (Migration) | 3-4 days | Incremental component updates |
| Step 8 (Engine switch) | 2-3 days | Staging testing + deployment |
| Step 9-10 (Cleanup) | 1 day | After 2 weeks success |
| **TOTAL** | **12-18 days** | Plus 2 weeks monitoring |

---

## 📝 FINAL NOTES

- This migration MUST be done manually in a local development environment
- Each step must be tested before proceeding to the next
- The V2 structure is already created (via `setup_v2.js` script)
- Current placeholders need to be replaced with actual content
- Professional Polish translation is required for admin (no auto-translate)
- Lovable AI should NOT automate this migration due to high risk
- Use this document as a reference guide during manual implementation

---

**End of Migration Plan**

*For questions or clarification, refer to CORE_POLICIES.md v3*
