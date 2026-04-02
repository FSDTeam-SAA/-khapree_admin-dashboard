import axios from "axios";
import type { NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import { API_BASE_URL } from "@/lib/env";
import type { ApiResponse, LoginData } from "@/types/api";

type TokenPayload = {
  exp?: number;
};

const parseJwtExpiry = (token: string) => {
  try {
    const payload = token.split(".")[1];
    if (!payload) return Date.now() + 15 * 60 * 1000;
    const decoded = JSON.parse(
      Buffer.from(payload, "base64").toString("utf8"),
    ) as TokenPayload;

    if (!decoded.exp) return Date.now() + 15 * 60 * 1000;
    return decoded.exp * 1000;
  } catch {
    return Date.now() + 15 * 60 * 1000;
  }
};

const refreshAccessToken = async (token: JWT): Promise<JWT> => {
  try {
    const refreshToken = token.refreshToken;
    if (!refreshToken) {
      return { ...token, error: "RefreshAccessTokenError" };
    }

    const response = await axios.post<
      ApiResponse<{ accessToken: string; refreshToken: string }>
    >(`${API_BASE_URL}/auth/refresh-token`, { refreshToken });

    const refreshed = response.data.data;
    return {
      ...token,
      accessToken: refreshed.accessToken,
      refreshToken: refreshed.refreshToken,
      accessTokenExpires: parseJwtExpiry(refreshed.accessToken),
      error: undefined,
    };
  } catch {
    return { ...token, error: "RefreshAccessTokenError" };
  }
};

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim();
        const password = credentials?.password?.trim();

        if (!email || !password) {
          throw new Error("Email and password are required");
        }

        const response = await axios.post<ApiResponse<LoginData>>(
          `${API_BASE_URL}/auth/login`,
          { email, password },
        );

        const payload = response.data.data;

        if (!payload?.accessToken) {
          throw new Error("Invalid login response");
        }

        if (payload.role !== "admin") {
          throw new Error("Only admin users can sign in");
        }

        return {
          id: payload._id,
          _id: payload._id,
          name: payload.user?.name || "Admin",
          email: payload.user?.email || email,
          role: payload.role,
          accessToken: payload.accessToken,
          refreshToken: payload.refreshToken,
          accessTokenExpires: parseJwtExpiry(payload.accessToken),
          avatar: payload.user?.avatar,
          user: payload.user as unknown as Record<string, unknown>,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          accessTokenExpires: user.accessTokenExpires,
          role: user.role,
          _id: user._id,
          user: user.user,
          avatar: user.avatar,
        };
      }

      if (
        token.accessToken &&
        token.accessTokenExpires &&
        Date.now() < token.accessTokenExpires - 30_000
      ) {
        return token;
      }

      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.accessTokenExpires = token.accessTokenExpires;
      session.role = token.role;
      session._id = token._id;
      session.error = token.error;

      if (session.user) {
        session.user.name = (token.user?.name as string) || session.user.name;
        session.user.email =
          (token.user?.email as string) || session.user.email || "";
        session.user.avatar = token.avatar;
        session.user.raw = token.user;
      }

      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

