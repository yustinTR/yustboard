import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { markAsRead, toggleStar } from '@/utils/google-gmail';

export async function POST(request: Request) {
  try {
    // Get the user's session
    const session = await getServerSession(authOptions);
    
    if (!session?.accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized - No access token available' },
        { status: 401 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    const { action, messageId } = body;
    
    if (!messageId) {
      return NextResponse.json(
        { error: 'Message ID is required' },
        { status: 400 }
      );
    }
    
    let success = false;
    let message = '';
    
    // Perform the requested action
    switch (action) {
      case 'markRead':
        success = await markAsRead(session.accessToken, messageId);
        message = success ? 'Email marked as read' : 'Failed to mark email as read';
        break;
      
      case 'star':
        success = await toggleStar(session.accessToken, messageId, true);
        message = success ? 'Email starred' : 'Failed to star email';
        break;
      
      case 'unstar':
        success = await toggleStar(session.accessToken, messageId, false);
        message = success ? 'Email unstarred' : 'Failed to unstar email';
        break;
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
    
    return NextResponse.json({ success, message });
  } catch (error) {
    console.error('Error in mail actions API route:', error);
    
    return NextResponse.json(
      { error: 'Failed to perform mail action' },
      { status: 500 }
    );
  }
}