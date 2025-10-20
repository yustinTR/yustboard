import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/database/prisma';
import { logger } from '@/lib/logger';
import { isTokenExpired } from '@/lib/auth/tokens';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token en wachtwoord zijn verplicht' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Wachtwoord moet minimaal 8 karakters lang zijn' },
        { status: 400 }
      );
    }

    // Find user with this reset token
    const user = await prisma.user.findUnique({
      where: { passwordResetToken: token },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Ongeldige reset token' },
        { status: 400 }
      );
    }

    // Check if token is expired
    if (isTokenExpired(user.passwordResetExpiry)) {
      return NextResponse.json(
        { error: 'Reset token is verlopen. Vraag een nieuwe aan.' },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpiry: null,
      },
    });

    logger.debug('Password reset successfully', { userId: user.id, email: user.email });

    return NextResponse.json({
      message: 'Wachtwoord succesvol gereset! Je kunt nu inloggen.',
      success: true,
    });
  } catch (error) {
    logger.error('Password reset error:', error as Error);
    return NextResponse.json(
      { error: 'Er is een fout opgetreden bij het resetten van je wachtwoord' },
      { status: 500 }
    );
  }
}
