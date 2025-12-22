'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import PostWithInteractions from './PostWithInteractions';
import { FiSend, FiRefreshCw, FiPaperclip, FiX, FiImage, FiFile, FiMessageSquare, FiWifi } from 'react-icons/fi';
import { getMentionQuery, insertMention, renderMentionText, type MentionUser } from '@/lib/utils/mentions';
import { useRealtimeTimeline, useCreatePost } from '@/hooks/queries/useRealtimeTimeline';

// Check if content contains any mentions
const hasMentions = (text: string): boolean => {
  return /@\[([^\]]+)\]\([^)]+\)/.test(text);
};

interface TimelinePost {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
  likes: { userId: string }[];
  _count: {
    likes: number;
    comments: number;
  };
  media: {
    id: string;
    type: string;
    url: string;
    filename: string;
    size: number;
    mimeType: string;
  }[];
}

export default function Timeline() {
  // Use Realtime-enabled timeline hook
  const {
    posts,
    isLoading,
    error: queryError,
    isUsingRealtime,
    refresh,
    refetch,
  } = useRealtimeTimeline({ limit: 50, fallbackPollingInterval: 10000 });

  // Create post mutation
  const createPost = useCreatePost();

  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // @mentions state
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionSuggestions, setMentionSuggestions] = useState<MentionUser[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate files
    const validFiles = files.filter(file => {
      if (file.size > 10 * 1024 * 1024) {
        setError(`File ${file.name} exceeds 10MB limit`);
        return false;
      }
      return true;
    });

    setAttachments([...attachments, ...validFiles]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    setIsUploading(true);
    const uploaded = [];

    for (const file of attachments) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          uploaded.push(data);
        }
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }

    setIsUploading(false);
    return uploaded;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim() || createPost.isPending) return;

    setError(null);

    try {
      // Upload attachments first
      let media: { id: string; url: string; type: string; filename: string; size: number; mimeType: string }[] = [];
      if (attachments.length > 0) {
        media = await uploadFiles();
      }

      await createPost.mutateAsync({ content, media });
      setContent('');
      setAttachments([]);
    } catch (error) {
      console.error('Error creating post:', error);
      setError(error instanceof Error ? error.message : 'Failed to create post');
    }
  };

  const handleRefresh = () => {
    refresh();
  };

  const isRefreshing = refetch !== undefined && isLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Post form */}
      <div className="backdrop-blur-md bg-white/10 dark:bg-gray-900/10 border border-white/20 dark:border-gray-700/30 rounded-xl shadow-xl shadow-black/10 p-6 mb-8">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={handleTextChange}
                onKeyDown={handleKeyDown}
                placeholder="Wat denk je? (gebruik @ om iemand te taggen)"
                className="w-full p-4 bg-white/20 dark:bg-gray-800/20 border border-white/30 dark:border-gray-600/30 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent backdrop-blur-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-all"
                rows={3}
                maxLength={280}
                disabled={createPost.isPending}
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
                        index === selectedSuggestionIndex ? 'bg-blue-50 dark:bg-blue-900/20' : ''
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

            {/* Mention preview - shows how mentions will look */}
            {hasMentions(content) && (
              <div className="mt-3 p-3 bg-blue-50/50 dark:bg-blue-900/20 rounded-xl border border-blue-200/50 dark:border-blue-700/30">
                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">Preview:</p>
                <p className="text-sm text-gray-800 dark:text-gray-200">
                  {renderMentionText(content).map((part, index) => {
                    if (part.type === 'mention') {
                      return (
                        <span
                          key={index}
                          className="font-semibold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40 px-1 rounded"
                        >
                          @{part.content}
                        </span>
                      );
                    }
                    return <span key={index}>{part.content}</span>;
                  })}
                </p>
              </div>
            )}

            {/* Attachments preview */}
            {attachments.length > 0 && (
              <div className="mt-4 space-y-3">
                {attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white/20 dark:bg-gray-800/20 rounded-xl border border-white/30 dark:border-gray-600/30 backdrop-blur-sm">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${file.type.startsWith('image/') ? 'bg-green-100 dark:bg-green-900' : 'bg-blue-100 dark:bg-blue-900'}`}>
                        {file.type.startsWith('image/') ? (
                          <FiImage className="w-4 h-4 text-green-600 dark:text-green-400" />
                        ) : (
                          <FiFile className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        )}
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-xs block">
                          {file.name}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {(file.size / 1024).toFixed(1)} KB
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      className="p-1 text-red-500 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-between items-center mt-4">
              <div className="flex items-center space-x-4">
                <label className="p-2 cursor-pointer text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/20 dark:hover:bg-blue-900/20 rounded-lg transition-colors backdrop-blur-sm">
                  <FiPaperclip className="w-5 h-5" />
                  <input
                    type="file"
                    multiple
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={createPost.isPending}
                  />
                </label>
                <span className={`text-sm font-medium ${content.length > 260 ? 'text-orange-500 dark:text-orange-400' : 'text-gray-500 dark:text-gray-400'}`}>
                  {content.length}/280
                </span>
              </div>
              <button
                type="submit"
                disabled={!content.trim() || createPost.isPending || isUploading}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-medium transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                <FiSend className="mr-2 w-4 h-4" />
                {isUploading ? 'Uploading...' : createPost.isPending ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Error message */}
      {(error || queryError) && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-4 rounded-xl mb-6">
          {error || (queryError instanceof Error ? queryError.message : 'Failed to load posts')}
        </div>
      )}

      {/* Posts header with refresh button */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Recent Posts</h2>
          {isUsingRealtime && (
            <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400" title="Real-time updates actief">
              <FiWifi className="h-3 w-3" />
            </span>
          )}
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/20 dark:hover:bg-blue-900/20 rounded-xl transition-all cursor-pointer backdrop-blur-sm"
        >
          <FiRefreshCw className={`mr-2 w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="font-medium">Refresh</span>
        </button>
      </div>

      {/* Posts list */}
      <div className="space-y-6">
        {posts.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiMessageSquare className="w-12 h-12 text-gray-400 dark:text-gray-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No posts yet</h3>
            <p className="text-gray-500 dark:text-gray-400">Be the first to share something!</p>
          </div>
        ) : (
          posts.map((post) => (
            <PostWithInteractions
              key={post.id}
              post={post}
              onUpdate={() => refresh()}
            />
          ))
        )}
      </div>
    </div>
  );
}