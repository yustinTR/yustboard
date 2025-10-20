import { auth } from "@/lib/auth/server";
import { NextResponse } from "next/server";

// Extended token type to include error property
interface ExtendedToken {
  error?: string;
  user?: {
    id: string;
    email?: string | null;
    authMethod?: string;
  };
}

export default auth((req) => {
  const token = req.auth as ExtendedToken | null;
  const pathname = req.nextUrl.pathname;

  console.log('🔍 Middleware check:', {
    pathname,
    hasToken: !!token,
    hasUser: !!token?.user,
    userId: token?.user?.id,
  });

  // Public routes that don't need authentication
  const publicRoutes = ['/login', '/register', '/verify-email', '/forgot-password', '/reset-password', '/onboarding', '/api/onboarding'];
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    console.log('✅ Public route, allowing access');
    return NextResponse.next();
  }

  if (!token) {
    console.log('❌ No token found, redirecting to login');
    // Redirect to sign in page if not authenticated
    const signInUrl = new URL("/login", req.url);
    signInUrl.searchParams.set("error", "SessionInvalid");
    return NextResponse.redirect(signInUrl);
  }

  // Check for refresh token errors
  if (token?.error === "RefreshAccessTokenError") {
    console.log('❌ Refresh token error, redirecting to login');
    // Redirect to sign in page if refresh failed
    const signInUrl = new URL("/login", req.url);
    signInUrl.searchParams.set("error", "RefreshAccessTokenError");
    return NextResponse.redirect(signInUrl);
  }

  // Check for Google API routes - only allow for OAuth users
  const googleApiRoutes = ['/api/gmail', '/api/calendar', '/api/drive', '/api/fitness', '/dashboard/mail', '/dashboard/agenda'];
  const isGoogleApiRoute = googleApiRoutes.some(route => pathname.startsWith(route));

  if (isGoogleApiRoute) {
    const authMethod = token?.user?.authMethod || 'CREDENTIALS';
    if (authMethod !== 'OAUTH') {
      console.log('❌ Credentials user accessing Google API route, blocking');
      // Return 403 for API routes
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Deze functie is alleen beschikbaar voor Google OAuth gebruikers' },
          { status: 403 }
        );
      }
      // Redirect to dashboard for page routes
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  console.log('✅ Token valid, allowing access');
  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/onboarding",
    "/api/onboarding",
    "/api/banking/:path*",
    "/api/calendar/:path*",
    "/api/drive/:path*",
    "/api/fitness/:path*",
    "/api/gmail/:path*",
    "/api/mail/:path*",
    "/api/timeline/:path*",
    "/api/admin/:path*",
    "/api/user/:path*",
    "/api/notifications/:path*",
    "/api/settings/:path*",
    "/api/organization/:path*",
  ],
};