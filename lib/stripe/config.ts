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
