import { DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's id. */
      id: string;
      /** The user's role. */
      role?: string;
    } & DefaultSession["user"];
    
    /** Access token for Google API or other providers */
    accessToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    /** The user's role. */
    userRole?: string;
    /** The user's ID. */
    userId?: string;
    /** The user's access token. */
    accessToken?: string;
    /** The user's refresh token. */
    refreshToken?: string;
    /** When the access token expires. */
    accessTokenExpires?: number;
  }
}