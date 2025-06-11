'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiX, FiStar, FiDownload, FiExternalLink, FiMail, FiCalendar, FiCornerUpLeft, FiCornerUpRight } from 'react-icons/fi';
import { EmailMessage } from '@/utils/google-gmail';

interface EmailModalProps {
  emailId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

interface EmailDetails extends EmailMessage {
  body?: string;
  isHtml?: boolean;
}

function EmailModal({ emailId, isOpen, onClose }: EmailModalProps) {
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState<EmailDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isStarred, setIsStarred] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    if (isOpen && emailId) {
      fetchEmailDetails();
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setEmail(null);
      setError(null);
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, emailId, mounted]);

  const fetchEmailDetails = async () => {
    if (!emailId) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/gmail/${emailId}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch email: ${response.statusText}`);
      }
      
      const data = await response.json();
      setEmail(data.email);
      setIsStarred(data.email.isStarred);
    } catch (error) {
      console.error('Error fetching email details:', error);
      setError(error instanceof Error ? error.message : 'Failed to load email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStar = async () => {
    if (!email) return;

    try {
      const action = isStarred ? 'unstar' : 'star';
      const response = await fetch('/api/gmail/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, messageId: email.id }),
      });

      if (response.ok) {
        setIsStarred(!isStarred);
        setEmail({ ...email, isStarred: !isStarred });
      }
    } catch (error) {
      console.error('Error toggling star:', error);
    }
  };

  const formatFullDate = (date: Date | string) => {
    const emailDate = date instanceof Date ? date : new Date(date);
    return emailDate.toLocaleString('nl-NL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const openInMailApp = () => {
    if (email) {
      window.open(`/dashboard/mail?id=${email.id}`, '_blank');
    }
  };

  // Don't render anything on server or if not mounted
  if (!mounted || !isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl border border-gray-200 dark:border-gray-700 animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="relative p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-red-500/10 to-red-600/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                <FiMail className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {isLoading ? 'Loading email...' : email?.subject || '(No subject)'}
                </h2>
                {email && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <FiCalendar className="w-3 h-3" />
                    {formatFullDate(email.date)}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {email && (
                <>
                  <button
                    onClick={handleStar}
                    className={`p-2 rounded-lg transition-colors ${
                      isStarred 
                        ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' 
                        : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                    }`}
                    title={isStarred ? 'Remove star' : 'Add star'}
                  >
                    <FiStar className={`w-5 h-5 ${isStarred ? 'fill-current' : ''}`} />
                  </button>
                  
                  <button
                    onClick={openInMailApp}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    title="Open in mail app"
                  >
                    <FiExternalLink className="w-5 h-5" />
                  </button>
                </>
              )}
              
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto animate-pulse">
                  <FiMail className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <p className="text-gray-600 dark:text-gray-400">Loading email...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-3 max-w-md">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto">
                  <FiX className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100">Failed to load email</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{error}</p>
                <button
                  onClick={fetchEmailDetails}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                >
                  Try again
                </button>
              </div>
            </div>
          ) : email ? (
            <>
              {/* Email metadata */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-lg">
                        {(email.from?.name || email.from?.email || 'U')[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">
                        {email.from?.name || email.from?.email}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        to {Array.isArray(email.to) ? email.to.join(', ') : email.to}
                      </p>
                    </div>
                  </div>
                  
                  {!email.isRead && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      <FiMail className="w-3 h-3 mr-1" />
                      Unread
                    </span>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex items-center space-x-3">
                  <button className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
                    <FiCornerUpLeft className="w-4 h-4" />
                    <span>Reply</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors">
                    <FiCornerUpRight className="w-4 h-4" />
                    <span>Forward</span>
                  </button>
                  {email.hasAttachments && (
                    <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors">
                      <FiDownload className="w-4 h-4" />
                      <span>Attachments</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Email content */}
              <div className="flex-1 overflow-auto p-6">
                <div className="prose prose-gray dark:prose-invert max-w-none">
                  {email.body ? (
                    <div
                      dangerouslySetInnerHTML={{ __html: email.body }}
                      className="email-content"
                    />
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 italic">No content available</p>
                  )}
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );

  // Only create portal if we have access to document (client-side)
  if (typeof document === 'undefined') return null;
  
  return createPortal(modalContent, document.body);
}

export default EmailModal;