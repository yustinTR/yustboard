import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/client';
import { EmailMessage } from '@/utils/google/google-gmail';

interface GmailResponse {
  messages: EmailMessage[];
  nextPageToken?: string;
  counts?: {
    inbox: number;
    unread: number;
    drafts: number;
    spam: number;
    trash: number;
  };
}

interface UseGmailOptions {
  max?: number;
  query?: string;
  pageToken?: string;
  countsOnly?: boolean;
  includeCounts?: boolean;
}

async function fetchGmail(options: UseGmailOptions = {}): Promise<GmailResponse> {
  const { max = 10, query = 'in:inbox', pageToken, countsOnly = false, includeCounts = false } = options;

  const params = new URLSearchParams();
  if (max) params.append('max', max.toString());
  if (query) params.append('query', query);
  if (pageToken) params.append('pageToken', pageToken);
  if (countsOnly) params.append('countsOnly', 'true');
  if (includeCounts) params.append('includeCounts', 'true');

  const response = await fetch(`/api/gmail?${params.toString()}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch Gmail data');
  }
  return response.json();
}

export function useGmail(options: UseGmailOptions = {}) {
  return useQuery({
    queryKey: queryKeys.gmail.list(options),
    queryFn: () => fetchGmail(options),
    staleTime: 60 * 1000, // 1 minute (emails update frequently)
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });
}

// Hook specifically for email counts
export function useGmailCounts() {
  return useQuery({
    queryKey: queryKeys.gmail.counts(),
    queryFn: () => fetchGmail({ countsOnly: true }),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000,
  });
}
