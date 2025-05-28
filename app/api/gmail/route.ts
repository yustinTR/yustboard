import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/lib/auth";
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
    const maxResults = searchParams.get('max') ? parseInt(searchParams.get('max') as string, 10) : 10;
    const query = searchParams.get('query') || 'in:inbox';
    const pageToken = searchParams.get('pageToken') || undefined;
    const countsOnly = searchParams.get('countsOnly') === 'true';
    
    // If countsOnly is true, return only email counts
    if (countsOnly) {
      const counts = await getEmailCounts(session.accessToken);
      return NextResponse.json({ counts });
    }
    
    // Otherwise, fetch emails
    const result = await fetchEmails(
      session.accessToken,
      maxResults,
      query,
      pageToken as string | undefined
    );
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in Gmail API route:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch emails' },
      { status: 500 }
    );
  }
}