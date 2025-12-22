'use client';

/**
 * useRealtimeActivity Hook
 *
 * Combines React Query with Supabase Realtime for instant activity feed updates.
 * Subscribes to Post, PostComment, PostLike, and Task changes.
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { queryKeys } from '@/lib/query/client';
import { useRealtimeContext } from '@/contexts/RealtimeContext';

interface ActivityItem {
  id: string;
  type: 'post' | 'comment' | 'like' | 'task_completed' | 'member_joined' | 'announcement';
  message: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
  metadata?: {
    postId?: string;
    taskId?: string;
    announcementId?: string;
    postContent?: string;
    taskTitle?: string;
    announcementTitle?: string;
  };
  createdAt: string;
}

interface ActivityResponse {
  activities: ActivityItem[];
}

async function fetchActivity(limit: number = 20): Promise<ActivityResponse> {
  const response = await fetch(`/api/activity?limit=${limit}`);
  if (!response.ok) {
    throw new Error('Failed to fetch activity');
  }
  return response.json();
}

interface UseRealtimeActivityOptions {
  /**
   * Maximum number of activities to fetch
   * @default 20
   */
  limit?: number;

  /**
   * Fallback polling interval when Realtime is unavailable
   * @default 60000 (60 seconds)
   */
  fallbackPollingInterval?: number;

  /**
   * Whether to enable the query
   * @default true
   */
  enabled?: boolean;
}

export function useRealtimeActivity(options: UseRealtimeActivityOptions = {}) {
  const { limit = 20, fallbackPollingInterval = 60000, enabled = true } = options;
  const { status: realtimeStatus, isEnabled } = useRealtimeContext();
  const queryClient = useQueryClient();

  // Determine if we should use polling
  const isRealtimeConnected = isEnabled && realtimeStatus === 'connected';
  const shouldPoll = !isRealtimeConnected && fallbackPollingInterval > 0;

  const query = useQuery({
    queryKey: queryKeys.activity.feed(limit),
    queryFn: () => fetchActivity(limit),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: shouldPoll ? fallbackPollingInterval : false,
    refetchOnWindowFocus: true,
    enabled,
  });

  // Manual refresh function
  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.activity.all });
  }, [queryClient]);

  return {
    activities: query.data?.activities ?? [],
    isLoading: query.isLoading,
    isRefetching: query.isRefetching,
    error: query.error,
    realtimeStatus,
    isUsingRealtime: isRealtimeConnected,
    isUsingPolling: shouldPoll,
    refresh,
    refetch: query.refetch,
  };
}

/**
 * Get icon and color for activity type
 */
export function getActivityTypeInfo(type: ActivityItem['type']) {
  switch (type) {
    case 'post':
      return { icon: 'FiEdit3', color: 'text-indigo-500', bgColor: 'bg-indigo-100 dark:bg-indigo-900/30' };
    case 'comment':
      return { icon: 'FiMessageCircle', color: 'text-blue-500', bgColor: 'bg-blue-100 dark:bg-blue-900/30' };
    case 'like':
      return { icon: 'FiHeart', color: 'text-red-500', bgColor: 'bg-red-100 dark:bg-red-900/30' };
    case 'task_completed':
      return { icon: 'FiCheckCircle', color: 'text-green-500', bgColor: 'bg-green-100 dark:bg-green-900/30' };
    case 'member_joined':
      return { icon: 'FiUserPlus', color: 'text-purple-500', bgColor: 'bg-purple-100 dark:bg-purple-900/30' };
    case 'announcement':
      return { icon: 'FiMegaphone', color: 'text-orange-500', bgColor: 'bg-orange-100 dark:bg-orange-900/30' };
    default:
      return { icon: 'FiActivity', color: 'text-gray-500', bgColor: 'bg-gray-100 dark:bg-gray-900/30' };
  }
}
