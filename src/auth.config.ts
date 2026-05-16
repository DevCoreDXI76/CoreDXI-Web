/**
 * [OAuth 환경변수 — .env.local]
 * GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
 * KAKAO_CLIENT_ID, KAKAO_CLIENT_SECRET
 * NAVER_CLIENT_ID, NAVER_CLIENT_SECRET
 * AUTH_SECRET, AUTH_URL (또는 NEXTAUTH_URL)
 *
 * 콜백: {AUTH_URL}/api/auth/callback/google|kakao|naver
 */
import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Kakao from "next-auth/providers/kakao";
import Naver from "next-auth/providers/naver";
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
    Kakao({
      clientId: process.env.KAKAO_CLIENT_ID ?? "",
      clientSecret: process.env.KAKAO_CLIENT_SECRET ?? "",
    }),
    Naver({
      clientId: process.env.NAVER_CLIENT_ID ?? "",
      clientSecret: process.env.NAVER_CLIENT_SECRET ?? "",
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
