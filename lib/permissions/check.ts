import { OrganizationRole } from '@prisma/client'
import { Permission, ROLE_PERMISSIONS } from './types'

/**
 * Check if a role has a specific permission
 */
export function hasPermission(
  role: OrganizationRole,
  permission: Permission
): boolean {
  const rolePermissions = ROLE_PERMISSIONS[role]
  return rolePermissions.includes(permission)
}

/**
 * Check if a role has any of the specified permissions
 */
export function hasAnyPermission(
  role: OrganizationRole,
  permissions: Permission[]
): boolean {
  return permissions.some((permission) => hasPermission(role, permission))
}

/**
 * Check if a role has all of the specified permissions
 */
export function hasAllPermissions(
  role: OrganizationRole,
  permissions: Permission[]
): boolean {
  return permissions.every((permission) => hasPermission(role, permission))
}

/**
 * Get all permissions for a role
 */
export function getPermissions(role: OrganizationRole): Permission[] {
  return ROLE_PERMISSIONS[role]
}

/**
 * Check if user can manage organization (OWNER or ADMIN)
 */
export function canManageOrganization(role: OrganizationRole): boolean {
  return hasPermission(role, 'organization:update')
}

/**
 * Check if user can invite members (OWNER or ADMIN)
 */
export function canInviteMembers(role: OrganizationRole): boolean {
  return hasPermission(role, 'members:invite')
}

/**
 * Check if user can remove members (OWNER or ADMIN)
 */
export function canRemoveMembers(role: OrganizationRole): boolean {
  return hasPermission(role, 'members:remove')
}

/**
 * Check if user can manage announcements (OWNER or ADMIN)
 */
export function canManageAnnouncements(role: OrganizationRole): boolean {
  return hasPermission(role, 'announcements:delete')
}

/**
 * Check if user is owner
 */
export function isOwner(role: OrganizationRole): boolean {
  return role === 'OWNER'
}

/**
 * Check if user is owner or admin
 */
export function isOwnerOrAdmin(role: OrganizationRole): boolean {
  return role === 'OWNER' || role === 'ADMIN'
}

/**
 * Check if one role has higher priority than another
 * OWNER > ADMIN > MEMBER > VIEWER
 */
export function hasHigherRole(
  userRole: OrganizationRole,
  targetRole: OrganizationRole
): boolean {
  const rolePriority: Record<OrganizationRole, number> = {
    OWNER: 4,
    ADMIN: 3,
    MEMBER: 2,
    VIEWER: 1,
  }

  return rolePriority[userRole] > rolePriority[targetRole]
}
