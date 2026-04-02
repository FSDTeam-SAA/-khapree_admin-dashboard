import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    role?: "admin" | "user";
    _id?: string;
    user: DefaultSession["user"] & {
      avatar?: {
        public_id?: string;
        url?: string;
      };
      raw?: Record<string, unknown>;
    };
    error?: "RefreshAccessTokenError";
  }

  interface User {
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    role?: "admin" | "user";
    _id?: string;
    user?: Record<string, unknown>;
    avatar?: {
      public_id?: string;
      url?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    role?: "admin" | "user";
    _id?: string;
    user?: Record<string, unknown>;
    avatar?: {
      public_id?: string;
      url?: string;
    };
    error?: "RefreshAccessTokenError";
  }
}

