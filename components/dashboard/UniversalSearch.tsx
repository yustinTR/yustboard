'use client';

import { useState, useEffect, useRef } from 'react';
import { FiSearch, FiMail, FiCalendar, FiFileText, FiFolder, FiX } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface SearchResult {
  id: string;
  type: 'email' | 'calendar' | 'blog' | 'file';
  title: string;
  subtitle?: string;
  date?: Date;
  url?: string;
}

export default function UniversalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { data: session } = useSession();

  // Close search when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setQuery('');
        setResults([]);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      // Cmd/Ctrl + K to focus search
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        inputRef.current?.focus();
      }

      // Escape to close and blur
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setQuery('');
        setResults([]);
        inputRef.current?.blur();
      }

      // Arrow keys for navigation
      if (isOpen && results.length > 0) {
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % results.length);
        } else if (event.key === 'ArrowUp') {
          event.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
        } else if (event.key === 'Enter') {
          event.preventDefault();
          handleResultClick(results[selectedIndex]);
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex]);

  // Debounced search
  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    const searchTimer = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (response.ok) {
          const data = await response.json();
          setResults(data.results);
          setSelectedIndex(0);
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(searchTimer);
  }, [query]);

  const handleResultClick = (result: SearchResult) => {
    setIsOpen(false);
    setQuery('');
    setResults([]);

    // Navigate based on result type
    switch (result.type) {
      case 'email':
        router.push(`/dashboard/mail?id=${result.id}`);
        break;
      case 'calendar':
        router.push(`/dashboard/agenda?event=${result.id}`);
        break;
      case 'blog':
        router.push(result.url || `/blog/${result.id}`);
        break;
      case 'file':
        if (result.url) {
          window.open(result.url, '_blank');
        }
        break;
    }
  };

  const getIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'email':
        return <FiMail className="h-4 w-4" />;
      case 'calendar':
        return <FiCalendar className="h-4 w-4" />;
      case 'blog':
        return <FiFileText className="h-4 w-4" />;
      case 'file':
        return <FiFolder className="h-4 w-4" />;
    }
  };

  if (!session) return null;

  return (
    <div ref={searchRef} className="relative w-full max-w-xl">
      {/* Search input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FiSearch className="h-5 w-5 text-muted-foreground" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder="Search emails, calendar, blog posts, files..."
          className="w-full pl-10 pr-10 py-2 bg-secondary/50 hover:bg-secondary/70 focus:bg-secondary rounded-lg outline-none text-foreground placeholder:text-muted-foreground transition-all duration-200 focus:ring-2 focus:ring-primary/20"
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          {query ? (
            <button
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="p-1 hover:bg-background/50 rounded transition-colors"
            >
              <FiX className="h-4 w-4 text-muted-foreground" />
            </button>
          ) : (
            <kbd className="hidden md:inline-flex items-center gap-1 px-2 py-1 rounded bg-background/50 text-xs text-muted-foreground">
              <span className="text-xs">⌘</span>K
            </kbd>
          )}
        </div>
      </div>

      {/* Search modal */}
      {isOpen && (query.length >= 2 || loading) && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[600px] max-w-[90vw] bg-white dark:bg-card border border-border rounded-lg shadow-xl z-50 animate-in fade-in-0 zoom-in-95 duration-200">

          {/* Results */}
          <div className="max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : results.length > 0 ? (
              <div className="py-2">
                {results.map((result, index) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleResultClick(result)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full px-4 py-3 flex items-start gap-3 hover:bg-secondary transition-colors text-left ${
                      index === selectedIndex ? 'bg-secondary' : ''
                    }`}
                  >
                    <div className="mt-0.5 text-muted-foreground">
                      {getIcon(result.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {result.title}
                      </p>
                      {result.subtitle && (
                        <p className="text-sm text-muted-foreground truncate">
                          {result.subtitle}
                        </p>
                      )}
                    </div>
                    {result.date && (
                      <span className="text-xs text-muted-foreground">
                        {new Date(result.date).toLocaleDateString()}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            ) : query.length >= 2 && !loading ? (
              <div className="p-8 text-center text-muted-foreground">
                No results found for "{query}"
              </div>
            ) : null}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 rounded bg-secondary">↓↑</kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 rounded bg-secondary">↵</kbd>
                Select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 rounded bg-secondary">esc</kbd>
                Close
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}