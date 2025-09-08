'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiHome, FiCalendar, FiDollarSign, FiCloud, FiUsers, FiMail, FiMessageSquare, FiSettings, FiGlobe, FiX, FiFileText, FiChevronLeft, FiChevronRight, FiShield, FiLayout } from 'react-icons/fi';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useSidebar } from '@/contexts/SidebarContext';

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
  { id: 'settings', label: 'Instellingen', path: '/dashboard/settings', icon: 'Settings', enabled: true, position: 9 }
];

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { isCollapsed, toggleSidebar } = useSidebar();
  const [menuItems, setMenuItems] = useState<MenuItem[]>(defaultNavItems);
  // const [loading, setLoading] = useState(true); // Currently not used
  const isAdmin = session?.user?.role === 'ADMIN';
  const canManageContent = session?.user?.role === 'ADMIN' || session?.user?.role === 'AUTHOR';

  useEffect(() => {
    fetchMenuSettings();
  }, []);

  const fetchMenuSettings = async () => {
    try {
      const response = await fetch('/api/settings/menu/public');
      if (response.ok) {
        const data = await response.json();
        setMenuItems(data.menuItems);
      }
    } catch (error) {
      console.error('Error fetching menu settings:', error);
    } finally {
      // setLoading(false); // Currently not used
    }
  };

  const enabledItems = menuItems.filter(item => item.enabled).sort((a, b) => a.position - b.position);

  return (
    <div className={`backdrop-blur-md bg-white/80 dark:bg-gray-900/80 h-screen ${isCollapsed ? 'w-16' : 'w-72'} flex flex-col border-r border-white/20 dark:border-gray-700/30 transition-all duration-300`}>
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/20 dark:border-gray-700/30">
        {!isCollapsed && (
          <h1 className="text-xl font-medium text-foreground">YustBoard</h1>
        )}
        <div className="flex items-center gap-2">
          {/* Collapse/Expand button - hidden on mobile */}
          <button
            onClick={toggleSidebar}
            className="hidden lg:block p-2 rounded-md hover:bg-white/10 dark:hover:bg-gray-800/10 hover:backdrop-blur-sm transition-all duration-200"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <FiChevronRight className="h-4 w-4 text-secondary-foreground" />
            ) : (
              <FiChevronLeft className="h-4 w-4 text-secondary-foreground" />
            )}
          </button>
          {/* Close button - visible only on mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-md hover:bg-white/10 dark:hover:bg-gray-800/10 hover:backdrop-blur-sm transition-all duration-200"
            aria-label="Close menu"
          >
            <FiX className="h-5 w-5 text-secondary-foreground" />
          </button>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto py-2">
        <ul className={isCollapsed ? "px-1" : "px-3"}>
          {enabledItems.map((item) => {
            const isActive = pathname === item.path || (item.path !== '/dashboard' && pathname.startsWith(`${item.path}/`));
            const Icon = iconMap[item.icon] || FiHome;
            return (
              <li key={item.id} className="mb-1">
                <Link
                  href={item.path}
                  onClick={onClose}
                  className={`relative flex items-center h-12 ${
                    isCollapsed ? 'px-3 justify-center' : 'px-3'
                  } rounded-full transition-all duration-200 ${
                    isActive 
                      ? 'bg-white/20 dark:bg-gray-800/20 text-primary backdrop-blur-sm border border-white/10 dark:border-gray-700/20 font-medium shadow-lg shadow-black/5' 
                      : 'text-secondary-foreground hover:bg-white/10 dark:hover:bg-gray-800/10 hover:backdrop-blur-sm'
                  }`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon className={`h-5 w-5 ${!isCollapsed ? 'mr-3' : ''}`} />
                  {!isCollapsed && (
                    <span className="text-sm">{item.label}</span>
                  )}
                  {isActive && !isCollapsed && (
                    <div className="absolute inset-y-0 left-0 w-1 bg-primary rounded-r-full" />
                  )}
                  {isActive && isCollapsed && (
                    <div className="absolute inset-y-0 right-0 w-1 bg-primary rounded-l-full" />
                  )}
                </Link>
              </li>
            );
          })}
          
          {/* Admin/Content Management section */}
          {(isAdmin || canManageContent) && (
            <>
              <li className="mb-1 mt-4">
                {!isCollapsed && (
                  <div className="px-3 py-2 text-xs font-semibold text-secondary-foreground/60 uppercase tracking-wider">
                    {isAdmin ? 'Admin' : 'Beheer'}
                  </div>
                )}
                {isCollapsed && <hr className="my-2 border-border" />}
              </li>
              {/* Landing page is admin-only */}
              {isAdmin && (
                <li className="mb-1">
                  <Link
                    href="/dashboard/admin/landing"
                    onClick={onClose}
                    className={`relative flex items-center h-12 ${
                      isCollapsed ? 'px-3 justify-center' : 'px-3'
                    } rounded-full transition-all duration-200 ${
                      pathname === '/dashboard/admin/landing'
                        ? 'bg-white/20 dark:bg-gray-800/20 text-primary backdrop-blur-sm border border-white/10 dark:border-gray-700/20 font-medium shadow-lg shadow-black/5' 
                        : 'text-secondary-foreground hover:bg-white/10 dark:hover:bg-gray-800/10 hover:backdrop-blur-sm'
                    }`}
                    title={isCollapsed ? "Landing Page" : undefined}
                  >
                    <FiLayout className={`h-5 w-5 ${!isCollapsed ? 'mr-3' : ''}`} />
                    {!isCollapsed && (
                      <span className="text-sm">Landing Page</span>
                    )}
                    {pathname === '/dashboard/admin/landing' && !isCollapsed && (
                      <div className="absolute inset-y-0 left-0 w-1 bg-primary rounded-r-full" />
                    )}
                    {pathname === '/dashboard/admin/landing' && isCollapsed && (
                      <div className="absolute inset-y-0 right-0 w-1 bg-primary rounded-l-full" />
                    )}
                  </Link>
                </li>
              )}
              {/* Blog management for both admin and authors */}
              {canManageContent && (
                <li className="mb-1">
                  <Link
                    href="/dashboard/admin/blog"
                    onClick={onClose}
                    className={`relative flex items-center h-12 ${
                      isCollapsed ? 'px-3 justify-center' : 'px-3'
                    } rounded-full transition-all duration-200 ${
                      pathname.startsWith('/dashboard/admin/blog')
                        ? 'bg-white/20 dark:bg-gray-800/20 text-primary backdrop-blur-sm border border-white/10 dark:border-gray-700/20 font-medium shadow-lg shadow-black/5' 
                        : 'text-secondary-foreground hover:bg-white/10 dark:hover:bg-gray-800/10 hover:backdrop-blur-sm'
                    }`}
                    title={isCollapsed ? "Blog Management" : undefined}
                  >
                    <FiFileText className={`h-5 w-5 ${!isCollapsed ? 'mr-3' : ''}`} />
                    {!isCollapsed && (
                      <span className="text-sm">Blog Management</span>
                    )}
                    {pathname.startsWith('/dashboard/admin/blog') && !isCollapsed && (
                      <div className="absolute inset-y-0 left-0 w-1 bg-primary rounded-r-full" />
                    )}
                    {pathname.startsWith('/dashboard/admin/blog') && isCollapsed && (
                      <div className="absolute inset-y-0 right-0 w-1 bg-primary rounded-l-full" />
                    )}
                  </Link>
                </li>
              )}
            </>
          )}
        </ul>
      </nav>
    </div>
  );
}