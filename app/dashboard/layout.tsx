'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Sidebar from '@/components/organisms/Sidebar';
import Header from '@/components/organisms/Header';
import { SidebarProvider } from '@/contexts/SidebarContext';
import { pollingManager } from '@/lib/api/polling-manager';
import { OnboardingCheck } from '@/components/providers/OnboardingCheck';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState<NodeJS.Timeout | null>(null);

  // Use useEffect to handle the redirect instead of doing it during render
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    // Also redirect if there's a refresh token error
    if (status === 'authenticated' && session?.error === 'RefreshAccessTokenError') {
      signOut({
        callbackUrl: '/login?error=RefreshAccessTokenError',
        redirect: true
      });
    }
    // Check if we have a session but no user or accessToken (might indicate an error)
    if (status === 'authenticated' && session && (!session.user || !session.accessToken)) {
      signOut({
        callbackUrl: '/login?error=SessionInvalid',
        redirect: true
      });
    }
  }, [status, session, router]);

  // Start polling manager when authenticated
  useEffect(() => {
    if (status === 'authenticated' && !session?.error) {
      pollingManager.start();
      return () => {
        pollingManager.stop();
      };
    } else {
      // Stop polling if not authenticated or if there's a session error
      pollingManager.stop();
    }
  }, [status, session?.error]);

  // Set up timeout for loading state to prevent infinite loading
  useEffect(() => {
    if (status === 'loading') {
      // Clear any existing timeout
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
      }
      
      // Set a 10-second timeout for loading
      const timeout = setTimeout(() => {
        signOut({
          callbackUrl: '/login?error=LoadingTimeout',
          redirect: true
        });
      }, 10000);
      
      setLoadingTimeout(timeout);
    } else {
      // Clear timeout when not loading
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
        setLoadingTimeout(null);
      }
    }

    // Cleanup timeout on unmount
    return () => {
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
      }
    };
  }, [status, loadingTimeout]);

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-secondary">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-secondary-foreground">Laden...</p>
        </div>
      </div>
    );
  }

  // Don't render the dashboard if not authenticated
  if (status === 'unauthenticated') {
    return (
      <div className="flex h-screen items-center justify-center bg-secondary">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-secondary-foreground">Doorverwijzen naar login...</p>
        </div>
      </div>
    );
  }

  return (
    <OnboardingCheck>
      <SidebarProvider>
        <div className="flex h-screen bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50 dark:from-gray-900/50 dark:via-gray-800/30 dark:to-gray-900/50 backdrop-blur-3xl overflow-hidden">
          {/* Mobile sidebar backdrop */}
          {isSidebarOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}

          {/* Sidebar - hidden on mobile, visible on desktop */}
          <div className={`fixed lg:static inset-y-0 left-0 z-50 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out`}>
            <Sidebar onClose={() => setIsSidebarOpen(false)} />
          </div>

          <div className="flex-1 flex flex-col overflow-hidden min-w-0">
            <Header />
            <main className="flex-1 relative overflow-y-auto overflow-x-hidden bg-gradient-to-br from-transparent via-white/5 to-transparent backdrop-blur-sm">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </OnboardingCheck>
  );
}