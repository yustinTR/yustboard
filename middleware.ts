import { auth } from "@/lib/auth/server";
import { NextResponse } from "next/server";

export default auth((req) => {
  // Check if the session has a refresh error
  const token = req.auth;

  if (!token) {
    // Redirect to sign in page if not authenticated
    const signInUrl = new URL("/login", req.url);
    return NextResponse.redirect(signInUrl);
  }

  if (token?.error === "RefreshAccessTokenError") {
    // Redirect to sign in page if refresh failed
    const signInUrl = new URL("/login", req.url);
    signInUrl.searchParams.set("error", "RefreshAccessTokenError");
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

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