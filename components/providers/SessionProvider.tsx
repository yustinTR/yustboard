'use client';

import { SessionProvider as NextAuthSessionProvider, signOut, useSession } from 'next-auth/react';
import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface SessionProviderProps {
  children: ReactNode;
}

function SessionWrapper({ children }: SessionProviderProps) {
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    // Check for refresh token errors in session
    if (session && 'error' in session && session.error === 'RefreshAccessTokenError') {
      signOut({
        callbackUrl: '/login?error=RefreshTokenExpired',
        redirect: true
      });
    }
  }, [session]);

  useEffect(() => {
    // Listen for session update events
    const handleStorageChange = (e: StorageEvent) => {
      // Check if NextAuth session was cleared externally or if there are errors
      if (e.key?.startsWith('next-auth.') || e.key === 'next-auth.session-token') {
        // Force a page reload to re-evaluate session
        if (!e.newValue && e.oldValue) {
          window.location.href = '/login?error=SessionExpired';
        }
      }
    };

    // Listen for unhandled promise rejections (including fetch errors)
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason;

      // TEMPORARY: Log all errors but don't auto-logout to debug the issue
      console.log('🐛 Unhandled rejection:', {
        pathname: window.location.pathname,
        error,
        errorMessage: error?.message,
        session: !!session
      });

      // Prevent the error from bubbling up
      event.preventDefault();

      // TODO: Re-enable auto-logout after fixing the root cause
      // For now, just log and prevent default
      return;

      // // Don't auto-logout if we're on the onboarding or dashboard pages
      // // These pages handle their own redirects
      // const pathname = window.location.pathname;
      // if (pathname === '/onboarding' || pathname.startsWith('/dashboard')) {
      //   console.log('⚠️ Ignoring auth error on protected page:', { pathname, error });
      //   // Prevent the error from bubbling up
      //   event.preventDefault();
      //   return;
      // }

      // if (error && typeof error === 'object') {
      //   // Check if it's a fetch error related to authentication
      //   if (error.message && error.message.includes('401')) {
      //     console.log('⚠️ 401 error detected, signing out');
      //     signOut({
      //       callbackUrl: '/login?error=TokenExpired',
      //       redirect: true
      //     });
      //   }
      //   // Check for specific refresh token errors (OAuth only)
      //   if (error.message && (error.message.includes('RefreshAccessTokenError') || error.message.includes('No refresh token available'))) {
      //     // Only sign out for OAuth users with refresh token issues
      //     if (session?.user?.authMethod === 'OAUTH') {
      //       console.log('⚠️ OAuth refresh token error, signing out');
      //       signOut({
      //         callbackUrl: '/login?error=RefreshAccessTokenError',
      //         redirect: true
      //       });
      //     }
      //   }
      // }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [router, session]);

  return <>{children}</>;
}

export default function SessionProvider({ children }: SessionProviderProps) {
  return (
    <NextAuthSessionProvider>
      <SessionWrapper>{children}</SessionWrapper>
    </NextAuthSessionProvider>
  );
}