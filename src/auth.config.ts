import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import type { Role } from "@/generated/prisma/client";

/**
 * Edge·미들웨어에서도 읽을 수 있는 NextAuth 공통 설정입니다.
 */
export default {
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7,
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;
        token.accountType =
          "accountType" in user && user.accountType
            ? user.accountType
            : "user";
        if ("role" in user && user.role) {
          token.role = user.role as Role;
        }
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.accountType = token.accountType as "user" | "admin";
        if (token.role) {
          session.user.role = token.role as Role;
        }
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
