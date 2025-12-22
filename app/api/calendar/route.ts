import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/server';
import { parseISO } from 'date-fns';
import { fetchGoogleCalendarEvents } from '@/utils/google/google-calendar';
import prisma from '@/lib/database/prisma';

// Unified event format with source indicator
interface CalendarEventFormatted {
  id: string;
  title: string;
  description?: string | null;
  startDate: string;
  endDate: string;
  allDay: boolean;
  location?: string | null;
  source: 'google' | 'local';
  // For local events only
  authorId?: string;
  authorName?: string | null;
  authorImage?: string | null;
  canEdit?: boolean;
  canDelete?: boolean;
}

// Check if user has Google account linked
async function hasGoogleLinked(userId: string): Promise<boolean> {
  const account = await prisma.account.findFirst({
    where: {
      userId,
      provider: 'google'
    },
    select: { id: true }
  });
  return !!account;
}

// Fetch local events from database
async function fetchLocalEvents(
  organizationId: string,
  userId: string,
  userRole: string,
  timeMin?: Date,
  timeMax?: Date
): Promise<CalendarEventFormatted[]> {
  const where: {
    organizationId: string;
    startDate?: { gte: Date };
    endDate?: { lte: Date };
  } = {
    organizationId
  };

  if (timeMin) {
    where.startDate = { gte: timeMin };
  }
  if (timeMax) {
    where.endDate = { lte: timeMax };
  }

  const events = await prisma.calendarEvent.findMany({
    where,
    orderBy: { startDate: 'asc' },
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

  const isAdmin = userRole === 'OWNER' || userRole === 'ADMIN';

  return events.map(event => {
    const isAuthor = event.authorId === userId;
    return {
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
      canEdit: isAuthor || isAdmin,
      canDelete: isAuthor || isAdmin
    };
  });
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's organization info
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { organizationId: true, organizationRole: true }
    });

    if (!user?.organizationId) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 });
    }

    const searchParams = req.nextUrl.searchParams;
    let timeMin: Date | undefined;
    let timeMax: Date | undefined;

    if (searchParams.has('timeMin')) {
      timeMin = parseISO(searchParams.get('timeMin') as string);
    }

    if (searchParams.has('timeMax')) {
      timeMax = parseISO(searchParams.get('timeMax') as string);
    }

    // Always fetch local events
    const localEvents = await fetchLocalEvents(
      user.organizationId,
      session.user.id,
      user.organizationRole,
      timeMin,
      timeMax
    );

    // Check if user has Google linked
    const googleLinked = await hasGoogleLinked(session.user.id);

    let allEvents: CalendarEventFormatted[] = [...localEvents];

    // If Google is linked and we have an access token, fetch Google events too
    if (googleLinked && session.accessToken) {
      try {
        const googleEvents = await fetchGoogleCalendarEvents(session.accessToken, timeMin, timeMax);

        // Transform Google events to unified format
        const formattedGoogleEvents: CalendarEventFormatted[] = googleEvents.map((event: { id: string; title: string; description?: string; date: Date; endDate?: Date; allDay?: boolean; location?: string }) => ({
          id: event.id,
          title: event.title,
          description: event.description || null,
          startDate: event.date instanceof Date ? event.date.toISOString() : new Date(event.date).toISOString(),
          endDate: event.endDate
            ? (event.endDate instanceof Date ? event.endDate.toISOString() : new Date(event.endDate).toISOString())
            : (event.date instanceof Date ? event.date.toISOString() : new Date(event.date).toISOString()),
          allDay: event.allDay || false,
          location: event.location || null,
          source: 'google' as const,
          canEdit: false,  // Google events are read-only
          canDelete: false
        }));

        allEvents = [...localEvents, ...formattedGoogleEvents];
      } catch (googleError) {
        console.error('Error fetching Google Calendar events:', googleError);
        // Continue with just local events if Google fails
      }
    }

    // Sort all events by start date
    allEvents.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    return NextResponse.json(allEvents, {
      headers: {
        'Cache-Control': 'private, max-age=180, stale-while-revalidate=360'
      }
    });
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return NextResponse.json({ error: 'Failed to fetch calendar events' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
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

    // VIEWERs cannot create events
    if (user.organizationRole === 'VIEWER') {
      return NextResponse.json({ error: 'Viewers cannot create events' }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, startDate, endDate, allDay, location } = body;

    // Validate required fields
    if (!title || !startDate) {
      return NextResponse.json(
        { error: 'Title and startDate are required' },
        { status: 400 }
      );
    }

    // Create local event in database
    const event = await prisma.calendarEvent.create({
      data: {
        title,
        description: description || null,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : new Date(startDate),
        allDay: allDay || false,
        location: location || null,
        authorId: session.user.id,
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

    const formattedEvent: CalendarEventFormatted = {
      id: event.id,
      title: event.title,
      description: event.description,
      startDate: event.startDate.toISOString(),
      endDate: event.endDate.toISOString(),
      allDay: event.allDay,
      location: event.location,
      source: 'local',
      authorId: event.authorId,
      authorName: event.author.name,
      authorImage: event.author.image,
      canEdit: true,
      canDelete: true
    };

    return NextResponse.json(formattedEvent, { status: 201 });
  } catch (error) {
    console.error('Error creating calendar event:', error);
    return NextResponse.json({ error: 'Failed to create calendar event' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
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

    const body = await req.json();
    const { id, title, description, startDate, endDate, allDay, location, source } = body;

    if (!id) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    // Only local events can be updated
    if (source === 'google') {
      return NextResponse.json(
        { error: 'Google Calendar events are read-only. Edit them in Google Calendar.' },
        { status: 403 }
      );
    }

    // Find the local event
    const existingEvent = await prisma.calendarEvent.findFirst({
      where: {
        id,
        organizationId: user.organizationId
      }
    });

    if (!existingEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Check permissions
    const isAuthor = existingEvent.authorId === session.user.id;
    const isAdmin = user.organizationRole === 'OWNER' || user.organizationRole === 'ADMIN';

    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        { error: 'Only the author or admin can edit this event' },
        { status: 403 }
      );
    }

    const updatedEvent = await prisma.calendarEvent.update({
      where: { id },
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

    const formattedEvent: CalendarEventFormatted = {
      id: updatedEvent.id,
      title: updatedEvent.title,
      description: updatedEvent.description,
      startDate: updatedEvent.startDate.toISOString(),
      endDate: updatedEvent.endDate.toISOString(),
      allDay: updatedEvent.allDay,
      location: updatedEvent.location,
      source: 'local',
      authorId: updatedEvent.authorId,
      authorName: updatedEvent.author.name,
      authorImage: updatedEvent.author.image,
      canEdit: true,
      canDelete: true
    };

    return NextResponse.json(formattedEvent);
  } catch (error) {
    console.error('Error updating calendar event:', error);
    return NextResponse.json({ error: 'Failed to update calendar event' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
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

    const searchParams = req.nextUrl.searchParams;
    const eventId = searchParams.get('id');
    const source = searchParams.get('source');

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    // Only local events can be deleted
    if (source === 'google') {
      return NextResponse.json(
        { error: 'Google Calendar events are read-only. Delete them in Google Calendar.' },
        { status: 403 }
      );
    }

    // Find the local event
    const existingEvent = await prisma.calendarEvent.findFirst({
      where: {
        id: eventId,
        organizationId: user.organizationId
      }
    });

    if (!existingEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Check permissions
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
    return NextResponse.json({ error: 'Failed to delete calendar event' }, { status: 500 });
  }
}