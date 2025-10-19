# Performance Benchmarks

## Overview
This document tracks performance metrics for the Polish Citizenship Portal AI Agent system.

**Last Updated:** 2025-10-19  
**Testing Tool:** Google Lighthouse  
**Network:** Fast 3G throttling  
**Devices:** Desktop (1920x1080), Mobile (iPhone 12, Pixel 5)

---

## 🎯 Target Metrics

| Metric | Target | Description |
|--------|--------|-------------|
| Performance Score | ≥ 80 | Overall performance rating |
| First Contentful Paint (FCP) | < 1.8s | Time to first content render |
| Largest Contentful Paint (LCP) | < 2.5s | Time to main content render |
| Total Blocking Time (TBT) | < 200ms | Time page is blocked from user input |
| Cumulative Layout Shift (CLS) | < 0.1 | Visual stability score |
| Speed Index | < 3.4s | How quickly content is visually displayed |
| Time to Interactive (TTI) | < 3.8s | Time until page is fully interactive |

---

## 📊 Current Benchmarks

### Homepage (`/`)
**Desktop:**
- Performance: `__/100` ⏳ Pending test
- FCP: `__s`
- LCP: `__s`
- TBT: `__ms`
- CLS: `__`
- Speed Index: `__s`
- TTI: `__s`

**Mobile:**
- Performance: `__/100` ⏳ Pending test
- FCP: `__s`
- LCP: `__s`
- TBT: `__ms`
- CLS: `__`
- Speed Index: `__s`
- TTI: `__s`

---

### Admin Dashboard (`/admin/dashboard`)
**Desktop:**
- Performance: `__/100` ⏳ Pending test
- FCP: `__s`
- LCP: `__s`
- TBT: `__ms`
- CLS: `__`
- Speed Index: `__s`
- TTI: `__s`

**Mobile:**
- Performance: `__/100` ⏳ Pending test
- FCP: `__s`
- LCP: `__s`
- TBT: `__ms`
- CLS: `__`
- Speed Index: `__s`
- TTI: `__s`

---

### Intake Form (`/client-intake`)
**Desktop:**
- Performance: `__/100` ⏳ Pending test
- FCP: `__s`
- LCP: `__s`
- TBT: `__ms`
- CLS: `__`
- Speed Index: `__s`
- TTI: `__s`

**Mobile:**
- Performance: `__/100` ⏳ Pending test
- FCP: `__s`
- LCP: `__s`
- TBT: `__ms`
- CLS: `__`
- Speed Index: `__s`
- TTI: `__s`

---

### POA Form (`/admin/cases/[id]/poa`)
**Desktop:**
- Performance: `__/100` ⏳ Pending test
- FCP: `__s`
- LCP: `__s`
- TBT: `__ms`
- CLS: `__`
- Speed Index: `__s`
- TTI: `__s`

**Mobile:**
- Performance: `__/100` ⏳ Pending test
- FCP: `__s`
- LCP: `__s`
- TBT: `__ms`
- CLS: `__`
- Speed Index: `__s`
- TTI: `__s`

---

### Family Tree (`/admin/cases/[id]/family-tree`)
**Desktop:**
- Performance: `__/100` ⏳ Pending test
- FCP: `__s`
- LCP: `__s`
- TBT: `__ms`
- CLS: `__`
- Speed Index: `__s`
- TTI: `__s`

**Mobile:**
- Performance: `__/100` ⏳ Pending test
- FCP: `__s`
- LCP: `__s`
- TBT: `__ms`
- CLS: `__`
- Speed Index: `__s`
- TTI: `__s`

**Notes:**
- 3D visualization uses React Three Fiber
- Lazy loaded on scroll into view
- Canvas rendering may impact TBT/TTI

---

## 🧪 How to Run Benchmarks

### Using Google Lighthouse (Chrome DevTools)

1. Open Chrome DevTools (F12)
2. Navigate to **Lighthouse** tab
3. Configure settings:
   - ✅ Performance
   - ✅ Best Practices
   - Device: Desktop or Mobile
   - Throttling: Simulated 3G
4. Click **Analyze page load**
5. Wait for report generation
6. Copy metrics to this document

### Using Lighthouse CLI

```bash
# Install Lighthouse
npm install -g lighthouse

# Run desktop audit
lighthouse https://yoursite.com --output=html --output-path=./lighthouse-desktop.html --preset=desktop

# Run mobile audit
lighthouse https://yoursite.com --output=html --output-path=./lighthouse-mobile.html --preset=mobile --throttling.cpuSlowdownMultiplier=4
```

### Using WebPageTest

1. Visit https://www.webpagetest.org/
2. Enter URL
3. Select location: US East Coast
4. Device: Chrome on 3G
5. Run test
6. Compare with Lighthouse results

---

## 🚀 Optimization Strategies

### Current Optimizations ✅
- Code splitting by route
- Lazy loading for 3D components (Family Tree)
- WebP images with fallbacks
- PDF caching for generated documents
- Debounced auto-save (30s)
- React Query for data caching
- Vite build optimization

### Potential Improvements 🔧
- Image compression (use `sharp` or `imagemin`)
- Service Worker for offline support
- Pre-load critical fonts
- Reduce JavaScript bundle size
- Implement virtual scrolling for large lists
- Optimize 3D scene complexity (reduce polygons)
- Use `react-window` for long form sections

---

## 📈 Performance Trends

| Date | Page | Device | Score | Notes |
|------|------|--------|-------|-------|
| 2025-10-19 | - | - | - | Initial benchmark setup |
| - | - | - | - | ⏳ Awaiting first test run |

---

## 🔍 Network Performance

### 3G Testing (Throttled)
- **Download:** 1.6 Mbps
- **Upload:** 0.75 Mbps
- **RTT:** 150ms

**Key Pages to Test:**
- [ ] Homepage load time
- [ ] Admin dashboard with 50+ cases
- [ ] Intake form with auto-save
- [ ] PDF generation time
- [ ] 3D family tree initialization

---

## 🎨 Rendering Performance

### Layout Shift Sources
- Dynamic form validation messages
- Auto-save indicators
- Toast notifications
- 3D canvas initialization

**Mitigation:**
- Reserve space for validation messages
- Fixed positioning for indicators
- Toast container with fixed height
- Canvas placeholder with skeleton

---

## 🧩 Bundle Size Analysis

```bash
# Run build with stats
npm run build -- --analyze

# Key bundles to monitor:
# - React + React DOM: ~140KB gzipped
# - React Three Fiber: ~50KB gzipped
# - PDF-lib: ~200KB gzipped
# - Supabase client: ~30KB gzipped
```

**Bundle Targets:**
- Initial bundle: < 300KB gzipped
- Async chunks: < 100KB each
- Total load: < 1MB

---

## ✅ Success Criteria

- [x] Benchmark framework established
- [ ] All 5 key pages tested on desktop
- [ ] All 5 key pages tested on mobile
- [ ] Performance score ≥ 80 on all pages
- [ ] LCP < 2.5s on all pages
- [ ] CLS < 0.1 on all pages
- [ ] 3G network testing complete
- [ ] Optimization recommendations documented

---

**Status:** ⏳ Framework ready | Tests pending execution
