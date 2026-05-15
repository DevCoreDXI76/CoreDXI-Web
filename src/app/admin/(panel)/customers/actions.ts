"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/require-super-admin";

export async function updateCustomerName(
  id: string,
  name: string
): Promise<{ success: boolean; message: string }> {
  const guard = await requireSuperAdmin();
  if (!guard.ok) return { success: false, message: guard.message };

  const trimmed = name.trim();
  if (!trimmed) {
    return { success: false, message: "이름을 입력해 주세요." };
  }

  try {
    await prisma.user.update({
      where: { id },
      data: { name: trimmed },
    });

    revalidatePath("/admin/customers");
    revalidatePath(`/admin/customers/${id}`);
    revalidatePath(`/admin/customers/${id}/edit`);

    return { success: true, message: "이름이 수정되었습니다." };
  } catch (e) {
    console.error("[updateCustomerName]", e);
    return { success: false, message: "이름 수정 중 오류가 발생했습니다." };
  }
}

export async function deleteCustomer(
  id: string
): Promise<{ success: boolean; message: string }> {
  const guard = await requireSuperAdmin();
  if (!guard.ok) return { success: false, message: guard.message };

  try {
    await prisma.user.delete({ where: { id } });

    revalidatePath("/admin/customers");

    return { success: true, message: "사용자가 삭제되었습니다." };
  } catch (e) {
    console.error("[deleteCustomer]", e);
    return { success: false, message: "사용자 삭제 중 오류가 발생했습니다." };
  }
}
