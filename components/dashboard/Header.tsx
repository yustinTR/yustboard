'use client';

import { useSession, signOut } from 'next-auth/react';
import { FiBell, FiMenu, FiUser, FiLogOut, FiFileText, FiChevronDown, FiSettings } from 'react-icons/fi';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import UniversalSearch from './UniversalSearch';
import MobileSidebar from './MobileSidebar';

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [imageError, setImageError] = useState(false);
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
      {/* Left section */}
      <div className="flex items-center gap-4 flex-1">
        {/* Hamburger menu button - visible only on mobile */}
        <button
          onClick={() => setShowMobileSidebar(true)}
          className="lg:hidden p-2 rounded-md hover:bg-secondary transition-colors"
          aria-label="Open menu"
        >
          <FiMenu className="h-5 w-5 text-secondary-foreground" />
        </button>
        <h2 className="text-xl font-normal text-foreground">{getPageTitle()}</h2>
      </div>
      
      {/* Center section - Universal Search - hide on mobile */}
      <div className="hidden lg:flex flex-1 justify-center">
        <UniversalSearch />
      </div>
      
      {/* Empty div for mobile layout balance */}
      <div className="flex-1 lg:hidden"></div>
      
      {/* Right section - only visible on desktop */}
      <div className="hidden lg:flex items-center gap-2 flex-1 justify-end">
        {/* Hide these on mobile - they're in the mobile sidebar */}
        <button className="hidden lg:flex relative w-10 h-10 rounded-full items-center justify-center hover:bg-secondary transition-colors hover-overlay">
          <FiBell className="h-5 w-5 text-secondary-foreground" />
        </button>
        <Link 
          href="/dashboard/settings" 
          className="hidden lg:flex relative w-10 h-10 rounded-full items-center justify-center hover:bg-secondary transition-colors hover-overlay"
        >
          <FiSettings className="h-5 w-5 text-secondary-foreground" />
        </Link>
        {/* Profile Dropdown - hide on mobile */}
        <div className="relative ml-2 hidden lg:block" ref={dropdownRef}>
          <button
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            {session?.user?.image && !imageError ? (
              <div className="relative h-8 w-8">
                <Image
                  src={session.user.image}
                  alt={session.user.name || 'User'}
                  width={32}
                  height={32}
                  className="rounded-full object-cover"
                  onError={() => setImageError(true)}
                />
              </div>
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
      
      {/* Mobile Sidebar */}
      <MobileSidebar 
        isOpen={showMobileSidebar} 
        onClose={() => setShowMobileSidebar(false)} 
      />
    </header>
  );
}