import { QueryClient } from '@tanstack/react-query';

// Create a client with optimized defaults for dashboard widgets
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes before considering it stale
      staleTime: 5 * 60 * 1000,

      // Keep unused data in cache for 10 minutes
      gcTime: 10 * 60 * 1000,

      // Don't refetch on window focus (dashboard users often switch tabs)
      refetchOnWindowFocus: false,

      // Retry failed requests once
      retry: 1,

      // Retry delay: 1 second
      retryDelay: 1000,

      // Show cached data while refetching
      refetchOnMount: 'always',
    },
    mutations: {
      // Retry mutations once
      retry: 1,
    },
  },
});

// Query keys factory for consistent caching
export const queryKeys = {
  // Gmail widget
  gmail: {
    all: ['gmail'] as const,
    list: (params?: { max?: number; query?: string }) =>
      ['gmail', 'list', params] as const,
    counts: () => ['gmail', 'counts'] as const,
    detail: (id: string) => ['gmail', 'detail', id] as const,
  },

  // Calendar widget
  calendar: {
    all: ['calendar'] as const,
    events: (timeMin?: string, timeMax?: string) =>
      ['calendar', 'events', { timeMin, timeMax }] as const,
  },

  // Drive widget
  drive: {
    all: ['drive'] as const,
    files: (type: 'recent' | 'shared', max?: number) =>
      ['drive', 'files', { type, max }] as const,
  },

  // Weather widget
  weather: {
    all: ['weather'] as const,
    current: (lat: number, lon: number) =>
      ['weather', 'current', { lat, lon }] as const,
  },

  // News widget
  news: {
    all: ['news'] as const,
    articles: () => ['news', 'articles'] as const,
  },

  // Timeline widget
  timeline: {
    all: ['timeline'] as const,
    posts: () => ['timeline', 'posts'] as const,
    post: (id: string) => ['timeline', 'post', id] as const,
  },

  // Tasks widget
  tasks: {
    all: ['tasks'] as const,
    list: () => ['tasks', 'list'] as const,
    task: (id: string) => ['tasks', 'task', id] as const,
  },

  // Banking widget
  banking: {
    all: ['banking'] as const,
    transactions: () => ['banking', 'transactions'] as const,
  },

  // Fitness widget
  fitness: {
    all: ['fitness'] as const,
    stats: () => ['fitness', 'stats'] as const,
  },

  // Announcements widget
  announcements: {
    all: ['announcements'] as const,
    list: () => ['announcements', 'list'] as const,
    announcement: (id: string) => ['announcements', 'announcement', id] as const,
  },
};
