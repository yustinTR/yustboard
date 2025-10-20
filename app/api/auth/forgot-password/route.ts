import { NextResponse } from 'next/server';
import prisma from '@/lib/database/prisma';
import { logger } from '@/lib/logger';
import { generateToken, getPasswordResetExpiry } from '@/lib/auth/tokens';
import { sendPasswordResetEmail } from '@/lib/email/send-password-reset';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'E-mailadres is verplicht' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Don't reveal if user exists or not (security best practice)
    if (!user) {
      return NextResponse.json({
        message: 'Als dit e-mailadres bestaat, is er een wachtwoord reset link verstuurd.',
        success: true,
      });
    }

    // Only allow password reset for credentials users
    if (user.authMethod !== 'CREDENTIALS') {
      return NextResponse.json({
        message: 'Dit account gebruikt sociale login. Wachtwoord resetten is niet mogelijk.',
        success: false,
      }, { status: 400 });
    }

    // Generate reset token
    const resetToken = generateToken();
    const resetExpiry = getPasswordResetExpiry();

    // Save token to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpiry: resetExpiry,
      },
    });

    // Send reset email (non-blocking)
    sendPasswordResetEmail({
      to: email,
      userName: user.name || email.split('@')[0],
      resetToken,
    }).catch((error) => {
      logger.error('Failed to send password reset email:', error);
    });

    logger.debug('Password reset requested', { userId: user.id, email: user.email });

    return NextResponse.json({
      message: 'Als dit e-mailadres bestaat, is er een wachtwoord reset link verstuurd.',
      success: true,
    });
  } catch (error) {
    logger.error('Forgot password error:', error as Error);
    return NextResponse.json(
      { error: 'Er is een fout opgetreden. Probeer het later opnieuw.' },
      { status: 500 }
    );
  }
}
