import { NextResponse } from 'next/server';
import { getAuthenticatedSession } from '@/lib/auth/auth-utils';
import { fetchEmails, getEmailCounts } from '@/utils/google/google-gmail';

export async function GET(request: Request) {
  try {
    // Get the user's session with automatic token refresh
    const { error, session } = await getAuthenticatedSession();
    
    if (error) {
      return error;
    }
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const maxResults = searchParams.get('max') ? parseInt(searchParams.get('max') as string, 10) : 10;
    const query = searchParams.get('query') || 'in:inbox';
    const pageToken = searchParams.get('pageToken') || undefined;
    const countsOnly = searchParams.get('countsOnly') === 'true';
    const includeCounts = searchParams.get('counts') === 'true' || searchParams.get('includeCounts') === 'true';
    
    // If countsOnly is true, return only email counts
    if (countsOnly) {
      if (!session.accessToken) {
        return NextResponse.json({ error: 'No access token available' }, { status: 401 });
      }
      const counts = await getEmailCounts(session.accessToken);
      return NextResponse.json({ counts });
    }
    
    // Check access token is available
    if (!session.accessToken) {
      return NextResponse.json({ error: 'No access token available' }, { status: 401 });
    }

    // Fetch emails
    const result = await fetchEmails(
      session.accessToken,
      maxResults,
      query,
      pageToken as string | undefined
    );
    
    // If includeCounts is true, also fetch label counts
    if (includeCounts) {
      const counts = await getEmailCounts(session.accessToken);
      return NextResponse.json({ 
        ...result,
        counts
      });
    }
    
    return NextResponse.json(result);
  } catch (error: unknown) {
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Handle Google API errors
    if (error && typeof error === 'object' && 'response' in error && 
        typeof error.response === 'object' && error.response) {
      const response = error.response as { status: number; data?: { error?: string | { message?: string } } };
      
      if (response.status === 403) {
        return NextResponse.json({ error: 'Insufficient permissions. Please re-authorize the app.' }, { status: 403 });
      }
      
      if (response.status === 401 || response.status === 400) {
        // Check for invalid_grant error specifically
        if (response.data && (response.data.error === 'invalid_grant' || 
            (typeof response.data.error === 'object' && response.data.error?.message === 'invalid_grant'))) {
          // invalid_grant error detected in Gmail list, token refresh failed
          return NextResponse.json({ error: 'Authentication expired. Please sign out and sign in again.' }, { status: 401 });
        }
        return NextResponse.json({ error: 'Authentication failed. Please sign in again.' }, { status: 401 });
      }
    }
    
    // Check for specific Google API error messages
    if (errorMessage.includes('invalid_grant')) {
      return NextResponse.json({ error: 'Authentication expired. Please sign out and sign in again.' }, { status: 401 });
    }
    
    if (errorMessage.includes('insufficient_scope') || errorMessage.includes('access_denied')) {
      return NextResponse.json({ error: 'Insufficient permissions. Please re-authorize the app.' }, { status: 403 });
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch emails' },
      { status: 500 }
    );
  }
}