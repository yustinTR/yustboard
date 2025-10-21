import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/client';

interface CalendarEvent {
  id: string;
  summary: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
  description?: string;
  location?: string;
  htmlLink?: string;
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
  return data.events || [];
}

export function useCalendar(params: { maxResults?: number; timeMin?: string; timeMax?: string } = {}) {
  return useQuery({
    queryKey: queryKeys.calendar.events(params),
    queryFn: () => fetchCalendarEvents(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // Keep for 15 minutes
  });
}
