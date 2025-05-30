'use client';

import React from 'react';
import { format, isToday, isYesterday } from 'date-fns';
import { FiStar, FiRefreshCw, FiMail } from 'react-icons/fi';
import { EmailMessage } from '@/utils/google-gmail';

interface EmailListProps {
  emails: EmailMessage[];
  isLoading: boolean;
  onEmailSelect: (email: EmailMessage) => void;
  onStarToggle: (email: EmailMessage) => void;
  onMarkRead: (email: EmailMessage) => void;
  loadMore: () => void;
  hasMore: boolean;
  selectedEmailId?: string;
}

export default function EmailList({
  emails,
  isLoading,
  onEmailSelect,
  onStarToggle,
  onMarkRead,
  loadMore,
  hasMore,
  selectedEmailId
}: EmailListProps) {
  // Format date for display (Today, Yesterday, or date)
  const formatEmailDate = (date: Date | string) => {
    const emailDate = new Date(date);
    
    if (isToday(emailDate)) {
      return format(emailDate, 'h:mm a');
    } else if (isYesterday(emailDate)) {
      return 'Yesterday';
    } else {
      return format(emailDate, 'MMM d');
    }
  };
  
  // Handle scroll to implement infinite scrolling
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight * 1.5) {
      if (hasMore && !isLoading) {
        loadMore();
      }
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <h2 className="font-medium">Emails</h2>
      </div>
      <div 
        className="overflow-y-auto flex-1"
        onScroll={handleScroll}
      >
        {isLoading && emails.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
            <FiRefreshCw className="animate-spin text-green-500 mb-3 w-8 h-8" />
            <p>Loading emails...</p>
          </div>
        ) : emails.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
            <FiMail className="mb-3 w-8 h-8" />
            <p>No emails found</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {emails.map((email) => (
              <li 
                key={email.id}
                className={`relative hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                  selectedEmailId === email.id ? 'bg-green-50' : ''
                }`}
              >
                <div 
                  className="p-4 cursor-pointer"
                  onClick={() => {
                    onEmailSelect(email);
                    onMarkRead(email);
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center">
                      <button
                        className="mr-3 text-gray-400 dark:text-gray-500 hover:text-yellow-400 focus:outline-none"
                        onClick={(e) => {
                          e.stopPropagation();
                          onStarToggle(email);
                        }}
                      >
                        <FiStar className={email.isStarred ? 'text-yellow-400 fill-yellow-400' : ''} />
                      </button>
                      <p className={`font-medium ${!email.isRead ? 'font-semibold' : ''}`}>
                        {email.from.name || email.from.email}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatEmailDate(email.date)}
                    </span>
                  </div>
                  <h3 className={`text-sm truncate ${!email.isRead ? 'font-semibold' : ''}`}>
                    {email.subject}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                    {email.snippet}
                  </p>
                </div>
                {!email.isRead && (
                  <div className="absolute top-1/2 transform -translate-y-1/2 right-4 w-2 h-2 bg-green-500 rounded-full" />
                )}
              </li>
            ))}
            {isLoading && emails.length > 0 && (
              <li className="p-4 flex justify-center">
                <FiRefreshCw className="animate-spin text-green-500" />
              </li>
            )}
            {!isLoading && hasMore && (
              <li className="p-4">
                <button
                  onClick={loadMore}
                  className="w-full py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-sm text-gray-600 dark:text-gray-400"
                >
                  Load more
                </button>
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}