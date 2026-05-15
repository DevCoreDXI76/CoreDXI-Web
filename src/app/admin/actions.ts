"use server";

import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Role } from "@/generated/prisma/client";

export async function createAdmin(data: {
  name: string;
  email: string;
  role: Role;
}): Promise<{ success: boolean; message: string }> {
  try {
    const email = data.email.trim();

    const existingAdmin = await prisma.admin.findUnique({
      where: { email },
    });
    if (existingAdmin) {
      return {
        success: false,
        message: "이미 등록된 관리자 이메일 주소입니다.",
      };
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      return {
        success: false,
        message: "이미 일반 회원으로 등록된 이메일입니다.",
      };
    }

    const placeholderPassword = await bcrypt.hash(randomUUID(), 10);

    await prisma.admin.create({
      data: {
        name: data.name,
        email,
        role: data.role,
        password: placeholderPassword,
      },
    });

    revalidatePath("/admin/users");

    return {
      success: true,
      message: `${data.name}님이 ${data.role} 권한으로 등록되었습니다. (비밀번호는 별도 설정이 필요합니다)`,
    };
  } catch (error) {
    console.error("[createAdmin] 오류:", error);
    return {
      success: false,
      message: "관리자 등록 중 오류가 발생했습니다. 다시 시도해주세요.",
    };
  }
}

export async function updateUserRole(
  adminId: string,
  role: Role
): Promise<{ success: boolean; message: string }> {
  try {
    await prisma.admin.update({
      where: { id: adminId },
      data: { role },
    });

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
