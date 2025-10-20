// Billing and subscription types

export type PlanType = 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE';

export type SubscriptionStatus =
  | 'ACTIVE'
  | 'TRIALING'
  | 'PAST_DUE'
  | 'CANCELED'
  | 'UNPAID'
  | 'INCOMPLETE';

export interface PlanFeatures {
  maxUsers: number | null; // null = unlimited
  maxWidgets: number | null; // null = unlimited
  dataRetention: number | null; // days, null = unlimited
  features: string[];
}

export interface PlanConfig {
  name: string;
  price: number;
  currency: string;
  features: PlanFeatures;
}

export interface BillingOrganization {
  id: string;
  name: string;
  plan: PlanType;
  subscriptionStatus: SubscriptionStatus | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  trialEndsAt: string | null;
  stripeSubscriptionId: string | null;
}

export interface SubscriptionDetails {
  id: string;
  status: string;
  currentPeriodEnd: number;
  cancelAtPeriodEnd: boolean;
  canceledAt: number | null;
}

export interface UsageInfo {
  users: {
    current: number;
    limit: number | null;
  };
  widgets: {
    current: number;
    limit: number | null;
  };
}

export interface BillingStatus {
  organization: BillingOrganization;
  planConfig: PlanConfig;
  usage: UsageInfo;
  subscription: SubscriptionDetails | null;
  canManageBilling: boolean;
}
