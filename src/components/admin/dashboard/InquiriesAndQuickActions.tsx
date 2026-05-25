import Link from "next/link";
import { PenLine, Settings } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { recentInquiries } from "./mock-data";

export function InquiriesAndQuickActions() {
  return (
    <aside className="flex flex-col gap-6 lg:col-span-1">
      <section
        className="rounded-xl border border-slate-100 bg-white shadow-sm"
        aria-labelledby="recent-inquiries-heading"
      >
        <div className="border-b border-slate-100 px-5 py-4">
          <h2
            id="recent-inquiries-heading"
            className="text-base font-semibold text-slate-900"
          >
            최근 고객 문의 내역
          </h2>
        </div>
        <ul className="divide-y divide-slate-100">
          {recentInquiries.map((inquiry) => (
            <li key={`${inquiry.name}-${inquiry.dateLabel}`} className="px-5 py-4">
              <p className="font-medium text-slate-900">{inquiry.name}</p>
              <p className="mt-1 text-sm text-slate-500">{inquiry.purpose}</p>
              <p className="mt-1 text-xs text-slate-400">{inquiry.dateLabel}</p>
            </li>
          ))}
        </ul>
      </section>

      <section
        className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm"
        aria-labelledby="quick-actions-heading"
      >
        <h2
          id="quick-actions-heading"
          className="text-base font-semibold text-slate-900"
        >
          빠른 작업
        </h2>
        <div className="mt-4 flex flex-col gap-2">
          <Link
            href="/admin/blog/new"
            className={cn(
              buttonVariants({ size: "default" }),
              "justify-center gap-2 bg-[#1E4E8C] hover:bg-[#1E4E8C]/90"
            )}
          >
            <PenLine className="size-4" aria-hidden />
            새 글 쓰기
          </Link>
          <Link
            href="/admin/settings"
            className={cn(
              buttonVariants({ variant: "outline", size: "default" }),
              "justify-center gap-2"
            )}
          >
            <Settings className="size-4" aria-hidden />
            시스템 설정
          </Link>
        </div>
      </section>
    </aside>
  );
}
