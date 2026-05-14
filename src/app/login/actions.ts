/**
 * login/actions.ts — 로그인 관련 Server Actions
 *
 * 관리자 이메일/비밀번호 로그인 후 미들웨어가 검사하는 세션 쿠키를 설정합니다.
 * (임시 방식: next-auth 도입 시 교체 예정)
 *
 * ── 변경 이력 ──────────────────────────────────────────────────────
 * v0.1  2026-05-14  adminLogin 추가 (bcrypt 검증 + 세션 쿠키)
 * ────────────────────────────────────────────────────────────────────
 */

"use server";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export type AdminLoginResult =
  | { success: true }
  | { success: false; message: string };

/**
 * 관리자 로그인 — DB의 bcrypt 비밀번호와 역할(SUPER_ADMIN / EDITOR)을 검증합니다.
 */
export async function adminLogin(
  email: string,
  password: string
): Promise<AdminLoginResult> {
  const trimmedEmail = email.trim();
  if (!trimmedEmail || !password) {
    return {
      success: false,
      message: "이메일과 비밀번호를 입력해 주세요.",
    };
  }

  const user = await prisma.user.findUnique({
    where: { email: trimmedEmail },
  });

  if (!user?.password) {
    return {
      success: false,
      message: "이메일 또는 비밀번호가 올바르지 않습니다.",
    };
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return {
      success: false,
      message: "이메일 또는 비밀번호가 올바르지 않습니다.",
    };
  }

  if (user.role === "VIEWER") {
    return {
      success: false,
      message: "관리자 권한이 없습니다.",
    };
  }

  const cookieStore = await cookies();
  cookieStore.set("next-auth.session-token", user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return { success: true };
}
