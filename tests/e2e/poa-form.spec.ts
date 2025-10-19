import { test, expect } from '@playwright/test';

test.describe('POA Form', () => {
  test.beforeEach(async ({ page }) => {
    // TODO: Add authentication and navigation to POA form
    await page.goto('/admin/cases/[case-id]/poa');
  });

  test('should load POA form', async ({ page }) => {
    await expect(page.locator('text=/power of attorney/i')).toBeVisible();
  });

  test('should auto-populate from intake data', async ({ page }) => {
    // Verify key fields are pre-filled from intake
    const firstNameInput = page.locator('input[name="applicant_first_name"]');
    await expect(firstNameInput).not.toBeEmpty();
  });

  test('should generate POA PDF', async ({ page }) => {
    // Fill required fields
    await page.locator('input[name="applicant_first_name"]').fill('John');
    await page.locator('input[name="applicant_last_name"]').fill('Doe');
    
    // Click generate PDF button
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.locator('button:has-text("Generate POA")').click()
    ]);
    
    // Verify download
    expect(download.suggestedFilename()).toContain('.pdf');
  });

  test('should validate required fields before generation', async ({ page }) => {
    // Try to generate without filling required fields
    await page.locator('button:has-text("Generate POA")').click();
    
    // Should show validation errors
    await expect(page.locator('text=/required/i')).toBeVisible();
  });

  test('should support e-signature', async ({ page }) => {
    // Navigate to signature tab
    await page.locator('text=/signature/i').click();
    
    // Signature canvas should be visible
    await expect(page.locator('canvas')).toBeVisible();
    
    // Draw signature (simple test)
    const canvas = page.locator('canvas');
    const box = await canvas.boundingBox();
    if (box) {
      await page.mouse.move(box.x + 50, box.y + 50);
      await page.mouse.down();
      await page.mouse.move(box.x + 150, box.y + 100);
      await page.mouse.up();
    }
    
    // Save button should be enabled
    await expect(page.locator('button:has-text("Save Signature")')).toBeEnabled();
  });
});
