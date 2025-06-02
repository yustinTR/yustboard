import { NextResponse } from 'next/server';
import { getAuthenticatedSession } from '@/lib/auth-utils';
import { fetchEmails, getEmailCounts } from '@/utils/google-gmail';

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
      const counts = await getEmailCounts(session.accessToken);
      return NextResponse.json({ counts });
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
  } catch (error) {
    console.error('Error in Gmail API route:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch emails' },
      { status: 500 }
    );
  }
}