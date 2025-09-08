'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiX, FiExternalLink, FiCalendar, FiFileText, FiShare2, FiBookmark } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import { nl } from 'date-fns/locale';

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  urlToImage?: string;
  publishedAt: string;
  source: {
    name: string;
  };
  category?: string;
  content?: string;
}

interface NewsModalProps {
  article: NewsArticle | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function NewsModal({ article, isOpen, onClose }: NewsModalProps) {
  const [mounted, setMounted] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    if (isOpen && article) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, article, mounted]);

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // Here you could save to localStorage or send to API
  };

  const handleShare = async () => {
    if (navigator.share && article) {
      try {
        await navigator.share({
          title: article.title,
          text: article.description,
          url: article.url,
        });
      } catch {
        // Fallback to clipboard
        navigator.clipboard.writeText(article.url);
      }
    } else if (article) {
      navigator.clipboard.writeText(article.url);
    }
  };

  const openOriginal = () => {
    if (article) {
      window.open(article.url, '_blank');
    }
  };

  // Don't render anything on server or if not mounted
  if (!mounted || !isOpen || !article) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl border border-gray-200 dark:border-gray-700 animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="relative p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-500/10 to-purple-600/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                <FiFileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {article.source.name}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <FiCalendar className="w-3 h-3" />
                  {formatDistanceToNow(new Date(article.publishedAt), { 
                    addSuffix: true,
                    locale: nl 
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleBookmark}
                className={`p-2 rounded-lg transition-colors ${
                  isBookmarked 
                    ? 'text-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                    : 'text-gray-400 hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                }`}
                title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
              >
                <FiBookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
              </button>
              
              <button
                onClick={handleShare}
                className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                title="Share article"
              >
                <FiShare2 className="w-5 h-5" />
              </button>
              
              <button
                onClick={openOriginal}
                className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                title="Open original article"
              >
                <FiExternalLink className="w-5 h-5" />
              </button>
              
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
          {/* Article image */}
          {article.urlToImage && (
            <div className="relative h-64 overflow-hidden">
              <img
                src={article.urlToImage}
                alt={article.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          )}

          {/* Article content */}
          <div className="flex-1 overflow-auto p-6">
            <div className="space-y-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
                {article.title}
              </h1>
              
              {article.description && (
                <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                  {article.description}
                </p>
              )}

              {article.content && (
                <div className="prose prose-gray dark:prose-invert max-w-none">
                  <p className="text-gray-600 dark:text-gray-400">
                    {article.content}
                  </p>
                </div>
              )}

              {/* Category badge */}
              {article.category && (
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                    {article.category}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Footer actions */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Bron: {article.source.name}
              </div>
              
              <div className="flex items-center space-x-3">
                <button 
                  onClick={handleShare}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                >
                  <FiShare2 className="w-4 h-4" />
                  <span>Delen</span>
                </button>
                
                <button 
                  onClick={openOriginal}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                >
                  <FiExternalLink className="w-4 h-4" />
                  <span>Lees volledig artikel</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Only create portal if we have access to document (client-side)
  if (typeof document === 'undefined') return null;
  
  return createPortal(modalContent, document.body);
}