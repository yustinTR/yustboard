'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { FiCalendar, FiUser, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import PublicNavigation from '@/components/PublicNavigation';

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

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 9;

  useEffect(() => {
    fetchPosts();
  }, [currentPage]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/blog?limit=${postsPerPage}&page=${currentPage}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch blog posts');
      }

      const data = await response.json();
      setPosts(data.posts);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Error fetching blog posts:', err);
      setError(err instanceof Error ? err.message : 'Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PublicNavigation />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-7xl">
          <h1 className="text-4xl font-bold mb-8">Blog</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-6 space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PublicNavigation />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-7xl">
          <h1 className="text-4xl font-bold mb-8">Blog</h1>
          <div className="bg-red-50 text-red-700 rounded-lg p-8 text-center">
            <p className="text-lg">{error}</p>
            <button 
              onClick={fetchPosts}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicNavigation />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Blog</h1>
          <p className="text-gray-600 text-lg">Thoughts, stories and ideas</p>
        </div>

      {posts.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <p className="text-gray-500 text-lg">No blog posts published yet.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {posts.map((post) => (
              <article key={post.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <Link href={`/blog/${post.slug}`}>
                  {post.coverImage ? (
                    <div className="relative h-48 w-full">
                      <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600"></div>
                  )}
                  <div className="p-6">
                    <h2 className="text-xl font-semibold mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        {post.author.image && (
                          <Image
                            src={post.author.image}
                            alt={post.author.name || 'Author'}
                            width={24}
                            height={24}
                            className="rounded-full"
                          />
                        )}
                        <span className="flex items-center">
                          <FiUser className="mr-1" size={14} />
                          {post.author.name || 'Anonymous'}
                        </span>
                      </div>
                      <span className="flex items-center">
                        <FiCalendar className="mr-1" size={14} />
                        {format(new Date(post.publishedAt || post.createdAt), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FiChevronLeft />
              </button>
              
              <div className="flex space-x-1">
                {[...Array(pagination.totalPages)].map((_, i) => {
                  const page = i + 1;
                  if (
                    page === 1 ||
                    page === pagination.totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 rounded-lg transition-colors ${
                          currentPage === page
                            ? 'bg-blue-600 text-white'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (
                    page === currentPage - 2 ||
                    page === currentPage + 2
                  ) {
                    return <span key={page} className="px-2">...</span>;
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                disabled={currentPage === pagination.totalPages}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FiChevronRight />
              </button>
            </div>
          )}
        </>
      )}
      </div>
    </div>
  );
}