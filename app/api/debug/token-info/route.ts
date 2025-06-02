import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
            scope: true,
            expires_at: true,
          },
        },
      },
    });

    const googleAccount = user?.accounts[0];
    
    if (!googleAccount) {
      return NextResponse.json({ 
        hasGoogleAccount: false,
        message: 'No Google account linked. Please sign in again.'
      });
    }

    // Check token info via Google's tokeninfo endpoint
    let tokenInfo = null;
    if (googleAccount.access_token) {
      try {
        const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?access_token=${googleAccount.access_token}`);
        if (response.ok) {
          tokenInfo = await response.json();
        }
      } catch (error) {
        console.error('Error fetching token info:', error);
      }
    }

    return NextResponse.json({
      hasGoogleAccount: true,
      hasAccessToken: !!googleAccount.access_token,
      hasRefreshToken: !!googleAccount.refresh_token,
      storedScope: googleAccount.scope,
      expiresAt: googleAccount.expires_at,
      tokenInfo,
    });
  } catch (error) {
    console.error('Error getting token info:', error);
    return NextResponse.json(
      { error: 'Failed to get token info' },
      { status: 500 }
    );
  }
}