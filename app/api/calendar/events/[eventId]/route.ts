import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/server';
import prisma from '@/lib/database/prisma';

interface RouteParams {
  params: Promise<{ eventId: string }>;
}

// GET - Fetch a single calendar event
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession();
    const { eventId } = await params;

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

    const event = await prisma.calendarEvent.findFirst({
      where: {
        id: eventId,
        organizationId: user.organizationId
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const formattedEvent = {
      id: event.id,
      title: event.title,
      description: event.description,
      startDate: event.startDate.toISOString(),
      endDate: event.endDate.toISOString(),
      allDay: event.allDay,
      location: event.location,
      source: 'local' as const,
      authorId: event.authorId,
      authorName: event.author.name,
      authorImage: event.author.image,
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString()
    };

    return NextResponse.json({ event: formattedEvent });
  } catch (error) {
    console.error('Error fetching calendar event:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update a calendar event
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession();
    const { eventId } = await params;

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

    // Find the event
    const existingEvent = await prisma.calendarEvent.findFirst({
      where: {
        id: eventId,
        organizationId: user.organizationId
      }
    });

    if (!existingEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Check permissions: only author or OWNER/ADMIN can edit
    const isAuthor = existingEvent.authorId === session.user.id;
    const isAdmin = user.organizationRole === 'OWNER' || user.organizationRole === 'ADMIN';

    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        { error: 'Only the author or admin can edit this event' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, description, startDate, endDate, allDay, location } = body;

    const updatedEvent = await prisma.calendarEvent.update({
      where: { id: eventId },
      data: {
        title: title !== undefined ? title : existingEvent.title,
        description: description !== undefined ? description : existingEvent.description,
        startDate: startDate ? new Date(startDate) : existingEvent.startDate,
        endDate: endDate ? new Date(endDate) : existingEvent.endDate,
        allDay: allDay !== undefined ? allDay : existingEvent.allDay,
        location: location !== undefined ? location : existingEvent.location
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    });

    const formattedEvent = {
      id: updatedEvent.id,
      title: updatedEvent.title,
      description: updatedEvent.description,
      startDate: updatedEvent.startDate.toISOString(),
      endDate: updatedEvent.endDate.toISOString(),
      allDay: updatedEvent.allDay,
      location: updatedEvent.location,
      source: 'local' as const,
      authorId: updatedEvent.authorId,
      authorName: updatedEvent.author.name,
      authorImage: updatedEvent.author.image,
      createdAt: updatedEvent.createdAt.toISOString(),
      updatedAt: updatedEvent.updatedAt.toISOString()
    };

    return NextResponse.json({ event: formattedEvent });
  } catch (error) {
    console.error('Error updating calendar event:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete a calendar event
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession();
    const { eventId } = await params;

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

    // Find the event
    const existingEvent = await prisma.calendarEvent.findFirst({
      where: {
        id: eventId,
        organizationId: user.organizationId
      }
    });

    if (!existingEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Check permissions: only author or OWNER/ADMIN can delete
    const isAuthor = existingEvent.authorId === session.user.id;
    const isAdmin = user.organizationRole === 'OWNER' || user.organizationRole === 'ADMIN';

    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        { error: 'Only the author or admin can delete this event' },
        { status: 403 }
      );
    }

    await prisma.calendarEvent.delete({
      where: { id: eventId }
    });

    return NextResponse.json({ success: true, message: 'Event deleted' });
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
