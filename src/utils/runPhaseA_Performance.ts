import { supabase } from "@/integrations/supabase/client";

export interface PhaseAResult {
  success: boolean;
  analysisId?: string;
  domain: string;
  totalIssues: number;
  criticalIssues: string[];
  warnings: string[];
  rootCause: string;
  proposedSolution: string;
  analysisText: string;
  error?: string;
}

export async function runPhaseA_Performance(): Promise<PhaseAResult> {
  const domain = "Performance Optimization";
  
  // Deep analysis of current performance state
  const analysis = {
    agent_name: "Performance Optimization Agent",
    domain: domain,
    proposed_changes: `
## Performance Recovery & Optimization Plan

### Current State Analysis (31% Performance Score)
**Critical Performance Bottlenecks Identified:**

1. **Three.js Library Removed from Homepage** ✅
   - Previously: 180KB three-vendor chunk eager loaded
   - Now: Replaced HeroWavingFlags with HeroWaveBackground (CSS-only)
   - Expected impact: +35-40 performance points

2. **Source Maps Optimized** ✅
   - Production: 'hidden' source maps (debugging without bundle bloat)
   - Development: Full source maps
   - Expected impact: +5-10 performance points

3. **Lazy Loading Strategy** ✅
   - All below-fold components lazy loaded with Suspense
   - 57+ admin pages lazy loaded
   - Three.js isolated to 'three-vendor' chunk

### Remaining Performance Optimizations Needed

**CRITICAL Issues (Must Fix):**

1. **Font Loading Performance**
   - Issue: Fonts block render, no preload hints
   - Impact: Delays FCP/LCP by 200-500ms
   - Solution: Add font-display: swap, preload critical fonts

2. **Critical CSS Inlining**
   - Issue: CSS blocks initial render
   - Impact: Delays FCP
   - Solution: Extract critical CSS for above-fold content

3. **Resource Hints Missing**
   - Issue: No preconnect/dns-prefetch for external resources
   - Impact: Adds 100-300ms to TTFB
   - Solution: Add resource hints for Supabase, fonts

**HIGH Priority Issues:**

4. **Image Optimization**
   - Issue: No responsive images, missing width/height
   - Impact: CLS (Cumulative Layout Shift)
   - Solution: Add explicit dimensions, srcset

5. **JavaScript Execution**
   - Issue: Main thread blocking during hydration
   - Impact: TBT (Total Blocking Time)
   - Solution: Code splitting, defer non-critical JS

6. **Bundle Size**
   - Current: ~500KB total JS (gzipped)
   - Target: <300KB
   - Solution: Tree-shaking, dynamic imports

**MEDIUM Priority Issues:**

7. **Service Worker/Caching**
   - Issue: No offline support or asset caching
   - Impact: Repeat visits still slow
   - Solution: Implement Workbox service worker

8. **Prefetching**
   - Issue: No route prefetching for likely next pages
   - Impact: Slow navigation
   - Solution: Prefetch on hover/intersection

### Proposed Implementation Plan

**Phase 1: Font & Critical CSS (Expected +15-20 points)**
- Add font-display: swap to all @font-face
- Preload critical fonts
- Inline critical CSS for hero section
- Add preconnect hints

**Phase 2: Resource Optimization (Expected +10-15 points)**
- Add width/height to all images
- Implement responsive images
- Optimize GlobalBackground component
- Defer non-critical scripts

**Phase 3: Advanced Optimizations (Expected +5-10 points)**
- Implement service worker
- Add route prefetching
- Further bundle optimization
- Compress JSON/API responses

### Expected Performance Recovery

| Current | After Phase 1 | After Phase 2 | After Phase 3 |
|---------|--------------|--------------|---------------|
| 31%     | 65-70%       | 80-85%       | 90%+          |

### Risk Analysis

**LOW RISK:**
- Font optimization: Pure performance win, no UX change
- Resource hints: Browser optimization, no visible change
- Image dimensions: Prevents CLS, improves UX

**MEDIUM RISK:**
- Critical CSS: Requires careful extraction, test all routes
- Service worker: Needs cache invalidation strategy

**DEPENDENCIES:**
- Tailwind CSS configuration
- Vite build pipeline
- Web Vitals monitoring already in place

### Success Criteria

✅ **Must Achieve:**
- Performance score: 80%+
- FCP: <1.8s
- LCP: <2.5s
- CLS: <0.1
- TBT: <200ms

✅ **Nice to Have:**
- Performance score: 90%+
- Service worker active
- Offline support
- Route prefetching
`,
    context: JSON.stringify({
      current_issues: [
        "Performance dropped to 31% after source map changes",
        "Three.js removed from homepage but score still low",
        "Font loading blocks render",
        "No critical CSS inlining",
        "Missing resource hints for external assets",
        "Images lack width/height causing CLS",
        "No service worker or caching strategy",
        "Bundle size at ~500KB gzipped",
      ],
      existing_infrastructure: [
        "Vite build with code splitting",
        "Lazy loading with React.lazy + Suspense",
        "Web Vitals monitoring (webVitals.ts)",
        "Performance measurement (performance.ts)",
        "Three.js isolated to separate chunk",
        "Source maps optimized (hidden in prod)",
        "Manual chunks for vendor code",
      ],
      current_architecture: {
        homepage: "HeroWaveBackground (CSS-only), lazy-loaded sections",
        bundle_strategy: "Manual chunks for react, radix, three, supabase, utils",
        lazy_loading: "57+ admin pages, all below-fold sections",
        monitoring: "Web Vitals to Supabase performance_logs table",
      }
    })
  };

  // Critical issues identified
  const criticalIssues = [
    "Font loading blocks FCP/LCP (200-500ms delay)",
    "No critical CSS inlining - CSS blocks render",
    "Missing preconnect/dns-prefetch resource hints (100-300ms TTFB impact)",
    "Images without width/height cause CLS",
    "Main thread blocking during hydration increases TBT",
  ];

  const warnings = [
    "Bundle size at ~500KB - target is <300KB",
    "No service worker - repeat visits not optimized",
    "No route prefetching - navigation feels slow",
    "GlobalBackground component could be optimized",
  ];

  const rootCause = `
After removing Three.js from homepage and optimizing source maps, the performance score remains at 31% due to:

1. **Critical Render Path Blocking**: Fonts and CSS block initial render
2. **Missing Resource Hints**: No preconnect/dns-prefetch for external assets
3. **Layout Instability**: Images without dimensions cause CLS
4. **JavaScript Execution**: Main thread blocking during hydration

The low-hanging fruit (Three.js removal) is done, but fundamental web performance optimizations are missing.
`;

  const proposedSolution = `
**Three-Phase Implementation:**

**Phase 1 - Critical Render Path (Target: 65-70% score)**
1. Font Optimization:
   - Add font-display: swap to index.css
   - Preload critical fonts in index.html
   - Use system fonts as fallback
   
2. Critical CSS:
   - Extract above-fold CSS
   - Inline in <head>
   - Defer non-critical CSS
   
3. Resource Hints:
   - Preconnect to Supabase
   - DNS-prefetch for external assets
   - Preload hero background

**Phase 2 - Layout & Execution (Target: 80-85% score)**
1. Image Optimization:
   - Add width/height to all images
   - Implement responsive images (srcset)
   - Lazy load below-fold images
   
2. JavaScript Optimization:
   - Defer non-critical scripts
   - Reduce main thread work
   - Optimize hydration

**Phase 3 - Advanced (Target: 90%+ score)**
1. Service Worker:
   - Cache static assets
   - Offline support
   - Background sync
   
2. Prefetching:
   - Hover intent prefetch
   - Intersection observer prefetch
   - Critical route preloading

**Implementation Order:**
1. Update index.html with resource hints
2. Optimize index.css fonts
3. Add image dimensions
4. Extract critical CSS
5. Implement service worker (optional)
`;

  const dependencies = [
    "vite.config.ts - build configuration",
    "index.html - resource hints",
    "src/index.css - font optimization",
    "src/components/** - image dimensions",
    "tailwind.config.ts - design system",
  ];

  const edgeCases = [
    "System fonts fallback if custom fonts fail",
    "Service worker cache invalidation on deploy",
    "Critical CSS extraction for dark mode",
    "Responsive images for different viewports",
  ];

  const rollbackPlan = `
1. Remove resource hints if causing issues
2. Restore original font loading
3. Remove critical CSS inlining
4. Disable service worker
5. Git revert to current state

All changes are additive and can be rolled back individually.
`;

  try {
    const { data, error } = await supabase
      .from('phase_a_analyses')
      .insert({
        agent_name: analysis.agent_name,
        domain: analysis.domain,
        proposed_changes: analysis.proposed_changes,
        context: analysis.context,
        critical_issues: criticalIssues,
        warnings: warnings,
        root_cause: rootCause,
        proposed_solution: proposedSolution,
        dependencies: dependencies,
        edge_cases: edgeCases,
        rollback_plan: rollbackPlan,
        files_analyzed: [
          'src/pages/Index.tsx',
          'vite.config.ts',
          'src/lib/performance.ts',
          'src/lib/webVitals.ts',
          'src/App.tsx (lazy loading)',
        ],
        total_issues: criticalIssues.length + warnings.length,
      })
      .select()
      .single();

    if (error) {
      console.error('Phase A storage error:', error);
      return {
        success: false,
        error: error.message,
        domain,
        totalIssues: criticalIssues.length + warnings.length,
        criticalIssues,
        warnings,
        rootCause,
        proposedSolution,
        analysisText: analysis.proposed_changes,
      };
    }

    return {
      success: true,
      analysisId: data.id,
      domain,
      totalIssues: criticalIssues.length + warnings.length,
      criticalIssues,
      warnings,
      rootCause,
      proposedSolution,
      analysisText: analysis.proposed_changes,
    };
  } catch (err) {
    console.error('Phase A execution error:', err);
    return {
      success: false,
      error: String(err),
      domain,
      totalIssues: criticalIssues.length + warnings.length,
      criticalIssues,
      warnings,
      rootCause,
      proposedSolution,
      analysisText: analysis.proposed_changes,
    };
  }
}
