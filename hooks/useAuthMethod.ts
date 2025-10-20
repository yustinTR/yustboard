import { useSession } from 'next-auth/react';
import { AuthMethod } from '@prisma/client';

/**
 * Hook to determine if the user is authenticated via Google OAuth
 * This is used to conditionally show/hide Google-dependent widgets
 */
export function useAuthMethod() {
  const { data: session } = useSession();

  const authMethod = session?.user?.authMethod || 'CREDENTIALS';
  const isGoogleAuth = authMethod === 'OAUTH';
  const isCredentialsAuth = authMethod === 'CREDENTIALS';

  return {
    authMethod: authMethod as AuthMethod,
    isGoogleAuth,
    isCredentialsAuth,
    hasGoogleAccess: isGoogleAuth,
  };
}
