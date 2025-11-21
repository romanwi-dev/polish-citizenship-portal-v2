# 🦅 POLISH CITIZENSHIP PORTAL - PROJECT MANIFESTO

## 1. ARCHITECTURAL SEPARATION
* **Marketing (`/`)**: Public homepage and marketing site ONLY.
* **Portal (`/portal`)**: Logged-in app, dashboards, cases, documents.
* **Shared Logic**: Only generic UI components (Buttons, Inputs, Icons) can be shared. No business logic shared between homepage and portal.

## 2. I18N (TRANSLATION) PROTOCOL
* **Fragile Zone**: `src/i18n/**` MUST NOT be edited by AI/Lovable.
* **Homepage**: Keep all text translatable, but do NOT touch i18n engine/config.
* **Portal**: Same rule — use `t()` in components, but NEVER edit `src/i18n/**`.
* **New Keys**: You may wrap strings with `t('some.key', 'English fallback')` but do NOT create or edit translation resource files. Roman will manage them manually.

## 3. AI INTERACTION RULES
* **Read-First**: Always read this file before proposing architectural changes.
* **Multi-Path**: For large/critical files, prefer small, safe edits over refactors.
* **Preservation**: Existing English content and layouts are SACRED. Never summarize, compress, or "simplify" them.

## 4. SECURITY & PRIVACY
* **RLS**: Row Level Security must remain enabled on all client-data tables in the DB.
* **Passport & ID Numbers**: Must be masked or partially redacted in logs and debug output.
