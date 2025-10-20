'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FiCheck, FiX, FiRefreshCw } from 'react-icons/fi';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Geen verificatie token gevonden');
      return;
    }

    verifyEmail(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const verifyEmail = async (token: string) => {
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.message);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setStatus('error');
        setMessage(data.error || 'Verificatie mislukt');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setStatus('error');
      setMessage('Er is een fout opgetreden. Probeer het opnieuw.');
    }
  };

  return (
    <div className="flex min-h-screen bg-secondary items-center justify-center">
      <div className="m-auto bg-card p-8 rounded-lg shadow-2 w-full max-w-md">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <FiRefreshCw className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
              <h1 className="text-2xl font-normal mb-2 text-foreground">E-mail Verifiëren</h1>
              <p className="text-secondary-foreground">Even geduld, we verifiëren je e-mailadres...</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCheck className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h1 className="text-2xl font-normal mb-2 text-foreground">E-mail Geverifieerd!</h1>
              <p className="text-secondary-foreground mb-6">{message}</p>
              <p className="text-sm text-muted-foreground">Je wordt doorgestuurd naar de login pagina...</p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiX className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <h1 className="text-2xl font-normal mb-2 text-foreground">Verificatie Mislukt</h1>
              <p className="text-secondary-foreground mb-6">{message}</p>
              <Link
                href="/login"
                className="inline-block px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Terug naar Login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-background">
        <FiRefreshCw className="h-12 w-12 animate-spin text-primary" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
