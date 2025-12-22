import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/client';
import type { ActivityItem } from '@/app/api/activity/route';

interface ActivityResponse {
  activities: ActivityItem[];
}

async function fetchActivity(limit: number = 20): Promise<ActivityItem[]> {
  const response = await fetch(`/api/activity?limit=${limit}`);

  if (!response.ok) {
    throw new Error('Failed to fetch activity feed');
  }

  const data: ActivityResponse = await response.json();
  return data.activities;
}

/**
 * React Query hook for fetching the activity feed
 * Shows recent activities from the organization (posts, comments, likes, tasks, etc.)
 */
export function useActivity(limit: number = 20) {
  return useQuery({
    queryKey: queryKeys.activity.feed(limit),
    queryFn: () => fetchActivity(limit),
    staleTime: 30 * 1000, // 30 seconds - activity feed updates frequently
    gcTime: 2 * 60 * 1000, // Keep in cache for 2 minutes
    refetchInterval: 60 * 1000, // Refetch every minute for real-time updates
  });
}
