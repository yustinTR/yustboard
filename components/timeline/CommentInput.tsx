'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { FiSend } from 'react-icons/fi';
import Image from 'next/image';
import { useCreateComment } from '@/hooks/queries/useComments';
import { toast } from 'sonner';

interface CommentInputProps {
  postId: string;
}

export function CommentInput({ postId }: CommentInputProps) {
  const { data: session } = useSession();
  const [content, setContent] = useState('');
  const createComment = useCreateComment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      return;
    }

    try {
      await createComment.mutateAsync({
        postId,
        content: content.trim(),
      });

      setContent(''); // Clear input after success
      toast.success('Comment toegevoegd');
    } catch (error) {
      console.error('Error creating comment:', error);
      toast.error('Fout bij toevoegen comment');
    }
  };

  if (!session?.user) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 items-start">
      {/* User avatar */}
      <div className="flex-shrink-0">
        {session.user.image ? (
          <Image
            src={session.user.image}
            alt={session.user.name || 'User'}
            width={32}
            height={32}
            className="rounded-full"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
            {session.user.name?.charAt(0).toUpperCase() || 'U'}
          </div>
        )}
      </div>

      {/* Input field */}
      <div className="flex-1 flex gap-2">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Schrijf een reactie..."
          className="flex-1 px-4 py-2 bg-white/10 dark:bg-gray-800/20 border border-white/20 dark:border-gray-600/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 backdrop-blur-sm resize-none text-sm"
          rows={2}
          disabled={createComment.isPending}
        />

        <button
          type="submit"
          disabled={!content.trim() || createComment.isPending}
          className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <FiSend className="h-4 w-4" />
          {createComment.isPending ? 'Bezig...' : 'Verzenden'}
        </button>
      </div>
    </form>
  );
}
