import { google } from 'googleapis';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function getGmailClient() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    throw new Error('Unauthorized');
  }

  // Check if session has error (like RefreshAccessTokenError)
  if ((session as any).error) {
    console.log('Session has error:', (session as any).error);
    throw new Error('Unauthorized');
  }

  // First try to use access token from session (which might be refreshed)
  const sessionAccessToken = (session as any).accessToken;

  // Get user with Google tokens as fallback
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      accounts: {
        where: { provider: 'google' },
        select: {
          access_token: true,
          refresh_token: true,
        },
      },
    },
  });

  const googleAccount = user?.accounts[0];
  if (!googleAccount?.refresh_token) {
    throw new Error('No Google account linked');
  }

  // Use session access token if available, otherwise fallback to database token
  const accessToken = sessionAccessToken || googleAccount.access_token;
  
  if (!accessToken) {
    throw new Error('No access token available');
  }

  // Initialize OAuth2 client with tokens
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  auth.setCredentials({
    access_token: accessToken,
    refresh_token: googleAccount.refresh_token,
  });

  // Set up automatic token refresh
  auth.on('tokens', async (tokens) => {
    console.log('Gmail client received new tokens, updating database');
    if (tokens.access_token && googleAccount) {
      try {
        await prisma.account.update({
          where: {
            userId_provider: {
              userId: user.id,
              provider: 'google',
            },
          },
          data: {
            access_token: tokens.access_token,
            expires_at: tokens.expiry_date ? Math.floor(tokens.expiry_date / 1000) : null,
          },
        });
      } catch (error) {
        console.error('Failed to update access token in database:', error);
      }
    }
  });

  return google.gmail({ version: 'v1', auth });
}