import { auth } from "@/auth";
import type { Role } from "@/generated/prisma/client";

const ALLOWED: Role[] = ["SUPER_ADMIN", "EDITOR"];

export type BlogEditorCheckResult =
  | { ok: true }
  | { ok: false; message: string };

export async function requireBlogEditor(): Promise<BlogEditorCheckResult> {
  const session = await auth();

  if (session?.user?.accountType !== "admin" || !session.user.role) {
    return { ok: false, message: "관리자 로그인이 필요합니다." };
  }

  if (!ALLOWED.includes(session.user.role)) {
    return {
      ok: false,
      message: "블로그 편집 권한이 없습니다. EDITOR 이상만 사용할 수 있습니다.",
    };
  }

  return { ok: true };
}
