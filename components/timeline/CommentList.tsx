'use client';

import { useSession } from 'next-auth/react';
import { formatDistanceToNow } from 'date-fns';
import { nl } from 'date-fns/locale';
import Image from 'next/image';
import { FiTrash2 } from 'react-icons/fi';
import { useComments, useDeleteComment } from '@/hooks/queries/useComments';
import { toast } from 'sonner';
import { renderMentionText } from '@/lib/utils/mentions';

interface CommentListProps {
  postId: string;
}

export function CommentList({ postId }: CommentListProps) {
  const { data: session } = useSession();
  const { data: comments = [], isLoading, error } = useComments(postId);
  const deleteComment = useDeleteComment();

  const handleDelete = async (commentId: string) => {
    if (!confirm('Weet je zeker dat je deze reactie wilt verwijderen?')) {
      return;
    }

    try {
      await deleteComment.mutateAsync({ postId, commentId });
      toast.success('Reactie verwijderd');
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Fout bij verwijderen reactie');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
              <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-500 dark:text-red-400">
        Fout bij laden reacties
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
        Nog geen reacties. Wees de eerste!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => {
        const isOwnComment = session?.user?.id === comment.userId;

        return (
          <div key={comment.id} className="flex gap-3 group">
            {/* User avatar */}
            <div className="flex-shrink-0">
              {comment.user.image ? (
                <Image
                  src={comment.user.image}
                  alt={comment.user.name || 'User'}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-sm font-medium">
                  {comment.user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
            </div>

            {/* Comment content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {comment.user.name || 'Anonymous'}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    {formatDistanceToNow(new Date(comment.createdAt), {
                      addSuffix: true,
                      locale: nl,
                    })}
                  </span>
                </div>

                {/* Delete button - only show for own comments */}
                {isOwnComment && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    disabled={deleteComment.isPending}
                    className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:text-red-600 transition-opacity disabled:opacity-50"
                    title="Verwijder reactie"
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="text-sm text-gray-700 dark:text-gray-300 bg-white/10 dark:bg-gray-800/20 rounded-lg px-3 py-2 backdrop-blur-sm border border-white/20 dark:border-gray-600/30">
                {renderMentionText(comment.content).map((part, index) => {
                  if (part.type === 'mention') {
                    return (
                      <span
                        key={index}
                        className="font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-1 rounded"
                        title={`User ID: ${part.userId}`}
                      >
                        @{part.content}
                      </span>
                    );
                  }
                  return <span key={index}>{part.content}</span>;
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
