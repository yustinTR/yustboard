'use client';

/**
 * useRealtime Hook
 *
 * Per-component hook for subscribing to Supabase Realtime changes.
 * Provides status information and automatic cleanup.
 */

import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRealtimeContext } from '@/contexts/RealtimeContext';
import { type RealtimeTable, REALTIME_TABLES } from '@/lib/realtime/supabase-realtime';
import { invalidateRelatedQueries } from '@/lib/query/client';
import { getDelayForTable } from '@/lib/realtime/debounce-invalidation';

interface UseRealtimeOptions {
  /**
   * Tables to subscribe to
   */
  tables?: RealtimeTable[];

  /**
   * Whether Realtime subscription is enabled
   * @default true
   */
  enabled?: boolean;

  /**
   * Callback when a Realtime event occurs
   */
  onEvent?: (payload: {
    eventType: 'INSERT' | 'UPDATE' | 'DELETE';
    table: string;
    new: Record<string, unknown>;
    old: Record<string, unknown> | null;
  }) => void;

  /**
   * Fallback polling interval in ms when Realtime is not available
   * Set to 0 or false to disable fallback polling
   * @default 30000
   */
  fallbackPollingInterval?: number | false;

  /**
   * Callback to execute for fallback polling
   */
  onPoll?: () => void;
}

interface UseRealtimeReturn {
  /**
   * Current Realtime connection status
   */
  status: 'connecting' | 'connected' | 'disconnected' | 'error';

  /**
   * Whether currently using Realtime (vs polling fallback)
   */
  isUsingRealtime: boolean;

  /**
   * Whether using polling as fallback
   */
  isUsingPolling: boolean;

  /**
   * Manually trigger a refresh
   */
  refresh: () => void;
}

export function useRealtime(options: UseRealtimeOptions = {}): UseRealtimeReturn {
  const {
    tables = [REALTIME_TABLES.POST, REALTIME_TABLES.POST_COMMENT, REALTIME_TABLES.POST_LIKE],
    enabled = true,
    onEvent,
    fallbackPollingInterval = 30000,
    onPoll,
  } = options;

  const { status, isEnabled } = useRealtimeContext();
  const queryClient = useQueryClient();
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Determine if we should use polling as fallback
  const shouldPoll = enabled &&
    fallbackPollingInterval !== false &&
    fallbackPollingInterval > 0 &&
    (status !== 'connected' || !isEnabled);

  const isUsingRealtime = enabled && isEnabled && status === 'connected';
  const isUsingPolling = shouldPoll;

  // Set up fallback polling
  useEffect(() => {
    if (shouldPoll && onPoll) {
      // Initial poll
      onPoll();

      // Set up interval
      pollingIntervalRef.current = setInterval(onPoll, fallbackPollingInterval as number);

      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      };
    } else {
      // Clear polling when Realtime is connected
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    }
  }, [shouldPoll, onPoll, fallbackPollingInterval]);

  // Refresh function to manually trigger updates
  const refresh = useCallback(() => {
    tables.forEach(table => {
      invalidateRelatedQueries(queryClient, table);
    });
  }, [tables, queryClient]);

  return {
    status,
    isUsingRealtime,
    isUsingPolling,
    refresh,
  };
}

/**
 * Simplified hook for timeline Realtime updates
 */
export function useTimelineRealtime(options?: {
  enabled?: boolean;
  fallbackPollingInterval?: number | false;
  onPoll?: () => void;
}) {
  return useRealtime({
    tables: [
      REALTIME_TABLES.POST,
      REALTIME_TABLES.POST_COMMENT,
      REALTIME_TABLES.POST_LIKE,
    ],
    ...options,
  });
}

/**
 * Simplified hook for activity feed Realtime updates
 */
export function useActivityRealtime(options?: {
  enabled?: boolean;
  fallbackPollingInterval?: number | false;
  onPoll?: () => void;
}) {
  return useRealtime({
    tables: [
      REALTIME_TABLES.POST,
      REALTIME_TABLES.POST_COMMENT,
      REALTIME_TABLES.POST_LIKE,
      REALTIME_TABLES.TASK,
    ],
    ...options,
  });
}

/**
 * Simplified hook for notifications Realtime updates
 */
export function useNotificationsRealtime(options?: {
  enabled?: boolean;
  fallbackPollingInterval?: number | false;
  onPoll?: () => void;
}) {
  return useRealtime({
    tables: [REALTIME_TABLES.NOTIFICATION],
    fallbackPollingInterval: options?.fallbackPollingInterval ?? 10000,
    ...options,
  });
}
