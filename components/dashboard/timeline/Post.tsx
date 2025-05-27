'use client';

import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';

interface PostProps {
  post: {
    id: string;
    content: string;
    createdAt: string;
    user: {
      id: string;
      name: string | null;
      email: string | null;
      image: string | null;
    };
  };
  currentUserId?: string;
}

export default function Post({ post, currentUserId }: PostProps) {
  const isOwnPost = currentUserId === post.user.id;

  return (
    <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
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
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-900">
              {post.user.name || post.user.email?.split('@')[0] || 'Anonymous'}
              {isOwnPost && (
                <span className="ml-2 text-xs text-gray-500 font-normal">• You</span>
              )}
            </p>
            <p className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </p>
          </div>
          <p className="mt-2 text-gray-800 whitespace-pre-wrap break-words">
            {post.content}
          </p>
        </div>
      </div>
    </div>
  );
}