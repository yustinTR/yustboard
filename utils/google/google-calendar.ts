import { google } from 'googleapis';
import { format, parseISO, formatISO, addDays } from 'date-fns';

export interface GoogleEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  location?: string;
  creator?: {
    email: string;
    displayName?: string;
  };
  organizer?: {
    email: string;
    displayName?: string;
  };
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus?: string;
  }>;
  htmlLink?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  date: Date;
  endDate?: Date;
  completed: boolean;
  location?: string;
  isAllDay?: boolean;
}

// Convert Google Calendar events to our app's task format
export function eventToTask(event: GoogleEvent): Task {
  try {
    // Handle all-day events (has date but no dateTime)
    const isAllDay = !event.start.dateTime && !!event.start.date;
    
    let startDate: Date;
    let endDate: Date | undefined;
    
    if (isAllDay) {
      // For all-day events, use the date
      startDate = parseISO(event.start.date!);
      endDate = event.end.date ? parseISO(event.end.date) : undefined;
      
      // In Google Calendar, the end date for all-day events is exclusive,
      // so subtract one day to get the actual end date
      if (endDate) {
        endDate = addDays(endDate, -1);
      }
    } else {
      // For regular events, use the dateTime
      startDate = parseISO(event.start.dateTime!);
      endDate = event.end.dateTime ? parseISO(event.end.dateTime) : undefined;
    }
    
    return {
      id: event.id,
      title: event.summary,
      description: event.description,
      date: startDate,
      endDate: endDate,
      completed: false, // Google Calendar doesn't have a direct completed status
      location: event.location,
      isAllDay,
    };
  } catch (error) {
    console.error("Error converting event to task:", error, "Event:", event);
    // Provide a fallback if there's an issue with the date format
    return {
      id: event.id || "unknown-id",
      title: event.summary || "Untitled Event",
      description: event.description,
      date: new Date(),
      completed: false,
      location: event.location,
    };
  }
}

// Convert our app's task format to Google Calendar event
export function taskToEvent(task: Task): Partial<GoogleEvent> {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  if (task.isAllDay) {
    // Format all-day events
    const endDate = task.endDate || task.date;
    // Google Calendar requires the end date to be exclusive for all-day events
    const exclusiveEndDate = addDays(endDate, 1);
    
    return {
      summary: task.title,
      description: task.description,
      start: {
        date: format(task.date, 'yyyy-MM-dd'),
        timeZone,
      },
      end: {
        date: format(exclusiveEndDate, 'yyyy-MM-dd'),
        timeZone,
      },
      location: task.location,
    };
  } else {
    // Format regular events with time
    return {
      summary: task.title,
      description: task.description,
      start: {
        dateTime: formatISO(task.date),
        timeZone,
      },
      end: {
        dateTime: formatISO(task.endDate || addDays(task.date, 1)),
        timeZone,
      },
      location: task.location,
    };
  }
}

// Initialize Google Calendar API
export async function getGoogleCalendarClient(accessToken: string) {
  if (!accessToken) {
    throw new Error("Access token is required for Google Calendar API");
  }
  
  console.log("Initializing Google Calendar client with access token");
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return google.calendar({ version: 'v3', auth });
}

// Fetch events from Google Calendar
export async function fetchGoogleCalendarEvents(accessToken: string, timeMin?: Date, timeMax?: Date): Promise<Task[]> {
  try {
    console.log("Fetching Google Calendar events...");
    const calendar = await getGoogleCalendarClient(accessToken);
    
    const now = new Date();
    const oneMonthLater = new Date();
    oneMonthLater.setMonth(now.getMonth() + 1);
    
    const timeMinStr = timeMin ? formatISO(timeMin) : formatISO(now);
    const timeMaxStr = timeMax ? formatISO(timeMax) : formatISO(oneMonthLater);
    
    console.log(`Fetching events from ${timeMinStr} to ${timeMaxStr}`);
    
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: timeMinStr,
      timeMax: timeMaxStr,
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 100,
    });

    console.log(`Received ${response.data.items?.length || 0} events from Google Calendar`);
    
    if (!response.data.items || response.data.items.length === 0) {
      return [];
    }

    // Filter out events with no start date
    const validEvents = response.data.items.filter(event => {
      return (event.start?.dateTime || event.start?.date) && (event.end?.dateTime || event.end?.date);
    });

    if (validEvents.length < (response.data.items?.length || 0)) {
      console.log(`Filtered out ${(response.data.items?.length || 0) - validEvents.length} events with invalid dates`);
    }

    return validEvents.map(event => {
      try {
        return eventToTask(event as GoogleEvent);
      } catch (error) {
        console.error("Error processing event:", error, "Event:", event);
        return null;
      }
    }).filter(Boolean) as Task[];
  } catch (error) {
    console.error('Error fetching Google Calendar events:', error);
    
    // Show more detailed error information
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    // Return empty array rather than failing completely
    return [];
  }
}

// Create a new event in Google Calendar
export async function createGoogleCalendarEvent(accessToken: string, task: Task): Promise<Task | null> {
  try {
    console.log("Creating Google Calendar event:", task.title);
    const calendar = await getGoogleCalendarClient(accessToken);
    const event = taskToEvent(task);
    
    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event as any,
    });

    console.log("Event created successfully:", response.data.id);
    
    if (response.data) {
      return eventToTask(response.data as GoogleEvent);
    }
    
    return null;
  } catch (error) {
    console.error('Error creating Google Calendar event:', error);
    
    // Show more detailed error information
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    return null;
  }
}

// Update an existing event in Google Calendar
export async function updateGoogleCalendarEvent(accessToken: string, task: Task): Promise<Task | null> {
  try {
    console.log("Updating Google Calendar event:", task.id);
    const calendar = await getGoogleCalendarClient(accessToken);
    const event = taskToEvent(task);
    
    const response = await calendar.events.update({
      calendarId: 'primary',
      eventId: task.id,
      requestBody: event as any,
    });

    console.log("Event updated successfully");
    
    if (response.data) {
      return eventToTask(response.data as GoogleEvent);
    }
    
    return null;
  } catch (error) {
    console.error('Error updating Google Calendar event:', error);
    
    // Show more detailed error information
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    return null;
  }
}

// Delete an event from Google Calendar
export async function deleteGoogleCalendarEvent(accessToken: string, eventId: string): Promise<boolean> {
  try {
    console.log("Deleting Google Calendar event:", eventId);
    const calendar = await getGoogleCalendarClient(accessToken);
    
    await calendar.events.delete({
      calendarId: 'primary',
      eventId: eventId,
    });
    
    console.log("Event deleted successfully");
    return true;
  } catch (error) {
    console.error('Error deleting Google Calendar event:', error);
    
    // Show more detailed error information
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    return false;
  }
}