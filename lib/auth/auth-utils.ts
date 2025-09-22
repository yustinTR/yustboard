import { getServerSession } from "@/lib/auth/server";
import { NextResponse } from "next/server";

export async function getAuthenticatedSession() {
  const session = await getServerSession();
  
  if (!session) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      session: null,
    };
  }
  
  // Check if token refresh failed
  if ((session as any).error === "RefreshAccessTokenError") { // eslint-disable-line @typescript-eslint/no-explicit-any
    return {
      error: NextResponse.json({ error: "Token refresh failed. Please sign in again." }, { status: 401 }),
      session: null,
    };
  }
  
  // Check if access token exists
  if (!(session as any).accessToken) { // eslint-disable-line @typescript-eslint/no-explicit-any
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