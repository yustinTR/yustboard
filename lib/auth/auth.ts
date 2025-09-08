/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaAdapter } from "@auth/prisma-adapter";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import prisma from "@/lib/database/prisma";
import { logger } from "@/lib/logger";
import type { NextAuthOptions } from "next-auth";

// Helper function to refresh Google access token
async function refreshAccessToken(token: any) {
  try {
    // Check if we have a refresh token
    if (!token.refreshToken) {
      logger.error("No refresh token available");
      throw new Error("No refresh token available");
    }

    const url = "https://oauth2.googleapis.com/token";
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID || "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
      grant_type: "refresh_token",
      refresh_token: token.refreshToken,
    });

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "POST",
      body: params.toString(),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      logger.error("Token refresh failed:", {
        status: response.status,
        statusText: response.statusText,
        error: refreshedTokens
      });
      
      // If refresh token is invalid, we need to re-authenticate
      if (refreshedTokens.error === 'invalid_grant') {
        logger.error("Refresh token is invalid or expired. User needs to re-authenticate.");
      }
      
      throw refreshedTokens;
    }

    logger.debug("Token refresh successful");

    // Update the token in the database
    if (token.userId) {
      try {
        await prisma.account.updateMany({
          where: {
            userId: token.userId,
            provider: "google",
          },
          data: {
            access_token: refreshedTokens.access_token,
            expires_at: Math.floor(Date.now() / 1000 + refreshedTokens.expires_in),
            refresh_token: refreshedTokens.refresh_token || token.refreshToken,
          },
        });
      } catch (dbError) {
        logger.error("Failed to update tokens in database:", dbError as Error);
      }
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken, // Fall back to old refresh token
    };
  } catch (error) {
    logger.error("Error refreshing access token", error as Error);

    // Return a token that will be invalidated
    return {
      ...token,
      error: "RefreshAccessTokenError",
      accessToken: null,
      refreshToken: null,
      accessTokenExpires: null,
    };
  }
}

// Log configuration only in development
logger.debug("NextAuth Config:", {
  googleId: process.env.GOOGLE_CLIENT_ID ? "Set" : "Not set",
  googleSecret: process.env.GOOGLE_CLIENT_SECRET ? "Set" : "Not set",
  nextAuthUrl: process.env.NEXTAUTH_URL,
  nextAuthSecret: process.env.NEXTAUTH_SECRET ? "Set" : "Not set",
});

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          scope: "openid email profile https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.metadata.readonly https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/fitness.activity.read https://www.googleapis.com/auth/fitness.body.read",
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          // Force refresh token on every login
          approval_prompt: "force"
        }
      },
      allowDangerousEmailAccountLinking: true,
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }: { user: any; account: any; profile?: any }) {
      logger.debug("SignIn callback:", { 
        user: user ? { id: user.id, name: user.name, email: user.email } : null,
        account: account ? { provider: account.provider, type: account.type } : null,
        profile: profile ? { email: profile.email } : null,
      });
      
      // Allow sign in regardless of whether the account is already linked
      return true;
    },
    async jwt({ token, user, account, trigger, session }: { token: any; user?: any; account?: any; trigger?: any; session?: any }) {
      // Initial sign in
      if (account && user) {
        logger.debug("JWT callback (initial sign in):", {
          provider: account.provider,
          accessToken: account.access_token ? "Provided" : "Missing",
          refreshToken: account.refresh_token ? "Provided" : "Missing",
          expiresAt: account.expires_at,
        });

        
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accessTokenExpires: account.expires_at ? account.expires_at * 1000 : undefined,
          userRole: "user",
          userId: user.id,
        };
      }

      // Handle updates
      if (trigger === 'update' && session) {
        return { ...token, ...session };
      }

      // Return previous token if the access token has not expired yet
      if (token.accessTokenExpires && Date.now() < token.accessTokenExpires) {
        logger.debug("JWT callback: Using existing token (not expired)");
        return token;
      }

      // Token is expired, try to refresh it
      logger.debug("JWT callback: Token expired, attempting refresh");
      const refreshResult = await refreshAccessToken(token);
      logger.debug("JWT callback: Refresh result:", { 
        hasError: !!refreshResult.error,
        error: refreshResult.error,
        hasAccessToken: !!refreshResult.accessToken 
      });
      return refreshResult;
    },
    async session({ session, token }: { session: any; token: any }) {
      // This is now always called with a token, not a user
      if (token) {
        logger.debug("Session callback with token:", { 
          userId: token.userId,
          accessToken: token.accessToken ? "Provided" : "Missing",
          error: token.error,
        });

        // Check if token refresh failed
        if (token.error === "RefreshAccessTokenError") {
          logger.debug("Session callback: RefreshAccessTokenError detected, clearing session");
          // Don't return null immediately - instead clear the session data 
          // and let the client handle the redirect
          session.error = "RefreshAccessTokenError";
          session.accessToken = null;
          return session;
        }

        // Add the access token and user ID to the session
        session.accessToken = token.accessToken;
        session.user.id = token.userId || token.sub;
        session.error = null; // Clear any previous errors
        
        // Fetch user role from database
        if (session.user.id) {
          try {
            const user = await prisma.user.findUnique({
              where: { id: session.user.id },
              select: { role: true }
            });
            session.user.role = user?.role || 'USER';
          } catch (dbError) {
            logger.error("Failed to fetch user role:", dbError as Error);
            session.user.role = 'USER';
          }
        }
      }
      
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login", // Error page
  },
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt" as const, // Important: use JWT strategy to make the token available
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  logger: {
    error(code: any, metadata: any) {
      logger.error(`NextAuth Error: ${code}`, metadata);
    },
    warn(code: any) {
      logger.warn(`NextAuth Warning: ${code}`, undefined);
    },
    debug(code: any, metadata: any) {
      logger.debug(`NextAuth Debug: ${code}`, metadata);
    },
  },
};