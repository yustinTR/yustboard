'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
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
      <div className="backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 overflow-hidden rounded-3xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl shadow-black/20 border border-white/25 dark:border-gray-700/25 animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="relative p-6 border-b border-white/20 dark:border-gray-700/30 bg-gradient-to-r from-purple-500/80 to-violet-500/80 backdrop-blur-sm text-white rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
                <FiFileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">
                  {article.source.name}
                </h2>
                <p className="text-sm text-white/80 flex items-center gap-1">
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
                className={`p-2 rounded-lg transition-all duration-300 hover:scale-105 ${
                  isBookmarked
                    ? 'text-white bg-white/30 backdrop-blur-sm border border-white/40'
                    : 'text-white/80 hover:text-white hover:bg-white/20 backdrop-blur-sm border border-white/20'
                }`}
                title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
              >
                <FiBookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
              </button>

              <button
                onClick={handleShare}
                className="p-2 text-white/80 hover:text-white hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg transition-all duration-300 hover:scale-105"
                title="Share article"
              >
                <FiShare2 className="w-5 h-5" />
              </button>

              <button
                onClick={openOriginal}
                className="p-2 text-white/80 hover:text-white hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg transition-all duration-300 hover:scale-105"
                title="Open original article"
              >
                <FiExternalLink className="w-5 h-5" />
              </button>

              <button
                onClick={onClose}
                className="p-2 text-white/80 hover:text-white hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg transition-all duration-300 hover:scale-105"
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
              <Image
                src={article.urlToImage}
                alt={article.title}
                width={800}
                height={256}
                className="w-full h-full object-cover"
                unoptimized={true}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          )}

          {/* Article content */}
          <div className="flex-1 overflow-auto p-6 bg-white/5 dark:bg-gray-900/5 backdrop-blur-sm">
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
          <div className="p-6 border-t border-white/20 dark:border-gray-700/30 bg-white/10 dark:bg-gray-800/15 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Bron: {article.source.name}
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleShare}
                  className="flex items-center space-x-2 px-4 py-2 bg-white/20 dark:bg-gray-800/20 hover:bg-white/30 dark:hover:bg-gray-700/30 text-gray-700 dark:text-gray-300 rounded-2xl transition-all duration-300 hover:scale-[1.02] backdrop-blur-sm border border-white/30 dark:border-gray-600/30"
                >
                  <FiShare2 className="w-4 h-4" />
                  <span>Delen</span>
                </button>

                <button
                  onClick={openOriginal}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 rounded-2xl transition-all duration-300 hover:scale-[1.02] backdrop-blur-sm border border-purple-400/30"
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