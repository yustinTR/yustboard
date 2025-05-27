import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { fetchRecentFiles, fetchSharedFiles } from '@/utils/google-drive';

export async function GET(request: Request) {
  try {
    // Get the user's session
    const session = await getServerSession(authOptions);
    
    console.log('Drive API - Session check:', {
      hasSession: !!session,
      hasAccessToken: !!session?.accessToken,
      userId: session?.user?.id
    });
    
    if (!session?.accessToken) {
      console.error('Drive API - No access token in session');
      return NextResponse.json(
        { error: 'Unauthorized - No access token available. Please sign out and sign in again.' },
        { status: 401 }
      );
    }
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const maxResults = searchParams.get('max') ? parseInt(searchParams.get('max') as string, 10) : 10;
    const type = searchParams.get('type') || 'recent';
    
    // Fetch files based on the requested type
    let files;
    if (type === 'shared') {
      files = await fetchSharedFiles(session.accessToken, maxResults);
    } else {
      files = await fetchRecentFiles(session.accessToken, maxResults);
    }
    
    return NextResponse.json({ files });
  } catch (error) {
    console.error('Error in Google Drive API route:', error);
    
    // Check if it's an authentication error
    if (error instanceof Error && error.message.includes('Invalid Credentials')) {
      return NextResponse.json(
        { error: 'Authentication failed. Please sign out and sign in again to refresh your Google Drive access.' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch files', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}