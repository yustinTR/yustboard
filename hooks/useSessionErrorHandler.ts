'use client';

import { useSession, signOut } from 'next-auth/react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useSessionErrorHandler() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Check if session has a refresh token error
    if (session?.error === 'RefreshAccessTokenError') {
      // Sign out the user and redirect to login with error
      signOut({ 
        redirect: false 
      }).then(() => {
        router.push('/login?error=RefreshAccessTokenError');
      });
    }
  }, [session, router]);

  return { session, status };
}