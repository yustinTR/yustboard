# Role-Based Access Control (RBAC) System

## Overview

YustBoard implements a complete RBAC system to manage permissions across the organization.

## Roles

- **OWNER**: Full access to everything including organization deletion
- **ADMIN**: Almost full access except critical operations like deleting organization
- **MEMBER**: Standard user access for creating and managing own content
- **VIEWER**: Read-only access

## Usage

### Backend (API Routes)

```typescript
import { requirePermission, requireAdmin, requireOwner } from '@/lib/permissions'

export async function DELETE(request: Request) {
  const result = await requirePermission('members:remove')

  if ('error' in result) {
    return result.error
  }

  const { context } = result
  // context.userId, context.organizationId, context.organizationRole available

  // Your logic here...
}

// Or use helper functions
export async function PATCH(request: Request) {
  const result = await requireAdmin() // OWNER or ADMIN only

  if ('error' in result) {
    return result.error
  }

  // Your logic...
}
```

### Frontend (React Components)

```typescript
import { usePermissions, PermissionGuard, RoleGuard } from '@/hooks/usePermissions'

function MyComponent() {
  const permissions = usePermissions()

  // Check permissions programmatically
  if (permissions.canInviteMembers) {
    // Show invite button
  }

  // Or use guards
  return (
    <div>
      <PermissionGuard permission="members:invite">
        <Button>Invite Member</Button>
      </PermissionGuard>

      <RoleGuard roles={['OWNER', 'ADMIN']}>
        <DangerZone />
      </RoleGuard>
    </div>
  )
}
```

## Permission List

### Organization
- `organization:update` - Update organization details
- `organization:delete` - Delete organization (OWNER only)
- `organization:settings:update` - Update organization settings

### Members
- `members:invite` - Invite new members
- `members:remove` - Remove members
- `members:update-role` - Change member roles
- `members:view` - View member list

### Content
- `announcements:create/update/delete/view`
- `tasks:create/update/delete/view`
- `posts:create/update/delete/view`
- `media:upload/delete/view`
- `widgets:manage`

## Helper Functions

```typescript
import {
  canManageOrganization,
  canInviteMembers,
  canRemoveMembers,
  canManageAnnouncements,
  isOwner,
  isOwnerOrAdmin,
  hasHigherRole
} from '@/lib/permissions'

// Check role
if (isOwnerOrAdmin(user.organizationRole)) {
  // Admin actions
}

// Check if can manage
if (canInviteMembers(user.organizationRole)) {
  // Show invite form
}
```

## Adding New Permissions

1. Add permission to `Permission` type in `lib/permissions/types.ts`
2. Add permission to appropriate roles in `ROLE_PERMISSIONS`
3. Use in API routes with `requirePermission()`
4. Use in frontend with `usePermissions()` hook

## Session Integration

User's `organizationRole` is automatically added to the session and available in:
- `session.user.organizationRole` (frontend)
- Retrieved via `getAuthContext()` (backend)
