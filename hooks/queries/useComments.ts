import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/client';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  userId: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

interface CreateCommentData {
  postId: string;
  content: string;
}

interface DeleteCommentData {
  postId: string;
  commentId: string;
}

// Fetch comments for a post
async function fetchComments(postId: string): Promise<Comment[]> {
  const response = await fetch(`/api/timeline/${postId}/comments`);
  if (!response.ok) {
    throw new Error('Failed to fetch comments');
  }
  const data = await response.json();
  return data.comments || [];
}

// Create a new comment
async function createComment({ postId, content }: CreateCommentData): Promise<Comment> {
  const response = await fetch(`/api/timeline/${postId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create comment');
  }

  return response.json();
}

// Delete a comment
async function deleteComment({ postId, commentId }: DeleteCommentData): Promise<void> {
  const response = await fetch(`/api/timeline/${postId}/comments/${commentId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete comment');
  }
}

// Hook to fetch comments with real-time polling
export function useComments(postId: string, options?: { enablePolling?: boolean }) {
  const { enablePolling = true } = options || {};

  return useQuery({
    queryKey: queryKeys.timeline.comments(postId),
    queryFn: () => fetchComments(postId),
    staleTime: 10 * 1000, // 10 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: enablePolling ? 10 * 1000 : false, // Poll every 10 seconds
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    refetchIntervalInBackground: false, // Don't poll when tab is not visible
  });
}

// Hook to create a comment
export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createComment,
    onSuccess: (newComment, variables) => {
      // Invalidate and refetch comments for this post
      queryClient.invalidateQueries({
        queryKey: queryKeys.timeline.comments(variables.postId),
      });

      // Also invalidate timeline posts to update comment count
      queryClient.invalidateQueries({
        queryKey: queryKeys.timeline.posts(),
      });
    },
  });
}

// Hook to delete a comment
export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteComment,
    onSuccess: (_, variables) => {
      // Invalidate and refetch comments for this post
      queryClient.invalidateQueries({
        queryKey: queryKeys.timeline.comments(variables.postId),
      });

      // Also invalidate timeline posts to update comment count
      queryClient.invalidateQueries({
        queryKey: queryKeys.timeline.posts(),
      });
    },
  });
}
