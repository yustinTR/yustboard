'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { FiFileText, FiCalendar, FiUser, FiExternalLink, FiRefreshCw } from 'react-icons/fi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/molecules/card';
import { Button } from '@/components/atoms/button';
import Image from 'next/image';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: string;
  published: boolean;
  publishedAt: string | null;
  createdAt: string;
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

const BlogWidget = React.memo(function BlogWidget() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLatestPosts();
  }, []);

  const fetchLatestPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/blog?limit=5&page=1');
      
      if (!response.ok) {
        throw new Error('Failed to fetch blog posts');
      }

      const data = await response.json();
      setPosts(data.posts);
    } catch (err) {
      console.error('Error fetching blog posts:', err);
      setError(err instanceof Error ? err.message : 'Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="h-full flex flex-col backdrop-blur-md bg-white/10 dark:bg-gray-900/10 border border-white/20 dark:border-gray-700/30 shadow-xl shadow-black/10 rounded-xl overflow-hidden">
        <CardHeader className="p-4 pb-3 border-b border-white/20 dark:border-gray-700/30 bg-gradient-to-r from-indigo-500/80 to-indigo-600/80 backdrop-blur-sm text-white">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FiFileText className="h-5 w-5" />
            Blog Posts
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 flex-1 bg-white/5 backdrop-blur-sm">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-secondary rounded-lg w-3/4 mb-2"></div>
                <div className="h-3 bg-secondary rounded-lg w-full mb-2"></div>
                <div className="h-3 bg-secondary rounded-lg w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full flex flex-col backdrop-blur-md bg-white/10 dark:bg-gray-900/10 border border-white/20 dark:border-gray-700/30 shadow-xl shadow-black/10 rounded-xl overflow-hidden">
        <CardHeader className="p-4 pb-3 border-b border-white/20 dark:border-gray-700/30 bg-gradient-to-r from-indigo-500/80 to-indigo-600/80 backdrop-blur-sm text-white">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FiFileText className="h-5 w-5" />
            Blog Posts
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 flex-1 bg-white/5 backdrop-blur-sm">
          <div className="flex items-center justify-center h-32">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col backdrop-blur-md bg-white/10 dark:bg-gray-900/10 border border-white/20 dark:border-gray-700/30 shadow-xl shadow-black/10 rounded-xl overflow-hidden">
      <CardHeader className="p-4 pb-3 border-b border-white/20 dark:border-gray-700/30 bg-gradient-to-r from-indigo-500/80 to-indigo-600/80 backdrop-blur-sm text-white">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FiFileText className="h-5 w-5" />
            Blog Posts
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={fetchLatestPosts}
            disabled={loading}
            className="h-8 w-8"
          >
            <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0 flex-1 flex flex-col overflow-hidden bg-white/5 backdrop-blur-sm">
        {posts.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground flex-1 flex flex-col items-center justify-center">
            <FiFileText className="mx-auto mb-2 h-8 w-8" />
            <p className="font-medium">Nog geen blog posts</p>
            <p className="text-sm">Begin met het schrijven van je eerste blog post!</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto divide-y divide-white/10 dark:divide-gray-700/30">
              {posts.map((post) => (
                <article key={post.id} className="p-4 hover:bg-white/10 dark:hover:bg-gray-800/20 cursor-pointer transition-all duration-200 group">
                  <Link href={`/blog/${post.slug}`} className="block">
                    <div className="flex gap-3">
                      {post.coverImage && (
                        <div className="flex-shrink-0">
                          <Image
                            src={post.coverImage}
                            alt={post.title}
                            width={60}
                            height={60}
                            className="rounded-lg object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-tight mb-1">
                          {post.title}
                        </h4>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2 leading-relaxed">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <FiUser className="h-3 w-3" />
                            {post.author.name || 'Anonymous'}
                          </span>
                          <span className="flex items-center gap-1">
                            <FiCalendar className="h-3 w-3" />
                            {format(new Date(post.publishedAt || post.createdAt), 'dd MMM yyyy')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
            
            {/* View all link */}
            <div className="p-3 text-center border-t border-white/10 dark:border-gray-700/30 bg-white/5 backdrop-blur-sm">
              <Link
                href="/blog"
                className="text-indigo-500 hover:text-indigo-400 text-sm font-medium flex items-center justify-center gap-1 hover:bg-white/10 dark:hover:bg-gray-800/20 px-3 py-1 rounded-lg transition-all duration-200"
              >
                Bekijk alle posts
                <FiExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
});

export default BlogWidget;