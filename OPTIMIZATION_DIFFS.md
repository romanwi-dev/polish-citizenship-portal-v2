# Performance Optimization Diffs

This document shows all proposed changes as diffs. Review and approve before implementation.

---

## Diff 1: Fix CLS in SkylineDivider.tsx

**File:** `src/components/SkylineDivider.tsx`

**Change:** Add width/height attributes and decoding to image to prevent CLS

```diff
      {/* Full-width skyline silhouette - theme-aware images */}
      <div className="absolute inset-0">
        <img 
          src={getSkylineImage()} 
          alt={alt} 
+         width="1920"
+         height="640"
          className="w-full h-full object-cover transition-opacity duration-500"
+         loading="lazy"
+         decoding="async"
          style={{
            filter: getSkylineFilter(),
            opacity: getSkylineOpacity(),
          }}
        />
      </div>
```

**Rationale:** 
- Prevents layout shift when image loads
- Standard skyline dimensions (1920x640) match typical aspect ratio
- `decoding="async"` improves performance

---

## Diff 2: Fix CLS in BudapestSkyline.tsx

**File:** `src/components/BudapestSkyline.tsx`

**Change:** Add width/height attributes, minHeight reservation, and decoding

```diff
const BudapestSkyline = () => {
  return (
-   <div className="relative z-10 w-full flex justify-center">
+   <div className="relative z-10 w-full flex justify-center" style={{ minHeight: '200px' }}>
      <div className="w-full md:w-[60%]">
        <img 
          src={budapestSkyline} 
          alt="Budapest skyline silhouette" 
+         width="1920"
+         height="640"
          className="w-full h-auto opacity-70 dark:opacity-40 transition-all duration-300 block dark:invert"
          loading="lazy"
+         decoding="async"
          style={{
            filter: 'var(--skyline-filter)',
          }}
        />
      </div>
    </div>
  );
};
```

**Rationale:**
- Matches WarsawSkyline pattern for consistency
- Prevents layout shift
- Improves performance with async decoding

---

## Diff 3: Fix CLS in BerlinSkyline.tsx

**File:** `src/components/BerlinSkyline.tsx`

**Change:** Add width/height attributes, minHeight reservation, and decoding

```diff
const BerlinSkyline = () => {
  return (
-   <div className="relative z-10 w-full flex justify-center">
+   <div className="relative z-10 w-full flex justify-center" style={{ minHeight: '200px' }}>
      <div className="w-full md:w-[60%]">
        <img 
          src={berlinSkyline} 
          alt="Berlin skyline silhouette" 
+         width="1920"
+         height="640"
          className="w-full h-auto opacity-70 dark:opacity-40 transition-all duration-300 block dark:invert"
          loading="lazy"
+         decoding="async"
          style={{
            filter: 'var(--skyline-filter)',
          }}
        />
      </div>
    </div>
  );
};
```

**Rationale:**
- Matches WarsawSkyline pattern for consistency
- Prevents layout shift
- Improves performance with async decoding

---

## Diff 4: Fix CLS in ContactFormWeb3.tsx

**File:** `src/components/ContactFormWeb3.tsx`

**Change:** Add width/height attributes and decoding to thankYou1 image

```diff
                  {/* Left Side - Image */}
                  <div className="w-full md:w-1/2 h-1/2 md:h-full relative">
                    <img 
                      src={thankYou1} 
                      alt="Professional with passport" 
+                     width="800"
+                     height="600"
                      className="w-full h-full object-cover rounded-lg"
+                     loading="lazy"
+                     decoding="async"
                    />
                  </div>
```

**Rationale:**
- Prevents layout shift when thank you image loads
- Standard 4:3 aspect ratio (800x600)
- Lazy loading since it's below the fold (in success state)

---

## Diff 5: Remove Unused Imports from Index.tsx

**File:** `src/pages/Index.tsx`

**Change:** Remove unused BudapestSkyline and BerlinSkyline imports

```diff
// Eagerly load critical above-the-fold components for LCP
import Navigation from "@/components/Navigation";
import { HeroWavingFlags } from "@/components/heroes/premium/HeroWavingFlags";
import { WarsawSkyline } from "@/components/WarsawSkyline";

import AboutSection from "@/components/AboutSection";

// Lazy load below-the-fold components for better code splitting and LCP optimization
- const BudapestSkyline = lazy(() => import("@/components/BudapestSkyline"));
- const BerlinSkyline = lazy(() => import("@/components/BerlinSkyline"));
const ServicesWeb3 = lazy(() => import("@/components/ServicesWeb3"));
```

**Rationale:**
- Reduces bundle size
- Removes unused code
- Improves build performance

---

## Diff 6: Add Memoization to WarsawSkyline.tsx

**File:** `src/components/WarsawSkyline.tsx`

**Change:** Wrap component with React.memo to prevent unnecessary re-renders

```diff
- import warsawSkyline from "@/assets/warsaw-skyline.png";
+ import { memo } from "react";
+ import warsawSkyline from "@/assets/warsaw-skyline.png";

- export const WarsawSkyline = () => {
+ export const WarsawSkyline = memo(() => {
    return (
      // CLS FIX: Container with explicit aspect ratio to prevent layout shift
      <div className="relative z-10 w-full flex justify-center" style={{ minHeight: '200px' }}>
        <div className="w-full md:w-[60%]">
          <img 
            src={warsawSkyline} 
            alt="Warsaw skyline silhouette"
            // CLS FIX: Added explicit dimensions to prevent layout shift
            width="1920"
            height="640"
            className="w-full h-auto opacity-70 dark:opacity-40 transition-all duration-300 block dark:invert"
            style={{
              filter: 'var(--skyline-filter)',
            }}
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>
    );
- };
+ });
```

**Rationale:**
- Prevents unnecessary re-renders when parent re-renders
- Improves performance, especially when Index component re-renders
- Component has no props, so memoization is safe

---

## Summary of Changes

### Files Modified: 6
1. `src/components/SkylineDivider.tsx` - CLS fix
2. `src/components/BudapestSkyline.tsx` - CLS fix
3. `src/components/BerlinSkyline.tsx` - CLS fix
4. `src/components/ContactFormWeb3.tsx` - CLS fix
5. `src/pages/Index.tsx` - Remove unused imports
6. `src/components/WarsawSkyline.tsx` - Memoization

### Impact:
- ✅ CLS improvements (4 images fixed)
- ✅ Bundle size reduction (~2-5KB from unused imports)
- ✅ Performance improvement (memoization)
- ✅ No breaking changes
- ✅ No design changes
- ✅ No routing changes
- ✅ No i18n changes

### Testing Required:
- [ ] Verify images load correctly
- [ ] Check Lighthouse CLS score
- [ ] Test on mobile devices
- [ ] Verify no console errors
- [ ] Check bundle size

---

## Approval Status

**Status:** ⏳ Pending Approval

**Ready to apply?** Review the diffs above and approve to proceed with implementation.
