'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import { FiHeart, FiMessageCircle, FiX, FiSend, FiFile, FiDownload, FiEdit3, FiTrash2, FiMoreHorizontal } from 'react-icons/fi';
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
  const [mounted, setMounted] = useState(false);
  const [isLiked, setIsLiked] = useState(
    post.likes.some(like => like.userId === session?.user?.id)
  );
  const [likeCount, setLikeCount] = useState(post._count.likes);
  const [commentCount, setCommentCount] = useState(post._count.comments);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const loadComments = useCallback(async () => {
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
  }, [post.id]);

  useEffect(() => {
    setMounted(true);
  }, []);

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
  }, [isOpen, loadComments]);

  // Close actions menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Check if click is outside the actions menu
      if (showActions && !target.closest('[data-actions-menu]') && !target.closest('[data-actions-button]')) {
        setShowActions(false);
      }
    };

    if (showActions) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showActions]);

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

  const handleUpdatePost = async () => {
    if (!editContent.trim() || isUpdating) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/timeline/${post.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent }),
      });

      if (response.ok) {
        post.content = editContent;
        setIsEditing(false);
        onUpdate?.();
      }
    } catch (error) {
      console.error('Error updating post:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeletePost = async () => {
    if (isDeleting) return;
    
    if (!confirm('Weet je zeker dat je deze post wilt verwijderen?')) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/timeline/${post.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onUpdate?.();
        onClose();
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const canEdit = session?.user && (
    session.user.role === 'ADMIN' || session.user.id === post.user.id
  );

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

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 pt-20 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl border border-gray-200 dark:border-gray-700 animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="relative p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            {post.user.image ? (
              <Image
                src={post.user.image}
                alt={post.user.name || 'User'}
                width={48}
                height={48}
                className="rounded-full ring-2 ring-gray-200 dark:ring-gray-700"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center ring-2 ring-gray-200 dark:ring-gray-700">
                <span className="text-white font-bold text-lg">
                  {(post.user.name || post.user.email || '?')[0].toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex-1">
              <p className="font-semibold text-gray-900 dark:text-gray-100">
                {post.user.name || post.user.email?.split('@')[0] || 'Anonymous'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="absolute top-6 right-16 flex items-center space-x-2">
            {canEdit && (
              <div className="relative">
                <button
                  data-actions-button
                  onClick={() => setShowActions(!showActions)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors group"
                >
                  <FiMoreHorizontal className="w-5 h-5 text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300" />
                </button>
                
                {showActions && (
                  <div data-actions-menu className="absolute right-0 top-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 min-w-[140px] z-10">
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setShowActions(false);
                        setEditContent(post.content);
                      }}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <FiEdit3 className="w-4 h-4" />
                      <span>Bewerk</span>
                    </button>
                    <button
                      onClick={handleDeletePost}
                      disabled={isDeleting}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                    >
                      <FiTrash2 className="w-4 h-4" />
                      <span>{isDeleting ? 'Verwijderen...' : 'Verwijder'}</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors group"
          >
            <FiX className="w-6 h-6 text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isEditing ? (
            <div className="mb-4">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full min-h-[120px] px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 resize-none"
                placeholder="Wat denk je?"
                disabled={isUpdating}
              />
              <div className="flex items-center justify-end space-x-3 mt-3">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(post.content);
                  }}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                  disabled={isUpdating}
                >
                  Annuleren
                </button>
                <button
                  onClick={handleUpdatePost}
                  disabled={!editContent.trim() || isUpdating}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? 'Opslaan...' : 'Opslaan'}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words mb-4">
              {post.content}
            </p>
          )}

          {/* Media */}
          {post.media.length > 0 && (
            <div className="space-y-2 mb-4">
              {post.media.map((media) => (
                <div key={media.id}>
                  {media.type === 'image' ? (
                    <Image
                      src={media.url}
                      alt={media.filename}
                      width={800}
                      height={600}
                      className="rounded-lg max-w-full h-auto object-contain"
                      unoptimized={true}
                    />
                  ) : (
                    <a
                      href={media.url}
                      download={media.filename}
                      className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group border border-gray-200 dark:border-gray-700"
                    >
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
                        <FiFile className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                          {media.filename}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatFileSize(media.size)}
                        </p>
                      </div>
                      <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg group-hover:bg-gray-200 dark:group-hover:bg-gray-600 transition-colors">
                        <FiDownload className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </div>
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Like/Comment counts */}
          <div className="flex items-center space-x-6 py-4 border-y border-gray-200 dark:border-gray-700">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all transform hover:scale-105 ${
                isLiked 
                  ? 'text-red-500 bg-red-50 dark:bg-red-900/20' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
              }`}
            >
              <FiHeart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              <span className="font-medium">{likeCount} likes</span>
            </button>
            <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
              <FiMessageCircle className="w-5 h-5" />
              <span className="font-medium">{commentCount} comments</span>
            </div>
          </div>

          {/* Comments */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Comments</h3>
            
            {/* Comment form */}
            <form onSubmit={handleSubmitComment} className="flex space-x-3 mb-6">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-all"
                disabled={isSubmittingComment}
              />
              <button
                type="submit"
                disabled={!newComment.trim() || isSubmittingComment}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-medium transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-lg"
              >
                <FiSend className={isSubmittingComment ? 'animate-pulse' : ''} />
              </button>
            </form>

            {/* Comments list */}
            {isLoadingComments ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-3">
                  <FiMessageCircle className="animate-pulse w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">Loading comments...</p>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiMessageCircle className="w-8 h-8 text-gray-400 dark:text-gray-600" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium mb-1">No comments yet</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">Be the first to share your thoughts!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex space-x-3 group">
                    <div className="flex-shrink-0">
                      {comment.user.image ? (
                        <Image
                          src={comment.user.image}
                          alt={comment.user.name || 'User'}
                          width={36}
                          height={36}
                          className="rounded-full ring-2 ring-gray-200 dark:ring-gray-700"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center ring-2 ring-gray-200 dark:ring-gray-700">
                          <span className="text-white text-xs font-bold">
                            {(comment.user.name || comment.user.email || '?')[0].toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 group-hover:bg-gray-100 dark:group-hover:bg-gray-700 transition-colors">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                          {comment.user.name || comment.user.email?.split('@')[0] || 'Anonymous'}
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{comment.content}</p>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 ml-4">
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

  // Only render portal on client side
  if (!mounted || typeof document === 'undefined') {
    return null;
  }

  return createPortal(modalContent, document.body);
}