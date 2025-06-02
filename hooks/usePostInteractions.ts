import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';

export function usePostInteractions() {
  const { data: session } = useSession();
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const setLoading = useCallback((key: string, value: boolean) => {
    setLoadingStates(prev => ({ ...prev, [key]: value }));
  }, []);

  const likePost = useCallback(async (postId: string, isLiked: boolean) => {
    if (!session) return { success: false, error: 'Not authenticated' };

    const key = `like-${postId}`;
    setLoading(key, true);

    try {
      const response = await fetch(`/api/timeline/${postId}/like`, {
        method: isLiked ? 'DELETE' : 'POST',
      });

      if (!response.ok) throw new Error('Failed to update like');

      setLoading(key, false);
      return { success: true };
    } catch (err) {
      setLoading(key, false);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to update like' 
      };
    }
  }, [session, setLoading]);

  const commentOnPost = useCallback(async (postId: string, content: string) => {
    if (!session) return { success: false, error: 'Not authenticated' };

    const key = `comment-${postId}`;
    setLoading(key, true);

    try {
      const response = await fetch(`/api/timeline/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) throw new Error('Failed to add comment');

      const comment = await response.json();
      setLoading(key, false);
      return { success: true, comment };
    } catch (err) {
      setLoading(key, false);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to add comment' 
      };
    }
  }, [session, setLoading]);

  const deleteComment = useCallback(async (postId: string, commentId: string) => {
    if (!session) return { success: false, error: 'Not authenticated' };

    const key = `delete-comment-${commentId}`;
    setLoading(key, true);

    try {
      const response = await fetch(`/api/timeline/${postId}/comments/${commentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete comment');

      setLoading(key, false);
      return { success: true };
    } catch (err) {
      setLoading(key, false);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to delete comment' 
      };
    }
  }, [session, setLoading]);

  const sharePost = useCallback(async (postId: string) => {
    if (!navigator.share) {
      // Fallback to copying to clipboard
      const url = `${window.location.origin}/dashboard/timeline?post=${postId}`;
      try {
        await navigator.clipboard.writeText(url);
        return { success: true, message: 'Link copied to clipboard' };
      } catch (err) {
        return { success: false, error: 'Failed to copy link' };
      }
    }

    try {
      await navigator.share({
        title: 'Check out this post',
        url: `${window.location.origin}/dashboard/timeline?post=${postId}`,
      });
      return { success: true };
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        return { success: false, error: 'Share cancelled' };
      }
      return { success: false, error: 'Failed to share' };
    }
  }, []);

  return {
    likePost,
    commentOnPost,
    deleteComment,
    sharePost,
    isLoading: (key: string) => loadingStates[key] || false,
  };
}