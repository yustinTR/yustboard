import { describe, it, expect } from 'vitest';
import { PLANS, getPlanLimits, getPlanPrice, canUpgradePlan, canDowngradePlan } from './config';

describe('Stripe Plans Configuration', () => {
  describe('PLANS constant', () => {
    it('should have all 4 plan tiers', () => {
      expect(PLANS).toHaveProperty('FREE');
      expect(PLANS).toHaveProperty('STARTER');
      expect(PLANS).toHaveProperty('PRO');
      expect(PLANS).toHaveProperty('ENTERPRISE');
    });

    it('should have correct pricing structure', () => {
      expect(PLANS.FREE.price).toBe(0);
      expect(PLANS.STARTER.price).toBe(9);
      expect(PLANS.PRO.price).toBe(29);
      expect(PLANS.ENTERPRISE.price).toBe(99);
    });

    it('should have progressive user limits', () => {
      expect(PLANS.FREE.maxUsers).toBe(1);
      expect(PLANS.STARTER.maxUsers).toBe(3);
      expect(PLANS.PRO.maxUsers).toBe(10);
      expect(PLANS.ENTERPRISE.maxUsers).toBe(null); // unlimited
    });

    it('should have progressive widget limits', () => {
      expect(PLANS.FREE.maxWidgets).toBe(3);
      expect(PLANS.STARTER.maxWidgets).toBe(10);
      expect(PLANS.PRO.maxWidgets).toBe(null); // unlimited
      expect(PLANS.ENTERPRISE.maxWidgets).toBe(null); // unlimited
    });

    it('should have correct trial periods', () => {
      expect(PLANS.FREE.trialDays).toBe(0);
      expect(PLANS.STARTER.trialDays).toBe(14);
      expect(PLANS.PRO.trialDays).toBe(14);
      expect(PLANS.ENTERPRISE.trialDays).toBe(0); // Contact sales
    });
  });

  describe('getPlanLimits', () => {
    it('should return correct limits for FREE plan', () => {
      const limits = getPlanLimits('FREE');
      expect(limits.maxUsers).toBe(1);
      expect(limits.maxWidgets).toBe(3);
      expect(limits.features).toContain('basic-dashboard');
    });

    it('should return correct limits for STARTER plan', () => {
      const limits = getPlanLimits('STARTER');
      expect(limits.maxUsers).toBe(3);
      expect(limits.maxWidgets).toBe(10);
      expect(limits.features).toContain('team-collaboration');
    });

    it('should return correct limits for PRO plan', () => {
      const limits = getPlanLimits('PRO');
      expect(limits.maxUsers).toBe(10);
      expect(limits.maxWidgets).toBe(null); // unlimited
      expect(limits.features).toContain('advanced-analytics');
    });

    it('should return correct limits for ENTERPRISE plan', () => {
      const limits = getPlanLimits('ENTERPRISE');
      expect(limits.maxUsers).toBe(null); // unlimited
      expect(limits.maxWidgets).toBe(null); // unlimited
      expect(limits.features).toContain('priority-support');
      expect(limits.features).toContain('custom-integrations');
    });

    it('should handle invalid plan gracefully', () => {
      // @ts-expect-error Testing invalid plan
      const limits = getPlanLimits('INVALID');
      expect(limits).toBeUndefined();
    });
  });

  describe('getPlanPrice', () => {
    it('should return correct prices for all plans', () => {
      expect(getPlanPrice('FREE')).toBe(0);
      expect(getPlanPrice('STARTER')).toBe(9);
      expect(getPlanPrice('PRO')).toBe(29);
      expect(getPlanPrice('ENTERPRISE')).toBe(99);
    });

    it('should return undefined for invalid plan', () => {
      // @ts-expect-error Testing invalid plan
      expect(getPlanPrice('INVALID')).toBeUndefined();
    });
  });

  describe('Usage Limit Validation', () => {
    it('should validate FREE plan user limit', () => {
      const limits = getPlanLimits('FREE');
      const currentUsers = 1;
      const exceedsLimit = currentUsers >= (limits.maxUsers || Infinity);
      expect(exceedsLimit).toBe(true);
    });

    it('should validate STARTER plan widget limit', () => {
      const limits = getPlanLimits('STARTER');
      const currentWidgets = 8;
      const exceedsLimit = currentWidgets >= (limits.maxWidgets || Infinity);
      expect(exceedsLimit).toBe(false);
    });

    it('should handle unlimited limits correctly', () => {
      const proLimits = getPlanLimits('PRO');
      const currentWidgets = 1000;
      const exceedsLimit = currentWidgets >= (proLimits.maxWidgets || Infinity);
      expect(exceedsLimit).toBe(false); // Should never exceed unlimited
    });
  });

  describe('canUpgradePlan', () => {
    it('should allow upgrade from FREE to any paid plan', () => {
      expect(canUpgradePlan('FREE', 'STARTER')).toBe(true);
      expect(canUpgradePlan('FREE', 'PRO')).toBe(true);
      expect(canUpgradePlan('FREE', 'ENTERPRISE')).toBe(true);
    });

    it('should allow upgrade within paid plans', () => {
      expect(canUpgradePlan('STARTER', 'PRO')).toBe(true);
      expect(canUpgradePlan('STARTER', 'ENTERPRISE')).toBe(true);
      expect(canUpgradePlan('PRO', 'ENTERPRISE')).toBe(true);
    });

    it('should not allow downgrade', () => {
      expect(canUpgradePlan('PRO', 'STARTER')).toBe(false);
      expect(canUpgradePlan('ENTERPRISE', 'PRO')).toBe(false);
      expect(canUpgradePlan('STARTER', 'FREE')).toBe(false);
    });

    it('should not allow upgrade to same plan', () => {
      expect(canUpgradePlan('FREE', 'FREE')).toBe(false);
      expect(canUpgradePlan('STARTER', 'STARTER')).toBe(false);
    });
  });

  describe('canDowngradePlan', () => {
    it('should allow downgrade from paid plans to FREE', () => {
      expect(canDowngradePlan('STARTER', 'FREE')).toBe(true);
      expect(canDowngradePlan('PRO', 'FREE')).toBe(true);
      expect(canDowngradePlan('ENTERPRISE', 'FREE')).toBe(true);
    });

    it('should allow downgrade within paid plans', () => {
      expect(canDowngradePlan('ENTERPRISE', 'PRO')).toBe(true);
      expect(canDowngradePlan('ENTERPRISE', 'STARTER')).toBe(true);
      expect(canDowngradePlan('PRO', 'STARTER')).toBe(true);
    });

    it('should not allow upgrade', () => {
      expect(canDowngradePlan('FREE', 'STARTER')).toBe(false);
      expect(canDowngradePlan('STARTER', 'PRO')).toBe(false);
    });

    it('should not allow downgrade to same plan', () => {
      expect(canDowngradePlan('PRO', 'PRO')).toBe(false);
    });
  });

  describe('Feature Flags', () => {
    it('should have correct features for each plan', () => {
      expect(PLANS.FREE.features).toContain('basic-dashboard');
      expect(PLANS.STARTER.features).toContain('team-collaboration');
      expect(PLANS.PRO.features).toContain('advanced-analytics');
      expect(PLANS.ENTERPRISE.features).toContain('sso');
    });

    it('should not have advanced features in FREE plan', () => {
      expect(PLANS.FREE.features).not.toContain('team-collaboration');
      expect(PLANS.FREE.features).not.toContain('advanced-analytics');
      expect(PLANS.FREE.features).not.toContain('sso');
    });

    it('should have cumulative features in higher plans', () => {
      // PRO should have STARTER features
      expect(PLANS.PRO.features).toContain('team-collaboration');

      // ENTERPRISE should have all features
      expect(PLANS.ENTERPRISE.features).toContain('basic-dashboard');
      expect(PLANS.ENTERPRISE.features).toContain('team-collaboration');
      expect(PLANS.ENTERPRISE.features).toContain('advanced-analytics');
    });
  });

  describe('Plan Hierarchy', () => {
    const planOrder = ['FREE', 'STARTER', 'PRO', 'ENTERPRISE'] as const;

    it('should have increasing prices', () => {
      for (let i = 0; i < planOrder.length - 1; i++) {
        const currentPrice = PLANS[planOrder[i]].price;
        const nextPrice = PLANS[planOrder[i + 1]].price;
        expect(nextPrice).toBeGreaterThanOrEqual(currentPrice);
      }
    });

    it('should have increasing or equal limits', () => {
      for (let i = 0; i < planOrder.length - 1; i++) {
        const currentPlan = PLANS[planOrder[i]];
        const nextPlan = PLANS[planOrder[i + 1]];

        // Check user limits (null means unlimited)
        if (nextPlan.maxUsers !== null && currentPlan.maxUsers !== null) {
          expect(nextPlan.maxUsers).toBeGreaterThanOrEqual(currentPlan.maxUsers);
        }

        // Check widget limits (null means unlimited)
        if (nextPlan.maxWidgets !== null && currentPlan.maxWidgets !== null) {
          expect(nextPlan.maxWidgets).toBeGreaterThanOrEqual(currentPlan.maxWidgets);
        }
      }
    });
  });
});
