'use client';

import { useSession, signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, Suspense, useState } from 'react';
import Link from 'next/link';

function LoginContent() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendingVerification, setResendingVerification] = useState(false);

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
        return 'Onjuiste inloggegevens. Probeer het opnieuw.';
      case 'TokenExpired':
        return 'Je sessie is verlopen. Log opnieuw in.';
      case 'SessionRequired':
        return 'Log in om deze pagina te bekijken.';
      case 'google':
        return 'Google authenticatie mislukt. Probeer het opnieuw.';
      case 'RefreshAccessTokenError':
      case 'RefreshTokenExpired':
      case 'LoadingTimeout':
      case 'SessionInvalid':
      case 'SessionExpired':
        return 'Je sessie is verlopen. Log opnieuw in om door te gaan.';
      default:
        return 'Er is een fout opgetreden. Probeer het opnieuw.';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFormError(null);
    setNeedsVerification(false);

    try {
      console.log('🔐 Attempting login for:', email);
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      console.log('📝 Login result:', { ok: result?.ok, error: result?.error, url: result?.url });

      if (result?.error) {
        // Always check if this is a verification issue when login fails
        const checkResponse = await fetch('/api/auth/check-verification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        if (checkResponse.ok) {
          const data = await checkResponse.json();
          if (data.needsVerification) {
            setNeedsVerification(true);
            setFormError('✉️ Je e-mailadres is nog niet geverifieerd. Check je inbox voor de verificatielink.');
            setLoading(false);
            return;
          }
        }

        // If not a verification issue, show generic error
        setFormError('Onjuiste inloggegevens. Probeer het opnieuw.');
      } else if (result?.ok) {
        console.log('✅ Login successful, redirecting to dashboard');
        // Small delay to ensure session is set
        await new Promise(resolve => setTimeout(resolve, 500));
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      setFormError('Er is een fout opgetreden. Probeer het opnieuw.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResendingVerification(true);
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setFormError('✅ Verificatielink opnieuw verstuurd! Check je inbox.');
      } else {
        setFormError(data.error || 'Fout bij versturen verificatielink');
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      setFormError('Er is een fout opgetreden. Probeer het opnieuw.');
    } finally {
      setResendingVerification(false);
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
          <p className="text-secondary-foreground">Log in om door te gaan</p>
        </div>

        {(error || formError) && (
          <div className={`mb-6 p-4 rounded-lg flex items-start ${formError?.startsWith('✅') ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-destructive/10 text-destructive'}`}>
            <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">
              <p>{formError || (error && getErrorMessage(error))}</p>
              {needsVerification && (
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={resendingVerification}
                  className="mt-2 text-sm underline hover:no-underline disabled:opacity-50"
                >
                  {resendingVerification ? 'Versturen...' : 'Verificatielink opnieuw versturen'}
                </button>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
              E-mailadres
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
              placeholder="jouw@email.nl"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="password" className="block text-sm font-medium text-foreground">
                Wachtwoord
              </label>
              <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                Vergeten?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Inloggen...' : 'Inloggen'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Nog geen account?{' '}
            <Link href="/register" className="text-primary hover:underline">
              Registreer hier
            </Link>
          </p>
        </div>

        <div className="mt-8 relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-card text-muted-foreground">Of log in met</span>
          </div>
        </div>

        <div className="mt-6">
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
