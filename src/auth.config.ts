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
import { sharedAuthCallbacks } from "@/lib/auth/callbacks";
import { mapKakaoProfile } from "@/lib/auth/kakao-profile";
import {
  resolveAuthSecretForNextAuth,
  googleClientId,
  googleClientSecret,
  kakaoClientId,
  kakaoClientSecret,
  naverClientId,
  naverClientSecret,
} from "@/lib/auth-env";

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
        url: "https://kauth.kakao.com/oauth/authorize",
        params: {
          scope: "profile_nickname profile_image account_email",
        },
      },
      profile(profile) {
        return mapKakaoProfile(profile);
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

const secret = resolveAuthSecretForNextAuth();

export default {
  trustHost: true,
  secret,
  debug: process.env.NODE_ENV === "development",
  pages: {
    signIn: "/login",
    /** /api/auth/error 500 방지 — 에러를 로그인 페이지로 보냄 */
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7,
  },
  providers,
  callbacks: sharedAuthCallbacks,
} satisfies NextAuthConfig;
