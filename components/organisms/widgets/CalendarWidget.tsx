'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { FiCalendar, FiClock, FiRefreshCw, FiUser } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { format, startOfDay, addDays, endOfDay } from 'date-fns';
import dynamic from 'next/dynamic';
import { useCalendar, CalendarEvent } from '@/hooks/queries/useCalendar';

const EventModal = dynamic(() => import('./EventModal'), { ssr: false });

// Internal event format with Date objects
interface CalendarEventUI extends Omit<CalendarEvent, 'startDate' | 'endDate'> {
  date: Date;
  endDate?: Date;
}

const CalendarWidget = React.memo(function CalendarWidget() {
  useSession(); // Needed to trigger re-render when session changes
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventUI | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Calculate time range for next 7 days
  const timeMin = useMemo(() => startOfDay(new Date()).toISOString(), []);
  const timeMax = useMemo(() => endOfDay(addDays(new Date(), 7)).toISOString(), []);

  // Use React Query hook for calendar events
  const { data: rawEvents = [], isLoading, error, refetch } = useCalendar({
    timeMin,
    timeMax,
  });

  // Parse date strings into Date objects
  const events: CalendarEventUI[] = useMemo(() => {
    return rawEvents.map((event) => ({
      ...event,
      date: new Date(event.startDate),
      endDate: event.endDate ? new Date(event.endDate) : undefined,
    }));
  }, [rawEvents]);

  // Get the next 5 upcoming events
  const upcomingEvents = useMemo(
    () => events.sort((a, b) => a.date.getTime() - b.date.getTime()).slice(0, 5),
    [events]
  );

  if (isLoading) {
    return (
      <div className="h-full backdrop-blur-xl bg-white/15 dark:bg-gray-900/15 border border-white/25 dark:border-gray-700/25 rounded-3xl shadow-2xl shadow-black/20 overflow-hidden flex flex-col">
        {/* Header with blue gradient for calendar */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-500/90 to-blue-600/90 backdrop-blur-sm text-white">
          <h3 className="text-lg font-medium tracking-wide flex items-center gap-2">
            <FiCalendar className="h-5 w-5" />
            Agenda
          </h3>
        </div>

        {/* Loading Content */}
        <div className="flex-1 px-6 py-4 bg-white/5 dark:bg-gray-900/5 backdrop-blur-sm">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white/20 dark:bg-gray-800/20 rounded-2xl p-4 backdrop-blur-sm border border-white/30 dark:border-gray-600/30">
                <div className="h-4 bg-white/30 dark:bg-gray-700/30 rounded-lg w-3/4 mb-2"></div>
                <div className="h-3 bg-white/20 dark:bg-gray-700/20 rounded-lg w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full backdrop-blur-xl bg-white/15 dark:bg-gray-900/15 border border-white/25 dark:border-gray-700/25 rounded-3xl shadow-2xl shadow-black/20 overflow-hidden flex flex-col">
        {/* Header with blue gradient for calendar */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-500/90 to-blue-600/90 backdrop-blur-sm text-white flex justify-between items-center">
          <h3 className="text-lg font-medium tracking-wide flex items-center gap-2">
            <FiCalendar className="h-5 w-5" />
            Agenda
          </h3>
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="text-white/90 hover:text-white hover:bg-white/20 p-2 rounded-full transition-all duration-300 disabled:opacity-50 cursor-pointer hover:scale-105"
          >
            <FiRefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Error Content */}
        <div className="flex-1 px-6 py-4 bg-white/5 dark:bg-gray-900/5 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-red-500/15 border border-red-400/30 text-red-600 dark:text-red-400 p-4 rounded-2xl backdrop-blur-sm">
            {error?.message || 'Failed to load calendar events'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full backdrop-blur-xl bg-white/15 dark:bg-gray-900/15 border border-white/25 dark:border-gray-700/25 rounded-3xl shadow-2xl shadow-black/20 overflow-hidden flex flex-col">
      {/* Header with blue gradient for calendar */}
      <div className="px-6 py-4 bg-gradient-to-r from-blue-500/90 to-blue-600/90 backdrop-blur-sm text-white flex justify-between items-center">
        <h3 className="text-lg font-medium tracking-wide flex items-center gap-2">
          <FiCalendar className="h-5 w-5" />
          Agenda
        </h3>
        <button
          onClick={() => refetch()}
          disabled={isLoading}
          className="text-white/90 hover:text-white hover:bg-white/20 p-2 rounded-full transition-all duration-300 disabled:opacity-50 cursor-pointer hover:scale-105"
        >
          <FiRefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 px-6 py-4 bg-white/5 dark:bg-gray-900/5 backdrop-blur-sm overflow-hidden flex flex-col">
        {upcomingEvents.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3">
            <div className="bg-blue-500/15 border border-blue-400/30 text-blue-600 dark:text-blue-400 p-6 rounded-2xl backdrop-blur-sm">
              <FiCalendar className="mx-auto mb-3 h-8 w-8" />
              <p className="font-medium mb-2">Geen komende events</p>
              <p className="text-sm">Je agenda is leeg voor de komende 7 dagen</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto space-y-3">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  className={`rounded-2xl p-4 backdrop-blur-sm border transition-all duration-300 hover:scale-[1.02] hover:shadow-lg cursor-pointer group ${
                    event.source === 'google'
                      ? 'bg-red-50/20 dark:bg-red-900/10 border-red-200/30 dark:border-red-700/30 hover:bg-red-100/30 dark:hover:bg-red-800/20'
                      : 'bg-white/20 dark:bg-gray-800/20 border-white/30 dark:border-gray-600/30 hover:bg-white/30 dark:hover:bg-gray-700/30'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex-1">
                        {event.title}
                      </h4>
                      {event.source === 'google' ? (
                        <FcGoogle className="w-4 h-4 flex-shrink-0" />
                      ) : (
                        <div className="flex items-center gap-1 text-blue-500">
                          <FiUser className="w-3 h-3" />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center text-xs text-gray-600 dark:text-gray-400 mb-2">
                      <FiClock className="mr-2 w-4 h-4 text-blue-500" />
                      <span>
                        {event.allDay
                          ? format(event.date, 'MMM d')
                          : `${format(event.date, 'MMM d')} at ${format(event.date, 'h:mm a')}`
                        }
                      </span>
                    </div>

                    {event.location && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center">
                        <span className="mr-1">📍</span>
                        {event.location}
                      </p>
                    )}

                    {event.source === 'local' && event.authorName && (
                      <p className="text-xs text-blue-500 dark:text-blue-400 mt-1 flex items-center gap-1">
                        <FiUser className="w-3 h-3" />
                        {event.authorName}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Footer with Material button */}
      <div className="px-6 py-4 bg-white/10 dark:bg-gray-800/15 backdrop-blur-sm border-t border-white/20 dark:border-gray-600/20">
        <Link
          href="/dashboard/agenda"
          className="block w-full text-center bg-blue-500/20 hover:bg-blue-500/30 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium py-3 px-4 rounded-2xl transition-all duration-300 hover:scale-[1.02] border border-blue-400/30 backdrop-blur-sm"
        >
          Bekijk volledige agenda
        </Link>
      </div>

      {/* Event Modal - only render after client-side hydration */}
      {isMounted && (
        <EventModal
          event={selectedEvent}
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
});

export default CalendarWidget;
