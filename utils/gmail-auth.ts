import { google } from 'googleapis';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function getGmailClient() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    throw new Error('Unauthorized');
  }

  // Get user with Google tokens
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
  if (!googleAccount?.access_token || !googleAccount?.refresh_token) {
    throw new Error('No Google account linked');
  }

  // Initialize OAuth2 client with both tokens
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  auth.setCredentials({
    access_token: googleAccount.access_token,
    refresh_token: googleAccount.refresh_token,
  });

  return google.gmail({ version: 'v1', auth });
}