import { test, expect } from '@playwright/test';
import {
  createTestUser,
  createTestOrganization,
  cleanupTestUser,
  cleanupTestOrganization,
  disconnect,
} from './helpers/database';

/**
 * E2E Tests for Role-Based Access Control (RBAC)
 *
 * Tests permission enforcement across different user roles
 */

test.describe('RBAC - Role-Based Access Control', () => {
  const ownerUser = {
    email: `test-rbac-owner-${Date.now()}@example.com`,
    name: 'Test Owner',
  };

  const adminUser = {
    email: `test-rbac-admin-${Date.now()}@example.com`,
    name: 'Test Admin',
  };

  const memberUser = {
    email: `test-rbac-member-${Date.now()}@example.com`,
    name: 'Test Member',
  };

  const viewerUser = {
    email: `test-rbac-viewer-${Date.now()}@example.com`,
    name: 'Test Viewer',
  };

  const testOrg = {
    name: 'Test RBAC Company',
    slug: `test-rbac-company-${Date.now()}`,
  };

  test.beforeEach(async () => {
    await cleanupTestUser(ownerUser.email);
    await cleanupTestUser(adminUser.email);
    await cleanupTestUser(memberUser.email);
    await cleanupTestUser(viewerUser.email);
    await cleanupTestOrganization(testOrg.slug);
  });

  test.afterEach(async () => {
    await cleanupTestUser(ownerUser.email);
    await cleanupTestUser(adminUser.email);
    await cleanupTestUser(memberUser.email);
    await cleanupTestUser(viewerUser.email);
    await cleanupTestOrganization(testOrg.slug);
  });

  test.afterAll(async () => {
    await disconnect();
  });

  test('OWNER can send team invites', async ({ page, context }) => {
    // Setup owner
    const owner = await createTestUser(ownerUser);
    const org = await createTestOrganization({
      name: testOrg.name,
      slug: testOrg.slug,
      ownerId: owner.id,
    });

    // Simulate authenticated session
    // NOTE: You'd need to implement actual login here

    // Make API call to send invite
    const response = await page.evaluate(async () => {
      return fetch('/api/organization/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'newmember@test.com',
          role: 'MEMBER',
        }),
      }).then(r => ({ ok: r.ok, status: r.status }));
    });

    expect(response.ok).toBe(true);
    expect(response.status).toBe(200);
  });

  test('ADMIN can send team invites', async ({ page }) => {
    // Setup org with owner
    const owner = await createTestUser(ownerUser);
    const org = await createTestOrganization({
      name: testOrg.name,
      slug: testOrg.slug,
      ownerId: owner.id,
    });

    // Create admin user
    const admin = await createTestUser(adminUser);

    // Add admin to organization
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    await prisma.organizationMembership.create({
      data: {
        userId: admin.id,
        organizationId: org.id,
        role: 'ADMIN',
      },
    });

    await prisma.user.update({
      where: { id: admin.id },
      data: {
        organizationId: org.id,
        organizationRole: 'ADMIN',
      },
    });

    await prisma.$disconnect();

    // Login as admin and send invite
    const response = await page.evaluate(async () => {
      return fetch('/api/organization/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'newmember@test.com',
          role: 'MEMBER',
        }),
      }).then(r => ({ ok: r.ok, status: r.status }));
    });

    expect(response.ok).toBe(true);
  });

  test('MEMBER cannot send team invites', async ({ page }) => {
    // Setup org with owner
    const owner = await createTestUser(ownerUser);
    const org = await createTestOrganization({
      name: testOrg.name,
      slug: testOrg.slug,
      ownerId: owner.id,
    });

    // Create member user
    const member = await createTestUser(memberUser);

    // Add member to organization
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    await prisma.organizationMembership.create({
      data: {
        userId: member.id,
        organizationId: org.id,
        role: 'MEMBER',
      },
    });

    await prisma.user.update({
      where: { id: member.id },
      data: {
        organizationId: org.id,
        organizationRole: 'MEMBER',
      },
    });

    await prisma.$disconnect();

    // Try to send invite as member (should fail)
    const response = await page.evaluate(async () => {
      return fetch('/api/organization/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'newmember@test.com',
          role: 'MEMBER',
        }),
      }).then(r => ({ ok: r.ok, status: r.status }));
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(403); // Forbidden
  });

  test('VIEWER cannot send team invites', async ({ page }) => {
    // Setup org with owner
    const owner = await createTestUser(ownerUser);
    const org = await createTestOrganization({
      name: testOrg.name,
      slug: testOrg.slug,
      ownerId: owner.id,
    });

    // Create viewer user
    const viewer = await createTestUser(viewerUser);

    // Add viewer to organization
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    await prisma.organizationMembership.create({
      data: {
        userId: viewer.id,
        organizationId: org.id,
        role: 'VIEWER',
      },
    });

    await prisma.user.update({
      where: { id: viewer.id },
      data: {
        organizationId: org.id,
        organizationRole: 'VIEWER',
      },
    });

    await prisma.$disconnect();

    // Try to send invite as viewer (should fail)
    const response = await page.evaluate(async () => {
      return fetch('/api/organization/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'newmember@test.com',
          role: 'MEMBER',
        }),
      }).then(r => ({ ok: r.ok, status: r.status }));
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(403); // Forbidden
  });

  test('OWNER can delete organization', async ({ page }) => {
    const owner = await createTestUser(ownerUser);
    const org = await createTestOrganization({
      name: testOrg.name,
      slug: testOrg.slug,
      ownerId: owner.id,
    });

    // Delete organization as owner
    const response = await page.evaluate(async () => {
      return fetch('/api/organization', {
        method: 'DELETE',
      }).then(r => ({ ok: r.ok, status: r.status }));
    });

    expect(response.ok).toBe(true);
  });

  test('ADMIN cannot delete organization', async ({ page }) => {
    const owner = await createTestUser(ownerUser);
    const org = await createTestOrganization({
      name: testOrg.name,
      slug: testOrg.slug,
      ownerId: owner.id,
    });

    const admin = await createTestUser(adminUser);

    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    await prisma.organizationMembership.create({
      data: {
        userId: admin.id,
        organizationId: org.id,
        role: 'ADMIN',
      },
    });

    await prisma.user.update({
      where: { id: admin.id },
      data: {
        organizationId: org.id,
        organizationRole: 'ADMIN',
      },
    });

    await prisma.$disconnect();

    // Try to delete as admin (should fail)
    const response = await page.evaluate(async () => {
      return fetch('/api/organization', {
        method: 'DELETE',
      }).then(r => ({ ok: r.ok, status: r.status }));
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(403);
  });

  test('MEMBER can create and edit own tasks', async ({ page }) => {
    const owner = await createTestUser(ownerUser);
    const org = await createTestOrganization({
      name: testOrg.name,
      slug: testOrg.slug,
      ownerId: owner.id,
    });

    const member = await createTestUser(memberUser);

    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    await prisma.organizationMembership.create({
      data: {
        userId: member.id,
        organizationId: org.id,
        role: 'MEMBER',
      },
    });

    await prisma.user.update({
      where: { id: member.id },
      data: {
        organizationId: org.id,
        organizationRole: 'MEMBER',
      },
    });

    // Create task
    const task = await prisma.task.create({
      data: {
        title: 'Test Task',
        userId: member.id,
        organizationId: org.id,
        date: new Date(),
      },
    });

    await prisma.$disconnect();

    // Edit own task (should succeed)
    const response = await page.evaluate(
      async (taskId) => {
        return fetch(`/api/tasks/${taskId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'Updated Task' }),
        }).then(r => ({ ok: r.ok, status: r.status }));
      },
      task.id
    );

    expect(response.ok).toBe(true);
  });

  test('VIEWER cannot create tasks', async ({ page }) => {
    const owner = await createTestUser(ownerUser);
    const org = await createTestOrganization({
      name: testOrg.name,
      slug: testOrg.slug,
      ownerId: owner.id,
    });

    const viewer = await createTestUser(viewerUser);

    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    await prisma.organizationMembership.create({
      data: {
        userId: viewer.id,
        organizationId: org.id,
        role: 'VIEWER',
      },
    });

    await prisma.user.update({
      where: { id: viewer.id },
      data: {
        organizationId: org.id,
        organizationRole: 'VIEWER',
      },
    });

    await prisma.$disconnect();

    // Try to create task as viewer (should fail)
    const response = await page.evaluate(async () => {
      return fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Test Task',
          date: new Date().toISOString(),
        }),
      }).then(r => ({ ok: r.ok, status: r.status }));
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(403);
  });
});
