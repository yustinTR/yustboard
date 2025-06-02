import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

export interface TimelinePost {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
  media: Array<{
    id: string;
    type: string;
    url: string;
    filename: string;
  }>;
  likes: Array<{
    id: string;
    userId: string;
  }>;
  comments: Array<{
    id: string;
    content: string;
    createdAt: string;
    user: {
      id: string;
      name: string | null;
      email: string | null;
      image: string | null;
    };
  }>;
  _count: {
    likes: number;
    comments: number;
  };
}

interface UseTimelineOptions {
  limit?: number;
  pollingInterval?: number | null;
}

export function useTimeline(options: UseTimelineOptions = {}) {
  const { limit = 20, pollingInterval = null } = options;
  const { data: session } = useSession();
  const [posts, setPosts] = useState<TimelinePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchPosts = useCallback(async (cursor?: string) => {
    try {
      const params = new URLSearchParams();
      params.append('limit', limit.toString());
      if (cursor) params.append('cursor', cursor);

      const response = await fetch(`/api/timeline?${params}`);
      if (!response.ok) throw new Error('Failed to fetch posts');

      const data = await response.json();
      
      if (cursor) {
        setPosts(prev => [...prev, ...data.posts]);
      } else {
        setPosts(data.posts);
      }
      
      setHasMore(data.posts.length === limit);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  const createPost = useCallback(async (content: string, mediaFiles?: File[]) => {
    try {
      const formData = new FormData();
      formData.append('content', content);
      
      if (mediaFiles) {
        mediaFiles.forEach(file => formData.append('media', file));
      }

      const response = await fetch('/api/timeline', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to create post');

      const newPost = await response.json();
      setPosts(prev => [newPost, ...prev]);
      
      return { success: true, post: newPost };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to create post' 
      };
    }
  }, []);

  const deletePost = useCallback(async (postId: string) => {
    try {
      const response = await fetch(`/api/timeline/${postId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete post');

      setPosts(prev => prev.filter(post => post.id !== postId));
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to delete post' 
      };
    }
  }, []);

  const loadMore = useCallback(() => {
    if (posts.length > 0 && hasMore) {
      const lastPost = posts[posts.length - 1];
      fetchPosts(lastPost.id);
    }
  }, [posts, hasMore, fetchPosts]);

  // Initial fetch
  useEffect(() => {
    if (session) {
      fetchPosts();
    }
  }, [session, fetchPosts]);

  // Polling
  useEffect(() => {
    if (pollingInterval && session) {
      const interval = setInterval(() => {
        fetchPosts();
      }, pollingInterval);

      return () => clearInterval(interval);
    }
  }, [pollingInterval, session, fetchPosts]);

  return {
    posts,
    loading,
    error,
    hasMore,
    fetchPosts,
    createPost,
    deletePost,
    loadMore,
    refresh: () => fetchPosts(),
  };
}