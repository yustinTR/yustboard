import { describe, it, expect } from 'vitest';
import {
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
} from './check';
import { ROLE_PERMISSIONS } from './types';

describe('Permission Checks', () => {
  describe('hasPermission', () => {
    it('should allow OWNER all permissions', () => {
      const permissions = Object.values(ROLE_PERMISSIONS.OWNER);
      permissions.forEach(permission => {
        expect(hasPermission('OWNER', permission)).toBe(true);
      });
    });

    it('should allow ADMIN to manage members but not delete organization', () => {
      expect(hasPermission('ADMIN', 'members:invite')).toBe(true);
      expect(hasPermission('ADMIN', 'organization:delete')).toBe(false);
    });

    it('should deny MEMBER from managing organization', () => {
      expect(hasPermission('MEMBER', 'organization:update')).toBe(false);
      expect(hasPermission('MEMBER', 'members:invite')).toBe(false);
    });

    it('should allow VIEWER to only view content', () => {
      expect(hasPermission('VIEWER', 'posts:view')).toBe(true);
      expect(hasPermission('VIEWER', 'tasks:update')).toBe(false);
      expect(hasPermission('VIEWER', 'posts:create')).toBe(false);
    });
  });

  describe('hasAnyPermission', () => {
    it('should return true if user has at least one permission', () => {
      expect(hasAnyPermission('ADMIN', ['members:invite', 'organization:delete'])).toBe(true);
    });

    it('should return false if user has none of the permissions', () => {
      expect(hasAnyPermission('VIEWER', ['members:invite', 'organization:delete'])).toBe(false);
    });

    it('should return false for empty permission array', () => {
      expect(hasAnyPermission('OWNER', [])).toBe(false);
    });
  });

  describe('hasAllPermissions', () => {
    it('should return true if user has all permissions', () => {
      expect(hasAllPermissions('OWNER', ['organization:update', 'organization:delete'])).toBe(true);
    });

    it('should return false if user is missing any permission', () => {
      expect(hasAllPermissions('ADMIN', ['organization:update', 'organization:delete'])).toBe(false);
    });

    it('should return true for empty permission array', () => {
      expect(hasAllPermissions('MEMBER', [])).toBe(true);
    });
  });

  describe('getPermissions', () => {
    it('should return all OWNER permissions', () => {
      const permissions = getPermissions('OWNER');
      expect(permissions).toContain('organization:update');
      expect(permissions).toContain('organization:delete');
      expect(permissions).toContain('members:invite');
    });

    it('should return ADMIN permissions without organization delete', () => {
      const permissions = getPermissions('ADMIN');
      expect(permissions).toContain('organization:update');
      expect(permissions).toContain('members:invite');
      expect(permissions).not.toContain('organization:delete');
    });

    it('should return limited MEMBER permissions', () => {
      const permissions = getPermissions('MEMBER');
      expect(permissions).toContain('posts:view');
      expect(permissions).toContain('posts:create');
      expect(permissions).not.toContain('members:invite');
    });

    it('should return view-only VIEWER permissions', () => {
      const permissions = getPermissions('VIEWER');
      expect(permissions).toContain('posts:view');
      expect(permissions).not.toContain('posts:create');
      expect(permissions).not.toContain('tasks:update');
    });
  });

  describe('Role Helper Functions', () => {
    describe('canManageOrganization', () => {
      it('should allow OWNER and ADMIN', () => {
        expect(canManageOrganization('OWNER')).toBe(true);
        expect(canManageOrganization('ADMIN')).toBe(true);
      });

      it('should deny MEMBER and VIEWER', () => {
        expect(canManageOrganization('MEMBER')).toBe(false);
        expect(canManageOrganization('VIEWER')).toBe(false);
      });
    });

    describe('canInviteMembers', () => {
      it('should allow OWNER and ADMIN', () => {
        expect(canInviteMembers('OWNER')).toBe(true);
        expect(canInviteMembers('ADMIN')).toBe(true);
      });

      it('should deny MEMBER and VIEWER', () => {
        expect(canInviteMembers('MEMBER')).toBe(false);
        expect(canInviteMembers('VIEWER')).toBe(false);
      });
    });

    describe('canRemoveMembers', () => {
      it('should allow OWNER and ADMIN', () => {
        expect(canRemoveMembers('OWNER')).toBe(true);
        expect(canRemoveMembers('ADMIN')).toBe(true);
      });

      it('should deny MEMBER and VIEWER', () => {
        expect(canRemoveMembers('MEMBER')).toBe(false);
        expect(canRemoveMembers('VIEWER')).toBe(false);
      });
    });

    describe('canManageAnnouncements', () => {
      it('should allow OWNER and ADMIN', () => {
        expect(canManageAnnouncements('OWNER')).toBe(true);
        expect(canManageAnnouncements('ADMIN')).toBe(true);
      });

      it('should deny MEMBER and VIEWER', () => {
        expect(canManageAnnouncements('MEMBER')).toBe(false);
        expect(canManageAnnouncements('VIEWER')).toBe(false);
      });
    });

    describe('isOwner', () => {
      it('should return true only for OWNER', () => {
        expect(isOwner('OWNER')).toBe(true);
        expect(isOwner('ADMIN')).toBe(false);
        expect(isOwner('MEMBER')).toBe(false);
        expect(isOwner('VIEWER')).toBe(false);
      });
    });

    describe('isOwnerOrAdmin', () => {
      it('should return true for OWNER and ADMIN', () => {
        expect(isOwnerOrAdmin('OWNER')).toBe(true);
        expect(isOwnerOrAdmin('ADMIN')).toBe(true);
      });

      it('should return false for MEMBER and VIEWER', () => {
        expect(isOwnerOrAdmin('MEMBER')).toBe(false);
        expect(isOwnerOrAdmin('VIEWER')).toBe(false);
      });
    });

    describe('hasHigherRole', () => {
      it('should correctly compare role hierarchy', () => {
        // OWNER is highest
        expect(hasHigherRole('OWNER', 'ADMIN')).toBe(true);
        expect(hasHigherRole('OWNER', 'MEMBER')).toBe(true);
        expect(hasHigherRole('OWNER', 'VIEWER')).toBe(true);

        // ADMIN is higher than MEMBER and VIEWER
        expect(hasHigherRole('ADMIN', 'MEMBER')).toBe(true);
        expect(hasHigherRole('ADMIN', 'VIEWER')).toBe(true);
        expect(hasHigherRole('ADMIN', 'OWNER')).toBe(false);

        // MEMBER is higher than VIEWER only
        expect(hasHigherRole('MEMBER', 'VIEWER')).toBe(true);
        expect(hasHigherRole('MEMBER', 'ADMIN')).toBe(false);
        expect(hasHigherRole('MEMBER', 'OWNER')).toBe(false);

        // VIEWER is lowest
        expect(hasHigherRole('VIEWER', 'MEMBER')).toBe(false);
        expect(hasHigherRole('VIEWER', 'ADMIN')).toBe(false);
        expect(hasHigherRole('VIEWER', 'OWNER')).toBe(false);
      });

      it('should return false when comparing same roles', () => {
        expect(hasHigherRole('OWNER', 'OWNER')).toBe(false);
        expect(hasHigherRole('ADMIN', 'ADMIN')).toBe(false);
        expect(hasHigherRole('MEMBER', 'MEMBER')).toBe(false);
        expect(hasHigherRole('VIEWER', 'VIEWER')).toBe(false);
      });
    });
  });

  describe('Permission Edge Cases', () => {
    it('should handle invalid role gracefully', () => {
      // @ts-expect-error Testing invalid role
      const permissions = getPermissions('INVALID_ROLE');
      expect(permissions).toBeUndefined();
    });

    it('should handle case sensitivity', () => {
      // @ts-expect-error Testing lowercase role
      const permissions = getPermissions('owner' as any);
      expect(permissions).toBeUndefined();
    });
  });
});
