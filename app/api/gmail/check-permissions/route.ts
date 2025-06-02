import { NextResponse } from 'next/server';
import { getGmailClient } from '@/utils/gmail-auth';

export async function GET() {
  try {
    const gmail = await getGmailClient();
    
    // Try to get the user's profile to test basic permissions
    const profile = await gmail.users.getProfile({ userId: 'me' });
    
    // Try to test modify permissions by attempting to get labels
    let canModify = false;
    try {
      await gmail.users.labels.list({ userId: 'me' });
      canModify = true;
    } catch {
      console.warn('Cannot list labels - limited permissions');
    }
    
    return NextResponse.json({
      email: profile.data.emailAddress,
      canRead: true,
      canModify,
      totalMessages: profile.data.messagesTotal,
      threadsTotal: profile.data.threadsTotal,
    });
  } catch (error: unknown) {
    console.error('Error checking permissions:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (errorMessage === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (errorMessage === 'No Google account linked') {
      return NextResponse.json({ error: 'Please reconnect your Google account' }, { status: 400 });
    }
    
    return NextResponse.json(
      { error: 'Failed to check permissions' },
      { status: 500 }
    );
  }
}