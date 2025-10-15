# DBGK - Double Background Guard Kill

**Code Name: DBGK**  
**Priority: CRITICAL**  
**Category: UI/UX Architecture**

---

## 🚫 THE RULE

**NEVER ADD DUPLICATE BACKGROUNDS**

The application uses a **unified background system** where layout wrappers provide the primary background. Child components must NEVER add their own section-wide backgrounds.

---

## 🏗️ BACKGROUND ARCHITECTURE

### ✅ Layout Level (ONLY PLACE FOR BACKGROUNDS)
**Files:** `AdminLayout.tsx`, `ClientLayout.tsx`, custom layout wrappers

```tsx
// ✅ CORRECT - Layout provides unified background
export function AdminLayout({ children }) {
  return (
    <div className="min-h-screen flex w-full relative">
      {/* UNIFIED BACKGROUND - ONLY HERE */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute top-20 left-20 w-96 h-96 bg-primary/20 rounded-full blur-[150px]" />
      </div>
      
      <Sidebar />
      <main className="flex-1 overflow-auto relative z-10">
        {children}
      </main>
    </div>
  );
}
```

### ❌ Page Level (NO BACKGROUNDS)
**Files:** All pages in `/pages/admin/*`, `/pages/*`

```tsx
// ✅ CORRECT - Clean page, no backgrounds
export function TranslationDashboard() {
  return (
    <div className="space-y-6 p-6">
      {/* Content only - background inherited from layout */}
      <h1>Translations</h1>
      <Card>...</Card>
    </div>
  );
}

// ❌ WRONG - Adding duplicate background
export function TranslationDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/10">
      {/* NEVER DO THIS */}
    </div>
  );
}
```

### ⚠️ Component Level (LIMITED BACKGROUNDS)
**Files:** All components in `/components/*`

**Allowed:**
- ✅ Individual card styling (`glass-card`, `hover-glow` classes)
- ✅ Small UI element backgrounds (badges, buttons, chips)
- ✅ Localized decorative effects within component boundaries

**Forbidden:**
- ❌ Section-wide background overlays
- ❌ Full-height/full-width background gradients
- ❌ Absolute positioned backgrounds that cover entire component

---

## 🚨 FORBIDDEN PATTERNS

```tsx
// ❌ NEVER use these in pages/sections:
<div className="absolute inset-0 bg-gradient-to-b from-background to-primary/10" />
<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))]" />
<section className="bg-gradient-to-br from-background via-background/95 to-primary/5" />
<div className="min-h-screen bg-gradient-to-t from-primary/5 via-background to-background" />

// ❌ NEVER use backdrop patterns:
<div className="absolute inset-0 bg-[linear-gradient(...)]" />
<div className="absolute inset-0 bg-[radial-gradient(...)]" />
```

---

## ✅ CORRECT PATTERNS

### Layout Design Files (Special Exception)
**Files:** `/components/navigation/designs/*Design.tsx`

These are **wrapper components** that provide design themes for the navigation system. They are ALLOWED to have backgrounds because they function as layout-level components.

```tsx
// ✅ ALLOWED - Design wrapper (layout-level)
export const GlassmorphicDesign = ({ children }) => {
  return (
    <motion.div className="h-full w-full relative overflow-hidden">
      {/* Footer-matching background - ALLOWED here */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-primary/5 to-background" />
      <div className="relative h-full">{children}</div>
    </motion.div>
  );
};
```

### Card Components
```tsx
// ✅ CORRECT - Using design system classes
<Card className="glass-card hover-glow">
  <CardHeader>...</CardHeader>
</Card>

// ❌ WRONG - Custom background overlay
<Card className="relative">
  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-background" />
  <CardHeader>...</CardHeader>
</Card>
```

---

## 🔍 AUDIT CHECKLIST

When reviewing code, check:

1. ⬜ Does the component have `absolute inset-0 bg-gradient-*`?
2. ⬜ Does the component have section-wide `bg-gradient-*` classes?
3. ⬜ Is this component a layout wrapper or page/section?
4. ⬜ Are backgrounds limited to individual cards/UI elements?
5. ⬜ Is the component inside `/pages/` or `/components/`?

**If answers to 1-2 are YES and 3 is "page/section"** → **VIOLATION**

---

## 📦 FILES FIXED (January 2025)

### Client Pages
- ✅ `ClientDashboard.tsx`
- ✅ `ClientIntakeWizard.tsx`
- ✅ `ClientLogin.tsx`
- ✅ `CitizenshipFieldReview.tsx`

### Website Sections
- ✅ `AboutSection.tsx`
- ✅ `AIAnalysisSection.tsx`
- ✅ `ClientOnboardingSection.tsx`
- ✅ `ContactFormWeb3.tsx`
- ✅ `FAQSection.tsx`
- ✅ `HeroWeb3.tsx`
- ✅ `PricingSection.tsx`
- ✅ `ProcessWeb3.tsx`
- ✅ `ServicesWeb3.tsx`
- ✅ `TimelineProcessEnhanced.tsx`

### Admin Form Demos
- ✅ `CitizenshipFormDemo.tsx`
- ✅ `CivilRegistryFormDemo.tsx`
- ✅ `FamilyHistoryDemo.tsx`
- ✅ `FamilyTreeDemo.tsx`
- ✅ `IntakeFormDemo.tsx`
- ✅ `POAFormDemo.tsx`

### Translation Components
- ✅ `DocumentRequirementsList.tsx`
- ✅ `SwornTranslatorsList.tsx`
- ✅ `TranslationAgenciesList.tsx`
- ✅ `TranslationDashboard.tsx`
- ✅ `TranslationWorkflowCards.tsx`

**Total violations fixed:** 26+

---

## 🎯 ENFORCEMENT

**For Future Development:**

1. Before creating any new page/section component:
   - ✅ Verify layout provides background
   - ✅ Keep component clean of section-wide backgrounds
   - ✅ Use design system tokens for card-level styling

2. Code review checklist:
   - Search for `absolute inset-0 bg-` in non-layout files
   - Flag any section-level gradient backgrounds
   - Verify unified background in layout wrapper

3. Testing:
   - Visual inspection: Should see ONE consistent background
   - No layering artifacts or doubled effects
   - Smooth transitions between sections

---

## 📚 RELATED DOCUMENTATION

- Design System: `/docs/DESIGN_SYSTEM.md`
- Layout Architecture: `/ARCHITECTURE.md`
- Component Guidelines: `/docs/COMPONENT_GUIDELINES.md`

---

**Last Updated:** January 2025  
**Status:** ✅ Active & Enforced  
**Violations Remaining:** 0
