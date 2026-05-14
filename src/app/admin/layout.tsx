/**
 * src/app/admin/layout.tsx — 관리자 공통 레이아웃
 *
 * /admin 경로 하위 모든 페이지에 적용되는 레이아웃입니다.
 * 왼쪽에 로열 블루(#1E4E8C) 사이드바, 오른쪽에 콘텐츠 영역을 배치합니다.
 *
 * Server Component — 인터랙션이 없으므로 클라이언트 컴포넌트 불필요.
 * 경로 감지가 필요한 네비게이션은 AdminNav(클라이언트)로 분리되어 있습니다.
 *
 * ── 변경 이력 ──────────────────────────────────────────────────────
 * v0.2  2026-05-14  전역 Sonner Toaster는 layout.tsx로 이동 (중복 제거)
 * v0.1  2026-05-14  최초 생성
 *       - 로열 블루 사이드바 레이아웃 구현
 *       - AdminNav 클라이언트 컴포넌트로 활성 경로 감지 분리
 * ────────────────────────────────────────────────────────────────────
 */

import Link from "next/link";
import { AdminNav } from "./AdminNav";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* ── 사이드바 (240px 고정, 로열 블루 배경) ── */}
      <aside
        className="w-60 shrink-0 flex flex-col"
        style={{ backgroundColor: "#1E4E8C" }}
      >
        {/* 로고 영역 */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/10">
          {/* CoreDXI 기하학적 'C' SVG 로고 */}
          <svg
            width="28"
            height="28"
            viewBox="0 0 32 32"
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx="16"
              cy="16"
              r="13"
              stroke="white"
              strokeWidth="3"
              fill="none"
            />
            <circle
              cx="16"
              cy="16"
              r="7"
              stroke="white"
              strokeWidth="2.5"
              fill="none"
            />
          </svg>
          <Link href="/admin" className="text-white font-bold text-base tracking-tight">
            CoreDXI Admin
          </Link>
        </div>

        {/* 네비게이션 */}
        <div className="flex-1 px-3 py-4">
          <AdminNav />
        </div>

        {/* 하단 링크 */}
        <div className="px-5 py-4 border-t border-white/10">
          <Link
            href="/"
            className="text-white/60 text-xs hover:text-white/90 transition-colors"
          >
            ← 홈페이지로 돌아가기
          </Link>
        </div>
      </aside>

      {/* ── 메인 콘텐츠 영역 ── */}
      <main className="flex-1 bg-gray-50 overflow-auto">
        {children}
      </main>
    </div>
  );
}
