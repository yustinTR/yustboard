import { NextRequest, NextResponse } from 'next/server';
import { getGmailClient } from '@/utils/gmail-auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, messageId } = body;

    if (!action || !messageId) {
      return NextResponse.json(
        { error: 'Missing action or messageId' },
        { status: 400 }
      );
    }

    const gmail = await getGmailClient();

    switch (action) {
      case 'markRead':
        await gmail.users.messages.modify({
          userId: 'me',
          id: messageId,
          requestBody: {
            removeLabelIds: ['UNREAD'],
          },
        });
        break;

      case 'markUnread':
        await gmail.users.messages.modify({
          userId: 'me',
          id: messageId,
          requestBody: {
            addLabelIds: ['UNREAD'],
          },
        });
        break;

      case 'star':
        await gmail.users.messages.modify({
          userId: 'me',
          id: messageId,
          requestBody: {
            addLabelIds: ['STARRED'],
          },
        });
        break;

      case 'unstar':
        await gmail.users.messages.modify({
          userId: 'me',
          id: messageId,
          requestBody: {
            removeLabelIds: ['STARRED'],
          },
        });
        break;

      case 'archive':
        await gmail.users.messages.modify({
          userId: 'me',
          id: messageId,
          requestBody: {
            removeLabelIds: ['INBOX'],
          },
        });
        break;

      case 'trash':
        await gmail.users.messages.trash({
          userId: 'me',
          id: messageId,
        });
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error performing email action:', error);
    
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
      { error: 'Failed to perform action' },
      { status: 500 }
    );
  }
}