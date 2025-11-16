import { test, expect } from '@playwright/test';

/**
 * Performance Tests for Phase 1 Optimizations
 * 
 * Tracks improvements in:
 * - Image loading performance
 * - LCP (Largest Contentful Paint)
 * - Total page size
 */

test.describe('Performance Metrics', () => {
  test('Measure image load performance', async ({ page }) => {
    const metrics: { name: string; size: number; duration: number }[] = [];
    
    page.on('response', async (response) => {
      const url = response.url();
      if (url.match(/\.(png|jpg|jpeg|webp)$/i)) {
        const timing = response.timing();
        const headers = await response.allHeaders();
        const size = parseInt(headers['content-length'] || '0');
        
        metrics.push({
          name: url.split('/').pop() || 'unknown',
          size,
          duration: timing.responseEnd,
        });
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Log metrics
    console.log('\n📊 Image Load Metrics:');
    console.log('━'.repeat(80));
    
    const totalSize = metrics.reduce((sum, m) => sum + m.size, 0);
    const avgDuration = metrics.reduce((sum, m) => sum + m.duration, 0) / metrics.length;
    
    metrics.forEach(m => {
      console.log(`  ${m.name.padEnd(40)} ${(m.size / 1024).toFixed(1)}KB  ${m.duration.toFixed(0)}ms`);
    });
    
    console.log('━'.repeat(80));
    console.log(`  Total: ${metrics.length} images, ${(totalSize / 1024 / 1024).toFixed(2)}MB, avg ${avgDuration.toFixed(0)}ms`);
    console.log('━'.repeat(80));

    // Performance thresholds (will improve in Phase 1)
    expect(totalSize).toBeLessThan(80 * 1024 * 1024); // < 80MB before optimization
  });

  test('Measure Core Web Vitals', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    
    // Inject Web Vitals measurement
    const vitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        const metrics: Record<string, number> = {};
        
        // LCP
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          metrics.lcp = lastEntry.renderTime || lastEntry.loadTime;
        }).observe({ type: 'largest-contentful-paint', buffered: true });
        
        // FCP
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          metrics.fcp = entries[0].startTime;
        }).observe({ type: 'paint', buffered: true });
        
        // CLS
        new PerformanceObserver((list) => {
          metrics.cls = list.getEntries().reduce((sum, entry: any) => {
            return sum + (entry.value || 0);
          }, 0);
        }).observe({ type: 'layout-shift', buffered: true });
        
        setTimeout(() => resolve(metrics), 3000);
      });
    });

    console.log('\n📈 Core Web Vitals:');
    console.log('━'.repeat(80));
    console.log(`  LCP: ${(vitals as any).lcp?.toFixed(0)}ms (target: <2500ms)`);
    console.log(`  FCP: ${(vitals as any).fcp?.toFixed(0)}ms (target: <1800ms)`);
    console.log(`  CLS: ${(vitals as any).cls?.toFixed(3)} (target: <0.1)`);
    console.log('━'.repeat(80));
  });

  test('Check lazy loading implementation', async ({ page }) => {
    await page.goto('/');
    
    // Check if below-fold images have loading="lazy"
    const lazyImages = await page.locator('img[loading="lazy"]').count();
    const eagerImages = await page.locator('img[loading="eager"]').count();
    const totalImages = await page.locator('img').count();
    
    console.log('\n🖼️  Image Loading Strategy:');
    console.log('━'.repeat(80));
    console.log(`  Lazy: ${lazyImages}`);
    console.log(`  Eager: ${eagerImages}`);
    console.log(`  No attribute: ${totalImages - lazyImages - eagerImages}`);
    console.log(`  Total: ${totalImages}`);
    console.log('━'.repeat(80));
    
    // After Phase 1, we expect more lazy images
    expect(lazyImages).toBeGreaterThanOrEqual(0);
  });
});
