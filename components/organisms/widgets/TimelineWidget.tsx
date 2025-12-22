'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { FiSend, FiRefreshCw, FiMessageSquare, FiHeart, FiMessageCircle, FiImage } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import PostModal from '../timeline/PostModal';
import { getMentionQuery, insertMention, renderMentionText, type MentionUser } from '@/lib/utils/mentions';

// Check if text contains mentions
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

const TimelineWidget = React.memo(function TimelineWidget() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<TimelinePost[]>([]);
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<TimelinePost | null>(null);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  // @mentions state
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionSuggestions, setMentionSuggestions] = useState<MentionUser[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchPosts = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch('/api/timeline?limit=5');
      if (!response.ok) throw new Error('Failed to fetch posts');
      
      const data = await response.json();
      setPosts(data.posts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('Failed to load timeline');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
    const interval = setInterval(fetchPosts, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [fetchPosts]);

  useEffect(() => {
    // Initialize liked posts
    const liked = new Set<string>();
    posts.forEach(post => {
      if (post.likes.some(like => like.userId === session?.user?.id)) {
        liked.add(post.id);
      }
    });
    setLikedPosts(liked);
  }, [posts, session?.user?.id]);

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

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newContent = e.target.value;
    const cursorPosition = e.target.selectionStart || 0;

    setContent(newContent);

    // Check if we're in a mention context
    const query = getMentionQuery(newContent, cursorPosition);
    setMentionQuery(query);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
      } else if (e.key === 'Enter') {
        e.preventDefault();
        selectMention(mentionSuggestions[selectedSuggestionIndex]);
      } else if (e.key === 'Escape') {
        setMentionQuery(null);
        setMentionSuggestions([]);
      }
    }
  };

  const selectMention = (user: MentionUser) => {
    if (!inputRef.current) return;

    const cursorPosition = inputRef.current.selectionStart || 0;
    const { newText, newCursorPosition } = insertMention(content, cursorPosition, {
      name: user.name || user.email.split('@')[0],
      id: user.id,
    });

    setContent(newText);
    setMentionQuery(null);
    setMentionSuggestions([]);

    // Restore cursor position
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.selectionStart = newCursorPosition;
        inputRef.current.selectionEnd = newCursorPosition;
        inputRef.current.focus();
      }
    }, 0);
  };

  const handleLike = async (postId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening modal
    
    try {
      const isLiked = likedPosts.has(postId);
      const method = isLiked ? 'DELETE' : 'POST';
      const response = await fetch(`/api/timeline/${postId}/like`, { method });
      
      if (response.ok) {
        const newLikedPosts = new Set(likedPosts);
        if (isLiked) {
          newLikedPosts.delete(postId);
        } else {
          newLikedPosts.add(postId);
        }
        setLikedPosts(newLikedPosts);
        
        // Update the post count locally
        setPosts(posts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              _count: {
                ...post._count,
                likes: isLiked ? post._count.likes - 1 : post._count.likes + 1
              }
            };
          }
          return post;
        }));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isPosting) return;

    setIsPosting(true);
    setError(null);

    try {
      const response = await fetch('/api/timeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create post');
      }

      const newPost = await response.json();
      setPosts([newPost, ...posts.slice(0, 4)]); // Keep only 5 posts
      setContent('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to post');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="h-full backdrop-blur-xl bg-white/15 dark:bg-gray-900/15 border border-white/25 dark:border-gray-700/25 rounded-3xl shadow-2xl shadow-black/20 overflow-hidden flex flex-col">
      {/* Header with indigo gradient for timeline */}
      <div className="px-6 py-4 bg-gradient-to-r from-indigo-500/90 to-purple-500/90 backdrop-blur-sm text-white">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium tracking-wide flex items-center gap-2">
            <FiMessageSquare className="h-5 w-5" />
            Timeline
          </h3>
          <button
            onClick={fetchPosts}
            disabled={isLoading}
            className="text-white/90 hover:text-white hover:bg-white/20 p-2 rounded-full transition-all duration-300 disabled:opacity-50 cursor-pointer hover:scale-105"
          >
            <FiRefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white/5 dark:bg-gray-900/5 backdrop-blur-sm">
        {/* Post form */}
        <div className="px-6 py-4 border-b border-white/20 dark:border-gray-600/20">
          <form onSubmit={handleSubmit}>
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={content}
                  onChange={handleTextChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Wat houdt je bezig? (@ om te taggen)"
                  className="w-full px-4 py-3 border border-white/30 dark:border-gray-600/30 rounded-2xl bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-300"
                  maxLength={280}
                  disabled={isPosting}
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
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-medium">
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
                disabled={!content.trim() || isPosting}
                className="w-12 h-12 flex items-center justify-center bg-gradient-to-r from-indigo-500/90 to-purple-500/90 hover:from-indigo-600/90 hover:to-purple-600/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl text-white backdrop-blur-sm border border-indigo-400/30 shadow-lg shadow-indigo-500/20 transition-all duration-300 hover:scale-105"
              >
                <FiSend className="h-5 w-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 text-right">{content.length}/280</p>

            {/* Mention preview */}
            {hasMentions(content) && (
              <div className="mt-3 p-3 bg-indigo-50/50 dark:bg-indigo-900/20 rounded-xl border border-indigo-200/50 dark:border-indigo-700/30">
                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mb-1">Preview:</p>
                <p className="text-sm text-gray-800 dark:text-gray-200">
                  {renderMentionText(content).map((part, index) => {
                    if (part.type === 'mention') {
                      return (
                        <span key={index} className="font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/40 px-1 rounded">
                          @{part.content}
                        </span>
                      );
                    }
                    return <span key={index}>{part.content}</span>;
                  })}
                </p>
              </div>
            )}
          </form>
        </div>

        {/* Error message */}
        {error && (
          <div className="mx-6 mt-4 bg-red-500/15 border border-red-400/30 text-red-600 dark:text-red-400 p-4 rounded-2xl backdrop-blur-sm">
            {error}
          </div>
        )}

        {/* Posts list */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <FiRefreshCw className="animate-spin text-indigo-500 h-8 w-8 mr-3" />
              <span className="text-gray-600 dark:text-gray-400 text-sm">Loading timeline...</span>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-8">
              <div className="bg-indigo-500/15 border border-indigo-400/30 text-indigo-600 dark:text-indigo-400 p-6 rounded-2xl backdrop-blur-sm">
                <FiMessageSquare className="mx-auto mb-3 h-8 w-8" />
                <p className="font-medium mb-2">Nog geen berichten</p>
                <p className="text-sm">Wees de eerste die iets deelt!</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white/20 dark:bg-gray-800/20 rounded-2xl p-4 backdrop-blur-sm border border-white/30 dark:border-gray-600/30 hover:bg-white/30 dark:hover:bg-gray-700/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg cursor-pointer"
                  onClick={() => setSelectedPost(post)}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      {post.user.image ? (
                        <Image
                          src={post.user.image}
                          alt={post.user.name || 'User'}
                          width={40}
                          height={40}
                          className="rounded-full border-2 border-white/20"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center border-2 border-white/20">
                          <span className="text-white text-sm font-medium">
                            {(post.user.name || post.user.email || '?')[0].toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between mb-2">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                          {post.user.name || post.user.email?.split('@')[0] || 'Anonymous'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      <p className="text-sm text-gray-900 dark:text-gray-100 break-words leading-relaxed mb-3">
                        {renderMentionText(post.content).map((part, index) => {
                          if (part.type === 'mention') {
                            return (
                              <span
                                key={index}
                                className="font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-1 rounded"
                              >
                                @{part.content}
                              </span>
                            );
                          }
                          return <span key={index}>{part.content}</span>;
                        })}
                      </p>

                      {/* Show media indicator */}
                      {post.media.length > 0 && (
                        <div className="mb-3 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 bg-white/20 dark:bg-gray-700/20 px-3 py-1.5 rounded-lg">
                          <FiImage className="h-3 w-3" />
                          <span>{post.media.length} bijlage{post.media.length > 1 ? 'n' : ''}</span>
                        </div>
                      )}

                      {/* Show interaction counts */}
                      <div className="flex items-center gap-4 text-xs">
                        <button
                          onClick={(e) => handleLike(post.id, e)}
                          className={`flex items-center gap-1.5 transition-all duration-300 hover:bg-white/20 dark:hover:bg-gray-700/20 px-3 py-1.5 rounded-lg ${
                            likedPosts.has(post.id)
                              ? 'text-red-500'
                              : 'text-gray-500 dark:text-gray-500 hover:text-red-500'
                          }`}
                        >
                          <FiHeart className={`h-4 w-4 ${likedPosts.has(post.id) ? 'fill-current' : ''}`} />
                          <span>{post._count.likes}</span>
                        </button>
                        <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-500 px-3 py-1.5">
                          <FiMessageCircle className="h-4 w-4" />
                          <span>{post._count.comments}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer with Material button */}
      <div className="px-6 py-4 bg-white/10 dark:bg-gray-800/15 backdrop-blur-sm border-t border-white/20 dark:border-gray-600/20">
        <a
          href="/dashboard/timeline"
          className="block w-full text-center bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-sm font-medium py-3 px-4 rounded-2xl transition-all duration-300 hover:scale-[1.02] border border-indigo-400/30 backdrop-blur-sm"
        >
          Bekijk alle berichten
        </a>
      </div>

      {/* Post Modal */}
      {selectedPost && (
        <PostModal
          post={selectedPost}
          isOpen={!!selectedPost}
          onClose={() => setSelectedPost(null)}
          onUpdate={fetchPosts}
        />
      )}
    </div>
  );
});

export default TimelineWidget;