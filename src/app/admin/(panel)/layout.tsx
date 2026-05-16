import Link from "next/link";
import { Logo } from "@/components/Logo";
import { AdminSidebar } from "./AdminSidebar";

export default function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <aside
        className="fixed inset-y-0 left-0 z-40 flex w-60 flex-col"
        style={{ backgroundColor: "#1E4E8C" }}
      >
        <div className="border-b border-white/10 px-5 py-5">
          <Logo
            size={28}
            showWordmark
            wordmark="CoreDXI Admin"
            href="/admin/dashboard"
            variant="onDark"
            ariaLabel="CoreDXI 관리자 대시보드"
          />
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          <AdminSidebar />
        </div>

        <div className="border-t border-white/10 space-y-2 px-5 py-4">
          <Link
            href="/"
            className="text-xs text-white/60 transition-colors hover:text-white/90"
          >
            ← 홈페이지로 돌아가기
          </Link>
          {process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ? (
            <p
              className="font-mono text-[10px] text-white/35"
              title={process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA}
            >
              build {process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA.slice(0, 7)}
            </p>
          ) : null}
        </div>
      </aside>

      <main className="ml-60 min-h-screen p-8 lg:p-10">{children}</main>
    </div>
  );
}
