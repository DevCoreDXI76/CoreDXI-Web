/**
 * [OAuth 환경변수 — .env.local / Vercel]
 * GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
 * KAKAO_CLIENT_ID, KAKAO_CLIENT_SECRET
 * NAVER_CLIENT_ID, NAVER_CLIENT_SECRET
 * AUTH_SECRET (또는 NEXTAUTH_SECRET — 하나만, 동일 값)
 * AUTH_URL (또는 NEXTAUTH_URL) = https://www.coredxi.com
 *
 * 콜백: {AUTH_URL}/api/auth/callback/google|kakao|naver
 */
import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Kakao from "next-auth/providers/kakao";
import Naver from "next-auth/providers/naver";
import type { Role } from "@/generated/prisma/client";
import {
  authSecret,
  authUrl,
  googleClientId,
  googleClientSecret,
  kakaoClientId,
  kakaoClientSecret,
  naverClientId,
  naverClientSecret,
} from "@/lib/auth-env";

// Vercel에 https:// 없이 저장된 AUTH_URL이 있으면 Auth.js new URL()이 실패합니다.
if (authUrl) {
  process.env.AUTH_URL = authUrl;
  process.env.NEXTAUTH_URL = authUrl;
}

/**
 * Edge·미들웨어에서도 읽을 수 있는 NextAuth 공통 설정입니다.
 */
const providers: NextAuthConfig["providers"] = [];

if (googleClientId && googleClientSecret) {
  providers.push(
    Google({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    })
  );
}

if (kakaoClientId && kakaoClientSecret) {
  providers.push(
    Kakao({
      clientId: kakaoClientId,
      clientSecret: kakaoClientSecret,
      authorization: {
        params: {
          scope: "profile_nickname profile_image account_email",
        },
      },
    })
  );
}

if (naverClientId && naverClientSecret) {
  providers.push(
    Naver({
      clientId: naverClientId,
      clientSecret: naverClientSecret,
    })
  );
}

export default {
  trustHost: true,
  ...(authSecret ? { secret: authSecret } : {}),
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7,
  },
  providers,
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
