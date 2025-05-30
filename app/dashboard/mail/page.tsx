'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
// import { format } from 'date-fns' // Currently not used;
import { 
  FiInbox, FiStar, FiSend, FiArchive, FiTrash2, FiRefreshCw, 
  FiSearch
} from 'react-icons/fi';
import EmailList from '@/components/dashboard/widgets/EmailList';
import EmailViewer from '@/components/dashboard/widgets/EmailViewer';
import { EmailMessage } from '@/utils/google-gmail';

const LABELS = [
  { id: 'inbox', name: 'Inbox', icon: <FiInbox /> },
  { id: 'starred', name: 'Starred', icon: <FiStar /> },
  { id: 'sent', name: 'Sent', icon: <FiSend /> },
  { id: 'archive', name: 'Archive', icon: <FiArchive /> },
  { id: 'trash', name: 'Trash', icon: <FiTrash2 /> },
];

function MailPageContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [emails, setEmails] = useState<EmailMessage[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [nextPageToken, setNextPageToken] = useState<string | undefined>(undefined);
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null);
  const [selectedLabel, setSelectedLabel] = useState('inbox');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch emails for the current label
  const fetchEmails = async (label = selectedLabel, searchText = searchQuery, clear = true) => {
    if (!session?.accessToken) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      // Construct query based on label and search
      let query = '';
      
      if (label === 'inbox') {
        query = 'in:inbox';
      } else if (label === 'starred') {
        query = 'is:starred';
      } else if (label === 'sent') {
        query = 'in:sent';
      } else if (label === 'archive') {
        query = 'in:archive';
      } else if (label === 'trash') {
        query = 'in:trash';
      }
      
      // Add search query if provided
      if (searchText) {
        query = `${query} ${searchText}`;
      }
      
      // Include counts on first fetch
      const includeCountsParam = clear ? '&counts=true' : '';
      
      // Fetch emails from API
      const pageTokenParam = (!clear && nextPageToken) ? `&pageToken=${nextPageToken}` : '';
      const response = await fetch(`/api/mail?query=${encodeURIComponent(query)}${includeCountsParam}${pageTokenParam}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch emails: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Update state with fetched data
      if (clear) {
        setEmails(data.emails || []);
      } else {
        setEmails(prev => [...prev, ...(data.emails || [])]);
      }
      
      setNextPageToken(data.nextPageToken);
      
      // Update counts if available
      if (data.counts) {
        setCounts(data.counts);
      }
    } catch (error) {
      console.error('Error fetching emails:', error);
      setError('Failed to load emails. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch selected email details
  const fetchEmailDetails = async (emailId: string) => {
    if (!session?.accessToken) return;
    
    try {
      const response = await fetch(`/api/mail/${emailId}?markRead=true`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch email details: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Set the selected email with full details
      setSelectedEmail(data.email);
      
      // Mark the email as read in the list
      setEmails(emails.map(email => 
        email.id === emailId ? { ...email, isRead: true } : email
      ));
    } catch (error) {
      console.error('Error fetching email details:', error);
    }
  };
  
  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEmails(selectedLabel, searchQuery);
  };
  
  // Load more emails (pagination)
  const loadMoreEmails = () => {
    if (nextPageToken) {
      fetchEmails(selectedLabel, searchQuery, false);
    }
  };
  
  // Perform an action on an email (star, mark read, etc.)
  const performEmailAction = async (action: string, emailId: string) => {
    if (!session?.accessToken) return;
    
    try {
      const response = await fetch('/api/mail/actions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, messageId: emailId }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to perform action: ${response.statusText}`);
      }
      
      // Update UI based on the action
      if (action === 'markRead') {
        setEmails(emails.map(email => 
          email.id === emailId ? { ...email, isRead: true } : email
        ));
      } else if (action === 'star') {
        setEmails(emails.map(email => 
          email.id === emailId ? { ...email, isStarred: true } : email
        ));
        
        if (selectedEmail?.id === emailId) {
          setSelectedEmail({ ...selectedEmail, isStarred: true });
        }
      } else if (action === 'unstar') {
        setEmails(emails.map(email => 
          email.id === emailId ? { ...email, isStarred: false } : email
        ));
        
        if (selectedEmail?.id === emailId) {
          setSelectedEmail({ ...selectedEmail, isStarred: false });
        }
      }
    } catch (error) {
      console.error('Error performing email action:', error);
    }
  };
  
  // Initialize email fetch
  useEffect(() => {
    if (session?.accessToken) {
      fetchEmails(selectedLabel, searchQuery);
    }
  }, [session, selectedLabel]);
  
  // Handle email parameter from URL
  useEffect(() => {
    const emailId = searchParams.get('email');
    if (emailId && session?.accessToken) {
      // Fetch the email details directly
      fetchEmailDetails(emailId);
    }
  }, [searchParams, session]);
  
  // Select a label
  const handleLabelSelect = (labelId: string) => {
    setSelectedLabel(labelId);
    setSelectedEmail(null);
    setSearchQuery('');
  };
  
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
      <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Mail</h1>
        <div className="flex space-x-3">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search emails..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          </form>
          <button 
            onClick={() => fetchEmails(selectedLabel, searchQuery)}
            disabled={isLoading}
            className="bg-green-500 text-white hover:bg-green-600 px-4 py-2 rounded-lg flex items-center disabled:opacity-50 transition-colors"
          >
            <FiRefreshCw className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}
      
      <div className="flex flex-1 space-x-6 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-white rounded-lg shadow-sm overflow-hidden flex-shrink-0">
          <div className="divide-y divide-gray-200">
            {LABELS.map((label) => (
              <button
                key={label.id}
                className={`w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer ${
                  selectedLabel === label.id ? 'bg-green-50 text-green-600' : ''
                }`}
                onClick={() => handleLabelSelect(label.id)}
              >
                <div className="flex items-center">
                  <span className="mr-3">{label.icon}</span>
                  <span className="font-medium">{label.name}</span>
                </div>
                {counts[label.id] > 0 && (
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {counts[label.id]}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
        
        {/* Main content area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Email list */}
          <div className={`bg-white rounded-lg shadow-sm overflow-hidden ${
            selectedEmail ? 'w-1/3 flex-shrink-0' : 'flex-1'
          }`}>
            <EmailList 
              emails={emails}
              isLoading={isLoading}
              onEmailSelect={(email) => fetchEmailDetails(email.id)}
              onStarToggle={(email) => {
                performEmailAction(
                  email.isStarred ? 'unstar' : 'star', 
                  email.id
                );
              }}
              onMarkRead={(email) => {
                if (!email.isRead) {
                  performEmailAction('markRead', email.id);
                }
              }}
              loadMore={loadMoreEmails}
              hasMore={!!nextPageToken}
              selectedEmailId={selectedEmail?.id}
            />
          </div>
          
          {/* Email viewer */}
          {selectedEmail && (
            <div className="flex-1 bg-white rounded-lg shadow-sm overflow-hidden ml-4">
              <EmailViewer 
                email={selectedEmail}
                onClose={() => setSelectedEmail(null)}
                onStarToggle={() => {
                  performEmailAction(
                    selectedEmail.isStarred ? 'unstar' : 'star', 
                    selectedEmail.id
                  );
                }}
                onMarkReadToggle={() => {
                  if (!selectedEmail.isRead) {
                    performEmailAction('markRead', selectedEmail.id);
                  }
                }}
              />
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}

export default function MailPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <FiRefreshCw className="h-8 w-8 animate-spin text-green-500 mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading emails...</p>
        </div>
      </div>
    }>
      <MailPageContent />
    </Suspense>
  );
}