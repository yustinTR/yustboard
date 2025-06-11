'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { FiSend, FiRefreshCw, FiMessageSquare, FiHeart, FiMessageCircle, FiImage } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import PostModal from '../timeline/PostModal';

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
    <div className="h-full backdrop-blur-md bg-white/10 dark:bg-gray-900/10 border border-white/20 dark:border-gray-700/30 rounded-xl shadow-xl shadow-black/10 overflow-hidden flex flex-col">
      <div className="p-4 bg-gradient-to-r from-indigo-500/80 to-indigo-600/80 backdrop-blur-sm text-white border-b border-white/10">
        <div className="flex items-center justify-between">
          <h3 className="font-medium flex items-center gap-2">
            <FiMessageSquare className="h-5 w-5" />
            Timeline
          </h3>
          <button
            onClick={fetchPosts}
            disabled={isLoading}
            className="text-white/90 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-all duration-200 disabled:opacity-50"
          >
            <FiRefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="p-0 flex-1 flex flex-col overflow-hidden bg-white/5 backdrop-blur-sm">
        {/* Post form */}
        <div className="p-4 border-b border-white/10 dark:border-gray-700/30">
          <form onSubmit={handleSubmit}>
            <div className="flex gap-2">
              <input
                type="text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Wat houdt je bezig?"
                className="flex-1 px-4 py-2 border border-white/20 dark:border-gray-600/30 rounded-full bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50"
                maxLength={280}
                disabled={isPosting}
              />
              <button
                type="submit"
                disabled={!content.trim() || isPosting}
                className="w-10 h-10 flex items-center justify-center bg-gradient-to-r from-indigo-500/90 to-indigo-600/90 hover:from-indigo-600/90 hover:to-indigo-700/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-full text-white backdrop-blur-sm border border-indigo-400/20 shadow-lg shadow-indigo-500/20 transition-all duration-200"
              >
                <FiSend className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 text-right">{content.length}/280</p>
          </form>
        </div>

        {/* Error message */}
        {error && (
          <div className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Posts list */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <FiRefreshCw className="animate-spin text-indigo-500 h-6 w-6" />
            </div>
          ) : posts.length === 0 ? (
            <div className="p-8 text-center text-gray-600 dark:text-gray-400">
              <FiMessageSquare className="mx-auto mb-2 text-2xl" />
              <p>Nog geen berichten</p>
              <p className="text-sm">Wees de eerste die iets deelt!</p>
            </div>
          ) : (
            <div className="divide-y divide-white/10 dark:divide-gray-700/30">
            {posts.map((post) => (
              <div 
                key={post.id} 
                className="p-4 hover:bg-white/5 dark:hover:bg-gray-800/20 cursor-pointer transition-all duration-200"
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
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {(post.user.name || post.user.email || '?')[0].toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {post.user.name || post.user.email?.split('@')[0] || 'Anonymous'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100 break-words">
                      {post.content}
                    </p>
                    {/* Show media indicator */}
                    {post.media.length > 0 && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                        <FiImage className="h-3 w-3" />
                        <span>{post.media.length} bijlage{post.media.length > 1 ? 'n' : ''}</span>
                      </div>
                    )}
                    {/* Show interaction counts */}
                    <div className="mt-3 flex items-center gap-4 text-xs">
                      <button
                        onClick={(e) => handleLike(post.id, e)}
                        className={`flex items-center gap-1 transition-colors hover:bg-white/10 dark:hover:bg-gray-800/20 p-1 rounded ${
                          likedPosts.has(post.id) 
                            ? 'text-red-500' 
                            : 'text-gray-500 dark:text-gray-500 hover:text-red-500'
                        }`}
                      >
                        <FiHeart className={`h-4 w-4 ${likedPosts.has(post.id) ? 'fill-current' : ''}`} />
                        <span>{post._count.likes}</span>
                      </button>
                      <span className="flex items-center gap-1 text-gray-500 dark:text-gray-500">
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

        {/* View all link */}
        <div className="p-3 bg-white/5 dark:bg-gray-800/20 backdrop-blur-sm border-t border-white/10 dark:border-gray-700/30 text-center">
          <a
            href="/dashboard/timeline"
            className="text-indigo-500 hover:text-indigo-400 text-sm font-medium flex items-center justify-center hover:bg-white/10 dark:hover:bg-gray-800/20 px-3 py-1 rounded-lg transition-all duration-200"
          >
            Bekijk alle berichten →
          </a>
        </div>
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