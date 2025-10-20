import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth/server'
import prisma from '@/lib/database/prisma'
import { OrganizationRole } from '@prisma/client'
import { Permission } from './types'
import { hasPermission, hasAnyPermission } from './check'

export interface AuthContext {
  userId: string
  organizationId: string
  organizationRole: OrganizationRole
}

/**
 * Get authenticated user with organization context
 * Returns null if user is not authenticated or has no organization
 */
export async function getAuthContext(): Promise<AuthContext | null> {
  const session = await getServerSession()

  if (!session?.user?.id) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      organizationId: true,
      organizationRole: true,
    },
  })

  if (!user?.organizationId) {
    return null
  }

  return {
    userId: user.id,
    organizationId: user.organizationId,
    organizationRole: user.organizationRole,
  }
}

/**
 * Require authentication and organization membership
 * Returns 401 if not authenticated
 * Returns 403 if no organization
 */
export async function requireAuth(): Promise<
  { context: AuthContext } | { error: NextResponse }
> {
  const context = await getAuthContext()

  if (!context) {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return {
        error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      }
    }

    return {
      error: NextResponse.json(
        { error: 'No organization found' },
        { status: 403 }
      ),
    }
  }

  return { context }
}

/**
 * Require specific permission
 * Returns 401 if not authenticated
 * Returns 403 if no organization or permission denied
 */
export async function requirePermission(
  permission: Permission
): Promise<{ context: AuthContext } | { error: NextResponse }> {
  const authResult = await requireAuth()

  if ('error' in authResult) {
    return authResult
  }

  const { context } = authResult

  if (!hasPermission(context.organizationRole, permission)) {
    return {
      error: NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      ),
    }
  }

  return { context }
}

/**
 * Require any of the specified permissions
 */
export async function requireAnyPermission(
  permissions: Permission[]
): Promise<{ context: AuthContext } | { error: NextResponse }> {
  const authResult = await requireAuth()

  if ('error' in authResult) {
    return authResult
  }

  const { context } = authResult

  if (!hasAnyPermission(context.organizationRole, permissions)) {
    return {
      error: NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      ),
    }
  }

  return { context }
}

/**
 * Require OWNER role
 */
export async function requireOwner(): Promise<
  { context: AuthContext } | { error: NextResponse }
> {
  const authResult = await requireAuth()

  if ('error' in authResult) {
    return authResult
  }

  const { context } = authResult

  if (context.organizationRole !== 'OWNER') {
    return {
      error: NextResponse.json(
        { error: 'Only organization owners can perform this action' },
        { status: 403 }
      ),
    }
  }

  return { context }
}

/**
 * Require OWNER or ADMIN role
 */
export async function requireAdmin(): Promise<
  { context: AuthContext } | { error: NextResponse }
> {
  const authResult = await requireAuth()

  if ('error' in authResult) {
    return authResult
  }

  const { context } = authResult

  if (
    context.organizationRole !== 'OWNER' &&
    context.organizationRole !== 'ADMIN'
  ) {
    return {
      error: NextResponse.json(
        { error: 'Admin privileges required' },
        { status: 403 }
      ),
    }
  }

  return { context }
}

/**
 * Check if user owns a resource
 */
export async function requireResourceOwnership(
  resourceUserId: string
): Promise<{ context: AuthContext; isOwner: boolean } | { error: NextResponse }> {
  const authResult = await requireAuth()

  if ('error' in authResult) {
    return authResult
  }

  const { context } = authResult

  // Organization admins can manage any resource in their org
  const canManage =
    context.organizationRole === 'OWNER' ||
    context.organizationRole === 'ADMIN' ||
    context.userId === resourceUserId

  if (!canManage) {
    return {
      error: NextResponse.json(
        { error: 'You can only manage your own resources' },
        { status: 403 }
      ),
    }
  }

  return {
    context,
    isOwner: context.userId === resourceUserId,
  }
}
