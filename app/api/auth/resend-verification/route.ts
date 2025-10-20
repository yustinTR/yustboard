import { NextResponse } from 'next/server';
import prisma from '@/lib/database/prisma';
import { generateToken, getEmailVerificationExpiry } from '@/lib/auth/tokens';
import { sendVerificationEmail } from '@/lib/email/send-verification';
import { logger } from '@/lib/logger';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is verplicht' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        authMethod: true,
      },
    });

    if (!user) {
      // Don't reveal if user exists or not
      return NextResponse.json({
        message: 'Als het account bestaat, is er een verificatielink verstuurd.',
      });
    }

    // Check if already verified
    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'E-mailadres is al geverifieerd' },
        { status: 400 }
      );
    }

    // Only for credentials users
    if (user.authMethod !== 'CREDENTIALS') {
      return NextResponse.json(
        { error: 'Alleen credentials accounts hebben email verificatie nodig' },
        { status: 400 }
      );
    }

    // Generate new verification token
    const verificationToken = generateToken();
    const verificationExpiry = getEmailVerificationExpiry();

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: verificationToken,
        emailVerificationExpiry: verificationExpiry,
      },
    });

    // Send verification email
    await sendVerificationEmail({
      to: user.email || email,
      userName: user.name || email.split('@')[0],
      verificationToken,
    });

    logger.debug('Verification email resent', { userId: user.id, email: user.email });

    return NextResponse.json({
      message: 'Verificatielink opnieuw verstuurd. Check je inbox.',
    });
  } catch (error) {
    logger.error('Resend verification error:', error as Error);
    return NextResponse.json(
      { error: 'Er is een fout opgetreden bij het versturen van de verificatielink' },
      { status: 500 }
    );
  }
}
