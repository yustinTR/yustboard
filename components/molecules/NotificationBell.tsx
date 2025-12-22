'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { FiBell, FiCheck, FiWifi, FiWifiOff } from 'react-icons/fi';
import { createPortal } from 'react-dom';
import { formatDistanceToNow } from 'date-fns';
import { nl } from 'date-fns/locale';
import Link from 'next/link';
import { useRealtimeNotifications } from '@/hooks/queries/useRealtimeNotifications';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  readAt: Date | null;
  createdAt: Date;
}

export default function NotificationBell() {
  const { data: session } = useSession();
  const [showDropdown, setShowDropdown] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [buttonRect, setButtonRect] = useState<DOMRect | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Use Realtime-enabled notifications hook
  const {
    notifications,
    unreadCount,
    isLoading,
    isUsingRealtime,
    markAsRead,
    markAllAsRead,
  } = useRealtimeNotifications({ limit: 10 });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      const isButtonClick = buttonRef.current?.contains(target);
      const isDropdownClick = showDropdown && event.target &&
        (event.target as Element).closest('[data-notification-dropdown]');

      if (!isButtonClick && !isDropdownClick) {
        setShowDropdown(false);
      }
    }

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showDropdown]);

  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  if (!session?.user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={buttonRef}
        onClick={() => {
          setShowDropdown(!showDropdown);
          if (buttonRef.current) {
            setButtonRect(buttonRef.current.getBoundingClientRect());
          }
        }}
        className="relative w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/20 dark:hover:bg-gray-800/20 transition-colors backdrop-blur-sm"
        aria-label="Notifications"
      >
        <FiBell className="h-5 w-5 text-gray-700 dark:text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
        {/* Realtime connection indicator */}
        {isUsingRealtime && (
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border border-white dark:border-gray-900" title="Real-time verbonden" />
        )}
      </button>

      {/* Dropdown - render via portal */}
      {mounted && showDropdown && buttonRect && createPortal(
        <div
          data-notification-dropdown
          className="fixed backdrop-blur-md bg-white/90 dark:bg-gray-900/90 border border-white/20 dark:border-gray-700/30 rounded-xl shadow-xl shadow-black/10 z-[10000]"
          style={{
            top: buttonRect.bottom + 8,
            right: window.innerWidth - buttonRect.right,
            width: '400px',
            maxHeight: '600px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10 dark:border-gray-700/30">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Notificaties</h3>
              {isUsingRealtime ? (
                <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400" title="Real-time updates actief">
                  <FiWifi className="h-3 w-3" />
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs text-gray-400" title="Polling modus">
                  <FiWifiOff className="h-3 w-3" />
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <FiCheck className="h-4 w-4" />
                Alles gelezen
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {isLoading ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-blue-500 mx-auto mb-2" />
                Laden...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                Geen notificaties
              </div>
            ) : (
              notifications.map((notification: Notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-white/10 dark:border-gray-700/30 hover:bg-white/20 dark:hover:bg-gray-800/20 transition-colors ${
                    !notification.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                  }`}
                >
                  {notification.link ? (
                    <Link
                      href={notification.link}
                      onClick={() => {
                        if (!notification.read) handleMarkAsRead(notification.id);
                        setShowDropdown(false);
                      }}
                      className="block"
                    >
                      <NotificationContent notification={notification} />
                    </Link>
                  ) : (
                    <div
                      onClick={() => {
                        if (!notification.read) handleMarkAsRead(notification.id);
                      }}
                      className="cursor-pointer"
                    >
                      <NotificationContent notification={notification} />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

function NotificationContent({ notification }: { notification: Notification }) {
  return (
    <>
      <div className="flex items-start justify-between gap-2 mb-1">
        <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">
          {notification.title}
        </h4>
        {!notification.read && (
          <span className="w-2 h-2 bg-blue-500 rounded-full mt-1 flex-shrink-0" />
        )}
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-1">
        {notification.message}
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-500">
        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: nl })}
      </p>
    </>
  );
}
