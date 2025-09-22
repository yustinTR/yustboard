'use client';

import { useSession, signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';
// import Image from 'next/image'; // Currently not used

function LoginContent() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  // Use useEffect for navigation instead of doing it during render
  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);


  const getErrorMessage = (error: string) => {
    switch (error) {
      case 'OAuthSignin':
      case 'OAuthCallback':
      case 'OAuthCreateAccount':
      case 'EmailCreateAccount':
      case 'Callback':
      case 'OAuthAccountNotLinked':
      case 'EmailSignin':
      case 'CredentialsSignin':
        return 'Authentication error. Please try again.';
      case 'TokenExpired':
        return 'Your session has expired. Please sign in again.';
      case 'SessionRequired':
        return 'Please sign in to access this page.';
      case 'google':
        return 'Google authentication failed. Please check your credentials or try another method.';
      case 'RefreshAccessTokenError':
        return 'Je sessie is verlopen. Log opnieuw in om door te gaan.';
      case 'RefreshTokenExpired':
        return 'Je sessie is verlopen. Log opnieuw in om door te gaan.';
      case 'LoadingTimeout':
        return 'De pagina laadde te lang. Log opnieuw in om door te gaan.';
      case 'SessionInvalid':
        return 'Je sessie is ongeldig geworden. Log opnieuw in om door te gaan.';
      case 'SessionExpired':
        return 'Je sessie is verlopen. Log opnieuw in om door te gaan.';
      default:
        return 'An error occurred during authentication. Please try again.';
    }
  };

  // Show loading while authenticating
  if (status === 'loading' || status === 'authenticated') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-muted-foreground">
            {status === 'authenticated' ? 'Doorverwijzen naar dashboard...' : 'Laden...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-secondary">
      <div className="m-auto bg-card p-8 rounded-lg shadow-2 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-normal mb-2 text-foreground">Welkom bij YustBoard</h1>
          <p className="text-secondary-foreground">Meld je aan om door te gaan</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-lg flex items-center">
            <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p>{getErrorMessage(error)}</p>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
            className="relative flex items-center justify-center w-full h-12 px-6 text-foreground bg-white dark:bg-card border border-border rounded-full hover:bg-secondary transition-colors hover-overlay"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="text-sm font-medium">Doorgaan met Google</span>
          </button>

          <button
            onClick={() => signIn('github', { callbackUrl: '/dashboard' })}
            className="relative flex items-center justify-center w-full h-12 px-6 text-white bg-[#24292e] rounded-full hover:bg-[#1a1e22] transition-colors hover-overlay"
          >
            <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
            </svg>
            <span className="text-sm font-medium">Doorgaan met GitHub</span>
          </button>
        </div>

        <div className="mt-8 text-center text-xs text-muted-foreground">
          <p>Door in te loggen ga je akkoord met onze voorwaarden</p>
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Laden...</p>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}