'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { nl } from 'date-fns/locale';
import {
  FiActivity,
  FiRefreshCw,
  FiMessageSquare,
  FiHeart,
  FiCheckCircle,
  FiBell,
  FiUserPlus,
  FiMessageCircle
} from 'react-icons/fi';
import { useActivity } from '@/hooks/queries/useActivity';
import type { ActivityItem } from '@/app/api/activity/route';

const activityIcons: Record<ActivityItem['type'], React.ReactNode> = {
  post: <FiMessageSquare className="h-4 w-4 text-indigo-500" />,
  comment: <FiMessageCircle className="h-4 w-4 text-blue-500" />,
  like: <FiHeart className="h-4 w-4 text-red-500" />,
  task_completed: <FiCheckCircle className="h-4 w-4 text-green-500" />,
  announcement: <FiBell className="h-4 w-4 text-purple-500" />,
  member_joined: <FiUserPlus className="h-4 w-4 text-teal-500" />,
};

const activityColors: Record<ActivityItem['type'], string> = {
  post: 'bg-indigo-500/20 border-indigo-400/30',
  comment: 'bg-blue-500/20 border-blue-400/30',
  like: 'bg-red-500/20 border-red-400/30',
  task_completed: 'bg-green-500/20 border-green-400/30',
  announcement: 'bg-purple-500/20 border-purple-400/30',
  member_joined: 'bg-teal-500/20 border-teal-400/30',
};

function getActivityLink(activity: ActivityItem): string | null {
  switch (activity.type) {
    case 'post':
    case 'comment':
    case 'like':
      return activity.metadata?.postId
        ? `/dashboard/timeline?post=${activity.metadata.postId}`
        : null;
    case 'task_completed':
      return '/dashboard/tasks';
    case 'announcement':
      return activity.metadata?.announcementId
        ? `/dashboard/announcements/${activity.metadata.announcementId}`
        : '/dashboard/announcements';
    case 'member_joined':
      return '/dashboard/settings?tab=team';
    default:
      return null;
  }
}

function getActivityDescription(activity: ActivityItem): string | null {
  switch (activity.type) {
    case 'post':
      return activity.metadata?.postContent || null;
    case 'comment':
      return activity.metadata?.postContent ? `op: "${activity.metadata.postContent}"` : null;
    case 'like':
      return activity.metadata?.postContent ? `"${activity.metadata.postContent}"` : null;
    case 'task_completed':
      return activity.metadata?.taskTitle || null;
    case 'announcement':
      return activity.metadata?.announcementTitle || null;
    default:
      return null;
  }
}

const ActivityWidget = React.memo(function ActivityWidget() {
  const { data: activities = [], isLoading, error, refetch } = useActivity(15);

  if (isLoading) {
    return (
      <div className="h-full backdrop-blur-xl bg-white/15 dark:bg-gray-900/15 border border-white/25 dark:border-gray-700/25 rounded-3xl shadow-2xl shadow-black/20 overflow-hidden flex flex-col">
        {/* Header with teal gradient for activity */}
        <div className="px-6 py-4 bg-gradient-to-r from-teal-500/90 to-cyan-500/90 backdrop-blur-sm text-white">
          <h3 className="text-lg font-medium tracking-wide flex items-center gap-2">
            <FiActivity className="h-5 w-5" />
            Activiteit
          </h3>
        </div>

        {/* Loading Content */}
        <div className="flex-1 px-6 py-4 bg-white/5 dark:bg-gray-900/5 backdrop-blur-sm">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse flex gap-3">
                <div className="w-8 h-8 bg-white/30 dark:bg-gray-700/30 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-3 bg-white/30 dark:bg-gray-700/30 rounded w-3/4 mb-2"></div>
                  <div className="h-2 bg-white/20 dark:bg-gray-700/20 rounded w-1/2"></div>
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
      <div className="h-full backdrop-blur-xl bg-white/15 dark:bg-gray-900/15 border border-white/25 dark:border-gray-700/25 rounded-3xl shadow-2xl shadow-black/20 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-teal-500/90 to-cyan-500/90 backdrop-blur-sm text-white flex justify-between items-center">
          <h3 className="text-lg font-medium tracking-wide flex items-center gap-2">
            <FiActivity className="h-5 w-5" />
            Activiteit
          </h3>
          <button
            onClick={() => refetch()}
            className="text-white/90 hover:text-white hover:bg-white/20 p-2 rounded-full transition-all duration-300 cursor-pointer hover:scale-105"
          >
            <FiRefreshCw className="h-5 w-5" />
          </button>
        </div>

        {/* Error Content */}
        <div className="flex-1 px-6 py-4 bg-white/5 dark:bg-gray-900/5 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-red-500/15 border border-red-400/30 text-red-600 dark:text-red-400 p-4 rounded-2xl backdrop-blur-sm text-center">
            <p className="font-medium">Kon activiteit niet laden</p>
            <button
              onClick={() => refetch()}
              className="mt-2 text-sm underline hover:no-underline"
            >
              Probeer opnieuw
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full backdrop-blur-xl bg-white/15 dark:bg-gray-900/15 border border-white/25 dark:border-gray-700/25 rounded-3xl shadow-2xl shadow-black/20 overflow-hidden flex flex-col">
      {/* Header with teal gradient for activity */}
      <div className="px-6 py-4 bg-gradient-to-r from-teal-500/90 to-cyan-500/90 backdrop-blur-sm text-white flex justify-between items-center">
        <h3 className="text-lg font-medium tracking-wide flex items-center gap-2">
          <FiActivity className="h-5 w-5" />
          Activiteit
        </h3>
        <button
          onClick={() => refetch()}
          disabled={isLoading}
          className="text-white/90 hover:text-white hover:bg-white/20 p-2 rounded-full transition-all duration-300 disabled:opacity-50 cursor-pointer hover:scale-105"
        >
          <FiRefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 px-6 py-4 bg-white/5 dark:bg-gray-900/5 backdrop-blur-sm overflow-hidden flex flex-col">
        {activities.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3">
            <div className="bg-teal-500/15 border border-teal-400/30 text-teal-600 dark:text-teal-400 p-6 rounded-2xl backdrop-blur-sm">
              <FiActivity className="mx-auto mb-3 h-8 w-8" />
              <p className="font-medium mb-2">Geen recente activiteit</p>
              <p className="text-sm">Activiteiten van je team verschijnen hier</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-2 scrollbar-hide">
            {activities.map((activity) => {
              const link = getActivityLink(activity);
              const description = getActivityDescription(activity);

              const content = (
                <div className="flex gap-3 group">
                  {/* Activity icon */}
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border ${activityColors[activity.type]}`}>
                    {activityIcons[activity.type]}
                  </div>

                  {/* Activity content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      {activity.user.image ? (
                        <Image
                          src={activity.user.image}
                          alt={activity.user.name || 'User'}
                          width={16}
                          height={16}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-4 h-4 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
                          <span className="text-white text-[8px] font-bold">
                            {(activity.user.name || '?')[0].toUpperCase()}
                          </span>
                        </div>
                      )}
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {activity.user.name || 'Onbekend'}
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-0.5">
                      {activity.message}
                    </p>

                    {description && (
                      <p className="text-xs text-gray-500 dark:text-gray-500 truncate italic">
                        {description}
                      </p>
                    )}

                    <p className="text-[10px] text-gray-400 dark:text-gray-600 mt-1">
                      {formatDistanceToNow(new Date(activity.createdAt), {
                        addSuffix: true,
                        locale: nl
                      })}
                    </p>
                  </div>
                </div>
              );

              if (link) {
                return (
                  <Link
                    key={activity.id}
                    href={link}
                    className="block bg-white/10 dark:bg-gray-800/10 rounded-xl p-3 backdrop-blur-sm border border-white/20 dark:border-gray-600/20 hover:bg-white/20 dark:hover:bg-gray-700/20 transition-all duration-300 hover:scale-[1.01]"
                  >
                    {content}
                  </Link>
                );
              }

              return (
                <div
                  key={activity.id}
                  className="bg-white/10 dark:bg-gray-800/10 rounded-xl p-3 backdrop-blur-sm border border-white/20 dark:border-gray-600/20"
                >
                  {content}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-white/10 dark:bg-gray-800/15 backdrop-blur-sm border-t border-white/20 dark:border-gray-600/20">
        <div className="text-center text-xs text-gray-500 dark:text-gray-400">
          Laatste {activities.length} activiteiten
        </div>
      </div>
    </div>
  );
});

export default ActivityWidget;
