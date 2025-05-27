'use client';

import { useSession } from 'next-auth/react';
import { FiBell, FiSettings } from 'react-icons/fi';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();
  
  // Get page title based on current path
  const getPageTitle = () => {
    if (pathname === '/dashboard') return 'Dashboard';
    if (pathname.includes('/timeline')) return 'Timeline';
    if (pathname.includes('/mail')) return 'Mail';
    if (pathname.includes('/agenda')) return 'Agenda';
    if (pathname.includes('/banking')) return 'Banking';
    if (pathname.includes('/social')) return 'Social';
    if (pathname.includes('/weather')) return 'Weather';
    if (pathname.includes('/settings')) return 'Instellingen';
    if (pathname.includes('/admin')) return 'Admin';
    return 'Dashboard';
  };

  return (
    <header className="bg-white dark:bg-card h-16 flex items-center justify-between px-6 border-b border-border shadow-1">
      <div>
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
        <div className="ml-2">
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
        </div>
      </div>
    </header>
  );
}