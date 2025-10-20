import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/server';
import prisma from '@/lib/database/prisma';
import { logger } from '@/lib/logger';

export async function DELETE() {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Niet geautoriseerd' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Check if user is the owner of an organization
    const organization = await prisma.organization.findFirst({
      where: {
        users: {
          some: {
            id: userId,
            organizationRole: 'OWNER',
          },
        },
      },
      include: {
        users: true,
      },
    });

    // If user is owner and there are other members, prevent deletion
    if (organization && organization.users.length > 1) {
      return NextResponse.json(
        { error: 'Je kunt je account niet verwijderen terwijl je eigenaar bent van een organisatie met andere leden. Transfer eerst het eigenaarschap.' },
        { status: 400 }
      );
    }

    // Delete user (this will cascade delete related data)
    await prisma.user.delete({
      where: { id: userId },
    });

    logger.debug('User account deleted', { userId, email: session.user.email });

    return NextResponse.json({
      message: 'Account succesvol verwijderd',
      success: true,
    });
  } catch (error) {
    logger.error('Account deletion error:', error as Error);
    return NextResponse.json(
      { error: 'Er is een fout opgetreden bij het verwijderen van je account' },
      { status: 500 }
    );
  }
}
