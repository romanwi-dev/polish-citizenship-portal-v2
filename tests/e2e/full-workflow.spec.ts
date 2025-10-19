import { test, expect } from '@playwright/test';

test.describe('Full User Workflow', () => {
  test('should complete entire case lifecycle', async ({ page }) => {
    // Step 1: Login
    await page.goto('/');
    await page.locator('input[type="email"]').fill('admin@example.com');
    await page.locator('input[type="password"]').fill('AdminPassword123!');
    await page.locator('button[type="submit"]').click();
    
    // Wait for dashboard
    await page.waitForURL(/dashboard/);
    
    // Step 2: Create new case
    await page.locator('button:has-text("New Case")').click();
    await page.locator('input[name="client_name"]').fill('Test Client');
    await page.locator('input[name="client_code"]').fill('TEST-001');
    await page.locator('button:has-text("Create")').click();
    
    // Should navigate to case detail
    await expect(page).toHaveURL(/cases\/[a-z0-9-]+/);
    
    // Step 3: Fill intake form
    await page.locator('text=/intake/i').click();
    await page.locator('input[name="first_name"]').fill('John');
    await page.locator('input[name="last_name"]').fill('Doe');
    await page.locator('input[name="email"]').fill('john.doe@example.com');
    await page.locator('input[name="date_of_birth"]').fill('01.01.1990');
    
    // Wait for auto-save
    await page.waitForTimeout(31000);
    await expect(page.locator('text=/saved/i')).toBeVisible();
    
    // Step 4: Generate POA
    await page.locator('text=/power of attorney/i').click();
    await page.locator('button:has-text("Generate POA")').click();
    
    // Should show success message
    await expect(page.locator('text=/success/i')).toBeVisible();
    
    // Step 5: Fill citizenship form
    await page.locator('text=/citizenship/i').click();
    await page.locator('input[name="applicant_occupation"]').fill('Engineer');
    await page.locator('input[name="current_address"]').fill('123 Main St');
    
    // Wait for auto-save
    await page.waitForTimeout(31000);
    await expect(page.locator('text=/saved/i')).toBeVisible();
    
    // Step 6: Create family tree
    await page.locator('text=/family tree/i').click();
    await page.locator('button:has-text("Add Member")').click();
    await page.locator('input[name="member_name"]').fill('Jane Doe');
    await page.locator('button:has-text("Save")').click();
    
    // Step 7: Verify case completion
    await page.goto('/admin/dashboard');
    await expect(page.locator('text=TEST-001')).toBeVisible();
    
    // Check completion percentage > 0%
    const completionText = await page.locator('text=/%/').first().textContent();
    expect(completionText).toMatch(/[1-9][0-9]?%/);
  });

  test('should prevent invalid workflow progression', async ({ page }) => {
    // Try to generate POA without intake data
    await page.goto('/admin/cases/[case-id]/poa');
    await page.locator('button:has-text("Generate POA")').click();
    
    // Should show validation blocking
    await expect(page.locator('text=/required|complete intake/i')).toBeVisible();
  });

  test('should track case progress across forms', async ({ page }) => {
    // Create case and check initial progress
    await page.goto('/admin/dashboard');
    const initialProgress = await page.locator('[data-testid="case-progress"]').first().textContent();
    
    // Fill some intake data
    await page.locator('text=/cases/i').first().click();
    await page.locator('text=/intake/i').click();
    await page.locator('input[name="first_name"]').fill('Test');
    await page.waitForTimeout(31000); // Auto-save
    
    // Return to dashboard
    await page.goto('/admin/dashboard');
    
    // Progress should increase
    const newProgress = await page.locator('[data-testid="case-progress"]').first().textContent();
    expect(newProgress).not.toBe(initialProgress);
  });
});
