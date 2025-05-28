'use client';

import { useSession, signOut } from 'next-auth/react';
import { FiBell, FiMenu, FiUser, FiLogOut, FiFileText, FiChevronDown, FiSettings } from 'react-icons/fi';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const isAdmin = session?.user?.role === 'ADMIN';
  const isAuthor = session?.user?.role === 'AUTHOR';

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Get page title based on current path
  const getPageTitle = () => {
    if (pathname === '/dashboard') return 'Dashboard';
    if (pathname.includes('/timeline')) return 'Timeline';
    if (pathname.includes('/mail')) return 'Mail';
    if (pathname.includes('/agenda')) return 'Agenda';
    if (pathname.includes('/banking')) return 'Banking';
    if (pathname.includes('/blog')) return 'Blog';
    if (pathname.includes('/social')) return 'Social';
    if (pathname.includes('/weather')) return 'Weather';
    if (pathname.includes('/settings')) return 'Instellingen';
    if (pathname.includes('/admin/blog')) return 'Blog Management';
    if (pathname.includes('/admin')) return 'Admin';
    return 'Dashboard';
  };

  return (
    <header className="bg-white dark:bg-card h-16 flex items-center justify-between px-4 lg:px-6 border-b border-border shadow-1">
      <div className="flex items-center gap-4">
        {/* Hamburger menu button - visible only on mobile */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-md hover:bg-secondary transition-colors"
          aria-label="Open menu"
        >
          <FiMenu className="h-5 w-5 text-secondary-foreground" />
        </button>
        <h2 className="text-xl font-normal text-foreground">{getPageTitle()}</h2>
      </div>
      <div className="flex items-center gap-2">
        <button className="relative w-10 h-10 rounded-full flex items-center justify-center hover:bg-secondary transition-colors hover-overlay">
          <FiBell className="h-5 w-5 text-secondary-foreground" />
        </button>
        <Link 
          href="/dashboard/settings" 
          className="relative w-10 h-10 rounded-full flex items-center justify-center hover:bg-secondary transition-colors hover-overlay"
        >
          <FiSettings className="h-5 w-5 text-secondary-foreground" />
        </Link>
        {/* Profile Dropdown */}
        <div className="relative ml-2" ref={dropdownRef}>
          <button
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            {session?.user?.image ? (
              <img
                src={session.user.image}
                alt={session.user.name || 'User'}
                className="h-8 w-8 rounded-full"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground text-sm font-medium">
                  {session?.user?.name?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
            )}
            <FiChevronDown className={`h-4 w-4 text-secondary-foreground transition-transform ${showProfileDropdown ? 'rotate-180' : ''}`} />
          </button>
          
          {showProfileDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-card border border-border rounded-lg shadow-lg py-2 z-50">
              {/* User Info */}
              <div className="px-4 py-3 border-b border-border">
                <p className="text-sm font-medium text-foreground">{session?.user?.name}</p>
                <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
              </div>
              
              {/* Admin Links */}
              {(isAuthor || isAdmin) && (
                <Link
                  href="/dashboard/blog"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
                  onClick={() => setShowProfileDropdown(false)}
                >
                  <FiFileText className="h-4 w-4" />
                  Blog Management
                </Link>
              )}
              
              {isAdmin && (
                <Link
                  href="/dashboard/admin"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
                  onClick={() => setShowProfileDropdown(false)}
                >
                  <FiUser className="h-4 w-4" />
                  Admin Panel
                </Link>
              )}
              
              {/* Logout */}
              <div className="border-t border-border mt-2 pt-2">
                <button
                  onClick={() => {
                    setShowProfileDropdown(false);
                    signOut();
                  }}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors w-full text-left"
                >
                  <FiLogOut className="h-4 w-4" />
                  Uitloggen
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}