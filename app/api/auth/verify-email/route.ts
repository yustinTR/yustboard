import { NextResponse } from 'next/server';
import prisma from '@/lib/database/prisma';
import { logger } from '@/lib/logger';
import { isTokenExpired } from '@/lib/auth/tokens';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: 'Verificatie token is verplicht' },
        { status: 400 }
      );
    }

    // Find user with this verification token
    const user = await prisma.user.findUnique({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Ongeldige verificatie token' },
        { status: 400 }
      );
    }

    // Check if token is expired
    if (isTokenExpired(user.emailVerificationExpiry)) {
      return NextResponse.json(
        { error: 'Verificatie token is verlopen. Vraag een nieuwe aan.' },
        { status: 400 }
      );
    }

    // Verify email
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        emailVerificationToken: null,
        emailVerificationExpiry: null,
      },
    });

    logger.debug('Email verified successfully', { userId: user.id, email: user.email });

    return NextResponse.json({
      message: 'E-mail succesvol geverifieerd! Je kunt nu inloggen.',
      success: true,
    });
  } catch (error) {
    logger.error('Email verification error:', error as Error);
    return NextResponse.json(
      { error: 'Er is een fout opgetreden bij het verifiëren van je e-mail' },
      { status: 500 }
    );
  }
}
