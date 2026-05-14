/**
 * src/app/admin/page.tsx — /admin 진입점
 *
 * /admin 루트 경로는 /admin/users로 리다이렉트합니다.
 *
 * ── 변경 이력 ──────────────────────────────────────────────────────
 * v0.1  2026-05-14  최초 생성
 * ────────────────────────────────────────────────────────────────────
 */

import { redirect } from "next/navigation";

export default function AdminPage() {
  redirect("/admin/users");
}
