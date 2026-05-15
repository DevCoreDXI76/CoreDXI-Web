import Link from "next/link";
import { AdminNav } from "./AdminNav";

export default function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <aside
        className="flex w-60 shrink-0 flex-col"
        style={{ backgroundColor: "#1E4E8C" }}
      >
        <div className="flex items-center gap-2.5 border-b border-white/10 px-5 py-5">
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
          <Link
            href="/admin/users"
            className="text-base font-bold tracking-tight text-white"
          >
            CoreDXI Admin
          </Link>
        </div>

        <div className="flex-1 px-3 py-4">
          <AdminNav />
        </div>

        <div className="border-t border-white/10 px-5 py-4">
          <Link
            href="/"
            className="text-xs text-white/60 transition-colors hover:text-white/90"
          >
            ← 홈페이지로 돌아가기
          </Link>
        </div>
      </aside>

      <main className="flex-1 overflow-auto bg-gray-50">{children}</main>
    </div>
  );
}
