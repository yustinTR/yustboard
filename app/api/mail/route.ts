import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { fetchEmails, getEmailCounts } from '@/utils/google-gmail';

export async function GET(request: Request) {
  try {
    // Get the user's session
    const session = await getServerSession(authOptions);
    
    if (!session?.accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized - No access token available' },
        { status: 401 }
      );
    }
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || 'in:inbox';
    const maxResults = searchParams.get('max') ? parseInt(searchParams.get('max') as string, 10) : 20;
    const pageToken = searchParams.get('pageToken') || undefined;
    const includeCounts = searchParams.get('counts') === 'true';
    
    // Fetch emails from Gmail
    const result = await fetchEmails(
      session.accessToken,
      maxResults,
      query,
      pageToken
    );
    
    // If includeCounts is true, also fetch label counts
    if (includeCounts) {
      const counts = await getEmailCounts(session.accessToken);
      return NextResponse.json({ 
        emails: result.emails, 
        nextPageToken: result.nextPageToken,
        counts
      });
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in mail API route:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch emails' },
      { status: 500 }
    );
  }
}