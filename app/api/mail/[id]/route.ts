import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/lib/auth";
import { fetchEmailById, markAsRead } from '@/utils/google-gmail';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params first
    const { id } = await params;
    
    // Get the user's session
    const session = await getServerSession(authOptions);
    
    if (!session?.accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized - No access token available' },
        { status: 401 }
      );
    }
    
    const messageId = id;
    if (!messageId) {
      return NextResponse.json(
        { error: 'Email ID is required' },
        { status: 400 }
      );
    }
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const markRead = searchParams.get('markRead') === 'true';
    
    // Fetch the email
    const email = await fetchEmailById(session.accessToken, messageId);
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email not found' },
        { status: 404 }
      );
    }
    
    // If markRead parameter is true, mark the email as read
    if (markRead && !email.isRead) {
      await markAsRead(session.accessToken, messageId);
      email.isRead = true;
    }
    
    return NextResponse.json({ email });
  } catch (error) {
    console.error(`Error fetching email:`, error);
    
    return NextResponse.json(
      { error: 'Failed to fetch email' },
      { status: 500 }
    );
  }
}