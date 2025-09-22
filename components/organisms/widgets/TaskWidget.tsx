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
    <div className="backdrop-blur-xl bg-white/15 dark:bg-gray-900/15 border border-white/25 dark:border-gray-700/25 rounded-3xl shadow-2xl shadow-black/20 overflow-hidden">
      {/* Header with green gradient for calendar/tasks */}
      <div className="px-6 py-4 bg-gradient-to-r from-green-500/90 to-emerald-500/90 backdrop-blur-sm text-white flex justify-between items-center">
        <h3 className="text-lg font-medium tracking-wide">Upcoming Events</h3>
        <a
          href="/dashboard/agenda"
          className="text-white/90 hover:text-white hover:bg-white/20 p-2 rounded-full transition-all duration-300 cursor-pointer hover:scale-105"
        >
          <FiPlus className="w-5 h-5" />
        </a>
      </div>

      {/* Content Area */}
      <div className="px-6 pb-4 bg-white/5 dark:bg-gray-900/5 backdrop-blur-sm">
        {loading ? (
          <div className="py-12 flex justify-center items-center">
            <FiLoader className="animate-spin h-8 w-8 text-green-500 mr-3" />
            <span className="text-gray-600 dark:text-gray-400 text-sm">Loading events...</span>
          </div>
        ) : error ? (
          <div className="bg-red-500/15 border border-red-400/30 text-red-600 dark:text-red-400 p-4 rounded-2xl mb-4 backdrop-blur-sm">
            {error}
          </div>
        ) : upcomingTasks.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8 text-sm">No upcoming events</p>
        ) : (
          <div className="space-y-3 pt-4">
            {upcomingTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => setSelectedTask(task)}
                className="relative p-4 rounded-2xl cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg backdrop-blur-sm border bg-white/20 dark:bg-gray-800/20 border-white/30 dark:border-gray-600/30 hover:bg-white/30 dark:hover:bg-gray-700/30"
              >
                {/* Event content */}
                <div>
                  <h4 className="font-semibold text-sm mb-2 text-gray-900 dark:text-gray-100 leading-snug">
                    {task.title}
                  </h4>

                  <div className="flex items-center text-xs text-gray-600 dark:text-gray-400 mb-2">
                    <FiClock className="mr-2 w-4 h-4 text-green-500" />
                    <span>
                      {format(task.date, 'MMM d')} at {format(task.date, 'h:mm a')}
                    </span>
                  </div>

                  {task.location && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center">
                      <span className="mr-1">📍</span>
                      {task.location}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer with Material button */}
      <div className="px-6 py-4 bg-white/10 dark:bg-gray-800/15 backdrop-blur-sm border-t border-white/20 dark:border-gray-600/20">
        <a
          href="/dashboard/agenda"
          className="block w-full text-center bg-green-500/20 hover:bg-green-500/30 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 text-sm font-medium py-3 px-4 rounded-2xl transition-all duration-300 hover:scale-[1.02] border border-green-400/30 backdrop-blur-sm"
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