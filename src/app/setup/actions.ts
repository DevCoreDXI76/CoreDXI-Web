/**
 * 최초 1회 관리자 온보딩 — Admin 테이블에 SUPER_ADMIN 생성
 */

"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { Role } from "@/generated/prisma/client";

const BCRYPT_ROUNDS = 10;
const SETUP_LOCK_KEY = 872_014_001;

export type InitialSetupResult =
  | { success: true }
  | { success: false; message: string };

function verifySetupSecret(secretFromForm: string | undefined): boolean {
  const expected = process.env.SETUP_SECRET?.trim();
  if (!expected) return true;
  return !!secretFromForm && secretFromForm === expected;
}

export async function completeInitialSetup(data: {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
  setupSecret?: string;
}): Promise<InitialSetupResult> {
  if (!verifySetupSecret(data.setupSecret)) {
    return {
      success: false,
      message: "설정 토큰이 올바르지 않습니다. 환경 변수 SETUP_SECRET을 확인하세요.",
    };
  }

  const name = data.name.trim();
  const email = data.email.trim();
  const password = data.password;
  const passwordConfirm = data.passwordConfirm;

  if (!name || !email) {
    return { success: false, message: "이름과 이메일을 입력해 주세요." };
  }
  if (!email.includes("@")) {
    return { success: false, message: "유효한 이메일 주소를 입력해 주세요." };
  }
  if (password.length < 8) {
    return {
      success: false,
      message: "비밀번호는 8자 이상이어야 합니다.",
    };
  }
  if (password !== passwordConfirm) {
    return { success: false, message: "비밀번호가 서로 일치하지 않습니다." };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(
        "SELECT pg_advisory_xact_lock($1)",
        SETUP_LOCK_KEY
      );

      const adminCount = await tx.admin.count();
      if (adminCount > 0) {
        return { ok: false as const, message: "이미 초기 설정이 완료되었습니다." };
      }

      const existingUser = await tx.user.findUnique({ where: { email } });
      if (existingUser) {
        return {
          ok: false as const,
          message: "이미 일반 회원으로 등록된 이메일입니다. 다른 이메일을 사용해 주세요.",
        };
      }

      const hashed = await bcrypt.hash(password, BCRYPT_ROUNDS);

      await tx.admin.create({
        data: {
          name,
          email,
          role: Role.SUPER_ADMIN,
          password: hashed,
        },
      });

      return { ok: true as const };
    });

    if (!result.ok) {
      return { success: false, message: result.message };
    }
    return { success: true };
  } catch (e) {
    console.error("[completeInitialSetup]", e);
    return {
      success: false,
      message: "설정 저장 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
    };
  }
}
