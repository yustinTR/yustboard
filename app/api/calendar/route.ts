import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { parseISO } from 'date-fns';
import { authOptions } from '../auth/[...nextauth]/route';
import { 
  fetchGoogleCalendarEvents, 
  createGoogleCalendarEvent, 
  updateGoogleCalendarEvent, 
  deleteGoogleCalendarEvent,
  Task
} from '@/utils/google-calendar';

// Mock data for the test user
const mockTasks = [
  { id: '1', title: 'Complete dashboard UI', date: new Date(2023, 5, 15), completed: false },
  { id: '2', title: 'Meeting with client', date: new Date(2023, 5, 16), completed: false },
  { id: '3', title: 'Submit project proposal', date: new Date(2023, 5, 17), completed: false },
  { id: '4', title: 'Weekly team meeting', date: new Date(2023, 5, 18), completed: false },
  { id: '5', title: 'Doctor appointment', date: new Date(2023, 5, 20), completed: false },
];

// Check if the user is using the test account
function isTestUser(session: any) {
  return session?.accessToken === 'test-access-token' || session?.user?.email === 'test@example.com';
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // For debugging
    console.log("Calendar API GET session:", {
      isAuthenticated: !!session,
      hasAccessToken: session?.accessToken ? true : false,
      email: session?.user?.email,
      isTestUser: isTestUser(session)
    });
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized - No session' }, { status: 401 });
    }
    
    // If it's a test user or we have no access token, return mock data
    if (isTestUser(session) || !session.accessToken) {
      console.log("Using mock data for calendar events");
      return NextResponse.json(mockTasks);
    }
    
    const searchParams = req.nextUrl.searchParams;
    let timeMin = undefined;
    let timeMax = undefined;
    
    if (searchParams.has('timeMin')) {
      timeMin = parseISO(searchParams.get('timeMin') as string);
    }
    
    if (searchParams.has('timeMax')) {
      timeMax = parseISO(searchParams.get('timeMax') as string);
    }
    
    const events = await fetchGoogleCalendarEvents(session.accessToken, timeMin, timeMax);
    return NextResponse.json(events);
  } catch (error) {
    console.error('Error in GET /api/calendar:', error);
    return NextResponse.json({ error: 'Failed to fetch calendar events' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // For debugging
    console.log("Calendar API POST session:", {
      isAuthenticated: !!session,
      hasAccessToken: session?.accessToken ? true : false,
      email: session?.user?.email,
      isTestUser: isTestUser(session)
    });
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized - No session' }, { status: 401 });
    }
    
    const taskData = await req.json();
    const task: Omit<Task, 'id'> = {
      ...taskData,
      date: new Date(taskData.date),
      endDate: taskData.endDate ? new Date(taskData.endDate) : undefined,
    };
    
    // If it's a test user or we have no access token, return mock success
    if (isTestUser(session) || !session.accessToken) {
      console.log("Using mock data for creating calendar event");
      const mockId = Math.random().toString(36).substring(2, 9);
      return NextResponse.json({
        id: mockId,
        ...task,
      });
    }
    
    const createdEvent = await createGoogleCalendarEvent(session.accessToken, task as Task);
    
    if (!createdEvent) {
      return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
    }
    
    return NextResponse.json(createdEvent);
  } catch (error) {
    console.error('Error in POST /api/calendar:', error);
    return NextResponse.json({ error: 'Failed to create calendar event' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized - No session' }, { status: 401 });
    }
    
    const taskData = await req.json();
    const task: Task = {
      ...taskData,
      date: new Date(taskData.date),
      endDate: taskData.endDate ? new Date(taskData.endDate) : undefined,
    };
    
    if (!task.id) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }
    
    // If it's a test user or we have no access token, return mock success
    if (isTestUser(session) || !session.accessToken) {
      console.log("Using mock data for updating calendar event");
      return NextResponse.json(task);
    }
    
    const updatedEvent = await updateGoogleCalendarEvent(session.accessToken, task);
    
    if (!updatedEvent) {
      return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
    }
    
    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error('Error in PUT /api/calendar:', error);
    return NextResponse.json({ error: 'Failed to update calendar event' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized - No session' }, { status: 401 });
    }
    
    const searchParams = req.nextUrl.searchParams;
    const eventId = searchParams.get('id');
    
    if (!eventId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }
    
    // If it's a test user or we have no access token, return mock success
    if (isTestUser(session) || !session.accessToken) {
      console.log("Using mock data for deleting calendar event");
      return NextResponse.json({ success: true });
    }
    
    const success = await deleteGoogleCalendarEvent(session.accessToken, eventId);
    
    if (!success) {
      return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/calendar:', error);
    return NextResponse.json({ error: 'Failed to delete calendar event' }, { status: 500 });
  }
}