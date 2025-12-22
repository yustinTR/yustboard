/**
 * Debounced Query Invalidation
 *
 * Prevents excessive React Query invalidations from rapid Realtime events
 * (e.g., multiple likes in quick succession)
 */

import { QueryClient } from '@tanstack/react-query';

interface PendingInvalidation {
  queryKey: unknown[];
  timeout: NodeJS.Timeout;
}

/**
 * Creates a debounced invalidation function for React Query
 *
 * @param queryClient - The React Query client
 * @param defaultDelayMs - Default debounce delay in milliseconds
 * @returns Debounced invalidation function
 */
export function createDebouncedInvalidation(
  queryClient: QueryClient,
  defaultDelayMs: number = 100
) {
  const pending = new Map<string, PendingInvalidation>();

  return function invalidate(
    queryKey: unknown[],
    delayMs: number = defaultDelayMs
  ): void {
    const keyString = JSON.stringify(queryKey);

    // Clear existing timeout for this query key
    const existing = pending.get(keyString);
    if (existing) {
      clearTimeout(existing.timeout);
    }

    // Set new timeout
    const timeout = setTimeout(() => {
      queryClient.invalidateQueries({ queryKey });
      pending.delete(keyString);
    }, delayMs);

    pending.set(keyString, { queryKey, timeout });
  };
}

/**
 * Creates a batch invalidation function that groups multiple query keys
 *
 * @param queryClient - The React Query client
 * @param batchDelayMs - Delay before processing the batch
 * @returns Batch invalidation function
 */
export function createBatchInvalidation(
  queryClient: QueryClient,
  batchDelayMs: number = 150
) {
  let pendingKeys: Set<string> = new Set();
  let timeout: NodeJS.Timeout | null = null;

  return function batchInvalidate(queryKeys: unknown[][]): void {
    // Add all keys to pending set
    queryKeys.forEach(key => {
      pendingKeys.add(JSON.stringify(key));
    });

    // Clear existing timeout
    if (timeout) {
      clearTimeout(timeout);
    }

    // Set new timeout to process batch
    timeout = setTimeout(() => {
      // Process all pending invalidations
      pendingKeys.forEach(keyString => {
        const queryKey = JSON.parse(keyString);
        queryClient.invalidateQueries({ queryKey });
      });

      // Clear pending
      pendingKeys = new Set();
      timeout = null;
    }, batchDelayMs);
  };
}

/**
 * Delay configurations for different event types
 */
export const INVALIDATION_DELAYS = {
  // Likes can happen rapidly, debounce more aggressively
  LIKE: 300,
  // Comments are less frequent, shorter delay
  COMMENT: 100,
  // Posts are important, minimal delay
  POST: 50,
  // Notifications should be instant
  NOTIFICATION: 0,
  // Tasks are less frequent
  TASK: 150,
  // Default fallback
  DEFAULT: 100,
} as const;

/**
 * Get the appropriate delay for a table
 */
export function getDelayForTable(table: string): number {
  switch (table) {
    case 'PostLike':
      return INVALIDATION_DELAYS.LIKE;
    case 'PostComment':
      return INVALIDATION_DELAYS.COMMENT;
    case 'Post':
      return INVALIDATION_DELAYS.POST;
    case 'Notification':
      return INVALIDATION_DELAYS.NOTIFICATION;
    case 'Task':
      return INVALIDATION_DELAYS.TASK;
    default:
      return INVALIDATION_DELAYS.DEFAULT;
  }
}
