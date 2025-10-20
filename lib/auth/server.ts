import NextAuth from "next-auth";
import { authConfig } from "./auth";
import { headers } from "next/headers";

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

// Backward compatibility - provide getServerSession function
// In NextAuth v5, auth() needs to be called differently in API routes vs pages
export async function getServerSession() {
  try {
    // Get headers to ensure we're in the right context
    await headers();

    // Call auth() which will use the request context
    const session = await auth();

    console.log('🔑 getServerSession called:', {
      hasSession: !!session,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
    });

    return session;
  } catch (error) {
    console.error('❌ getServerSession error:', error);
    return null;
  }
}