import { test, expect } from '@playwright/test';

test.describe('Intake Form', () => {
  test.beforeEach(async ({ page }) => {
    // TODO: Add authentication setup
    await page.goto('/client-intake');
  });

  test('should load intake form', async ({ page }) => {
    await expect(page.locator('text=/personal information/i')).toBeVisible();
  });

  test('should auto-save after 30 seconds', async ({ page }) => {
    // Fill a field
    await page.locator('input[name="first_name"]').fill('John');
    
    // Wait for auto-save (30 seconds + buffer)
    await page.waitForTimeout(31000);
    
    // Check for "Saved" indicator
    await expect(page.locator('text=/saved/i')).toBeVisible({ timeout: 5000 });
  });

  test('should validate required fields', async ({ page }) => {
    // Try to proceed without filling required fields
    await page.locator('button:has-text("Next")').click();
    
    // Should show validation errors
    await expect(page.locator('text=/required/i')).toBeVisible();
  });

  test('should validate date format (DD.MM.YYYY)', async ({ page }) => {
    const dateInput = page.locator('input[name="date_of_birth"]');
    
    // Invalid format
    await dateInput.fill('12/31/1990');
    await dateInput.blur();
    await expect(page.locator('text=/DD\\.MM\\.YYYY/i')).toBeVisible();
    
    // Valid format
    await dateInput.fill('31.12.1990');
    await dateInput.blur();
    await expect(page.locator('text=/DD\\.MM\\.YYYY/i')).not.toBeVisible();
  });

  test('should show unsaved changes warning', async ({ page }) => {
    // Fill a field
    await page.locator('input[name="first_name"]').fill('John');
    
    // Setup dialog handler
    page.on('dialog', dialog => {
      expect(dialog.message()).toContain('unsaved changes');
      dialog.dismiss();
    });
    
    // Try to navigate away
    await page.goto('/');
  });

  test('should persist data after refresh', async ({ page }) => {
    // Fill a field
    await page.locator('input[name="first_name"]').fill('John');
    
    // Trigger auto-save
    await page.waitForTimeout(31000);
    await expect(page.locator('text=/saved/i')).toBeVisible();
    
    // Refresh page
    await page.reload();
    
    // Data should persist
    await expect(page.locator('input[name="first_name"]')).toHaveValue('John');
  });
});
