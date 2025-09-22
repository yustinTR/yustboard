'use client';

import { useState, useEffect, useCallback } from 'react';
// import { useSession } from 'next-auth/react'; // Currently not used
import PostWithInteractions from './PostWithInteractions';
import { FiSend, FiRefreshCw, FiPaperclip, FiX, FiImage, FiFile, FiMessageSquare } from 'react-icons/fi';

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
  // const { data: session } = useSession(); // Currently not used
  const [posts, setPosts] = useState<TimelinePost[]>([]);
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
  // const [uploadedMedia, setUploadedMedia] = useState<Array<{ type: string; url: string; filename: string; size: number; mimeType: string }>>([]); // Currently not used
  // const setUploadedMedia = () => {}; // Currently not used
  const [isUploading, setIsUploading] = useState(false);

  const fetchPosts = useCallback(async (showRefreshState = false) => {
    try {
      if (showRefreshState) setIsRefreshing(true);
      setError(null);
      
      const response = await fetch('/api/timeline');
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }
      
      const data = await response.json();
      setPosts(data.posts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('Failed to load posts. Please try again.');
    } finally {
      setIsLoading(false);
      if (showRefreshState) setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();

    // Polling voor realtime updates (elke 10 seconden)
    const interval = setInterval(() => {
      fetchPosts(false);
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchPosts]);

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
    
    if (!content.trim() || isPosting) return;

    setIsPosting(true);
    setError(null);

    try {
      // Upload attachments first
      let media = [];
      if (attachments.length > 0) {
        media = await uploadFiles();
      }

      const response = await fetch('/api/timeline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content, media }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create post');
      }

      const newPost = await response.json();
      setPosts([newPost, ...posts]);
      setContent('');
      setAttachments([]);
    } catch (error) {
      console.error('Error creating post:', error);
      setError(error instanceof Error ? error.message : 'Failed to create post');
    } finally {
      setIsPosting(false);
    }
  };

  const handleRefresh = () => {
    fetchPosts(true);
  };

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
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Wat denk je?"
              className="w-full p-4 bg-white/20 dark:bg-gray-800/20 border border-white/30 dark:border-gray-600/30 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent backdrop-blur-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-all"
              rows={3}
              maxLength={280}
              disabled={isPosting}
            />
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
                    disabled={isPosting}
                  />
                </label>
                <span className={`text-sm font-medium ${content.length > 260 ? 'text-orange-500 dark:text-orange-400' : 'text-gray-500 dark:text-gray-400'}`}>
                  {content.length}/280
                </span>
              </div>
              <button
                type="submit"
                disabled={!content.trim() || isPosting || isUploading}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-medium transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                <FiSend className="mr-2 w-4 h-4" />
                {isUploading ? 'Uploading...' : isPosting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-4 rounded-xl mb-6">
          {error}
        </div>
      )}

      {/* Posts header with refresh button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Recent Posts</h2>
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
              onUpdate={() => fetchPosts()}
            />
          ))
        )}
      </div>
    </div>
  );
}