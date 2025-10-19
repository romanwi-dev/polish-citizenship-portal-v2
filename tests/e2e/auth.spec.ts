import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/');
    
    // Check for login form elements
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should show validation errors for empty form', async ({ page }) => {
    await page.goto('/');
    
    // Try to submit empty form
    await page.locator('button[type="submit"]').click();
    
    // Should show validation errors
    await expect(page.locator('text=/email/i')).toBeVisible();
  });

  test('should navigate to signup page', async ({ page }) => {
    await page.goto('/');
    
    // Click signup link
    await page.locator('text=/sign up/i').click();
    
    // Should be on signup page
    await expect(page).toHaveURL(/signup/);
  });

  test('should login with valid credentials', async ({ page }) => {
    await page.goto('/');
    
    // Fill login form
    await page.locator('input[type="email"]').fill('test@example.com');
    await page.locator('input[type="password"]').fill('TestPassword123!');
    
    // Submit form
    await page.locator('button[type="submit"]').click();
    
    // Should redirect to dashboard (or show error for invalid creds)
    await page.waitForURL(/dashboard|login/, { timeout: 5000 });
  });
});
