import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/server';
import prisma from '@/lib/database/prisma';

// POST - Apply organization widget defaults to current user's preferences
export async function POST() {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { organizationId: true }
    });

    if (!user?.organizationId) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 });
    }

    // Fetch organization defaults
    const defaults = await prisma.organizationWidgetDefault.findMany({
      where: { organizationId: user.organizationId },
      orderBy: { position: 'asc' }
    });

    if (defaults.length === 0) {
      return NextResponse.json({ error: 'No organization defaults found' }, { status: 404 });
    }

    // Apply defaults to user's preferences in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete all existing preferences for this user in this organization
      await tx.userWidgetPreference.deleteMany({
        where: {
          userId: session.user.id,
          organizationId: user.organizationId
        }
      });

      // Create new preferences based on organization defaults
      await tx.userWidgetPreference.createMany({
        data: defaults.map((defaultWidget) => ({
          userId: session.user.id,
          organizationId: user.organizationId!,
          widgetId: defaultWidget.widgetId,
          enabled: defaultWidget.enabled,
          position: defaultWidget.position,
          settings: defaultWidget.settings ?? undefined
        }))
      });
    });

    // Fetch and return the new user preferences
    const newPreferences = await prisma.userWidgetPreference.findMany({
      where: {
        userId: session.user.id,
        organizationId: user.organizationId
      },
      orderBy: { position: 'asc' },
      select: {
        widgetId: true,
        enabled: true,
        position: true,
        settings: true
      }
    });

    return NextResponse.json({
      preferences: newPreferences,
      message: 'Team defaults applied successfully'
    });
  } catch (error) {
    console.error('Error applying organization widget defaults:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
