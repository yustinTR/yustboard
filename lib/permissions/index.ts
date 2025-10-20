// Types
export type { Permission, PermissionCheck } from './types'
export { ROLE_PERMISSIONS } from './types'

// Permission checking functions
export {
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
} from './check'

// Middleware
export type { AuthContext } from './middleware'
export {
  getAuthContext,
  requireAuthOnly,
  requireAuth,
  requirePermission,
  requireAnyPermission,
  requireOwner,
  requireAdmin,
  requireResourceOwnership,
} from './middleware'
