'use client';

import React, { useState } from 'react';
import { useBillingStatus } from '@/hooks/useBillingStatus';
import { PlanCard } from './PlanCard';
import {
  CreditCard,
  Users,
  LayoutGrid,
  Calendar,
  AlertTriangle,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import type { PlanType } from '@/types/billing';

const PLAN_ORDER: PlanType[] = ['FREE', 'STARTER', 'PRO', 'ENTERPRISE'];

export function BillingDashboard() {
  const { status, loading, error, createCheckoutSession, openCustomerPortal } =
    useBillingStatus();
  const [upgrading, setUpgrading] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || !status) {
    return (
      <div className="backdrop-blur-md bg-red-500/10 border border-red-500/30 rounded-xl p-6">
        <div className="flex items-center text-red-600 dark:text-red-400">
          <AlertTriangle className="w-5 h-5 mr-2" />
          <span>Fout bij laden billing status: {error}</span>
        </div>
      </div>
    );
  }

  const handlePlanSelect = async (plan: PlanType) => {
    if (plan === 'FREE') {
      // Downgrade requires canceling subscription via Customer Portal
      alert(
        'Om te downgraden naar FREE, annuleer je huidige abonnement via de billing portal.'
      );
      return;
    }

    try {
      setUpgrading(true);
      await createCheckoutSession(plan);
    } catch {
      alert(
        'Er ging iets mis bij het aanmaken van de checkout sessie. Probeer het opnieuw.'
      );
      setUpgrading(false);
    }
  };

  const handleManageBilling = async () => {
    try {
      await openCustomerPortal();
    } catch {
      alert(
        'Er ging iets mis bij het openen van de billing portal. Probeer het opnieuw.'
      );
    }
  };

  const isTrialing = status.organization.subscriptionStatus === 'TRIALING';
  const isPastDue = status.organization.subscriptionStatus === 'PAST_DUE';
  const isCanceled = status.organization.subscriptionStatus === 'CANCELED';

  // Calculate usage percentages
  const userUsagePercent = status.planConfig.features.maxUsers
    ? (status.usage.users.current / status.planConfig.features.maxUsers) * 100
    : 0;
  const widgetUsagePercent = status.planConfig.features.maxWidgets
    ? (status.usage.widgets.current / status.planConfig.features.maxWidgets) *
      100
    : 0;

  return (
    <div className="space-y-6">
      {/* Current Plan Overview */}
      <div className="backdrop-blur-md bg-white/10 dark:bg-gray-900/10 border border-white/20 dark:border-gray-700/30 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Huidig Abonnement
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Plan info */}
          <div>
            <div className="flex items-baseline mb-2">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                {status.planConfig.name}
              </span>
              {status.organization.plan !== 'FREE' && (
                <span className="ml-2 text-gray-600 dark:text-gray-400">
                  €{status.planConfig.price}/maand
                </span>
              )}
            </div>

            {/* Status badges */}
            <div className="flex flex-wrap gap-2 mt-3">
              {isTrialing && (
                <span className="px-3 py-1 bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full text-sm font-semibold">
                  Trial actief
                </span>
              )}
              {isPastDue && (
                <span className="px-3 py-1 bg-red-500/20 text-red-600 dark:text-red-400 rounded-full text-sm font-semibold flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  Betaling mislukt
                </span>
              )}
              {isCanceled && (
                <span className="px-3 py-1 bg-gray-500/20 text-gray-600 dark:text-gray-400 rounded-full text-sm font-semibold">
                  Geannuleerd
                </span>
              )}
            </div>

            {/* Renewal/Trial info */}
            {status.organization.currentPeriodEnd && (
              <div className="mt-4 flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Calendar className="w-4 h-4 mr-2" />
                <span>
                  {status.organization.cancelAtPeriodEnd
                    ? 'Verloopt op '
                    : isTrialing
                    ? 'Trial eindigt '
                    : 'Vernieuwt op '}
                  {new Date(
                    status.organization.currentPeriodEnd
                  ).toLocaleDateString('nl-NL')}
                </span>
              </div>
            )}
          </div>

          {/* Usage stats */}
          <div className="space-y-4">
            {/* Users */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                  <Users className="w-4 h-4 mr-2" />
                  Users
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {status.usage.users.current} /{' '}
                  {status.usage.users.limit === null
                    ? '∞'
                    : status.usage.users.limit}
                </span>
              </div>
              {status.usage.users.limit !== null && (
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      userUsagePercent >= 90
                        ? 'bg-red-500'
                        : userUsagePercent >= 70
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(userUsagePercent, 100)}%` }}
                  />
                </div>
              )}
            </div>

            {/* Widgets */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                  <LayoutGrid className="w-4 h-4 mr-2" />
                  Widgets
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {status.usage.widgets.current} /{' '}
                  {status.usage.widgets.limit === null
                    ? '∞'
                    : status.usage.widgets.limit}
                </span>
              </div>
              {status.usage.widgets.limit !== null && (
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      widgetUsagePercent >= 90
                        ? 'bg-red-500'
                        : widgetUsagePercent >= 70
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(widgetUsagePercent, 100)}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Manage billing button */}
        {status.canManageBilling &&
          status.organization.stripeSubscriptionId && (
            <div className="mt-6 pt-6 border-t border-white/10 dark:border-gray-700/30">
              <button
                onClick={handleManageBilling}
                className="flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 dark:bg-gray-800/20 dark:hover:bg-gray-800/30 border border-white/30 dark:border-gray-600/30 rounded-lg transition-all duration-200 text-gray-900 dark:text-white font-semibold"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Beheer betaalmethode & facturen
                <ExternalLink className="w-4 h-4 ml-2" />
              </button>
            </div>
          )}
      </div>

      {/* Plan selection */}
      {status.canManageBilling && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Beschikbare Plannen
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PLAN_ORDER.map((planType) => {
              // Get plan config from PLAN_CONFIG
              const planConfig = {
                FREE: {
                  name: 'Free',
                  price: 0,
                  currency: 'eur',
                  features: {
                    maxUsers: 1,
                    maxWidgets: 3,
                    dataRetention: 30,
                    features: [
                      'Basis widgets',
                      'Persoonlijk dashboard',
                      '30 dagen data behoud',
                      'Community support',
                    ],
                  },
                },
                STARTER: {
                  name: 'Starter',
                  price: 9,
                  currency: 'eur',
                  features: {
                    maxUsers: 3,
                    maxWidgets: 10,
                    dataRetention: 90,
                    features: [
                      'Alle widgets',
                      'Team sharing (3 users)',
                      'Custom themes',
                      '90 dagen data behoud',
                      'Email support',
                    ],
                  },
                },
                PRO: {
                  name: 'Pro',
                  price: 29,
                  currency: 'eur',
                  features: {
                    maxUsers: 10,
                    maxWidgets: null,
                    dataRetention: 365,
                    features: [
                      'Onbeperkte widgets',
                      'Team collaboration (10 users)',
                      'API toegang',
                      'Custom integraties',
                      'Advanced analytics',
                      '1 jaar data behoud',
                      'Priority support',
                    ],
                  },
                },
                ENTERPRISE: {
                  name: 'Enterprise',
                  price: 99,
                  currency: 'eur',
                  features: {
                    maxUsers: null,
                    maxWidgets: null,
                    dataRetention: null,
                    features: [
                      'Alles uit Pro',
                      'Onbeperkte users',
                      'SSO (Single Sign-On)',
                      'White-label branding',
                      'Dedicated support',
                      'On-premise optie',
                      'SLA garantie',
                      'Onbeperkte data behoud',
                    ],
                  },
                },
              }[planType];

              return (
                <PlanCard
                  key={planType}
                  plan={planType}
                  config={planConfig}
                  currentPlan={status.organization.plan}
                  onSelect={handlePlanSelect}
                  disabled={upgrading}
                  recommended={planType === 'PRO'}
                />
              );
            })}
          </div>

          {upgrading && (
            <div className="mt-6 flex items-center justify-center text-blue-500">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              <span>Redirect naar Stripe Checkout...</span>
            </div>
          )}
        </div>
      )}

      {/* Non-owner message */}
      {!status.canManageBilling && (
        <div className="backdrop-blur-md bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
          <div className="flex items-center text-yellow-600 dark:text-yellow-400">
            <AlertTriangle className="w-5 h-5 mr-2" />
            <span>
              Alleen organization owners kunnen het abonnement beheren.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
