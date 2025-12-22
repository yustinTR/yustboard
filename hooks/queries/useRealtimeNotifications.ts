'use client';

/**
 * useRealtimeNotifications Hook
 *
 * Combines React Query with Supabase Realtime for instant notification updates.
 * Falls back to polling when Realtime is unavailable.
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { queryKeys } from '@/lib/query/client';
import { useRealtimeContext } from '@/contexts/RealtimeContext';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  readAt: Date | null;
  createdAt: Date;
}

interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
}

async function fetchNotifications(limit: number = 10): Promise<NotificationsResponse> {
  const response = await fetch(`/api/notifications?limit=${limit}`);
  if (!response.ok) {
    throw new Error('Failed to fetch notifications');
  }
  return response.json();
}

interface UseRealtimeNotificationsOptions {
  /**
   * Maximum number of notifications to fetch
   * @default 10
   */
  limit?: number;

  /**
   * Fallback polling interval when Realtime is unavailable
   * @default 10000 (10 seconds)
   */
  fallbackPollingInterval?: number;
}

export function useRealtimeNotifications(options: UseRealtimeNotificationsOptions = {}) {
  const { limit = 10, fallbackPollingInterval = 10000 } = options;
  const { status: realtimeStatus, isEnabled } = useRealtimeContext();
  const queryClient = useQueryClient();

  // Determine if we should use polling
  const isRealtimeConnected = isEnabled && realtimeStatus === 'connected';
  const shouldPoll = !isRealtimeConnected && fallbackPollingInterval > 0;

  const query = useQuery({
    queryKey: queryKeys.notifications.list(limit),
    queryFn: () => fetchNotifications(limit),
    staleTime: 10 * 1000, // 10 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: shouldPoll ? fallbackPollingInterval : false,
    refetchOnWindowFocus: true,
  });

  // Manual refresh function
  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
  }, [queryClient]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
      });
      // Invalidate to refresh the list
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, [queryClient]);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
      });
      // Invalidate to refresh the list
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }, [queryClient]);

  return {
    notifications: query.data?.notifications ?? [],
    unreadCount: query.data?.unreadCount ?? 0,
    isLoading: query.isLoading,
    error: query.error,
    realtimeStatus,
    isUsingRealtime: isRealtimeConnected,
    isUsingPolling: shouldPoll,
    refresh,
    markAsRead,
    markAllAsRead,
    refetch: query.refetch,
  };
}
