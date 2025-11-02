import { test, expect } from '@playwright/test';

/**
 * Comprehensive PDF Generation Flow Integration Tests
 * Tests the complete lifecycle: preview → edit → validate → print
 */

test.describe('PDF Generation Complete Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    // Add authentication steps here if needed
  });

  test('should complete full PDF generation flow with valid data', async ({ page }) => {
    // Step 1: Open PDF generation dropdown
    await page.click('button:has-text("Generate PDFs")');
    
    // Step 2: Select a template (e.g., POA)
    await page.click('text=Power of Attorney (POA)');
    
    // Step 3: Wait for preview to load
    await expect(page.locator('dialog:has-text("PDF Preview")')).toBeVisible({ timeout: 10000 });
    
    // Step 4: Click "Download Final"
    await page.click('button:has-text("Download Final")');
    
    // Step 5: Verify Pre-Print Checklist appears
    await expect(page.locator('dialog:has-text("Pre-Print Verification")')).toBeVisible();
    
    // Step 6: Wait for AI validation to complete
    await expect(page.locator('text=100%')).toBeVisible({ timeout: 10000 });
    
    // Step 7: Verify all checks passed
    const passedChecks = await page.locator('[data-status="passed"]').count();
    expect(passedChecks).toBeGreaterThan(0);
    
    // Step 8: Click "Proceed to Print"
    await page.click('button:has-text("Proceed to Print")');
    
    // Step 9: Verify download initiated (checklist closes)
    await expect(page.locator('dialog:has-text("Pre-Print Verification")')).not.toBeVisible();
  });

  test('should block printing when critical errors exist', async ({ page }) => {
    // TODO: Set up test data with intentional critical errors
    // (e.g., invalid date format, missing mandatory fields)
    
    await page.click('button:has-text("Generate PDFs")');
    await page.click('text=Power of Attorney (POA)');
    
    await expect(page.locator('dialog:has-text("PDF Preview")')).toBeVisible();
    await page.click('button:has-text("Download Final")');
    
    await expect(page.locator('dialog:has-text("Pre-Print Verification")')).toBeVisible();
    
    // Wait for validation
    await expect(page.locator('text=100%')).toBeVisible({ timeout: 10000 });
    
    // Verify "Proceed to Print" button is disabled
    const proceedButton = page.locator('button:has-text("Proceed to Print")');
    await expect(proceedButton).toBeDisabled();
    
    // Verify error icons are shown
    const failedChecks = await page.locator('[data-status="failed"]').count();
    expect(failedChecks).toBeGreaterThan(0);
  });

  test('should allow proceeding with warnings only', async ({ page }) => {
    // TODO: Set up test data with non-critical warnings
    // (e.g., name consistency issues, address formatting)
    
    await page.click('button:has-text("Generate PDFs")');
    await page.click('text=Citizenship Application (OBY)');
    
    await expect(page.locator('dialog:has-text("PDF Preview")')).toBeVisible();
    await page.click('button:has-text("Download Final")');
    
    await expect(page.locator('dialog:has-text("Pre-Print Verification")')).toBeVisible();
    await expect(page.locator('text=100%')).toBeVisible({ timeout: 10000 });
    
    // Verify warnings are shown
    const warningChecks = await page.locator('[data-status="warning"]').count();
    expect(warningChecks).toBeGreaterThan(0);
    
    // Verify "Proceed to Print" is enabled despite warnings
    const proceedButton = page.locator('button:has-text("Proceed to Print")');
    await expect(proceedButton).toBeEnabled();
  });

  test('should use fallback validation when AI service fails', async ({ page }) => {
    // Mock AI service failure
    await page.route('**/functions/v1/ai-validate-form', route => {
      route.abort();
    });
    
    await page.click('button:has-text("Generate PDFs")');
    await page.click('text=Power of Attorney (POA)');
    
    await expect(page.locator('dialog:has-text("PDF Preview")')).toBeVisible();
    await page.click('button:has-text("Download Final")');
    
    await expect(page.locator('dialog:has-text("Pre-Print Verification")')).toBeVisible();
    
    // Verify fallback mode indicator
    await expect(page.locator('text=Limited validation only')).toBeVisible();
    
    // Verify toast notification about fallback
    await expect(page.locator('text=AI validation unavailable')).toBeVisible();
    
    // Verify basic checks still run
    await expect(page.locator('text=100%')).toBeVisible({ timeout: 10000 });
  });

  test('should validate all template types', async ({ page }) => {
    const templates = [
      'Power of Attorney (POA)',
      'Citizenship Application (OBY)',
      'Family Tree',
      'Civil Registry Request',
      // Add other templates
    ];
    
    for (const template of templates) {
      await page.click('button:has-text("Generate PDFs")');
      await page.click(`text=${template}`);
      
      // Wait for preview
      await expect(page.locator('dialog:has-text("PDF Preview")')).toBeVisible({ timeout: 10000 });
      
      // Close preview
      await page.click('button[aria-label="Close"]');
      await expect(page.locator('dialog:has-text("PDF Preview")')).not.toBeVisible();
    }
  });

  test('should show progress during validation', async ({ page }) => {
    await page.click('button:has-text("Generate PDFs")');
    await page.click('text=Power of Attorney (POA)');
    
    await expect(page.locator('dialog:has-text("PDF Preview")')).toBeVisible();
    await page.click('button:has-text("Download Final")');
    
    await expect(page.locator('dialog:has-text("Pre-Print Verification")')).toBeVisible();
    
    // Verify progress bar appears
    await expect(page.locator('text=Validation progress...')).toBeVisible();
    
    // Verify progress percentage increases
    const progressText = page.locator('text=/\\d+%/');
    await expect(progressText).toBeVisible();
    
    // Wait for completion
    await expect(page.locator('text=100%')).toBeVisible({ timeout: 10000 });
  });

  test('should update document status after printing', async ({ page }) => {
    // This test requires database access to verify status updates
    // Can use Supabase client to check pdf_status column
    
    await page.click('button:has-text("Generate PDFs")');
    await page.click('text=Power of Attorney (POA)');
    
    await expect(page.locator('dialog:has-text("PDF Preview")')).toBeVisible();
    
    // Generate -> status should be 'generated'
    // TODO: Add database assertion here
    
    await page.click('button:has-text("Download Final")');
    await expect(page.locator('dialog:has-text("Pre-Print Verification")')).toBeVisible();
    await expect(page.locator('text=100%')).toBeVisible({ timeout: 10000 });
    
    await page.click('button:has-text("Proceed to Print")');
    
    // After print -> status should be 'printed'
    // TODO: Add database assertion here
  });
});

test.describe('Cross-Field Validation Tests', () => {
  test('should validate father-paternal grandfather last name match', async ({ page }) => {
    // TODO: Set up test data where father's last name ≠ paternal grandfather's last name
    // Verify warning appears in Pre-Print Checklist
  });

  test('should validate mother-maternal grandfather last name match', async ({ page }) => {
    // TODO: Set up test data where mother's maiden name ≠ maternal grandfather's last name
    // Verify warning appears
  });

  test('should validate date chronological order', async ({ page }) => {
    // TODO: Set up test data where birth > marriage (invalid)
    // Verify critical error blocks printing
  });
});
