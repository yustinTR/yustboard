'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import { FiHeart, FiMessageCircle, FiFile, FiDownload, FiX, FiMoreHorizontal, FiEdit3, FiTrash2 } from 'react-icons/fi';
import { useSession } from 'next-auth/react';
import { CommentInput } from '@/components/timeline/CommentInput';
import { CommentList } from '@/components/timeline/CommentList';

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

export default function PostWithInteractions({ post, onUpdate }: PostProps) {
  const { data: session } = useSession();
  const [isLiked, setIsLiked] = useState(
    post.likes.some(like => like.userId === session?.user?.id)
  );
  const [likeCount, setLikeCount] = useState(post._count.likes);
  const [showComments, setShowComments] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showActions, setShowActions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleToggleComments = () => {
    setShowComments(!showComments);
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

  // Close actions menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
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
    <div className="backdrop-blur-md bg-white/10 dark:bg-gray-900/10 border border-white/20 dark:border-gray-700/30 rounded-xl shadow-xl shadow-black/10 p-6 hover:shadow-2xl transition-all duration-200">
      {/* Post header */}
      <div className="flex space-x-4">
        <div className="flex-shrink-0">
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
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {post.user.name || post.user.email?.split('@')[0] || 'Anonymous'}
              </p>
              {session?.user?.id === post.user.id && (
                <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full">You</span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </p>
              {canEdit && (
                <div className="relative">
                  <button
                    data-actions-button
                    onClick={() => setShowActions(!showActions)}
                    className="p-1 hover:bg-white/20 dark:hover:bg-gray-800/20 rounded-lg transition-colors backdrop-blur-sm"
                  >
                    <FiMoreHorizontal className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  </button>
                  {showActions && (
                    <div data-actions-menu className="absolute right-0 top-8 backdrop-blur-md bg-white/90 dark:bg-gray-800/90 rounded-xl shadow-lg border border-white/20 dark:border-gray-700/30 py-2 min-w-[120px] z-10">
                      <button
                        onClick={() => {
                          setIsEditing(true);
                          setShowActions(false);
                          setEditContent(post.content);
                        }}
                        className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <FiEdit3 className="w-4 h-4" />
                        <span>Bewerk</span>
                      </button>
                      <button
                        onClick={handleDeletePost}
                        disabled={isDeleting}
                        className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                      >
                        <FiTrash2 className="w-4 h-4" />
                        <span>{isDeleting ? 'Verwijderen...' : 'Verwijder'}</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Post content */}
          {isEditing ? (
            <div className="mt-3">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full min-h-[100px] px-3 py-2 bg-white/20 dark:bg-gray-800/20 border border-white/30 dark:border-gray-600/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent backdrop-blur-sm text-gray-900 dark:text-gray-100 resize-none"
                disabled={isUpdating}
              />
              <div className="flex items-center justify-end space-x-2 mt-2">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(post.content);
                  }}
                  className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                  disabled={isUpdating}
                >
                  Annuleren
                </button>
                <button
                  onClick={handleUpdatePost}
                  disabled={!editContent.trim() || isUpdating}
                  className="px-4 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? 'Opslaan...' : 'Opslaan'}
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-3 text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words leading-relaxed">
              {post.content}
            </p>
          )}

          {/* Media attachments */}
          {post.media.length > 0 && (
            <div className="mt-4 space-y-3">
              {post.media.map((media) => (
                <div key={media.id}>
                  {media.type === 'image' ? (
                    <Image
                      src={media.url}
                      alt={media.filename}
                      width={800}
                      height={600}
                      className="rounded-xl max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity shadow-sm object-contain"
                      onClick={() => setSelectedImage(media.url)}
                      unoptimized={true}
                    />
                  ) : (
                    <a
                      href={media.url}
                      download={media.filename}
                      className="flex items-center space-x-3 p-4 bg-white/20 dark:bg-gray-800/20 rounded-xl hover:bg-white/30 dark:hover:bg-gray-700/30 transition-colors cursor-pointer border border-white/30 dark:border-gray-600/30 backdrop-blur-sm group"
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

          {/* Interaction buttons */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center space-x-6">
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
            <button
              onClick={handleToggleComments}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all transform hover:scale-105"
            >
              <FiMessageCircle className="w-5 h-5" />
              <span className="font-medium">{post._count.comments} comments</span>
            </button>
          </div>

          {/* Comments section */}
          {showComments && (
            <div className="mt-6 space-y-4">
              <CommentInput postId={post.id} />
              <CommentList postId={post.id} />
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
              className="absolute top-4 right-4 text-white hover:text-gray-300 cursor-pointer"
              onClick={() => setSelectedImage(null)}
            >
              <FiX className="w-6 h-6" />
            </button>
            <Image
              src={selectedImage}
              alt="Full size"
              width={1200}
              height={800}
              className="max-w-full max-h-full rounded-lg object-contain"
              unoptimized={true}
            />
          </div>
        </div>
      )}
    </div>
  );
}