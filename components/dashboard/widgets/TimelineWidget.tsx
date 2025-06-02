'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { FiSend, FiRefreshCw, FiMessageSquare, FiHeart, FiMessageCircle, FiImage } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import PostModal from '../timeline/PostModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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
    <Card className="h-full flex flex-col shadow-1">
      <CardHeader className="pb-3 border-b border-border">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FiMessageSquare className="h-5 w-5" />
            Timeline
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={fetchPosts}
            disabled={isLoading}
            className="h-8 w-8"
          >
            <FiRefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
        {/* Post form */}
        <div className="p-4 border-b border-border">
          <form onSubmit={handleSubmit}>
            <div className="flex gap-2">
              <input
                type="text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Wat houdt je bezig?"
                className="flex-1 px-4 py-2 border border-border rounded-full bg-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                maxLength={280}
                disabled={isPosting}
              />
              <Button
                type="submit"
                size="icon"
                disabled={!content.trim() || isPosting}
                className="rounded-full"
              >
                <FiSend className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-right">{content.length}/280</p>
          </form>
        </div>

        {/* Error message */}
        {error && (
          <div className="px-4 py-2 bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}

        {/* Posts list */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <FiRefreshCw className="animate-spin text-muted-foreground h-6 w-6" />
            </div>
          ) : posts.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <FiMessageSquare className="mx-auto mb-2 text-2xl" />
              <p>Nog geen berichten</p>
              <p className="text-sm">Wees de eerste die iets deelt!</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
            {posts.map((post) => (
              <div 
                key={post.id} 
                className="p-4 hover:bg-secondary cursor-pointer transition-colors"
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
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                        <span className="text-primary-foreground text-sm font-medium">
                          {(post.user.name || post.user.email || '?')[0].toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between">
                      <p className="text-sm font-medium text-foreground truncate">
                        {post.user.name || post.user.email?.split('@')[0] || 'Anonymous'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    <p className="mt-1 text-sm text-foreground break-words">
                      {post.content}
                    </p>
                    {/* Show media indicator */}
                    {post.media.length > 0 && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                        <FiImage className="h-3 w-3" />
                        <span>{post.media.length} bijlage{post.media.length > 1 ? 'n' : ''}</span>
                      </div>
                    )}
                    {/* Show interaction counts */}
                    <div className="mt-3 flex items-center gap-4 text-xs">
                      <button
                        onClick={(e) => handleLike(post.id, e)}
                        className={`flex items-center gap-1 ${likedPosts.has(post.id) ? 'text-destructive' : 'text-muted-foreground hover:text-destructive'} transition-colors`}
                      >
                        <FiHeart className={`h-4 w-4 ${likedPosts.has(post.id) ? 'fill-current' : ''}`} />
                        <span>{post._count.likes}</span>
                      </button>
                      <span className="flex items-center gap-1 text-muted-foreground">
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
        <div className="p-3 text-center border-t border-border">
          <a
            href="/dashboard/timeline"
            className="text-sm text-primary hover:underline"
          >
            Bekijk alle berichten →
          </a>
        </div>
      </CardContent>

      {/* Post Modal */}
      {selectedPost && (
        <PostModal
          post={selectedPost}
          isOpen={!!selectedPost}
          onClose={() => setSelectedPost(null)}
          onUpdate={fetchPosts}
        />
      )}
    </Card>
  );
});

export default TimelineWidget;