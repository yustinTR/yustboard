import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/server';
import prisma from '@/lib/database/prisma';

// GET - Fetch local calendar events for the organization
export async function GET(request: NextRequest) {
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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const timeMin = searchParams.get('timeMin');
    const timeMax = searchParams.get('timeMax');

    // Build where clause
    const where: {
      organizationId: string;
      startDate?: { gte: Date };
      endDate?: { lte: Date };
    } = {
      organizationId: user.organizationId
    };

    if (timeMin) {
      where.startDate = { gte: new Date(timeMin) };
    }
    if (timeMax) {
      where.endDate = { lte: new Date(timeMax) };
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

    // Transform to API format
    const formattedEvents = events.map(event => ({
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
    }));

    return NextResponse.json({ events: formattedEvents });
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a new calendar event
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { title, description, startDate, endDate, allDay, location } = body;

    // Validate required fields
    if (!title || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Title, startDate, and endDate are required' },
        { status: 400 }
      );
    }

    const event = await prisma.calendarEvent.create({
      data: {
        title,
        description: description || null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
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

    return NextResponse.json({ event: formattedEvent }, { status: 201 });
  } catch (error) {
    console.error('Error creating calendar event:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
