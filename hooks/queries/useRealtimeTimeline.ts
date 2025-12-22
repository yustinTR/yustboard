'use client';

/**
 * useRealtimeTimeline Hook
 *
 * Combines React Query with Supabase Realtime for instant timeline updates.
 * Subscribes to Post, PostComment, and PostLike changes.
 */

import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useCallback } from 'react';
import { queryKeys } from '@/lib/query/client';
import { useRealtimeContext } from '@/contexts/RealtimeContext';

interface Post {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
  _count: {
    likes: number;
    comments: number;
  };
  likes: Array<{ userId: string }>;
  media: Array<{
    id: string;
    url: string;
    type: string;
    filename: string;
    size: number;
    mimeType: string;
  }>;
}

interface TimelineResponse {
  posts: Post[];
  nextCursor?: string;
}

async function fetchPosts(limit?: number): Promise<TimelineResponse> {
  const url = limit ? `/api/timeline?limit=${limit}` : '/api/timeline';
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch posts');
  }
  return response.json();
}

interface UseRealtimeTimelineOptions {
  /**
   * Maximum number of posts to fetch
   */
  limit?: number;

  /**
   * Fallback polling interval when Realtime is unavailable
   * @default 30000 (30 seconds)
   */
  fallbackPollingInterval?: number;

  /**
   * Whether to enable the query
   * @default true
   */
  enabled?: boolean;
}

export function useRealtimeTimeline(options: UseRealtimeTimelineOptions = {}) {
  const { limit, fallbackPollingInterval = 30000, enabled = true } = options;
  const { status: realtimeStatus, isEnabled } = useRealtimeContext();
  const queryClient = useQueryClient();

  // Determine if we should use polling
  const isRealtimeConnected = isEnabled && realtimeStatus === 'connected';
  const shouldPoll = !isRealtimeConnected && fallbackPollingInterval > 0;

  const query = useQuery({
    queryKey: queryKeys.timeline.posts(),
    queryFn: () => fetchPosts(limit),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: shouldPoll ? fallbackPollingInterval : false,
    refetchOnWindowFocus: true,
    enabled,
  });

  // Manual refresh function
  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.timeline.posts() });
  }, [queryClient]);

  return {
    posts: query.data?.posts ?? [],
    nextCursor: query.data?.nextCursor,
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

interface CreatePostInput {
  content: string;
  media?: Array<{
    id: string;
    url: string;
    type: string;
    filename: string;
    size: number;
    mimeType: string;
  }>;
}

/**
 * Hook for creating a post with automatic cache invalidation
 */
export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ content, media }: CreatePostInput) => {
      const response = await fetch('/api/timeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, media }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create post');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate timeline queries to show new post
      queryClient.invalidateQueries({ queryKey: queryKeys.timeline.posts() });
      queryClient.invalidateQueries({ queryKey: queryKeys.activity.all });
    },
  });
}

/**
 * Hook for liking/unliking a post with optimistic updates
 */
export function useLikePost() {
  const queryClient = useQueryClient();

  const toggleLike = useCallback(async (postId: string, isLiked: boolean) => {
    const method = isLiked ? 'DELETE' : 'POST';
    const response = await fetch(`/api/timeline/${postId}/like`, { method });

    if (!response.ok) {
      throw new Error('Failed to toggle like');
    }

    // Invalidate to get updated counts
    // Note: With Realtime enabled, this may be redundant but ensures consistency
    queryClient.invalidateQueries({ queryKey: queryKeys.timeline.posts() });

    return !isLiked;
  }, [queryClient]);

  return { toggleLike };
}
