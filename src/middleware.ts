/**
 * src/middleware.ts — 관리자 페이지(/admin/*) 접근 보호 미들웨어
 *
 * next-auth 쿠키(next-auth.session-token 또는 __Secure-next-auth.session-token)를
 * 확인하여, 로그인 세션이 없으면 /login 페이지로 리다이렉트합니다.
 *
 * [주의] 현재는 next-auth가 미설치 상태입니다.
 *        next-auth 설치 및 로그인 구현 후 이 미들웨어가 실제로 작동합니다.
 *        개발 중에는 /admin 경로에 직접 접근이 가능합니다.
 *
 * ── 변경 이력 ──────────────────────────────────────────────────────
 * v0.1  2026-05-14  최초 생성
 *       - /admin/* 경로 세션 쿠키 기반 보호
 *       - next-auth 설치 후 자동 작동하도록 설계
 * ────────────────────────────────────────────────────────────────────
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // next-auth 세션 쿠키 확인
  // HTTP 환경(개발): next-auth.session-token
  // HTTPS 환경(프로덕션): __Secure-next-auth.session-token
  const sessionToken =
    request.cookies.get("next-auth.session-token") ??
    request.cookies.get("__Secure-next-auth.session-token");

  // 세션 쿠키가 없으면 로그인 페이지로 리다이렉트
  if (!sessionToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

// /admin 경로 및 모든 하위 경로에 미들웨어 적용
export const config = {
  matcher: ["/admin/:path*"],
};
