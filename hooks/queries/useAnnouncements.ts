import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/client';

interface Announcement {
  id: string;
  title: string;
  content: string;
  coverImage: string | null;
  published: boolean;
  publishedAt: string | null;
  authorId: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

async function fetchAnnouncements(publishedOnly: boolean = true): Promise<Announcement[]> {
  const params = new URLSearchParams();
  if (publishedOnly) {
    params.append('published', 'true');
  }
  const response = await fetch(`/api/announcements?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch announcements');
  }
  const data = await response.json();
  return data.announcements || [];
}

export function useAnnouncements(publishedOnly: boolean = true) {
  return useQuery({
    queryKey: queryKeys.announcements.list({ published: publishedOnly }),
    queryFn: () => fetchAnnouncements(publishedOnly),
    staleTime: 3 * 60 * 1000, // 3 minutes (announcements are relatively static)
    gcTime: 10 * 60 * 1000, // Keep for 10 minutes
  });
}
