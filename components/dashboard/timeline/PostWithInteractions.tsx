'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import { FiHeart, FiMessageCircle, FiFile, FiDownload, FiSend, FiX } from 'react-icons/fi';
import { useSession } from 'next-auth/react';

interface PostUser {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}

interface PostLike {
  userId: string;
}

interface PostMedia {
  id: string;
  type: string;
  url: string;
  filename: string;
  size: number;
  mimeType: string;
}

interface PostComment {
  id: string;
  content: string;
  createdAt: string;
  user: PostUser;
}

interface PostProps {
  post: {
    id: string;
    content: string;
    createdAt: string;
    user: PostUser;
    likes: PostLike[];
    _count: {
      likes: number;
      comments: number;
    };
    media: PostMedia[];
  };
  onUpdate?: () => void;
}

export default function PostWithInteractions({ post }: PostProps) {
  const { data: session } = useSession();
  const [isLiked, setIsLiked] = useState(
    post.likes.some(like => like.userId === session?.user?.id)
  );
  const [likeCount, setLikeCount] = useState(post._count.likes);
  const [commentCount, setCommentCount] = useState(post._count.comments);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleLike = async () => {
    try {
      const method = isLiked ? 'DELETE' : 'POST';
      const response = await fetch(`/api/timeline/${post.id}/like`, { method });
      
      if (response.ok) {
        setIsLiked(!isLiked);
        setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const loadComments = async () => {
    if (comments.length > 0) return; // Already loaded
    
    setIsLoadingComments(true);
    try {
      const response = await fetch(`/api/timeline/${post.id}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleToggleComments = () => {
    setShowComments(!showComments);
    if (!showComments && comments.length === 0) {
      loadComments();
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmittingComment) return;

    setIsSubmittingComment(true);
    try {
      const response = await fetch(`/api/timeline/${post.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment }),
      });

      if (response.ok) {
        const comment = await response.json();
        setComments([comment, ...comments]);
        setCommentCount(commentCount + 1);
        setNewComment('');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      {/* Post header */}
      <div className="flex space-x-3">
        <div className="flex-shrink-0">
          {post.user.image ? (
            <Image
              src={post.user.image}
              alt={post.user.name || 'User'}
              width={48}
              height={48}
              className="rounded-full"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-gray-600 font-semibold">
                {(post.user.name || post.user.email || '?')[0].toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-900">
              {post.user.name || post.user.email?.split('@')[0] || 'Anonymous'}
            </p>
            <p className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </p>
          </div>
          <p className="mt-2 text-gray-800 whitespace-pre-wrap break-words">
            {post.content}
          </p>

          {/* Media attachments */}
          {post.media.length > 0 && (
            <div className="mt-3 space-y-2">
              {post.media.map((media) => (
                <div key={media.id}>
                  {media.type === 'image' ? (
                    <img
                      src={media.url}
                      alt={media.filename}
                      className="rounded-lg max-w-full cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => setSelectedImage(media.url)}
                    />
                  ) : (
                    <a
                      href={media.url}
                      download={media.filename}
                      className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <FiFile className="text-gray-600" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {media.filename}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(media.size)}
                        </p>
                      </div>
                      <FiDownload className="text-gray-600" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Interaction buttons */}
          <div className="mt-4 flex items-center space-x-4">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-1 ${
                isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
              } transition-colors`}
            >
              <FiHeart className={isLiked ? 'fill-current' : ''} />
              <span className="text-sm">{likeCount}</span>
            </button>
            <button
              onClick={handleToggleComments}
              className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 transition-colors"
            >
              <FiMessageCircle />
              <span className="text-sm">{commentCount}</span>
            </button>
          </div>

          {/* Comments section */}
          {showComments && (
            <div className="mt-4 space-y-3">
              {/* Comment form */}
              <form onSubmit={handleSubmitComment} className="flex space-x-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isSubmittingComment}
                />
                <button
                  type="submit"
                  disabled={!newComment.trim() || isSubmittingComment}
                  className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiSend className="w-4 h-4" />
                </button>
              </form>

              {/* Comments list */}
              {isLoadingComments ? (
                <p className="text-sm text-gray-500 text-center">Loading comments...</p>
              ) : comments.length === 0 ? (
                <p className="text-sm text-gray-500 text-center">No comments yet</p>
              ) : (
                <div className="space-y-2">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex space-x-2">
                      <div className="flex-shrink-0">
                        {comment.user.image ? (
                          <Image
                            src={comment.user.image}
                            alt={comment.user.name || 'User'}
                            width={32}
                            height={32}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-gray-600 text-xs font-semibold">
                              {(comment.user.name || comment.user.email || '?')[0].toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 bg-gray-50 rounded-lg px-3 py-2">
                        <p className="text-sm font-medium text-gray-900">
                          {comment.user.name || comment.user.email?.split('@')[0] || 'Anonymous'}
                          <span className="text-xs text-gray-500 ml-2">
                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                          </span>
                        </p>
                        <p className="text-sm text-gray-700 mt-1">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Image modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              className="absolute top-4 right-4 text-white hover:text-gray-300"
              onClick={() => setSelectedImage(null)}
            >
              <FiX className="w-6 h-6" />
            </button>
            <img
              src={selectedImage}
              alt="Full size"
              className="max-w-full max-h-full rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}