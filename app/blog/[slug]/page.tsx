'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { FiCalendar, FiArrowLeft, FiEdit } from 'react-icons/fi';
import { useSession } from 'next-auth/react';
import ModernNavigation from '@/components/organisms/ModernNavigation';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  published: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string | null;
    image: string | null;
    email: string | null;
  };
}

export default function BlogDetailPage() {
  const params = useParams();
  const { data: session } = useSession();
  const slug = params.slug as string;
  
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/blog/${slug}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Blog post not found');
          }
          throw new Error('Failed to fetch blog post');
        }

        const data = await response.json();
        setPost(data);
      } catch (err) {
        console.error('Error fetching blog post:', err);
        setError(err instanceof Error ? err.message : 'Failed to load blog post');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchPost();
    }
  }, [slug]);

  const canEdit = session?.user && (
    session.user.role === 'ADMIN' || 
    (session.user.role === 'AUTHOR' && session.user.id === post?.author.id)
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ModernNavigation />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-4xl">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="h-64 bg-gray-200 rounded-lg mb-8"></div>
            <div className="space-y-4">
              <div className="h-12 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ModernNavigation />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-4xl">
          <div className="bg-red-50 text-red-700 rounded-lg p-8 text-center">
            <p className="text-lg mb-4">{error || 'Blog post not found'}</p>
            <Link 
              href="/blog"
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <FiArrowLeft className="mr-2" />
            Back to Blog
          </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ModernNavigation />
      <article className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-4xl">
      {/* Navigation */}
      <div className="flex justify-between items-center mb-8">
        <Link 
          href="/blog"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <FiArrowLeft className="mr-2" />
          Back to Blog
        </Link>
        {canEdit && (
          <Link
            href={`/dashboard/admin/blog/edit/${post.slug}`}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiEdit className="mr-2" />
            Edit Post
          </Link>
        )}
      </div>

      {/* Cover Image */}
      {post.coverImage && (
        <div className="relative h-96 w-full mb-8 rounded-lg overflow-hidden">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* Post Header */}
      <header className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">{post.title}</h1>
        <p className="text-xl text-gray-600 mb-6">{post.excerpt}</p>
        
        {/* Author and Date */}
        <div className="flex items-center space-x-6 text-sm text-gray-500">
          <div className="flex items-center">
            {post.author.image && (
              <Image
                src={post.author.image}
                alt={post.author.name || 'Author'}
                width={40}
                height={40}
                className="rounded-full mr-3"
              />
            )}
            <div>
              <p className="font-medium text-gray-900">{post.author.name || 'Anonymous'}</p>
              <p className="text-xs">{post.author.email}</p>
            </div>
          </div>
          <div className="flex items-center">
            <FiCalendar className="mr-2" />
            <time dateTime={post.publishedAt || post.createdAt}>
              {format(new Date(post.publishedAt || post.createdAt), 'MMMM d, yyyy')}
            </time>
          </div>
        </div>
      </header>

      {/* Post Content */}
      <div 
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Post Footer */}
      <footer className="mt-12 pt-8 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <Link 
            href="/blog"
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            ← More posts
          </Link>
          {post.updatedAt !== post.createdAt && (
            <p className="text-sm text-gray-500">
              Last updated: {format(new Date(post.updatedAt), 'MMMM d, yyyy')}
            </p>
          )}
        </div>
      </footer>
    </article>
    </div>
  );
}