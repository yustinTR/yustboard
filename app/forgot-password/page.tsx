'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FiCheck, FiArrowLeft } from 'react-icons/fi';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok || data.success) {
        setSuccess(true);
      } else {
        setError(data.error || 'Er is een fout opgetreden');
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      setError('Er is een fout opgetreden. Probeer het opnieuw.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen bg-secondary items-center justify-center">
        <div className="m-auto bg-card p-8 rounded-lg shadow-2 w-full max-w-md">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCheck className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-2xl font-normal mb-2 text-foreground">E-mail Verzonden!</h1>
            <p className="text-secondary-foreground mb-6">
              Als dit e-mailadres in ons systeem bekend is, hebben we een wachtwoord reset link verstuurd.
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Check je inbox en klik op de link om je wachtwoord te resetten.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <FiArrowLeft className="mr-2" />
              Terug naar Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-secondary items-center justify-center">
      <div className="m-auto bg-card p-8 rounded-lg shadow-2 w-full max-w-md">
        <div className="mb-8">
          <Link
            href="/login"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <FiArrowLeft className="mr-2" />
            Terug naar login
          </Link>
          <h1 className="text-2xl font-normal mb-2 text-foreground">Wachtwoord Vergeten?</h1>
          <p className="text-secondary-foreground">
            Voer je e-mailadres in en we sturen je een link om je wachtwoord te resetten.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-lg flex items-center">
            <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p>{error}</p>
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Versturen...' : 'Reset Link Versturen'}
          </button>
        </form>
      </div>
    </div>
  );
}
