import { NextResponse } from 'next/server';
import prisma from '@/lib/database/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is verplicht' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        emailVerified: true,
        authMethod: true,
        password: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { needsVerification: false },
        { status: 200 }
      );
    }

    // If password is provided, verify it matches before suggesting verification issue
    if (password && user.password) {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        // Wrong password, not a verification issue
        return NextResponse.json({
          needsVerification: false,
        });
      }
    }

    // Only credentials users need verification
    const needsVerification = user.authMethod === 'CREDENTIALS' && !user.emailVerified;

    return NextResponse.json({
      needsVerification,
    });
  } catch (error) {
    console.error('Check verification error:', error);
    return NextResponse.json(
      { error: 'Er is een fout opgetreden' },
      { status: 500 }
    );
  }
}
