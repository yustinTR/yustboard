'use client';

import { useSession, signOut } from 'next-auth/react';
import { FiMenu, FiUser, FiLogOut, FiFileText, FiChevronDown, FiSettings } from 'react-icons/fi';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import UniversalSearch from './UniversalSearch';
import MobileSidebar from './MobileSidebar';
import OrganizationSwitcher from '@/components/molecules/OrganizationSwitcher';
import NotificationBell from '@/components/molecules/NotificationBell';
import { useBranding } from '@/contexts/BrandingContext';

export default function Header() {
  const { data: session } = useSession();
  const { branding } = useBranding();
  const pathname = usePathname();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [buttonRect, setButtonRect] = useState<DOMRect | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  const isAdmin = session?.user?.role === 'ADMIN';
  const isAuthor = session?.user?.role === 'AUTHOR';

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Check if clicking outside both button and dropdown
      const target = event.target as Node;
      const isButtonClick = buttonRef.current?.contains(target);
      const isDropdownClick = showProfileDropdown && event.target &&
        (event.target as Element).closest('[data-profile-dropdown]');

      if (!isButtonClick && !isDropdownClick) {
        setShowProfileDropdown(false);
      }
    }

    if (showProfileDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showProfileDropdown]);
  
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
    <header className="backdrop-blur-md bg-white/80 dark:bg-gray-900/80 h-16 flex items-center justify-between px-4 lg:px-6 border-b border-white/20 dark:border-gray-700/30 shadow-xl shadow-black/5">
      {/* Left section */}
      <div className="flex items-center gap-4 flex-1">
        {/* Hamburger menu button - visible only on mobile */}
        <button
          onClick={() => setShowMobileSidebar(true)}
          className="lg:hidden p-2 rounded-lg hover:bg-white/20 dark:hover:bg-gray-800/20 transition-colors backdrop-blur-sm"
          aria-label="Open menu"
        >
          <FiMenu className="h-5 w-5 text-gray-700 dark:text-gray-300" />
        </button>

        {/* Organization Logo - shown when branding is enabled */}
        {branding.brandingEnabled && branding.logoUrl && (
          <div className="hidden lg:block relative w-10 h-10 rounded-lg overflow-hidden bg-white dark:bg-gray-800 p-1">
            <Image
              src={branding.logoUrl}
              alt="Organization logo"
              width={40}
              height={40}
              className="w-full h-full object-contain"
            />
          </div>
        )}

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
        {/* Organization Switcher */}
        <OrganizationSwitcher />

        {/* Notification Bell */}
        <NotificationBell />

        {/* Settings */}
        <Link
          href="/dashboard/settings"
          className="hidden lg:flex relative w-10 h-10 rounded-full items-center justify-center hover:bg-white/20 dark:hover:bg-gray-800/20 transition-colors backdrop-blur-sm"
        >
          <FiSettings className="h-5 w-5 text-gray-700 dark:text-gray-300" />
        </Link>
        {/* Profile Dropdown - hide on mobile */}
        <div className="relative ml-2 hidden lg:block" ref={dropdownRef}>
          <button
            ref={buttonRef}
            onClick={() => {
              setShowProfileDropdown(!showProfileDropdown);
              if (buttonRef.current) {
                setButtonRect(buttonRef.current.getBoundingClientRect());
              }
            }}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/20 dark:hover:bg-gray-800/20 transition-colors backdrop-blur-sm"
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
            <FiChevronDown className={`h-4 w-4 text-gray-700 dark:text-gray-300 transition-transform ${showProfileDropdown ? 'rotate-180' : ''}`} />
          </button>

          {/* Profile dropdown content will be rendered via portal */}
        </div>
      </div>

      {/* Profile Dropdown - render via portal for better z-index control */}
      {mounted && showProfileDropdown && buttonRect && createPortal(
        <div
          data-profile-dropdown
          className="fixed backdrop-blur-md bg-white/90 dark:bg-gray-900/90 border border-white/20 dark:border-gray-700/30 rounded-xl shadow-xl shadow-black/10 py-2 z-[10000]"
          style={{
            top: buttonRect.bottom + 8,
            right: window.innerWidth - buttonRect.right,
            width: '224px'
          }}
        >
              {/* User Info */}
              <div className="px-4 py-3 border-b border-white/10 dark:border-gray-700/30">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{session?.user?.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{session?.user?.email}</p>
              </div>

              {/* Profile Link */}
              <Link
                href="/dashboard/profile"
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-white/20 dark:hover:bg-gray-800/20 transition-colors"
                onClick={() => setShowProfileDropdown(false)}
              >
                <FiUser className="h-4 w-4" />
                Mijn Profiel
              </Link>

              {/* Admin Links */}
              {(isAuthor || isAdmin) && (
                <Link
                  href="/dashboard/blog"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-white/20 dark:hover:bg-gray-800/20 transition-colors"
                  onClick={() => setShowProfileDropdown(false)}
                >
                  <FiFileText className="h-4 w-4" />
                  Blog Management
                </Link>
              )}
              
              {isAdmin && (
                <Link
                  href="/dashboard/admin"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-white/20 dark:hover:bg-gray-800/20 transition-colors"
                  onClick={() => setShowProfileDropdown(false)}
                >
                  <FiUser className="h-4 w-4" />
                  Admin Panel
                </Link>
              )}
              
              {/* Logout */}
              <div className="border-t border-white/10 dark:border-gray-700/30 mt-2 pt-2">
                <button
                  onClick={() => {
                    setShowProfileDropdown(false);
                    signOut();
                  }}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-white/20 dark:hover:bg-gray-800/20 transition-colors w-full text-left"
                >
                  <FiLogOut className="h-4 w-4" />
                  Uitloggen
                </button>
              </div>
            </div>,
        document.body
      )}
      
      {/* Mobile Sidebar */}
      <MobileSidebar 
        isOpen={showMobileSidebar} 
        onClose={() => setShowMobileSidebar(false)} 
      />
    </header>
  );
}