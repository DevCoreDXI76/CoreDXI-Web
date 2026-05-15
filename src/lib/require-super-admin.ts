import { auth } from "@/auth";

export type SuperAdminCheckResult =
  | { ok: true }
  | { ok: false; message: string };

export async function requireSuperAdmin(): Promise<SuperAdminCheckResult> {
  const session = await auth();

  if (
    session?.user?.accountType !== "admin" ||
    session.user.role !== "SUPER_ADMIN"
  ) {
    return { ok: false, message: "권한이 없습니다. SUPER_ADMIN만 실행할 수 있습니다." };
  }

  return { ok: true };
}
