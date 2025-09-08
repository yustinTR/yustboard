import { format, isToday, isYesterday, parseISO } from 'date-fns';

/**
 * Format email date consistently for both server and client
 * Returns a stable string representation
 */
export function formatEmailDate(date: Date | string): string {
  // Ensure we have a consistent date object
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  // Use timestamp for comparison to avoid timezone issues
  const timestamp = dateObj.getTime();
  const now = new Date().getTime();
  const oneDayMs = 24 * 60 * 60 * 1000;
  
  // Check if today (within last 24 hours)
  if (now - timestamp < oneDayMs && new Date(timestamp).getDate() === new Date().getDate()) {
    return format(dateObj, 'HH:mm'); // 24-hour format to avoid AM/PM issues
  }
  
  // Check if yesterday
  if (now - timestamp < 2 * oneDayMs && new Date(timestamp).getDate() === new Date(now - oneDayMs).getDate()) {
    return 'Yesterday';
  }
  
  // Return consistent date format
  return format(dateObj, 'MMM d');
}

/**
 * Format relative time consistently
 */
export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const timestamp = dateObj.getTime();
  const now = new Date().getTime();
  const diffMs = now - timestamp;
  
  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);
  
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  
  return format(dateObj, 'MMM d');
}