/**
 * Centralized API type definitions
 */

// Standard API Response wrapper
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

// Pagination for API responses
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Session types
export interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: 'ADMIN' | 'USER';
}

export interface AuthenticatedSession {
  user: SessionUser;
  accessToken: string;
  error?: string | null;
}

// Gmail API types
export interface GmailEmailResponse {
  id: string;
  threadId: string;
  from: {
    name?: string;
    email: string;
  };
  to: string[];
  subject: string;
  snippet: string;
  body?: string;
  date: string;
  isRead: boolean;
  isStarred: boolean;
  hasAttachments: boolean;
  labels: string[];
  sizeEstimate: number;
}

export interface GmailListResponse extends ApiResponse<GmailEmailResponse[]> {
  nextPageToken?: string;
}

// Calendar API types
export interface CalendarEvent {
  id: string;
  title: string;
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
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus?: 'needsAction' | 'declined' | 'tentative' | 'accepted';
  }>;
  creator?: {
    email: string;
    displayName?: string;
  };
  organizer?: {
    email: string;
    displayName?: string;
  };
  status?: 'confirmed' | 'tentative' | 'cancelled';
  htmlLink?: string;
  hangoutLink?: string;
  recurringEventId?: string;
  originalStartTime?: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
}

export interface CalendarListResponse extends ApiResponse<CalendarEvent[]> {
  nextPageToken?: string;
  syncToken?: string;
}

// Drive API types
export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  createdTime: string;
  modifiedTime: string;
  webViewLink?: string;
  webContentLink?: string;
  thumbnailLink?: string;
  iconLink?: string;
  shared?: boolean;
  owners?: Array<{
    displayName: string;
    emailAddress: string;
    photoLink?: string;
  }>;
  parents?: string[];
  starred?: boolean;
  trashed?: boolean;
}

export interface DriveListResponse extends ApiResponse<DriveFile[]> {
  nextPageToken?: string;
}

// Banking/Transaction types
export interface BankTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'debit' | 'credit';
  category?: string;
  merchant?: string;
  account?: string;
  balance?: number;
  reference?: string;
}

export interface TransactionStats {
  totalIncome: number;
  totalExpenses: number;
  netAmount: number;
  transactionCount: number;
  averageTransaction: number;
  topCategories: Array<{
    category: string;
    amount: number;
    count: number;
  }>;
  monthlyTrend: Array<{
    month: string;
    income: number;
    expenses: number;
    net: number;
  }>;
}

export interface BankingResponse extends ApiResponse<BankTransaction[]> {
  stats?: TransactionStats;
}

// News API types
export interface NewsArticle {
  id: string;
  title: string;
  description?: string;
  content?: string;
  url: string;
  urlToImage?: string;
  publishedAt: string;
  source: {
    id?: string;
    name: string;
  };
  author?: string;
  category?: string;
  language?: string;
  country?: string;
}

export interface NewsResponse extends ApiResponse<NewsArticle[]> {
  totalResults?: number;
}

// Blog/Timeline types
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  tags?: string[];
  category?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  featured?: boolean;
  views?: number;
}

export interface TimelinePost {
  id: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  likes: number;
  commentsCount: number;
  isLiked?: boolean;
  comments?: Array<{
    id: string;
    content: string;
    createdAt: string;
    author: {
      id: string;
      name: string;
      avatar?: string;
    };
  }>;
}

// Settings types
export interface UserSettings {
  id: string;
  userId: string;
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    desktop: boolean;
    sound: boolean;
  };
  privacy: {
    profileVisible: boolean;
    activityVisible: boolean;
    emailVisible: boolean;
  };
  dashboard: {
    widgets: Array<{
      id: string;
      type: string;
      position: { x: number; y: number };
      size: { w: number; h: number };
      config: Record<string, unknown>;
      enabled: boolean;
    }>;
    layout: 'grid' | 'masonry' | 'list';
  };
}

// Error types
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
  path: string;
  method: string;
  statusCode: number;
}

// Request/Response utilities
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ApiRequestConfig {
  method: HttpMethod;
  headers?: Record<string, string>;
  body?: unknown;
  params?: Record<string, string | number | boolean>;
}

export interface ApiEndpoint {
  path: string;
  method: HttpMethod;
  auth?: boolean;
  rateLimit?: {
    max: number;
    windowMs: number;
  };
}