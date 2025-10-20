import { PrismaClient } from '@prisma/client';

/**
 * Database helpers for E2E tests
 * Use these to set up test data and clean up after tests
 */

const prisma = new PrismaClient();

/**
 * Create a test user
 */
export async function createTestUser(data: {
  email: string;
  name: string;
  password?: string;
}) {
  return await prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      // Note: In real tests, you'd need to hash the password
      // For now, assuming OAuth/test auth
    },
  });
}

/**
 * Create a test organization
 */
export async function createTestOrganization(data: {
  name: string;
  slug: string;
  ownerId: string;
}) {
  const org = await prisma.organization.create({
    data: {
      name: data.name,
      slug: data.slug,
      plan: 'FREE',
    },
  });

  // Create owner membership
  await prisma.organizationMembership.create({
    data: {
      userId: data.ownerId,
      organizationId: org.id,
      role: 'OWNER',
    },
  });

  // Update user
  await prisma.user.update({
    where: { id: data.ownerId },
    data: {
      organizationId: org.id,
      organizationRole: 'OWNER',
    },
  });

  return org;
}

/**
 * Create a test invite
 */
export async function createTestInvite(data: {
  organizationId: string;
  email: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
  expiresInDays?: number;
}) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + (data.expiresInDays || 7));

  return await prisma.organizationInvite.create({
    data: {
      organizationId: data.organizationId,
      email: data.email,
      role: data.role,
      token: `test-invite-${Date.now()}-${Math.random()}`,
      expiresAt,
    },
  });
}

/**
 * Clean up test user and related data
 */
export async function cleanupTestUser(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { memberships: true },
  });

  if (!user) return;

  // Delete memberships
  await prisma.organizationMembership.deleteMany({
    where: { userId: user.id },
  });

  // Delete user
  await prisma.user.delete({
    where: { id: user.id },
  });
}

/**
 * Clean up test organization
 */
export async function cleanupTestOrganization(slug: string) {
  const org = await prisma.organization.findUnique({
    where: { slug },
  });

  if (!org) return;

  // Cascade delete will handle memberships, invites, etc.
  await prisma.organization.delete({
    where: { id: org.id },
  });
}

/**
 * Disconnect from database
 */
export async function disconnect() {
  await prisma.$disconnect();
}
