import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedSession } from '@/lib/auth-utils';
import { google } from 'googleapis';

export async function POST(request: NextRequest) {
  try {
    const { error, session } = await getAuthenticatedSession();
    
    if (error) {
      return error;
    }

    const body = await request.json();
    const { action, messageId } = body;

    if (!action || !messageId) {
      return NextResponse.json(
        { error: 'Missing action or messageId' },
        { status: 400 }
      );
    }

    // Initialize Gmail API
    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    auth.setCredentials({
      access_token: session.accessToken,
    });

    const gmail = google.gmail({ version: 'v1', auth });

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
  } catch (error) {
    console.error('Error performing email action:', error);
    return NextResponse.json(
      { error: 'Failed to perform action' },
      { status: 500 }
    );
  }
}