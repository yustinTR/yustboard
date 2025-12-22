/**
 * Supabase Realtime Configuration
 *
 * Provides real-time updates via WebSocket connections for:
 * - Timeline posts
 * - Comments
 * - Likes
 * - Notifications
 * - Activity feed
 */

import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { supabase } from '@/lib/database/supabase';

// Tables that support Realtime subscriptions
export const REALTIME_TABLES = {
  POST: 'Post',
  POST_COMMENT: 'PostComment',
  POST_LIKE: 'PostLike',
  NOTIFICATION: 'Notification',
  TASK: 'Task',
} as const;

export type RealtimeTable = typeof REALTIME_TABLES[keyof typeof REALTIME_TABLES];

// Event types for Realtime
export type RealtimeEventType = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

// Payload type for Realtime events
export interface RealtimePayload<T = Record<string, unknown>> {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  schema: string;
  new: T;
  old: T | null;
  commit_timestamp: string;
}

// Connection status
export type RealtimeStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

/**
 * Check if Supabase Realtime is available
 */
export function isRealtimeAvailable(): boolean {
  return supabase !== null;
}

/**
 * Create an organization-scoped Realtime channel
 *
 * @param organizationId - The organization to subscribe to
 * @param tables - Tables to listen for changes
 * @param onEvent - Callback for Realtime events
 * @returns Channel and cleanup function
 */
export function createOrganizationChannel(
  organizationId: string,
  tables: RealtimeTable[],
  onEvent: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void
): { channel: RealtimeChannel | null; unsubscribe: () => void } {
  if (!supabase || !organizationId) {
    return { channel: null, unsubscribe: () => {} };
  }

  const channelName = `org-${organizationId}`;
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
        onEvent(payload as RealtimePostgresChangesPayload<Record<string, unknown>>);
      }
    );
  });

  // Subscribe to the channel
  channel.subscribe((status) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Realtime] Channel ${channelName} status:`, status);
    }
  });

  const unsubscribe = () => {
    if (supabase && channel) {
      supabase.removeChannel(channel);
    }
  };

  return { channel, unsubscribe };
}

/**
 * Create a user-specific Realtime channel for notifications
 *
 * @param userId - The user to subscribe to notifications for
 * @param onEvent - Callback for notification events
 * @returns Channel and cleanup function
 */
export function createNotificationChannel(
  userId: string,
  onEvent: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void
): { channel: RealtimeChannel | null; unsubscribe: () => void } {
  if (!supabase || !userId) {
    return { channel: null, unsubscribe: () => {} };
  }

  const channelName = `notifications-${userId}`;

  const channel = supabase
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
        onEvent(payload as RealtimePostgresChangesPayload<Record<string, unknown>>);
      }
    )
    .subscribe((status) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Realtime] Notification channel status:`, status);
      }
    });

  const unsubscribe = () => {
    if (supabase && channel) {
      supabase.removeChannel(channel);
    }
  };

  return { channel, unsubscribe };
}

/**
 * Map table changes to affected query keys
 */
export function getAffectedQueryKeys(table: RealtimeTable): string[][] {
  const mapping: Record<RealtimeTable, string[][]> = {
    [REALTIME_TABLES.POST]: [
      ['timeline', 'posts'],
      ['activity', 'feed'],
    ],
    [REALTIME_TABLES.POST_COMMENT]: [
      ['timeline', 'posts'],
      ['timeline', 'comments'],
      ['activity', 'feed'],
    ],
    [REALTIME_TABLES.POST_LIKE]: [
      ['timeline', 'posts'],
      ['activity', 'feed'],
    ],
    [REALTIME_TABLES.NOTIFICATION]: [
      ['notifications'],
    ],
    [REALTIME_TABLES.TASK]: [
      ['tasks'],
      ['activity', 'feed'],
    ],
  };

  return mapping[table] || [];
}
