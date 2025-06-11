'use client';

import { SessionProvider as NextAuthSessionProvider, signOut } from 'next-auth/react';
import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface SessionProviderProps {
  children: ReactNode;
}

function SessionWrapper({ children }: SessionProviderProps) {
  const router = useRouter();

  useEffect(() => {
    // Listen for session update events
    const handleStorageChange = (e: StorageEvent) => {
      // Check if NextAuth session was cleared externally or if there are errors
      if (e.key?.startsWith('next-auth.') || e.key === 'next-auth.session-token') {
        console.log('NextAuth storage change detected:', e);
        // Force a page reload to re-evaluate session
        if (!e.newValue && e.oldValue) {
          console.log('Session token was removed, redirecting to login');
          window.location.href = '/login?error=SessionExpired';
        }
      }
    };

    // Listen for unhandled promise rejections (including fetch errors)
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason;
      if (error && typeof error === 'object') {
        // Check if it's a fetch error related to authentication
        if (error.message && error.message.includes('401')) {
          console.log('Detected 401 error, possible token issue');
          signOut({ 
            callbackUrl: '/login?error=TokenExpired',
            redirect: true 
          });
        }
        // Check for specific refresh token errors
        if (error.message && error.message.includes('RefreshAccessTokenError')) {
          console.log('Detected RefreshAccessTokenError in unhandled rejection');
          signOut({ 
            callbackUrl: '/login?error=RefreshAccessTokenError',
            redirect: true 
          });
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [router]);

  return <>{children}</>;
}

export default function SessionProvider({ children }: SessionProviderProps) {
  return (
    <NextAuthSessionProvider>
      <SessionWrapper>{children}</SessionWrapper>
    </NextAuthSessionProvider>
  );
}