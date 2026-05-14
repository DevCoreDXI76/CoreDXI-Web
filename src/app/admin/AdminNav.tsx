/**
 * AdminNav.tsx — 관리자 사이드바 네비게이션 (클라이언트 컴포넌트)
 *
 * 현재 경로를 감지하여 활성 메뉴 항목을 강조 표시합니다.
 * layout.tsx는 Server Component이므로, usePathname을 사용하는
 * 이 네비게이션 부분만 "use client"로 분리합니다.
 *
 * ── 변경 이력 ──────────────────────────────────────────────────────
 * v0.1  2026-05-14  최초 생성
 * ────────────────────────────────────────────────────────────────────
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// [홍보팀/개발팀] 사이드바 메뉴 항목을 여기서 수정하세요.
const NAV_ITEMS = [
  { label: "관리자 목록", href: "/admin/users" },
  { label: "관리자 등록", href: "/admin/register" },
] as const;

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="관리자 메뉴">
      <ul className="space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
