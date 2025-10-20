import { OrganizationRole } from '@prisma/client'

export type Permission =
  // Organization management
  | 'organization:update'
  | 'organization:delete'
  | 'organization:settings:update'

  // Member management
  | 'members:invite'
  | 'members:remove'
  | 'members:update-role'
  | 'members:view'

  // Content management
  | 'announcements:create'
  | 'announcements:update'
  | 'announcements:delete'
  | 'announcements:view'

  // Tasks
  | 'tasks:create'
  | 'tasks:update'
  | 'tasks:delete'
  | 'tasks:view'

  // Timeline/Posts
  | 'posts:create'
  | 'posts:update'
  | 'posts:delete'
  | 'posts:view'

  // Media
  | 'media:upload'
  | 'media:delete'
  | 'media:view'

  // Widgets
  | 'widgets:manage'

export const ROLE_PERMISSIONS: Record<OrganizationRole, Permission[]> = {
  OWNER: [
    // Full access
    'organization:update',
    'organization:delete',
    'organization:settings:update',
    'members:invite',
    'members:remove',
    'members:update-role',
    'members:view',
    'announcements:create',
    'announcements:update',
    'announcements:delete',
    'announcements:view',
    'tasks:create',
    'tasks:update',
    'tasks:delete',
    'tasks:view',
    'posts:create',
    'posts:update',
    'posts:delete',
    'posts:view',
    'media:upload',
    'media:delete',
    'media:view',
    'widgets:manage',
  ],
  ADMIN: [
    // Almost full access except critical org operations
    'organization:update',
    'organization:settings:update',
    'members:invite',
    'members:remove',
    'members:update-role',
    'members:view',
    'announcements:create',
    'announcements:update',
    'announcements:delete',
    'announcements:view',
    'tasks:create',
    'tasks:update',
    'tasks:delete',
    'tasks:view',
    'posts:create',
    'posts:update',
    'posts:delete',
    'posts:view',
    'media:upload',
    'media:delete',
    'media:view',
    'widgets:manage',
  ],
  MEMBER: [
    // Standard member access
    'members:view',
    'announcements:view',
    'tasks:create',
    'tasks:update',
    'tasks:view',
    'posts:create',
    'posts:update',
    'posts:view',
    'media:upload',
    'media:view',
    'widgets:manage',
  ],
  VIEWER: [
    // Read-only access
    'members:view',
    'announcements:view',
    'tasks:view',
    'posts:view',
    'media:view',
  ],
}

export interface PermissionCheck {
  hasPermission: boolean
  role: OrganizationRole
  permissions: Permission[]
}
