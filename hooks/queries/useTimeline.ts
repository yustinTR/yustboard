import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/client';

interface Post {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
  _count: {
    likes: number;
    comments: number;
  };
  likes: Array<{ userId: string }>;
  comments: Array<{
    id: string;
    content: string;
    createdAt: string;
    user: {
      name: string | null;
      image: string | null;
    };
  }>;
  media: Array<{
    id: string;
    url: string;
    type: string;
  }>;
}

async function fetchPosts(): Promise<Post[]> {
  const response = await fetch('/api/timeline');
  if (!response.ok) {
    throw new Error('Failed to fetch posts');
  }
  const data = await response.json();
  return data.posts || [];
}

async function createPost(content: string): Promise<Post> {
  const response = await fetch('/api/timeline', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
  if (!response.ok) {
    throw new Error('Failed to create post');
  }
  return response.json();
}

async function likePost(postId: string): Promise<void> {
  const response = await fetch(`/api/timeline/${postId}/like`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('Failed to like post');
  }
}

export function useTimeline() {
  return useQuery({
    queryKey: queryKeys.timeline.posts(),
    queryFn: fetchPosts,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // Keep for 5 minutes
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      // Invalidate and refetch posts
      queryClient.invalidateQueries({ queryKey: queryKeys.timeline.posts() });
    },
  });
}

export function useLikePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: likePost,
    onSuccess: () => {
      // Invalidate posts to refetch like counts
      queryClient.invalidateQueries({ queryKey: queryKeys.timeline.posts() });
    },
  });
}
