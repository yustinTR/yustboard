'use client';

import { useState, useEffect } from 'react';
import { 
  FiStar, FiRefreshCw, FiChevronRight, 
  FiPaperclip, FiSearch
} from 'react-icons/fi';
import { useSession } from 'next-auth/react';
import { EmailMessage } from '@/utils/google-gmail';

interface GmailWidgetProps {
  initialEmails?: EmailMessage[];
  maxEmails?: number;
}

export default function GmailWidget({ initialEmails = [], maxEmails = 5 }: GmailWidgetProps) {
  const { data: session } = useSession();
  const [emails, setEmails] = useState<EmailMessage[]>(initialEmails);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

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

  // Open email in internal mail page
  const openEmail = (emailId: string) => {
    window.location.href = `/dashboard/mail?email=${emailId}`;
  };

  // Fetch emails from Gmail
  const fetchGmailEmails = async () => {
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
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchGmailEmails();
  };

  useEffect(() => {
    if (session?.accessToken && emails.length === 0) {
      fetchGmailEmails();
    }
  }, [session, emails.length, maxEmails]);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 bg-red-500 text-white flex justify-between items-center">
        <h3 className="font-medium">Gmail</h3>
        <button 
          onClick={fetchGmailEmails} 
          disabled={isLoading}
          className="text-white hover:text-gray-200 dark:hover:text-gray-300 disabled:opacity-50"
          aria-label="Refresh emails"
        >
          <FiRefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>
      
      <div className="p-4">
        <form onSubmit={handleSearch} className="mb-4">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search emails..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
            />
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <button 
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-red-500 hover:text-red-600"
              aria-label="Search"
            >
              <FiChevronRight />
            </button>
          </div>
        </form>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
            {error}
          </div>
        )}
        
        {isLoading ? (
          <div className="py-8 flex justify-center">
            <FiRefreshCw className="animate-spin text-red-500" />
          </div>
        ) : emails.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">No emails to display</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {emails.map((email) => (
              <li 
                key={email.id} 
                className={`py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${!email.isRead ? 'bg-red-50 dark:bg-red-900/20' : ''}`}
                onClick={() => openEmail(email.id)}
              >
                <div className="flex items-center mb-1">
                  <div className={`w-2 h-2 rounded-full mr-2 ${!email.isRead ? 'bg-red-500' : 'bg-transparent'}`}></div>
                  <span className={`font-medium mr-2 ${!email.isRead ? 'text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300'}`}>
                    {email.from.name || email.from.email}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                    {formatDate(email.date)}
                  </span>
                </div>
                <h4 className={`text-sm ${!email.isRead ? 'font-medium text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300'}`}>
                  {truncate(email.subject, 50)}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{truncate(email.snippet, 80)}</p>
                <div className="flex items-center mt-1 text-xs text-gray-400 dark:text-gray-500">
                  {email.isStarred && <FiStar className="text-yellow-400 mr-2" />}
                  {email.hasAttachments && <FiPaperclip className="mr-2" />}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      <div className="p-3 bg-gray-50 dark:bg-gray-800 text-center">
        <a 
          href="/dashboard/mail" 
          className="text-red-500 hover:text-red-600 text-sm font-medium flex items-center justify-center"
        >
          Alle e-mails bekijken
          <FiChevronRight className="ml-1" />
        </a>
      </div>
    </div>
  );
}