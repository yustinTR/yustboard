'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { FiBell, FiCalendar, FiUser, FiRefreshCw } from 'react-icons/fi';
import Image from 'next/image';

interface Announcement {
  id: string;
  title: string;
  content: string;
  coverImage: string | null;
  published: boolean;
  publishedAt: string | null;
  createdAt: string;
  author: {
    id: string;
    name: string | null;
  };
}

const AnnouncementsWidget = React.memo(function AnnouncementsWidget() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLatestAnnouncements();
  }, []);

  const fetchLatestAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/announcements?published=true');

      if (!response.ok) {
        throw new Error('Failed to fetch announcements');
      }

      const data = await response.json();
      // Limit to 5 most recent announcements
      setAnnouncements((data.announcements || []).slice(0, 5));
    } catch (err) {
      console.error('Error fetching announcements:', err);
      setError(err instanceof Error ? err.message : 'Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full backdrop-blur-xl bg-white/15 dark:bg-gray-900/15 border border-white/25 dark:border-gray-700/25 rounded-3xl shadow-2xl shadow-black/20 overflow-hidden flex flex-col">
        {/* Header with purple gradient for announcements */}
        <div className="px-6 py-4 bg-gradient-to-r from-purple-500/90 to-purple-600/90 backdrop-blur-sm text-white">
          <h3 className="text-lg font-medium tracking-wide flex items-center gap-2">
            <FiBell className="h-5 w-5" />
            Announcements
          </h3>
        </div>

        {/* Loading Content */}
        <div className="flex-1 px-6 py-4 bg-white/5 dark:bg-gray-900/5 backdrop-blur-sm">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white/20 dark:bg-gray-800/20 rounded-2xl p-4 backdrop-blur-sm border border-white/30 dark:border-gray-600/30">
                <div className="h-4 bg-white/30 dark:bg-gray-700/30 rounded-lg w-3/4 mb-2"></div>
                <div className="h-3 bg-white/20 dark:bg-gray-700/20 rounded-lg w-1/2"></div>
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
        {/* Header with purple gradient for announcements */}
        <div className="px-6 py-4 bg-gradient-to-r from-purple-500/90 to-purple-600/90 backdrop-blur-sm text-white flex justify-between items-center">
          <h3 className="text-lg font-medium tracking-wide flex items-center gap-2">
            <FiBell className="h-5 w-5" />
            Announcements
          </h3>
          <button
            onClick={fetchLatestAnnouncements}
            disabled={loading}
            className="text-white/90 hover:text-white hover:bg-white/20 p-2 rounded-full transition-all duration-300 disabled:opacity-50 cursor-pointer hover:scale-105"
          >
            <FiRefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Error Content */}
        <div className="flex-1 px-6 py-4 bg-white/5 dark:bg-gray-900/5 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-red-500/15 border border-red-400/30 text-red-600 dark:text-red-400 p-4 rounded-2xl backdrop-blur-sm">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full backdrop-blur-xl bg-white/15 dark:bg-gray-900/15 border border-white/25 dark:border-gray-700/25 rounded-3xl shadow-2xl shadow-black/20 overflow-hidden flex flex-col">
      {/* Header with purple gradient for announcements */}
      <div className="px-6 py-4 bg-gradient-to-r from-purple-500/90 to-purple-600/90 backdrop-blur-sm text-white flex justify-between items-center">
        <h3 className="text-lg font-medium tracking-wide flex items-center gap-2">
          <FiBell className="h-5 w-5" />
          Announcements
        </h3>
        <button
          onClick={fetchLatestAnnouncements}
          disabled={loading}
          className="text-white/90 hover:text-white hover:bg-white/20 p-2 rounded-full transition-all duration-300 disabled:opacity-50 cursor-pointer hover:scale-105"
        >
          <FiRefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 px-6 py-4 bg-white/5 dark:bg-gray-900/5 backdrop-blur-sm overflow-hidden flex flex-col">
        {announcements.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3">
            <div className="bg-purple-500/15 border border-purple-400/30 text-purple-600 dark:text-purple-400 p-6 rounded-2xl backdrop-blur-sm">
              <FiBell className="mx-auto mb-3 h-8 w-8" />
              <p className="font-medium mb-2">Geen aankondigingen</p>
              <p className="text-sm">Er zijn momenteel geen aankondigingen voor je organisatie</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto space-y-3">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="bg-white/20 dark:bg-gray-800/20 rounded-2xl p-4 backdrop-blur-sm border border-white/30 dark:border-gray-600/30 hover:bg-white/30 dark:hover:bg-gray-700/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg cursor-pointer group">
                  <div className="flex gap-3">
                    {announcement.coverImage && (
                      <div className="flex-shrink-0">
                        <Image
                          src={announcement.coverImage}
                          alt={announcement.title}
                          width={60}
                          height={60}
                          className="rounded-xl object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2 leading-snug mb-2">
                        {announcement.title}
                      </h4>
                      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-500">
                        <span className="flex items-center gap-1">
                          <FiUser className="h-3 w-3" />
                          {announcement.author.name || 'Anonymous'}
                        </span>
                        <span className="flex items-center gap-1">
                          <FiCalendar className="h-3 w-3" />
                          {format(new Date(announcement.publishedAt || announcement.createdAt), 'dd MMM yyyy')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Footer with Material button */}
      <div className="px-6 py-4 bg-white/10 dark:bg-gray-800/15 backdrop-blur-sm border-t border-white/20 dark:border-gray-600/20">
        <Link
          href="/dashboard/announcements"
          className="block w-full text-center bg-purple-500/20 hover:bg-purple-500/30 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 text-sm font-medium py-3 px-4 rounded-2xl transition-all duration-300 hover:scale-[1.02] border border-purple-400/30 backdrop-blur-sm"
        >
          Bekijk alle aankondigingen
        </Link>
      </div>
    </div>
  );
});

export default AnnouncementsWidget;
