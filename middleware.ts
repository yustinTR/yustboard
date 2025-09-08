import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Check if the session has a refresh error
    const token = req.nextauth.token;
    
    if (token?.error === "RefreshAccessTokenError") {
      // Redirect to sign in page if refresh failed
      const signInUrl = new URL("/login", req.url);
      signInUrl.searchParams.set("error", "RefreshAccessTokenError");
      return NextResponse.redirect(signInUrl);
    }
    
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/banking/:path*",
    "/api/calendar/:path*",
    "/api/drive/:path*",
    "/api/fitness/:path*",
    "/api/gmail/:path*",
    "/api/mail/:path*",
    "/api/timeline/:path*",
    "/api/admin/:path*",
  ],
};