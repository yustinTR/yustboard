import Stripe from 'stripe';

// Lazy initialization to avoid build-time errors
let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set');
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-09-30.clover',
      typescript: true,
    });
  }
  return stripeInstance;
}

// Convenience export for direct use (calls getStripe internally)
export const stripe = new Proxy({} as Stripe, {
  get: (_target, prop) => {
    const instance = getStripe();
    return instance[prop as keyof Stripe];
  },
});

// Plan configuration with pricing and features
export const PLAN_CONFIG = {
  FREE: {
    name: 'Free',
    price: 0,
    priceId: null, // No Stripe price ID for free plan
    currency: 'eur',
    interval: 'month' as const,
    features: {
      maxUsers: 1,
      maxWidgets: 3,
      dataRetention: 30, // days
      features: [
        'Basis widgets',
        'Persoonlijk dashboard',
        '30 dagen data behoud',
        'Community support'
      ]
    }
  },
  STARTER: {
    name: 'Starter',
    price: 9,
    priceId: process.env.STRIPE_PRICE_STARTER, // Set in environment
    currency: 'eur',
    interval: 'month' as const,
    features: {
      maxUsers: 3,
      maxWidgets: 10,
      dataRetention: 90,
      features: [
        'Alle widgets',
        'Team sharing (3 users)',
        'Custom themes',
        '90 dagen data behoud',
        'Email support'
      ]
    }
  },
  PRO: {
    name: 'Pro',
    price: 29,
    priceId: process.env.STRIPE_PRICE_PRO,
    currency: 'eur',
    interval: 'month' as const,
    features: {
      maxUsers: 10,
      maxWidgets: null, // unlimited
      dataRetention: 365,
      features: [
        'Onbeperkte widgets',
        'Team collaboration (10 users)',
        'API toegang',
        'Custom integraties',
        'Advanced analytics',
        '1 jaar data behoud',
        'Priority support'
      ]
    }
  },
  ENTERPRISE: {
    name: 'Enterprise',
    price: 99,
    priceId: process.env.STRIPE_PRICE_ENTERPRISE,
    currency: 'eur',
    interval: 'month' as const,
    features: {
      maxUsers: null, // unlimited
      maxWidgets: null, // unlimited
      dataRetention: null, // unlimited
      features: [
        'Alles uit Pro',
        'Onbeperkte users',
        'SSO (Single Sign-On)',
        'White-label branding',
        'Dedicated support',
        'On-premise optie',
        'SLA garantie',
        'Onbeperkte data behoud'
      ]
    }
  }
} as const;

export type PlanType = keyof typeof PLAN_CONFIG;

// Helper to get plan configuration
export function getPlanConfig(plan: PlanType) {
  return PLAN_CONFIG[plan];
}

// Helper to check if plan is valid
export function isValidPlan(plan: string): plan is PlanType {
  return plan in PLAN_CONFIG;
}

// Trial configuration
export const TRIAL_DAYS = 14;

// Backward compatibility with old PLANS structure for tests
export const PLANS = {
  FREE: {
    price: PLAN_CONFIG.FREE.price,
    maxUsers: PLAN_CONFIG.FREE.features.maxUsers,
    maxWidgets: PLAN_CONFIG.FREE.features.maxWidgets,
    features: ['basic-dashboard', ...PLAN_CONFIG.FREE.features.features],
    trialDays: 0,
  },
  STARTER: {
    price: PLAN_CONFIG.STARTER.price,
    maxUsers: PLAN_CONFIG.STARTER.features.maxUsers,
    maxWidgets: PLAN_CONFIG.STARTER.features.maxWidgets,
    features: ['basic-dashboard', 'team-collaboration', ...PLAN_CONFIG.STARTER.features.features],
    trialDays: TRIAL_DAYS,
  },
  PRO: {
    price: PLAN_CONFIG.PRO.price,
    maxUsers: PLAN_CONFIG.PRO.features.maxUsers,
    maxWidgets: PLAN_CONFIG.PRO.features.maxWidgets,
    features: ['basic-dashboard', 'team-collaboration', 'advanced-analytics', ...PLAN_CONFIG.PRO.features.features],
    trialDays: TRIAL_DAYS,
  },
  ENTERPRISE: {
    price: PLAN_CONFIG.ENTERPRISE.price,
    maxUsers: PLAN_CONFIG.ENTERPRISE.features.maxUsers,
    maxWidgets: PLAN_CONFIG.ENTERPRISE.features.maxWidgets,
    features: ['basic-dashboard', 'team-collaboration', 'advanced-analytics', 'sso', 'priority-support', 'custom-integrations', ...PLAN_CONFIG.ENTERPRISE.features.features],
    trialDays: 0,
  },
};

// Helper functions for tests
export function getPlanLimits(plan: PlanType) {
  return PLANS[plan as keyof typeof PLANS];
}

export function getPlanPrice(plan: PlanType) {
  return PLAN_CONFIG[plan]?.price;
}

export function canUpgradePlan(currentPlan: PlanType, targetPlan: PlanType): boolean {
  const planOrder: PlanType[] = ['FREE', 'STARTER', 'PRO', 'ENTERPRISE'];
  const currentIndex = planOrder.indexOf(currentPlan);
  const targetIndex = planOrder.indexOf(targetPlan);
  return targetIndex > currentIndex;
}

export function canDowngradePlan(currentPlan: PlanType, targetPlan: PlanType): boolean {
  const planOrder: PlanType[] = ['FREE', 'STARTER', 'PRO', 'ENTERPRISE'];
  const currentIndex = planOrder.indexOf(currentPlan);
  const targetIndex = planOrder.indexOf(targetPlan);
  return targetIndex < currentIndex;
}
