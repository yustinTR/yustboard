import { test, expect } from '@playwright/test';
import {
  createTestUser,
  createTestOrganization,
  createTestInvite,
  cleanupTestUser,
  cleanupTestOrganization,
  disconnect,
} from './helpers/database';

/**
 * E2E Tests for Team Invite System
 *
 * Tests the complete invite flow from creation to acceptance
 */

test.describe('Team Invite System', () => {
  const ownerUser = {
    email: `test-owner-${Date.now()}@example.com`,
    name: 'Test Owner',
  };

  const memberUser = {
    email: `test-member-${Date.now()}@example.com`,
    name: 'Test Member',
  };

  const testOrg = {
    name: 'Test Invite Company',
    slug: `test-invite-company-${Date.now()}`,
  };

  test.beforeEach(async () => {
    // Clean up any existing test data
    await cleanupTestUser(ownerUser.email);
    await cleanupTestUser(memberUser.email);
    await cleanupTestOrganization(testOrg.slug);
  });

  test.afterEach(async () => {
    // Clean up test data
    await cleanupTestUser(ownerUser.email);
    await cleanupTestUser(memberUser.email);
    await cleanupTestOrganization(testOrg.slug);
  });

  test.afterAll(async () => {
    await disconnect();
  });

  test('should display invite details correctly', async ({ page }) => {
    // Setup: Create owner, org, and invite
    const owner = await createTestUser(ownerUser);
    const org = await createTestOrganization({
      name: testOrg.name,
      slug: testOrg.slug,
      ownerId: owner.id,
    });

    const invite = await createTestInvite({
      organizationId: org.id,
      email: memberUser.email,
      role: 'MEMBER',
      expiresInDays: 7,
    });

    // Create member user
    await createTestUser(memberUser);

    // Navigate to invite page
    await page.goto(`/invite/${invite.token}`);

    // Check invite details are displayed
    await expect(page.locator(`text=${testOrg.name}`)).toBeVisible();
    await expect(page.locator(`text=${memberUser.email}`)).toBeVisible();
    await expect(page.locator('text=/Member/i')).toBeVisible();

    // Check buttons are present
    await expect(page.locator('button:has-text("Accept")')).toBeVisible();
    await expect(page.locator('button:has-text("Decline")')).toBeVisible();
  });

  test('should accept invite successfully', async ({ page }) => {
    // Setup
    const owner = await createTestUser(ownerUser);
    const org = await createTestOrganization({
      name: testOrg.name,
      slug: testOrg.slug,
      ownerId: owner.id,
    });

    const invite = await createTestInvite({
      organizationId: org.id,
      email: memberUser.email,
      role: 'MEMBER',
      expiresInDays: 7,
    });

    const member = await createTestUser(memberUser);

    // Navigate to invite page
    await page.goto(`/invite/${invite.token}`);

    // Accept invite
    await page.click('button:has-text("Accept")');

    // Should show success state
    await expect(page.locator('text=/Invite Accepted!/i')).toBeVisible({
      timeout: 5000,
    });

    // Should redirect to dashboard
    await page.waitForURL('/dashboard', { timeout: 5000 });
    await expect(page).toHaveURL('/dashboard');

    // Verify membership was created in database
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    const membership = await prisma.organizationMembership.findFirst({
      where: {
        userId: member.id,
        organizationId: org.id,
      },
    });
    expect(membership).toBeTruthy();
    expect(membership?.role).toBe('MEMBER');
    await prisma.$disconnect();
  });

  test('should decline invite successfully', async ({ page }) => {
    // Setup
    const owner = await createTestUser(ownerUser);
    const org = await createTestOrganization({
      name: testOrg.name,
      slug: testOrg.slug,
      ownerId: owner.id,
    });

    const invite = await createTestInvite({
      organizationId: org.id,
      email: memberUser.email,
      role: 'MEMBER',
      expiresInDays: 7,
    });

    await createTestUser(memberUser);

    // Navigate to invite page
    await page.goto(`/invite/${invite.token}`);

    // Decline invite
    await page.click('button:has-text("Decline")');

    // Should redirect (probably to home)
    await page.waitForURL(/\/(|login|dashboard)/, { timeout: 5000 });

    // Verify invite was deleted in database
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    const deletedInvite = await prisma.organizationInvite.findUnique({
      where: { id: invite.id },
    });
    expect(deletedInvite).toBeNull();
    await prisma.$disconnect();
  });

  test('should show expired state for expired invite', async ({ page }) => {
    // Setup
    const owner = await createTestUser(ownerUser);
    const org = await createTestOrganization({
      name: testOrg.name,
      slug: testOrg.slug,
      ownerId: owner.id,
    });

    // Create expired invite (expires yesterday)
    const invite = await createTestInvite({
      organizationId: org.id,
      email: memberUser.email,
      role: 'MEMBER',
      expiresInDays: -1, // Expired yesterday
    });

    await createTestUser(memberUser);

    // Navigate to invite page
    await page.goto(`/invite/${invite.token}`);

    // Should show expired state
    await expect(page.locator('text=/Invite Expired/i')).toBeVisible();
    await expect(page.locator('button:has-text("Accept")')).not.toBeVisible();
  });

  test('should show already accepted state', async ({ page }) => {
    // Setup
    const owner = await createTestUser(ownerUser);
    const org = await createTestOrganization({
      name: testOrg.name,
      slug: testOrg.slug,
      ownerId: owner.id,
    });

    const member = await createTestUser(memberUser);

    const invite = await createTestInvite({
      organizationId: org.id,
      email: memberUser.email,
      role: 'MEMBER',
      expiresInDays: 7,
    });

    // Accept the invite first
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    // Create membership
    await prisma.organizationMembership.create({
      data: {
        userId: member.id,
        organizationId: org.id,
        role: 'MEMBER',
      },
    });

    // Mark invite as accepted
    await prisma.organizationInvite.update({
      where: { id: invite.id },
      data: { acceptedAt: new Date() },
    });

    await prisma.$disconnect();

    // Navigate to invite page
    await page.goto(`/invite/${invite.token}`);

    // Should show already accepted state
    await expect(page.locator('text=/Already Accepted/i')).toBeVisible();
    await expect(page.locator('button:has-text("Go to Dashboard")')).toBeVisible();
  });

  test('should show error for invalid invite token', async ({ page }) => {
    await createTestUser(memberUser);

    // Navigate with invalid token
    await page.goto('/invite/invalid-token-12345');

    // Should show error state
    await expect(page.locator('text=/Invalid Invite/i')).toBeVisible();
  });

  test('should redirect unauthenticated user to login', async ({ page }) => {
    // Setup
    const owner = await createTestUser(ownerUser);
    const org = await createTestOrganization({
      name: testOrg.name,
      slug: testOrg.slug,
      ownerId: owner.id,
    });

    const invite = await createTestInvite({
      organizationId: org.id,
      email: memberUser.email,
      role: 'MEMBER',
      expiresInDays: 7,
    });

    // Navigate without authentication
    await page.goto(`/invite/${invite.token}`);

    // Should redirect to login with callback
    await page.waitForURL(/\/login.*callbackUrl=.*invite/, { timeout: 5000 });
    expect(page.url()).toContain('/login');
    expect(page.url()).toContain('callbackUrl');
    expect(page.url()).toContain(invite.token);
  });

  test('should handle ADMIN role invite', async ({ page }) => {
    // Setup
    const owner = await createTestUser(ownerUser);
    const org = await createTestOrganization({
      name: testOrg.name,
      slug: testOrg.slug,
      ownerId: owner.id,
    });

    const invite = await createTestInvite({
      organizationId: org.id,
      email: memberUser.email,
      role: 'ADMIN',
      expiresInDays: 7,
    });

    const member = await createTestUser(memberUser);

    // Navigate and accept
    await page.goto(`/invite/${invite.token}`);
    await expect(page.locator('text=/Admin/i')).toBeVisible();

    await page.click('button:has-text("Accept")');
    await page.waitForURL('/dashboard', { timeout: 5000 });

    // Verify role in database
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    const membership = await prisma.organizationMembership.findFirst({
      where: {
        userId: member.id,
        organizationId: org.id,
      },
    });
    expect(membership?.role).toBe('ADMIN');
    await prisma.$disconnect();
  });

  test('should show loading state while accepting', async ({ page }) => {
    // Setup
    const owner = await createTestUser(ownerUser);
    const org = await createTestOrganization({
      name: testOrg.name,
      slug: testOrg.slug,
      ownerId: owner.id,
    });

    const invite = await createTestInvite({
      organizationId: org.id,
      email: memberUser.email,
      role: 'MEMBER',
      expiresInDays: 7,
    });

    await createTestUser(memberUser);

    await page.goto(`/invite/${invite.token}`);

    // Click accept
    await page.click('button:has-text("Accept")');

    // Should show accepting state (briefly)
    await expect(page.locator('text=Accepting...')).toBeVisible({ timeout: 1000 });
  });
});
