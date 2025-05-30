'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import { FiHeart, FiMessageCircle, FiX, FiSend, FiFile, FiDownload } from 'react-icons/fi';
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

interface PostModalProps {
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
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

export default function PostModal({ post, isOpen, onClose, onUpdate }: PostModalProps) {
  const { data: session } = useSession();
  const [isLiked, setIsLiked] = useState(
    post.likes.some(like => like.userId === session?.user?.id)
  );
  const [likeCount, setLikeCount] = useState(post._count.likes);
  const [commentCount, setCommentCount] = useState(post._count.comments);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadComments();
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const loadComments = async () => {
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

  const handleLike = async () => {
    try {
      const method = isLiked ? 'DELETE' : 'POST';
      const response = await fetch(`/api/timeline/${post.id}/like`, { method });
      
      if (response.ok) {
        setIsLiked(!isLiked);
        setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
        onUpdate?.();
      }
    } catch (error) {
      console.error('Error toggling like:', error);
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
        onUpdate?.();
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center p-4 pt-20">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-3">
            {post.user.image ? (
              <Image
                src={post.user.image}
                alt={post.user.name || 'User'}
                width={40}
                height={40}
                className="rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-gray-600 dark:text-gray-400 font-semibold">
                  {(post.user.name || post.user.email || '?')[0].toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {post.user.name || post.user.email?.split('@')[0] || 'Anonymous'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words mb-4">
            {post.content}
          </p>

          {/* Media */}
          {post.media.length > 0 && (
            <div className="space-y-2 mb-4">
              {post.media.map((media) => (
                <div key={media.id}>
                  {media.type === 'image' ? (
                    <img
                      src={media.url}
                      alt={media.filename}
                      className="rounded-lg max-w-full"
                    />
                  ) : (
                    <a
                      href={media.url}
                      download={media.filename}
                      className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                    >
                      <FiFile className="text-gray-600 dark:text-gray-400" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {media.filename}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatFileSize(media.size)}
                        </p>
                      </div>
                      <FiDownload className="text-gray-600 dark:text-gray-400" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Like/Comment counts */}
          <div className="flex items-center space-x-4 py-2 border-y">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-1 ${
                isLiked ? 'text-red-500' : 'text-gray-500 dark:text-gray-400 hover:text-red-500'
              }`}
            >
              <FiHeart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              <span>{likeCount} likes</span>
            </button>
            <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
              <FiMessageCircle className="w-5 h-5" />
              <span>{commentCount} comments</span>
            </div>
          </div>

          {/* Comments */}
          <div className="mt-4">
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Comments</h3>
            
            {/* Comment form */}
            <form onSubmit={handleSubmitComment} className="flex space-x-2 mb-4">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmittingComment}
              />
              <button
                type="submit"
                disabled={!newComment.trim() || isSubmittingComment}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                <FiSend />
              </button>
            </form>

            {/* Comments list */}
            {isLoadingComments ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">Loading comments...</p>
            ) : comments.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No comments yet. Be the first!</p>
            ) : (
              <div className="space-y-3">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex space-x-3">
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
                          <span className="text-gray-600 dark:text-gray-400 text-xs font-semibold">
                            {(comment.user.name || comment.user.email || '?')[0].toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-100 rounded-lg px-3 py-2">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {comment.user.name || comment.user.email?.split('@')[0] || 'Anonymous'}
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{comment.content}</p>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-3">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}