import { NextResponse } from "next/server";
import {
  authSecret,
  authUrl,
  getEnabledOAuthProviders,
  getOAuthRedirectUris,
  googleClientId,
  kakaoClientId,
  kakaoClientSecret,
  maskClientId,
  naverClientId,
  naverClientSecret,
  readEnv,
} from "@/lib/auth-env";

/** 배포 환경 OAuth 설정 진단 (비밀값은 노출하지 않음) */
export async function GET() {
  const providers = getEnabledOAuthProviders();
  const redirectUris = getOAuthRedirectUris(authUrl);

  return NextResponse.json({
    ok: Boolean(authSecret && authUrl),
    hasAuthSecret: Boolean(authSecret),
    hasAuthUrl: Boolean(authUrl),
    authUrl: authUrl ?? null,
    redirectUris,
    googleClientIdHint: maskClientId(googleClientId),
    kakaoClientIdHint: maskClientId(kakaoClientId),
    providers,
    hasDatabaseUrl: Boolean(readEnv("DATABASE_URL")),
    hasKakaoClientId: Boolean(kakaoClientId),
    hasKakaoClientSecret: Boolean(kakaoClientSecret),
    hasGoogleClientId: Boolean(googleClientId),
    hasNaverClientId: Boolean(naverClientId),
    hasNaverClientSecret: Boolean(naverClientSecret),
    vercel: process.env.VERCEL === "1",
    nodeEnv: process.env.NODE_ENV ?? null,
  });
}
