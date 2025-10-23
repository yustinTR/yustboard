'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FiSend } from 'react-icons/fi';
import Image from 'next/image';
import { useCreateComment } from '@/hooks/queries/useComments';
import { toast } from 'sonner';
import { getMentionQuery, insertMention, type MentionUser } from '@/lib/utils/mentions';

interface CommentInputProps {
  postId: string;
}

export function CommentInput({ postId }: CommentInputProps) {
  const { data: session } = useSession();
  const [content, setContent] = useState('');
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionSuggestions, setMentionSuggestions] = useState<MentionUser[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const createComment = useCreateComment();

  // Fetch mention suggestions when typing @
  useEffect(() => {
    if (!mentionQuery) {
      setMentionSuggestions([]);
      setSelectedSuggestionIndex(0);
      return;
    }

    const fetchMentions = async () => {
      try {
        const response = await fetch(`/api/organization/members?q=${encodeURIComponent(mentionQuery)}`);
        if (response.ok) {
          const data = await response.json();
          setMentionSuggestions(data.members || []);
          setSelectedSuggestionIndex(0);
        }
      } catch (error) {
        console.error('Error fetching mentions:', error);
      }
    };

    fetchMentions();
  }, [mentionQuery]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    const cursorPosition = e.target.selectionStart;

    setContent(newContent);

    // Check if we're in a mention context
    const query = getMentionQuery(newContent, cursorPosition);
    setMentionQuery(query);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Handle mention suggestions navigation
    if (mentionSuggestions.length > 0 && mentionQuery !== null) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSuggestionIndex((prev) =>
          prev < mentionSuggestions.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        selectMention(mentionSuggestions[selectedSuggestionIndex]);
      } else if (e.key === 'Escape') {
        setMentionQuery(null);
        setMentionSuggestions([]);
      }
    }
  };

  const selectMention = (user: MentionUser) => {
    if (!textareaRef.current) return;

    const cursorPosition = textareaRef.current.selectionStart;
    const { newText, newCursorPosition } = insertMention(content, cursorPosition, {
      name: user.name || user.email.split('@')[0],
      id: user.id,
    });

    setContent(newText);
    setMentionQuery(null);
    setMentionSuggestions([]);

    // Restore cursor position
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.selectionStart = newCursorPosition;
        textareaRef.current.selectionEnd = newCursorPosition;
        textareaRef.current.focus();
      }
    }, 0);
  };

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
    <form onSubmit={handleSubmit} className="flex gap-3 items-start relative">
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
      <div className="flex-1 flex gap-2 relative">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder="Schrijf een reactie... (gebruik @ om iemand te taggen)"
            className="w-full px-4 py-2 bg-white/10 dark:bg-gray-800/20 border border-white/20 dark:border-gray-600/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 backdrop-blur-sm resize-none text-sm"
            rows={2}
            disabled={createComment.isPending}
          />

          {/* Mention suggestions dropdown */}
          {mentionSuggestions.length > 0 && mentionQuery !== null && (
            <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-48 overflow-y-auto">
              {mentionSuggestions.map((user, index) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => selectMention(user)}
                  className={`w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                    index === selectedSuggestionIndex ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''
                  }`}
                >
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt={user.name || 'User'}
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xs font-medium">
                      {(user.name || user.email)[0].toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {user.name || user.email.split('@')[0]}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user.email}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

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
