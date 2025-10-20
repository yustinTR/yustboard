import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/server';
import prisma from '@/lib/database/prisma';
import { logger } from '@/lib/logger';

/**
 * GET endpoint to check if user can link Google account
 */
export async function GET() {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Niet geautoriseerd' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        authMethod: true,
        accounts: {
          where: {
            provider: 'google',
          },
        },
      },
    });

    const hasGoogleAccount = (user?.accounts.length ?? 0) > 0;

    return NextResponse.json({
      canLink: user?.authMethod === 'CREDENTIALS' && !hasGoogleAccount,
      hasGoogleAccount,
      authMethod: user?.authMethod,
    });
  } catch (error) {
    logger.error('Link Google check error:', error as Error);
    return NextResponse.json(
      { error: 'Er is een fout opgetreden' },
      { status: 500 }
    );
  }
}

/**
 * POST endpoint to link Google account
 * Returns a URL to initiate Google OAuth flow
 */
export async function POST() {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Niet geautoriseerd' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        authMethod: true,
        email: true,
      },
    });

    if (user?.authMethod !== 'CREDENTIALS') {
      return NextResponse.json(
        { error: 'Alleen credentials accounts kunnen Google account linken' },
        { status: 400 }
      );
    }

    // Return the Google OAuth URL
    // The actual linking happens in the OAuth callback
    const callbackUrl = `${process.env.NEXTAUTH_URL}/dashboard/profile`;
    const googleAuthUrl = `/api/auth/signin/google?callbackUrl=${encodeURIComponent(callbackUrl)}`;

    return NextResponse.json({
      authUrl: googleAuthUrl,
      message: 'Je wordt doorgestuurd naar Google voor autorisatie',
    });
  } catch (error) {
    logger.error('Link Google error:', error as Error);
    return NextResponse.json(
      { error: 'Er is een fout opgetreden' },
      { status: 500 }
    );
  }
}
