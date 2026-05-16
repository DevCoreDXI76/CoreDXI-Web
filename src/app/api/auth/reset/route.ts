import { NextResponse } from "next/server";
import { authUrl } from "@/lib/auth-env";

const CALLBACK_COOKIE_NAMES = [
  "authjs.callback-url",
  "__Secure-authjs.callback-url",
  "__Host-authjs.callback-url",
  "next-auth.callback-url",
  "__Secure-next-auth.callback-url",
  "__Host-next-auth.callback-url",
] as const;

/** 잘못된 callbackUrl 쿠키 제거 후 로그인 페이지로 이동 */
export async function GET() {
  const base = authUrl ?? "https://www.coredxi.com";
  const response = NextResponse.redirect(new URL("/login", base));

  for (const name of CALLBACK_COOKIE_NAMES) {
    response.cookies.set(name, "", {
      maxAge: 0,
      path: "/",
    });
  }

  return response;
}
