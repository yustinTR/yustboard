import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/server';
import { Session } from 'next-auth';
import prisma from '@/lib/database/prisma';

type UserRole = 'USER' | 'AUTHOR' | 'ADMIN';

interface ApiUser {
  id: string;
  email: string | null;
  name: string | null;
  role: UserRole;
  image: string | null;
  accounts: {
    access_token: string | null;
    refresh_token: string | null;
    expires_at: number | null;
  }[];
}

export type ApiHandler = (req: NextRequest, context: ApiContext) => Promise<Response>;

export interface ApiContext {
  session: Session | null;
  user: ApiUser | null;
  params?: Record<string, string>;
}

export interface ApiMiddlewareOptions {
  requireAuth?: boolean;
  requireRoles?: string[];
  rateLimit?: {
    requests: number;
    windowMs: number;
  };
}

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function withApiMiddleware(
  handler: ApiHandler,
  options: ApiMiddlewareOptions = {}
) {
  const { requireAuth = true, requireRoles = [], rateLimit } = options;

  return async function middleware(
    req: NextRequest,
    context?: { params: Record<string, string> }
  ): Promise<Response> {
    try {
      // Rate limiting
      if (rateLimit) {
        const ip = req.headers.get('x-forwarded-for') || 'unknown';
        const key = `${ip}:${req.nextUrl.pathname}`;
        const now = Date.now();
        
        const limit = rateLimitStore.get(key);
        if (limit) {
          if (now < limit.resetTime) {
            if (limit.count >= rateLimit.requests) {
              return NextResponse.json(
                { error: 'Too many requests' },
                { status: 429 }
              );
            }
            limit.count++;
          } else {
            rateLimitStore.set(key, { count: 1, resetTime: now + rateLimit.windowMs });
          }
        } else {
          rateLimitStore.set(key, { count: 1, resetTime: now + rateLimit.windowMs });
        }
      }

      // Authentication
      let session = null;
      let user = null;

      if (requireAuth) {
        session = await getServerSession();
        
        if (!session?.user?.email) {
          return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
          );
        }

        // Get user from database
        user = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            image: true,
            accounts: {
              where: { provider: 'google' },
              select: {
                access_token: true,
                refresh_token: true,
                expires_at: true,
              },
            },
          },
        });

        if (!user) {
          return NextResponse.json(
            { error: 'User not found' },
            { status: 404 }
          );
        }

        // Role-based access control
        if (requireRoles.length > 0 && !requireRoles.includes(user.role)) {
          return NextResponse.json(
            { error: 'Forbidden - Insufficient permissions' },
            { status: 403 }
          );
        }
      }

      // Call the handler with context
      const apiContext: ApiContext = {
        session,
        user,
        params: context?.params,
      };

      return await handler(req, apiContext);
    } catch (error) {
      console.error('API Middleware Error:', error);
      
      return NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
      );
    }
  };
}

// Helper function to get Google tokens
export function getGoogleTokens(user: ApiUser | null) {
  const googleAccount = user?.accounts?.[0];
  
  if (!googleAccount?.access_token || !googleAccount?.refresh_token) {
    return null;
  }

  return {
    accessToken: googleAccount.access_token,
    refreshToken: googleAccount.refresh_token,
    expiresAt: googleAccount.expires_at,
  };
}

// Standard error responses
export const ApiError = {
  unauthorized: () => 
    NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
  
  forbidden: (message = 'Forbidden') => 
    NextResponse.json({ error: message }, { status: 403 }),
  
  notFound: (resource = 'Resource') => 
    NextResponse.json({ error: `${resource} not found` }, { status: 404 }),
  
  badRequest: (message = 'Bad request') => 
    NextResponse.json({ error: message }, { status: 400 }),
  
  serverError: (message = 'Internal server error') => 
    NextResponse.json({ error: message }, { status: 500 }),
};