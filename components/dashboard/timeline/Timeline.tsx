'use client';

import { useState, useEffect, useCallback } from 'react';
// import { useSession } from 'next-auth/react'; // Currently not used
import PostWithInteractions from './PostWithInteractions';
import { FiSend, FiRefreshCw, FiPaperclip, FiX, FiImage, FiFile } from 'react-icons/fi';

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
    <div className="max-w-2xl mx-auto">
      {/* Post form */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              rows={3}
              maxLength={280}
              disabled={isPosting}
            />
            {/* Attachments preview */}
            {attachments.length > 0 && (
              <div className="mt-3 space-y-2">
                {attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center space-x-2">
                      {file.type.startsWith('image/') ? (
                        <FiImage className="text-green-500" />
                      ) : (
                        <FiFile className="text-blue-500" />
                      )}
                      <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-xs">
                        {file.name}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FiX />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-between items-center mt-2">
              <div className="flex items-center space-x-2">
                <label className="cursor-pointer text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
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
                <span className={`text-sm ${content.length > 260 ? 'text-orange-500' : 'text-gray-500 dark:text-gray-400'}`}>
                  {content.length}/280
                </span>
              </div>
              <button
                type="submit"
                disabled={!content.trim() || isPosting || isUploading}
                className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FiSend className="mr-2" />
                {isUploading ? 'Uploading...' : isPosting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Posts header with refresh button */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Recent Posts</h2>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
        >
          <FiRefreshCw className={`mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Posts list */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <p>No posts yet. Be the first to share something!</p>
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