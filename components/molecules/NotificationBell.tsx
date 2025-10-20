'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { FiBell, FiCheck } from 'react-icons/fi';
import { createPortal } from 'react-dom';
import { formatDistanceToNow } from 'date-fns';
import { nl } from 'date-fns/locale';
import Link from 'next/link';

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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [buttonRect, setButtonRect] = useState<DOMRect | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch notifications
  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchNotifications = async () => {
      try {
        const response = await fetch('/api/notifications?limit=10');
        if (response.ok) {
          const data = await response.json();
          setNotifications(data.notifications || []);
          setUnreadCount(data.unreadCount || 0);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();

    // Poll every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [session]);

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

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
      });

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, read: true, readAt: new Date() } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications', { method: 'POST' });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true, readAt: new Date() })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
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
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Notificaties</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <FiCheck className="h-4 w-4" />
                Alles gelezen
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                Geen notificaties
              </div>
            ) : (
              notifications.map((notification) => (
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
                        if (!notification.read) markAsRead(notification.id);
                        setShowDropdown(false);
                      }}
                      className="block"
                    >
                      <NotificationContent notification={notification} />
                    </Link>
                  ) : (
                    <div
                      onClick={() => {
                        if (!notification.read) markAsRead(notification.id);
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
