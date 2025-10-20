'use client';

import { useState, useEffect } from 'react';
import type { BillingStatus } from '@/types/billing';

export function useBillingStatus() {
  const [status, setStatus] = useState<BillingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBillingStatus();
  }, []);

  const fetchBillingStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/billing/status');

      if (!response.ok) {
        throw new Error('Failed to fetch billing status');
      }

      const data = await response.json();
      setStatus(data);
    } catch (err) {
      console.error('Error fetching billing status:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const createCheckoutSession = async (plan: string) => {
    try {
      const response = await fetch('/api/billing/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();

      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (err) {
      console.error('Error creating checkout session:', err);
      throw err;
    }
  };

  const openCustomerPortal = async () => {
    try {
      const response = await fetch('/api/billing/customer-portal', {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to open customer portal');
      }

      const { url } = await response.json();

      // Redirect to Stripe Customer Portal
      window.location.href = url;
    } catch (err) {
      console.error('Error opening customer portal:', err);
      throw err;
    }
  };

  return {
    status,
    loading,
    error,
    refetch: fetchBillingStatus,
    createCheckoutSession,
    openCustomerPortal,
  };
}
