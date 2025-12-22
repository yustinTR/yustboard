import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/client';

// Unified calendar event format from API
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string | null;
  startDate: string;
  endDate: string;
  allDay: boolean;
  location?: string | null;
  source: 'google' | 'local';
  authorId?: string;
  authorName?: string | null;
  authorImage?: string | null;
  canEdit?: boolean;
  canDelete?: boolean;
}

async function fetchCalendarEvents(params: { maxResults?: number; timeMin?: string; timeMax?: string } = {}): Promise<CalendarEvent[]> {
  const searchParams = new URLSearchParams();
  if (params.maxResults) searchParams.append('maxResults', String(params.maxResults));
  if (params.timeMin) searchParams.append('timeMin', params.timeMin);
  if (params.timeMax) searchParams.append('timeMax', params.timeMax);

  const response = await fetch(`/api/calendar?${searchParams.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch calendar events');
  }
  const data = await response.json();
  // The API now returns an array directly (not wrapped in events property)
  return Array.isArray(data) ? data : [];
}

export function useCalendar(params: { maxResults?: number; timeMin?: string; timeMax?: string } = {}) {
  return useQuery({
    queryKey: queryKeys.calendar.events(params),
    queryFn: () => fetchCalendarEvents(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // Keep for 15 minutes
  });
}
