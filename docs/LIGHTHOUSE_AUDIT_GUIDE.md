# 🚀 Lighthouse Performance Audit Guide

## Quick Start

### Chrome DevTools Method (Recommended)

1. **Open DevTools**
   - Press `F12` or `Ctrl+Shift+I` (Windows/Linux)
   - Press `Cmd+Option+I` (Mac)

2. **Navigate to Lighthouse Tab**
   - Click "Lighthouse" in the top menu
   - If not visible, click ">>" and select "Lighthouse"

3. **Configure Audit**
   - ✅ Performance
   - ✅ Accessibility
   - ✅ Best Practices
   - ✅ SEO
   - Device: Desktop AND Mobile
   - Categories: All

4. **Run Audit**
   - Click "Analyze page load"
   - Wait 30-60 seconds
   - Review results

---

## Pages to Audit

### Critical Pages (Priority 1)
1. **Homepage** - `/`
2. **Admin Dashboard** - `/admin/dashboard`
3. **Intake Form** - `/client-intake`

### Important Pages (Priority 2)
4. **POA Form** - `/admin/cases/[test-id]/poa`
5. **Family Tree** - `/admin/cases/[test-id]/family-tree`
6. **Citizenship Form** - `/admin/cases/[test-id]/citizenship`

### Secondary Pages (Priority 3)
7. **Documents** - `/admin/cases/[test-id]/documents`
8. **Case Review** - `/admin/cases/[test-id]/review`
9. **Settings** - `/admin/settings`

---

## Target Scores

### Desktop Targets
| Metric | Good | Acceptable | Poor |
|--------|------|------------|------|
| Performance | 90-100 | 50-89 | 0-49 |
| Accessibility | 90-100 | 50-89 | 0-49 |
| Best Practices | 90-100 | 50-89 | 0-49 |
| SEO | 90-100 | 50-89 | 0-49 |

### Mobile Targets (More Strict)
| Metric | Good | Acceptable | Poor |
|--------|------|------------|------|
| Performance | 80-100 | 50-79 | 0-49 |
| Accessibility | 90-100 | 50-89 | 0-49 |
| Best Practices | 90-100 | 50-89 | 0-49 |
| SEO | 90-100 | 50-89 | 0-49 |

---

## Core Web Vitals (Most Important)

### FCP (First Contentful Paint)
- **Good:** < 1.8s
- **Needs Improvement:** 1.8s - 3.0s
- **Poor:** > 3.0s

**What it measures:** Time until first text/image appears

### LCP (Largest Contentful Paint)
- **Good:** < 2.5s
- **Needs Improvement:** 2.5s - 4.0s
- **Poor:** > 4.0s

**What it measures:** Time until main content is visible

### CLS (Cumulative Layout Shift)
- **Good:** < 0.1
- **Needs Improvement:** 0.1 - 0.25
- **Poor:** > 0.25

**What it measures:** Visual stability (no sudden jumps)

### INP (Interaction to Next Paint)
- **Good:** < 200ms
- **Needs Improvement:** 200ms - 500ms
- **Poor:** > 500ms

**What it measures:** Responsiveness to user interactions

### TTFB (Time to First Byte)
- **Good:** < 600ms
- **Needs Improvement:** 600ms - 1800ms
- **Poor:** > 1800ms

**What it measures:** Server response time

---

## Common Issues & Fixes

### 🔴 Poor Performance Score

**Issue:** Images not optimized
- **Fix:** Compress images, use WebP format, add responsive srcsets

**Issue:** JavaScript bundle too large
- **Fix:** Already implemented! Code splitting via vite.config.ts

**Issue:** Unused CSS
- **Fix:** Tailwind purge configured, no action needed

**Issue:** Third-party scripts blocking
- **Fix:** Defer non-critical scripts

### 🟡 CLS Issues

**Issue:** Images without dimensions
- **Fix:** Add explicit `width` and `height` attributes

**Issue:** Dynamic content insertion
- **Fix:** Reserve space with min-height or skeleton loaders

### 🟢 Accessibility Issues

**Issue:** Missing alt text
- **Fix:** Add descriptive alt attributes to all images

**Issue:** Color contrast
- **Fix:** Use design system semantic tokens (already implemented)

---

## Recording Results

### Template for PERFORMANCE_BENCHMARKS.md

```markdown
## Lighthouse Scores - [DATE]

### Homepage (/)
**Desktop:**
- Performance: XX/100
- Accessibility: XX/100
- Best Practices: XX/100
- SEO: XX/100

**Core Web Vitals:**
- FCP: XXXms
- LCP: XXXms
- CLS: 0.XXX
- INP: XXms
- TTFB: XXms

**Mobile:**
- Performance: XX/100
- Accessibility: XX/100
- Best Practices: XX/100
- SEO: XX/100

**Core Web Vitals:**
- FCP: XXXms
- LCP: XXXms
- CLS: 0.XXX
- INP: XXms
- TTFB: XXms
```

---

## Automated Testing (Advanced)

### Lighthouse CI

```bash
# Install
npm install -g @lhci/cli

# Run audit
lhci autorun --collect.url=https://your-app.lovable.app

# Compare results
lhci upload --target=temporary-public-storage
```

### WebPageTest Integration

1. Visit https://www.webpagetest.org/
2. Enter production URL
3. Select "Dulles, VA" location
4. Run test on Desktop + Mobile
5. Compare with Lighthouse

---

## Monitoring Dashboard Integration

### Query Performance Logs

```sql
-- Average metrics by page (last 7 days)
SELECT 
  page,
  metric_type,
  ROUND(AVG(value)) as avg_value,
  COUNT(*) as samples
FROM performance_logs
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY page, metric_type
ORDER BY page, metric_type;

-- P95 latency (95th percentile)
SELECT 
  metric_type,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY value) as p95
FROM performance_logs
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY metric_type;

-- Performance trends (daily)
SELECT 
  DATE(created_at) as date,
  metric_type,
  ROUND(AVG(value)) as avg_value
FROM performance_logs
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at), metric_type
ORDER BY date DESC, metric_type;
```

---

## Success Criteria

### Deployment Gate
Before deploying to production:
- ✅ Homepage Performance > 85 (Desktop)
- ✅ Homepage Performance > 75 (Mobile)
- ✅ All FCP < 2.0s
- ✅ All LCP < 3.0s
- ✅ All CLS < 0.15
- ✅ Zero console errors in production

### Post-Deploy Validation
After deploying:
- ✅ Run Lighthouse on production URL
- ✅ Check performance_logs table has data
- ✅ Verify no performance regressions vs staging
- ✅ Test on 3G throttled connection

---

## Troubleshooting

### Lighthouse Fails to Run
- Disable browser extensions
- Use incognito mode
- Clear cache and hard reload
- Check for console errors

### Inconsistent Scores
- Run 3-5 times and average
- Use same network conditions
- Close other apps/tabs
- Test at same time of day

### Mobile Score Much Lower
- Expected! Mobile has stricter thresholds
- Focus on FCP and LCP first
- Test on real device if possible
- Consider 3G throttling

---

## Resources

- [Web Vitals Documentation](https://web.dev/vitals/)
- [Lighthouse Scoring Guide](https://web.dev/performance-scoring/)
- [Chrome DevTools Docs](https://developer.chrome.com/docs/devtools/)
- [WebPageTest](https://www.webpagetest.org/)

---

**Next Steps:**
1. Run baseline Lighthouse audit on all critical pages
2. Record results in PERFORMANCE_BENCHMARKS.md
3. Set up weekly monitoring routine
4. Address any scores below targets
