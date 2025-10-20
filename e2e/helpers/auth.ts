import { Page } from '@playwright/test';

/**
 * Helper functions for authentication in E2E tests
 */

export interface TestUser {
  email: string;
  password: string;
  name?: string;
}

/**
 * Login a user via the login page
 */
export async function login(page: Page, user: TestUser) {
  await page.goto('/login');

  // Wait for login form
  await page.waitForSelector('input[type="email"]', { timeout: 5000 });

  // Fill in credentials
  await page.fill('input[type="email"]', user.email);
  await page.fill('input[type="password"]', user.password);

  // Submit form
  await page.click('button[type="submit"]');

  // Wait for redirect to dashboard or onboarding
  await page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 10000 });
}

/**
 * Logout the current user
 */
export async function logout(page: Page) {
  // Navigate to dashboard first
  await page.goto('/dashboard');

  // Click profile menu
  await page.click('[data-testid="user-menu"]');

  // Click logout
  await page.click('[data-testid="logout-button"]');

  // Wait for redirect to home or login
  await page.waitForURL(/\/(|login)/, { timeout: 5000 });
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  const session = await page.evaluate(() => {
    return fetch('/api/auth/session').then(r => r.json());
  });

  return !!session?.user;
}

/**
 * Get current session
 */
export async function getSession(page: Page) {
  return await page.evaluate(() => {
    return fetch('/api/auth/session').then(r => r.json());
  });
}
