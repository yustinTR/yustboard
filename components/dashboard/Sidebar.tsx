'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiHome, FiCalendar, FiDollarSign, FiCloud, FiUsers, FiLogOut, FiMail, FiMessageSquare, FiSettings, FiShield, FiGlobe } from 'react-icons/fi';
import { signOut, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

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
  'Shield': FiShield,
  'Globe': FiGlobe
};

const defaultNavItems = [
  { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: 'Home', enabled: true, position: 0 },
  { id: 'timeline', label: 'Timeline', path: '/dashboard/timeline', icon: 'MessageSquare', enabled: true, position: 1 },
  { id: 'mail', label: 'Mail', path: '/dashboard/mail', icon: 'Mail', enabled: true, position: 2 },
  { id: 'agenda', label: 'Agenda', path: '/dashboard/agenda', icon: 'Calendar', enabled: true, position: 3 },
  { id: 'banking', label: 'Banking', path: '/dashboard/banking', icon: 'DollarSign', enabled: true, position: 4 },
  { id: 'news', label: 'Nieuws', path: '/dashboard/news', icon: 'Globe', enabled: true, position: 5 },
  { id: 'social', label: 'Social', path: '/dashboard/social', icon: 'Users', enabled: true, position: 6 },
  { id: 'weather', label: 'Weather', path: '/dashboard/weather', icon: 'Cloud', enabled: true, position: 7 },
  { id: 'settings', label: 'Instellingen', path: '/dashboard/settings', icon: 'Settings', enabled: true, position: 8 }
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [menuItems, setMenuItems] = useState<MenuItem[]>(defaultNavItems);
  // const [loading, setLoading] = useState(true); // Currently not used
  const isAdmin = session?.user?.role === 'ADMIN';

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

  let enabledItems = menuItems.filter(item => item.enabled).sort((a, b) => a.position - b.position);
  
  // Add admin menu item for admin users
  if (isAdmin && !enabledItems.find(item => item.id === 'admin')) {
    enabledItems = [...enabledItems, {
      id: 'admin',
      label: 'Admin',
      path: '/dashboard/admin',
      icon: 'Shield',
      enabled: true,
      position: 100
    }];
  }

  return (
    <div className="bg-white dark:bg-card h-screen w-72 flex flex-col border-r border-border">
      <div className="h-16 flex items-center px-6 border-b border-border">
        <h1 className="text-xl font-medium text-foreground">YustBoard</h1>
      </div>
      <nav className="flex-1 overflow-y-auto py-2">
        <ul className="px-3">
          {enabledItems.map((item) => {
            const isActive = pathname === item.path || (item.path !== '/dashboard' && pathname.startsWith(`${item.path}/`));
            const Icon = iconMap[item.icon] || FiHome;
            return (
              <li key={item.id} className="mb-1">
                <Link
                  href={item.path}
                  className={`relative flex items-center h-12 px-3 rounded-full transition-all hover-overlay ${
                    isActive 
                      ? 'bg-accent text-accent-foreground font-medium' 
                      : 'text-secondary-foreground hover:bg-secondary'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  <span className="text-sm">{item.label}</span>
                  {isActive && (
                    <div className="absolute inset-y-0 left-0 w-1 bg-primary rounded-r-full" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="p-3 border-t border-border">
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="relative flex items-center w-full h-12 px-3 rounded-full text-secondary-foreground hover:bg-secondary transition-all hover-overlay"
        >
          <FiLogOut className="mr-3 h-5 w-5" />
          <span className="text-sm">Uitloggen</span>
        </button>
      </div>
    </div>
  );
}