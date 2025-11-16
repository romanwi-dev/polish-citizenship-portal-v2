import { test, expect } from '@playwright/test';

/**
 * Visual Regression Tests for Phase 1 Optimizations
 * 
 * Purpose: Ensure image optimizations don't affect visual appearance
 * Threshold: 0.01 (1% difference allowed for anti-aliasing)
 */

test.describe('Visual Regression - Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for hero image to load
    await page.waitForLoadState('networkidle');
  });

  test('Hero section renders correctly', async ({ page }) => {
    const heroSection = page.locator('section').first();
    await expect(heroSection).toBeVisible();
    
    // Capture full hero section screenshot
    await expect(heroSection).toHaveScreenshot('hero-section.png', {
      maxDiffPixels: 100,
      threshold: 0.01,
    });
  });

  test('Hero background image loads', async ({ page }) => {
    const heroImage = page.locator('section img[alt*="Warsaw"]').first();
    await expect(heroImage).toBeVisible();
    
    // Verify image has loaded
    const isLoaded = await heroImage.evaluate((img: HTMLImageElement) => img.complete);
    expect(isLoaded).toBe(true);
  });

  test('Hero stats cards render correctly', async ({ page }) => {
    const statsGrid = page.locator('.grid.grid-cols-1.md\\:grid-cols-3').first();
    await expect(statsGrid).toBeVisible();
    
    await expect(statsGrid).toHaveScreenshot('hero-stats-cards.png', {
      maxDiffPixels: 50,
      threshold: 0.01,
    });
  });

  test('Skyline dividers render correctly', async ({ page }) => {
    // Wait for first skyline divider
    const firstDivider = page.locator('img[alt*="skyline"]').first();
    await expect(firstDivider).toBeVisible();
    
    await expect(firstDivider).toHaveScreenshot('skyline-divider.png', {
      maxDiffPixels: 100,
      threshold: 0.01,
    });
  });

  test('Full page layout (mobile)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('mobile-homepage.png', {
      fullPage: true,
      maxDiffPixels: 500,
      threshold: 0.01,
    });
  });

  test('Full page layout (tablet)', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('tablet-homepage.png', {
      fullPage: true,
      maxDiffPixels: 500,
      threshold: 0.01,
    });
  });

  test('Full page layout (desktop)', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('desktop-homepage.png', {
      fullPage: true,
      maxDiffPixels: 500,
      threshold: 0.01,
    });
  });
});

test.describe('Visual Regression - Image Quality', () => {
  test('Hero image has correct dimensions', async ({ page }) => {
    await page.goto('/');
    const heroImage = page.locator('section img[alt*="Warsaw"]').first();
    
    const dimensions = await heroImage.evaluate((img: HTMLImageElement) => ({
      width: img.naturalWidth,
      height: img.naturalHeight,
      displayWidth: img.width,
      displayHeight: img.height,
    }));
    
    // Verify image is loaded and has reasonable dimensions
    expect(dimensions.width).toBeGreaterThan(0);
    expect(dimensions.height).toBeGreaterThan(0);
  });

  test('No broken images on page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const images = page.locator('img');
    const count = await images.count();
    
    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const isLoaded = await img.evaluate((el: HTMLImageElement) => el.complete && el.naturalHeight > 0);
      const src = await img.getAttribute('src');
      
      expect(isLoaded).toBe(true);
      console.log(`✓ Image ${i + 1}/${count} loaded: ${src}`);
    }
  });
});
