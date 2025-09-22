'use client';

import { useState, useEffect, Suspense, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { 
  FiInbox, FiStar, FiSend, FiArchive, FiTrash2, FiRefreshCw, 
  FiSearch, FiMail, FiMoreVertical, FiArrowLeft, FiClock,
  FiX
} from 'react-icons/fi';
import { EmailMessage } from '@/utils/google/google-gmail';

const LABELS = [
  { id: 'inbox', name: 'Inbox', icon: FiInbox, color: 'text-blue-600' },
  { id: 'starred', name: 'Starred', icon: FiStar, color: 'text-yellow-500' },
  { id: 'sent', name: 'Sent', icon: FiSend, color: 'text-green-600' },
  { id: 'archive', name: 'Archive', icon: FiArchive, color: 'text-gray-600' },
  { id: 'trash', name: 'Trash', icon: FiTrash2, color: 'text-red-600' },
];

// Loading skeleton component
const EmailSkeleton = () => (
  <div className="flex items-center p-3 sm:p-4 border-b border-border animate-pulse">
    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-full mr-2 sm:mr-3 flex-shrink-0"></div>
    <div className="flex-1 min-w-0">
      <div className="flex justify-between items-start mb-1">
        <div className="h-3 sm:h-4 bg-gray-200 rounded w-24 sm:w-32"></div>
        <div className="h-2 sm:h-3 bg-gray-200 rounded w-12 sm:w-16 ml-2"></div>
      </div>
      <div className="h-3 sm:h-4 bg-gray-200 rounded w-32 sm:w-48 mb-1 sm:mb-2"></div>
      <div className="h-2 sm:h-3 bg-gray-200 rounded w-40 sm:w-64"></div>
    </div>
  </div>
);

const EmailListSkeleton = () => (
  <div className="divide-y divide-border">
    {[...Array(8)].map((_, i) => (
      <EmailSkeleton key={i} />
    ))}
  </div>
);

// Optimized email item component
const EmailItem = ({ email, isSelected, onClick, onStar }: {
  email: EmailMessage;
  isSelected: boolean;
  onClick: () => void;
  onStar: () => void;
}) => {
  const formatDate = useCallback((date: Date | string) => {
    const emailDate = date instanceof Date ? date : new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - emailDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return emailDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return days[emailDate.getDay()];
    } else {
      return emailDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  }, []);

  const handleStarClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onStar();
  }, [onStar]);

  return (
    <div
      className={`flex items-center p-3 sm:p-4 border-b border-border cursor-pointer transition-all duration-200 hover:bg-muted/50 active:bg-muted/70 ${
        isSelected ? 'bg-primary/10 border-l-4 border-l-primary' : ''
      } ${!email.isRead ? 'bg-blue-50/50' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center mr-2 sm:mr-3 flex-shrink-0">
        <button
          onClick={handleStarClick}
          className={`p-1 rounded hover:bg-gray-100 active:bg-gray-200 transition-colors touch-manipulation ${
            email.isStarred ? 'text-yellow-500' : 'text-gray-400'
          }`}
        >
          <FiStar className={`w-3 h-3 sm:w-4 sm:h-4 ${email.isStarred ? 'fill-current' : ''}`} />
        </button>
        {!email.isRead && (
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full ml-1 sm:ml-2"></div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-1">
          <span className={`font-medium text-xs sm:text-sm truncate ${
            !email.isRead ? 'text-foreground font-semibold' : 'text-foreground'
          }`}>
            {email.from?.name || email.from?.email || 'Unknown'}
          </span>
          <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
            {formatDate(email.date)}
          </span>
        </div>
        
        <div className={`text-xs sm:text-sm mb-1 truncate ${
          !email.isRead ? 'font-medium text-foreground' : 'text-muted-foreground'
        }`}>
          {email.subject || '(No subject)'}
        </div>
        
        <div className="text-xs text-muted-foreground truncate leading-relaxed">
          {email.snippet}
        </div>
      </div>
      
      {email.hasAttachments && (
        <div className="ml-1 sm:ml-2 text-gray-400 flex-shrink-0">
          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </div>
  );
};

// Optimized email viewer component
const EmailViewer = ({ email, onBack, onStar }: {
  email: EmailMessage;
  onBack: () => void;
  onStar: () => void;
}) => {
  const formatFullDate = useCallback((date: Date | string) => {
    const emailDate = date instanceof Date ? date : new Date(date);
    return emailDate.toLocaleString('nl-NL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b border-border bg-muted/30">
        <div className="flex items-center min-w-0 flex-1">
          <button
            onClick={onBack}
            className="p-2 hover:bg-muted active:bg-muted/80 rounded-lg transition-colors mr-2 sm:mr-3 lg:hidden touch-manipulation flex-shrink-0"
          >
            <FiArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold text-base sm:text-lg truncate pr-2">
              {email.subject || '(No subject)'}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {formatFullDate(email.date)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
          <button
            onClick={onStar}
            className={`p-2 rounded-lg hover:bg-muted active:bg-muted/80 transition-colors touch-manipulation ${
              email.isStarred ? 'text-yellow-500' : 'text-gray-400'
            }`}
          >
            <FiStar className={`w-4 h-4 sm:w-5 sm:h-5 ${email.isStarred ? 'fill-current' : ''}`} />
          </button>
          <button className="p-2 hover:bg-muted active:bg-muted/80 rounded-lg transition-colors touch-manipulation">
            <FiMoreVertical className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* Email metadata */}
      <div className="p-3 sm:p-4 border-b border-border bg-muted/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center min-w-0 flex-1">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold mr-2 sm:mr-3 flex-shrink-0 text-sm sm:text-base">
              {(email.from?.name || email.from?.email || 'U')[0].toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm sm:text-base truncate">
                {email.from?.name || email.from?.email}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">
                to {Array.isArray(email.to) ? email.to.join(', ') : email.to}
              </p>
            </div>
          </div>
          
          {!email.isRead && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 ml-2 flex-shrink-0">
              <FiMail className="w-3 h-3 mr-1" />
              <span className="hidden sm:inline">Unread</span>
              <span className="sm:hidden">New</span>
            </span>
          )}
        </div>
      </div>

      {/* Email content */}
      <div className="flex-1 overflow-auto p-3 sm:p-6">
        <div className="prose prose-sm max-w-none">
          {email.body ? (
            <div
              dangerouslySetInnerHTML={{ __html: email.body }}
              className="email-content"
            />
          ) : (
            <p className="text-muted-foreground italic text-sm">No content available</p>
          )}
        </div>
      </div>
    </div>
  );
};

function MailPageContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [emails, setEmails] = useState<EmailMessage[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [nextPageToken, setNextPageToken] = useState<string | undefined>(undefined);
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null);
  const [selectedLabel, setSelectedLabel] = useState('inbox');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [isMobileViewerOpen, setIsMobileViewerOpen] = useState(false);

  // Optimized fetch function with proper loading states
  const fetchEmails = useCallback(async (label: string, searchText = '', clear = true) => {
    if (!session?.accessToken) return;
    
    if (clear) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }
    setError('');

    try {
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
      
      if (searchText) {
        query = `${query} ${searchText}`;
      }
      
      const includeCountsParam = clear ? '&counts=true' : '';
      const pageTokenParam = (!clear && nextPageToken) ? `&pageToken=${nextPageToken}` : '';
      const response = await fetch(`/api/gmail?query=${encodeURIComponent(query)}${includeCountsParam}${pageTokenParam}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 401) {
          if (errorData.error?.includes('Authentication expired') || 
              errorData.error?.includes('invalid_grant')) {
            setError('Je sessie is verlopen. Log opnieuw in om je emails te bekijken.');
            setTimeout(() => {
              window.location.href = '/login?error=TokenExpired';
            }, 3000);
            return;
          }
        }
        
        throw new Error(errorData.error || `Failed to fetch emails: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (clear) {
        setEmails(data.emails || []);
      } else {
        setEmails(prev => [...prev, ...(data.emails || [])]);
      }
      
      setNextPageToken(data.nextPageToken);
      
      if (data.counts) {
        setCounts(data.counts);
      }
    } catch (error) {
      console.error('Error fetching emails:', error);
      setError('Failed to load emails. Please try again.');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [session?.accessToken, nextPageToken]);

  // Optimized email details fetch
  const fetchEmailDetails = useCallback(async (emailId: string) => {
    if (!session?.accessToken) return;
    
    try {
      const response = await fetch(`/api/gmail/${emailId}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 401) {
          if (errorData.error?.includes('Authentication expired') || 
              errorData.error?.includes('invalid_grant')) {
            setError('Je sessie is verlopen. Log opnieuw in om je emails te bekijken.');
            setTimeout(() => {
              window.location.href = '/login?error=TokenExpired';
            }, 3000);
            return;
          }
          setError('Niet geautoriseerd. Log opnieuw in.');
          return;
        }
        
        if (response.status === 403) {
          setError('Onvoldoende rechten. Herverbind je Google account.');
          return;
        }
        
        throw new Error(errorData.error || `Failed to fetch email details: ${response.statusText}`);
      }
      
      const data = await response.json();
      setSelectedEmail(data.email);
      setIsMobileViewerOpen(true);
      
      // Mark as read in the list
      setEmails(emails => emails.map(email => 
        email.id === emailId ? { ...email, isRead: true } : email
      ));
    } catch (error) {
      console.error('Error fetching email details:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(`Kon email niet laden: ${errorMessage}`);
    }
  }, [session?.accessToken]);

  // Perform email actions (star/unstar)
  const performEmailAction = useCallback(async (action: string, emailId: string) => {
    if (!session?.accessToken) return;
    
    try {
      const response = await fetch('/api/gmail/actions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, messageId: emailId }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to perform action: ${response.statusText}`);
      }
      
      // Optimistic update
      const updateEmail = (email: EmailMessage) => {
        if (email.id !== emailId) return email;
        
        if (action === 'star') {
          return { ...email, isStarred: true };
        } else if (action === 'unstar') {
          return { ...email, isStarred: false };
        } else if (action === 'markRead') {
          return { ...email, isRead: true };
        }
        return email;
      };
      
      setEmails(emails => emails.map(updateEmail));
      
      if (selectedEmail?.id === emailId) {
        setSelectedEmail(updateEmail(selectedEmail));
      }
    } catch (error) {
      console.error('Error performing email action:', error);
    }
  }, [session?.accessToken, selectedEmail]);

  // Handle search
  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    fetchEmails(selectedLabel, searchQuery);
  }, [selectedLabel, searchQuery, fetchEmails]);

  // Load more emails
  const loadMoreEmails = useCallback(() => {
    if (nextPageToken && !isLoadingMore) {
      fetchEmails(selectedLabel, searchQuery, false);
    }
  }, [nextPageToken, isLoadingMore, selectedLabel, searchQuery, fetchEmails]);

  // Handle label selection
  const handleLabelSelect = useCallback((labelId: string) => {
    setSelectedLabel(labelId);
    setSelectedEmail(null);
    setSearchQuery('');
    setIsMobileViewerOpen(false);
    fetchEmails(labelId);
  }, [fetchEmails]);

  // Handle email selection
  const handleEmailSelect = useCallback((email: EmailMessage) => {
    fetchEmailDetails(email.id);
  }, [fetchEmailDetails]);

  // Handle star toggle
  const handleStarToggle = useCallback((email: EmailMessage) => {
    const action = email.isStarred ? 'unstar' : 'star';
    performEmailAction(action, email.id);
  }, [performEmailAction]);

  // Handle back in mobile viewer
  const handleBackToList = useCallback(() => {
    setIsMobileViewerOpen(false);
    setSelectedEmail(null);
  }, []);

  // Initialize
  useEffect(() => {
    if (session?.accessToken) {
      fetchEmails(selectedLabel, searchQuery);
    }
  }, [session?.accessToken, selectedLabel, searchQuery, fetchEmails]);

  // Handle URL email parameter
  useEffect(() => {
    const emailId = searchParams.get('id');
    if (emailId && session?.accessToken) {
      fetchEmailDetails(emailId);
    }
  }, [searchParams, session?.accessToken, fetchEmailDetails]);

  // Memoized label with count
  const labelsWithCounts = useMemo(() => 
    LABELS.map(label => ({
      ...label,
      count: counts[label.id] || 0
    }))
  , [counts]);

  if (!session) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FiMail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Please sign in to view your emails</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Mobile header */}
      <div className="lg:hidden border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="flex items-center justify-between p-3 sm:p-4">
          <h1 className="text-lg sm:text-xl font-semibold">Mail</h1>
          <button
            onClick={() => fetchEmails(selectedLabel, searchQuery)}
            className="p-2 hover:bg-muted active:bg-muted/80 rounded-lg transition-colors touch-manipulation"
            disabled={isLoading}
          >
            <FiRefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        
        {/* Mobile search */}
        <div className="px-3 sm:px-4 pb-3 sm:pb-4">
          <form onSubmit={handleSearch} className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Zoek emails..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 sm:py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base"
            />
          </form>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Desktop only */}
        <div className="hidden lg:flex w-64 border-r border-border bg-muted/30 flex-col">
          <div className="p-4 border-b border-border">
            <h1 className="text-2xl font-bold">Mail</h1>
          </div>
          
          <div className="p-4 border-b border-border">
            <form onSubmit={handleSearch} className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Search emails..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </form>
          </div>
          
          <nav className="flex-1 p-4">
            <div className="space-y-1">
              {labelsWithCounts.map((label) => {
                const Icon = label.icon;
                return (
                  <button
                    key={label.id}
                    onClick={() => handleLabelSelect(label.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                      selectedLabel === label.id
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-center">
                      <Icon className={`w-5 h-5 mr-3 ${
                        selectedLabel === label.id ? '' : label.color
                      }`} />
                      <span className="font-medium">{label.name}</span>
                    </div>
                    {label.count > 0 && (
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        selectedLabel === label.id
                          ? 'bg-primary-foreground/20'
                          : 'bg-muted-foreground/20'
                      }`}>
                        {label.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </nav>
        </div>

        {/* Mobile label selector */}
        <div className="lg:hidden border-b border-border bg-background">
          <div className="flex overflow-x-auto p-2 space-x-2 scrollbar-hide">
            {labelsWithCounts.map((label) => {
              const Icon = label.icon;
              return (
                <button
                  key={label.id}
                  onClick={() => handleLabelSelect(label.id)}
                  className={`flex items-center px-3 sm:px-4 py-2 rounded-full whitespace-nowrap transition-colors touch-manipulation active:scale-95 ${
                    selectedLabel === label.id
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-muted hover:bg-muted/80 active:bg-muted/90'
                  }`}
                >
                  <Icon className={`w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 ${
                    selectedLabel === label.id ? '' : label.color
                  }`} />
                  <span className="text-xs sm:text-sm font-medium">{label.name}</span>
                  {label.count > 0 && (
                    <span className="ml-1.5 sm:ml-2 text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full bg-background/20 min-w-[1.25rem] text-center">
                      {label.count > 99 ? '99+' : label.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Email list */}
          <div className={`${
            isMobileViewerOpen ? 'hidden' : 'flex'
          } lg:flex flex-col w-full lg:w-96 border-r border-border bg-background`}>
            {/* Desktop header */}
            <div className="hidden lg:flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-semibold capitalize">
                {LABELS.find(l => l.id === selectedLabel)?.name}
              </h2>
              <button
                onClick={() => fetchEmails(selectedLabel, searchQuery)}
                className="p-2 hover:bg-muted rounded-lg transition-colors touch-manipulation"
                disabled={isLoading}
              >
                <FiRefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Error display */}
            {error && (
              <div className="p-4 bg-destructive/10 border-b border-destructive/20">
                <div className="flex items-center text-destructive">
                  <FiX className="w-4 h-4 mr-2" />
                  <span className="text-sm">{error}</span>
                </div>
              </div>
            )}

            {/* Email list content */}
            <div className="flex-1 overflow-auto">
              {isLoading ? (
                <EmailListSkeleton />
              ) : emails.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center p-8">
                  <FiMail className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">No emails found</h3>
                  <p className="text-sm text-muted-foreground">
                    {searchQuery ? 'Try adjusting your search terms' : `Your ${selectedLabel} is empty`}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {emails.map((email) => (
                    <EmailItem
                      key={email.id}
                      email={email}
                      isSelected={selectedEmail?.id === email.id}
                      onClick={() => handleEmailSelect(email)}
                      onStar={() => handleStarToggle(email)}
                    />
                  ))}
                  
                  {/* Load more button */}
                  {nextPageToken && (
                    <div className="p-3 sm:p-4 border-t border-border">
                      <button
                        onClick={loadMoreEmails}
                        disabled={isLoadingMore}
                        className="w-full py-3 sm:py-2 px-4 border border-border rounded-lg hover:bg-muted active:bg-muted/80 transition-colors disabled:opacity-50 touch-manipulation text-sm sm:text-base"
                      >
                        {isLoadingMore ? (
                          <span className="flex items-center justify-center">
                            <FiClock className="w-4 h-4 mr-2 animate-spin" />
                            <span className="hidden sm:inline">Loading...</span>
                            <span className="sm:hidden">Laden...</span>
                          </span>
                        ) : (
                          <>
                            <span className="hidden sm:inline">Load more</span>
                            <span className="sm:hidden">Meer laden</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Email viewer */}
          <div className={`${
            !isMobileViewerOpen ? 'hidden' : 'flex'
          } lg:flex flex-1 flex-col`}>
            {selectedEmail ? (
              <EmailViewer
                email={selectedEmail}
                onBack={handleBackToList}
                onStar={() => handleStarToggle(selectedEmail)}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center bg-muted/10">
                <div className="text-center">
                  <FiMail className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-muted-foreground mb-2">
                    Select an email to read
                  </h3>
                  <p className="text-muted-foreground">
                    Choose an email from the list to view its contents
                  </p>
                </div>
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
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading mail...</p>
        </div>
      </div>
    }>
      <MailPageContent />
    </Suspense>
  );
}