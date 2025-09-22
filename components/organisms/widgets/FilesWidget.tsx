'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { FiFile, FiRefreshCw, FiClock } from 'react-icons/fi';
import { useSession } from 'next-auth/react';
import { DriveFile } from '@/utils/google/google-drive';

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

  const fetchFiles = useCallback(async () => {
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
  }, [maxFiles]);

  useEffect(() => {
    if (session?.accessToken && files.length === 0) {
      fetchFiles();
    }
  }, [session?.accessToken, files.length, fetchFiles]);

  return (
    <div className="h-full backdrop-blur-xl bg-white/15 dark:bg-gray-900/15 border border-white/25 dark:border-gray-700/25 rounded-3xl shadow-2xl shadow-black/20 overflow-hidden flex flex-col">
      {/* Header with blue gradient for files */}
      <div className="px-6 py-4 bg-gradient-to-r from-blue-500/90 to-cyan-500/90 backdrop-blur-sm text-white flex justify-between items-center">
        <h3 className="text-lg font-medium tracking-wide flex items-center gap-2">
          <FiFile className="h-5 w-5" />
          Recent Files
        </h3>
        <button
          onClick={fetchFiles}
          disabled={isLoading}
          className="text-white/90 hover:text-white hover:bg-white/20 p-2 rounded-full transition-all duration-300 disabled:opacity-50 cursor-pointer hover:scale-105"
          aria-label="Refresh files"
        >
          <FiRefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 px-6 py-4 bg-white/5 dark:bg-gray-900/5 backdrop-blur-sm overflow-hidden flex flex-col">
        {error ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="bg-red-500/15 border border-red-400/30 text-red-600 dark:text-red-400 p-4 rounded-2xl backdrop-blur-sm">
                <p className="text-sm font-medium mb-2">{error}</p>
                <button
                  onClick={fetchFiles}
                  className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium py-2 px-4 rounded-xl transition-all duration-300 border border-blue-400/30 backdrop-blur-sm"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        ) : isLoading ? (
          <div className="flex-1 flex justify-center items-center">
            <div className="flex items-center">
              <FiRefreshCw className="animate-spin text-blue-500 h-8 w-8 mr-3" />
              <span className="text-gray-600 dark:text-gray-400 text-sm">Loading files...</span>
            </div>
          </div>
        ) : files.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="bg-blue-500/15 border border-blue-400/30 text-blue-600 dark:text-blue-400 p-6 rounded-2xl backdrop-blur-sm text-center">
              <FiFile className="mx-auto mb-3 h-8 w-8" />
              <p className="font-medium mb-2">No recent files</p>
              <p className="text-sm">Your recent Google Drive files will appear here</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-3">
            {files.map((file) => (
              <div
                key={file.id}
                className="bg-white/20 dark:bg-gray-800/20 rounded-2xl p-4 backdrop-blur-sm border border-white/30 dark:border-gray-600/30 hover:bg-white/30 dark:hover:bg-gray-700/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
              >
                <div className="flex items-start gap-3">
                  <div className={`rounded-xl p-2.5 ${getFileTypeColor(file.mimeType)} border border-white/20`}>
                    <FiFile className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <a
                        href={file.webViewLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-sm text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2 leading-snug"
                      >
                        {file.name}
                      </a>
                      <span className="ml-3 text-xs bg-white/30 dark:bg-gray-700/30 text-gray-700 dark:text-gray-300 rounded-lg px-2 py-1 backdrop-blur-sm border border-white/20 dark:border-gray-600/20 font-medium">
                        {getFileTypeName(file.mimeType)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <FiClock className="h-3 w-3" />
                        <span>{formatDate(file.modifiedTime)}</span>
                      </div>
                      {file.shared && (
                        <span className="bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg px-2 py-1 font-medium border border-blue-400/30 backdrop-blur-sm">
                          Shared
                        </span>
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
          href="https://drive.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center bg-blue-500/20 hover:bg-blue-500/30 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium py-3 px-4 rounded-2xl transition-all duration-300 hover:scale-[1.02] border border-blue-400/30 backdrop-blur-sm"
        >
          View in Google Drive
        </a>
      </div>
    </div>
  );
});

export default FilesWidget;