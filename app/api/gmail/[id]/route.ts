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
    
    const parseBody = (parts: any[]): void => {
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
      } catch (modifyError: any) {
        // If we can't modify, just log it but don't fail the whole request
        console.warn('Cannot mark email as read - insufficient permissions:', modifyError.message);
      }
    }

    // Check if email has attachments
    const hasAttachments = message.payload?.parts?.some(
      (part: any) => part.filename && part.body?.attachmentId
    ) || false;

    const email = {
      id: message.id!,
      threadId: message.threadId!,
      snippet: message.snippet || '',
      from: getHeader('From'),
      to: getHeader('To'),
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
  } catch (error: any) {
    console.error('Error fetching email details:', error);
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (error.message === 'No Google account linked') {
      return NextResponse.json({ error: 'Please reconnect your Google account' }, { status: 400 });
    }
    
    if (error.response?.status === 403) {
      return NextResponse.json({ error: 'Insufficient permissions. Please re-authorize the app.' }, { status: 403 });
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch email details' },
      { status: 500 }
    );
  }
}