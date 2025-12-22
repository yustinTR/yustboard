'use client';

/**
 * RealtimeContext
 *
 * Provides centralized Supabase Realtime subscription management.
 * Handles connection lifecycle, organization-scoped events, and automatic reconnection.
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/lib/database/supabase';
import { useQueryClient } from '@tanstack/react-query';
import { REALTIME_TABLES, type RealtimeTable, type RealtimeStatus } from '@/lib/realtime/supabase-realtime';
import { invalidateRelatedQueries } from '@/lib/query/client';
import { createDebouncedInvalidation, getDelayForTable } from '@/lib/realtime/debounce-invalidation';

interface RealtimeContextValue {
  status: RealtimeStatus;
  organizationId: string | null;
  isEnabled: boolean;
}

const RealtimeContext = createContext<RealtimeContextValue>({
  status: 'disconnected',
  organizationId: null,
  isEnabled: false,
});

interface RealtimeProviderProps {
  children: React.ReactNode;
  fallbackToPolling?: boolean;
}

export function RealtimeProvider({
  children,
  fallbackToPolling = true,
}: RealtimeProviderProps) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<RealtimeStatus>('disconnected');
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 3;

  // Check if Realtime is enabled via environment variable
  const isEnabled = process.env.NEXT_PUBLIC_ENABLE_REALTIME !== 'false';

  // Create debounced invalidation function
  const debouncedInvalidate = useCallback(
    createDebouncedInvalidation(queryClient),
    [queryClient]
  );

  // Fetch user's organization on session change
  useEffect(() => {
    if (!session?.user?.id) {
      setOrganizationId(null);
      return;
    }

    // Get organization from session or fetch it
    const orgId = (session.user as { organizationId?: string }).organizationId;
    if (orgId) {
      setOrganizationId(orgId);
    } else {
      // Fallback: fetch from API
      fetch('/api/user/organizations')
        .then(res => res.json())
        .then(data => {
          if (data.organizations?.[0]?.id) {
            setOrganizationId(data.organizations[0].id);
          }
        })
        .catch(console.error);
    }
  }, [session?.user?.id]);

  // Initialize Realtime channel
  useEffect(() => {
    if (!supabase || !organizationId || !isEnabled) {
      setStatus('disconnected');
      return;
    }

    const setupChannel = () => {
      if (!supabase) return; // Extra guard for TypeScript

      setStatus('connecting');

      const channelName = `org-${organizationId}`;
      const tables: RealtimeTable[] = [
        REALTIME_TABLES.POST,
        REALTIME_TABLES.POST_COMMENT,
        REALTIME_TABLES.POST_LIKE,
        REALTIME_TABLES.TASK,
      ];

      let channel = supabase.channel(channelName);

      // Subscribe to each table with organization filter
      tables.forEach(table => {
        channel = channel.on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: table,
            filter: `organizationId=eq.${organizationId}`,
          },
          (payload) => {
            if (process.env.NODE_ENV === 'development') {
              console.log(`[Realtime] ${payload.eventType} on ${payload.table}`, payload);
            }

            // Get appropriate delay for this table
            const delay = getDelayForTable(payload.table);

            // Invalidate related queries with debouncing
            if (delay === 0) {
              invalidateRelatedQueries(queryClient, payload.table as RealtimeTable);
            } else {
              // Use debounced invalidation for frequent updates
              const affectedKeys = getAffectedKeysForTable(payload.table as RealtimeTable);
              affectedKeys.forEach(key => debouncedInvalidate(key, delay));
            }
          }
        );
      });

      // Subscribe to the channel
      channel.subscribe((subscriptionStatus, err) => {
        if (subscriptionStatus === 'SUBSCRIBED') {
          setStatus('connected');
          reconnectAttemptsRef.current = 0;
          if (process.env.NODE_ENV === 'development') {
            console.log(`[Realtime] Connected to channel: ${channelName}`);
          }
        } else if (subscriptionStatus === 'CHANNEL_ERROR' || err) {
          console.error('[Realtime] Channel error:', err);
          setStatus('error');
          handleReconnect();
        } else if (subscriptionStatus === 'CLOSED') {
          setStatus('disconnected');
        }
      });

      channelRef.current = channel;
    };

    const handleReconnect = () => {
      if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
        console.warn('[Realtime] Max reconnection attempts reached, falling back to polling');
        setStatus('error');
        return;
      }

      reconnectAttemptsRef.current += 1;
      const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 10000);

      if (process.env.NODE_ENV === 'development') {
        console.log(`[Realtime] Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current})`);
      }

      setTimeout(() => {
        if (channelRef.current) {
          supabase?.removeChannel(channelRef.current);
        }
        setupChannel();
      }, delay);
    };

    setupChannel();

    // Cleanup on unmount or organization change
    return () => {
      if (channelRef.current && supabase) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [organizationId, isEnabled, queryClient, debouncedInvalidate]);

  // Also set up a user-specific notification channel
  useEffect(() => {
    if (!supabase || !session?.user?.id || !isEnabled) {
      return;
    }

    const userId = session.user.id;
    const channelName = `notifications-${userId}`;

    const notificationChannel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'Notification',
          filter: `userId=eq.${userId}`,
        },
        (payload) => {
          if (process.env.NODE_ENV === 'development') {
            console.log('[Realtime] New notification:', payload);
          }
          // Immediately invalidate notifications (no debounce)
          invalidateRelatedQueries(queryClient, REALTIME_TABLES.NOTIFICATION);
        }
      )
      .subscribe();

    return () => {
      if (supabase) {
        supabase.removeChannel(notificationChannel);
      }
    };
  }, [session?.user?.id, isEnabled, queryClient]);

  return (
    <RealtimeContext.Provider
      value={{
        status,
        organizationId,
        isEnabled,
      }}
    >
      {children}
    </RealtimeContext.Provider>
  );
}

/**
 * Hook to access Realtime context
 */
export function useRealtimeContext() {
  const context = useContext(RealtimeContext);
  return context;
}

/**
 * Hook to check if Realtime is connected
 */
export function useRealtimeStatus() {
  const { status, isEnabled } = useRealtimeContext();
  return {
    isConnected: status === 'connected',
    isConnecting: status === 'connecting',
    isError: status === 'error',
    isDisabled: !isEnabled,
    status,
  };
}

/**
 * Helper to get affected query keys for a table
 */
function getAffectedKeysForTable(table: RealtimeTable): unknown[][] {
  const mapping: Record<RealtimeTable, unknown[][]> = {
    [REALTIME_TABLES.POST]: [
      ['timeline', 'posts'],
      ['activity'],
    ],
    [REALTIME_TABLES.POST_COMMENT]: [
      ['timeline'],
      ['activity'],
    ],
    [REALTIME_TABLES.POST_LIKE]: [
      ['timeline', 'posts'],
      ['activity'],
    ],
    [REALTIME_TABLES.NOTIFICATION]: [
      ['notifications'],
    ],
    [REALTIME_TABLES.TASK]: [
      ['tasks'],
      ['activity'],
    ],
  };

  return mapping[table] || [];
}
