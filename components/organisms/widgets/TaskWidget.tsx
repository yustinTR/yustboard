'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FiClock, FiPlus, FiLoader } from 'react-icons/fi';
import { format, startOfDay, addDays, endOfDay } from 'date-fns';
import { Task } from '@/utils/google/google-calendar';
import dynamic from 'next/dynamic';

const EventModal = dynamic(() => import('./EventModal'), { ssr: false });

const TaskWidget = React.memo(function TaskWidget() {
  const { data: session, status } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
    <div className="backdrop-blur-md bg-white/10 dark:bg-gray-900/10 border border-white/20 dark:border-gray-700/30 rounded-xl shadow-xl shadow-black/10 overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-green-500/80 to-green-600/80 backdrop-blur-sm text-white flex justify-between items-center">
        <h3 className="font-medium">Upcoming Events</h3>
        <a href="/dashboard/agenda" className="p-1.5 rounded-lg hover:bg-white/10 transition-all duration-200">
          <FiPlus className="w-4 h-4" />
        </a>
      </div>
      <div className="p-4 bg-white/5 backdrop-blur-sm">
        {loading ? (
          <div className="flex justify-center items-center py-4">
            <FiLoader className="animate-spin h-5 w-5 text-green-500 mr-2" />
            <span className="text-gray-600 dark:text-gray-400">Loading events...</span>
          </div>
        ) : error ? (
          <p className="text-red-500 text-center py-4">{error}</p>
        ) : upcomingTasks.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400 text-center py-4">No upcoming events</p>
        ) : (
          <ul className="divide-y divide-white/10 dark:divide-gray-700/30">
            {upcomingTasks.map((task) => (
              <li 
                key={task.id} 
                className="py-3 hover:bg-white/5 dark:hover:bg-gray-800/20 rounded-lg px-2 transition-all duration-200 cursor-pointer"
                onClick={() => setSelectedTask(task)}
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{task.title}</p>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mt-1">
                    <FiClock className="mr-1 w-3 h-3" />
                    <span>
                      {format(task.date, 'MMM d')} at {format(task.date, 'h:mm a')}
                    </span>
                  </div>
                  {task.location && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">📍 {task.location}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="p-3 bg-white/5 dark:bg-gray-800/20 backdrop-blur-sm border-t border-white/10 dark:border-gray-700/30 text-center">
        <a 
          href="/dashboard/agenda" 
          className="text-green-500 hover:text-green-400 text-sm font-medium flex items-center justify-center hover:bg-white/10 dark:hover:bg-gray-800/20 px-3 py-1 rounded-lg transition-all duration-200"
        >
          View all events
        </a>
      </div>

      {/* Event Modal - only render after client-side hydration */}
      {isMounted && (
        <EventModal
          event={selectedTask}
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
});

export default TaskWidget;