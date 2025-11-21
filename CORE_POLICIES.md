# 🦅 POLISH CITIZENSHIP PORTAL – CORE PROJECT POLICIES (v3)

## 1. ARCHITECTURAL SEPARATION
- Homepage `/` = Marketing site only.
- Portal `/portal` = Client-facing application.
- Admin `/admin` (or equivalent) = Internal operations, not client-visible.
- Shared code is limited to:
  - UI primitives: buttons, inputs, layout, modals.
  - Generic hooks (auth, theme).
- Business logic for each area (homepage, client portal, admin) MUST stay separated.

## 2. I18N / TRANSLATION POLICY (VERY IMPORTANT)
- DO NOT directly edit `src/i18n` files in Lovable editor if they are large.
- All structural changes to i18n must go through helper scripts (Node scripts) or very small, targeted edits.

### 2.1 ZONES & LANGUAGES
**ADMIN PORTAL (backend UI)**
- Languages: EN + PL ONLY.
- Purpose: internal operations.
- Admin namespace: `admin` (en, pl).
- No other languages for admin.

**HOMEPAGE `/` (Marketing)**
- Namespace: `landing`.
- Languages: EN, ES, PT, FR, DE, HE, RU, UK (and any others we already support).
- EXPLICITLY NO Polish for the homepage.
- Homepage must always load with `landing` namespace.

**CLIENT PORTAL `/portal`**
- Namespace: `portal`.
- Languages: same as homepage (EN, ES, PT, FR, DE, HE, RU, UK, …) but WITHOUT Polish.
- Client portal DOES NOT support Polish UI.
- Client portal MUST have a language toggle icon / control inside the logged-in account area.

### 2.2 NAMESPACES
- `landing` → homepage content only.
- `portal` → client portal content only.
- `admin` → admin/backoffice content only.
- Never mix keys between namespaces.

### 2.3 FILE STRUCTURE (v2 Engine)
- All V2 translations live in: `src/i18n/v2/locales/[lang]/[namespace].ts`.
- Example:
  - `src/i18n/v2/locales/en/landing.ts`
  - `src/i18n/v2/locales/en/portal.ts`
  - `src/i18n/v2/locales/en/admin.ts`
  - `src/i18n/v2/locales/pl/admin.ts` (only for admin)

## 3. AI INTERACTION RULES
- READ-FIRST: Any AI (Lovable, Gemini, ChatGPT) must conceptually read this file before proposing architecture changes.
- MULTI-PATH STRATEGY:
  - If a file is >300 lines or 6k characters → DO NOT open and rewrite it directly.
  - Prefer:
    - (a) writing a small Node script to transform data, or
    - (b) suggesting small, exact patches instead of full rewrites.
- PRESERVATION:
  - Legacy English content is considered canonical. NEVER summarize or "shorten" legal/marketing English content.
  - When in doubt, mark `TODO` and DO NOT GUESS the language content.

## 4. SECURITY & PRIVACY
- Supabase:
  - All tables with personal data MUST have Row Level Security (RLS) enabled.
  - Access is via security-definer functions or policies.
- Logging:
  - Passport numbers, PESEL, and other identifiers MUST be masked or partially redacted in logs.
- Documents:
  - Client documents are stored only as long as needed for case processing.
  - Implement (or keep in roadmap) "Right to Forget" deletion workflows.

## 5. ZERO-FLAME POLICY
- No automated refactors of:
  - `src/i18n/**`
  - `supabase/migrations/**`
  - `supabase/functions/**`
- Changes to these areas MUST be small, deliberate, and reversible.
