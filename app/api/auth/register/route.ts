import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/database/prisma';
import { logger } from '@/lib/logger';
import { generateToken, getEmailVerificationExpiry } from '@/lib/auth/tokens';
import { sendVerificationEmail } from '@/lib/email/send-verification';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email en wachtwoord zijn verplicht' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Wachtwoord moet minimaal 8 karakters lang zijn' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Er bestaat al een account met dit e-mailadres' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate email verification token
    const verificationToken = generateToken();
    const verificationExpiry = getEmailVerificationExpiry();

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
        authMethod: 'CREDENTIALS',
        emailVerificationToken: verificationToken,
        emailVerificationExpiry: verificationExpiry,
        emailVerified: null, // Will be set after email verification
      },
    });

    // Send verification email (non-blocking)
    sendVerificationEmail({
      to: email,
      userName: name || email.split('@')[0],
      verificationToken,
    }).catch((error) => {
      logger.error('Failed to send verification email:', error);
    });

    logger.debug('User registered successfully', { userId: user.id, email: user.email });

    return NextResponse.json(
      {
        message: 'Account succesvol aangemaakt. Check je e-mail voor de verificatielink.',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        requiresVerification: true,
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error('Registration error:', error as Error);
    return NextResponse.json(
      { error: 'Er is een fout opgetreden bij het aanmaken van je account' },
      { status: 500 }
    );
  }
}
