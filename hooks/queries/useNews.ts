import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/client';

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  image: string | null;
  publishedAt: string;
  source: {
    name: string;
  };
}

async function fetchNews(): Promise<NewsArticle[]> {
  const response = await fetch('/api/news');
  if (!response.ok) {
    throw new Error('Failed to fetch news');
  }
  const data = await response.json();
  return data.articles || [];
}

export function useNews() {
  return useQuery({
    queryKey: queryKeys.news.articles(),
    queryFn: fetchNews,
    staleTime: 5 * 60 * 1000, // 5 minutes (news updates frequently but not every second)
    gcTime: 15 * 60 * 1000, // Keep for 15 minutes
  });
}
