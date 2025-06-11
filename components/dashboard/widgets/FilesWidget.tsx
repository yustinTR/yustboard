'use client';

import React, { useState, useEffect } from 'react';
import { FiFile, FiRefreshCw, FiExternalLink, FiClock } from 'react-icons/fi';
import { useSession } from 'next-auth/react';
import { DriveFile } from '@/utils/google-drive';

interface FilesWidgetProps {
  initialFiles?: DriveFile[];
  maxFiles?: number;
}

const FilesWidget = React.memo(function FilesWidget({ initialFiles = [], maxFiles = 5 }: FilesWidgetProps) {
  const { data: session } = useSession();
  const [files, setFiles] = useState<DriveFile[]>(initialFiles);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Format the file's modified date
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      // Today: show time
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  // Get file type icon or color based on MIME type
  const getFileTypeColor = (mimeType: string): string => {
    if (mimeType.includes('spreadsheet')) return 'bg-green-100 text-green-600';
    if (mimeType.includes('document')) return 'bg-blue-100 text-blue-600';
    if (mimeType.includes('presentation')) return 'bg-yellow-100 text-yellow-600';
    if (mimeType.includes('pdf')) return 'bg-red-100 text-red-600';
    if (mimeType.includes('image')) return 'bg-purple-100 text-purple-600';
    return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
  };

  // Get a simplified file type name from MIME type
  const getFileTypeName = (mimeType: string): string => {
    if (mimeType.includes('spreadsheet')) return 'Sheet';
    if (mimeType.includes('document')) return 'Doc';
    if (mimeType.includes('presentation')) return 'Slides';
    if (mimeType.includes('pdf')) return 'PDF';
    if (mimeType.includes('image')) return 'Image';
    
    // Extract the subtype from mime type (e.g., 'text/plain' -> 'plain')
    const parts = mimeType.split('/');
    if (parts.length > 1) {
      return parts[1].charAt(0).toUpperCase() + parts[1].slice(1);
    }
    return 'File';
  };

  const fetchFiles = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Use the API route to fetch files
      const response = await fetch(`/api/drive?max=${maxFiles}`);
      const data = await response.json();
      
      if (!response.ok) {
        // Handle authentication errors specifically
        if (response.status === 401) {
          setError('Google Drive authentication failed. Please sign out and sign in again.');
          return;
        }
        throw new Error(data.error || `Failed to fetch files: ${response.statusText}`);
      }
      
      setFiles(data.files || []);
    } catch (error) {
      console.error('Error fetching recent files:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch files');
      
      // Fallback to mock data for development/testing
      if (process.env.NODE_ENV === 'development') {
        const mockFiles: DriveFile[] = [
          {
            id: 'file1',
            name: 'Project Proposal',
            mimeType: 'application/vnd.google-apps.document',
            createdTime: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
            modifiedTime: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
            webViewLink: 'https://docs.google.com',
            iconLink: 'https://drive-thirdparty.googleusercontent.com/16/type/application/vnd.google-apps.document',
            owners: [{ displayName: 'John Doe', emailAddress: 'john@example.com' }],
            shared: true,
            size: '25.5 KB'
          },
          {
            id: 'file2',
            name: 'Budget 2025',
            mimeType: 'application/vnd.google-apps.spreadsheet',
            createdTime: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
            modifiedTime: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            webViewLink: 'https://sheets.google.com',
            iconLink: 'https://drive-thirdparty.googleusercontent.com/16/type/application/vnd.google-apps.spreadsheet',
            owners: [{ displayName: 'Jane Smith', emailAddress: 'jane@example.com' }],
            shared: true,
            size: '102 KB'
          },
          {
            id: 'file3',
            name: 'Team Meeting Notes',
            mimeType: 'application/vnd.google-apps.document',
            createdTime: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            modifiedTime: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
            webViewLink: 'https://docs.google.com',
            iconLink: 'https://drive-thirdparty.googleusercontent.com/16/type/application/vnd.google-apps.document',
            owners: [{ displayName: 'John Doe', emailAddress: 'john@example.com' }],
            shared: false,
            size: '15 KB'
          }
        ];
        setFiles(mockFiles);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session?.accessToken && files.length === 0) {
      fetchFiles();
    }
  }, [session, files.length, maxFiles]);

  return (
    <div className="backdrop-blur-md bg-white/10 dark:bg-gray-900/10 border border-white/20 dark:border-gray-700/30 rounded-xl shadow-xl shadow-black/10 overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-blue-500/80 to-blue-600/80 backdrop-blur-sm text-white flex justify-between items-center">
        <h3 className="font-medium">Recent Files</h3>
        <button 
          onClick={fetchFiles} 
          disabled={isLoading}
          className="text-white hover:text-gray-200 dark:hover:text-gray-300 disabled:opacity-50 cursor-pointer"
          aria-label="Refresh files"
        >
          <FiRefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>
      
      <div className="p-4 bg-white/5 backdrop-blur-sm">
        {error ? (
          <div className="py-4">
            <p className="text-red-600 text-sm text-center mb-2">{error}</p>
            <button
              onClick={fetchFiles}
              className="w-full text-blue-500 hover:text-blue-600 text-sm underline cursor-pointer"
            >
              Try again
            </button>
          </div>
        ) : isLoading ? (
          <div className="py-8 flex justify-center">
            <FiRefreshCw className="animate-spin text-blue-500" />
          </div>
        ) : files.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">No recent files</p>
        ) : (
          <ul className="divide-y divide-white/10 dark:divide-gray-700/30">
            {files.map((file) => (
              <li key={file.id} className="py-3">
                <div className="flex items-start">
                  <div className={`rounded p-2 mr-3 ${getFileTypeColor(file.mimeType)}`}>
                    <FiFile className="w-5 h-5" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center justify-between">
                      <a 
                        href={file.webViewLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="font-medium text-gray-800 dark:text-gray-200 hover:text-blue-600 truncate max-w-[200px]"
                      >
                        {file.name}
                      </a>
                      <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full px-2 py-1 ml-2">
                        {getFileTypeName(file.mimeType)}
                      </span>
                    </div>
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <FiClock className="mr-1" />
                      <span>{formatDate(file.modifiedTime)}</span>
                      {file.shared && (
                        <span className="ml-2 bg-blue-100 text-blue-600 rounded-full px-2 py-0.5 text-xs">
                          Shared
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      <div className="p-3 bg-white/5 dark:bg-gray-800/20 backdrop-blur-sm border-t border-white/10 dark:border-gray-700/30 text-center">
        <a 
          href="https://drive.google.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-400 text-sm font-medium flex items-center justify-center hover:bg-white/10 dark:hover:bg-gray-800/20 px-3 py-1 rounded-lg transition-all duration-200"
        >
          View in Google Drive
          <FiExternalLink className="ml-1" />
        </a>
      </div>
    </div>
  );
});

export default FilesWidget;