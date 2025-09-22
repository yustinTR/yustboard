'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiX, FiCalendar, FiClock, FiMapPin, FiUsers, FiShare2, FiExternalLink, FiEdit } from 'react-icons/fi';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

interface EventDetails {
  id: string;
  title: string;
  description?: string;
  date: Date;
  endDate?: Date;
  location?: string;
  completed: boolean;
  attendees?: string[];
  organizer?: string;
  url?: string;
}

interface EventModalProps {
  event: EventDetails | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function EventModal({ event, isOpen, onClose }: EventModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    if (isOpen && event) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, event, mounted]);

  const handleShare = async () => {
    if (navigator.share && event) {
      try {
        await navigator.share({
          title: event.title,
          text: event.description || '',
          url: event.url || window.location.href,
        });
      } catch {
        // Fallback to clipboard
        navigator.clipboard.writeText(`${event.title} - ${format(event.date, 'PPP p', { locale: nl })}`);
      }
    } else if (event) {
      navigator.clipboard.writeText(`${event.title} - ${format(event.date, 'PPP p', { locale: nl })}`);
    }
  };

  const openInCalendar = () => {
    if (event?.url) {
      window.open(event.url, '_blank');
    } else {
      // Open in Google Calendar with event details
      const startDate = event?.date ? format(event.date, "yyyyMMdd'T'HHmmss") : '';
      const endDate = event?.endDate ? format(event.endDate, "yyyyMMdd'T'HHmmss") : '';
      const title = encodeURIComponent(event?.title || '');
      const description = encodeURIComponent(event?.description || '');
      const location = encodeURIComponent(event?.location || '');
      
      const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate}/${endDate}&details=${description}&location=${location}`;
      window.open(googleCalendarUrl, '_blank');
    }
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isTomorrow = (date: Date) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return date.toDateString() === tomorrow.toDateString();
  };

  const getEventStatus = () => {
    if (!event) return '';
    
    const now = new Date();
    const eventEnd = event.endDate || event.date;
    
    if (eventEnd < now) {
      return 'Afgelopen';
    } else if (event.date <= now && eventEnd >= now) {
      return 'Bezig';
    } else {
      return 'Gepland';
    }
  };

  const getStatusColor = () => {
    const status = getEventStatus();
    switch (status) {
      case 'Afgelopen':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
      case 'Bezig':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Gepland':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  // Don't render anything on server or if not mounted
  if (!mounted || !isOpen || !event) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999]  flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl shadow-black/20 border overflow-hidden border-white/25 dark:border-gray-700/25 animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="relative p-6 border-b border-white/20 dark:border-gray-700/30 bg-gradient-to-r from-green-500/80 to-green-600/80 backdrop-blur-sm text-white rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                <FiCalendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white/80 dark:text-gray-100">
                  Event Details
                </h2>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getStatusColor()}`}>
                  {getEventStatus()}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleShare}
                className="p-2 text-white/80 hover:text-white hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg transition-all duration-300 hover:scale-105"
                title="Share event"
              >
                <FiShare2 className="w-5 h-5" />
              </button>

              <button
                onClick={openInCalendar}
                className="p-2 text-white/80 hover:text-white hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg transition-all duration-300 hover:scale-105"
                title="Open in calendar"
              >
                <FiExternalLink className="w-5 h-5" />
              </button>

              <button
                onClick={onClose}
                className="p-2 text-white/80 hover:text-white hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg transition-all duration-300 hover:scale-105"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 bg-white/5 dark:bg-gray-900/5 backdrop-blur-sm">
          <div className="space-y-6">
            {/* Event title */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
                {event.title}
              </h1>
            </div>

            {/* Date and time info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm rounded-lg border border-white/10 dark:border-gray-700/20">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <FiCalendar className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {isToday(event.date) ? 'Vandaag' : 
                       isTomorrow(event.date) ? 'Morgen' : 
                       format(event.date, 'EEEE d MMMM yyyy', { locale: nl })}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {format(event.date, 'PPP', { locale: nl })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm rounded-lg border border-white/10 dark:border-gray-700/20">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <FiClock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {format(event.date, 'HH:mm', { locale: nl })}
                      {event.endDate && ` - ${format(event.endDate, 'HH:mm', { locale: nl })}`}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {event.endDate ? (
                        <>
                          Duur: {Math.round((event.endDate.getTime() - event.date.getTime()) / (1000 * 60))} min
                        </>
                      ) : (
                        'Tijd'
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {event.location && (
                  <div className="flex items-center space-x-3 p-3 bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm rounded-lg border border-white/10 dark:border-gray-700/20">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                      <FiMapPin className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {event.location}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Locatie</p>
                    </div>
                  </div>
                )}

                {event.organizer && (
                  <div className="flex items-center space-x-3 p-3 bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm rounded-lg border border-white/10 dark:border-gray-700/20">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                      <FiUsers className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {event.organizer}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Organisator</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {event.description && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Beschrijving
                </h3>
                <div className="prose prose-gray dark:prose-invert max-w-none">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {event.description}
                  </p>
                </div>
              </div>
            )}

            {/* Attendees */}
            {event.attendees && event.attendees.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Deelnemers ({event.attendees.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {event.attendees.map((attendee, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                    >
                      {attendee}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-white/20 dark:border-gray-700/30 bg-white/5 dark:bg-gray-800/15 backdrop-blur-sm flex-shrink-0">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <button
                onClick={handleShare}
                className="flex items-center justify-center space-x-2 px-4 py-2 bg-white/20 dark:bg-gray-800/20 hover:bg-white/30 dark:hover:bg-gray-700/30 text-gray-700 dark:text-gray-300 rounded-2xl transition-all duration-300 hover:scale-[1.02] backdrop-blur-sm border border-white/30 dark:border-gray-600/30 flex-1 sm:flex-none"
              >
                <FiShare2 className="w-4 h-4" />
                <span>Delen</span>
              </button>

              <button
                onClick={openInCalendar}
                className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 rounded-2xl transition-all duration-300 hover:scale-[1.02] backdrop-blur-sm border border-green-400/30 flex-1 sm:flex-none"
              >
                <FiEdit className="w-4 h-4" />
                <span className="hidden sm:inline">Openen in agenda</span>
                <span className="sm:hidden">Agenda</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Only create portal if we have access to document (client-side)
  if (typeof document === 'undefined') return null;
  
  return createPortal(modalContent, document.body);
}