import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth";
import { NextResponse } from "next/server";

export async function getAuthenticatedSession() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      session: null,
    };
  }
  
  // Check if token refresh failed
  if ((session as Record<string, unknown>).error === "RefreshAccessTokenError") {
    return {
      error: NextResponse.json({ error: "Token refresh failed. Please sign in again." }, { status: 401 }),
      session: null,
    };
  }
  
  // Check if access token exists
  if (!(session as Record<string, unknown>).accessToken) {
    return {
      error: NextResponse.json({ error: "No access token available" }, { status: 401 }),
      session: null,
    };
  }
  
  return {
    error: null,
    session,
  };
}