import { test, expect } from '@playwright/test';
import {
  createTestUser,
  cleanupTestUser,
  cleanupTestOrganization,
  disconnect,
} from './helpers/database';

/**
 * E2E Tests for Organization Onboarding Flow
 *
 * Tests the complete user journey from signup to organization creation
 */

test.describe('Organization Onboarding', () => {
  const testUser = {
    email: `test-onboarding-${Date.now()}@example.com`,
    name: 'Test Onboarding User',
  };

  const testOrg = {
    name: 'Test Onboarding Company',
    slug: 'test-onboarding-company',
  };

  test.beforeEach(async () => {
    // Clean up any existing test data
    await cleanupTestUser(testUser.email);
    await cleanupTestOrganization(testOrg.slug);
  });

  test.afterEach(async () => {
    // Clean up test data
    await cleanupTestUser(testUser.email);
    await cleanupTestOrganization(testOrg.slug);
  });

  test.afterAll(async () => {
    await disconnect();
  });

  test('should redirect new user to onboarding page', async ({ page }) => {
    // Create a test user without organization
    await createTestUser(testUser);

    // NOTE: This assumes you have a test auth route or mechanism
    // You may need to implement a test-only auth endpoint for E2E tests

    // Navigate to dashboard
    await page.goto('/dashboard');

    // Should be redirected to onboarding
    await expect(page).toHaveURL('/onboarding');
  });

  test('should complete onboarding flow successfully', async ({ page }) => {
    // Create a test user without organization
    await createTestUser(testUser);

    // Navigate to onboarding
    await page.goto('/onboarding');

    // Step 1: Organization Information
    await expect(page.locator('text=Welcome to YustBoard!')).toBeVisible();
    await expect(page.locator('text=Step 1 of 2')).toBeVisible();

    // Fill in organization name
    await page.fill('input[name="organizationName"]', testOrg.name);
    await page.fill('input[id="organizationName"]', testOrg.name);

    // Check that slug is auto-generated
    const slugInput = page.locator('input[id="organizationSlug"]');
    await expect(slugInput).toHaveValue(testOrg.slug);

    // Continue to step 2
    await page.click('button[type="submit"]:has-text("Continue")');

    // Step 2: Confirmation
    await expect(page.locator('text=Step 2 of 2')).toBeVisible();
    await expect(page.locator(`text=${testOrg.name}`)).toBeVisible();
    await expect(page.locator(`text=${testOrg.slug}`)).toBeVisible();
    await expect(page.locator('text=Owner')).toBeVisible();
    await expect(page.locator('text=Free')).toBeVisible();

    // Create organization
    await page.click('button:has-text("Create Organization")');

    // Should redirect to dashboard
    await page.waitForURL('/dashboard', { timeout: 10000 });
    await expect(page).toHaveURL('/dashboard');
  });

  test('should auto-generate slug from organization name', async ({ page }) => {
    await createTestUser(testUser);
    await page.goto('/onboarding');

    // Test various name formats
    const testCases = [
      { name: 'My Test Company', expectedSlug: 'my-test-company' },
      { name: 'Acme Inc.', expectedSlug: 'acme-inc' },
      { name: 'Test & Associates!', expectedSlug: 'test-associates' },
      { name: 'Multiple   Spaces', expectedSlug: 'multiple-spaces' },
    ];

    for (const testCase of testCases) {
      await page.fill('input[id="organizationName"]', testCase.name);
      const slugInput = page.locator('input[id="organizationSlug"]');
      await expect(slugInput).toHaveValue(testCase.expectedSlug);
    }
  });

  test('should allow custom slug editing', async ({ page }) => {
    await createTestUser(testUser);
    await page.goto('/onboarding');

    // Fill organization name
    await page.fill('input[id="organizationName"]', testOrg.name);

    // Edit slug
    const customSlug = 'my-custom-slug-123';
    await page.fill('input[id="organizationSlug"]', customSlug);

    await expect(page.locator('input[id="organizationSlug"]')).toHaveValue(customSlug);
  });

  test('should validate slug format', async ({ page }) => {
    await createTestUser(testUser);
    await page.goto('/onboarding');

    await page.fill('input[id="organizationName"]', testOrg.name);

    // Try invalid slug with uppercase
    await page.fill('input[id="organizationSlug"]', 'Invalid-SLUG');

    // HTML5 validation should prevent submission
    const slugInput = page.locator('input[id="organizationSlug"]');
    const isValid = await slugInput.evaluate(
      (input: HTMLInputElement) => input.validity.valid
    );
    expect(isValid).toBe(false);
  });

  test('should show error for duplicate slug', async ({ page }) => {
    // Create user and organization first
    const user = await createTestUser(testUser);
    const { createTestOrganization } = await import('./helpers/database');
    await createTestOrganization({
      name: 'Existing Org',
      slug: testOrg.slug,
      ownerId: user.id,
    });

    // Create another user
    const newUser = {
      email: `test-new-${Date.now()}@example.com`,
      name: 'New User',
    };
    await createTestUser(newUser);

    await page.goto('/onboarding');

    // Try to use the same slug
    await page.fill('input[id="organizationName"]', 'Another Company');
    await page.fill('input[id="organizationSlug"]', testOrg.slug);
    await page.click('button[type="submit"]:has-text("Continue")');

    // Confirm
    await page.click('button:has-text("Create Organization")');

    // Should show error
    await expect(
      page.locator('text=/.*slug.*already exists.*/i')
    ).toBeVisible({ timeout: 5000 });

    // Clean up new user
    await cleanupTestUser(newUser.email);
  });

  test('should allow going back to edit information', async ({ page }) => {
    await createTestUser(testUser);
    await page.goto('/onboarding');

    // Fill step 1
    await page.fill('input[id="organizationName"]', testOrg.name);
    await page.click('button:has-text("Continue")');

    // Step 2: Go back
    await expect(page.locator('text=Step 2 of 2')).toBeVisible();
    await page.click('button:has-text("Back")');

    // Should be back on step 1
    await expect(page.locator('text=Step 1 of 2')).toBeVisible();
    await expect(page.locator('input[id="organizationName"]')).toHaveValue(testOrg.name);
  });

  test('should prevent user with organization from accessing onboarding', async ({
    page,
  }) => {
    // Create user with organization
    const user = await createTestUser(testUser);
    const { createTestOrganization } = await import('./helpers/database');
    await createTestOrganization({
      name: testOrg.name,
      slug: testOrg.slug,
      ownerId: user.id,
    });

    // Try to access onboarding
    await page.goto('/onboarding');

    // Should be redirected to dashboard
    await page.waitForURL('/dashboard', { timeout: 5000 });
    await expect(page).toHaveURL('/dashboard');
  });

  test('should show loading state during organization creation', async ({ page }) => {
    await createTestUser(testUser);
    await page.goto('/onboarding');

    // Fill and submit
    await page.fill('input[id="organizationName"]', testOrg.name);
    await page.click('button:has-text("Continue")');

    // Click create
    await page.click('button:has-text("Create Organization")');

    // Should show loading state (briefly)
    await expect(page.locator('text=Creating...')).toBeVisible({ timeout: 1000 });
  });
});
