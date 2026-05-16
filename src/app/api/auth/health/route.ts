import { NextResponse } from "next/server";
import {
  authSecret,
  authUrl,
  googleClientId,
  kakaoClientId,
  kakaoClientSecret,
} from "@/lib/auth-env";

/** 배포 환경 OAuth 설정 진단 (비밀값은 노출하지 않음) */
export async function GET() {
  return NextResponse.json({
    ok: Boolean(authSecret && authUrl && kakaoClientId && kakaoClientSecret),
    hasAuthSecret: Boolean(authSecret),
    hasAuthUrl: Boolean(authUrl),
    authUrl: authUrl ?? null,
    hasKakaoClientId: Boolean(kakaoClientId),
    hasKakaoClientSecret: Boolean(kakaoClientSecret),
    hasGoogleClientId: Boolean(googleClientId),
    vercel: process.env.VERCEL === "1",
    nodeEnv: process.env.NODE_ENV ?? null,
  });
}
