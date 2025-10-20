/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/lib/database/prisma";
import { logger } from "@/lib/logger";
import type { NextAuthConfig } from "next-auth";

// Helper function to refresh Google access token
async function refreshAccessToken(token: any) {
  try {
    // Check if we have a refresh token
    if (!token.refreshToken) {
      logger.error("No refresh token available", { userId: token.userId });

      // Try to fetch refresh token from database as fallback
      if (token.userId) {
        try {
          const account = await prisma.account.findFirst({
            where: {
              userId: token.userId,
              provider: "google",
            },
            select: {
              refresh_token: true,
            },
          });

          if (account?.refresh_token) {
            logger.debug("Found refresh token in database");
            token.refreshToken = account.refresh_token;
          } else {
            logger.error("No refresh token found in database either");
            throw new Error("No refresh token available");
          }
        } catch (dbError) {
          logger.error("Failed to fetch refresh token from database:", dbError as Error);
          throw new Error("No refresh token available");
        }
      } else {
        throw new Error("No refresh token available");
      }
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
      accessToken: undefined,
      refreshToken: undefined,
      accessTokenExpires: undefined,
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

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email as string,
          },
        });

        if (!user || !user.password) {
          return null;
        }

        // Check if email is verified for credentials users
        if (user.authMethod === 'CREDENTIALS' && !user.emailVerified) {
          throw new Error('EMAIL_NOT_VERIFIED');
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          scope: "openid email profile https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.metadata.readonly https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/fitness.activity.read https://www.googleapis.com/auth/fitness.body.read",
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      },
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      logger.debug("SignIn callback:", {
        user: user ? { id: user.id, name: user.name, email: user.email } : null,
        account: account ? { provider: account.provider, type: account.type } : null,
        profile: profile ? { email: profile.email } : null,
      });

      // Update authMethod for OAuth users
      if (account?.provider === 'google' && user?.id) {
        await prisma.user.update({
          where: { id: user.id },
          data: { authMethod: 'OAUTH' }
        });
      }

      // Allow sign in regardless of whether the account is already linked
      return true;
    },
    async jwt({ token, user, account, trigger, session }) {
      // Initial sign in
      if (account && user) {
        logger.debug("JWT callback (initial sign in):", {
          provider: account.provider,
          accessToken: account.access_token ? "Provided" : "Missing",
          refreshToken: account.refresh_token ? "Provided" : "Missing",
          expiresAt: account.expires_at,
        });

        // Fetch user details from database during initial sign in
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: {
              role: true,
              organizationId: true,
              organizationRole: true,
              authMethod: true
            }
          });

          return {
            ...token,
            accessToken: account.access_token,
            refreshToken: account.refresh_token,
            accessTokenExpires: account.expires_at ? account.expires_at * 1000 : undefined,
            userRole: dbUser?.role || 'USER',
            userId: user.id,
            provider: account.provider, // Track which provider was used
            organizationId: dbUser?.organizationId,
            organizationRole: dbUser?.organizationRole,
            authMethod: dbUser?.authMethod || (account.provider === 'credentials' ? 'CREDENTIALS' : 'OAUTH'),
          };
        } catch (error) {
          logger.error("Failed to fetch user info during sign in:", error as Error);
          return {
            ...token,
            accessToken: account.access_token,
            refreshToken: account.refresh_token,
            accessTokenExpires: account.expires_at ? account.expires_at * 1000 : undefined,
            userRole: "user",
            userId: user.id,
            provider: account.provider,
          };
        }
      }

      // Handle updates (e.g., after onboarding or profile changes)
      if (trigger === 'update' && session) {
        // If there's a userId, fetch fresh data from database
        if (token.userId) {
          try {
            const dbUser = await prisma.user.findUnique({
              where: { id: token.userId as string },
              select: {
                role: true,
                organizationId: true,
                organizationRole: true,
                authMethod: true
              }
            });

            return {
              ...token,
              ...session,
              userRole: dbUser?.role || token.userRole,
              organizationId: dbUser?.organizationId,
              organizationRole: dbUser?.organizationRole,
              authMethod: dbUser?.authMethod || token.authMethod,
            };
          } catch (error) {
            logger.error("Failed to fetch user info during update:", error as Error);
            return { ...token, ...session };
          }
        }
        return { ...token, ...session };
      }

      // Skip token refresh logic for credentials users (they don't have OAuth tokens)
      if (token.provider === 'credentials') {
        logger.debug("JWT callback: Credentials user, skipping token refresh");
        return token;
      }

      // If no refresh token in JWT token but we have userId, try to fetch from database (OAuth users only)
      if (!token.refreshToken && token.userId) {
        try {
          const account = await prisma.account.findFirst({
            where: {
              userId: token.userId as string,
              provider: "google",
            },
            select: {
              refresh_token: true,
              access_token: true,
              expires_at: true,
            },
          });

          if (account?.refresh_token) {
            logger.debug("JWT callback: Found refresh token in database for existing session");
            token.refreshToken = account.refresh_token;
            // Also update access token and expiry if available
            if (account.access_token) {
              token.accessToken = account.access_token;
            }
            if (account.expires_at) {
              token.accessTokenExpires = account.expires_at * 1000;
            }
          }
        } catch (dbError) {
          logger.error("JWT callback: Failed to fetch tokens from database:", dbError as Error);
        }
      }

      // Return previous token if the access token has not expired yet (OAuth users only)
      if (token.accessTokenExpires && typeof token.accessTokenExpires === 'number' && Date.now() < token.accessTokenExpires) {
        logger.debug("JWT callback: Using existing token (not expired)");
        return token;
      }

      // Token is expired, try to refresh it (OAuth users only)
      if (token.refreshToken) {
        logger.debug("JWT callback: Token expired, attempting refresh");
        const refreshResult = await refreshAccessToken(token);
        logger.debug("JWT callback: Refresh result:", {
          hasError: !!refreshResult.error,
          error: refreshResult.error,
          hasAccessToken: !!refreshResult.accessToken
        });
        return refreshResult;
      }

      // No refresh token available, just return the current token
      return token;
    },
    async session({ session, token }) {
      // This is now always called with a token, not a user
      if (token) {
        logger.debug("Session callback with token:", {
          userId: token.userId,
          accessToken: token.accessToken ? "Provided" : "Missing",
          error: token.error,
          provider: token.provider,
        });

        // Check if token refresh failed (OAuth users only)
        if (token.error === "RefreshAccessTokenError" && token.provider !== 'credentials') {
          logger.debug("Session callback: RefreshAccessTokenError detected for OAuth user, clearing session");
          // Don't return null immediately - instead clear the session data
          // and let the client handle the redirect
          session.error = "RefreshAccessTokenError";
          session.accessToken = undefined;
          return session;
        }

        // Add data from token to session (no database calls here - edge runtime safe)
        session.accessToken = token.accessToken as string;
        session.user.id = (token.userId || token.sub) as string;
        session.user.role = (token.userRole as string) || 'USER';
        session.user.organizationId = token.organizationId as string | undefined;
        session.user.organizationRole = token.organizationRole as any;
        session.user.authMethod = (token.authMethod as any) || 'OAUTH';
        session.error = undefined; // Clear any previous errors

        logger.debug("Session callback returning:", {
          hasUser: !!session.user,
          userId: session.user.id,
          userRole: session.user.role,
          organizationId: session.user.organizationId,
          fullSession: JSON.stringify(session),
        });
      } else {
        logger.warn("Session callback called without token!");
      }

      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login", // Error page
  },
  debug: false, // Disable debug warnings in development
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt" as const, // Important: use JWT strategy to make the token available
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  // Add CSRF token options for better security
  useSecureCookies: process.env.NODE_ENV === 'production',
  cookies: {
    sessionToken: {
      name: `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
};

// Backward compatibility export
export const authOptions = authConfig;