'use client';

import React from 'react';
import { format } from 'date-fns';
import { FiStar, FiChevronLeft, FiUser, FiPaperclip } from 'react-icons/fi';
import { EmailMessage } from '@/utils/google-gmail';

interface EmailViewerProps {
  email: EmailMessage;
  onClose: () => void;
  onStarToggle: () => void;
  onMarkReadToggle: () => void;
}

export default function EmailViewer({
  email,
  onClose,
  onStarToggle,
  onMarkReadToggle
}: EmailViewerProps) {
  // Create a sanitized HTML version with a React ref
  const emailContentRef = React.useRef<HTMLDivElement>(null);
  
  React.useEffect(() => {
    // Set the content
    if (emailContentRef.current && email.body) {
      emailContentRef.current.innerHTML = email.body;
      
      // Add target="_blank" to all links
      const links = emailContentRef.current.querySelectorAll('a');
      links.forEach(link => {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
      });
      
      // Limit image sizes
      const images = emailContentRef.current.querySelectorAll('img');
      images.forEach(img => {
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
      });
    }
    
    // Mark as read if not already
    if (!email.isRead) {
      onMarkReadToggle();
    }
  }, [email, onMarkReadToggle]);
  
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-800">
        <button
          onClick={onClose}
          className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 cursor-pointer"
        >
          <FiChevronLeft className="mr-1" />
          <span>Back</span>
        </button>
        <div className="flex items-center space-x-2">
          <button
            onClick={onStarToggle}
            className="p-2 text-gray-400 dark:text-gray-500 hover:text-yellow-400 focus:outline-none cursor-pointer"
          >
            <FiStar className={email.isStarred ? 'text-yellow-400 fill-yellow-400' : ''} />
          </button>
        </div>
      </div>
      <div className="p-6 overflow-y-auto flex-1">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-4">{email.subject}</h1>
          <div className="flex items-start mb-4">
            <div className="bg-gray-200 dark:bg-gray-700 rounded-full p-3 text-gray-600 dark:text-gray-400 mr-3">
              <FiUser />
            </div>
            <div>
              <p className="font-medium">{email.from.name || 'Unknown'} <span className="text-gray-500 dark:text-gray-400 font-normal">&lt;{email.from.email}&gt;</span></p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                To: {email.to.join(', ')}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {format(new Date(email.date), 'MMM d, yyyy h:mm a')}
              </p>
            </div>
          </div>
        </div>
        
        {/* Email content */}
        <div 
          ref={emailContentRef}
          className="prose max-w-none"
        >
          {!email.body && (
            <div className="py-8 text-center text-gray-500 dark:text-gray-400">
              <p>No content available</p>
            </div>
          )}
        </div>
        
        {/* Attachments (if any) */}
        {email.hasAttachments && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 flex items-center">
              <FiPaperclip className="mr-2" />
              Attachments
            </h3>
            <div className="text-gray-400 dark:text-gray-500 italic text-sm">
              Attachment viewing is not yet implemented
            </div>
          </div>
        )}
      </div>
    </div>
  );
}