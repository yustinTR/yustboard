'use client'

import React from 'react'
import { useSession } from 'next-auth/react'
import { OrganizationRole } from '@prisma/client'
import {
  Permission,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getPermissions,
  canManageOrganization,
  canInviteMembers,
  canRemoveMembers,
  canManageAnnouncements,
  isOwner,
  isOwnerOrAdmin,
  hasHigherRole,
} from '@/lib/permissions'

interface SessionUser {
  organizationRole?: OrganizationRole
}

interface UsePermissionsReturn {
  role: OrganizationRole | null
  permissions: Permission[]
  hasPermission: (permission: Permission) => boolean
  hasAnyPermission: (permissions: Permission[]) => boolean
  hasAllPermissions: (permissions: Permission[]) => boolean
  canManageOrganization: boolean
  canInviteMembers: boolean
  canRemoveMembers: boolean
  canManageAnnouncements: boolean
  isOwner: boolean
  isOwnerOrAdmin: boolean
  hasHigherRole: (targetRole: OrganizationRole) => boolean
  isLoading: boolean
}

/**
 * Hook to check user permissions based on their organization role
 */
export function usePermissions(): UsePermissionsReturn {
  const { data: session, status } = useSession()

  // Get role from session
  const role = (session?.user as SessionUser)?.organizationRole ?? null

  const isLoading = status === 'loading'

  if (!role) {
    return {
      role: null,
      permissions: [],
      hasPermission: () => false,
      hasAnyPermission: () => false,
      hasAllPermissions: () => false,
      canManageOrganization: false,
      canInviteMembers: false,
      canRemoveMembers: false,
      canManageAnnouncements: false,
      isOwner: false,
      isOwnerOrAdmin: false,
      hasHigherRole: () => false,
      isLoading,
    }
  }

  const permissions = getPermissions(role)

  return {
    role,
    permissions,
    hasPermission: (permission: Permission) => hasPermission(role, permission),
    hasAnyPermission: (perms: Permission[]) => hasAnyPermission(role, perms),
    hasAllPermissions: (perms: Permission[]) => hasAllPermissions(role, perms),
    canManageOrganization: canManageOrganization(role),
    canInviteMembers: canInviteMembers(role),
    canRemoveMembers: canRemoveMembers(role),
    canManageAnnouncements: canManageAnnouncements(role),
    isOwner: isOwner(role),
    isOwnerOrAdmin: isOwnerOrAdmin(role),
    hasHigherRole: (targetRole: OrganizationRole) => hasHigherRole(role, targetRole),
    isLoading,
  }
}

/**
 * Component guard that only renders children if user has permission
 */
export function PermissionGuard({
  permission,
  fallback,
  children,
}: {
  permission: Permission | Permission[]
  fallback?: React.ReactNode
  children: React.ReactNode
}) {
  const permissions = usePermissions()

  const hasAccess = Array.isArray(permission)
    ? permissions.hasAnyPermission(permission)
    : permissions.hasPermission(permission)

  if (!hasAccess) {
    return fallback || null
  }

  return children as React.ReactElement
}

/**
 * Role guard that only renders children if user has specific role(s)
 */
export function RoleGuard({
  roles,
  fallback,
  children,
}: {
  roles: OrganizationRole | OrganizationRole[]
  fallback?: React.ReactNode
  children: React.ReactNode
}) {
  const { role } = usePermissions()

  if (!role) {
    return fallback || null
  }

  const allowedRoles = Array.isArray(roles) ? roles : [roles]
  const hasAccess = allowedRoles.includes(role)

  if (!hasAccess) {
    return fallback || null
  }

  return children as React.ReactElement
}
