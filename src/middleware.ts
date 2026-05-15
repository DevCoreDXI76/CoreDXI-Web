import NextAuth from "next-auth";
import authConfig from "@/auth.config";
import { NextResponse } from "next/server";

/** Edge: Prisma 없이 JWT만 검증 (auth.ts와 동일 secret·auth.config) */
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  if (!req.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  if (!req.auth) {
    const login = new URL("/login", req.url);
    login.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(login);
  }

  const role = req.auth.user?.role;
  if (role !== "SUPER_ADMIN" && role !== "EDITOR") {
    const login = new URL("/login", req.url);
    login.searchParams.set("error", "Forbidden");
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*"],
};
