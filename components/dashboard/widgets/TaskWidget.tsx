'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FiClock, FiPlus, FiLoader } from 'react-icons/fi';
import { format, startOfDay, addDays, endOfDay } from 'date-fns';
import { Task } from '@/utils/google-calendar';

export default function TaskWidget() {
  const { data: session, status } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch upcoming tasks from Google Calendar
  const fetchUpcomingTasks = async () => {
    try {
      setLoading(true);
      const timeMin = startOfDay(new Date()).toISOString();
      const timeMax = endOfDay(addDays(new Date(), 7)).toISOString(); // Next 7 days
      
      const res = await fetch(`/api/calendar?timeMin=${timeMin}&timeMax=${timeMax}`);
      
      if (!res.ok) {
        throw new Error('Failed to fetch calendar events');
      }
      
      const data = await res.json();
      // parse the date strings into Date objects
      const tasksWithDates: Task[] = data.map((t: { id: string; title: string; description?: string; date: string; endDate?: string; completed: boolean }) => ({
        ...t,
        date: new Date(t.date),
        endDate: t.endDate ? new Date(t.endDate) : undefined,
      }));
     setTasks(tasksWithDates);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to load your calendar events');
    } finally {
      setLoading(false);
    }
  };

  // Load tasks when the component mounts
  useEffect(() => {
    // Only fetch if authenticated and not using test credentials
    if (status === 'authenticated' && session?.accessToken) {
      fetchUpcomingTasks();
    } else if (status === 'authenticated') {
      // If using test credentials, load mock data
      setLoading(false);
      setTasks([
        { id: '1', title: 'Complete dashboard UI', date: new Date(2023, 5, 15), completed: false },
        { id: '2', title: 'Meeting with client', date: new Date(2023, 5, 16), completed: false },
        { id: '3', title: 'Submit project proposal', date: new Date(2023, 5, 17), completed: false },
      ]);
    }
  }, [status, session]);

  // Get the next 5 upcoming tasks
  const upcomingTasks = tasks
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 bg-blue-500 text-white flex justify-between items-center">
        <h3 className="font-medium">Upcoming Events</h3>
        <a href="/dashboard/agenda" className="p-1 rounded-full hover:bg-blue-400">
          <FiPlus />
        </a>
      </div>
      <div className="p-4">
        {loading ? (
          <div className="flex justify-center items-center py-4">
            <FiLoader className="animate-spin h-5 w-5 text-blue-500 mr-2" />
            <span className="text-gray-500">Loading events...</span>
          </div>
        ) : error ? (
          <p className="text-red-500 text-center py-4">{error}</p>
        ) : upcomingTasks.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No upcoming events</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {upcomingTasks.map((task) => (
              <li key={task.id} className="py-3">
                <div>
                  <p className="font-medium">{task.title}</p>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <FiClock className="mr-1" />
                    <span>
                      {format(task.date, 'MMM d')} at {format(task.date, 'h:mm a')}
                    </span>
                  </div>
                  {task.location && (
                    <p className="text-sm text-gray-500 mt-1">📍 {task.location}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="p-3 bg-gray-50 text-center">
        <a href="/dashboard/agenda" className="text-blue-500 hover:text-blue-600 text-sm font-medium">
          View all events
        </a>
      </div>
    </div>
  );
}