'use client';

import { FiAlertCircle } from 'react-icons/fi';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const getErrorMessage = (error: string) => {
    switch (error) {
      case 'OAuthSignin':
        return 'Error starting the OAuth sign-in flow.';
      case 'OAuthCallback':
        return 'Error in the OAuth callback.';
      case 'OAuthCreateAccount':
        return 'Error creating the OAuth user in the database.';
      case 'EmailCreateAccount':
        return 'Error creating the email user in the database.';
      case 'Callback':
        return 'Error in the OAuth callback.';
      case 'OAuthAccountNotLinked':
        return 'Email already exists with a different provider.';
      case 'EmailSignin':
        return 'Error sending the email for sign-in.';
      case 'CredentialsSignin':
        return 'Invalid credentials. Please try again.';
      case 'TokenExpired':
        return 'Your session has expired. Please sign in again.';
      case 'SessionRequired':
        return 'Please sign in to access this page.';
      case 'google':
        return 'Google authentication failed. Please check your credentials or try another method.';
      default:
        return 'An error occurred during authentication. Please try again.';
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="m-auto bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Authentication Error</h1>
        </div>

        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md flex items-center">
          <FiAlertCircle className="mr-2 flex-shrink-0" />
          <p>{getErrorMessage(error || '')}</p>
        </div>

        <div className="text-center">
          <Link 
            href="/login"
            className="inline-block px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Return to Login
          </Link>
        </div>
      </div>
    </div>
  );
}