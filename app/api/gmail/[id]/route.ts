import { NextRequest, NextResponse } from 'next/server';
import { getGmailClient } from '@/utils/gmail-auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: messageId } = await params;
    const markRead = request.nextUrl.searchParams.get('markRead') === 'true';

    const gmail = await getGmailClient();

    // Get the email details
    const response = await gmail.users.messages.get({
      userId: 'me',
      id: messageId,
      format: 'full',
    });

    const message = response.data;
    const headers = message.payload?.headers || [];
    
    // Extract email data
    const getHeader = (name: string) => 
      headers.find(h => h.name?.toLowerCase() === name.toLowerCase())?.value || '';

    // Parse the email body
    let body = '';
    let htmlBody = '';
    
    // Type assertion for Google Gmail API message parts - the actual type is very complex
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parseBody = (parts: any[]): void => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      parts.forEach((part: any) => {
        if (part.mimeType === 'text/plain' && part.body?.data) {
          body = Buffer.from(part.body.data, 'base64').toString('utf-8');
        } else if (part.mimeType === 'text/html' && part.body?.data) {
          htmlBody = Buffer.from(part.body.data, 'base64').toString('utf-8');
        } else if (part.parts) {
          parseBody(part.parts);
        }
      });
    };

    if (message.payload?.parts) {
      parseBody(message.payload.parts);
    } else if (message.payload?.body?.data) {
      const content = Buffer.from(message.payload.body.data, 'base64').toString('utf-8');
      if (message.payload.mimeType === 'text/html') {
        htmlBody = content;
      } else {
        body = content;
      }
    }

    // Mark as read if requested (only if we have write permissions)
    if (markRead && message.labelIds?.includes('UNREAD')) {
      try {
        await gmail.users.messages.modify({
          userId: 'me',
          id: messageId,
          requestBody: {
            removeLabelIds: ['UNREAD'],
          },
        });
      } catch (modifyError: unknown) {
        // If we can't modify, just log it but don't fail the whole request
        const errorMessage = modifyError instanceof Error ? modifyError.message : 'Unknown error';
        console.warn('Cannot mark email as read - insufficient permissions:', errorMessage);
      }
    }

    // Check if email has attachments
    const hasAttachments = message.payload?.parts?.some(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (part: any) => part.filename && part.body?.attachmentId
    ) || false;

    // Parse From header
    const fromHeader = getHeader('From');
    const fromMatch = fromHeader.match(/^(.+?)\s*<(.+?)>$/) || fromHeader.match(/^(.+)$/);
    const from = fromMatch ? {
      name: fromMatch[2] ? fromMatch[1].trim().replace(/^"|"$/g, '') : '',
      email: fromMatch[2] ? fromMatch[2].trim() : fromMatch[1].trim()
    } : {
      name: '',
      email: fromHeader
    };

    // Parse To header
    const toHeader = getHeader('To');
    const to = toHeader.split(',').map(addr => addr.trim());

    const email = {
      id: message.id!,
      threadId: message.threadId!,
      snippet: message.snippet || '',
      from,
      to,
      subject: getHeader('Subject'),
      date: new Date(parseInt(message.internalDate!) || Date.now()),
      body: htmlBody || body,
      isHtml: !!htmlBody,
      isRead: !message.labelIds?.includes('UNREAD'),
      isStarred: message.labelIds?.includes('STARRED') || false,
      hasAttachments,
      labels: message.labelIds || [],
    };

    return NextResponse.json({ email });
  } catch (error: unknown) {
    console.error('Error fetching email details:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (errorMessage === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (errorMessage === 'No Google account linked') {
      return NextResponse.json({ error: 'Please reconnect your Google account' }, { status: 400 });
    }
    
    if (errorMessage === 'No access token available') {
      return NextResponse.json({ error: 'Session expired. Please sign in again.' }, { status: 401 });
    }
    
    // Handle Google API errors
    if (error && typeof error === 'object' && 'response' in error && 
        typeof error.response === 'object' && error.response) {
      const response = error.response as any;
      
      if (response.status === 403) {
        return NextResponse.json({ error: 'Insufficient permissions. Please re-authorize the app.' }, { status: 403 });
      }
      
      if (response.status === 401 || response.status === 400) {
        // Check for invalid_grant error specifically
        if (response.data && response.data.error === 'invalid_grant') {
          console.log('invalid_grant error detected, token refresh failed');
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
      { error: 'Failed to fetch email details' },
      { status: 500 }
    );
  }
}