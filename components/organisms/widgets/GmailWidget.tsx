'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  FiStar, FiRefreshCw,
  FiPaperclip, FiSearch
} from 'react-icons/fi';
import { useSession } from 'next-auth/react';
import { EmailMessage } from '@/utils/google/google-gmail';
import dynamic from 'next/dynamic';

const EmailModal = dynamic(() => import('./EmailModal'), { ssr: false });

interface GmailWidgetProps {
  initialEmails?: EmailMessage[];
  maxEmails?: number;
}

const GmailWidget = React.memo(function GmailWidget({ initialEmails = [], maxEmails = 5 }: GmailWidgetProps) {
  const { data: session } = useSession();
  const [emails, setEmails] = useState<EmailMessage[]>(initialEmails);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

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

  // Fetch emails from Gmail
  const fetchGmailEmails = useCallback(async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Build the query string
      let queryParams = `max=${maxEmails}`;
      if (searchQuery) {
        queryParams += `&query=${encodeURIComponent(searchQuery)}`;
      }
      
      // Use the API route to fetch emails
      const response = await fetch(`/api/gmail?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch emails: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      // Process emails to ensure dates are properly handled
      const processedEmails = (data.emails || []).map((email: EmailMessage) => ({
        ...email,
        // Ensure date is a Date object if it's a string
        date: typeof email.date === 'string' ? new Date(email.date) : email.date
      }));
      
      setEmails(processedEmails);
    } catch (error) {
      console.error('Error fetching emails:', error);
      setError('Failed to load emails. Please try again.');
      
      // Fallback to mock data for development/testing
      if (process.env.NODE_ENV === 'development') {
        const mockEmails: EmailMessage[] = [
          {
            id: 'email1',
            threadId: 'thread1',
            from: { name: 'John Doe', email: 'john@example.com' },
            to: ['you@example.com'],
            subject: 'Project Update: Dashboard Development',
            snippet: 'Hey, I wanted to check in on the dashboard project. We need to finalize the design by...',
            date: new Date(Date.now() - 3600000), // 1 hour ago
            isRead: false,
            isStarred: true,
            hasAttachments: true,
            labels: ['INBOX', 'UNREAD', 'STARRED'],
            sizeEstimate: 15420
          },
          {
            id: 'email2',
            threadId: 'thread2',
            from: { name: 'Team Notifications', email: 'notifications@example.com' },
            to: ['you@example.com'],
            subject: 'Your weekly summary report',
            snippet: 'Here is your weekly activity report. Your team completed 87% of the assigned tasks...',
            date: new Date(Date.now() - 86400000), // 1 day ago
            isRead: true,
            isStarred: false,
            hasAttachments: false,
            labels: ['INBOX', 'CATEGORY_UPDATES'],
            sizeEstimate: 8250
          },
          {
            id: 'email3',
            threadId: 'thread3',
            from: { name: 'Sarah Johnson', email: 'sarah@example.com' },
            to: ['you@example.com', 'team@example.com'],
            subject: 'Meeting notes - Product roadmap',
            snippet: 'Hi everyone, Attached are the notes from our product roadmap meeting yesterday...',
            date: new Date(Date.now() - 86400000 * 2), // 2 days ago
            isRead: true,
            isStarred: false,
            hasAttachments: true,
            labels: ['INBOX'],
            sizeEstimate: 24680
          }
        ];
        setEmails(mockEmails);
      }
    } finally {
      setIsLoading(false);
    }
  }, [maxEmails, searchQuery]);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchGmailEmails();
  };

  useEffect(() => {
    if (session?.accessToken && emails.length === 0) {
      fetchGmailEmails();
    }
  }, [session?.accessToken, emails.length, fetchGmailEmails]);

  return (
    <div className="backdrop-blur-xl bg-white/15 dark:bg-gray-900/15 border border-white/25 dark:border-gray-700/25 rounded-3xl shadow-2xl shadow-black/20 overflow-hidden">
      {/* Header with Google Material red gradient */}
      <div className="px-6 py-4 bg-gradient-to-r from-red-500/90 to-pink-500/90 backdrop-blur-sm text-white flex justify-between items-center">
        <h3 className="text-lg font-medium tracking-wide">Gmail</h3>
        <button
          onClick={fetchGmailEmails}
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
            {error}
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