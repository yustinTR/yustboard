'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiHome, FiCalendar, FiDollarSign, FiCloud, FiUsers, FiMail, FiMessageSquare, FiSettings, FiGlobe, FiX, FiFileText, FiShield, FiLayout, FiBell, FiLogOut, FiUser, FiSearch } from 'react-icons/fi';
import { useSession, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface MenuItem {
  id: string;
  label: string;
  path: string;
  icon: string;
  enabled: boolean;
  position: number;
}

const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
  'Home': FiHome,
  'MessageSquare': FiMessageSquare,
  'Mail': FiMail,
  'Calendar': FiCalendar,
  'DollarSign': FiDollarSign,
  'Cloud': FiCloud,
  'Users': FiUsers,
  'Settings': FiSettings,
  'Globe': FiGlobe,
  'FileText': FiFileText,
  'Shield': FiShield,
  'Layout': FiLayout
};

const defaultNavItems = [
  { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: 'Home', enabled: true, position: 0 },
  { id: 'timeline', label: 'Timeline', path: '/dashboard/timeline', icon: 'MessageSquare', enabled: true, position: 1 },
  { id: 'mail', label: 'Mail', path: '/dashboard/mail', icon: 'Mail', enabled: true, position: 2 },
  { id: 'agenda', label: 'Agenda', path: '/dashboard/agenda', icon: 'Calendar', enabled: true, position: 3 },
  { id: 'banking', label: 'Banking', path: '/dashboard/banking', icon: 'DollarSign', enabled: true, position: 4 },
  { id: 'blog', label: 'Blog', path: '/dashboard/blog', icon: 'FileText', enabled: true, position: 5 },
  { id: 'news', label: 'Nieuws', path: '/dashboard/news', icon: 'Globe', enabled: true, position: 6 },
  { id: 'social', label: 'Social', path: '/dashboard/social', icon: 'Users', enabled: true, position: 7 },
  { id: 'weather', label: 'Weather', path: '/dashboard/weather', icon: 'Cloud', enabled: true, position: 8 },
];

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [menuItems, setMenuItems] = useState<MenuItem[]>(defaultNavItems);
  const [imageError, setImageError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  
  const isAdmin = session?.user?.role === 'ADMIN';
  const isAuthor = session?.user?.role === 'AUTHOR';

  useEffect(() => {
    fetchMenuSettings();
  }, []);

  // Search functionality
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const searchTimer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
        if (response.ok) {
          const data = await response.json();
          setSearchResults(data.results);
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(searchTimer);
  }, [searchQuery]);

  const fetchMenuSettings = async () => {
    try {
      const response = await fetch('/api/settings/menu/public');
      if (response.ok) {
        const data = await response.json();
        // Filter out settings from the mobile menu
        const filteredItems = data.menuItems.filter((item: MenuItem) => item.id !== 'settings');
        setMenuItems(filteredItems);
      }
    } catch (error) {
      console.error('Error fetching menu settings:', error);
    }
  };

  const enabledItems = menuItems.filter(item => item.enabled).sort((a, b) => a.position - b.position);

  const handleSearchResultClick = (result: any) => {
    onClose();
    setSearchQuery('');
    setSearchResults([]);

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

  const getSearchIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <FiMail className="h-4 w-4" />;
      case 'calendar':
        return <FiCalendar className="h-4 w-4" />;
      case 'blog':
        return <FiFileText className="h-4 w-4" />;
      case 'file':
        return <FiCloud className="h-4 w-4" />;
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-full max-w-sm bg-white dark:bg-card z-50 lg:hidden transform transition-transform duration-300 animate-in slide-in-from-left">
        <div className="flex flex-col h-full">
          {/* Header with user info */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-medium text-foreground">YustBoard</h1>
              <button
                onClick={onClose}
                className="p-2 rounded-md hover:bg-secondary transition-colors"
                aria-label="Close menu"
              >
                <FiX className="h-6 w-6 text-secondary-foreground" />
              </button>
            </div>
            
            {/* User Profile */}
            <div className="flex items-center gap-4">
              {session?.user?.image && !imageError ? (
                <div className="relative h-12 w-12">
                  <Image
                    src={session.user.image}
                    alt={session.user.name || 'User'}
                    width={48}
                    height={48}
                    className="rounded-full object-cover"
                    onError={() => setImageError(true)}
                  />
                </div>
              ) : (
                <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground text-lg font-medium">
                    {session?.user?.name?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
              )}
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{session?.user?.name}</p>
                <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="p-4 border-b border-border">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-muted-foreground" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search emails, calendar, blog..."
                className="w-full pl-10 pr-4 py-2 bg-secondary/50 hover:bg-secondary/70 focus:bg-secondary rounded-lg outline-none text-foreground placeholder:text-muted-foreground transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              />
            </div>
            
            {/* Search Results */}
            {searchQuery.length >= 2 && (
              <div className="mt-2 bg-background rounded-lg border border-border max-h-64 overflow-y-auto">
                {searchLoading ? (
                  <div className="p-4 text-center text-muted-foreground">
                    <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="py-1">
                    {searchResults.map((result, index) => (
                      <button
                        key={`${result.type}-${result.id}`}
                        onClick={() => handleSearchResultClick(result)}
                        className="w-full px-3 py-2 flex items-start gap-3 hover:bg-secondary transition-colors text-left"
                      >
                        <div className="mt-0.5 text-muted-foreground">
                          {getSearchIcon(result.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {result.title}
                          </p>
                          {result.subtitle && (
                            <p className="text-xs text-muted-foreground truncate">
                              {result.subtitle}
                            </p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No results found
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              {enabledItems.map((item) => {
                const isActive = pathname === item.path || (item.path !== '/dashboard' && pathname.startsWith(`${item.path}/`));
                const Icon = iconMap[item.icon] || FiHome;
                return (
                  <li key={item.id}>
                    <Link
                      href={item.path}
                      onClick={onClose}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        isActive 
                          ? 'bg-accent text-accent-foreground font-medium' 
                          : 'text-secondary-foreground hover:bg-secondary'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
              
              {/* Settings */}
              <li>
                <Link
                  href="/dashboard/settings"
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    pathname === '/dashboard/settings'
                      ? 'bg-accent text-accent-foreground font-medium' 
                      : 'text-secondary-foreground hover:bg-secondary'
                  }`}
                >
                  <FiSettings className="h-5 w-5" />
                  <span>Instellingen</span>
                </Link>
              </li>

              {/* Admin section */}
              {(isAuthor || isAdmin) && (
                <>
                  <li className="mt-6 mb-2">
                    <div className="px-4 text-xs font-semibold text-secondary-foreground/60 uppercase tracking-wider">
                      Admin
                    </div>
                  </li>
                  
                  {(isAuthor || isAdmin) && (
                    <li>
                      <Link
                        href="/dashboard/blog"
                        onClick={onClose}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                          pathname === '/dashboard/blog'
                            ? 'bg-accent text-accent-foreground font-medium' 
                            : 'text-secondary-foreground hover:bg-secondary'
                        }`}
                      >
                        <FiFileText className="h-5 w-5" />
                        <span>Blog Management</span>
                      </Link>
                    </li>
                  )}
                  
                  {isAdmin && (
                    <>
                      <li>
                        <Link
                          href="/dashboard/admin"
                          onClick={onClose}
                          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                            pathname === '/dashboard/admin'
                              ? 'bg-accent text-accent-foreground font-medium' 
                              : 'text-secondary-foreground hover:bg-secondary'
                          }`}
                        >
                          <FiShield className="h-5 w-5" />
                          <span>Admin Panel</span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/dashboard/admin/landing"
                          onClick={onClose}
                          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                            pathname === '/dashboard/admin/landing'
                              ? 'bg-accent text-accent-foreground font-medium' 
                              : 'text-secondary-foreground hover:bg-secondary'
                          }`}
                        >
                          <FiLayout className="h-5 w-5" />
                          <span>Landing Page</span>
                        </Link>
                      </li>
                    </>
                  )}
                </>
              )}
            </ul>
          </nav>

          {/* Bottom actions */}
          <div className="p-4 border-t border-border">
            <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-secondary-foreground hover:bg-secondary transition-all w-full">
              <FiBell className="h-5 w-5" />
              <span>Notificaties</span>
            </button>
            <button
              onClick={() => {
                onClose();
                signOut();
              }}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-secondary-foreground hover:bg-secondary transition-all w-full"
            >
              <FiLogOut className="h-5 w-5" />
              <span>Uitloggen</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}