import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/server';
import prisma from '@/lib/database/prisma';
import { Prisma } from '@prisma/client';

interface WidgetDefault {
  widgetId: string;
  enabled: boolean;
  position: number;
  settings?: Prisma.InputJsonValue | null;
}

// GET - Fetch organization widget defaults
export async function GET() {
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

    const defaults = await prisma.organizationWidgetDefault.findMany({
      where: { organizationId: user.organizationId },
      orderBy: { position: 'asc' },
      select: {
        widgetId: true,
        enabled: true,
        position: true,
        settings: true
      }
    });

    return NextResponse.json({
      defaults,
      hasDefaults: defaults.length > 0
    }, {
      headers: {
        'Cache-Control': 'private, max-age=180, stale-while-revalidate=360'
      }
    });
  } catch (error) {
    console.error('Error fetching organization widget defaults:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Save current user's widget layout as organization defaults
export async function POST(request: Request) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { organizationId: true, organizationRole: true }
    });

    if (!user?.organizationId) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 });
    }

    // Only OWNER and ADMIN can set defaults
    if (user.organizationRole !== 'OWNER' && user.organizationRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Only admins can set widget defaults' }, { status: 403 });
    }

    const body = await request.json();
    const { widgets } = body as { widgets: WidgetDefault[] };

    if (!widgets || !Array.isArray(widgets)) {
      return NextResponse.json({ error: 'Invalid request: widgets array required' }, { status: 400 });
    }

    // Delete existing defaults and create new ones in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete all existing defaults for this organization
      await tx.organizationWidgetDefault.deleteMany({
        where: { organizationId: user.organizationId! }
      });

      // Create new defaults
      if (widgets.length > 0) {
        await tx.organizationWidgetDefault.createMany({
          data: widgets.map((widget) => ({
            organizationId: user.organizationId!,
            widgetId: widget.widgetId,
            enabled: widget.enabled,
            position: widget.position,
            settings: widget.settings ?? undefined
          }))
        });
      }
    });

    // Fetch and return the new defaults
    const newDefaults = await prisma.organizationWidgetDefault.findMany({
      where: { organizationId: user.organizationId },
      orderBy: { position: 'asc' },
      select: {
        widgetId: true,
        enabled: true,
        position: true,
        settings: true
      }
    });

    return NextResponse.json({
      defaults: newDefaults,
      hasDefaults: newDefaults.length > 0,
      message: 'Widget defaults saved successfully'
    });
  } catch (error) {
    console.error('Error saving organization widget defaults:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Remove all organization widget defaults
export async function DELETE() {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { organizationId: true, organizationRole: true }
    });

    if (!user?.organizationId) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 });
    }

    // Only OWNER and ADMIN can delete defaults
    if (user.organizationRole !== 'OWNER' && user.organizationRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Only admins can delete widget defaults' }, { status: 403 });
    }

    await prisma.organizationWidgetDefault.deleteMany({
      where: { organizationId: user.organizationId }
    });

    return NextResponse.json({
      message: 'Widget defaults removed successfully',
      hasDefaults: false
    });
  } catch (error) {
    console.error('Error deleting organization widget defaults:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
