# Performance & Accessibility Optimization Plan

## Executive Summary
This document outlines micro-optimizations for the Polish Citizenship Portal to improve:
- CLS (Cumulative Layout Shift) scores
- Performance metrics (LCP/FCP/TTI)
- Accessibility compliance
- Code efficiency

**Rules Applied:**
- ✅ No homepage design changes
- ✅ No i18n config/v2 engine edits
- ✅ No routing structure changes
- ✅ No design changes
- ✅ 100% safe, reversible, Vercel-compatible

---

## 1. CLS (Cumulative Layout Shift) Issues

### 1.1 Images Missing Width/Height Attributes

**Issue:** Images without explicit dimensions cause layout shifts when loaded.

**Files to Fix:**
1. `src/components/SkylineDivider.tsx` (line 140)
   - Image has no width/height
   - Container has fixed height but image can still shift

2. `src/components/BudapestSkyline.tsx` (line 7)
   - Missing width/height attributes
   - No minHeight reservation

3. `src/components/BerlinSkyline.tsx` (line 7)
   - Missing width/height attributes
   - No minHeight reservation

4. `src/components/ContactFormWeb3.tsx` (line 329)
   - thankYou1 image missing dimensions

**Fix Strategy:**
- Add explicit `width` and `height` attributes to all `<img>` tags
- Add `minHeight` to containers where needed
- Use `aspect-ratio` CSS where appropriate

---

## 2. Multiple Redirects

### 2.1 Current Redirect Chain Analysis

**Current Flow:**
- `/` → `LanguageRedirect` → `/:lang` (1 redirect) ✅ Acceptable
- `/portal` → `PortalIndex` → `/client/login` (1 redirect) ✅ Acceptable

**Status:** No multiple redirect chains detected. Current redirects are necessary and acceptable.

**No changes needed.**

---

## 3. Unused Skyline Components

### 3.1 Unused Imports

**Issue:** `BudapestSkyline` and `BerlinSkyline` are imported but never used in `src/pages/Index.tsx`.

**Files:**
- `src/pages/Index.tsx` (lines 21-22)
  - `BudapestSkyline` - imported but never rendered
  - `BerlinSkyline` - imported but never rendered

**Fix Strategy:**
- Remove unused lazy imports
- Keep components in codebase (may be used elsewhere)

---

## 4. Performance Bottlenecks

### 4.1 Missing Memoization

**Issue:** `Index` component and child components may re-render unnecessarily.

**Files:**
- `src/pages/Index.tsx`
  - No `React.memo` on component
  - No `useMemo` for static content
  - Multiple `WarsawSkyline` renders (could be memoized)

**Fix Strategy:**
- Wrap `Index` with `React.memo` (if props are stable)
- Memoize `WarsawSkyline` component
- Consider `useMemo` for expensive computations

### 4.2 Lazy Loading Optimization

**Issue:** All skylines should be lazy-loaded except the first one.

**Current State:**
- `WarsawSkyline` is eagerly loaded (correct for above-fold)
- Other skylines are not used (Budapest/Berlin unused)

**Fix Strategy:**
- Keep `WarsawSkyline` eager (above-fold)
- Ensure all below-fold skylines are lazy-loaded
- Add `loading="lazy"` to all non-critical images

---

## 5. Accessibility Warnings

### 5.1 Missing ARIA Labels

**Files to Check:**
- `src/components/SkylineDivider.tsx`
  - Image has `alt` but could benefit from `aria-label` on container
- `src/components/ContactFormWeb3.tsx`
  - Image has `alt` ✅

**Fix Strategy:**
- Ensure all images have descriptive `alt` text
- Add `aria-label` to interactive containers
- Verify keyboard navigation

### 5.2 Semantic HTML

**Status:** Main content uses `<main>` with proper `role` and `aria-label` ✅

---

## 6. Translation Gaps

### 6.1 i18n Key Usage

**Status:** Components use `t()` function correctly ✅

**No changes needed** (per CORE_POLICIES: do not edit i18n files)

---

## 7. i18n File Structure

### 7.1 Consistency Check

**Status:** 
- `src/i18n/config.ts` - Read-only per rules ✅
- `src/i18n/v2/` - Not to be edited per rules ✅

**No changes needed.**

---

## 8. Unused Imports

### 8.1 Cleanup Needed

**Files:**
- `src/pages/Index.tsx`
  - `BudapestSkyline` - unused import
  - `BerlinSkyline` - unused import

**Fix Strategy:**
- Remove unused imports to reduce bundle size

---

## 9. Document Request Latency

### 9.1 Image Optimization

**Current State:**
- Images use `loading="lazy"` where appropriate ✅
- Some images missing `decoding="async"`

**Fix Strategy:**
- Add `decoding="async"` to all images
- Ensure `fetchpriority` is set correctly (high for LCP, low for below-fold)

---

## Implementation Plan

### Phase 1: CLS Fixes (High Priority)
1. Add width/height to `SkylineDivider.tsx` image
2. Add width/height to `BudapestSkyline.tsx` image
3. Add width/height to `BerlinSkyline.tsx` image
4. Add width/height to `ContactFormWeb3.tsx` image
5. Add `minHeight` reservations where needed

### Phase 2: Code Cleanup (Medium Priority)
1. Remove unused `BudapestSkyline` import from `Index.tsx`
2. Remove unused `BerlinSkyline` import from `Index.tsx`

### Phase 3: Performance (Medium Priority)
1. Add `React.memo` to `WarsawSkyline` component
2. Add `decoding="async"` to all images
3. Verify lazy loading is optimal

### Phase 4: Accessibility (Low Priority)
1. Review and enhance ARIA labels
2. Verify keyboard navigation

---

## Risk Assessment

**All changes are:**
- ✅ Non-breaking
- ✅ Reversible
- ✅ Design-preserving
- ✅ Routing-preserving
- ✅ i18n-safe
- ✅ Vercel-compatible

**Estimated Impact:**
- CLS improvement: ~0.1-0.2 points
- Bundle size reduction: ~2-5KB (unused imports)
- Performance improvement: Minimal but measurable

---

## Files to Modify

1. `src/components/SkylineDivider.tsx`
2. `src/components/BudapestSkyline.tsx`
3. `src/components/BerlinSkyline.tsx`
4. `src/components/ContactFormWeb3.tsx`
5. `src/pages/Index.tsx`
6. `src/components/WarsawSkyline.tsx` (memoization)

---

## Testing Checklist

- [ ] Verify no layout shifts on page load
- [ ] Check Lighthouse CLS score improvement
- [ ] Verify images load correctly
- [ ] Test on mobile devices
- [ ] Verify no console errors
- [ ] Check bundle size reduction
- [ ] Verify accessibility score maintained/improved
