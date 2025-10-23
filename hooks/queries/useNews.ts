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

interface NewsQueryParams {
  category?: string;
  country?: string;
}

async function fetchNews(params: NewsQueryParams = {}): Promise<NewsArticle[]> {
  const searchParams = new URLSearchParams();
  if (params.category) searchParams.append('category', params.category);
  if (params.country) searchParams.append('country', params.country);

  const url = `/api/news${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Failed to fetch news');
  }
  const data = await response.json();
  return data.articles || [];
}

export function useNews(params: NewsQueryParams = {}) {
  return useQuery({
    queryKey: queryKeys.news.articles(params),
    queryFn: () => fetchNews(params),
    staleTime: 5 * 60 * 1000, // 5 minutes (news updates frequently but not every second)
    gcTime: 15 * 60 * 1000, // Keep for 15 minutes
  });
}
