'use client';

import React, { useState, useEffect } from 'react';
import {
  FiStar, FiRefreshCw,
  FiPaperclip, FiSearch
} from 'react-icons/fi';
import { EmailMessage } from '@/utils/google/google-gmail';
import dynamic from 'next/dynamic';
import { useGmail } from '@/hooks/queries/useGmail';

const EmailModal = dynamic(() => import('./EmailModal'), { ssr: false });

interface GmailWidgetProps {
  maxEmails?: number;
}

const GmailWidget = React.memo(function GmailWidget({ maxEmails = 5 }: GmailWidgetProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Use React Query hook
  const { data, isLoading, error, refetch } = useGmail({
    max: maxEmails,
    query: searchQuery || 'in:inbox'
  });

  const emails = data?.messages || [];

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Format the email date
  const formatDate = (date: Date | string) => {
    // Ensure we have a Date object
    const emailDate = date instanceof Date ? date : new Date(date);
    
    // Check if the date is valid
    if (isNaN(emailDate.getTime())) {
      return 'Unknown date';
    }
    
    const now = new Date();
    const diffMs = now.getTime() - emailDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      // Today: show time
      return emailDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return days[emailDate.getDay()];
    } else {
      return emailDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  // Truncate text to specified length
  const truncate = (text: string, maxLength: number) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // Open email in modal
  const openEmail = (emailId: string) => {
    setSelectedEmailId(emailId);
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    refetch();
  };

  return (
    <div className="backdrop-blur-xl bg-white/15 dark:bg-gray-900/15 border border-white/25 dark:border-gray-700/25 rounded-3xl shadow-2xl shadow-black/20 overflow-hidden">
      {/* Header with Google Material red gradient */}
      <div className="px-6 py-4 bg-gradient-to-r from-red-500/90 to-pink-500/90 backdrop-blur-sm text-white flex justify-between items-center">
        <h3 className="text-lg font-medium tracking-wide">Gmail</h3>
        <button
          onClick={() => refetch()}
          disabled={isLoading}
          className="text-white/90 hover:text-white hover:bg-white/20 p-2 rounded-full transition-all duration-300 disabled:opacity-50 cursor-pointer hover:scale-105"
          aria-label="Refresh emails"
        >
          <FiRefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Search Section */}
      <div className="px-6 py-4 bg-white/10 dark:bg-gray-900/10 backdrop-blur-sm">
        <form onSubmit={handleSearch}>
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search emails..."
              className="w-full pl-12 pr-4 py-3 bg-white/30 dark:bg-gray-800/30 border border-white/40 dark:border-gray-600/40 rounded-2xl backdrop-blur-sm text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400/60 focus:border-red-400/60 transition-all duration-300 text-sm"
            />
          </div>
        </form>
      </div>

      {/* Content Area */}
      <div className="px-6 pb-4 bg-white/5 dark:bg-gray-900/5 backdrop-blur-sm">

        {error && (
          <div className="bg-red-500/15 border border-red-400/30 text-red-600 dark:text-red-400 p-4 rounded-2xl mb-4 backdrop-blur-sm">
            {error.message || 'Failed to load emails'}
          </div>
        )}

        {isLoading ? (
          <div className="py-12 flex justify-center">
            <FiRefreshCw className="animate-spin text-red-500 w-8 h-8" />
          </div>
        ) : emails.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8 text-sm">No emails to display</p>
        ) : (
          <div className="space-y-3">
            {emails.map((email) => (
              <div
                key={email.id}
                onClick={() => openEmail(email.id)}
                className={`relative p-4 rounded-2xl cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg backdrop-blur-sm border ${
                  !email.isRead
                    ? 'bg-red-50/30 dark:bg-red-900/20 border-red-200/40 dark:border-red-700/40 shadow-md'
                    : 'bg-white/20 dark:bg-gray-800/20 border-white/30 dark:border-gray-600/30 hover:bg-white/30 dark:hover:bg-gray-700/30'
                }`}
              >
                {/* Unread indicator */}
                {!email.isRead && (
                  <div className="absolute left-2 top-4 w-3 h-3 bg-red-500 rounded-full"></div>
                )}

                {/* Starred indicator */}
                {email.isStarred && (
                  <div className="absolute right-2 top-2">
                    <FiStar className="w-4 h-4 text-yellow-500 fill-current" />
                  </div>
                )}

                {/* Email content */}
                <div className={`${!email.isRead ? 'pl-4' : ''}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`font-medium text-sm ${!email.isRead ? 'text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300'}`}>
                      {email.from.name || email.from.email}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                      {formatDate(email.date)}
                    </span>
                  </div>

                  <h4 className={`text-sm mb-2 leading-snug ${!email.isRead ? 'font-semibold text-gray-900 dark:text-gray-100' : 'font-medium text-gray-700 dark:text-gray-300'}`}>
                    {truncate(email.subject, 45)}
                  </h4>

                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-2">
                    {truncate(email.snippet, 85)}
                  </p>

                  {/* Icons row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-xs text-gray-400 dark:text-gray-500">
                      {email.hasAttachments && (
                        <FiPaperclip className="w-3 h-3 mr-1" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer with Material button */}
      <div className="px-6 py-4 bg-white/10 dark:bg-gray-800/15 backdrop-blur-sm border-t border-white/20 dark:border-gray-600/20">
        <a
          href="/dashboard/mail"
          className="block w-full text-center bg-red-500/20 hover:bg-red-500/30 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-medium py-3 px-4 rounded-2xl transition-all duration-300 hover:scale-[1.02] border border-red-400/30 backdrop-blur-sm"
        >
          Alle e-mails bekijken
        </a>
      </div>

      {/* Email Modal - only render after client-side hydration */}
      {isMounted && (
        <EmailModal
          emailId={selectedEmailId}
          isOpen={!!selectedEmailId}
          onClose={() => setSelectedEmailId(null)}
        />
      )}
    </div>
  );
});

export default GmailWidget;