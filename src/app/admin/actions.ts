/**
 * src/app/admin/actions.ts — 관리자 관련 Server Actions
 *
 * Server Actions는 클라이언트 컴포넌트에서 서버(DB) 작업을 직접 호출할 수 있게 해줍니다.
 * 이 파일에서는 관리자 등록(createAdmin)과 권한 변경(updateUserRole)을 처리합니다.
 *
 * ── 변경 이력 ──────────────────────────────────────────────────────
 * v0.1  2026-05-14  최초 생성
 *       - createAdmin: 새 관리자 계정 DB 저장
 *       - updateUserRole: 기존 사용자 권한 등급 변경
 * ────────────────────────────────────────────────────────────────────
 */

"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Role } from "@/generated/prisma/client";

// =====================================================
// createAdmin — 새 관리자 등록
// 이름, 이메일, 권한 등급을 받아 User 테이블에 저장합니다.
// 이미 존재하는 이메일이면 에러를 반환합니다.
// =====================================================
export async function createAdmin(data: {
  name: string;
  email: string;
  role: Role;
}): Promise<{ success: boolean; message: string }> {
  try {
    // 이미 등록된 이메일인지 확인
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      return {
        success: false,
        message: "이미 등록된 이메일 주소입니다.",
      };
    }

    // 새 관리자 계정 생성
    await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        role: data.role,
      },
    });

    // 관리자 목록 페이지 캐시 무효화 → 새 데이터가 즉시 반영됨
    revalidatePath("/admin/users");

    return {
      success: true,
      message: `${data.name}님이 ${data.role} 권한으로 등록되었습니다.`,
    };
  } catch (error) {
    console.error("[createAdmin] 오류:", error);
    return {
      success: false,
      message: "관리자 등록 중 오류가 발생했습니다. 다시 시도해주세요.",
    };
  }
}

// =====================================================
// updateUserRole — 관리자 권한 등급 변경
// userId에 해당하는 사용자의 role을 새 값으로 업데이트합니다.
// =====================================================
export async function updateUserRole(
  userId: string,
  role: Role
): Promise<{ success: boolean; message: string }> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    // 관리자 목록 페이지 캐시 무효화
    revalidatePath("/admin/users");

    return {
      success: true,
      message: "권한이 변경되었습니다.",
    };
  } catch (error) {
    console.error("[updateUserRole] 오류:", error);
    return {
      success: false,
      message: "권한 변경 중 오류가 발생했습니다.",
    };
  }
}
